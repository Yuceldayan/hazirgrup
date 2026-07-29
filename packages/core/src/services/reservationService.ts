import type { Id, RejectionReason, Reservation } from '@hazirgrup/types';
import { AppError } from '../errors/AppError';
import { calculatePackagePricing, countParticipation, estimateAttendance } from '../budget/index';
import { generateReservationCode } from '../invite/token';
import { canCreateReservation, assertPlanTransition } from '../status/plan';
import { canBusinessRespond, canUserCancel, assertRejectionReason } from '../status/reservation';
import { REJECTION_REASON_LABELS } from '@hazirgrup/types';
import { buildPackageContext, computeMatches, type ServiceContext } from './planService';

/** Rezervasyon servisi. */

export interface CreateReservationRequest {
  planId: Id;
  userId: Id;
  packageId: Id;
  peopleCount?: number;
  contactName: string;
  contactPhone: string;
  note: string | null;
}

export async function createReservationRequest(
  ctx: ServiceContext,
  input: CreateReservationRequest,
): Promise<Reservation> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== input.userId) {
    throw AppError.forbidden('Rezervasyon talebini yalnızca planı oluşturan kişi gönderebilir.');
  }
  if (!canCreateReservation(plan.status, plan.winningPackageId ?? input.packageId)) {
    throw AppError.conflict(
      'Rezervasyon talebi ancak oylama tamamlandıktan ve kazanan paket belirlendikten sonra gönderilebilir.',
    );
  }

  const context = await buildPackageContext(ctx, input.packageId);
  if (!context) throw AppError.notFound('paket');
  if (!context.package.isActive) {
    throw AppError.conflict('Bu paket şu anda rezervasyona kapalı. Alternatiflere göz atabilirsin.');
  }

  const participants = await ctx.repo.listParticipants(plan.id);
  const counts = countParticipation(participants.map((p) => p.status));
  const peopleCount =
    input.peopleCount ??
    estimateAttendance({
      counts,
      planEstimatedPeople: plan.estimatedPeople,
      planMinPeople: plan.minPeople,
    });

  if (peopleCount < context.package.minPeople || peopleCount > context.package.maxPeople) {
    throw AppError.validation(
      { peopleCount: `Bu paket ${context.package.minPeople}–${context.package.maxPeople} kişi içindir.` },
      `Kişi sayısı bu paket için uygun değil. Paket ${context.package.minPeople}–${context.package.maxPeople} kişilik gruplar içindir.`,
    );
  }

  const pricing = calculatePackagePricing({
    pricingModel: context.package.pricingModel,
    priceAmount: context.package.priceAmount,
    peopleCount,
    minPeople: context.package.minPeople,
  });

  const nowIso = new Date(ctx.nowMs).toISOString();

  const reservation = await ctx.repo.createReservation(
    {
      planId: plan.id,
      packageId: context.package.id,
      branchId: context.branch.id,
      businessId: context.business.id,
      createdBy: input.userId,
      peopleCount,
      reservedDate: plan.eventDate,
      reservedStartTime: plan.startTime,
      reservedEndTime: plan.endTime,
      totalPrice: pricing.totalPrice,
      perPersonPrice: pricing.perPersonPrice,
      contactName: input.contactName.trim(),
      contactPhone: input.contactPhone.trim(),
      note: input.note,
    },
    generateReservationCode(),
    nowIso,
  );

  assertPlanTransition(plan.status, 'reservation_pending');
  await ctx.repo.setPlanStatus(plan.id, 'reservation_pending', nowIso);

  // İşletme ekibine bildirim
  const members = await ctx.repo.listBusinessMembers(context.business.id);
  for (const member of members) {
    await ctx.repo.createNotification({
      userId: member.userId,
      type: 'new_reservation_request',
      title: 'Yeni rezervasyon talebi',
      body: `${peopleCount} kişilik grup için "${context.package.name}" talebi geldi.`,
      data: { reservationId: reservation.id, businessId: context.business.id },
      readAt: null,
      createdAt: nowIso,
    });
  }

  await ctx.repo.createNotification({
    userId: input.userId,
    type: 'reservation_submitted',
    title: 'Rezervasyon talebin gönderildi',
    body: `${context.business.name} işletmesine talebin iletildi.`,
    data: { reservationId: reservation.id, planId: plan.id },
    readAt: null,
    createdAt: nowIso,
  });

  return reservation;
}

export async function respondToReservation(
  ctx: ServiceContext,
  input: {
    reservationId: Id;
    actorId: Id;
    decision: 'confirm' | 'reject';
    rejectionReason?: RejectionReason | null;
    note?: string | null;
  },
): Promise<Reservation> {
  const reservation = await ctx.repo.getReservation(input.reservationId);
  if (!reservation) throw AppError.notFound('rezervasyon');

  const members = await ctx.repo.listBusinessMembers(reservation.businessId);
  if (!members.some((m) => m.userId === input.actorId)) {
    throw AppError.forbidden('Bu rezervasyona yanıt verme yetkin yok.');
  }
  if (!canBusinessRespond(reservation.status)) {
    throw AppError.conflict('Bu rezervasyon zaten sonuçlandırılmış.');
  }

  const nowIso = new Date(ctx.nowMs).toISOString();

  if (input.decision === 'reject') {
    const reason = assertRejectionReason(input.rejectionReason);
    const updated = await ctx.repo.changeReservationStatus({
      id: reservation.id,
      status: 'rejected',
      actorId: input.actorId,
      rejectionReason: reason,
      reason: input.note ?? REJECTION_REASON_LABELS[reason],
      nowIso,
    });

    // Plan geri alınır ki kullanıcı alternatif paket seçebilsin.
    const plan = await ctx.repo.getPlan(reservation.planId);
    if (plan && plan.status === 'reservation_pending') {
      await ctx.repo.setPlanStatus(plan.id, 'voting_closed', nowIso);
    }

    await ctx.repo.createNotification({
      userId: reservation.createdBy,
      type: 'reservation_rejected',
      title: 'Rezervasyon talebin kabul edilmedi',
      body: input.note ?? REJECTION_REASON_LABELS[reason],
      data: { reservationId: reservation.id, planId: reservation.planId },
      readAt: null,
      createdAt: nowIso,
    });

    return updated;
  }

  const updated = await ctx.repo.changeReservationStatus({
    id: reservation.id,
    status: 'confirmed',
    actorId: input.actorId,
    reason: input.note ?? null,
    nowIso,
  });

  const plan = await ctx.repo.getPlan(reservation.planId);
  if (plan && plan.status === 'reservation_pending') {
    await ctx.repo.setPlanStatus(plan.id, 'reservation_confirmed', nowIso);

    const participants = await ctx.repo.listParticipants(plan.id);
    for (const participant of participants) {
      if (!participant.userId) continue;
      await ctx.repo.createNotification({
        userId: participant.userId,
        type: 'reservation_confirmed',
        title: 'Rezervasyon onaylandı',
        body: `“${plan.name}” için rezervasyon onaylandı. Kod: ${reservation.code}`,
        data: { reservationId: reservation.id, planId: plan.id },
        readAt: null,
        createdAt: nowIso,
      });
    }
  }

  return updated;
}

export async function cancelReservation(
  ctx: ServiceContext,
  input: { reservationId: Id; actorId: Id; byBusiness: boolean; reason: string | null },
): Promise<Reservation> {
  const reservation = await ctx.repo.getReservation(input.reservationId);
  if (!reservation) throw AppError.notFound('rezervasyon');

  if (input.byBusiness) {
    const members = await ctx.repo.listBusinessMembers(reservation.businessId);
    if (!members.some((m) => m.userId === input.actorId)) {
      throw AppError.forbidden('Bu rezervasyonu iptal etme yetkin yok.');
    }
  } else if (reservation.createdBy !== input.actorId) {
    throw AppError.forbidden('Bu rezervasyonu iptal etme yetkin yok.');
  }

  if (!canUserCancel(reservation.status)) {
    throw AppError.conflict('Bu rezervasyon artık iptal edilemez.');
  }

  const nowIso = new Date(ctx.nowMs).toISOString();
  const updated = await ctx.repo.changeReservationStatus({
    id: reservation.id,
    status: input.byBusiness ? 'cancelled_by_business' : 'cancelled_by_user',
    actorId: input.actorId,
    reason: input.reason,
    nowIso,
  });

  const plan = await ctx.repo.getPlan(reservation.planId);
  if (
    plan &&
    (plan.status === 'reservation_pending' || plan.status === 'reservation_confirmed')
  ) {
    await ctx.repo.setPlanStatus(plan.id, 'voting_closed', nowIso);
  }

  if (input.byBusiness) {
    await ctx.repo.createNotification({
      userId: reservation.createdBy,
      type: 'reservation_rejected',
      title: 'Rezervasyon iptal edildi',
      body: input.reason ?? 'İşletme rezervasyonu iptal etti.',
      data: { reservationId: reservation.id, planId: reservation.planId },
      readAt: null,
      createdAt: nowIso,
    });
  } else {
    const members = await ctx.repo.listBusinessMembers(reservation.businessId);
    for (const member of members) {
      await ctx.repo.createNotification({
        userId: member.userId,
        type: 'reservation_cancelled_by_user',
        title: 'Rezervasyon iptal edildi',
        body: `${reservation.code} kodlu rezervasyon kullanıcı tarafından iptal edildi.`,
        data: { reservationId: reservation.id },
        readAt: null,
        createdAt: nowIso,
      });
    }
  }

  return updated;
}

export async function completeReservation(
  ctx: ServiceContext,
  input: { reservationId: Id; actorId: Id; noShow?: boolean },
): Promise<Reservation> {
  const reservation = await ctx.repo.getReservation(input.reservationId);
  if (!reservation) throw AppError.notFound('rezervasyon');

  const members = await ctx.repo.listBusinessMembers(reservation.businessId);
  if (!members.some((m) => m.userId === input.actorId)) {
    throw AppError.forbidden('Bu işlem için yetkin yok.');
  }

  const nowIso = new Date(ctx.nowMs).toISOString();
  const updated = await ctx.repo.changeReservationStatus({
    id: reservation.id,
    status: input.noShow ? 'no_show' : 'completed',
    actorId: input.actorId,
    nowIso,
  });

  const plan = await ctx.repo.getPlan(reservation.planId);
  if (plan && plan.status === 'reservation_confirmed' && !input.noShow) {
    await ctx.repo.setPlanStatus(plan.id, 'completed', nowIso);
  }

  return updated;
}

/**
 * Reddedilen rezervasyondan sonra kullanıcıya gösterilecek alternatif paketler.
 * Kazanan paket hariç, aynı planın diğer eşleşmeleri.
 */
export async function alternativePackagesFor(
  ctx: ServiceContext,
  input: { planId: Id; excludePackageId: Id },
) {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  const { matches } = await computeMatches(ctx, plan);
  return matches.filter((m) => m.package.id !== input.excludePackageId).slice(0, 5);
}
