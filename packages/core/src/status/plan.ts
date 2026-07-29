import type { PlanNextAction, PlanStatus } from '@hazirgrup/types';
import { AppError } from '../errors/AppError';

/**
 * Plan durum makinesi.
 *
 * Geçerli geçişler burada tek noktada tanımlanır ve hem uygulama katmanında
 * hem de veritabanı trigger'ında (0007_plans.sql) zorlanır.
 */

const TRANSITIONS: Readonly<Record<PlanStatus, readonly PlanStatus[]>> = {
  draft: ['awaiting_participants', 'cancelled'],
  awaiting_participants: ['confirming_participation', 'packages_ready', 'cancelled'],
  confirming_participation: ['packages_ready', 'awaiting_participants', 'cancelled'],
  packages_ready: ['voting', 'confirming_participation', 'cancelled'],
  voting: ['voting_closed', 'cancelled'],
  voting_closed: ['reservation_pending', 'voting', 'cancelled'],
  reservation_pending: ['reservation_confirmed', 'voting_closed', 'cancelled'],
  reservation_confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const TERMINAL_PLAN_STATUSES: readonly PlanStatus[] = ['completed', 'cancelled'];

export function canTransitionPlan(from: PlanStatus, to: PlanStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedPlanTransitions(from: PlanStatus): readonly PlanStatus[] {
  return TRANSITIONS[from];
}

export function isTerminalPlanStatus(status: PlanStatus): boolean {
  return TERMINAL_PLAN_STATUSES.includes(status);
}

/** Geçiş geçersizse anlaşılır bir hata fırlatır. */
export function assertPlanTransition(from: PlanStatus, to: PlanStatus): void {
  if (from === to) return;
  if (!canTransitionPlan(from, to)) {
    throw AppError.conflict(
      `Planın durumu "${PLAN_STATUS_LABELS[from]}" iken bu işlem yapılamaz.`,
      { from, to },
    );
  }
}

// ---------------------------------------------------------------------------
// Kullanıcıya gösterim
// ---------------------------------------------------------------------------

export const PLAN_STATUS_LABELS: Readonly<Record<PlanStatus, string>> = {
  draft: 'Taslak',
  awaiting_participants: 'Arkadaşlar bekleniyor',
  confirming_participation: 'Katılım netleştiriliyor',
  packages_ready: 'Paketler hazır',
  voting: 'Oylama devam ediyor',
  voting_closed: 'Oylama tamamlandı',
  reservation_pending: 'Rezervasyon onayı bekleniyor',
  reservation_confirmed: 'Rezervasyon onaylandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal edildi',
};

/** Durum yalnızca renkle anlatılmaz: ikon + metin birlikte kullanılır. */
export const PLAN_STATUS_ICONS: Readonly<Record<PlanStatus, string>> = {
  draft: '✏️',
  awaiting_participants: '👥',
  confirming_participation: '✅',
  packages_ready: '📦',
  voting: '🗳️',
  voting_closed: '🏆',
  reservation_pending: '⏳',
  reservation_confirmed: '🎉',
  completed: '✔️',
  cancelled: '⛔',
};

export const PLAN_STATUS_DESCRIPTIONS: Readonly<Record<PlanStatus, string>> = {
  draft: 'Planın henüz oluşturulmadı.',
  awaiting_participants: 'Davet ettiğin arkadaşların cevabı bekleniyor.',
  confirming_participation: 'Kimlerin geleceği netleşiyor.',
  packages_ready: 'Grubuna uygun paketler bulundu.',
  voting: 'Arkadaşların oy kullanıyor.',
  voting_closed: 'Kazanan paket belli oldu.',
  reservation_pending: 'İşletmenin onayı bekleniyor.',
  reservation_confirmed: 'Rezervasyonun onaylandı.',
  completed: 'Plan tamamlandı.',
  cancelled: 'Plan iptal edildi.',
};

export type PlanStatusTone = 'neutral' | 'brand' | 'info' | 'warning' | 'success' | 'danger';

export const PLAN_STATUS_TONES: Readonly<Record<PlanStatus, PlanStatusTone>> = {
  draft: 'neutral',
  awaiting_participants: 'info',
  confirming_participation: 'info',
  packages_ready: 'brand',
  voting: 'brand',
  voting_closed: 'success',
  reservation_pending: 'warning',
  reservation_confirmed: 'success',
  completed: 'neutral',
  cancelled: 'danger',
};

// ---------------------------------------------------------------------------
// Sıradaki adım
// ---------------------------------------------------------------------------

export interface NextActionInput {
  planId: string;
  status: PlanStatus;
  viewerIsOwner: boolean;
  participantCount: number;
  matchCount: number;
  hasVoted: boolean;
  isTie: boolean;
}

/**
 * "Bir sonraki adımım ne?" sorusunun cevabı.
 * Her plan kartında ve plan detayında gösterilir.
 */
export function nextPlanAction(input: NextActionInput): PlanNextAction {
  const base = `/hesap/plan/${input.planId}`;

  switch (input.status) {
    case 'draft':
      return {
        key: 'complete_wizard',
        label: 'Planı tamamla',
        description: 'Sihirbazı bitirip planını oluştur.',
        href: `/hesap/plan/yeni?taslak=${input.planId}`,
        ownerOnly: true,
      };

    case 'awaiting_participants':
      if (input.participantCount <= 1) {
        return {
          key: 'invite_friends',
          label: 'Arkadaşlarını davet et',
          description: 'Tek bağlantıyla arkadaşlarını plana çağır.',
          href: `${base}/davet`,
          ownerOnly: true,
        };
      }
      return {
        key: 'confirm_participation',
        label: 'Katılımı netleştir',
        description: 'Kimlerin geleceği netleşince paketleri görebilirsin.',
        href: base,
        ownerOnly: true,
      };

    case 'confirming_participation':
      if (input.matchCount === 0) {
        return {
          key: 'relax_filters',
          label: 'Kısıtları gevşet',
          description: 'Bütçeyi, kişi sayısını veya saati değiştirerek daha fazla paket gör.',
          href: `#ayarlar`,
          ownerOnly: true,
        };
      }
      return {
        key: 'view_packages',
        label: 'Paketleri gör',
        description: 'Grubuna uygun paketler hazır.',
        href: `${base}#paketler`,
        ownerOnly: false,
      };

    case 'packages_ready':
      return {
        key: 'start_voting',
        label: 'Oylamayı başlat',
        description: 'Arkadaşların birlikte karar versin.',
        href: `#paketler`,
        ownerOnly: true,
      };

    case 'voting':
      if (!input.hasVoted) {
        return {
          key: 'cast_vote',
          label: 'Oyunu kullan',
          description: 'Beğendiğin paketi seç; oyunu sonra değiştirebilirsin.',
          href: `#oylama`,
          ownerOnly: false,
        };
      }
      return {
        key: 'finish_voting',
        label: 'Oylamayı bitir',
        description: 'Herkes oy verdiyse oylamayı erken bitirebilirsin.',
        href: `#oylama`,
        ownerOnly: true,
      };

    case 'voting_closed':
      if (input.isTie) {
        return {
          key: 'break_tie',
          label: 'Kazananı seç',
          description: 'Oylar eşit çıktı; son kararı sen ver.',
          href: `#oylama`,
          ownerOnly: true,
        };
      }
      return {
        key: 'send_reservation',
        label: 'Rezervasyon talebi gönder',
        description: 'Kazanan paket için mekâna talep gönder.',
        href: `${base}/rezervasyon`,
        ownerOnly: true,
      };

    case 'reservation_pending':
      return {
        key: 'contact_venue',
        label: 'Mekânla iletişime geç',
        description: 'İşletmenin onayı bekleniyor. Dilersen arayabilirsin.',
        href: `${base}/rezervasyon`,
        ownerOnly: false,
      };

    case 'reservation_confirmed':
      return {
        key: 'view_reservation',
        label: 'Rezervasyonu gör',
        description: 'Rezervasyon kodun ve detayların hazır.',
        href: `${base}/rezervasyon`,
        ownerOnly: false,
      };

    case 'completed':
      return {
        key: 'create_new',
        label: 'Yeni plan oluştur',
        description: 'Bir sonraki buluşmayı planla.',
        href: '/hesap/plan/yeni',
        ownerOnly: false,
      };

    case 'cancelled':
      return {
        key: 'create_new',
        label: 'Yeni plan oluştur',
        description: 'Bu plan iptal edildi.',
        href: '/hesap/plan/yeni',
        ownerOnly: false,
      };
  }
}

/**
 * Katılım netleştikten sonra planın otomatik ilerleyeceği durumu hesaplar (D-016).
 * Eşleşen paket varsa `packages_ready`, yoksa `confirming_participation` kalır.
 */
export function autoAdvanceAfterParticipation(
  current: PlanStatus,
  matchCount: number,
): PlanStatus {
  if (current !== 'awaiting_participants' && current !== 'confirming_participation') {
    return current;
  }
  return matchCount > 0 ? 'packages_ready' : 'confirming_participation';
}

/** Planın hangi aşamada olduğunu 0–1 arası ilerleme olarak verir. */
export function planProgress(status: PlanStatus): number {
  const order: PlanStatus[] = [
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
  if (status === 'cancelled') return 0;
  const index = order.indexOf(status);
  return index < 0 ? 0 : index / (order.length - 1);
}

/** Oylamanın açılabilir olup olmadığı. */
export function canStartVoting(status: PlanStatus, matchCount: number): boolean {
  return status === 'packages_ready' && matchCount > 0;
}

/** Rezervasyon talebinin gönderilebilir olup olmadığı. */
export function canCreateReservation(status: PlanStatus, winningPackageId: string | null): boolean {
  return status === 'voting_closed' && winningPackageId !== null;
}
