import { describe, expect, it } from 'vitest';
import { PLAN_STATUSES, RESERVATION_STATUSES } from '@hazirgrup/types';
import type { PlanStatus, ReservationStatus } from '@hazirgrup/types';
import { AppError } from '../../errors/AppError';
import {
  assertPlanTransition,
  autoAdvanceAfterParticipation,
  canCreateReservation,
  canStartVoting,
  canTransitionPlan,
  isTerminalPlanStatus,
  nextPlanAction,
  PLAN_STATUS_DESCRIPTIONS,
  PLAN_STATUS_ICONS,
  PLAN_STATUS_LABELS,
  planProgress,
} from '../plan';
import {
  assertRejectionReason,
  assertReservationTransition,
  canBusinessRespond,
  canTransitionReservation,
  canUserCancel,
  isTerminalReservationStatus,
  RESERVATION_STATUS_LABELS,
  reservationTimelineSteps,
  shouldOfferAlternatives,
} from '../reservation';

describe('plan durum makinesi', () => {
  it('taslaktan davete geçebilir', () => {
    expect(canTransitionPlan('draft', 'awaiting_participants')).toBe(true);
  });

  it('taslaktan doğrudan oylamaya geçemez', () => {
    expect(canTransitionPlan('draft', 'voting')).toBe(false);
  });

  it('oylamadan rezervasyona doğrudan geçemez', () => {
    expect(canTransitionPlan('voting', 'reservation_pending')).toBe(false);
  });

  it('her durumdan iptale geçilebilir (terminal durumlar hariç)', () => {
    for (const status of PLAN_STATUSES) {
      if (isTerminalPlanStatus(status)) continue;
      expect(canTransitionPlan(status, 'cancelled'), `${status} → cancelled`).toBe(true);
    }
  });

  it('terminal durumlardan çıkış yoktur', () => {
    expect(canTransitionPlan('completed', 'voting')).toBe(false);
    expect(canTransitionPlan('cancelled', 'draft')).toBe(false);
  });

  it('geçersiz geçişte anlaşılır hata fırlatır', () => {
    expect(() => assertPlanTransition('draft', 'completed')).toThrow(AppError);
    try {
      assertPlanTransition('draft', 'completed');
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe('conflict');
      expect(appError.userMessage).toContain('Taslak');
    }
  });

  it('aynı duruma geçiş serbesttir (idempotent)', () => {
    expect(() => assertPlanTransition('voting', 'voting')).not.toThrow();
  });

  it('her durumun etiketi, ikonu ve açıklaması vardır', () => {
    for (const status of PLAN_STATUSES) {
      expect(PLAN_STATUS_LABELS[status], status).toBeTruthy();
      expect(PLAN_STATUS_ICONS[status], status).toBeTruthy();
      expect(PLAN_STATUS_DESCRIPTIONS[status], status).toBeTruthy();
    }
  });
});

describe('nextPlanAction', () => {
  const base = {
    planId: 'plan-1',
    viewerIsOwner: true,
    participantCount: 1,
    matchCount: 5,
    hasVoted: false,
    isTie: false,
  };

  it('her durum için bir sonraki adım üretir', () => {
    for (const status of PLAN_STATUSES) {
      const action = nextPlanAction({ ...base, status });
      expect(action.label, status).toBeTruthy();
      expect(action.description, status).toBeTruthy();
      expect(action.key, status).toBeTruthy();
    }
  });

  it('tek katılımcı varken davet etmeye yönlendirir', () => {
    const action = nextPlanAction({ ...base, status: 'awaiting_participants' });
    expect(action.key).toBe('invite_friends');
  });

  it('katılımcı varken katılımı netleştirmeye yönlendirir', () => {
    const action = nextPlanAction({
      ...base,
      status: 'awaiting_participants',
      participantCount: 4,
    });
    expect(action.key).toBe('confirm_participation');
  });

  it('eşleşen paket yoksa kısıt gevşetmeyi önerir', () => {
    const action = nextPlanAction({ ...base, status: 'confirming_participation', matchCount: 0 });
    expect(action.key).toBe('relax_filters');
  });

  it('oy vermemişse oy kullanmaya, vermişse bitirmeye yönlendirir', () => {
    expect(nextPlanAction({ ...base, status: 'voting', hasVoted: false }).key).toBe('cast_vote');
    expect(nextPlanAction({ ...base, status: 'voting', hasVoted: true }).key).toBe('finish_voting');
  });

  it('eşitlikte kazananı seçmeye yönlendirir', () => {
    const action = nextPlanAction({ ...base, status: 'voting_closed', isTie: true });
    expect(action.key).toBe('break_tie');
  });

  it('eşitlik yoksa rezervasyona yönlendirir', () => {
    const action = nextPlanAction({ ...base, status: 'voting_closed', isTie: false });
    expect(action.key).toBe('send_reservation');
  });
});

describe('autoAdvanceAfterParticipation', () => {
  it('eşleşme varsa paketler hazır durumuna geçer', () => {
    expect(autoAdvanceAfterParticipation('awaiting_participants', 3)).toBe('packages_ready');
  });

  it('eşleşme yoksa katılım netleştirme durumunda kalır', () => {
    expect(autoAdvanceAfterParticipation('awaiting_participants', 0)).toBe(
      'confirming_participation',
    );
  });

  it('ilgisiz durumları değiştirmez', () => {
    expect(autoAdvanceAfterParticipation('voting', 5)).toBe('voting');
    expect(autoAdvanceAfterParticipation('completed', 0)).toBe('completed');
  });
});

describe('planProgress', () => {
  it('taslakta 0, tamamlandıda 1 döner', () => {
    expect(planProgress('draft')).toBe(0);
    expect(planProgress('completed')).toBe(1);
  });

  it('ilerleme monotondur', () => {
    const ordered: PlanStatus[] = [
      'draft',
      'awaiting_participants',
      'confirming_participation',
      'packages_ready',
      'voting',
      'voting_closed',
      'reservation_pending',
      'reservation_confirmed',
      'completed',
    ];
    for (let i = 1; i < ordered.length; i += 1) {
      expect(planProgress(ordered[i]!)).toBeGreaterThan(planProgress(ordered[i - 1]!));
    }
  });

  it('iptal edilen planda 0 döner', () => {
    expect(planProgress('cancelled')).toBe(0);
  });
});

describe('plan yetenekleri', () => {
  it('oylama yalnızca paketler hazırken ve eşleşme varken başlar', () => {
    expect(canStartVoting('packages_ready', 3)).toBe(true);
    expect(canStartVoting('packages_ready', 0)).toBe(false);
    expect(canStartVoting('voting', 3)).toBe(false);
  });

  it('rezervasyon yalnızca oylama bitince ve kazanan varken oluşturulur', () => {
    expect(canCreateReservation('voting_closed', 'pkg-1')).toBe(true);
    expect(canCreateReservation('voting_closed', null)).toBe(false);
    expect(canCreateReservation('voting', 'pkg-1')).toBe(false);
  });
});

describe('rezervasyon durum makinesi', () => {
  it('mutlu yolu izler', () => {
    expect(canTransitionReservation('created', 'pending_business')).toBe(true);
    expect(canTransitionReservation('pending_business', 'confirmed')).toBe(true);
    expect(canTransitionReservation('confirmed', 'completed')).toBe(true);
  });

  it('onaylanmamış rezervasyon tamamlanamaz', () => {
    expect(canTransitionReservation('pending_business', 'completed')).toBe(false);
  });

  it('terminal durumlardan çıkış yoktur', () => {
    for (const status of RESERVATION_STATUSES) {
      if (!isTerminalReservationStatus(status)) continue;
      for (const target of RESERVATION_STATUSES) {
        expect(canTransitionReservation(status, target), `${status} → ${target}`).toBe(false);
      }
    }
  });

  it('geçersiz geçişte hata fırlatır', () => {
    expect(() => assertReservationTransition('rejected', 'confirmed')).toThrow(AppError);
  });

  it('her durumun etiketi vardır', () => {
    for (const status of RESERVATION_STATUSES) {
      expect(RESERVATION_STATUS_LABELS[status], status).toBeTruthy();
    }
  });
});

describe('rezervasyon yetenekleri', () => {
  it('kullanıcı yalnızca aktif rezervasyonu iptal edebilir', () => {
    expect(canUserCancel('pending_business')).toBe(true);
    expect(canUserCancel('confirmed')).toBe(true);
    expect(canUserCancel('completed')).toBe(false);
    expect(canUserCancel('rejected')).toBe(false);
  });

  it('işletme yalnızca bekleyen talebe yanıt verebilir', () => {
    expect(canBusinessRespond('pending_business')).toBe(true);
    expect(canBusinessRespond('confirmed')).toBe(false);
  });

  it('ret ve işletme iptalinde alternatif önerilir', () => {
    expect(shouldOfferAlternatives('rejected')).toBe(true);
    expect(shouldOfferAlternatives('cancelled_by_business')).toBe(true);
    expect(shouldOfferAlternatives('cancelled_by_user')).toBe(false);
  });

  it('gerekçesiz ret reddedilir', () => {
    expect(() => assertRejectionReason(null)).toThrow(AppError);
    expect(assertRejectionReason('fully_booked')).toBe('fully_booked');
  });
});

describe('reservationTimelineSteps', () => {
  it('mutlu yolda mevcut adımı işaretler', () => {
    const steps = reservationTimelineSteps('pending_business');
    expect(steps.map((s) => s.state)).toEqual(['done', 'current', 'upcoming', 'upcoming']);
  });

  it('reddedilen rezervasyonda sapmayı gösterir', () => {
    const steps = reservationTimelineSteps('rejected');
    expect(steps).toHaveLength(3);
    expect(steps[2]!.status).toBe('rejected');
    expect(steps[2]!.state).toBe('current');
  });

  it('tamamlanan rezervasyonda tüm adımlar geçilmiştir', () => {
    const steps = reservationTimelineSteps('completed');
    expect(steps[steps.length - 1]!.state).toBe('current');
    expect(steps.slice(0, -1).every((s) => s.state === 'done')).toBe(true);
  });

  it('her rezervasyon durumu için adım listesi üretir', () => {
    for (const status of RESERVATION_STATUSES as readonly ReservationStatus[]) {
      expect(reservationTimelineSteps(status).length, status).toBeGreaterThan(0);
    }
  });
});
