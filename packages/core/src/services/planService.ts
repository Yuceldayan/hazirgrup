import type {
  Category,
  Id,
  IsoDate,
  MatchedPackage,
  ParticipationStatus,
  Plan,
  PlanDetail,
  PlanStatus,
  PlanSummary,
  VotingResult,
} from '@hazirgrup/types';
import { AppError } from '../errors/AppError';
import {
  countParticipation,
  estimateAttendance,
  resolveBudget,
} from '../budget/index';
import {
  matchPackages,
  sortMatches,
  type MatchCandidate,
  type MatchOutcome,
} from '../matching/index';
import {
  assertPlanTransition,
  autoAdvanceAfterParticipation,
  nextPlanAction,
} from '../status/plan';
import { tallyVotes } from './votingService';
import { buildInviteUrl } from '../invite/token';
import type { Repository, CreatePlanInput } from '../data/repository';

/**
 * Plan servisi — repository ile domain mantığını birleştirir.
 * "Şu an" her zaman parametre olarak geçilir; servis saf ve test edilebilir kalır.
 */

export interface ServiceContext {
  repo: Repository;
  nowMs: number;
  siteUrl: string;
}

function nowIso(nowMs: number): string {
  return new Date(nowMs).toISOString();
}

/** Plan için aday paketleri toplar (aynı şehirdeki aktif paketler). */
async function collectCandidates(repo: Repository, plan: Plan): Promise<MatchCandidate[]> {
  const [packages, businesses, branches, categories, cities, districts] = await Promise.all([
    repo.listPackages({ onlyActive: true }),
    repo.listBusinesses({ status: 'verified' }),
    Promise.resolve(null).then(async () => {
      const all = await Promise.all(
        (await repo.listBusinesses({ status: 'verified' })).map((b) => repo.listBranches(b.id)),
      );
      return all.flat();
    }),
    repo.listCategories({ onlyActive: true }),
    repo.listCities(),
    repo.listDistricts(plan.cityId),
  ]);

  const businessById = new Map(businesses.map((b) => [b.id, b]));
  const branchById = new Map(branches.map((b) => [b.id, b]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const cityById = new Map(cities.map((c) => [c.id, c]));
  const districtById = new Map(districts.map((d) => [d.id, d]));

  const candidates: MatchCandidate[] = [];
  for (const pkg of packages) {
    const business = businessById.get(pkg.businessId);
    const branch = branchById.get(pkg.branchId);
    const category = categoryById.get(pkg.categoryId);
    if (!business || !branch || !category) continue;
    const city = cityById.get(branch.cityId);
    const district = districtById.get(branch.districtId);
    if (!city || !district) continue;
    candidates.push({ package: pkg, business, branch, category, city, district });
  }
  return candidates;
}

/** Planın güncel katılım tahminine göre eşleşmelerini hesaplar. */
export async function computeMatches(
  ctx: ServiceContext,
  plan: Plan,
): Promise<{ matches: MatchedPackage[]; peopleCount: number; outcome: MatchOutcome }> {
  const participants = await ctx.repo.listParticipants(plan.id);
  const counts = countParticipation(participants.map((p) => p.status));
  const peopleCount = estimateAttendance({
    counts,
    planEstimatedPeople: plan.estimatedPeople,
    planMinPeople: plan.minPeople,
  });

  const budget = resolveBudget({
    mode: plan.budgetMode,
    perPerson: plan.budgetPerPerson,
    total: plan.budgetTotal,
    people: peopleCount,
  });

  const candidates = await collectCandidates(ctx.repo, plan);
  const outcome = matchPackages(
    {
      cityId: plan.cityId,
      districtId: plan.districtId,
      categoryIds: plan.categoryIds,
      eventDate: plan.eventDate,
      startTime: plan.startTime,
      endTime: plan.endTime,
      isTimeFlexible: plan.isTimeFlexible,
      peopleCount,
      budgetPerPerson: budget.perPerson > 0 ? budget.perPerson : null,
      preferenceKeys: plan.preferenceKeys,
    },
    candidates,
  );

  return { matches: outcome.matches, peopleCount, outcome };
}

export async function createPlan(
  ctx: ServiceContext,
  input: Omit<CreatePlanInput, 'status'> & { asDraft?: boolean },
): Promise<Plan> {
  const status: PlanStatus = input.asDraft ? 'draft' : 'awaiting_participants';
  const plan = await ctx.repo.createPlan({ ...input, status }, nowIso(ctx.nowMs));

  if (!input.asDraft) {
    // Eşleşme varsa plan doğrudan "paketler hazır" durumuna geçer (D-016).
    const { matches } = await computeMatches(ctx, plan);
    const nextStatus = autoAdvanceAfterParticipation(plan.status, matches.length);
    if (nextStatus !== plan.status && matches.length > 0) {
      // Davet öncesi hemen paketleri göstermek yerine önce arkadaş beklenir;
      // durum yalnızca eşleşme yoksa değişir.
      return plan;
    }
  }

  return plan;
}

export async function publishDraft(ctx: ServiceContext, planId: Id, userId: Id): Promise<Plan> {
  const plan = await requireOwnedPlan(ctx, planId, userId);
  assertPlanTransition(plan.status, 'awaiting_participants');
  return ctx.repo.setPlanStatus(planId, 'awaiting_participants', nowIso(ctx.nowMs));
}

export async function requireOwnedPlan(
  ctx: ServiceContext,
  planId: Id,
  userId: Id,
): Promise<Plan> {
  const plan = await ctx.repo.getPlan(planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId !== userId) {
    throw AppError.forbidden('Bu işlemi yalnızca planı oluşturan kişi yapabilir.');
  }
  return plan;
}

export async function requirePlanAccess(
  ctx: ServiceContext,
  planId: Id,
  userId: Id,
): Promise<Plan> {
  const plan = await ctx.repo.getPlan(planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.ownerId === userId) return plan;

  const participant = await ctx.repo.findParticipantByUser(planId, userId);
  if (!participant) {
    throw AppError.forbidden('Bu planı görüntüleme yetkin yok.');
  }
  return plan;
}

export async function setParticipation(
  ctx: ServiceContext,
  input: { planId: Id; participantId: Id; status: ParticipationStatus },
): Promise<void> {
  const plan = await ctx.repo.getPlan(input.planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.status === 'cancelled' || plan.status === 'completed') {
    throw AppError.conflict('Bu plan kapandığı için katılım durumu değiştirilemez.');
  }

  await ctx.repo.updateParticipantStatus(input.participantId, input.status);
  await refreshPlanStage(ctx, plan.id);
}

/**
 * Katılım değiştikten sonra planı doğru aşamaya taşır (D-016).
 * Yalnızca davet/katılım aşamalarında etkilidir; oylama başladıktan sonra dokunmaz.
 */
export async function refreshPlanStage(ctx: ServiceContext, planId: Id): Promise<Plan> {
  const plan = await ctx.repo.getPlan(planId);
  if (!plan) throw AppError.notFound('plan');
  if (plan.status !== 'awaiting_participants' && plan.status !== 'confirming_participation') {
    return plan;
  }

  const { matches } = await computeMatches(ctx, plan);
  const nextStatus = autoAdvanceAfterParticipation(plan.status, matches.length);
  if (nextStatus === plan.status) return plan;
  return ctx.repo.setPlanStatus(planId, nextStatus, nowIso(ctx.nowMs));
}

export async function cancelPlan(
  ctx: ServiceContext,
  planId: Id,
  userId: Id,
  reason: string | null,
): Promise<Plan> {
  const plan = await requireOwnedPlan(ctx, planId, userId);
  assertPlanTransition(plan.status, 'cancelled');
  const cancelled = await ctx.repo.setPlanStatus(planId, 'cancelled', nowIso(ctx.nowMs), reason);

  const participants = await ctx.repo.listParticipants(planId);
  for (const participant of participants) {
    if (!participant.userId || participant.userId === userId) continue;
    await ctx.repo.createNotification({
      userId: participant.userId,
      type: 'plan_cancelled',
      title: 'Plan iptal edildi',
      body: `“${plan.name}” planı iptal edildi.`,
      data: { planId },
      readAt: null,
      createdAt: nowIso(ctx.nowMs),
    });
  }

  return cancelled;
}

// ---------------------------------------------------------------------------
// Görünüm birleştirme
// ---------------------------------------------------------------------------

export async function buildPlanSummary(
  ctx: ServiceContext,
  plan: Plan,
  viewerId: Id | null,
): Promise<PlanSummary> {
  const [participants, votes, cities, districts] = await Promise.all([
    ctx.repo.listParticipants(plan.id),
    ctx.repo.listVotes(plan.id),
    ctx.repo.listCities(),
    ctx.repo.listDistricts(plan.cityId),
  ]);

  const city = cities.find((c) => c.id === plan.cityId);
  if (!city) throw AppError.notFound('şehir');
  const district = plan.districtId
    ? (districts.find((d) => d.id === plan.districtId) ?? null)
    : null;

  const counts = countParticipation(participants.map((p) => p.status));
  const { matches } = await computeMatches(ctx, plan);

  const viewerParticipant = viewerId
    ? (participants.find((p) => p.userId === viewerId) ?? null)
    : null;
  const hasVoted = viewerParticipant
    ? votes.some((v) => v.participantId === viewerParticipant.id)
    : false;

  const tally = tallyVotes(votes, participants, matches);

  return {
    plan,
    city,
    district,
    participantCount: participants.length,
    goingCount: counts.going,
    maybeCount: counts.maybe,
    notGoingCount: counts.notGoing,
    pendingCount: counts.pending,
    matchCount: matches.length,
    voteCount: votes.length,
    nextAction: nextPlanAction({
      planId: plan.id,
      status: plan.status,
      viewerIsOwner: plan.ownerId === viewerId,
      participantCount: participants.length,
      matchCount: matches.length,
      hasVoted,
      isTie: tally.isTie,
    }),
  };
}

export async function buildPlanDetail(
  ctx: ServiceContext,
  plan: Plan,
  viewerId: Id | null,
): Promise<PlanDetail> {
  const summary = await buildPlanSummary(ctx, plan, viewerId);

  const [participants, votes, allCategories, invitation, reservations] = await Promise.all([
    ctx.repo.listParticipants(plan.id),
    ctx.repo.listVotes(plan.id),
    ctx.repo.listCategories(),
    ctx.repo.getActiveInvitation(plan.id),
    ctx.repo.listReservationsForPlan(plan.id),
  ]);

  const { matches } = await computeMatches(ctx, plan);
  const categories: Category[] = allCategories.filter((c) => plan.categoryIds.includes(c.id));

  const viewerParticipant = viewerId
    ? (participants.find((p) => p.userId === viewerId) ?? null)
    : null;
  const viewerVote = viewerParticipant
    ? (votes.find((v) => v.participantId === viewerParticipant.id) ?? null)
    : null;

  const votingResult: VotingResult | null =
    plan.status === 'voting' ||
    plan.status === 'voting_closed' ||
    plan.status === 'reservation_pending' ||
    plan.status === 'reservation_confirmed' ||
    plan.status === 'completed'
      ? tallyVotes(votes, participants, matches)
      : null;

  const winningPackage = plan.winningPackageId
    ? await buildPackageContext(ctx, plan.winningPackageId)
    : null;

  const activeReservation =
    reservations.find((r) => r.status !== 'rejected' && r.status !== 'cancelled_by_user') ??
    reservations[0] ??
    null;

  const reservationDetail = activeReservation
    ? await buildReservationDetail(ctx, activeReservation.id)
    : null;

  return {
    ...summary,
    participants,
    categories,
    matches,
    votes,
    votingResult,
    winningPackage,
    reservation: reservationDetail,
    invitation: invitation
      ? {
          shortCode: invitation.shortCode,
          // Düz token saklanmadığı için mevcut bağlantı yeniden üretilemez;
          // kullanıcı "bağlantıyı yenile" ile yeni bir tane oluşturur.
          inviteUrl: buildInviteUrl(ctx.siteUrl, ''),
          expiresAt: invitation.expiresAt,
          isRevoked: invitation.revokedAt !== null,
        }
      : null,
    viewerParticipant,
    viewerIsOwner: plan.ownerId === viewerId,
    viewerVote,
  };
}

export async function buildPackageContext(ctx: ServiceContext, packageId: Id) {
  const pkg = await ctx.repo.getPackage(packageId);
  if (!pkg) return null;
  const [business, branches, categories, cities] = await Promise.all([
    ctx.repo.getBusiness(pkg.businessId),
    ctx.repo.listBranches(pkg.businessId),
    ctx.repo.listCategories(),
    ctx.repo.listCities(),
  ]);
  const branch = branches.find((b) => b.id === pkg.branchId);
  const category = categories.find((c) => c.id === pkg.categoryId);
  if (!business || !branch || !category) return null;
  const city = cities.find((c) => c.id === branch.cityId);
  if (!city) return null;
  const districts = await ctx.repo.listDistricts(city.id);
  const district = districts.find((d) => d.id === branch.districtId);
  if (!district) return null;

  return { package: pkg, business, branch, category, city, district };
}

export async function buildReservationDetail(ctx: ServiceContext, reservationId: Id) {
  const reservation = await ctx.repo.getReservation(reservationId);
  if (!reservation) return null;
  const context = await buildPackageContext(ctx, reservation.packageId);
  if (!context) return null;
  const [history, plan] = await Promise.all([
    ctx.repo.listReservationHistory(reservationId),
    ctx.repo.getPlan(reservation.planId),
  ]);

  return {
    reservation,
    package: context.package,
    business: context.business,
    branch: context.branch,
    city: context.city,
    district: context.district,
    history,
    plan: plan ? { id: plan.id, name: plan.name, status: plan.status } : null,
  };
}

/** Kullanıcının planlarını sekmelere ayırır. */
export function groupPlansByTab(
  plans: PlanSummary[],
  today: IsoDate,
): { active: PlanSummary[]; upcoming: PlanSummary[]; past: PlanSummary[]; drafts: PlanSummary[] } {
  const active: PlanSummary[] = [];
  const upcoming: PlanSummary[] = [];
  const past: PlanSummary[] = [];
  const drafts: PlanSummary[] = [];

  for (const summary of plans) {
    const { plan } = summary;
    if (plan.status === 'draft') {
      drafts.push(summary);
    } else if (plan.status === 'completed' || plan.status === 'cancelled' || plan.eventDate < today) {
      past.push(summary);
    } else if (plan.status === 'reservation_confirmed') {
      upcoming.push(summary);
    } else {
      active.push(summary);
    }
  }

  return { active, upcoming, past, drafts };
}

export { sortMatches };
