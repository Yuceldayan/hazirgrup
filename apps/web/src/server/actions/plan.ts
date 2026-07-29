'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  cancelPlan,
  castVote,
  closeVoting,
  computeMatches,
  createInvitation,
  createPlan,
  createReservationRequest,
  enforceRateLimit,
  publishDraft,
  requireOwnedPlan,
  resolveTie,
  setParticipation,
  startVoting,
} from '@hazirgrup/core';
import {
  cancelPlanSchema,
  castVoteSchema,
  createPlanSchema,
  createReservationSchema,
  resolveTieSchema,
  startVotingSchema,
  updateParticipationSchema,
} from '@hazirgrup/validation';
import { getRepository, getServiceContext } from '@/server/repository';
import { requireUser } from '@/server/auth';
import {
  actionError,
  actionSuccess,
  actionValidationError,
  isRedirectError,
  type ActionResult,
} from '@/server/actionResult';

/** Plan yaşam döngüsü server action'ları. */

async function rateStore() {
  const repo = await getRepository();
  return {
    increment: (key: string, windowStartMs: number, windowMs: number) =>
      repo.incrementRateLimit(key, windowStartMs, windowMs),
    reset: (key: string) => repo.resetRateLimit(key),
  };
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value.replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createPlanAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser('/hesap/plan/yeni');

  const budgetMode = String(formData.get('budgetMode') ?? 'per_person');
  const budgetValue = parseNumber(formData.get('budgetAmount'));
  const budgetKurus = budgetValue !== null ? Math.round(budgetValue * 100) : null;

  const parsed = createPlanSchema.safeParse({
    name: formData.get('name'),
    eventDate: formData.get('eventDate'),
    startTime: formData.get('startTime') ?? '',
    endTime: formData.get('endTime') ?? '',
    isTimeFlexible: formData.get('isTimeFlexible') === 'on',
    cityId: formData.get('cityId'),
    districtId: formData.get('districtId') ?? '',
    estimatedPeople: parseNumber(formData.get('estimatedPeople')) ?? 0,
    minPeople: parseNumber(formData.get('minPeople')) ?? 0,
    maxPeople: parseNumber(formData.get('maxPeople')) ?? 0,
    budgetMode,
    budgetPerPerson: budgetMode === 'per_person' ? budgetKurus : null,
    budgetTotal: budgetMode === 'total' ? budgetKurus : null,
    categoryIds: formData.getAll('categoryIds').map(String),
    preferenceKeys: formData.getAll('preferenceKeys').map(String),
    note: formData.get('note') ?? '',
    asDraft: formData.get('asDraft') === 'true',
  });

  if (!parsed.success) return actionValidationError(parsed.error);

  let planId: string;
  try {
    const ctx = await getServiceContext();
    const plan = await createPlan(ctx, {
      ownerId: user.id,
      ownerDisplayName: user.displayName,
      name: parsed.data.name,
      cityId: parsed.data.cityId,
      districtId: parsed.data.districtId,
      eventDate: parsed.data.eventDate,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      isTimeFlexible: parsed.data.isTimeFlexible,
      estimatedPeople: parsed.data.estimatedPeople,
      minPeople: parsed.data.minPeople,
      maxPeople: parsed.data.maxPeople,
      budgetMode: parsed.data.budgetMode,
      budgetPerPerson: parsed.data.budgetPerPerson,
      budgetTotal: parsed.data.budgetTotal,
      note: parsed.data.note,
      categoryIds: parsed.data.categoryIds,
      preferenceKeys: parsed.data.preferenceKeys,
      asDraft: parsed.data.asDraft,
    });
    planId = plan.id;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }

  revalidatePath('/hesap/planlar');
  redirect(parsed.data.asDraft ? '/hesap/planlar?sekme=taslak' : `/hesap/plan/${planId}`);
}

export async function publishDraftAction(planId: string): Promise<void> {
  const user = await requireUser();
  const ctx = await getServiceContext();
  await publishDraft(ctx, planId, user.id);
  revalidatePath(`/hesap/plan/${planId}`);
  redirect(`/hesap/plan/${planId}/davet`);
}

export async function createInvitationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const planId = String(formData.get('planId') ?? '');

  try {
    const ctx = await getServiceContext();
    const result = await createInvitation(ctx, { planId, userId: user.id });
    revalidatePath(`/hesap/plan/${planId}/davet`);

    return {
      ok: true,
      message: 'Yeni davet bağlantısı oluşturuldu. Önceki bağlantı artık geçersiz.',
      values: {
        inviteUrl: result.inviteUrl,
        shortCode: result.invitation.shortCode,
        shareMessage: result.shareMessage,
        whatsappUrl: result.whatsappUrl,
      },
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateParticipationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const planId = String(formData.get('planId') ?? '');

  const parsed = updateParticipationSchema.safeParse({
    participantId: formData.get('participantId'),
    status: formData.get('status'),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    await setParticipation(ctx, {
      planId,
      participantId: parsed.data.participantId,
      status: parsed.data.status,
    });
    revalidatePath(`/hesap/plan/${planId}`);
    return actionSuccess('Katılım durumu güncellendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function removeParticipantAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const planId = String(formData.get('planId') ?? '');
  const participantId = String(formData.get('participantId') ?? '');

  try {
    const ctx = await getServiceContext();
    await requireOwnedPlan(ctx, planId, user.id);
    await ctx.repo.removeParticipant(participantId);
    revalidatePath(`/hesap/plan/${planId}`);
    return actionSuccess('Katılımcı plandan çıkarıldı.');
  } catch (error) {
    return actionError(error);
  }
}

export async function startVotingAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = startVotingSchema.safeParse({
    planId: formData.get('planId'),
    endsAt: formData.get('endsAt') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    const plan = await ctx.repo.getPlan(parsed.data.planId);
    if (!plan) return { ok: false, message: 'Plan bulunamadı.' };

    const { matches } = await computeMatches(ctx, plan);

    await startVoting(ctx, {
      planId: parsed.data.planId,
      userId: user.id,
      endsAt: parsed.data.endsAt,
      matchCount: matches.length,
    });

    revalidatePath(`/hesap/plan/${parsed.data.planId}`);
    return actionSuccess('Oylama başladı. Arkadaşların artık oy verebilir.');
  } catch (error) {
    return actionError(error);
  }
}

export async function castVoteAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = castVoteSchema.safeParse({
    planId: formData.get('planId'),
    packageId: formData.get('packageId'),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    const participant = await ctx.repo.findParticipantByUser(parsed.data.planId, user.id);
    if (!participant) return { ok: false, message: 'Bu planda oy kullanma yetkin yok.' };

    await enforceRateLimit(await rateStore(), 'vote', participant.id, Date.now());

    await castVote(ctx, {
      planId: parsed.data.planId,
      participantId: participant.id,
      packageId: parsed.data.packageId,
    });

    revalidatePath(`/hesap/plan/${parsed.data.planId}`);
    return actionSuccess('Oyun kaydedildi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function closeVotingAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const planId = String(formData.get('planId') ?? '');

  try {
    const ctx = await getServiceContext();
    const { result } = await closeVoting(ctx, { planId, userId: user.id });
    revalidatePath(`/hesap/plan/${planId}`);

    return actionSuccess(
      result.isTie
        ? 'Oylama bitti ancak oylar eşit. Kazananı seçmen gerekiyor.'
        : 'Oylama tamamlandı. Artık rezervasyon talebi gönderebilirsin.',
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function resolveTieAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = resolveTieSchema.safeParse({
    planId: formData.get('planId'),
    packageId: formData.get('packageId'),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    await resolveTie(ctx, {
      planId: parsed.data.planId,
      userId: user.id,
      packageId: parsed.data.packageId,
    });
    revalidatePath(`/hesap/plan/${parsed.data.planId}`);
    return actionSuccess('Kazanan paket belirlendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function createReservationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const peopleCountRaw = parseNumber(formData.get('peopleCount'));

  const parsed = createReservationSchema.safeParse({
    planId: formData.get('planId'),
    packageId: formData.get('packageId'),
    ...(peopleCountRaw !== null ? { peopleCount: peopleCountRaw } : {}),
    contactName: formData.get('contactName'),
    contactPhone: formData.get('contactPhone'),
    note: formData.get('note') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    await enforceRateLimit(await rateStore(), 'createReservation', user.id, Date.now());

    await createReservationRequest(ctx, {
      planId: parsed.data.planId,
      userId: user.id,
      packageId: parsed.data.packageId,
      ...(parsed.data.peopleCount !== undefined ? { peopleCount: parsed.data.peopleCount } : {}),
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      note: parsed.data.note,
    });

    revalidatePath(`/hesap/plan/${parsed.data.planId}`);
    revalidatePath('/hesap/rezervasyonlar');
    return actionSuccess(
      'Rezervasyon talebin işletmeye iletildi. Onay durumunu buradan takip edebilirsin.',
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function cancelPlanAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = cancelPlanSchema.safeParse({
    planId: formData.get('planId'),
    reason: formData.get('reason') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    await cancelPlan(ctx, parsed.data.planId, user.id, parsed.data.reason ?? null);
    revalidatePath('/hesap/planlar');
    return actionSuccess('Plan iptal edildi ve katılımcılar bilgilendirildi.');
  } catch (error) {
    return actionError(error);
  }
}
