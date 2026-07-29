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
  Weekday,
} from '@hazirgrup/types';
import { AppError } from '../../errors/AppError';
import { slugify, uniqueSlug } from '../../text/slug';
import { assertReservationTransition } from '../../status/reservation';
import { buildDataset, type DemoDataset } from '../../seed/dataset';
import { toBase64Url, randomBytes } from '../../crypto/index';
import { toPublicBusiness, toPublicPackage } from '../projections';
import type {
  AuthResult,
  CreateApplicationInput,
  CreatePlanInput,
  CreateReservationInput,
  PublicPackageFilter,
  Repository,
  SeoUpdateInput,
  UpdatePlanInput,
  UpsertBranchInput,
  UpsertPackageInput,
} from '../repository';

/**
 * Bellek içi veri kaynağı.
 *
 * Supabase yapılandırılmadığında devreye girer; seed verisiyle doludur ve tüm
 * akışlar (plan → davet → oy → rezervasyon) eksiksiz çalışır.
 * Veriler süreç ömrüyle sınırlıdır (docs/KNOWN_LIMITATIONS.md L-01).
 */

interface DemoCredential {
  userId: Id;
  email: string;
  password: string;
}

export class DemoRepository implements Repository {
  readonly mode = 'demo' as const;

  private data: DemoDataset;
  private credentials: DemoCredential[];
  private roles = new Map<Id, AppRole[]>();
  private resetTokens = new Map<string, { userId: Id; expiresAtMs: number }>();
  private rateCounters = new Map<string, { windowStart: number; count: number }>();
  private sequence = 0;

  constructor(referenceDate: IsoDate) {
    this.data = buildDataset(referenceDate);
    this.credentials = this.data.users.map((u) => ({
      userId: u.profile.id,
      email: u.profile.email.toLowerCase(),
      password: u.password,
    }));
    for (const user of this.data.users) {
      this.roles.set(user.profile.id, [...user.roles]);
    }
  }

  /** Test yardımı: veriyi başlangıç durumuna döndürür. */
  reset(referenceDate: IsoDate): void {
    this.data = buildDataset(referenceDate);
    this.credentials = this.data.users.map((u) => ({
      userId: u.profile.id,
      email: u.profile.email.toLowerCase(),
      password: u.password,
    }));
    this.roles.clear();
    for (const user of this.data.users) {
      this.roles.set(user.profile.id, [...user.roles]);
    }
    this.resetTokens.clear();
    this.rateCounters.clear();
    this.sequence = 0;
  }

  /** Demo modda dokümantasyon için davet tokenlarını açar. */
  getDemoInviteTokens(): Record<string, string> {
    return { ...this.data.inviteTokens };
  }

  private nextId(prefix: string): Id {
    this.sequence += 1;
    return `${prefix}-${String(this.sequence).padStart(4, '0')}-${toBase64Url(randomBytes(4))}`;
  }

  private profileOf(userId: Id): Profile {
    const user = this.data.users.find((u) => u.profile.id === userId);
    if (!user) throw AppError.notFound('kullanıcı');
    return user.profile;
  }

  // =========================================================================
  // Kimlik
  // =========================================================================

  async signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    if (this.credentials.some((c) => c.email === email)) {
      throw AppError.conflict('Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyebilirsin.');
    }

    const id = this.nextId('user');
    const now = new Date(Date.now()).toISOString();
    const profile: Profile = {
      id,
      displayName: input.displayName.trim(),
      email,
      phone: null,
      avatarUrl: null,
      cityId: null,
      districtId: null,
      theme: 'system',
      locale: 'tr',
      isSuspended: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.data.users.push({ profile, roles: ['user'], password: input.password });
    this.credentials.push({ userId: id, email, password: input.password });
    this.roles.set(id, ['user']);

    return { user: this.toSessionUser(profile) };
  }

  async signIn(input: { email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const credential = this.credentials.find((c) => c.email === email);

    // Kullanıcı numaralandırmasını engellemek için mesaj her iki durumda da aynı.
    if (!credential || credential.password !== input.password) {
      throw new AppError('unauthorized', 'Geçersiz kimlik bilgisi', {
        userMessage: 'E-posta veya şifre hatalı.',
      });
    }

    const profile = this.profileOf(credential.userId);
    if (profile.isSuspended) {
      throw AppError.forbidden('Hesabın askıya alınmış. Destek ile iletişime geçebilirsin.');
    }
    if (profile.deletedAt) {
      throw AppError.forbidden('Bu hesap silinmiş.');
    }

    return { user: this.toSessionUser(profile) };
  }

  async requestPasswordReset(email: string): Promise<{ resetToken: string | null }> {
    const credential = this.credentials.find((c) => c.email === email.trim().toLowerCase());
    // Kullanıcı numaralandırmasını engelle: kayıt yoksa da başarılı görün.
    if (!credential) return { resetToken: null };

    const token = toBase64Url(randomBytes(24));
    this.resetTokens.set(token, {
      userId: credential.userId,
      expiresAtMs: Date.now() + 60 * 60_000,
    });
    return { resetToken: token };
  }

  async resetPassword(input: { token: string; password: string }): Promise<void> {
    const entry = this.resetTokens.get(input.token);
    if (!entry || entry.expiresAtMs < Date.now()) {
      throw AppError.validation(
        {},
        'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyebilirsin.',
      );
    }
    const credential = this.credentials.find((c) => c.userId === entry.userId);
    if (credential) credential.password = input.password;
    this.resetTokens.delete(input.token);
  }

  private toSessionUser(profile: Profile): SessionUser {
    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      roles: this.roles.get(profile.id) ?? ['user'],
      cityId: profile.cityId,
      districtId: profile.districtId,
      theme: profile.theme,
    };
  }

  async getSessionUser(userId: Id): Promise<SessionUser | null> {
    const user = this.data.users.find((u) => u.profile.id === userId);
    if (!user || user.profile.deletedAt) return null;
    return this.toSessionUser(user.profile);
  }

  async getProfile(userId: Id): Promise<Profile | null> {
    return this.data.users.find((u) => u.profile.id === userId)?.profile ?? null;
  }

  async updateProfile(userId: Id, patch: Partial<Profile>): Promise<Profile> {
    const user = this.data.users.find((u) => u.profile.id === userId);
    if (!user) throw AppError.notFound('kullanıcı');
    user.profile = {
      ...user.profile,
      ...patch,
      id: user.profile.id,
      email: user.profile.email,
      updatedAt: new Date(Date.now()).toISOString(),
    };
    return user.profile;
  }

  async deleteAccount(userId: Id, nowIso: string): Promise<void> {
    const user = this.data.users.find((u) => u.profile.id === userId);
    if (!user) throw AppError.notFound('kullanıcı');
    user.profile.deletedAt = nowIso;
    user.profile.displayName = 'Silinmiş kullanıcı';
    user.profile.phone = null;
    // Katılımcı kayıtları anonimleştirilir; oy bütünlüğü korunur.
    for (const participant of this.data.participants) {
      if (participant.userId === userId) participant.displayName = 'Silinmiş kullanıcı';
    }
    this.credentials = this.credentials.filter((c) => c.userId !== userId);
  }

  async getUserRoles(userId: Id): Promise<AppRole[]> {
    return this.roles.get(userId) ?? [];
  }

  async listUsers(): Promise<Profile[]> {
    return this.data.users.map((u) => u.profile).filter((p) => !p.deletedAt);
  }

  async setUserSuspended(userId: Id, suspended: boolean, actorId: Id): Promise<void> {
    const user = this.data.users.find((u) => u.profile.id === userId);
    if (!user) throw AppError.notFound('kullanıcı');
    const before = { isSuspended: user.profile.isSuspended };
    user.profile.isSuspended = suspended;
    await this.writeAdminLog({
      actorId,
      actorName: this.profileOf(actorId).displayName,
      action: suspended ? 'user.suspend' : 'user.unsuspend',
      entityType: 'user',
      entityId: userId,
      before,
      after: { isSuspended: suspended },
      createdAt: new Date(Date.now()).toISOString(),
    });
  }

  // =========================================================================
  // Konum ve sınıflandırma
  // =========================================================================

  async listCountries(): Promise<Country[]> {
    return [...this.data.countries];
  }

  async listCities(options?: { onlyActive?: boolean }): Promise<City[]> {
    const cities = options?.onlyActive
      ? this.data.cities.filter((c) => c.isActive && c.isPublic)
      : this.data.cities;
    return [...cities].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCityBySlug(slug: string): Promise<City | null> {
    return this.data.cities.find((c) => c.slug === slug) ?? null;
  }

  async listDistricts(cityId: Id, options?: { onlyActive?: boolean }): Promise<District[]> {
    return this.data.districts
      .filter((d) => d.cityId === cityId && (!options?.onlyActive || (d.isActive && d.isPublic)))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getDistrictBySlug(cityId: Id, slug: string): Promise<District | null> {
    return this.data.districts.find((d) => d.cityId === cityId && d.slug === slug) ?? null;
  }

  async listCategories(options?: { onlyActive?: boolean }): Promise<Category[]> {
    return this.data.categories
      .filter((c) => !options?.onlyActive || c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.data.categories.find((c) => c.slug === slug) ?? null;
  }

  async listPreferences(): Promise<Preference[]> {
    return [...this.data.preferences].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async upsertCity(input: Partial<City> & { name: string }, actorId: Id): Promise<City> {
    const existing = input.id ? this.data.cities.find((c) => c.id === input.id) : undefined;
    if (existing) {
      const before = { ...existing };
      Object.assign(existing, input);
      await this.logChange(actorId, 'city.update', 'city', existing.id, before, { ...existing });
      return existing;
    }

    const city: City = {
      id: this.nextId('city'),
      countryId: input.countryId ?? 'country-tr',
      name: input.name,
      slug: input.slug ?? uniqueSlug(input.name, this.data.cities.map((c) => c.slug)),
      intro: input.intro ?? null,
      isActive: input.isActive ?? false,
      isPublic: input.isPublic ?? false,
      sortOrder: input.sortOrder ?? this.data.cities.length + 1,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoCanonical: input.seoCanonical ?? null,
      ogImageUrl: input.ogImageUrl ?? null,
      isIndexable: input.isIndexable ?? true,
    };
    this.data.cities.push(city);
    await this.logChange(actorId, 'city.create', 'city', city.id, null, { ...city });
    return city;
  }

  async upsertDistrict(
    input: Partial<District> & { name: string; cityId: Id },
    actorId: Id,
  ): Promise<District> {
    const existing = input.id ? this.data.districts.find((d) => d.id === input.id) : undefined;
    if (existing) {
      const before = { ...existing };
      Object.assign(existing, input);
      await this.logChange(actorId, 'district.update', 'district', existing.id, before, {
        ...existing,
      });
      return existing;
    }

    const siblings = this.data.districts.filter((d) => d.cityId === input.cityId);
    const district: District = {
      id: this.nextId('district'),
      cityId: input.cityId,
      name: input.name,
      slug: input.slug ?? uniqueSlug(input.name, siblings.map((d) => d.slug)),
      intro: input.intro ?? null,
      isActive: input.isActive ?? true,
      isPublic: input.isPublic ?? true,
      sortOrder: input.sortOrder ?? siblings.length + 1,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoCanonical: input.seoCanonical ?? null,
      ogImageUrl: input.ogImageUrl ?? null,
      isIndexable: input.isIndexable ?? true,
    };
    this.data.districts.push(district);
    await this.logChange(actorId, 'district.create', 'district', district.id, null, { ...district });
    return district;
  }

  async upsertCategory(input: Partial<Category> & { name: string }, actorId: Id): Promise<Category> {
    const existing = input.id ? this.data.categories.find((c) => c.id === input.id) : undefined;
    if (existing) {
      const before = { ...existing };
      Object.assign(existing, input);
      await this.logChange(actorId, 'category.update', 'category', existing.id, before, {
        ...existing,
      });
      return existing;
    }

    const category: Category = {
      id: this.nextId('cat'),
      key: input.key ?? slugify(input.name).replace(/-/g, '_'),
      name: input.name,
      slug: input.slug ?? uniqueSlug(input.name, this.data.categories.map((c) => c.slug)),
      icon: input.icon ?? 'tag',
      description: input.description ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? this.data.categories.length + 1,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoCanonical: input.seoCanonical ?? null,
      ogImageUrl: input.ogImageUrl ?? null,
      isIndexable: input.isIndexable ?? true,
    };
    this.data.categories.push(category);
    await this.logChange(actorId, 'category.create', 'category', category.id, null, { ...category });
    return category;
  }

  // =========================================================================
  // İşletme
  // =========================================================================

  async listBusinesses(options?: { status?: string }): Promise<Business[]> {
    return this.data.businesses.filter((b) => !options?.status || b.status === options.status);
  }

  async getBusiness(id: Id): Promise<Business | null> {
    return this.data.businesses.find((b) => b.id === id) ?? null;
  }

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    return this.data.businesses.find((b) => b.slug === slug) ?? null;
  }

  async listBranches(businessId: Id): Promise<BusinessBranch[]> {
    return this.data.branches.filter((b) => b.businessId === businessId);
  }

  async upsertBranch(input: UpsertBranchInput, actorId: Id): Promise<BusinessBranch> {
    const hours = input.hours.map((h) => ({
      weekday: h.weekday as Weekday,
      opensAt: h.opensAt,
      closesAt: h.closesAt,
      isClosed: h.isClosed,
    }));

    const existing = input.id ? this.data.branches.find((b) => b.id === input.id) : undefined;
    if (existing) {
      const before = { ...existing };
      Object.assign(existing, {
        name: input.name,
        cityId: input.cityId,
        districtId: input.districtId,
        address: input.address,
        phone: input.phone,
        whatsapp: input.whatsapp,
        isActive: input.isActive,
        hours,
      });
      await this.logChange(actorId, 'branch.update', 'branch', existing.id, before, { ...existing });
      return existing;
    }

    const siblings = this.data.branches.filter((b) => b.businessId === input.businessId);
    const branch: BusinessBranch = {
      id: this.nextId('branch'),
      businessId: input.businessId,
      name: input.name,
      slug: uniqueSlug(input.name, siblings.map((b) => b.slug)),
      cityId: input.cityId,
      districtId: input.districtId,
      address: input.address,
      lat: null,
      lng: null,
      phone: input.phone,
      whatsapp: input.whatsapp,
      isActive: input.isActive,
      hours,
      createdAt: new Date(Date.now()).toISOString(),
    };
    this.data.branches.push(branch);
    await this.logChange(actorId, 'branch.create', 'branch', branch.id, null, { ...branch });
    return branch;
  }

  async listBusinessMembers(businessId: Id): Promise<BusinessMember[]> {
    return this.data.businessMembers.filter((m) => m.businessId === businessId);
  }

  async addBusinessMember(businessId: Id, userEmail: string, actorId: Id): Promise<BusinessMember> {
    const target = this.data.users.find(
      (u) => u.profile.email.toLowerCase() === userEmail.trim().toLowerCase(),
    );
    if (!target) {
      throw AppError.notFound(
        'kullanıcı',
        'Bu e-posta ile kayıtlı bir kullanıcı bulunamadı. Önce kayıt olmasını isteyebilirsin.',
      );
    }
    if (this.data.businessMembers.some((m) => m.businessId === businessId && m.userId === target.profile.id)) {
      throw AppError.conflict('Bu kişi zaten ekibinde.');
    }

    const member: BusinessMember = {
      businessId,
      userId: target.profile.id,
      role: 'staff',
      invitedBy: actorId,
      createdAt: new Date(Date.now()).toISOString(),
    };
    this.data.businessMembers.push(member);

    const roles = this.roles.get(target.profile.id) ?? ['user'];
    if (!roles.includes('business_staff')) {
      this.roles.set(target.profile.id, [...roles, 'business_staff']);
    }
    return member;
  }

  async removeBusinessMember(businessId: Id, userId: Id, _actorId: Id): Promise<void> {
    const index = this.data.businessMembers.findIndex(
      (m) => m.businessId === businessId && m.userId === userId && m.role !== 'owner',
    );
    if (index < 0) {
      throw AppError.conflict('İşletme sahibi ekipten çıkarılamaz.');
    }
    this.data.businessMembers.splice(index, 1);
  }

  async getBusinessesForUser(userId: Id): Promise<Business[]> {
    const businessIds = new Set(
      this.data.businessMembers.filter((m) => m.userId === userId).map((m) => m.businessId),
    );
    return this.data.businesses.filter((b) => businessIds.has(b.id));
  }

  async updateBusiness(id: Id, patch: Partial<Business>, actorId: Id): Promise<Business> {
    const business = this.data.businesses.find((b) => b.id === id);
    if (!business) throw AppError.notFound('işletme');
    const before = { ...business };
    Object.assign(business, patch, {
      id: business.id,
      updatedAt: new Date(Date.now()).toISOString(),
    });
    await this.logChange(actorId, 'business.update', 'business', id, before, { ...business });
    return business;
  }

  // =========================================================================
  // Başvuru
  // =========================================================================

  async createApplication(
    input: CreateApplicationInput,
    nowIso: string,
  ): Promise<BusinessApplication> {
    const application: BusinessApplication = {
      id: this.nextId('application'),
      ...input,
      logoUrl: null,
      status: 'pending',
      reviewNote: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: nowIso,
    };
    this.data.businessApplications.push(application);
    return application;
  }

  async listApplications(status?: ApplicationStatus): Promise<BusinessApplication[]> {
    return this.data.businessApplications
      .filter((a) => !status || a.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getApplication(id: Id): Promise<BusinessApplication | null> {
    return this.data.businessApplications.find((a) => a.id === id) ?? null;
  }

  async reviewApplication(
    id: Id,
    decision: { status: 'approved' | 'rejected'; note: string | null; reviewerId: Id },
    nowIso: string,
  ): Promise<BusinessApplication> {
    const application = this.data.businessApplications.find((a) => a.id === id);
    if (!application) throw AppError.notFound('başvuru');
    if (application.status !== 'pending') {
      throw AppError.conflict('Bu başvuru daha önce sonuçlandırılmış.');
    }

    application.status = decision.status;
    application.reviewNote = decision.note;
    application.reviewedBy = decision.reviewerId;
    application.reviewedAt = nowIso;

    if (decision.status === 'approved') {
      const business: Business = {
        id: this.nextId('biz'),
        ownerId: application.applicantId,
        name: application.businessName,
        slug: uniqueSlug(application.businessName, this.data.businesses.map((b) => b.slug)),
        description: `${application.businessName} — ${application.address}`,
        categoryId: application.categoryId,
        status: 'verified',
        isPublic: true,
        logoUrl: application.logoUrl,
        coverUrl: null,
        phone: application.phone,
        whatsapp: application.phone,
        website: application.website,
        instagram: application.instagram,
        verifiedAt: nowIso,
        verifiedBy: decision.reviewerId,
        createdAt: nowIso,
        updatedAt: nowIso,
        seoTitle: null,
        seoDescription: null,
        seoCanonical: null,
        ogImageUrl: null,
        isIndexable: true,
      };
      this.data.businesses.push(business);
      this.data.businessMembers.push({
        businessId: business.id,
        userId: application.applicantId,
        role: 'owner',
        invitedBy: null,
        createdAt: nowIso,
      });

      const roles = this.roles.get(application.applicantId) ?? ['user'];
      if (!roles.includes('business_owner')) {
        this.roles.set(application.applicantId, [...roles, 'business_owner']);
      }

      // İlk şube başvuru adresinden otomatik oluşturulur.
      this.data.branches.push({
        id: this.nextId('branch'),
        businessId: business.id,
        name: 'Merkez Şube',
        slug: 'merkez-sube',
        cityId: application.cityId,
        districtId: application.districtId,
        address: application.address,
        lat: null,
        lng: null,
        phone: application.phone,
        whatsapp: application.phone,
        isActive: true,
        hours: ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => ({
          weekday,
          opensAt: '10:00',
          closesAt: '23:00',
          isClosed: false,
        })),
        createdAt: nowIso,
      });
    }

    await this.logChange(
      decision.reviewerId,
      decision.status === 'approved' ? 'application.approve' : 'application.reject',
      'business_application',
      id,
      { status: 'pending' },
      { status: decision.status },
    );

    return application;
  }

  // =========================================================================
  // Paket
  // =========================================================================

  async listPackages(options?: { businessId?: Id; onlyActive?: boolean }): Promise<VenuePackage[]> {
    return this.data.packages.filter(
      (p) =>
        (!options?.businessId || p.businessId === options.businessId) &&
        (!options?.onlyActive || p.isActive),
    );
  }

  async getPackage(id: Id): Promise<VenuePackage | null> {
    return this.data.packages.find((p) => p.id === id) ?? null;
  }

  async getPackageBySlug(slug: string): Promise<VenuePackage | null> {
    return this.data.packages.find((p) => p.slug === slug) ?? null;
  }

  async upsertPackage(
    input: UpsertPackageInput,
    actorId: Id,
    nowIso: string,
  ): Promise<VenuePackage> {
    const availability = input.availability.map((a) => ({
      weekday: a.weekday as Weekday,
      startTime: a.startTime,
      endTime: a.endTime,
    }));

    const existing = input.id ? this.data.packages.find((p) => p.id === input.id) : undefined;

    if (existing) {
      const before = { ...existing };
      Object.assign(existing, {
        branchId: input.branchId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        minPeople: input.minPeople,
        maxPeople: input.maxPeople,
        pricingModel: input.pricingModel,
        priceAmount: input.priceAmount,
        durationMinutes: input.durationMinutes,
        reservationTerms: input.reservationTerms,
        cancellationTerms: input.cancellationTerms,
        isActive: input.isActive,
        isPublic: input.isPublic,
        availability,
        preferenceKeys: input.preferenceKeys,
        items: input.items.map((label, index) => ({
          id: `${existing.id}-item-${index + 1}`,
          label,
          detail: null,
          sortOrder: index + 1,
        })),
        updatedAt: nowIso,
      });
      await this.logChange(actorId, 'package.update', 'package', existing.id, before, {
        ...existing,
      });
      return existing;
    }

    const business = this.data.businesses.find((b) => b.id === input.businessId);
    const id = this.nextId('pkg');
    const pkg: VenuePackage = {
      id,
      businessId: input.businessId,
      branchId: input.branchId,
      categoryId: input.categoryId,
      name: input.name,
      slug: uniqueSlug(
        `${business?.slug ?? 'mekan'}-${input.name}`,
        this.data.packages.map((p) => p.slug),
      ),
      description: input.description,
      minPeople: input.minPeople,
      maxPeople: input.maxPeople,
      pricingModel: input.pricingModel,
      priceAmount: input.priceAmount,
      durationMinutes: input.durationMinutes,
      reservationTerms: input.reservationTerms,
      cancellationTerms: input.cancellationTerms,
      isActive: input.isActive,
      isPublic: input.isPublic,
      popularity: 0,
      items: input.items.map((label, index) => ({
        id: `${id}-item-${index + 1}`,
        label,
        detail: null,
        sortOrder: index + 1,
      })),
      images: [{ id: `${id}-img-1`, url: '/media/cafe-1.svg', alt: input.name, width: 1200, height: 800, sortOrder: 1 }],
      availability,
      preferenceKeys: input.preferenceKeys,
      createdAt: nowIso,
      updatedAt: nowIso,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoCanonical: null,
      ogImageUrl: null,
      isIndexable: input.isIndexable ?? true,
    };
    this.data.packages.push(pkg);
    await this.logChange(actorId, 'package.create', 'package', id, null, { ...pkg });
    return pkg;
  }

  async setPackageActive(id: Id, isActive: boolean, actorId: Id): Promise<void> {
    const pkg = this.data.packages.find((p) => p.id === id);
    if (!pkg) throw AppError.notFound('paket');
    const before = { isActive: pkg.isActive };
    pkg.isActive = isActive;
    pkg.updatedAt = new Date(Date.now()).toISOString();
    await this.logChange(
      actorId,
      isActive ? 'package.activate' : 'package.deactivate',
      'package',
      id,
      before,
      { isActive },
    );
  }

  async deletePackage(id: Id, actorId: Id): Promise<void> {
    const index = this.data.packages.findIndex((p) => p.id === id);
    if (index < 0) throw AppError.notFound('paket');
    const [removed] = this.data.packages.splice(index, 1);
    if (removed) {
      // Kalıcı silmede SEO için 410 kaydı bırakılır.
      this.data.seoRedirects.push({
        id: this.nextId('redirect'),
        fromPath: `/paketler/${removed.slug}`,
        toPath: '',
        statusCode: 410,
        isActive: true,
        createdAt: new Date(Date.now()).toISOString(),
      });
      await this.logChange(actorId, 'package.delete', 'package', id, { ...removed }, null);
    }
  }

  async updatePackageSeo(id: Id, seo: SeoUpdateInput, actorId: Id): Promise<VenuePackage> {
    const pkg = this.data.packages.find((p) => p.id === id);
    if (!pkg) throw AppError.notFound('paket');
    const before = { ...pkg };

    if (seo.slug && seo.slug !== pkg.slug) {
      // Slug değişiminde eski adres için 301 kaydı oluşturulur.
      this.data.seoRedirects.push({
        id: this.nextId('redirect'),
        fromPath: `/paketler/${pkg.slug}`,
        toPath: `/paketler/${seo.slug}`,
        statusCode: 301,
        isActive: true,
        createdAt: new Date(Date.now()).toISOString(),
      });
      pkg.slug = seo.slug;
    }

    if (seo.seoTitle !== undefined) pkg.seoTitle = seo.seoTitle;
    if (seo.seoDescription !== undefined) pkg.seoDescription = seo.seoDescription;
    if (seo.seoCanonical !== undefined) pkg.seoCanonical = seo.seoCanonical;
    if (seo.ogImageUrl !== undefined) pkg.ogImageUrl = seo.ogImageUrl;
    if (seo.isIndexable !== undefined) pkg.isIndexable = seo.isIndexable;

    await this.logChange(actorId, 'package.seo_update', 'package', id, before, { ...pkg });
    return pkg;
  }

  // =========================================================================
  // Public projeksiyonlar
  // =========================================================================

  private contextFor(pkg: VenuePackage) {
    const business = this.data.businesses.find((b) => b.id === pkg.businessId);
    const branch = this.data.branches.find((b) => b.id === pkg.branchId);
    const category = this.data.categories.find((c) => c.id === pkg.categoryId);
    if (!business || !branch || !category) return null;
    const city = this.data.cities.find((c) => c.id === branch.cityId);
    const district = this.data.districts.find((d) => d.id === branch.districtId);
    if (!city || !district) return null;
    return { business, branch, category, city, district };
  }

  async getPublicBusiness(slug: string): Promise<PublicBusiness | null> {
    const business = this.data.businesses.find((b) => b.slug === slug);
    if (!business || business.status !== 'verified' || !business.isPublic) return null;

    const category = this.data.categories.find((c) => c.id === business.categoryId);
    if (!category) return null;

    const branches = this.data.branches
      .filter((b) => b.businessId === business.id && b.isActive)
      .flatMap((branch) => {
        const city = this.data.cities.find((c) => c.id === branch.cityId);
        const district = this.data.districts.find((d) => d.id === branch.districtId);
        return city && district ? [{ branch, city, district }] : [];
      });

    const packages = this.data.packages
      .filter((p) => p.businessId === business.id)
      .flatMap((pkg) => {
        const ctx = this.contextFor(pkg);
        return ctx ? [{ pkg, category: ctx.category, district: ctx.district }] : [];
      });

    return toPublicBusiness({ business, category, branches, packages });
  }

  async getPublicPackage(slug: string): Promise<PublicPackage | null> {
    const pkg = this.data.packages.find((p) => p.slug === slug);
    if (!pkg || !pkg.isPublic) return null;
    const ctx = this.contextFor(pkg);
    if (!ctx || ctx.business.status !== 'verified') return null;
    return toPublicPackage({ pkg, ...ctx });
  }

  async listPublicPackages(filter: PublicPackageFilter): Promise<PublicPackage[]> {
    const result: PublicPackage[] = [];

    for (const pkg of this.data.packages) {
      if (!pkg.isActive || !pkg.isPublic) continue;
      const ctx = this.contextFor(pkg);
      if (!ctx || ctx.business.status !== 'verified' || !ctx.branch.isActive) continue;

      if (filter.citySlug && ctx.city.slug !== filter.citySlug) continue;
      if (filter.districtSlug && ctx.district.slug !== filter.districtSlug) continue;
      if (filter.categorySlug && ctx.category.slug !== filter.categorySlug) continue;
      if (filter.businessSlug && ctx.business.slug !== filter.businessSlug) continue;
      if (filter.minPeople && (pkg.minPeople > filter.minPeople || pkg.maxPeople < filter.minPeople))
        continue;

      result.push(toPublicPackage({ pkg, ...ctx }));
    }

    result.sort((a, b) => a.perPersonFrom - b.perPersonFrom);
    return filter.limit ? result.slice(0, filter.limit) : result;
  }

  async listPublicBusinesses(filter?: {
    citySlug?: string;
    districtSlug?: string;
    categorySlug?: string;
    limit?: number;
  }): Promise<PublicBusiness[]> {
    const result: PublicBusiness[] = [];

    for (const business of this.data.businesses) {
      if (business.status !== 'verified' || !business.isPublic) continue;

      const branches = this.data.branches.filter((b) => b.businessId === business.id && b.isActive);
      const matchesLocation = branches.some((branch) => {
        const city = this.data.cities.find((c) => c.id === branch.cityId);
        const district = this.data.districts.find((d) => d.id === branch.districtId);
        if (filter?.citySlug && city?.slug !== filter.citySlug) return false;
        if (filter?.districtSlug && district?.slug !== filter.districtSlug) return false;
        return true;
      });
      if (!matchesLocation) continue;

      if (filter?.categorySlug) {
        const category = this.data.categories.find((c) => c.id === business.categoryId);
        if (category?.slug !== filter.categorySlug) continue;
      }

      const publicBusiness = await this.getPublicBusiness(business.slug);
      if (publicBusiness) result.push(publicBusiness);
    }

    return filter?.limit ? result.slice(0, filter.limit) : result;
  }

  async getPublicCitySummary(slug: string): Promise<PublicCitySummary | null> {
    const city = this.data.cities.find((c) => c.slug === slug);
    if (!city || !city.isActive || !city.isPublic) return null;

    const packages = await this.listPublicPackages({ citySlug: slug });
    const businesses = await this.listPublicBusinesses({ citySlug: slug });
    const districts = await this.listDistricts(city.id, { onlyActive: true });

    const categories = this.data.categories
      .filter((c) => c.isActive)
      .map((category) => ({
        category,
        packageCount: packages.filter((p) => p.category.id === category.id).length,
      }))
      .filter((entry) => entry.packageCount > 0);

    return {
      city,
      districtCount: districts.length,
      businessCount: businesses.length,
      packageCount: packages.length,
      categories,
    };
  }

  async getPublicDistrictSummary(
    citySlug: string,
    districtSlug: string,
  ): Promise<PublicDistrictSummary | null> {
    const city = this.data.cities.find((c) => c.slug === citySlug);
    if (!city || !city.isActive || !city.isPublic) return null;
    const district = this.data.districts.find(
      (d) => d.cityId === city.id && d.slug === districtSlug,
    );
    if (!district || !district.isActive || !district.isPublic) return null;

    const packages = await this.listPublicPackages({ citySlug, districtSlug });
    const businesses = await this.listPublicBusinesses({ citySlug, districtSlug });

    const categories = this.data.categories
      .filter((c) => c.isActive)
      .map((category) => ({
        category,
        packageCount: packages.filter((p) => p.category.id === category.id).length,
      }))
      .filter((entry) => entry.packageCount > 0);

    return {
      district,
      city,
      businessCount: businesses.length,
      packageCount: packages.length,
      categories,
    };
  }

  async getPublicCategorySummary(slug: string): Promise<PublicCategorySummary | null> {
    const category = this.data.categories.find((c) => c.slug === slug);
    if (!category || !category.isActive) return null;

    const packages = await this.listPublicPackages({ categorySlug: slug });
    const businesses = await this.listPublicBusinesses({ categorySlug: slug });

    const cities = (await this.listCities({ onlyActive: true }))
      .map((city) => ({
        city,
        packageCount: packages.filter((p) => p.branch.city.slug === city.slug).length,
      }))
      .filter((entry) => entry.packageCount > 0);

    return {
      category,
      businessCount: businesses.length,
      packageCount: packages.length,
      cities,
    };
  }

  // =========================================================================
  // Plan
  // =========================================================================

  async createPlan(input: CreatePlanInput, nowIso: string): Promise<Plan> {
    const plan: Plan = {
      id: this.nextId('plan'),
      ownerId: input.ownerId,
      name: input.name,
      status: input.status,
      cityId: input.cityId,
      districtId: input.districtId,
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      isTimeFlexible: input.isTimeFlexible,
      estimatedPeople: input.estimatedPeople,
      minPeople: input.minPeople,
      maxPeople: input.maxPeople,
      budgetMode: input.budgetMode,
      budgetPerPerson: input.budgetPerPerson,
      budgetTotal: input.budgetTotal,
      note: input.note,
      categoryIds: input.categoryIds,
      preferenceKeys: input.preferenceKeys,
      votingStartsAt: null,
      votingEndsAt: null,
      winningPackageId: null,
      cancelledReason: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    this.data.plans.push(plan);

    this.data.participants.push({
      id: this.nextId('participant'),
      planId: plan.id,
      userId: input.ownerId,
      guestTokenHash: null,
      displayName: input.ownerDisplayName,
      status: 'going',
      isOwner: true,
      joinedAt: nowIso,
    });

    return plan;
  }

  async updatePlan(id: Id, patch: UpdatePlanInput, nowIso: string): Promise<Plan> {
    const plan = this.data.plans.find((p) => p.id === id);
    if (!plan) throw AppError.notFound('plan');
    Object.assign(plan, patch, { id: plan.id, updatedAt: nowIso });
    return plan;
  }

  async getPlan(id: Id): Promise<Plan | null> {
    return this.data.plans.find((p) => p.id === id) ?? null;
  }

  async listPlansForUser(userId: Id): Promise<Plan[]> {
    const planIds = new Set(
      this.data.participants.filter((p) => p.userId === userId).map((p) => p.planId),
    );
    return this.data.plans
      .filter((p) => p.ownerId === userId || planIds.has(p.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async setPlanStatus(
    id: Id,
    status: PlanStatus,
    nowIso: string,
    reason?: string | null,
  ): Promise<Plan> {
    const plan = this.data.plans.find((p) => p.id === id);
    if (!plan) throw AppError.notFound('plan');
    plan.status = status;
    plan.updatedAt = nowIso;
    if (reason !== undefined) plan.cancelledReason = reason;
    return plan;
  }

  async deletePlan(id: Id): Promise<void> {
    this.data.plans = this.data.plans.filter((p) => p.id !== id);
    this.data.participants = this.data.participants.filter((p) => p.planId !== id);
    this.data.votes = this.data.votes.filter((v) => v.planId !== id);
    this.data.invitations = this.data.invitations.filter((i) => i.planId !== id);
  }

  // =========================================================================
  // Katılımcı
  // =========================================================================

  async listParticipants(planId: Id): Promise<PlanParticipant[]> {
    return this.data.participants
      .filter((p) => p.planId === planId)
      .sort((a, b) => (a.isOwner === b.isOwner ? a.joinedAt.localeCompare(b.joinedAt) : a.isOwner ? -1 : 1));
  }

  async addParticipant(input: {
    planId: Id;
    userId: Id | null;
    guestTokenHash: string | null;
    displayName: string;
    status: ParticipationStatus;
    isOwner: boolean;
    nowIso: string;
  }): Promise<PlanParticipant> {
    if (!input.userId && !input.guestTokenHash) {
      throw AppError.validation({}, 'Katılımcı kimliği eksik.');
    }

    const participant: PlanParticipant = {
      id: this.nextId('participant'),
      planId: input.planId,
      userId: input.userId,
      guestTokenHash: input.guestTokenHash,
      displayName: input.displayName,
      status: input.status,
      isOwner: input.isOwner,
      joinedAt: input.nowIso,
    };
    this.data.participants.push(participant);
    return participant;
  }

  async updateParticipantStatus(
    participantId: Id,
    status: ParticipationStatus,
  ): Promise<PlanParticipant> {
    const participant = this.data.participants.find((p) => p.id === participantId);
    if (!participant) throw AppError.notFound('katılımcı');
    participant.status = status;
    return participant;
  }

  async removeParticipant(participantId: Id): Promise<void> {
    this.data.participants = this.data.participants.filter((p) => p.id !== participantId);
    this.data.votes = this.data.votes.filter((v) => v.participantId !== participantId);
  }

  async findParticipantByUser(planId: Id, userId: Id): Promise<PlanParticipant | null> {
    return this.data.participants.find((p) => p.planId === planId && p.userId === userId) ?? null;
  }

  async findParticipantByGuestHash(
    planId: Id,
    guestTokenHash: string,
  ): Promise<PlanParticipant | null> {
    return (
      this.data.participants.find(
        (p) => p.planId === planId && p.guestTokenHash === guestTokenHash,
      ) ?? null
    );
  }

  // =========================================================================
  // Davet
  // =========================================================================

  async createInvitation(input: {
    planId: Id;
    tokenHash: string;
    shortCode: string;
    createdBy: Id;
    expiresAt: string | null;
    nowIso: string;
  }): Promise<PlanInvitation> {
    // Yeni davet üretildiğinde eskisi geçersiz olur.
    for (const invitation of this.data.invitations) {
      if (invitation.planId === input.planId && !invitation.revokedAt) {
        invitation.revokedAt = input.nowIso;
      }
    }

    const invitation: PlanInvitation = {
      id: this.nextId('invitation'),
      planId: input.planId,
      tokenHash: input.tokenHash,
      shortCode: input.shortCode,
      createdBy: input.createdBy,
      expiresAt: input.expiresAt,
      revokedAt: null,
      useCount: 0,
      createdAt: input.nowIso,
    };
    this.data.invitations.push(invitation);
    return invitation;
  }

  async getInvitationByTokenHash(tokenHash: string): Promise<PlanInvitation | null> {
    return this.data.invitations.find((i) => i.tokenHash === tokenHash) ?? null;
  }

  async getInvitationByShortCode(shortCode: string): Promise<PlanInvitation | null> {
    return this.data.invitations.find((i) => i.shortCode === shortCode && !i.revokedAt) ?? null;
  }

  async getActiveInvitation(planId: Id): Promise<PlanInvitation | null> {
    return this.data.invitations.find((i) => i.planId === planId && !i.revokedAt) ?? null;
  }

  async revokeInvitation(id: Id, nowIso: string): Promise<void> {
    const invitation = this.data.invitations.find((i) => i.id === id);
    if (invitation) invitation.revokedAt = nowIso;
  }

  async incrementInvitationUse(id: Id): Promise<void> {
    const invitation = this.data.invitations.find((i) => i.id === id);
    if (invitation) invitation.useCount += 1;
  }

  // =========================================================================
  // Oylama
  // =========================================================================

  async listVotes(planId: Id): Promise<Vote[]> {
    return this.data.votes.filter((v) => v.planId === planId);
  }

  async castVote(input: {
    planId: Id;
    participantId: Id;
    packageId: Id;
    nowIso: string;
  }): Promise<Vote> {
    // UNIQUE(plan_id, participant_id): var olan oy güncellenir, ikinci oy eklenmez.
    const existing = this.data.votes.find(
      (v) => v.planId === input.planId && v.participantId === input.participantId,
    );

    if (existing) {
      existing.packageId = input.packageId;
      existing.updatedAt = input.nowIso;
      return existing;
    }

    const vote: Vote = {
      id: this.nextId('vote'),
      planId: input.planId,
      participantId: input.participantId,
      packageId: input.packageId,
      createdAt: input.nowIso,
      updatedAt: input.nowIso,
    };
    this.data.votes.push(vote);
    return vote;
  }

  async removeVote(planId: Id, participantId: Id): Promise<void> {
    this.data.votes = this.data.votes.filter(
      (v) => !(v.planId === planId && v.participantId === participantId),
    );
  }

  // =========================================================================
  // Rezervasyon
  // =========================================================================

  async createReservation(
    input: CreateReservationInput,
    code: string,
    nowIso: string,
  ): Promise<Reservation> {
    const reservation: Reservation = {
      id: this.nextId('reservation'),
      ...input,
      code,
      status: 'pending_business',
      rejectionReason: null,
      rejectionNote: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    this.data.reservations.push(reservation);

    this.data.reservationHistory.push(
      {
        id: this.nextId('res-event'),
        reservationId: reservation.id,
        fromStatus: null,
        toStatus: 'created',
        changedBy: input.createdBy,
        reason: null,
        createdAt: nowIso,
      },
      {
        id: this.nextId('res-event'),
        reservationId: reservation.id,
        fromStatus: 'created',
        toStatus: 'pending_business',
        changedBy: input.createdBy,
        reason: null,
        createdAt: nowIso,
      },
    );

    return reservation;
  }

  async getReservation(id: Id): Promise<Reservation | null> {
    return this.data.reservations.find((r) => r.id === id) ?? null;
  }

  async getReservationByCode(code: string): Promise<Reservation | null> {
    return this.data.reservations.find((r) => r.code === code) ?? null;
  }

  async listReservationsForUser(userId: Id): Promise<Reservation[]> {
    const ownedPlanIds = new Set(
      this.data.plans.filter((p) => p.ownerId === userId).map((p) => p.id),
    );
    return this.data.reservations
      .filter((r) => r.createdBy === userId || ownedPlanIds.has(r.planId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listReservationsForBusiness(
    businessId: Id,
    status?: ReservationStatus,
  ): Promise<BusinessReservationRow[]> {
    return this.data.reservations
      .filter((r) => r.businessId === businessId && (!status || r.status === status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((reservation) => ({
        reservation,
        packageName: this.data.packages.find((p) => p.id === reservation.packageId)?.name ?? '—',
        branchName: this.data.branches.find((b) => b.id === reservation.branchId)?.name ?? '—',
        planName: this.data.plans.find((p) => p.id === reservation.planId)?.name ?? null,
      }));
  }

  async listReservationsForPlan(planId: Id): Promise<Reservation[]> {
    return this.data.reservations.filter((r) => r.planId === planId);
  }

  async changeReservationStatus(input: {
    id: Id;
    status: ReservationStatus;
    actorId: Id;
    reason?: string | null;
    rejectionReason?: RejectionReason | null;
    nowIso: string;
  }): Promise<Reservation> {
    const reservation = this.data.reservations.find((r) => r.id === input.id);
    if (!reservation) throw AppError.notFound('rezervasyon');

    assertReservationTransition(reservation.status, input.status);

    const fromStatus = reservation.status;
    reservation.status = input.status;
    reservation.updatedAt = input.nowIso;
    if (input.rejectionReason !== undefined) reservation.rejectionReason = input.rejectionReason;
    if (input.reason !== undefined) reservation.rejectionNote = input.reason;

    this.data.reservationHistory.push({
      id: this.nextId('res-event'),
      reservationId: reservation.id,
      fromStatus,
      toStatus: input.status,
      changedBy: input.actorId,
      reason: input.reason ?? null,
      createdAt: input.nowIso,
    });

    return reservation;
  }

  async listReservationHistory(reservationId: Id): Promise<ReservationStatusEvent[]> {
    return this.data.reservationHistory
      .filter((e) => e.reservationId === reservationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  // =========================================================================
  // Bildirim ve favori
  // =========================================================================

  async listNotifications(userId: Id): Promise<AppNotification[]> {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNotification(input: Omit<AppNotification, 'id'>): Promise<AppNotification> {
    const notification: AppNotification = { id: this.nextId('notif'), ...input };
    this.data.notifications.push(notification);
    return notification;
  }

  async markNotificationRead(id: Id, nowIso: string): Promise<void> {
    const notification = this.data.notifications.find((n) => n.id === id);
    if (notification) notification.readAt = nowIso;
  }

  async markAllNotificationsRead(userId: Id, nowIso: string): Promise<void> {
    for (const notification of this.data.notifications) {
      if (notification.userId === userId && !notification.readAt) notification.readAt = nowIso;
    }
  }

  async listFavorites(userId: Id): Promise<Favorite[]> {
    return this.data.favorites.filter((f) => f.userId === userId);
  }

  async toggleFavorite(userId: Id, packageId: Id, nowIso: string): Promise<boolean> {
    const index = this.data.favorites.findIndex(
      (f) => f.userId === userId && f.packageId === packageId,
    );
    if (index >= 0) {
      this.data.favorites.splice(index, 1);
      return false;
    }
    this.data.favorites.push({ userId, packageId, createdAt: nowIso });
    return true;
  }

  // =========================================================================
  // İçerik ve SEO
  // =========================================================================

  async listHelpArticles(options?: { onlyPublic?: boolean }): Promise<HelpArticle[]> {
    return this.data.helpArticles
      .filter((a) => !options?.onlyPublic || a.isPublic)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getHelpArticle(slug: string): Promise<HelpArticle | null> {
    return this.data.helpArticles.find((a) => a.slug === slug) ?? null;
  }

  async listSeoRedirects(): Promise<SeoRedirect[]> {
    return this.data.seoRedirects.filter((r) => r.isActive);
  }

  async findRedirect(fromPath: string): Promise<SeoRedirect | null> {
    return this.data.seoRedirects.find((r) => r.isActive && r.fromPath === fromPath) ?? null;
  }

  // =========================================================================
  // Yönetim
  // =========================================================================

  async getAdminOverview(): Promise<AdminOverviewStats> {
    return {
      userCount: this.data.users.filter((u) => !u.profile.deletedAt).length,
      businessCount: this.data.businesses.filter((b) => b.status === 'verified').length,
      pendingApplications: this.data.businessApplications.filter((a) => a.status === 'pending')
        .length,
      packageCount: this.data.packages.length,
      planCount: this.data.plans.length,
      reservationCount: this.data.reservations.length,
      openReports: 0,
      openTickets: 0,
      activeCities: this.data.cities.filter((c) => c.isActive).length,
    };
  }

  async getBusinessDashboard(businessId: Id, todayIso: IsoDate): Promise<BusinessDashboardStats> {
    const packages = this.data.packages.filter((p) => p.businessId === businessId);
    const reservations = this.data.reservations.filter((r) => r.businessId === businessId);
    const confirmed = reservations.filter((r) => r.status === 'confirmed');

    const thisMonthPrefix = todayIso.slice(0, 7);

    return {
      totalPackages: packages.length,
      activePackages: packages.filter((p) => p.isActive).length,
      pendingReservations: reservations.filter((r) => r.status === 'pending_business').length,
      confirmedReservations: confirmed.length,
      upcomingReservations: confirmed.filter((r) => r.reservedDate >= todayIso).length,
      totalGuestsThisMonth: reservations
        .filter((r) => r.reservedDate.startsWith(thisMonthPrefix) && r.status !== 'rejected')
        .reduce((sum, r) => sum + r.peopleCount, 0),
      averageResponseHours: this.averageResponseHours(businessId),
    };
  }

  private averageResponseHours(businessId: Id): number | null {
    const responded = this.data.reservations.filter(
      (r) => r.businessId === businessId && r.status !== 'pending_business' && r.status !== 'created',
    );
    if (responded.length === 0) return null;

    const totalHours = responded.reduce((sum, r) => {
      const created = new Date(r.createdAt).getTime();
      const updated = new Date(r.updatedAt).getTime();
      return sum + Math.max(0, updated - created) / 3_600_000;
    }, 0);

    return Math.round((totalHours / responded.length) * 10) / 10;
  }

  async listAdminLogs(limit = 100): Promise<AdminLogEntry[]> {
    return [...this.data.adminLogs]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async writeAdminLog(entry: Omit<AdminLogEntry, 'id'>): Promise<void> {
    this.data.adminLogs.push({ id: this.nextId('log'), ...entry });
  }

  private async logChange(
    actorId: Id,
    action: string,
    entityType: string,
    entityId: Id,
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
  ): Promise<void> {
    const actor = this.data.users.find((u) => u.profile.id === actorId);
    await this.writeAdminLog({
      actorId,
      actorName: actor?.profile.displayName ?? 'Bilinmeyen',
      action,
      entityType,
      entityId,
      before,
      after,
      createdAt: new Date(Date.now()).toISOString(),
    });
  }

  // =========================================================================
  // Hız sınırı
  // =========================================================================

  async incrementRateLimit(key: string, windowStartMs: number): Promise<number> {
    const existing = this.rateCounters.get(key);
    if (!existing || existing.windowStart !== windowStartMs) {
      this.rateCounters.set(key, { windowStart: windowStartMs, count: 1 });
      return 1;
    }
    existing.count += 1;
    return existing.count;
  }

  async resetRateLimit(key: string): Promise<void> {
    this.rateCounters.delete(key);
  }
}
