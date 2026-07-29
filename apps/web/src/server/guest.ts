import 'server-only';
import { hashGuestSecret, type ServiceContext } from '@hazirgrup/core';
import { getCurrentUser } from './auth';
import { readGuestSecret } from './session';

/**
 * Davet sayfasındaki görüntüleyenin katılımcı kaydını çözer.
 *
 * Sıra: oturum açmış kullanıcı → misafir cookie'si → yok.
 * Tek noktada tutulur ki sayfa ve server action aynı kimliği görsün.
 */
export async function resolveViewerParticipantId(
  ctx: ServiceContext,
  planId: string,
): Promise<string | null> {
  const user = await getCurrentUser();
  if (user) {
    const participant = await ctx.repo.findParticipantByUser(planId, user.id);
    if (participant) return participant.id;
  }

  const secret = await readGuestSecret(planId);
  if (!secret) return null;

  const participant = await ctx.repo.findParticipantByGuestHash(planId, hashGuestSecret(secret));
  return participant?.id ?? null;
}
