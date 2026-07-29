import type { RejectionReason, ReservationStatus } from '@hazirgrup/types';
import { AppError } from '../errors/AppError';

/** Rezervasyon durum makinesi. */

const TRANSITIONS: Readonly<Record<ReservationStatus, readonly ReservationStatus[]>> = {
  created: ['pending_business', 'cancelled_by_user'],
  pending_business: ['confirmed', 'rejected', 'cancelled_by_user', 'cancelled_by_business'],
  confirmed: ['completed', 'no_show', 'cancelled_by_user', 'cancelled_by_business'],
  rejected: [],
  cancelled_by_user: [],
  cancelled_by_business: [],
  completed: [],
  no_show: [],
};

export const TERMINAL_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  'rejected',
  'cancelled_by_user',
  'cancelled_by_business',
  'completed',
  'no_show',
];

export function canTransitionReservation(
  from: ReservationStatus,
  to: ReservationStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedReservationTransitions(
  from: ReservationStatus,
): readonly ReservationStatus[] {
  return TRANSITIONS[from];
}

export function isTerminalReservationStatus(status: ReservationStatus): boolean {
  return TERMINAL_RESERVATION_STATUSES.includes(status);
}

export function assertReservationTransition(
  from: ReservationStatus,
  to: ReservationStatus,
): void {
  if (from === to) return;
  if (!canTransitionReservation(from, to)) {
    throw AppError.conflict(
      `Rezervasyon "${RESERVATION_STATUS_LABELS[from]}" durumundayken bu işlem yapılamaz.`,
      { from, to },
    );
  }
}

// ---------------------------------------------------------------------------
// Gösterim
// ---------------------------------------------------------------------------

export const RESERVATION_STATUS_LABELS: Readonly<Record<ReservationStatus, string>> = {
  created: 'Oluşturuldu',
  pending_business: 'İşletme onayı bekleniyor',
  confirmed: 'Onaylandı',
  rejected: 'Reddedildi',
  cancelled_by_user: 'İptal ettin',
  cancelled_by_business: 'İşletme iptal etti',
  completed: 'Tamamlandı',
  no_show: 'Gelinmedi',
};

export const RESERVATION_STATUS_ICONS: Readonly<Record<ReservationStatus, string>> = {
  created: '📝',
  pending_business: '⏳',
  confirmed: '✅',
  rejected: '⛔',
  cancelled_by_user: '↩️',
  cancelled_by_business: '⛔',
  completed: '✔️',
  no_show: '⚠️',
};

export const RESERVATION_STATUS_DESCRIPTIONS: Readonly<Record<ReservationStatus, string>> = {
  created: 'Talebin hazırlandı.',
  pending_business: 'Mekân talebini inceliyor. Genellikle birkaç saat içinde dönüş yapılır.',
  confirmed: 'Mekân rezervasyonunu onayladı. Rezervasyon kodunu göstermeyi unutma.',
  rejected: 'Mekân talebini kabul edemedi. Alternatif paketlere göz atabilirsin.',
  cancelled_by_user: 'Rezervasyonu sen iptal ettin.',
  cancelled_by_business: 'Mekân rezervasyonu iptal etti.',
  completed: 'Rezervasyon tamamlandı.',
  no_show: 'Rezervasyon saatinde gelinmedi.',
};

export type ReservationStatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

export const RESERVATION_STATUS_TONES: Readonly<Record<ReservationStatus, ReservationStatusTone>> =
  {
    created: 'neutral',
    pending_business: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    cancelled_by_user: 'neutral',
    cancelled_by_business: 'danger',
    completed: 'success',
    no_show: 'warning',
  };

// ---------------------------------------------------------------------------
// Yetenekler
// ---------------------------------------------------------------------------

/** Kullanıcı bu rezervasyonu iptal edebilir mi? */
export function canUserCancel(status: ReservationStatus): boolean {
  return status === 'created' || status === 'pending_business' || status === 'confirmed';
}

/** İşletme bu talebi onaylayabilir/reddedebilir mi? */
export function canBusinessRespond(status: ReservationStatus): boolean {
  return status === 'pending_business';
}

/** Kullanıcı alternatif paketlere yönlendirilmeli mi? */
export function shouldOfferAlternatives(status: ReservationStatus): boolean {
  return status === 'rejected' || status === 'cancelled_by_business';
}

/** Ret için gerekçe zorunludur. */
export function assertRejectionReason(reason: RejectionReason | null | undefined): RejectionReason {
  if (!reason) {
    throw AppError.validation(
      { rejectionReason: 'Ret gerekçesi seçmelisin.' },
      'Talebi reddederken bir gerekçe seçmen gerekiyor.',
    );
  }
  return reason;
}

/** Kullanıcıya gösterilecek zaman çizelgesi adımları (gerçekleşmemişler dahil). */
export function reservationTimelineSteps(
  current: ReservationStatus,
): Array<{ status: ReservationStatus; label: string; state: 'done' | 'current' | 'upcoming' }> {
  const happyPath: ReservationStatus[] = [
    'created',
    'pending_business',
    'confirmed',
    'completed',
  ];

  // Mutlu yoldan sapan terminal durumlar kendi başına gösterilir.
  if (
    current === 'rejected' ||
    current === 'cancelled_by_user' ||
    current === 'cancelled_by_business' ||
    current === 'no_show'
  ) {
    return [
      { status: 'created', label: RESERVATION_STATUS_LABELS.created, state: 'done' },
      {
        status: 'pending_business',
        label: RESERVATION_STATUS_LABELS.pending_business,
        state: 'done',
      },
      { status: current, label: RESERVATION_STATUS_LABELS[current], state: 'current' },
    ];
  }

  const currentIndex = happyPath.indexOf(current);
  return happyPath.map((status, index) => ({
    status,
    label: RESERVATION_STATUS_LABELS[status],
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
  }));
}
