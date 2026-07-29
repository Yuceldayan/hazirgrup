import { describe, expect, it } from 'vitest';
import type { PlanStatus, VotingResult } from '@hazirgrup/core';
import {
  filterMatchesByBudget,
  homeSections,
  isWizardStepValid,
  planScreenCapabilities,
  reservationActions,
  resolveScreenState,
  tabBadgeCount,
  wizardProgress,
  type WizardValues,
} from '../state';

/**
 * Mobil ekran durum mantığı testleri (docs/DECISIONS.md D-012).
 * Render yerine "hangi hal / hangi buton" kararları doğrulanır.
 */

describe('resolveScreenState', () => {
  it('yükleniyorsa loading döner', () => {
    expect(resolveScreenState({ isLoading: true, error: null, items: [] })).toBe('loading');
  });

  it('hata varsa error döner', () => {
    expect(resolveScreenState({ isLoading: false, error: 'bağlantı yok', items: [1] })).toBe(
      'error',
    );
  });

  it('liste boşsa empty döner', () => {
    expect(resolveScreenState({ isLoading: false, error: null, items: [] })).toBe('empty');
    expect(resolveScreenState({ isLoading: false, error: null, items: null })).toBe('empty');
  });

  it('veri varsa ready döner', () => {
    expect(resolveScreenState({ isLoading: false, error: null, items: [1, 2] })).toBe('ready');
  });

  it('yükleme hatadan önce gelir', () => {
    expect(resolveScreenState({ isLoading: true, error: 'hata', items: null })).toBe('loading');
  });
});

describe('homeSections', () => {
  it('hiçbir şey yoksa boş durum çağrısı gösterir', () => {
    const sections = homeSections({
      activePlans: [],
      invitePlans: [],
      upcomingReservations: [],
    });
    expect(sections.showEmptyPrompt).toBe(true);
    expect(sections.showActivePlan).toBe(false);
  });

  it('aktif plan varsa boş durum gösterilmez', () => {
    const sections = homeSections({
      activePlans: [{} as never],
      invitePlans: [],
      upcomingReservations: [],
    });
    expect(sections.showActivePlan).toBe(true);
    expect(sections.showEmptyPrompt).toBe(false);
  });

  it('yalnızca davet varsa davet bloğu gösterilir', () => {
    const sections = homeSections({
      activePlans: [],
      invitePlans: [{} as never],
      upcomingReservations: [],
    });
    expect(sections.showInvites).toBe(true);
    expect(sections.showEmptyPrompt).toBe(false);
  });
});

describe('isWizardStepValid', () => {
  const base: WizardValues = {
    eventDate: '2026-08-14',
    cityId: 'city-1',
    estimatedPeople: 6,
    minPeople: 4,
    maxPeople: 8,
    budgetAmount: 25000,
    categoryIds: ['cat-1'],
    name: 'Cuma Buluşması',
  };

  it('tüm adımlar geçerli değerlerle doğrulanır', () => {
    for (let step = 1; step <= 7; step += 1) {
      expect(isWizardStepValid(step, base), `adım ${step}`).toBe(true);
    }
  });

  it('tarihsiz 1. adım geçersizdir', () => {
    expect(isWizardStepValid(1, { ...base, eventDate: '' })).toBe(false);
  });

  it('şehirsiz 2. adım geçersizdir', () => {
    expect(isWizardStepValid(2, { ...base, cityId: '' })).toBe(false);
  });

  it('tutarsız kişi aralığında 3. adım geçersizdir', () => {
    expect(isWizardStepValid(3, { ...base, estimatedPeople: 20 })).toBe(false);
    expect(isWizardStepValid(3, { ...base, minPeople: 10 })).toBe(false);
  });

  it('sıfır bütçede 4. adım geçersizdir', () => {
    expect(isWizardStepValid(4, { ...base, budgetAmount: 0 })).toBe(false);
  });

  it('kategorisiz 5. adım geçersizdir', () => {
    expect(isWizardStepValid(5, { ...base, categoryIds: [] })).toBe(false);
  });

  it('6. adım (tercihler) her zaman geçilebilir', () => {
    expect(isWizardStepValid(6, { ...base, categoryIds: [] })).toBe(true);
  });

  it('kısa plan adında 7. adım geçersizdir', () => {
    expect(isWizardStepValid(7, { ...base, name: 'ab' })).toBe(false);
  });
});

describe('wizardProgress', () => {
  it('adım ilerledikçe artar', () => {
    expect(wizardProgress(1)).toBeCloseTo(1 / 7, 5);
    expect(wizardProgress(7)).toBe(1);
  });

  it('sınırların dışına taşmaz', () => {
    expect(wizardProgress(0)).toBe(0);
    expect(wizardProgress(99)).toBe(1);
  });
});

describe('planScreenCapabilities', () => {
  const base = {
    status: 'voting' as PlanStatus,
    isOwner: true,
    isParticipant: true,
    participationStatus: 'going' as const,
    matchCount: 5,
    votingResult: null as VotingResult | null,
    winningPackageId: null as string | null,
    votingEndsAt: null as string | null,
    nowMs: Date.parse('2026-03-02T10:00:00.000Z'),
  };

  it('oylama açıkken katılımcı oy verebilir', () => {
    expect(planScreenCapabilities(base).canVote).toBe(true);
  });

  it('katılmayacağını söyleyen oy veremez', () => {
    expect(
      planScreenCapabilities({ ...base, participationStatus: 'not_going' }).canVote,
    ).toBe(false);
  });

  it('oylama süresi dolduysa oy verilemez', () => {
    expect(
      planScreenCapabilities({ ...base, votingEndsAt: '2026-03-02T09:00:00.000Z' }).canVote,
    ).toBe(false);
  });

  it('katılımcı olmayan oy veremez', () => {
    expect(planScreenCapabilities({ ...base, isParticipant: false }).canVote).toBe(false);
  });

  it('oylamayı yalnızca sahip başlatabilir ve eşleşme gerekir', () => {
    expect(
      planScreenCapabilities({ ...base, status: 'packages_ready' }).canStartVoting,
    ).toBe(true);
    expect(
      planScreenCapabilities({ ...base, status: 'packages_ready', matchCount: 0 })
        .canStartVoting,
    ).toBe(false);
    expect(
      planScreenCapabilities({ ...base, status: 'packages_ready', isOwner: false })
        .canStartVoting,
    ).toBe(false);
  });

  it('eşitlikte kazanan seçimi açılır, rezervasyon kapalı kalır', () => {
    const tie = planScreenCapabilities({
      ...base,
      status: 'voting_closed',
      winningPackageId: null,
      votingResult: {
        tallies: [],
        totalVotes: 4,
        participantCount: 4,
        leadingPackageIds: ['a', 'b'],
        isTie: true,
        winnerPackageId: null,
      },
    });
    expect(tie.canBreakTie).toBe(true);
    expect(tie.canCreateReservation).toBe(false);
  });

  it('eşitlik yoksa rezervasyon açılır', () => {
    const decided = planScreenCapabilities({
      ...base,
      status: 'voting_closed',
      winningPackageId: 'pkg-1',
      votingResult: {
        tallies: [],
        totalVotes: 4,
        participantCount: 4,
        leadingPackageIds: ['pkg-1'],
        isTie: false,
        winnerPackageId: 'pkg-1',
      },
    });
    expect(decided.canCreateReservation).toBe(true);
    expect(decided.canBreakTie).toBe(false);
  });

  it('iptal edilmiş planda davet ve iptal kapalıdır', () => {
    const cancelled = planScreenCapabilities({ ...base, status: 'cancelled' });
    expect(cancelled.canInvite).toBe(false);
    expect(cancelled.canCancelPlan).toBe(false);
  });

  it('oy sayıları yalnızca oylama başladıktan sonra gösterilir', () => {
    expect(planScreenCapabilities({ ...base, status: 'packages_ready' }).showVoteCounts).toBe(
      false,
    );
    expect(planScreenCapabilities({ ...base, status: 'voting' }).showVoteCounts).toBe(true);
    expect(planScreenCapabilities({ ...base, status: 'completed' }).showVoteCounts).toBe(true);
  });

  it('taslak planda paket listesi gizlenir', () => {
    expect(planScreenCapabilities({ ...base, status: 'draft' }).showPackages).toBe(false);
  });
});

describe('reservationActions', () => {
  it('bekleyen rezervasyon iptal edilebilir, kod gösterilmez', () => {
    const actions = reservationActions('pending_business');
    expect(actions.canCancel).toBe(true);
    expect(actions.showCode).toBe(false);
  });

  it('onaylı rezervasyonda kod gösterilir', () => {
    expect(reservationActions('confirmed').showCode).toBe(true);
  });

  it('reddedilen rezervasyonda alternatifler gösterilir', () => {
    const actions = reservationActions('rejected');
    expect(actions.showAlternatives).toBe(true);
    expect(actions.canCancel).toBe(false);
  });

  it('tamamlanan rezervasyon iptal edilemez', () => {
    expect(reservationActions('completed').canCancel).toBe(false);
  });
});

describe('filterMatchesByBudget', () => {
  const matches = [
    { pricing: { overBudgetPercent: 0 } },
    { pricing: { overBudgetPercent: 0.1 } },
    { pricing: { overBudgetPercent: 0 } },
  ] as never as Parameters<typeof filterMatchesByBudget>[0];

  it('filtre kapalıyken tüm paketleri döner', () => {
    expect(filterMatchesByBudget(matches, false)).toHaveLength(3);
  });

  it('filtre açıkken bütçeyi aşanları eler', () => {
    expect(filterMatchesByBudget(matches, true)).toHaveLength(2);
  });
});

describe('tabBadgeCount', () => {
  it('okunmamış yoksa rozet gösterilmez', () => {
    expect(tabBadgeCount(0)).toBeUndefined();
  });

  it('okunmamış varsa sayı döner', () => {
    expect(tabBadgeCount(3)).toBe(3);
  });

  it('99 üstünü sınırlar', () => {
    expect(tabBadgeCount(250)).toBe(99);
  });
});
