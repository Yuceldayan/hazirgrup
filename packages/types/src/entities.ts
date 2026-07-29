import type {
  AppRole,
  ApplicationStatus,
  BudgetMode,
  BusinessMemberRole,
  BusinessStatus,
  NotificationChannel,
  NotificationType,
  ParticipationStatus,
  PlanStatus,
  PricingModel,
  RejectionReason,
  ReportStatus,
  ReportSubjectType,
  ReservationStatus,
  ThemePreference,
  TicketStatus,
} from './enums';
import type {
  ClockTime,
  IsoDate,
  IsoDateTime,
  Kurus,
  SeoFields,
  Weekday,
} from './primitives';

export type Id = string;

// ---------------------------------------------------------------------------
// Kimlik
// ---------------------------------------------------------------------------

export interface Profile {
  id: Id;
  displayName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  cityId: Id | null;
  districtId: Id | null;
  theme: ThemePreference;
  locale: string;
  isSuspended: boolean;
  deletedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface UserRoleAssignment {
  userId: Id;
  role: AppRole;
  grantedBy: Id | null;
  grantedAt: IsoDateTime;
}

/** Oturum açmış kullanıcının uygulama içindeki temsili. */
export interface SessionUser {
  id: Id;
  email: string;
  displayName: string;
  roles: AppRole[];
  cityId: Id | null;
  districtId: Id | null;
  theme: ThemePreference;
}

// ---------------------------------------------------------------------------
// Konum ve sınıflandırma
// ---------------------------------------------------------------------------

export interface Country {
  id: Id;
  code: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface City extends SeoFields {
  id: Id;
  countryId: Id;
  name: string;
  slug: string;
  intro: string | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
}

export interface District extends SeoFields {
  id: Id;
  cityId: Id;
  name: string;
  slug: string;
  intro: string | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
}

export interface Category extends SeoFields {
  id: Id;
  key: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Preference {
  key: string;
  label: string;
  categoryKey: string | null;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// İşletme
// ---------------------------------------------------------------------------

export interface Business extends SeoFields {
  id: Id;
  ownerId: Id | null;
  name: string;
  slug: string;
  description: string;
  categoryId: Id;
  status: BusinessStatus;
  isPublic: boolean;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  verifiedAt: IsoDateTime | null;
  verifiedBy: Id | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface BranchHours {
  weekday: Weekday;
  opensAt: ClockTime | null;
  closesAt: ClockTime | null;
  isClosed: boolean;
}

export interface BusinessBranch {
  id: Id;
  businessId: Id;
  name: string;
  slug: string;
  cityId: Id;
  districtId: Id;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  isActive: boolean;
  hours: BranchHours[];
  createdAt: IsoDateTime;
}

export interface BusinessMember {
  businessId: Id;
  userId: Id;
  role: BusinessMemberRole;
  invitedBy: Id | null;
  createdAt: IsoDateTime;
}

export interface BusinessApplication {
  id: Id;
  applicantId: Id;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  cityId: Id;
  districtId: Id;
  categoryId: Id;
  /** Vergi/işletme kimlik bilgisi — yalnızca yönetici erişimi. */
  taxInfo: string | null;
  instagram: string | null;
  website: string | null;
  logoUrl: string | null;
  status: ApplicationStatus;
  reviewNote: string | null;
  reviewedBy: Id | null;
  reviewedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
}

// ---------------------------------------------------------------------------
// Paket
// ---------------------------------------------------------------------------

export interface PackageItem {
  id: Id;
  label: string;
  detail: string | null;
  sortOrder: number;
}

export interface PackageImage {
  id: Id;
  url: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface PackageAvailability {
  weekday: Weekday;
  startTime: ClockTime;
  endTime: ClockTime;
}

export interface VenuePackage extends SeoFields {
  id: Id;
  businessId: Id;
  branchId: Id;
  categoryId: Id;
  name: string;
  slug: string;
  description: string;
  minPeople: number;
  maxPeople: number;
  pricingModel: PricingModel;
  /** `per_person` ise kişi başı, `total` ise paketin sabit toplamı (kuruş). */
  priceAmount: Kurus;
  durationMinutes: number | null;
  reservationTerms: string | null;
  cancellationTerms: string | null;
  isActive: boolean;
  isPublic: boolean;
  popularity: number;
  items: PackageItem[];
  images: PackageImage[];
  availability: PackageAvailability[];
  preferenceKeys: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export interface Plan {
  id: Id;
  ownerId: Id;
  name: string;
  status: PlanStatus;
  cityId: Id;
  districtId: Id | null;
  eventDate: IsoDate;
  startTime: ClockTime | null;
  endTime: ClockTime | null;
  isTimeFlexible: boolean;
  estimatedPeople: number;
  minPeople: number;
  maxPeople: number;
  budgetMode: BudgetMode;
  /** Kuruş. `budgetMode` hangisiyse o alan doldurulur, diğeri türetilir. */
  budgetPerPerson: Kurus | null;
  budgetTotal: Kurus | null;
  note: string | null;
  categoryIds: Id[];
  preferenceKeys: string[];
  votingStartsAt: IsoDateTime | null;
  votingEndsAt: IsoDateTime | null;
  winningPackageId: Id | null;
  cancelledReason: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface PlanParticipant {
  id: Id;
  planId: Id;
  userId: Id | null;
  /** Misafir katılımcı için cookie sırrının SHA-256 özeti. Düz sır saklanmaz. */
  guestTokenHash: string | null;
  displayName: string;
  status: ParticipationStatus;
  isOwner: boolean;
  joinedAt: IsoDateTime;
}

export interface PlanInvitation {
  id: Id;
  planId: Id;
  /** Token'ın SHA-256 özeti. Düz token yalnızca bağlantıda bulunur. */
  tokenHash: string;
  shortCode: string;
  createdBy: Id;
  expiresAt: IsoDateTime | null;
  revokedAt: IsoDateTime | null;
  useCount: number;
  createdAt: IsoDateTime;
}

export interface PlanPackageMatch {
  planId: Id;
  packageId: Id;
  score: number;
  reasons: MatchReason[];
  computedAt: IsoDateTime;
}

export const MATCH_REASON_KEYS = [
  'exact_match',
  'within_budget',
  'near_budget',
  'group_size_fits',
  'time_valid',
  'time_close',
  'in_district',
  'in_city',
  'category_match',
  'preference_match',
  'popular',
] as const;

export type MatchReasonKey = (typeof MATCH_REASON_KEYS)[number];

export interface MatchReason {
  key: MatchReasonKey;
  /** Kullanıcıya gösterilecek Türkçe etiket. */
  label: string;
  tone: 'positive' | 'neutral' | 'warning';
}

// ---------------------------------------------------------------------------
// Oylama
// ---------------------------------------------------------------------------

export interface Vote {
  id: Id;
  planId: Id;
  participantId: Id;
  packageId: Id;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface VoteTally {
  packageId: Id;
  count: number;
  /** Oyların açık olması gereği (D-007): kimler oyladı. */
  voterNames: string[];
}

export interface VotingResult {
  tallies: VoteTally[];
  totalVotes: number;
  participantCount: number;
  /** Eşitlik varsa birden fazla eleman içerir; kazanan plan sahibince seçilir. */
  leadingPackageIds: Id[];
  isTie: boolean;
  winnerPackageId: Id | null;
}

// ---------------------------------------------------------------------------
// Rezervasyon
// ---------------------------------------------------------------------------

export interface Reservation {
  id: Id;
  planId: Id;
  packageId: Id;
  branchId: Id;
  businessId: Id;
  createdBy: Id;
  code: string;
  peopleCount: number;
  reservedDate: IsoDate;
  reservedStartTime: ClockTime | null;
  reservedEndTime: ClockTime | null;
  totalPrice: Kurus;
  perPersonPrice: Kurus;
  contactName: string;
  contactPhone: string;
  note: string | null;
  status: ReservationStatus;
  rejectionReason: RejectionReason | null;
  rejectionNote: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface ReservationStatusEvent {
  id: Id;
  reservationId: Id;
  fromStatus: ReservationStatus | null;
  toStatus: ReservationStatus;
  changedBy: Id | null;
  reason: string | null;
  createdAt: IsoDateTime;
}

// ---------------------------------------------------------------------------
// Yardımcı varlıklar
// ---------------------------------------------------------------------------

export interface Favorite {
  userId: Id;
  packageId: Id;
  createdAt: IsoDateTime;
}

export interface AppNotification {
  id: Id;
  userId: Id;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  readAt: IsoDateTime | null;
  createdAt: IsoDateTime;
}

export interface NotificationPreference {
  userId: Id;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface Report {
  id: Id;
  reporterId: Id;
  subjectType: ReportSubjectType;
  subjectId: Id;
  reason: string;
  detail: string | null;
  status: ReportStatus;
  resolvedBy: Id | null;
  resolutionNote: string | null;
  createdAt: IsoDateTime;
}

export interface SupportTicket {
  id: Id;
  userId: Id;
  subject: string;
  body: string;
  status: TicketStatus;
  answer: string | null;
  answeredBy: Id | null;
  createdAt: IsoDateTime;
}

export interface AdminLogEntry {
  id: Id;
  actorId: Id;
  actorName: string;
  action: string;
  entityType: string;
  entityId: Id;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: IsoDateTime;
}

export interface SeoRedirect {
  id: Id;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 410;
  isActive: boolean;
  createdAt: IsoDateTime;
}

export interface HelpArticle extends SeoFields {
  id: Id;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  isPublic: boolean;
  sortOrder: number;
}

export interface LegalDocument {
  slug: string;
  title: string;
  updatedAt: IsoDate;
  body: string;
}
