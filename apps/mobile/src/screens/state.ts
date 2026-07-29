import type {
  MatchedPackage,
  ParticipationStatus,
  PlanStatus,
  PlanSummary,
  Reservation,
  ReservationStatus,
  VotingResult,
} from '@hazirgrup/core';

/**
 * Ekran durum mantığı — saf fonksiyonlar.
 *
 * Karar D-012: React Native bileşenleri için render testi kurulmaz; bunun
 * yerine "hangi hal gösterilecek, hangi buton aktif" mantığı buraya çıkarılır
 * ve unit testlerle korunur.
 */

// ---------------------------------------------------------------------------
// Yükleme / boş / hata halleri
// ---------------------------------------------------------------------------

export type ScreenState = 'loading' | 'error' | 'empty' | 'ready';

export function resolveScreenState<T>(input: {
  isLoading: boolean;
  error: string | null;
  items: T[] | null;
}): ScreenState {
  if (input.isLoading) return 'loading';
  if (input.error) return 'error';
  if (!input.items || input.items.length === 0) return 'empty';
  return 'ready';
}

// ---------------------------------------------------------------------------
// Ana sayfa blokları
// ---------------------------------------------------------------------------

export interface HomeSections {
  showActivePlan: boolean;
  showInvites: boolean;
  showUpcomingReservation: boolean;
  showEmptyPrompt: boolean;
}

export function homeSections(input: {
  activePlans: PlanSummary[];
  invitePlans: PlanSummary[];
  upcomingReservations: Reservation[];
}): HomeSections {
  const hasAnything =
    input.activePlans.length > 0 ||
    input.invitePlans.length > 0 ||
    input.upcomingReservations.length > 0;

  return {
    showActivePlan: input.activePlans.length > 0,
    showInvites: input.invitePlans.length > 0,
    showUpcomingReservation: input.upcomingReservations.length > 0,
    showEmptyPrompt: !hasAnything,
  };
}

// ---------------------------------------------------------------------------
// Plan sihirbazı adım geçerliliği
// ---------------------------------------------------------------------------

export interface WizardValues {
  eventDate: string;
  cityId: string;
  estimatedPeople: number;
  minPeople: number;
  maxPeople: number;
  budgetAmount: number;
  categoryIds: string[];
  name: string;
}

export function isWizardStepValid(step: number, values: WizardValues): boolean {
  switch (step) {
    case 1:
      return values.eventDate.length === 10;
    case 2:
      return values.cityId.length > 0;
    case 3:
      return (
        values.minPeople >= 1 &&
        values.minPeople <= values.estimatedPeople &&
        values.estimatedPeople <= values.maxPeople
      );
    case 4:
      return values.budgetAmount > 0;
    case 5:
      return values.categoryIds.length > 0;
    case 6:
      return true;
    case 7:
      return values.name.trim().length >= 3;
    default:
      return false;
  }
}

export function wizardProgress(step: number, totalSteps = 7): number {
  return Math.max(0, Math.min(1, step / totalSteps));
}

// ---------------------------------------------------------------------------
// Plan detayı görünürlük kuralları
// ---------------------------------------------------------------------------

export interface PlanScreenCapabilities {
  canInvite: boolean;
  canStartVoting: boolean;
  canVote: boolean;
  canCloseVoting: boolean;
  canBreakTie: boolean;
  canCreateReservation: boolean;
  canCancelPlan: boolean;
  showPackages: boolean;
  showVoteCounts: boolean;
}

export function planScreenCapabilities(input: {
  status: PlanStatus;
  isOwner: boolean;
  isParticipant: boolean;
  participationStatus: ParticipationStatus | null;
  matchCount: number;
  votingResult: VotingResult | null;
  winningPackageId: string | null;
  votingEndsAt: string | null;
  nowMs: number;
}): PlanScreenCapabilities {
  const votingExpired =
    input.votingEndsAt !== null && new Date(input.votingEndsAt).getTime() <= input.nowMs;

  const isVotingOpen = input.status === 'voting' && !votingExpired;
  const isTie = input.votingResult?.isTie ?? false;

  return {
    canInvite:
      input.isOwner && input.status !== 'cancelled' && input.status !== 'completed',
    canStartVoting: input.isOwner && input.status === 'packages_ready' && input.matchCount > 0,
    canVote:
      isVotingOpen &&
      input.isParticipant &&
      input.participationStatus !== 'not_going' &&
      input.matchCount > 0,
    canCloseVoting: input.isOwner && input.status === 'voting',
    canBreakTie: input.isOwner && input.status === 'voting_closed' && isTie,
    canCreateReservation:
      input.isOwner && input.status === 'voting_closed' && input.winningPackageId !== null && !isTie,
    canCancelPlan:
      input.isOwner && input.status !== 'cancelled' && input.status !== 'completed',
    showPackages: input.matchCount > 0 && input.status !== 'draft',
    showVoteCounts:
      input.status === 'voting' ||
      input.status === 'voting_closed' ||
      input.status === 'reservation_pending' ||
      input.status === 'reservation_confirmed' ||
      input.status === 'completed',
  };
}

// ---------------------------------------------------------------------------
// Rezervasyon ekranı
// ---------------------------------------------------------------------------

export function reservationActions(status: ReservationStatus): {
  canCancel: boolean;
  showCode: boolean;
  showAlternatives: boolean;
  showContact: boolean;
} {
  return {
    canCancel: status === 'created' || status === 'pending_business' || status === 'confirmed',
    showCode: status === 'confirmed' || status === 'completed',
    showAlternatives: status === 'rejected' || status === 'cancelled_by_business',
    showContact: status !== 'cancelled_by_user',
  };
}

// ---------------------------------------------------------------------------
// Paket listesi filtreleme (mobil hızlı filtreler)
// ---------------------------------------------------------------------------

export function filterMatchesByBudget(
  matches: MatchedPackage[],
  onlyWithinBudget: boolean,
): MatchedPackage[] {
  if (!onlyWithinBudget) return matches;
  return matches.filter((match) => match.pricing.overBudgetPercent === 0);
}

/** Sekmeli listelerde gösterilecek rozet sayısı. */
export function tabBadgeCount(unreadNotifications: number): number | undefined {
  return unreadNotifications > 0 ? Math.min(99, unreadNotifications) : undefined;
}
