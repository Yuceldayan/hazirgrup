/** Uygulama genelinde kullanılan sabit değer kümeleri. */

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export const PLAN_STATUSES = [
  'draft',
  'awaiting_participants',
  'confirming_participation',
  'packages_ready',
  'voting',
  'voting_closed',
  'reservation_pending',
  'reservation_confirmed',
  'completed',
  'cancelled',
] as const;

export type PlanStatus = (typeof PLAN_STATUSES)[number];

export const PARTICIPATION_STATUSES = ['pending', 'going', 'maybe', 'not_going'] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];

export const BUDGET_MODES = ['per_person', 'total'] as const;
export type BudgetMode = (typeof BUDGET_MODES)[number];

// ---------------------------------------------------------------------------
// Rezervasyon
// ---------------------------------------------------------------------------

export const RESERVATION_STATUSES = [
  'created',
  'pending_business',
  'confirmed',
  'rejected',
  'cancelled_by_user',
  'cancelled_by_business',
  'completed',
  'no_show',
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const REJECTION_REASONS = [
  'fully_booked',
  'capacity_mismatch',
  'closed_that_day',
  'package_unavailable',
  'contact_failed',
  'other',
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];

export const REJECTION_REASON_LABELS: Readonly<Record<RejectionReason, string>> = {
  fully_booked: 'O saat için yerimiz dolu',
  capacity_mismatch: 'Kişi sayısı bu paket için uygun değil',
  closed_that_day: 'O gün kapalıyız',
  package_unavailable: 'Paket şu anda sunulmuyor',
  contact_failed: 'İletişim kurulamadı',
  other: 'Diğer',
};

// ---------------------------------------------------------------------------
// Paket
// ---------------------------------------------------------------------------

export const PRICING_MODELS = ['per_person', 'total'] as const;
export type PricingModel = (typeof PRICING_MODELS)[number];

// ---------------------------------------------------------------------------
// Roller ve işletme
// ---------------------------------------------------------------------------

export const APP_ROLES = ['user', 'business_staff', 'business_owner', 'moderator', 'admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const BUSINESS_STATUSES = [
  'draft',
  'pending_review',
  'verified',
  'rejected',
  'suspended',
] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const BUSINESS_MEMBER_ROLES = ['owner', 'staff'] as const;
export type BusinessMemberRole = (typeof BUSINESS_MEMBER_ROLES)[number];

// ---------------------------------------------------------------------------
// Destek / moderasyon
// ---------------------------------------------------------------------------

export const REPORT_STATUSES = ['open', 'reviewing', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const TICKET_STATUSES = ['open', 'answered', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const REPORT_SUBJECT_TYPES = ['business', 'package', 'plan', 'user'] as const;
export type ReportSubjectType = (typeof REPORT_SUBJECT_TYPES)[number];

// ---------------------------------------------------------------------------
// Bildirim
// ---------------------------------------------------------------------------

export const NOTIFICATION_CHANNELS = ['in_app', 'push', 'email'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const USER_NOTIFICATION_TYPES = [
  'participant_joined',
  'participation_changed',
  'vote_cast',
  'voting_ending_soon',
  'voting_closed',
  'reservation_submitted',
  'reservation_confirmed',
  'reservation_rejected',
  'reservation_reminder',
  'plan_cancelled',
] as const;

export const BUSINESS_NOTIFICATION_TYPES = [
  'new_reservation_request',
  'reservation_updated',
  'reservation_cancelled_by_user',
  'upcoming_reservation',
] as const;

export const NOTIFICATION_TYPES = [
  ...USER_NOTIFICATION_TYPES,
  ...BUSINESS_NOTIFICATION_TYPES,
] as const;

export type UserNotificationType = (typeof USER_NOTIFICATION_TYPES)[number];
export type BusinessNotificationType = (typeof BUSINESS_NOTIFICATION_TYPES)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Tema / görünüm
// ---------------------------------------------------------------------------

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

// ---------------------------------------------------------------------------
// Sıralama
// ---------------------------------------------------------------------------

export const PACKAGE_SORT_OPTIONS = [
  'best_match',
  'lowest_per_person',
  'closest_to_budget',
  'most_popular',
  'newest',
] as const;

export type PackageSortOption = (typeof PACKAGE_SORT_OPTIONS)[number];

export const PACKAGE_SORT_LABELS: Readonly<Record<PackageSortOption, string>> = {
  best_match: 'En uygun',
  lowest_per_person: 'En düşük kişi başı fiyat',
  closest_to_budget: 'Bütçeye en yakın',
  most_popular: 'En popüler',
  newest: 'Yeni eklenen',
};
