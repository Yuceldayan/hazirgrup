import type {
  AppRole,
  ApplicationStatus,
  BranchHours,
  Business,
  BusinessApplication,
  BusinessBranch,
  BusinessMember,
  BusinessMemberRole,
  BusinessStatus,
  Category,
  City,
  Country,
  District,
  NotificationType,
  AppNotification,
  PackageAvailability,
  PackageImage,
  PackageItem,
  ParticipationStatus,
  Plan,
  PlanInvitation,
  PlanParticipant,
  PlanStatus,
  Preference,
  PricingModel,
  Profile,
  RejectionReason,
  Reservation,
  ReservationStatus,
  ReservationStatusEvent,
  SeoRedirect,
  HelpArticle,
  ThemePreference,
  VenuePackage,
  Vote,
  Weekday,
  AdminLogEntry,
} from '@hazirgrup/types';

/**
 * PostgreSQL satır tipleri (snake_case) ve domain tiplerine dönüştürücüler.
 * Şema tanımı: supabase/migrations/
 */

export interface CountryRow {
  id: string;
  code: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface CityRow {
  id: string;
  country_id: string;
  name: string;
  slug: string;
  intro: string | null;
  is_active: boolean;
  is_public: boolean;
  is_indexable: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  og_image_url: string | null;
}

export interface DistrictRow extends Omit<CityRow, 'country_id'> {
  city_id: string;
}

export interface CategoryRow {
  id: string;
  key: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  is_active: boolean;
  is_indexable: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  og_image_url: string | null;
}

export interface PreferenceRow {
  key: string;
  label: string;
  category_key: string | null;
  sort_order: number;
}

export interface ProfileRow {
  id: string;
  display_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  city_id: string | null;
  district_id: string | null;
  theme: ThemePreference;
  locale: string;
  is_suspended: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessRow {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  status: BusinessStatus;
  is_public: boolean;
  is_indexable: boolean;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  og_image_url: string | null;
}

export interface BranchHoursRow {
  weekday: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

export interface BranchRow {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  city_id: string;
  district_id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
  created_at: string;
  branch_hours?: BranchHoursRow[] | null;
}

export interface BusinessMemberRow {
  business_id: string;
  user_id: string;
  role: BusinessMemberRole;
  invited_by: string | null;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  applicant_id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  city_id: string;
  district_id: string;
  category_id: string;
  tax_info: string | null;
  instagram: string | null;
  website: string | null;
  logo_url: string | null;
  status: ApplicationStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PackageItemRow {
  id: string;
  label: string;
  detail: string | null;
  sort_order: number;
}

export interface PackageImageRow {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
}

export interface PackageAvailabilityRow {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface PackagePreferenceRow {
  preference_key: string;
}

export interface PackageRow {
  id: string;
  business_id: string;
  branch_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  min_people: number;
  max_people: number;
  pricing_model: PricingModel;
  price_amount: number;
  duration_minutes: number | null;
  reservation_terms: string | null;
  cancellation_terms: string | null;
  is_active: boolean;
  is_public: boolean;
  is_indexable: boolean;
  popularity: number;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  og_image_url: string | null;
  package_items?: PackageItemRow[] | null;
  package_images?: PackageImageRow[] | null;
  package_availability?: PackageAvailabilityRow[] | null;
  package_preferences?: PackagePreferenceRow[] | null;
}

export interface PlanRow {
  id: string;
  owner_id: string;
  name: string;
  status: PlanStatus;
  city_id: string;
  district_id: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  is_time_flexible: boolean;
  estimated_people: number;
  min_people: number;
  max_people: number;
  budget_mode: 'per_person' | 'total';
  budget_per_person: number | null;
  budget_total: number | null;
  note: string | null;
  voting_starts_at: string | null;
  voting_ends_at: string | null;
  winning_package_id: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  plan_categories?: Array<{ category_id: string }> | null;
  plan_preferences?: Array<{ preference_key: string }> | null;
}

export interface ParticipantRow {
  id: string;
  plan_id: string;
  user_id: string | null;
  guest_token_hash: string | null;
  display_name: string;
  status: ParticipationStatus;
  is_owner: boolean;
  joined_at: string;
}

export interface InvitationRow {
  id: string;
  plan_id: string;
  token_hash: string;
  short_code: string;
  created_by: string;
  expires_at: string | null;
  revoked_at: string | null;
  use_count: number;
  created_at: string;
}

export interface VoteRow {
  id: string;
  plan_id: string;
  participant_id: string;
  package_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationRow {
  id: string;
  plan_id: string;
  package_id: string;
  branch_id: string;
  business_id: string;
  created_by: string;
  code: string;
  people_count: number;
  reserved_date: string;
  reserved_start_time: string | null;
  reserved_end_time: string | null;
  total_price: number;
  per_person_price: number;
  contact_name: string;
  contact_phone: string;
  note: string | null;
  status: ReservationStatus;
  rejection_reason: RejectionReason | null;
  rejection_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationEventRow {
  id: string;
  reservation_id: string;
  from_status: ReservationStatus | null;
  to_status: ReservationStatus;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string> | null;
  read_at: string | null;
  created_at: string;
}

export interface HelpArticleRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  is_public: boolean;
  is_indexable: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  og_image_url: string | null;
}

export interface SeoRedirectRow {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminLogRow {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}

export interface UserRoleRow {
  user_id: string;
  role: AppRole;
}

// ---------------------------------------------------------------------------
// Dönüştürücüler
// ---------------------------------------------------------------------------

export const mapCountry = (row: CountryRow): Country => ({
  id: row.id,
  code: row.code,
  name: row.name,
  slug: row.slug,
  isActive: row.is_active,
});

export const mapCity = (row: CityRow): City => ({
  id: row.id,
  countryId: row.country_id,
  name: row.name,
  slug: row.slug,
  intro: row.intro,
  isActive: row.is_active,
  isPublic: row.is_public,
  sortOrder: row.sort_order,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  seoCanonical: row.seo_canonical,
  ogImageUrl: row.og_image_url,
  isIndexable: row.is_indexable,
});

export const mapDistrict = (row: DistrictRow): District => ({
  id: row.id,
  cityId: row.city_id,
  name: row.name,
  slug: row.slug,
  intro: row.intro,
  isActive: row.is_active,
  isPublic: row.is_public,
  sortOrder: row.sort_order,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  seoCanonical: row.seo_canonical,
  ogImageUrl: row.og_image_url,
  isIndexable: row.is_indexable,
});

export const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  key: row.key,
  name: row.name,
  slug: row.slug,
  icon: row.icon,
  description: row.description,
  isActive: row.is_active,
  sortOrder: row.sort_order,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  seoCanonical: row.seo_canonical,
  ogImageUrl: row.og_image_url,
  isIndexable: row.is_indexable,
});

export const mapPreference = (row: PreferenceRow): Preference => ({
  key: row.key,
  label: row.label,
  categoryKey: row.category_key,
  sortOrder: row.sort_order,
});

export const mapProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  email: row.email,
  phone: row.phone,
  avatarUrl: row.avatar_url,
  cityId: row.city_id,
  districtId: row.district_id,
  theme: row.theme,
  locale: row.locale,
  isSuspended: row.is_suspended,
  deletedAt: row.deleted_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapBusiness = (row: BusinessRow): Business => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  categoryId: row.category_id,
  status: row.status,
  isPublic: row.is_public,
  logoUrl: row.logo_url,
  coverUrl: row.cover_url,
  phone: row.phone,
  whatsapp: row.whatsapp,
  website: row.website,
  instagram: row.instagram,
  verifiedAt: row.verified_at,
  verifiedBy: row.verified_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  seoCanonical: row.seo_canonical,
  ogImageUrl: row.og_image_url,
  isIndexable: row.is_indexable,
});

const FULL_WEEK: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export function mapBranchHours(rows: BranchHoursRow[] | null | undefined): BranchHours[] {
  const byWeekday = new Map((rows ?? []).map((r) => [r.weekday, r]));
  return FULL_WEEK.map((weekday) => {
    const row = byWeekday.get(weekday);
    return {
      weekday,
      opensAt: row?.opens_at ?? null,
      closesAt: row?.closes_at ?? null,
      isClosed: row?.is_closed ?? true,
    };
  });
}

export const mapBranch = (row: BranchRow): BusinessBranch => ({
  id: row.id,
  businessId: row.business_id,
  name: row.name,
  slug: row.slug,
  cityId: row.city_id,
  districtId: row.district_id,
  address: row.address,
  lat: row.lat,
  lng: row.lng,
  phone: row.phone,
  whatsapp: row.whatsapp,
  isActive: row.is_active,
  hours: mapBranchHours(row.branch_hours),
  createdAt: row.created_at,
});

export const mapBusinessMember = (row: BusinessMemberRow): BusinessMember => ({
  businessId: row.business_id,
  userId: row.user_id,
  role: row.role,
  invitedBy: row.invited_by,
  createdAt: row.created_at,
});

export const mapApplication = (row: ApplicationRow): BusinessApplication => ({
  id: row.id,
  applicantId: row.applicant_id,
  businessName: row.business_name,
  contactName: row.contact_name,
  phone: row.phone,
  email: row.email,
  address: row.address,
  cityId: row.city_id,
  districtId: row.district_id,
  categoryId: row.category_id,
  taxInfo: row.tax_info,
  instagram: row.instagram,
  website: row.website,
  logoUrl: row.logo_url,
  status: row.status,
  reviewNote: row.review_note,
  reviewedBy: row.reviewed_by,
  reviewedAt: row.reviewed_at,
  createdAt: row.created_at,
});

export function mapPackage(row: PackageRow): VenuePackage {
  const items: PackageItem[] = (row.package_items ?? [])
    .map((i) => ({ id: i.id, label: i.label, detail: i.detail, sortOrder: i.sort_order }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const images: PackageImage[] = (row.package_images ?? [])
    .map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      width: i.width,
      height: i.height,
      sortOrder: i.sort_order,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const availability: PackageAvailability[] = (row.package_availability ?? []).map((a) => ({
    weekday: a.weekday as Weekday,
    startTime: a.start_time.slice(0, 5),
    endTime: a.end_time.slice(0, 5),
  }));

  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    minPeople: row.min_people,
    maxPeople: row.max_people,
    pricingModel: row.pricing_model,
    priceAmount: row.price_amount,
    durationMinutes: row.duration_minutes,
    reservationTerms: row.reservation_terms,
    cancellationTerms: row.cancellation_terms,
    isActive: row.is_active,
    isPublic: row.is_public,
    popularity: row.popularity,
    items,
    images,
    availability,
    preferenceKeys: (row.package_preferences ?? []).map((p) => p.preference_key),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoCanonical: row.seo_canonical,
    ogImageUrl: row.og_image_url,
    isIndexable: row.is_indexable,
  };
}

export const mapPlan = (row: PlanRow): Plan => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  status: row.status,
  cityId: row.city_id,
  districtId: row.district_id,
  eventDate: row.event_date,
  startTime: row.start_time ? row.start_time.slice(0, 5) : null,
  endTime: row.end_time ? row.end_time.slice(0, 5) : null,
  isTimeFlexible: row.is_time_flexible,
  estimatedPeople: row.estimated_people,
  minPeople: row.min_people,
  maxPeople: row.max_people,
  budgetMode: row.budget_mode,
  budgetPerPerson: row.budget_per_person,
  budgetTotal: row.budget_total,
  note: row.note,
  categoryIds: (row.plan_categories ?? []).map((c) => c.category_id),
  preferenceKeys: (row.plan_preferences ?? []).map((p) => p.preference_key),
  votingStartsAt: row.voting_starts_at,
  votingEndsAt: row.voting_ends_at,
  winningPackageId: row.winning_package_id,
  cancelledReason: row.cancelled_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapParticipant = (row: ParticipantRow): PlanParticipant => ({
  id: row.id,
  planId: row.plan_id,
  userId: row.user_id,
  guestTokenHash: row.guest_token_hash,
  displayName: row.display_name,
  status: row.status,
  isOwner: row.is_owner,
  joinedAt: row.joined_at,
});

export const mapInvitation = (row: InvitationRow): PlanInvitation => ({
  id: row.id,
  planId: row.plan_id,
  tokenHash: row.token_hash,
  shortCode: row.short_code,
  createdBy: row.created_by,
  expiresAt: row.expires_at,
  revokedAt: row.revoked_at,
  useCount: row.use_count,
  createdAt: row.created_at,
});

export const mapVote = (row: VoteRow): Vote => ({
  id: row.id,
  planId: row.plan_id,
  participantId: row.participant_id,
  packageId: row.package_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapReservation = (row: ReservationRow): Reservation => ({
  id: row.id,
  planId: row.plan_id,
  packageId: row.package_id,
  branchId: row.branch_id,
  businessId: row.business_id,
  createdBy: row.created_by,
  code: row.code,
  peopleCount: row.people_count,
  reservedDate: row.reserved_date,
  reservedStartTime: row.reserved_start_time ? row.reserved_start_time.slice(0, 5) : null,
  reservedEndTime: row.reserved_end_time ? row.reserved_end_time.slice(0, 5) : null,
  totalPrice: row.total_price,
  perPersonPrice: row.per_person_price,
  contactName: row.contact_name,
  contactPhone: row.contact_phone,
  note: row.note,
  status: row.status,
  rejectionReason: row.rejection_reason,
  rejectionNote: row.rejection_note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapReservationEvent = (row: ReservationEventRow): ReservationStatusEvent => ({
  id: row.id,
  reservationId: row.reservation_id,
  fromStatus: row.from_status,
  toStatus: row.to_status,
  changedBy: row.changed_by,
  reason: row.reason,
  createdAt: row.created_at,
});

export const mapNotification = (row: NotificationRow): AppNotification => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  body: row.body,
  data: row.data ?? {},
  readAt: row.read_at,
  createdAt: row.created_at,
});

export const mapHelpArticle = (row: HelpArticleRow): HelpArticle => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  summary: row.summary,
  body: row.body,
  category: row.category,
  isPublic: row.is_public,
  sortOrder: row.sort_order,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  seoCanonical: row.seo_canonical,
  ogImageUrl: row.og_image_url,
  isIndexable: row.is_indexable,
});

export const mapSeoRedirect = (row: SeoRedirectRow): SeoRedirect => ({
  id: row.id,
  fromPath: row.from_path,
  toPath: row.to_path,
  statusCode: row.status_code as 301 | 302 | 410,
  isActive: row.is_active,
  createdAt: row.created_at,
});

export const mapAdminLog = (row: AdminLogRow): AdminLogEntry => ({
  id: row.id,
  actorId: row.actor_id,
  actorName: row.actor_name,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  before: row.before,
  after: row.after,
  createdAt: row.created_at,
});

/** İlişkili tabloları da getiren SELECT ifadeleri. */
export const SELECT = {
  package: `*, package_items(*), package_images(*), package_availability(*), package_preferences(preference_key)`,
  branch: `*, branch_hours(*)`,
  plan: `*, plan_categories(category_id), plan_preferences(preference_key)`,
} as const;
