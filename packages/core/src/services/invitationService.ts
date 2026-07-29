import type { GuestPlanView, Id, ParticipationStatus, PlanInvitation } from '@hazirgrup/types';
import { AppError } from '../errors/AppError';
import { addDays, formatDateTimeSummary } from '../format/datetime';
import {
  buildInviteUrl,
  buildShareMessage,
  buildWhatsAppShareUrl,
  checkInvitationValidity,
  generateGuestSecret,
  generateInviteToken,
  generateShortCode,
  hashGuestSecret,
  hashToken,
  normalizeShortCode,
} from '../invite/token';
import { countParticipation } from '../budget/index';
import { computeMatches, refreshPlanStage, type ServiceContext } from './planService';
import { tallyVotes } from './votingService';

/** Davet ve misafir katılım servisi. */

export interface CreatedInvitation {
  invitation: PlanInvitation;
  /** Düz token — yalnızca bu yanıtta döner, saklanmaz. */
  token: string;
  inviteUrl: string;
  shareMessage: string;
  whatsappUrl: string;
}

export async function createInvitation(
  ctx: ServiceContext,
  input: { planId: Id; userId: Id },
): Promise<CreatedInvitation> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== input.userId) {
    throw AppError.forbidden('Davet bağlantısını yalnızca planı oluşturan kişi üretebilir.');
  }
  if (plan.status === 'cancelled') {
    throw AppError.conflict('İptal edilmiş plan için davet oluşturulamaz.');
  }

  const token = generateInviteToken();
  const invitation = await ctx.repo.createInvitation({
    planId: plan.id,
    tokenHash: hashToken(token),
    shortCode: generateShortCode(),
    createdBy: input.userId,
    // Varsayılan: plan tarihinden bir gün sonra geçersiz olur.
    expiresAt: `${addDays(plan.eventDate, 1)}T23:59:59.000Z`,
    nowIso: new Date(ctx.nowMs).toISOString(),
  });

  const districts = plan.districtId ? await ctx.repo.listDistricts(plan.cityId) : [];
  const districtName = plan.districtId
    ? (districts.find((d) => d.id === plan.districtId)?.name ?? null)
    : null;

  const inviteUrl = buildInviteUrl(ctx.siteUrl, token);
  const shareMessage = buildShareMessage({
    planName: plan.name,
    dateLabel: formatDateTimeSummary(plan.eventDate, plan.startTime, plan.endTime),
    districtName,
    inviteUrl,
  });

  return {
    invitation,
    token,
    inviteUrl,
    shareMessage,
    whatsappUrl: buildWhatsAppShareUrl(shareMessage),
  };
}

export async function revokeInvitation(
  ctx: ServiceContext,
  input: { planId: Id; userId: Id },
): Promise<void> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== input.userId) {
    throw AppError.forbidden('Bu işlemi yalnızca planı oluşturan kişi yapabilir.');
  }
  const invitation = await ctx.repo.getActiveInvitation(input.planId);
  if (invitation) {
    await ctx.repo.revokeInvitation(invitation.id, new Date(ctx.nowMs).toISOString());
  }
}

export interface ResolvedInvitation {
  invitation: PlanInvitation;
  planId: Id;
}

/** Davet tokenını çözer; geçersizse anlaşılır hata fırlatır. */
export async function resolveInviteToken(
  ctx: ServiceContext,
  token: string,
): Promise<ResolvedInvitation> {
  const invitation = await ctx.repo.getInvitationByTokenHash(hashToken(token));
  const validity = checkInvitationValidity(invitation, ctx.nowMs);

  if (!validity.isValid || !invitation) {
    throw new AppError('not_found', `Davet geçersiz: ${validity.reason}`, {
      userMessage: validity.userMessage,
    });
  }

  return { invitation, planId: invitation.planId };
}

/** Kısa davet kodunu çözer. */
export async function resolveShortCode(
  ctx: ServiceContext,
  code: string,
): Promise<ResolvedInvitation> {
  const invitation = await ctx.repo.getInvitationByShortCode(normalizeShortCode(code));
  const validity = checkInvitationValidity(invitation, ctx.nowMs);

  if (!validity.isValid || !invitation) {
    throw new AppError('not_found', `Davet kodu geçersiz: ${validity.reason}`, {
      userMessage: validity.userMessage,
    });
  }

  return { invitation, planId: invitation.planId };
}

export interface GuestJoinResult {
  participantId: Id;
  /** Tarayıcıda HttpOnly cookie olarak saklanacak gizli değer. */
  guestSecret: string;
  isNew: boolean;
}

/**
 * Misafiri plana katar.
 *
 * Aynı tarayıcı geri geldiğinde cookie'deki gizli değerle aynı katılımcıya
 * bağlanır ve oyunu değiştirebilir (D-011).
 */
export async function joinAsGuest(
  ctx: ServiceContext,
  input: {
    planId: Id;
    invitationId: Id;
    displayName: string;
    status: ParticipationStatus;
    existingGuestSecret: string | null;
  },
): Promise<GuestJoinResult> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.status === 'cancelled') {
    throw AppError.conflict('Bu plan iptal edilmiş.');
  }
  if (plan.status === 'completed') {
    throw AppError.conflict('Bu plan tamamlanmış.');
  }

  const nowIso = new Date(ctx.nowMs).toISOString();

  if (input.existingGuestSecret) {
    const existing = await ctx.repo.findParticipantByGuestHash(
      input.planId,
      hashGuestSecret(input.existingGuestSecret),
    );
    if (existing) {
      await ctx.repo.updateParticipantStatus(existing.id, input.status);
      // Katılım değişince paket eşleşmeleri ve plan aşaması yeniden hesaplanır.
      await refreshPlanStage(ctx, input.planId);
      return { participantId: existing.id, guestSecret: input.existingGuestSecret, isNew: false };
    }
  }

  const guestSecret = generateGuestSecret();
  const participant = await ctx.repo.addParticipant({
    planId: input.planId,
    userId: null,
    guestTokenHash: hashGuestSecret(guestSecret),
    displayName: input.displayName.trim(),
    status: input.status,
    isOwner: false,
    nowIso,
  });

  await ctx.repo.incrementInvitationUse(input.invitationId);

  // Plan sahibine bildirim
  await ctx.repo.createNotification({
    userId: plan.ownerId,
    type: 'participant_joined',
    title: `${participant.displayName} plana katıldı`,
    body: `“${plan.name}” planına yeni bir katılımcı eklendi.`,
    data: { planId: plan.id },
    readAt: null,
    createdAt: nowIso,
  });

  // Yeni katılımcıyla birlikte eşleşmeler değişir; plan doğru aşamaya taşınır (D-016).
  await refreshPlanStage(ctx, input.planId);

  return { participantId: participant.id, guestSecret, isNew: true };
}

/** Kayıtlı kullanıcının davet bağlantısıyla plana katılması. */
export async function joinAsUser(
  ctx: ServiceContext,
  input: { planId: Id; invitationId: Id; userId: Id; displayName: string; status: ParticipationStatus },
): Promise<{ participantId: Id; isNew: boolean }> {
  const existing = await ctx.repo.findParticipantByUser(input.planId, input.userId);
  if (existing) {
    await ctx.repo.updateParticipantStatus(existing.id, input.status);
    await refreshPlanStage(ctx, input.planId);
    return { participantId: existing.id, isNew: false };
  }

  const nowIso = new Date(ctx.nowMs).toISOString();
  const participant = await ctx.repo.addParticipant({
    planId: input.planId,
    userId: input.userId,
    guestTokenHash: null,
    displayName: input.displayName,
    status: input.status,
    isOwner: false,
    nowIso,
  });

  await ctx.repo.incrementInvitationUse(input.invitationId);
  return { participantId: participant.id, isNew: true };
}

/**
 * Misafirin göreceği plan görünümü.
 *
 * Gizlilik: bütçe, plan notu, katılımcı telefonları ve plan sahibinin e-postası
 * **dahil edilmez** (docs/SECURITY_MODEL.md T-5).
 */
export async function buildGuestPlanView(
  ctx: ServiceContext,
  input: { planId: Id; viewerParticipantId: Id | null },
): Promise<GuestPlanView> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');

  const [participants, votes, cities, districts] = await Promise.all([
    ctx.repo.listParticipants(plan.id),
    ctx.repo.listVotes(plan.id),
    ctx.repo.listCities(),
    ctx.repo.listDistricts(plan.cityId),
  ]);

  const city = cities.find((c) => c.id === plan.cityId);
  const district = plan.districtId ? districts.find((d) => d.id === plan.districtId) : null;
  const owner = participants.find((p) => p.isOwner);
  const counts = countParticipation(participants.map((p) => p.status));

  const { matches } = await computeMatches(ctx, plan);
  const showVoting =
    plan.status === 'voting' ||
    plan.status === 'voting_closed' ||
    plan.status === 'reservation_pending' ||
    plan.status === 'reservation_confirmed' ||
    plan.status === 'completed';

  const viewerVote = input.viewerParticipantId
    ? (votes.find((v) => v.participantId === input.viewerParticipantId) ?? null)
    : null;

  const votingOpen =
    plan.status === 'voting' &&
    (!plan.votingEndsAt || new Date(plan.votingEndsAt).getTime() > ctx.nowMs);

  return {
    planId: plan.id,
    planName: plan.name,
    status: plan.status,
    eventDate: plan.eventDate,
    startTime: plan.startTime,
    endTime: plan.endTime,
    cityName: city?.name ?? '',
    districtName: district?.name ?? null,
    ownerDisplayName: owner?.displayName ?? 'Plan sahibi',
    participantCount: participants.length,
    goingCount: counts.going,
    participants: participants.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      status: p.status,
    })),
    matches,
    votingResult: showVoting ? tallyVotes(votes, participants, matches) : null,
    votingEndsAt: plan.votingEndsAt,
    winningPackageId: plan.winningPackageId,
    viewerParticipantId: input.viewerParticipantId,
    viewerVotePackageId: viewerVote?.packageId ?? null,
    canVote: votingOpen && input.viewerParticipantId !== null,
  };
}

export { buildInviteUrl, buildShareMessage, buildWhatsAppShareUrl };
