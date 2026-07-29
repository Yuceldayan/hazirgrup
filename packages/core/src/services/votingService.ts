import type {
  Id,
  MatchedPackage,
  Plan,
  PlanParticipant,
  Vote,
  VoteTally,
  VotingResult,
} from '@hazirgrup/types';
import { AppError } from '../errors/AppError';
import { assertPlanTransition, canStartVoting } from '../status/plan';
import type { ServiceContext } from './planService';

/**
 * Oylama servisi.
 *
 * Kurallar (docs/PRODUCT_REQUIREMENTS.md FR-6):
 *  - Her katılımcı bir aktif oy kullanır, oyunu değiştirebilir.
 *  - Oylar açıktır (D-007): kim ne oyladı katılımcılara görünür.
 *  - Eşitlikte kazananı plan sahibi seçer (D-008).
 */

/** Oyları sayar ve sonucu üretir. */
export function tallyVotes(
  votes: Vote[],
  participants: PlanParticipant[],
  matches: MatchedPackage[],
): VotingResult {
  const nameByParticipant = new Map(participants.map((p) => [p.id, p.displayName]));
  const byPackage = new Map<Id, VoteTally>();

  // Eşleşen tüm paketler sıfır oyla listede yer alır.
  for (const match of matches) {
    byPackage.set(match.package.id, { packageId: match.package.id, count: 0, voterNames: [] });
  }

  for (const vote of votes) {
    const entry = byPackage.get(vote.packageId) ?? {
      packageId: vote.packageId,
      count: 0,
      voterNames: [],
    };
    entry.count += 1;
    const name = nameByParticipant.get(vote.participantId);
    if (name) entry.voterNames.push(name);
    byPackage.set(vote.packageId, entry);
  }

  const tallies = [...byPackage.values()].sort(
    (a, b) => b.count - a.count || a.packageId.localeCompare(b.packageId),
  );

  const topCount = tallies[0]?.count ?? 0;
  const leading = topCount > 0 ? tallies.filter((t) => t.count === topCount) : [];

  return {
    tallies,
    totalVotes: votes.length,
    participantCount: participants.filter((p) => p.status !== 'not_going').length,
    leadingPackageIds: leading.map((t) => t.packageId),
    isTie: leading.length > 1,
    winnerPackageId: leading.length === 1 ? (leading[0]?.packageId ?? null) : null,
  };
}

/**
 * Oylamayı başlatır.
 *
 * `matchCount` çağıran tarafından geçilir (planService.computeMatches sonucu);
 * böylece bu modül planService'e bağımlı olmaz ve döngüsel import oluşmaz.
 */
export async function startVoting(
  ctx: ServiceContext,
  input: { planId: Id; userId: Id; endsAt: string | null; matchCount: number },
): Promise<Plan> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== input.userId) {
    throw AppError.forbidden('Oylamayı yalnızca planı oluşturan kişi başlatabilir.');
  }

  if (!canStartVoting(plan.status, input.matchCount)) {
    throw AppError.conflict(
      input.matchCount === 0
        ? 'Oylama için önce uygun paket bulunması gerekiyor. Bütçe veya saat kısıtlarını gevşetebilirsin.'
        : 'Oylama şu anda başlatılamaz.',
    );
  }

  assertPlanTransition(plan.status, 'voting');

  const now = new Date(ctx.nowMs).toISOString();
  await ctx.repo.updatePlan(plan.id, { votingStartsAt: now, votingEndsAt: input.endsAt }, now);
  const updated = await ctx.repo.setPlanStatus(plan.id, 'voting', now);

  const participants = await ctx.repo.listParticipants(plan.id);
  for (const participant of participants) {
    if (!participant.userId || participant.userId === input.userId) continue;
    await ctx.repo.createNotification({
      userId: participant.userId,
      type: 'voting_ending_soon',
      title: 'Oylama başladı',
      body: `“${plan.name}” planında paketler oylamaya açıldı.`,
      data: { planId: plan.id },
      readAt: null,
      createdAt: now,
    });
  }

  return updated;
}

export async function castVote(
  ctx: ServiceContext,
  input: { planId: Id; participantId: Id; packageId: Id },
): Promise<Vote> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');

  if (plan.status !== 'voting') {
    throw AppError.conflict(
      plan.status === 'voting_closed'
        ? 'Oylama tamamlandı. Sonucu görebilirsin.'
        : 'Bu plan için oylama henüz başlamadı.',
    );
  }

  if (plan.votingEndsAt && new Date(plan.votingEndsAt).getTime() < ctx.nowMs) {
    throw AppError.conflict('Oylama süresi doldu. Sonucu görebilirsin.');
  }

  const participants = await ctx.repo.listParticipants(input.planId);
  const participant = participants.find((p) => p.id === input.participantId);
  if (!participant) {
    throw AppError.forbidden('Bu planda oy kullanma yetkin yok.');
  }
  if (participant.status === 'not_going') {
    throw AppError.conflict('Katılmayacağını belirttiğin için oy kullanamazsın.');
  }

  return ctx.repo.castVote({
    planId: input.planId,
    participantId: input.participantId,
    packageId: input.packageId,
    nowIso: new Date(ctx.nowMs).toISOString(),
  });
}

export async function closeVoting(
  ctx: ServiceContext,
  input: { planId: Id; userId: Id },
): Promise<{ plan: Plan; result: VotingResult }> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== input.userId) {
    throw AppError.forbidden('Oylamayı yalnızca planı oluşturan kişi bitirebilir.');
  }

  assertPlanTransition(plan.status, 'voting_closed');

  const [votes, participants] = await Promise.all([
    ctx.repo.listVotes(plan.id),
    ctx.repo.listParticipants(plan.id),
  ]);

  const result = tallyVotes(votes, participants, []);
  const now = new Date(ctx.nowMs).toISOString();

  // Eşitlik yoksa kazanan sabitlenir; eşitlikte plan sahibi seçecek (D-008).
  if (result.winnerPackageId) {
    await ctx.repo.updatePlan(plan.id, { winningPackageId: result.winnerPackageId }, now);
  }

  const updated = await ctx.repo.setPlanStatus(plan.id, 'voting_closed', now);

  for (const participant of participants) {
    if (!participant.userId || participant.userId === input.userId) continue;
    await ctx.repo.createNotification({
      userId: participant.userId,
      type: 'voting_closed',
      title: 'Oylama tamamlandı',
      body: `“${plan.name}” planında oylama bitti.`,
      data: { planId: plan.id },
      readAt: null,
      createdAt: now,
    });
  }

  return { plan: updated, result };
}

/** Eşitlik durumunda plan sahibinin kazananı seçmesi (D-008). */
export async function resolveTie(
  ctx: ServiceContext,
  input: { planId: Id; userId: Id; packageId: Id },
): Promise<Plan> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== input.userId) {
    throw AppError.forbidden('Kazananı yalnızca planı oluşturan kişi seçebilir.');
  }
  if (plan.status !== 'voting_closed') {
    throw AppError.conflict('Kazanan yalnızca oylama bittikten sonra seçilebilir.');
  }

  const [votes, participants] = await Promise.all([
    ctx.repo.listVotes(plan.id),
    ctx.repo.listParticipants(plan.id),
  ]);
  const result = tallyVotes(votes, participants, []);

  if (!result.isTie) {
    throw AppError.conflict('Oylamada eşitlik yok; kazanan zaten belirlendi.');
  }
  if (!result.leadingPackageIds.includes(input.packageId)) {
    throw AppError.validation(
      {},
      'Yalnızca eşit oy alan paketler arasından seçim yapabilirsin.',
    );
  }

  const now = new Date(ctx.nowMs).toISOString();
  return ctx.repo.updatePlan(plan.id, { winningPackageId: input.packageId }, now);
}

/** Oylamanın bitmesine kalan süre bilgisi. */
export function votingTimeState(
  plan: Plan,
  nowMs: number,
): { isOpen: boolean; endsAt: string | null; hasDeadline: boolean; isExpired: boolean } {
  const hasDeadline = plan.votingEndsAt !== null;
  const isExpired = hasDeadline && new Date(plan.votingEndsAt as string).getTime() < nowMs;
  return {
    isOpen: plan.status === 'voting' && !isExpired,
    endsAt: plan.votingEndsAt,
    hasDeadline,
    isExpired,
  };
}
