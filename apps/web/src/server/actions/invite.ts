'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { castVote, enforceRateLimit, joinAsGuest, resolveInviteToken } from '@hazirgrup/core';
import { castVoteSchema, joinPlanSchema } from '@hazirgrup/validation';
import { getRepository, getServiceContext } from '@/server/repository';
import { rateLimitIdentifier, readGuestSecret, writeGuestSecret } from '@/server/session';
import { resolveViewerParticipantId } from '@/server/guest';
import {
  actionError,
  actionSuccess,
  actionValidationError,
  type ActionResult,
} from '@/server/actionResult';

/**
 * Misafir davet akışı server action'ları.
 *
 * Güvenlik:
 *  - Token her istekte yeniden doğrulanır (iptal/süre kontrolü dahil).
 *  - Misafir kimliği imzalı HttpOnly cookie ile taşınır (D-011).
 *  - Katılma ve oy verme hız sınırına tabidir (docs/SECURITY_MODEL.md §6).
 */

async function rateStore() {
  const repo = await getRepository();
  return {
    increment: (key: string, windowStartMs: number, windowMs: number) =>
      repo.incrementRateLimit(key, windowStartMs, windowMs),
    reset: (key: string) => repo.resetRateLimit(key),
  };
}

export async function joinPlanAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const token = String(formData.get('token') ?? '');

  const parsed = joinPlanSchema.safeParse({
    displayName: formData.get('displayName'),
    status: formData.get('status'),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const requestHeaders = await headers();
    await enforceRateLimit(
      await rateStore(),
      'guestJoin',
      rateLimitIdentifier(requestHeaders),
      Date.now(),
    );

    const ctx = await getServiceContext();
    const { invitation, planId } = await resolveInviteToken(ctx, token);

    const existingSecret = await readGuestSecret(planId);
    const result = await joinAsGuest(ctx, {
      planId,
      invitationId: invitation.id,
      displayName: parsed.data.displayName,
      status: parsed.data.status,
      existingGuestSecret: existingSecret,
    });

    if (result.isNew || !existingSecret) {
      await writeGuestSecret(planId, result.guestSecret);
    }

    revalidatePath(`/davet/${token}`);
    return actionSuccess('Katılım durumun kaydedildi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function guestVoteAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const token = String(formData.get('token') ?? '');

  const parsed = castVoteSchema.safeParse({
    planId: formData.get('planId'),
    packageId: formData.get('packageId'),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    const { planId } = await resolveInviteToken(ctx, token);

    if (planId !== parsed.data.planId) {
      return { ok: false, message: 'Bu davet bu plana ait değil.' };
    }

    // Katılımcıyı çöz: önce oturum, yoksa misafir cookie'si.
    const participantId = await resolveViewerParticipantId(ctx, planId);

    if (!participantId) {
      return {
        ok: false,
        message: 'Oy kullanmak için önce adını girip katılım durumunu seçmelisin.',
      };
    }

    await enforceRateLimit(await rateStore(), 'vote', participantId, Date.now());

    await castVote(ctx, {
      planId,
      participantId,
      packageId: parsed.data.packageId,
    });

    revalidatePath(`/davet/${token}`);
    return actionSuccess('Oyun kaydedildi. İstersen değiştirebilirsin.');
  } catch (error) {
    return actionError(error);
  }
}
