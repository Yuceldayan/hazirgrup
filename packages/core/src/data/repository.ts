import type {
  AdminLogEntry,
  AdminOverviewStats,
  AppNotification,
  AppRole,
  ApplicationStatus,
  Business,
  BusinessApplication,
  BusinessBranch,
  BusinessDashboardStats,
  BusinessMember,
  BusinessReservationRow,
  Category,
  City,
  Country,
  District,
  Favorite,
  HelpArticle,
  Id,
  IsoDate,
  ParticipationStatus,
  Plan,
  PlanInvitation,
  PlanParticipant,
  PlanStatus,
  Preference,
  Profile,
  PublicBusiness,
  PublicCategorySummary,
  PublicCitySummary,
  PublicDistrictSummary,
  PublicPackage,
  RejectionReason,
  Reservation,
  ReservationStatus,
  ReservationStatusEvent,
  SeoRedirect,
  SessionUser,
  VenuePackage,
  Vote,
} from '@hazirgrup/types';

/**
 * Veri erişim arayüzü.
 *
 * İki uygulaması vardır (docs/DECISIONS.md D-004):
 *  - `DemoRepository`   — bellek içi, seed verisiyle dolu (anahtar gerekmez)
 *  - `SupabaseRepository` — gerçek PostgreSQL + RLS
 *
 * Uygulama katmanı hangisini kullandığını bilmez.
 */

// ---------------------------------------------------------------------------
// Girdi tipleri
// ---------------------------------------------------------------------------

export interface CreatePlanInput {
  ownerId: Id;
  ownerDisplayName: string;
  name: string;
  cityId: Id;
  districtId: Id | null;
  eventDate: IsoDate;
  startTime: string | null;
  endTime: string | null;
  isTimeFlexible: boolean;
  estimatedPeople: number;
  minPeople: number;
  maxPeople: number;
  budgetMode: 'per_person' | 'total';
  budgetPerPerson: number | null;
  budgetTotal: number | null;
  note: string | null;
  categoryIds: Id[];
  preferenceKeys: string[];
  status: PlanStatus;
}

export type UpdatePlanInput = Partial<Omit<CreatePlanInput, 'ownerId' | 'ownerDisplayName'>> & {
  votingStartsAt?: string | null;
  votingEndsAt?: string | null;
  winningPackageId?: Id | null;
  cancelledReason?: string | null;
};

export interface CreateReservationInput {
  planId: Id;
  packageId: Id;
  branchId: Id;
  businessId: Id;
  createdBy: Id;
  peopleCount: number;
  reservedDate: IsoDate;
  reservedStartTime: string | null;
  reservedEndTime: string | null;
  totalPrice: number;
  perPersonPrice: number;
  contactName: string;
  contactPhone: string;
  note: string | null;
}

export interface UpsertPackageInput {
  id?: Id;
  businessId: Id;
  branchId: Id;
  categoryId: Id;
  name: string;
  description: string;
  minPeople: number;
  maxPeople: number;
  pricingModel: 'per_person' | 'total';
  priceAmount: number;
  durationMinutes: number | null;
  reservationTerms: string | null;
  cancellationTerms: string | null;
  isActive: boolean;
  isPublic: boolean;
  items: string[];
  availability: Array<{ weekday: number; startTime: string; endTime: string }>;
  preferenceKeys: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  isIndexable?: boolean;
}

export interface UpsertBranchInput {
  id?: Id;
  businessId: Id;
  name: string;
  cityId: Id;
  districtId: Id;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  isActive: boolean;
  hours: Array<{ weekday: number; opensAt: string | null; closesAt: string | null; isClosed: boolean }>;
}

export interface CreateApplicationInput {
  applicantId: Id;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  cityId: Id;
  districtId: Id;
  categoryId: Id;
  taxInfo: string | null;
  instagram: string | null;
  website: string | null;
}

export interface SeoUpdateInput {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoCanonical?: string | null;
  ogImageUrl?: string | null;
  isIndexable?: boolean;
  slug?: string;
}

export interface PublicPackageFilter {
  citySlug?: string;
  districtSlug?: string;
  categorySlug?: string;
  businessSlug?: string;
  minPeople?: number;
  limit?: number;
}

export interface AuthResult {
  user: SessionUser;
}

// ---------------------------------------------------------------------------
// Arayüz
// ---------------------------------------------------------------------------

export interface Repository {
  readonly mode: 'demo' | 'supabase';

  // --- Kimlik -------------------------------------------------------------
  signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthResult>;
  signIn(input: { email: string; password: string }): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<{ resetToken: string | null }>;
  resetPassword(input: { token: string; password: string }): Promise<void>;
  getSessionUser(userId: Id): Promise<SessionUser | null>;
  getProfile(userId: Id): Promise<Profile | null>;
  updateProfile(userId: Id, patch: Partial<Profile>): Promise<Profile>;
  deleteAccount(userId: Id, nowIso: string): Promise<void>;
  getUserRoles(userId: Id): Promise<AppRole[]>;
  listUsers(): Promise<Profile[]>;
  setUserSuspended(userId: Id, suspended: boolean, actorId: Id): Promise<void>;

  // --- Konum ve sınıflandırma ---------------------------------------------
  listCountries(): Promise<Country[]>;
  listCities(options?: { onlyActive?: boolean }): Promise<City[]>;
  getCityBySlug(slug: string): Promise<City | null>;
  listDistricts(cityId: Id, options?: { onlyActive?: boolean }): Promise<District[]>;
  getDistrictBySlug(cityId: Id, slug: string): Promise<District | null>;
  listCategories(options?: { onlyActive?: boolean }): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  listPreferences(): Promise<Preference[]>;
  upsertCity(city: Partial<City> & { name: string }, actorId: Id): Promise<City>;
  upsertDistrict(district: Partial<District> & { name: string; cityId: Id }, actorId: Id): Promise<District>;
  upsertCategory(category: Partial<Category> & { name: string }, actorId: Id): Promise<Category>;

  // --- İşletme ------------------------------------------------------------
  listBusinesses(options?: { status?: string }): Promise<Business[]>;
  getBusiness(id: Id): Promise<Business | null>;
  getBusinessBySlug(slug: string): Promise<Business | null>;
  listBranches(businessId: Id): Promise<BusinessBranch[]>;
  upsertBranch(input: UpsertBranchInput, actorId: Id): Promise<BusinessBranch>;
  listBusinessMembers(businessId: Id): Promise<BusinessMember[]>;
  addBusinessMember(businessId: Id, userEmail: string, actorId: Id): Promise<BusinessMember>;
  removeBusinessMember(businessId: Id, userId: Id, actorId: Id): Promise<void>;
  getBusinessesForUser(userId: Id): Promise<Business[]>;
  updateBusiness(id: Id, patch: Partial<Business>, actorId: Id): Promise<Business>;

  // --- Başvuru ------------------------------------------------------------
  createApplication(input: CreateApplicationInput, nowIso: string): Promise<BusinessApplication>;
  listApplications(status?: ApplicationStatus): Promise<BusinessApplication[]>;
  getApplication(id: Id): Promise<BusinessApplication | null>;
  reviewApplication(
    id: Id,
    decision: { status: 'approved' | 'rejected'; note: string | null; reviewerId: Id },
    nowIso: string,
  ): Promise<BusinessApplication>;

  // --- Paket --------------------------------------------------------------
  listPackages(options?: { businessId?: Id; onlyActive?: boolean }): Promise<VenuePackage[]>;
  getPackage(id: Id): Promise<VenuePackage | null>;
  getPackageBySlug(slug: string): Promise<VenuePackage | null>;
  upsertPackage(input: UpsertPackageInput, actorId: Id, nowIso: string): Promise<VenuePackage>;
  setPackageActive(id: Id, isActive: boolean, actorId: Id): Promise<void>;
  deletePackage(id: Id, actorId: Id): Promise<void>;
  updatePackageSeo(id: Id, seo: SeoUpdateInput, actorId: Id): Promise<VenuePackage>;

  // --- Public projeksiyonlar ----------------------------------------------
  getPublicBusiness(slug: string): Promise<PublicBusiness | null>;
  getPublicPackage(slug: string): Promise<PublicPackage | null>;
  listPublicPackages(filter: PublicPackageFilter): Promise<PublicPackage[]>;
  getPublicCitySummary(slug: string): Promise<PublicCitySummary | null>;
  getPublicDistrictSummary(
    citySlug: string,
    districtSlug: string,
  ): Promise<PublicDistrictSummary | null>;
  getPublicCategorySummary(slug: string): Promise<PublicCategorySummary | null>;
  listPublicBusinesses(filter?: {
    citySlug?: string;
    districtSlug?: string;
    categorySlug?: string;
    limit?: number;
  }): Promise<PublicBusiness[]>;

  // --- Plan ---------------------------------------------------------------
  createPlan(input: CreatePlanInput, nowIso: string): Promise<Plan>;
  updatePlan(id: Id, patch: UpdatePlanInput, nowIso: string): Promise<Plan>;
  getPlan(id: Id): Promise<Plan | null>;
  listPlansForUser(userId: Id): Promise<Plan[]>;
  setPlanStatus(id: Id, status: PlanStatus, nowIso: string, reason?: string | null): Promise<Plan>;
  deletePlan(id: Id): Promise<void>;

  // --- Katılımcı ----------------------------------------------------------
  listParticipants(planId: Id): Promise<PlanParticipant[]>;
  addParticipant(input: {
    planId: Id;
    userId: Id | null;
    guestTokenHash: string | null;
    displayName: string;
    status: ParticipationStatus;
    isOwner: boolean;
    nowIso: string;
  }): Promise<PlanParticipant>;
  updateParticipantStatus(participantId: Id, status: ParticipationStatus): Promise<PlanParticipant>;
  removeParticipant(participantId: Id): Promise<void>;
  findParticipantByUser(planId: Id, userId: Id): Promise<PlanParticipant | null>;
  findParticipantByGuestHash(planId: Id, guestTokenHash: string): Promise<PlanParticipant | null>;

  // --- Davet --------------------------------------------------------------
  createInvitation(input: {
    planId: Id;
    tokenHash: string;
    shortCode: string;
    createdBy: Id;
    expiresAt: string | null;
    nowIso: string;
  }): Promise<PlanInvitation>;
  getInvitationByTokenHash(tokenHash: string): Promise<PlanInvitation | null>;
  getInvitationByShortCode(shortCode: string): Promise<PlanInvitation | null>;
  getActiveInvitation(planId: Id): Promise<PlanInvitation | null>;
  revokeInvitation(id: Id, nowIso: string): Promise<void>;
  incrementInvitationUse(id: Id): Promise<void>;

  // --- Oylama -------------------------------------------------------------
  listVotes(planId: Id): Promise<Vote[]>;
  castVote(input: {
    planId: Id;
    participantId: Id;
    packageId: Id;
    nowIso: string;
  }): Promise<Vote>;
  removeVote(planId: Id, participantId: Id): Promise<void>;

  // --- Rezervasyon --------------------------------------------------------
  createReservation(
    input: CreateReservationInput,
    code: string,
    nowIso: string,
  ): Promise<Reservation>;
  getReservation(id: Id): Promise<Reservation | null>;
  getReservationByCode(code: string): Promise<Reservation | null>;
  listReservationsForUser(userId: Id): Promise<Reservation[]>;
  listReservationsForBusiness(
    businessId: Id,
    status?: ReservationStatus,
  ): Promise<BusinessReservationRow[]>;
  listReservationsForPlan(planId: Id): Promise<Reservation[]>;
  changeReservationStatus(input: {
    id: Id;
    status: ReservationStatus;
    actorId: Id;
    reason?: string | null;
    rejectionReason?: RejectionReason | null;
    nowIso: string;
  }): Promise<Reservation>;
  listReservationHistory(reservationId: Id): Promise<ReservationStatusEvent[]>;

  // --- Bildirim ve favori -------------------------------------------------
  listNotifications(userId: Id): Promise<AppNotification[]>;
  createNotification(input: Omit<AppNotification, 'id'>): Promise<AppNotification>;
  markNotificationRead(id: Id, nowIso: string): Promise<void>;
  markAllNotificationsRead(userId: Id, nowIso: string): Promise<void>;
  listFavorites(userId: Id): Promise<Favorite[]>;
  toggleFavorite(userId: Id, packageId: Id, nowIso: string): Promise<boolean>;

  // --- İçerik ve SEO ------------------------------------------------------
  listHelpArticles(options?: { onlyPublic?: boolean }): Promise<HelpArticle[]>;
  getHelpArticle(slug: string): Promise<HelpArticle | null>;
  listSeoRedirects(): Promise<SeoRedirect[]>;
  findRedirect(fromPath: string): Promise<SeoRedirect | null>;

  // --- Yönetim ------------------------------------------------------------
  getAdminOverview(): Promise<AdminOverviewStats>;
  getBusinessDashboard(businessId: Id, todayIso: IsoDate): Promise<BusinessDashboardStats>;
  listAdminLogs(limit?: number): Promise<AdminLogEntry[]>;
  writeAdminLog(entry: Omit<AdminLogEntry, 'id'>): Promise<void>;

  // --- Hız sınırı ---------------------------------------------------------
  incrementRateLimit(key: string, windowStartMs: number, windowMs: number): Promise<number>;
  resetRateLimit(key: string): Promise<void>;
}
