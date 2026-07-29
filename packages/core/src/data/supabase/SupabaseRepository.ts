import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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
import { AppError } from '../../errors/AppError';
import { slugify, uniqueSlug } from '../../text/slug';
import { assertReservationTransition } from '../../status/reservation';
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
import {
  mapAdminLog,
  mapApplication,
  mapBranch,
  mapBusiness,
  mapBusinessMember,
  mapCategory,
  mapCity,
  mapCountry,
  mapDistrict,
  mapHelpArticle,
  mapInvitation,
  mapNotification,
  mapPackage,
  mapParticipant,
  mapPlan,
  mapPreference,
  mapProfile,
  mapReservation,
  mapReservationEvent,
  mapSeoRedirect,
  mapVote,
  SELECT,
  type ApplicationRow,
  type BranchRow,
  type BusinessMemberRow,
  type BusinessRow,
  type CategoryRow,
  type CityRow,
  type CountryRow,
  type DistrictRow,
  type HelpArticleRow,
  type InvitationRow,
  type NotificationRow,
  type PackageRow,
  type ParticipantRow,
  type PlanRow,
  type PreferenceRow,
  type ProfileRow,
  type ReservationEventRow,
  type ReservationRow,
  type SeoRedirectRow,
  type UserRoleRow,
  type VoteRow,
  type AdminLogRow,
} from './rows';

/**
 * Supabase (PostgreSQL + RLS) veri kaynağı.
 *
 * Yetkilendirme veritabanı seviyesinde RLS ile zorunludur; bu sınıf yalnızca
 * sorgu ve dönüştürme yapar. Yönetim işlemleri için service-role anahtarı
 * verilmişse ayrı bir istemci kullanılır.
 */

export interface SupabaseRepositoryConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string | undefined;
  /** Kullanıcı oturumu (RLS bağlamı) için erişim tokenı. */
  accessToken?: string | undefined;
}

interface PostgrestErrorLike {
  message: string;
  code?: string;
  details?: string;
}

function fail(error: PostgrestErrorLike | null, entity: string): never {
  if (error?.code === 'PGRST116') throw AppError.notFound(entity);
  if (error?.code === '23505') {
    throw AppError.conflict('Bu kayıt zaten var.', { entity, code: error.code });
  }
  if (error?.code === '42501') {
    throw AppError.forbidden('Bu işlem için yetkin yok.');
  }
  throw new AppError('unknown', error?.message ?? `Sorgu başarısız: ${entity}`, {
    context: { entity, code: error?.code },
  });
}

export class SupabaseRepository implements Repository {
  readonly mode = 'supabase' as const;

  private readonly client: SupabaseClient;
  private readonly admin: SupabaseClient;

  constructor(config: SupabaseRepositoryConfig) {
    this.client = createClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      ...(config.accessToken
        ? { global: { headers: { Authorization: `Bearer ${config.accessToken}` } } }
        : {}),
    });

    this.admin = config.serviceRoleKey
      ? createClient(config.url, config.serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : this.client;
  }

  // =========================================================================
  // Kimlik
  // =========================================================================

  async signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { display_name: input.displayName } },
    });

    if (error || !data.user) {
      if (error?.message.includes('already')) {
        throw AppError.conflict('Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyebilirsin.');
      }
      throw new AppError('validation', error?.message ?? 'Kayıt başarısız', {
        userMessage: 'Kayıt tamamlanamadı. Bilgileri kontrol edip tekrar dener misin?',
      });
    }

    const user = await this.getSessionUser(data.user.id);
    if (!user) throw AppError.notFound('kullanıcı');
    return { user };
  }

  async signIn(input: { email: string; password: string }): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      throw new AppError('unauthorized', error?.message ?? 'Giriş başarısız', {
        userMessage: 'E-posta veya şifre hatalı.',
      });
    }

    const user = await this.getSessionUser(data.user.id);
    if (!user) throw AppError.notFound('kullanıcı');
    return { user };
  }

  async requestPasswordReset(email: string): Promise<{ resetToken: string | null }> {
    await this.client.auth.resetPasswordForEmail(email);
    // Supabase e-posta gönderir; uygulama token görmez.
    return { resetToken: null };
  }

  async resetPassword(input: { token: string; password: string }): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: input.password });
    if (error) {
      throw AppError.validation(
        {},
        'Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir; yeni bir bağlantı isteyebilirsin.',
      );
    }
  }

  async getSessionUser(userId: Id): Promise<SessionUser | null> {
    const profile = await this.getProfile(userId);
    if (!profile || profile.deletedAt) return null;
    const roles = await this.getUserRoles(userId);
    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      roles: roles.length > 0 ? roles : ['user'],
      cityId: profile.cityId,
      districtId: profile.districtId,
      theme: profile.theme,
    };
  }

  async getProfile(userId: Id): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle<ProfileRow>();
    if (error) fail(error, 'profil');
    return data ? mapProfile(data) : null;
  }

  async updateProfile(userId: Id, patch: Partial<Profile>): Promise<Profile> {
    const payload: Record<string, unknown> = {};
    if (patch.displayName !== undefined) payload.display_name = patch.displayName;
    if (patch.phone !== undefined) payload.phone = patch.phone;
    if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
    if (patch.cityId !== undefined) payload.city_id = patch.cityId;
    if (patch.districtId !== undefined) payload.district_id = patch.districtId;
    if (patch.theme !== undefined) payload.theme = patch.theme;
    if (patch.locale !== undefined) payload.locale = patch.locale;

    const { data, error } = await this.client
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .single<ProfileRow>();
    if (error || !data) fail(error, 'profil');
    return mapProfile(data);
  }

  async deleteAccount(userId: Id, nowIso: string): Promise<void> {
    const { error } = await this.client
      .from('profiles')
      .update({
        deleted_at: nowIso,
        display_name: 'Silinmiş kullanıcı',
        phone: null,
        avatar_url: null,
      })
      .eq('id', userId);
    if (error) fail(error, 'profil');
  }

  async getUserRoles(userId: Id): Promise<AppRole[]> {
    const { data, error } = await this.client
      .from('user_roles')
      .select('user_id, role')
      .eq('user_id', userId)
      .returns<UserRoleRow[]>();
    if (error) fail(error, 'roller');
    return (data ?? []).map((r) => r.role);
  }

  async listUsers(): Promise<Profile[]> {
    const { data, error } = await this.admin
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .returns<ProfileRow[]>();
    if (error) fail(error, 'kullanıcılar');
    return (data ?? []).map(mapProfile);
  }

  async setUserSuspended(userId: Id, suspended: boolean, actorId: Id): Promise<void> {
    const { error } = await this.admin
      .from('profiles')
      .update({ is_suspended: suspended })
      .eq('id', userId);
    if (error) fail(error, 'kullanıcı');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Yönetici',
      action: suspended ? 'user.suspend' : 'user.unsuspend',
      entityType: 'user',
      entityId: userId,
      before: { isSuspended: !suspended },
      after: { isSuspended: suspended },
      createdAt: new Date(Date.now()).toISOString(),
    });
  }

  // =========================================================================
  // Konum ve sınıflandırma
  // =========================================================================

  async listCountries(): Promise<Country[]> {
    const { data, error } = await this.client
      .from('countries')
      .select('*')
      .returns<CountryRow[]>();
    if (error) fail(error, 'ülkeler');
    return (data ?? []).map(mapCountry);
  }

  async listCities(options?: { onlyActive?: boolean }): Promise<City[]> {
    let query = this.client.from('cities').select('*').order('sort_order');
    if (options?.onlyActive) query = query.eq('is_active', true).eq('is_public', true);
    const { data, error } = await query.returns<CityRow[]>();
    if (error) fail(error, 'şehirler');
    return (data ?? []).map(mapCity);
  }

  async getCityBySlug(slug: string): Promise<City | null> {
    const { data, error } = await this.client
      .from('cities')
      .select('*')
      .eq('slug', slug)
      .maybeSingle<CityRow>();
    if (error) fail(error, 'şehir');
    return data ? mapCity(data) : null;
  }

  async listDistricts(cityId: Id, options?: { onlyActive?: boolean }): Promise<District[]> {
    let query = this.client.from('districts').select('*').eq('city_id', cityId).order('sort_order');
    if (options?.onlyActive) query = query.eq('is_active', true).eq('is_public', true);
    const { data, error } = await query.returns<DistrictRow[]>();
    if (error) fail(error, 'ilçeler');
    return (data ?? []).map(mapDistrict);
  }

  async getDistrictBySlug(cityId: Id, slug: string): Promise<District | null> {
    const { data, error } = await this.client
      .from('districts')
      .select('*')
      .eq('city_id', cityId)
      .eq('slug', slug)
      .maybeSingle<DistrictRow>();
    if (error) fail(error, 'ilçe');
    return data ? mapDistrict(data) : null;
  }

  async listCategories(options?: { onlyActive?: boolean }): Promise<Category[]> {
    let query = this.client.from('categories').select('*').order('sort_order');
    if (options?.onlyActive) query = query.eq('is_active', true);
    const { data, error } = await query.returns<CategoryRow[]>();
    if (error) fail(error, 'kategoriler');
    return (data ?? []).map(mapCategory);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle<CategoryRow>();
    if (error) fail(error, 'kategori');
    return data ? mapCategory(data) : null;
  }

  async listPreferences(): Promise<Preference[]> {
    const { data, error } = await this.client
      .from('preferences')
      .select('*')
      .order('sort_order')
      .returns<PreferenceRow[]>();
    if (error) fail(error, 'tercihler');
    return (data ?? []).map(mapPreference);
  }

  async upsertCity(input: Partial<City> & { name: string }, actorId: Id): Promise<City> {
    const existingSlugs = (await this.listCities()).map((c) => c.slug);
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      country_id: input.countryId ?? (await this.listCountries())[0]?.id,
      name: input.name,
      slug: input.slug ?? uniqueSlug(input.name, existingSlugs),
      intro: input.intro ?? null,
      is_active: input.isActive ?? false,
      is_public: input.isPublic ?? false,
      is_indexable: input.isIndexable ?? true,
      sort_order: input.sortOrder ?? existingSlugs.length + 1,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      seo_canonical: input.seoCanonical ?? null,
      og_image_url: input.ogImageUrl ?? null,
    };

    const { data, error } = await this.admin
      .from('cities')
      .upsert(payload)
      .select('*')
      .single<CityRow>();
    if (error || !data) fail(error, 'şehir');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Yönetici',
      action: input.id ? 'city.update' : 'city.create',
      entityType: 'city',
      entityId: data.id,
      before: null,
      after: { name: data.name, isActive: data.is_active },
      createdAt: new Date(Date.now()).toISOString(),
    });

    return mapCity(data);
  }

  async upsertDistrict(
    input: Partial<District> & { name: string; cityId: Id },
    actorId: Id,
  ): Promise<District> {
    const siblings = await this.listDistricts(input.cityId);
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      city_id: input.cityId,
      name: input.name,
      slug: input.slug ?? uniqueSlug(input.name, siblings.map((d) => d.slug)),
      intro: input.intro ?? null,
      is_active: input.isActive ?? true,
      is_public: input.isPublic ?? true,
      is_indexable: input.isIndexable ?? true,
      sort_order: input.sortOrder ?? siblings.length + 1,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      seo_canonical: input.seoCanonical ?? null,
      og_image_url: input.ogImageUrl ?? null,
    };

    const { data, error } = await this.admin
      .from('districts')
      .upsert(payload)
      .select('*')
      .single<DistrictRow>();
    if (error || !data) fail(error, 'ilçe');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Yönetici',
      action: input.id ? 'district.update' : 'district.create',
      entityType: 'district',
      entityId: data.id,
      before: null,
      after: { name: data.name },
      createdAt: new Date(Date.now()).toISOString(),
    });

    return mapDistrict(data);
  }

  async upsertCategory(
    input: Partial<Category> & { name: string },
    actorId: Id,
  ): Promise<Category> {
    const existing = await this.listCategories();
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      key: input.key ?? slugify(input.name).replace(/-/g, '_'),
      name: input.name,
      slug: input.slug ?? uniqueSlug(input.name, existing.map((c) => c.slug)),
      icon: input.icon ?? 'tag',
      description: input.description ?? null,
      is_active: input.isActive ?? true,
      is_indexable: input.isIndexable ?? true,
      sort_order: input.sortOrder ?? existing.length + 1,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      seo_canonical: input.seoCanonical ?? null,
      og_image_url: input.ogImageUrl ?? null,
    };

    const { data, error } = await this.admin
      .from('categories')
      .upsert(payload)
      .select('*')
      .single<CategoryRow>();
    if (error || !data) fail(error, 'kategori');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Yönetici',
      action: input.id ? 'category.update' : 'category.create',
      entityType: 'category',
      entityId: data.id,
      before: null,
      after: { name: data.name },
      createdAt: new Date(Date.now()).toISOString(),
    });

    return mapCategory(data);
  }

  // =========================================================================
  // İşletme
  // =========================================================================

  async listBusinesses(options?: { status?: string }): Promise<Business[]> {
    let query = this.client.from('businesses').select('*');
    if (options?.status) query = query.eq('status', options.status);
    const { data, error } = await query.returns<BusinessRow[]>();
    if (error) fail(error, 'işletmeler');
    return (data ?? []).map(mapBusiness);
  }

  async getBusiness(id: Id): Promise<Business | null> {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .eq('id', id)
      .maybeSingle<BusinessRow>();
    if (error) fail(error, 'işletme');
    return data ? mapBusiness(data) : null;
  }

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle<BusinessRow>();
    if (error) fail(error, 'işletme');
    return data ? mapBusiness(data) : null;
  }

  async listBranches(businessId: Id): Promise<BusinessBranch[]> {
    const { data, error } = await this.client
      .from('business_branches')
      .select(SELECT.branch)
      .eq('business_id', businessId)
      .returns<BranchRow[]>();
    if (error) fail(error, 'şubeler');
    return (data ?? []).map(mapBranch);
  }

  async upsertBranch(input: UpsertBranchInput, actorId: Id): Promise<BusinessBranch> {
    const siblings = await this.listBranches(input.businessId);
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      business_id: input.businessId,
      name: input.name,
      slug: input.id
        ? (siblings.find((b) => b.id === input.id)?.slug ?? slugify(input.name))
        : uniqueSlug(input.name, siblings.map((b) => b.slug)),
      city_id: input.cityId,
      district_id: input.districtId,
      address: input.address,
      phone: input.phone,
      whatsapp: input.whatsapp,
      is_active: input.isActive,
    };

    const { data, error } = await this.client
      .from('business_branches')
      .upsert(payload)
      .select('*')
      .single<BranchRow>();
    if (error || !data) fail(error, 'şube');

    await this.client.from('branch_hours').delete().eq('branch_id', data.id);
    if (input.hours.length > 0) {
      const { error: hoursError } = await this.client.from('branch_hours').insert(
        input.hours.map((h) => ({
          branch_id: data.id,
          weekday: h.weekday,
          opens_at: h.opensAt,
          closes_at: h.closesAt,
          is_closed: h.isClosed,
        })),
      );
      if (hoursError) fail(hoursError, 'çalışma saatleri');
    }

    void actorId;
    const branches = await this.listBranches(input.businessId);
    return branches.find((b) => b.id === data.id) ?? mapBranch(data);
  }

  async listBusinessMembers(businessId: Id): Promise<BusinessMember[]> {
    const { data, error } = await this.client
      .from('business_members')
      .select('*')
      .eq('business_id', businessId)
      .returns<BusinessMemberRow[]>();
    if (error) fail(error, 'ekip');
    return (data ?? []).map(mapBusinessMember);
  }

  async addBusinessMember(businessId: Id, userEmail: string, actorId: Id): Promise<BusinessMember> {
    const { data: profile, error: profileError } = await this.admin
      .from('profiles')
      .select('*')
      .eq('email', userEmail.trim().toLowerCase())
      .maybeSingle<ProfileRow>();
    if (profileError) fail(profileError, 'kullanıcı');
    if (!profile) {
      throw AppError.notFound(
        'kullanıcı',
        'Bu e-posta ile kayıtlı bir kullanıcı bulunamadı. Önce kayıt olmasını isteyebilirsin.',
      );
    }

    const { data, error } = await this.client
      .from('business_members')
      .insert({
        business_id: businessId,
        user_id: profile.id,
        role: 'staff',
        invited_by: actorId,
      })
      .select('*')
      .single<BusinessMemberRow>();
    if (error || !data) fail(error, 'ekip üyesi');

    await this.admin
      .from('user_roles')
      .upsert({ user_id: profile.id, role: 'business_staff', granted_by: actorId });

    return mapBusinessMember(data);
  }

  async removeBusinessMember(businessId: Id, userId: Id, _actorId: Id): Promise<void> {
    const { error } = await this.client
      .from('business_members')
      .delete()
      .eq('business_id', businessId)
      .eq('user_id', userId)
      .neq('role', 'owner');
    if (error) fail(error, 'ekip üyesi');
  }

  async getBusinessesForUser(userId: Id): Promise<Business[]> {
    const { data, error } = await this.client
      .from('business_members')
      .select('business_id')
      .eq('user_id', userId)
      .returns<Array<{ business_id: string }>>();
    if (error) fail(error, 'ekip');

    const ids = (data ?? []).map((r) => r.business_id);
    if (ids.length === 0) return [];

    const { data: businesses, error: businessError } = await this.client
      .from('businesses')
      .select('*')
      .in('id', ids)
      .returns<BusinessRow[]>();
    if (businessError) fail(businessError, 'işletmeler');
    return (businesses ?? []).map(mapBusiness);
  }

  async updateBusiness(id: Id, patch: Partial<Business>, actorId: Id): Promise<Business> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.phone !== undefined) payload.phone = patch.phone;
    if (patch.whatsapp !== undefined) payload.whatsapp = patch.whatsapp;
    if (patch.website !== undefined) payload.website = patch.website;
    if (patch.instagram !== undefined) payload.instagram = patch.instagram;
    if (patch.logoUrl !== undefined) payload.logo_url = patch.logoUrl;
    if (patch.coverUrl !== undefined) payload.cover_url = patch.coverUrl;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.isPublic !== undefined) payload.is_public = patch.isPublic;
    if (patch.isIndexable !== undefined) payload.is_indexable = patch.isIndexable;
    if (patch.seoTitle !== undefined) payload.seo_title = patch.seoTitle;
    if (patch.seoDescription !== undefined) payload.seo_description = patch.seoDescription;

    const client = patch.status !== undefined ? this.admin : this.client;
    const { data, error } = await client
      .from('businesses')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single<BusinessRow>();
    if (error || !data) fail(error, 'işletme');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Kullanıcı',
      action: 'business.update',
      entityType: 'business',
      entityId: id,
      before: null,
      after: payload,
      createdAt: new Date(Date.now()).toISOString(),
    });

    return mapBusiness(data);
  }

  // =========================================================================
  // Başvuru
  // =========================================================================

  async createApplication(
    input: CreateApplicationInput,
    nowIso: string,
  ): Promise<BusinessApplication> {
    const { data, error } = await this.client
      .from('business_applications')
      .insert({
        applicant_id: input.applicantId,
        business_name: input.businessName,
        contact_name: input.contactName,
        phone: input.phone,
        email: input.email,
        address: input.address,
        city_id: input.cityId,
        district_id: input.districtId,
        category_id: input.categoryId,
        tax_info: input.taxInfo,
        instagram: input.instagram,
        website: input.website,
        status: 'pending',
        created_at: nowIso,
      })
      .select('*')
      .single<ApplicationRow>();
    if (error || !data) fail(error, 'başvuru');
    return mapApplication(data);
  }

  async listApplications(status?: ApplicationStatus): Promise<BusinessApplication[]> {
    let query = this.admin
      .from('business_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query.returns<ApplicationRow[]>();
    if (error) fail(error, 'başvurular');
    return (data ?? []).map(mapApplication);
  }

  async getApplication(id: Id): Promise<BusinessApplication | null> {
    const { data, error } = await this.admin
      .from('business_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle<ApplicationRow>();
    if (error) fail(error, 'başvuru');
    return data ? mapApplication(data) : null;
  }

  async reviewApplication(
    id: Id,
    decision: { status: 'approved' | 'rejected'; note: string | null; reviewerId: Id },
    nowIso: string,
  ): Promise<BusinessApplication> {
    const application = await this.getApplication(id);
    if (!application) throw AppError.notFound('başvuru');
    if (application.status !== 'pending') {
      throw AppError.conflict('Bu başvuru daha önce sonuçlandırılmış.');
    }

    const { data, error } = await this.admin
      .from('business_applications')
      .update({
        status: decision.status,
        review_note: decision.note,
        reviewed_by: decision.reviewerId,
        reviewed_at: nowIso,
      })
      .eq('id', id)
      .select('*')
      .single<ApplicationRow>();
    if (error || !data) fail(error, 'başvuru');

    if (decision.status === 'approved') {
      const existingSlugs = (await this.listBusinesses()).map((b) => b.slug);
      const { data: business, error: businessError } = await this.admin
        .from('businesses')
        .insert({
          owner_id: application.applicantId,
          name: application.businessName,
          slug: uniqueSlug(application.businessName, existingSlugs),
          description: `${application.businessName} — ${application.address}`,
          category_id: application.categoryId,
          status: 'verified',
          is_public: true,
          is_indexable: true,
          phone: application.phone,
          whatsapp: application.phone,
          website: application.website,
          instagram: application.instagram,
          logo_url: application.logoUrl,
          verified_at: nowIso,
          verified_by: decision.reviewerId,
        })
        .select('*')
        .single<BusinessRow>();
      if (businessError || !business) fail(businessError, 'işletme');

      await this.admin.from('business_members').insert({
        business_id: business.id,
        user_id: application.applicantId,
        role: 'owner',
      });
      await this.admin
        .from('user_roles')
        .upsert({ user_id: application.applicantId, role: 'business_owner', granted_by: decision.reviewerId });

      const { data: branch } = await this.admin
        .from('business_branches')
        .insert({
          business_id: business.id,
          name: 'Merkez Şube',
          slug: 'merkez-sube',
          city_id: application.cityId,
          district_id: application.districtId,
          address: application.address,
          phone: application.phone,
          whatsapp: application.phone,
          is_active: true,
        })
        .select('id')
        .single<{ id: string }>();

      if (branch) {
        await this.admin.from('branch_hours').insert(
          [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
            branch_id: branch.id,
            weekday,
            opens_at: '10:00',
            closes_at: '23:00',
            is_closed: false,
          })),
        );
      }
    }

    await this.writeAdminLog({
      actorId: decision.reviewerId,
      actorName: (await this.getProfile(decision.reviewerId))?.displayName ?? 'Yönetici',
      action: decision.status === 'approved' ? 'application.approve' : 'application.reject',
      entityType: 'business_application',
      entityId: id,
      before: { status: 'pending' },
      after: { status: decision.status },
      createdAt: nowIso,
    });

    return mapApplication(data);
  }

  // =========================================================================
  // Paket
  // =========================================================================

  async listPackages(options?: { businessId?: Id; onlyActive?: boolean }): Promise<VenuePackage[]> {
    let query = this.client.from('packages').select(SELECT.package);
    if (options?.businessId) query = query.eq('business_id', options.businessId);
    if (options?.onlyActive) query = query.eq('is_active', true);
    const { data, error } = await query.returns<PackageRow[]>();
    if (error) fail(error, 'paketler');
    return (data ?? []).map(mapPackage);
  }

  async getPackage(id: Id): Promise<VenuePackage | null> {
    const { data, error } = await this.client
      .from('packages')
      .select(SELECT.package)
      .eq('id', id)
      .maybeSingle<PackageRow>();
    if (error) fail(error, 'paket');
    return data ? mapPackage(data) : null;
  }

  async getPackageBySlug(slug: string): Promise<VenuePackage | null> {
    const { data, error } = await this.client
      .from('packages')
      .select(SELECT.package)
      .eq('slug', slug)
      .maybeSingle<PackageRow>();
    if (error) fail(error, 'paket');
    return data ? mapPackage(data) : null;
  }

  async upsertPackage(
    input: UpsertPackageInput,
    actorId: Id,
    nowIso: string,
  ): Promise<VenuePackage> {
    const business = await this.getBusiness(input.businessId);
    const existingSlugs = (await this.listPackages()).map((p) => p.slug);

    const payload = {
      ...(input.id ? { id: input.id } : {}),
      business_id: input.businessId,
      branch_id: input.branchId,
      category_id: input.categoryId,
      name: input.name,
      ...(input.id
        ? {}
        : {
            slug: uniqueSlug(`${business?.slug ?? 'mekan'}-${input.name}`, existingSlugs),
          }),
      description: input.description,
      min_people: input.minPeople,
      max_people: input.maxPeople,
      pricing_model: input.pricingModel,
      price_amount: input.priceAmount,
      duration_minutes: input.durationMinutes,
      reservation_terms: input.reservationTerms,
      cancellation_terms: input.cancellationTerms,
      is_active: input.isActive,
      is_public: input.isPublic,
      is_indexable: input.isIndexable ?? true,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      updated_at: nowIso,
    };

    const { data, error } = await this.client
      .from('packages')
      .upsert(payload)
      .select('id')
      .single<{ id: string }>();
    if (error || !data) fail(error, 'paket');

    await Promise.all([
      this.client.from('package_items').delete().eq('package_id', data.id),
      this.client.from('package_availability').delete().eq('package_id', data.id),
      this.client.from('package_preferences').delete().eq('package_id', data.id),
    ]);

    if (input.items.length > 0) {
      await this.client.from('package_items').insert(
        input.items.map((label, index) => ({
          package_id: data.id,
          label,
          sort_order: index + 1,
        })),
      );
    }
    if (input.availability.length > 0) {
      await this.client.from('package_availability').insert(
        input.availability.map((a) => ({
          package_id: data.id,
          weekday: a.weekday,
          start_time: a.startTime,
          end_time: a.endTime,
        })),
      );
    }
    if (input.preferenceKeys.length > 0) {
      await this.client.from('package_preferences').insert(
        input.preferenceKeys.map((key) => ({ package_id: data.id, preference_key: key })),
      );
    }

    void actorId;
    const saved = await this.getPackage(data.id);
    if (!saved) throw AppError.notFound('paket');
    return saved;
  }

  async setPackageActive(id: Id, isActive: boolean, actorId: Id): Promise<void> {
    const { error } = await this.client
      .from('packages')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) fail(error, 'paket');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Kullanıcı',
      action: isActive ? 'package.activate' : 'package.deactivate',
      entityType: 'package',
      entityId: id,
      before: { isActive: !isActive },
      after: { isActive },
      createdAt: new Date(Date.now()).toISOString(),
    });
  }

  async deletePackage(id: Id, actorId: Id): Promise<void> {
    const pkg = await this.getPackage(id);
    const { error } = await this.client.from('packages').delete().eq('id', id);
    if (error) fail(error, 'paket');

    if (pkg) {
      await this.admin.from('seo_redirects').insert({
        from_path: `/paketler/${pkg.slug}`,
        to_path: '',
        status_code: 410,
        is_active: true,
      });
    }

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Kullanıcı',
      action: 'package.delete',
      entityType: 'package',
      entityId: id,
      before: pkg ? { slug: pkg.slug, name: pkg.name } : null,
      after: null,
      createdAt: new Date(Date.now()).toISOString(),
    });
  }

  async updatePackageSeo(id: Id, seo: SeoUpdateInput, actorId: Id): Promise<VenuePackage> {
    const current = await this.getPackage(id);
    if (!current) throw AppError.notFound('paket');

    const payload: Record<string, unknown> = {};
    if (seo.seoTitle !== undefined) payload.seo_title = seo.seoTitle;
    if (seo.seoDescription !== undefined) payload.seo_description = seo.seoDescription;
    if (seo.seoCanonical !== undefined) payload.seo_canonical = seo.seoCanonical;
    if (seo.ogImageUrl !== undefined) payload.og_image_url = seo.ogImageUrl;
    if (seo.isIndexable !== undefined) payload.is_indexable = seo.isIndexable;

    if (seo.slug && seo.slug !== current.slug) {
      payload.slug = seo.slug;
      await this.admin.from('seo_redirects').insert({
        from_path: `/paketler/${current.slug}`,
        to_path: `/paketler/${seo.slug}`,
        status_code: 301,
        is_active: true,
      });
    }

    const { error } = await this.client.from('packages').update(payload).eq('id', id);
    if (error) fail(error, 'paket');

    await this.writeAdminLog({
      actorId,
      actorName: (await this.getProfile(actorId))?.displayName ?? 'Kullanıcı',
      action: 'package.seo_update',
      entityType: 'package',
      entityId: id,
      before: { slug: current.slug },
      after: payload,
      createdAt: new Date(Date.now()).toISOString(),
    });

    const updated = await this.getPackage(id);
    if (!updated) throw AppError.notFound('paket');
    return updated;
  }

  // =========================================================================
  // Public projeksiyonlar
  // =========================================================================

  private async loadLookups() {
    const [cities, districts, categories] = await Promise.all([
      this.listCities(),
      this.client.from('districts').select('*').returns<DistrictRow[]>(),
      this.listCategories(),
    ]);
    return {
      cityById: new Map(cities.map((c) => [c.id, c])),
      districtById: new Map((districts.data ?? []).map((d) => [d.id, mapDistrict(d)])),
      categoryById: new Map(categories.map((c) => [c.id, c])),
    };
  }

  async getPublicBusiness(slug: string): Promise<PublicBusiness | null> {
    const business = await this.getBusinessBySlug(slug);
    if (!business || business.status !== 'verified' || !business.isPublic) return null;

    const [branches, packages, lookups] = await Promise.all([
      this.listBranches(business.id),
      this.listPackages({ businessId: business.id }),
      this.loadLookups(),
    ]);

    const category = lookups.categoryById.get(business.categoryId);
    if (!category) return null;

    const branchViews = branches
      .filter((b) => b.isActive)
      .flatMap((branch) => {
        const city = lookups.cityById.get(branch.cityId);
        const district = lookups.districtById.get(branch.districtId);
        return city && district ? [{ branch, city, district }] : [];
      });

    const packageViews = packages.flatMap((pkg) => {
      const branch = branches.find((b) => b.id === pkg.branchId);
      const pkgCategory = lookups.categoryById.get(pkg.categoryId);
      const district = branch ? lookups.districtById.get(branch.districtId) : undefined;
      return pkgCategory && district ? [{ pkg, category: pkgCategory, district }] : [];
    });

    return toPublicBusiness({ business, category, branches: branchViews, packages: packageViews });
  }

  async getPublicPackage(slug: string): Promise<PublicPackage | null> {
    const pkg = await this.getPackageBySlug(slug);
    if (!pkg || !pkg.isPublic) return null;

    const [business, branches, lookups] = await Promise.all([
      this.getBusiness(pkg.businessId),
      this.listBranches(pkg.businessId),
      this.loadLookups(),
    ]);

    if (!business || business.status !== 'verified') return null;
    const branch = branches.find((b) => b.id === pkg.branchId);
    const category = lookups.categoryById.get(pkg.categoryId);
    if (!branch || !category) return null;
    const city = lookups.cityById.get(branch.cityId);
    const district = lookups.districtById.get(branch.districtId);
    if (!city || !district) return null;

    return toPublicPackage({ pkg, business, branch, category, city, district });
  }

  async listPublicPackages(filter: PublicPackageFilter): Promise<PublicPackage[]> {
    const [packages, businesses, lookups] = await Promise.all([
      this.listPackages({ onlyActive: true }),
      this.listBusinesses({ status: 'verified' }),
      this.loadLookups(),
    ]);

    const businessById = new Map(businesses.map((b) => [b.id, b]));
    const branchLists = await Promise.all(businesses.map((b) => this.listBranches(b.id)));
    const branchById = new Map(branchLists.flat().map((b) => [b.id, b]));

    const result: PublicPackage[] = [];

    for (const pkg of packages) {
      if (!pkg.isPublic) continue;
      const business = businessById.get(pkg.businessId);
      const branch = branchById.get(pkg.branchId);
      const category = lookups.categoryById.get(pkg.categoryId);
      if (!business || !branch || !category || !branch.isActive) continue;

      const city = lookups.cityById.get(branch.cityId);
      const district = lookups.districtById.get(branch.districtId);
      if (!city || !district) continue;

      if (filter.citySlug && city.slug !== filter.citySlug) continue;
      if (filter.districtSlug && district.slug !== filter.districtSlug) continue;
      if (filter.categorySlug && category.slug !== filter.categorySlug) continue;
      if (filter.businessSlug && business.slug !== filter.businessSlug) continue;
      if (filter.minPeople && (pkg.minPeople > filter.minPeople || pkg.maxPeople < filter.minPeople))
        continue;

      result.push(toPublicPackage({ pkg, business, branch, category, city, district }));
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
    const businesses = await this.listBusinesses({ status: 'verified' });
    const result: PublicBusiness[] = [];

    for (const business of businesses) {
      if (!business.isPublic) continue;
      const publicBusiness = await this.getPublicBusiness(business.slug);
      if (!publicBusiness) continue;

      if (filter?.categorySlug && publicBusiness.category.slug !== filter.categorySlug) continue;
      if (
        filter?.citySlug &&
        !publicBusiness.branches.some((b) => b.city.slug === filter.citySlug)
      )
        continue;
      if (
        filter?.districtSlug &&
        !publicBusiness.branches.some((b) => b.district.slug === filter.districtSlug)
      )
        continue;

      result.push(publicBusiness);
    }

    return filter?.limit ? result.slice(0, filter.limit) : result;
  }

  async getPublicCitySummary(slug: string): Promise<PublicCitySummary | null> {
    const city = await this.getCityBySlug(slug);
    if (!city || !city.isActive || !city.isPublic) return null;

    const [packages, businesses, districts, categories] = await Promise.all([
      this.listPublicPackages({ citySlug: slug }),
      this.listPublicBusinesses({ citySlug: slug }),
      this.listDistricts(city.id, { onlyActive: true }),
      this.listCategories({ onlyActive: true }),
    ]);

    return {
      city,
      districtCount: districts.length,
      businessCount: businesses.length,
      packageCount: packages.length,
      categories: categories
        .map((category) => ({
          category,
          packageCount: packages.filter((p) => p.category.id === category.id).length,
        }))
        .filter((entry) => entry.packageCount > 0),
    };
  }

  async getPublicDistrictSummary(
    citySlug: string,
    districtSlug: string,
  ): Promise<PublicDistrictSummary | null> {
    const city = await this.getCityBySlug(citySlug);
    if (!city || !city.isActive || !city.isPublic) return null;
    const district = await this.getDistrictBySlug(city.id, districtSlug);
    if (!district || !district.isActive || !district.isPublic) return null;

    const [packages, businesses, categories] = await Promise.all([
      this.listPublicPackages({ citySlug, districtSlug }),
      this.listPublicBusinesses({ citySlug, districtSlug }),
      this.listCategories({ onlyActive: true }),
    ]);

    return {
      district,
      city,
      businessCount: businesses.length,
      packageCount: packages.length,
      categories: categories
        .map((category) => ({
          category,
          packageCount: packages.filter((p) => p.category.id === category.id).length,
        }))
        .filter((entry) => entry.packageCount > 0),
    };
  }

  async getPublicCategorySummary(slug: string): Promise<PublicCategorySummary | null> {
    const category = await this.getCategoryBySlug(slug);
    if (!category || !category.isActive) return null;

    const [packages, businesses, cities] = await Promise.all([
      this.listPublicPackages({ categorySlug: slug }),
      this.listPublicBusinesses({ categorySlug: slug }),
      this.listCities({ onlyActive: true }),
    ]);

    return {
      category,
      businessCount: businesses.length,
      packageCount: packages.length,
      cities: cities
        .map((city) => ({
          city,
          packageCount: packages.filter((p) => p.branch.city.slug === city.slug).length,
        }))
        .filter((entry) => entry.packageCount > 0),
    };
  }

  // =========================================================================
  // Plan
  // =========================================================================

  async createPlan(input: CreatePlanInput, nowIso: string): Promise<Plan> {
    const { data, error } = await this.client
      .from('plans')
      .insert({
        owner_id: input.ownerId,
        name: input.name,
        status: input.status,
        city_id: input.cityId,
        district_id: input.districtId,
        event_date: input.eventDate,
        start_time: input.startTime,
        end_time: input.endTime,
        is_time_flexible: input.isTimeFlexible,
        estimated_people: input.estimatedPeople,
        min_people: input.minPeople,
        max_people: input.maxPeople,
        budget_mode: input.budgetMode,
        budget_per_person: input.budgetPerPerson,
        budget_total: input.budgetTotal,
        note: input.note,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('id')
      .single<{ id: string }>();
    if (error || !data) fail(error, 'plan');

    if (input.categoryIds.length > 0) {
      await this.client
        .from('plan_categories')
        .insert(input.categoryIds.map((categoryId) => ({ plan_id: data.id, category_id: categoryId })));
    }
    if (input.preferenceKeys.length > 0) {
      await this.client
        .from('plan_preferences')
        .insert(input.preferenceKeys.map((key) => ({ plan_id: data.id, preference_key: key })));
    }

    await this.client.from('plan_participants').insert({
      plan_id: data.id,
      user_id: input.ownerId,
      display_name: input.ownerDisplayName,
      status: 'going',
      is_owner: true,
      joined_at: nowIso,
    });

    const plan = await this.getPlan(data.id);
    if (!plan) throw AppError.notFound('plan');
    return plan;
  }

  async updatePlan(id: Id, patch: UpdatePlanInput, nowIso: string): Promise<Plan> {
    const payload: Record<string, unknown> = { updated_at: nowIso };
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.cityId !== undefined) payload.city_id = patch.cityId;
    if (patch.districtId !== undefined) payload.district_id = patch.districtId;
    if (patch.eventDate !== undefined) payload.event_date = patch.eventDate;
    if (patch.startTime !== undefined) payload.start_time = patch.startTime;
    if (patch.endTime !== undefined) payload.end_time = patch.endTime;
    if (patch.isTimeFlexible !== undefined) payload.is_time_flexible = patch.isTimeFlexible;
    if (patch.estimatedPeople !== undefined) payload.estimated_people = patch.estimatedPeople;
    if (patch.minPeople !== undefined) payload.min_people = patch.minPeople;
    if (patch.maxPeople !== undefined) payload.max_people = patch.maxPeople;
    if (patch.budgetMode !== undefined) payload.budget_mode = patch.budgetMode;
    if (patch.budgetPerPerson !== undefined) payload.budget_per_person = patch.budgetPerPerson;
    if (patch.budgetTotal !== undefined) payload.budget_total = patch.budgetTotal;
    if (patch.note !== undefined) payload.note = patch.note;
    if (patch.votingStartsAt !== undefined) payload.voting_starts_at = patch.votingStartsAt;
    if (patch.votingEndsAt !== undefined) payload.voting_ends_at = patch.votingEndsAt;
    if (patch.winningPackageId !== undefined) payload.winning_package_id = patch.winningPackageId;
    if (patch.cancelledReason !== undefined) payload.cancelled_reason = patch.cancelledReason;

    const { error } = await this.client.from('plans').update(payload).eq('id', id);
    if (error) fail(error, 'plan');

    if (patch.categoryIds) {
      await this.client.from('plan_categories').delete().eq('plan_id', id);
      if (patch.categoryIds.length > 0) {
        await this.client
          .from('plan_categories')
          .insert(patch.categoryIds.map((categoryId) => ({ plan_id: id, category_id: categoryId })));
      }
    }
    if (patch.preferenceKeys) {
      await this.client.from('plan_preferences').delete().eq('plan_id', id);
      if (patch.preferenceKeys.length > 0) {
        await this.client
          .from('plan_preferences')
          .insert(patch.preferenceKeys.map((key) => ({ plan_id: id, preference_key: key })));
      }
    }

    const plan = await this.getPlan(id);
    if (!plan) throw AppError.notFound('plan');
    return plan;
  }

  async getPlan(id: Id): Promise<Plan | null> {
    const { data, error } = await this.client
      .from('plans')
      .select(SELECT.plan)
      .eq('id', id)
      .maybeSingle<PlanRow>();
    if (error) fail(error, 'plan');
    return data ? mapPlan(data) : null;
  }

  async listPlansForUser(userId: Id): Promise<Plan[]> {
    // RLS zaten yalnızca erişilebilir planları döndürür.
    const { data, error } = await this.client
      .from('plans')
      .select(SELECT.plan)
      .order('created_at', { ascending: false })
      .returns<PlanRow[]>();
    if (error) fail(error, 'planlar');
    void userId;
    return (data ?? []).map(mapPlan);
  }

  async setPlanStatus(
    id: Id,
    status: PlanStatus,
    nowIso: string,
    reason?: string | null,
  ): Promise<Plan> {
    const payload: Record<string, unknown> = { status, updated_at: nowIso };
    if (reason !== undefined) payload.cancelled_reason = reason;

    const { error } = await this.client.from('plans').update(payload).eq('id', id);
    if (error) fail(error, 'plan');

    const plan = await this.getPlan(id);
    if (!plan) throw AppError.notFound('plan');
    return plan;
  }

  async deletePlan(id: Id): Promise<void> {
    const { error } = await this.client.from('plans').delete().eq('id', id);
    if (error) fail(error, 'plan');
  }

  // =========================================================================
  // Katılımcı
  // =========================================================================

  async listParticipants(planId: Id): Promise<PlanParticipant[]> {
    const { data, error } = await this.client
      .from('plan_participants')
      .select('*')
      .eq('plan_id', planId)
      .order('is_owner', { ascending: false })
      .order('joined_at')
      .returns<ParticipantRow[]>();
    if (error) fail(error, 'katılımcılar');
    return (data ?? []).map(mapParticipant);
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
    const { data, error } = await this.admin
      .from('plan_participants')
      .insert({
        plan_id: input.planId,
        user_id: input.userId,
        guest_token_hash: input.guestTokenHash,
        display_name: input.displayName,
        status: input.status,
        is_owner: input.isOwner,
        joined_at: input.nowIso,
      })
      .select('*')
      .single<ParticipantRow>();
    if (error || !data) fail(error, 'katılımcı');
    return mapParticipant(data);
  }

  async updateParticipantStatus(
    participantId: Id,
    status: ParticipationStatus,
  ): Promise<PlanParticipant> {
    const { data, error } = await this.admin
      .from('plan_participants')
      .update({ status })
      .eq('id', participantId)
      .select('*')
      .single<ParticipantRow>();
    if (error || !data) fail(error, 'katılımcı');
    return mapParticipant(data);
  }

  async removeParticipant(participantId: Id): Promise<void> {
    const { error } = await this.client
      .from('plan_participants')
      .delete()
      .eq('id', participantId);
    if (error) fail(error, 'katılımcı');
  }

  async findParticipantByUser(planId: Id, userId: Id): Promise<PlanParticipant | null> {
    const { data, error } = await this.client
      .from('plan_participants')
      .select('*')
      .eq('plan_id', planId)
      .eq('user_id', userId)
      .maybeSingle<ParticipantRow>();
    if (error) fail(error, 'katılımcı');
    return data ? mapParticipant(data) : null;
  }

  async findParticipantByGuestHash(
    planId: Id,
    guestTokenHash: string,
  ): Promise<PlanParticipant | null> {
    const { data, error } = await this.admin
      .from('plan_participants')
      .select('*')
      .eq('plan_id', planId)
      .eq('guest_token_hash', guestTokenHash)
      .maybeSingle<ParticipantRow>();
    if (error) fail(error, 'katılımcı');
    return data ? mapParticipant(data) : null;
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
    await this.client
      .from('plan_invitations')
      .update({ revoked_at: input.nowIso })
      .eq('plan_id', input.planId)
      .is('revoked_at', null);

    const { data, error } = await this.client
      .from('plan_invitations')
      .insert({
        plan_id: input.planId,
        token_hash: input.tokenHash,
        short_code: input.shortCode,
        created_by: input.createdBy,
        expires_at: input.expiresAt,
        created_at: input.nowIso,
      })
      .select('*')
      .single<InvitationRow>();
    if (error || !data) fail(error, 'davet');
    return mapInvitation(data);
  }

  async getInvitationByTokenHash(tokenHash: string): Promise<PlanInvitation | null> {
    const { data, error } = await this.admin
      .from('plan_invitations')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle<InvitationRow>();
    if (error) fail(error, 'davet');
    return data ? mapInvitation(data) : null;
  }

  async getInvitationByShortCode(shortCode: string): Promise<PlanInvitation | null> {
    const { data, error } = await this.admin
      .from('plan_invitations')
      .select('*')
      .eq('short_code', shortCode)
      .is('revoked_at', null)
      .maybeSingle<InvitationRow>();
    if (error) fail(error, 'davet');
    return data ? mapInvitation(data) : null;
  }

  async getActiveInvitation(planId: Id): Promise<PlanInvitation | null> {
    const { data, error } = await this.client
      .from('plan_invitations')
      .select('*')
      .eq('plan_id', planId)
      .is('revoked_at', null)
      .maybeSingle<InvitationRow>();
    if (error) fail(error, 'davet');
    return data ? mapInvitation(data) : null;
  }

  async revokeInvitation(id: Id, nowIso: string): Promise<void> {
    const { error } = await this.client
      .from('plan_invitations')
      .update({ revoked_at: nowIso })
      .eq('id', id);
    if (error) fail(error, 'davet');
  }

  async incrementInvitationUse(id: Id): Promise<void> {
    await this.admin.rpc('increment_invitation_use', { invitation_id: id });
  }

  // =========================================================================
  // Oylama
  // =========================================================================

  async listVotes(planId: Id): Promise<Vote[]> {
    const { data, error } = await this.client
      .from('votes')
      .select('*')
      .eq('plan_id', planId)
      .returns<VoteRow[]>();
    if (error) fail(error, 'oylar');
    return (data ?? []).map(mapVote);
  }

  async castVote(input: {
    planId: Id;
    participantId: Id;
    packageId: Id;
    nowIso: string;
  }): Promise<Vote> {
    // UNIQUE(plan_id, participant_id) → upsert ile oy değiştirme.
    const { data, error } = await this.admin
      .from('votes')
      .upsert(
        {
          plan_id: input.planId,
          participant_id: input.participantId,
          package_id: input.packageId,
          updated_at: input.nowIso,
        },
        { onConflict: 'plan_id,participant_id' },
      )
      .select('*')
      .single<VoteRow>();
    if (error || !data) fail(error, 'oy');
    return mapVote(data);
  }

  async removeVote(planId: Id, participantId: Id): Promise<void> {
    const { error } = await this.admin
      .from('votes')
      .delete()
      .eq('plan_id', planId)
      .eq('participant_id', participantId);
    if (error) fail(error, 'oy');
  }

  // =========================================================================
  // Rezervasyon
  // =========================================================================

  async createReservation(
    input: CreateReservationInput,
    code: string,
    nowIso: string,
  ): Promise<Reservation> {
    const { data, error } = await this.client
      .from('reservations')
      .insert({
        plan_id: input.planId,
        package_id: input.packageId,
        branch_id: input.branchId,
        business_id: input.businessId,
        created_by: input.createdBy,
        code,
        people_count: input.peopleCount,
        reserved_date: input.reservedDate,
        reserved_start_time: input.reservedStartTime,
        reserved_end_time: input.reservedEndTime,
        total_price: input.totalPrice,
        per_person_price: input.perPersonPrice,
        contact_name: input.contactName,
        contact_phone: input.contactPhone,
        note: input.note,
        status: 'pending_business',
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('*')
      .single<ReservationRow>();
    if (error || !data) fail(error, 'rezervasyon');
    return mapReservation(data);
  }

  async getReservation(id: Id): Promise<Reservation | null> {
    const { data, error } = await this.client
      .from('reservations')
      .select('*')
      .eq('id', id)
      .maybeSingle<ReservationRow>();
    if (error) fail(error, 'rezervasyon');
    return data ? mapReservation(data) : null;
  }

  async getReservationByCode(code: string): Promise<Reservation | null> {
    const { data, error } = await this.client
      .from('reservations')
      .select('*')
      .eq('code', code)
      .maybeSingle<ReservationRow>();
    if (error) fail(error, 'rezervasyon');
    return data ? mapReservation(data) : null;
  }

  async listReservationsForUser(userId: Id): Promise<Reservation[]> {
    const { data, error } = await this.client
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .returns<ReservationRow[]>();
    if (error) fail(error, 'rezervasyonlar');
    void userId;
    return (data ?? []).map(mapReservation);
  }

  async listReservationsForBusiness(
    businessId: Id,
    status?: ReservationStatus,
  ): Promise<BusinessReservationRow[]> {
    let query = this.client
      .from('reservations')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query.returns<ReservationRow[]>();
    if (error) fail(error, 'rezervasyonlar');

    const rows = (data ?? []).map(mapReservation);
    const [packages, branches] = await Promise.all([
      this.listPackages({ businessId }),
      this.listBranches(businessId),
    ]);
    const packageById = new Map(packages.map((p) => [p.id, p]));
    const branchById = new Map(branches.map((b) => [b.id, b]));

    const planNames = new Map<string, string>();
    for (const reservation of rows) {
      if (!planNames.has(reservation.planId)) {
        const plan = await this.getPlan(reservation.planId);
        planNames.set(reservation.planId, plan?.name ?? '');
      }
    }

    return rows.map((reservation) => ({
      reservation,
      packageName: packageById.get(reservation.packageId)?.name ?? '—',
      branchName: branchById.get(reservation.branchId)?.name ?? '—',
      planName: planNames.get(reservation.planId) || null,
    }));
  }

  async listReservationsForPlan(planId: Id): Promise<Reservation[]> {
    const { data, error } = await this.client
      .from('reservations')
      .select('*')
      .eq('plan_id', planId)
      .returns<ReservationRow[]>();
    if (error) fail(error, 'rezervasyonlar');
    return (data ?? []).map(mapReservation);
  }

  async changeReservationStatus(input: {
    id: Id;
    status: ReservationStatus;
    actorId: Id;
    reason?: string | null;
    rejectionReason?: RejectionReason | null;
    nowIso: string;
  }): Promise<Reservation> {
    const current = await this.getReservation(input.id);
    if (!current) throw AppError.notFound('rezervasyon');
    assertReservationTransition(current.status, input.status);

    const payload: Record<string, unknown> = {
      status: input.status,
      updated_at: input.nowIso,
    };
    if (input.rejectionReason !== undefined) payload.rejection_reason = input.rejectionReason;
    if (input.reason !== undefined) payload.rejection_note = input.reason;

    const { data, error } = await this.client
      .from('reservations')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single<ReservationRow>();
    if (error || !data) fail(error, 'rezervasyon');

    // Durum geçmişi trigger ile yazılır; changed_by burada tamamlanır.
    await this.admin
      .from('reservation_status_history')
      .update({ changed_by: input.actorId, reason: input.reason ?? null })
      .eq('reservation_id', input.id)
      .eq('to_status', input.status)
      .is('changed_by', null);

    return mapReservation(data);
  }

  async listReservationHistory(reservationId: Id): Promise<ReservationStatusEvent[]> {
    const { data, error } = await this.client
      .from('reservation_status_history')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('created_at')
      .returns<ReservationEventRow[]>();
    if (error) fail(error, 'rezervasyon geçmişi');
    return (data ?? []).map(mapReservationEvent);
  }

  // =========================================================================
  // Bildirim ve favori
  // =========================================================================

  async listNotifications(userId: Id): Promise<AppNotification[]> {
    const { data, error } = await this.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
      .returns<NotificationRow[]>();
    if (error) fail(error, 'bildirimler');
    return (data ?? []).map(mapNotification);
  }

  async createNotification(input: Omit<AppNotification, 'id'>): Promise<AppNotification> {
    const { data, error } = await this.admin
      .from('notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
        read_at: input.readAt,
        created_at: input.createdAt,
      })
      .select('*')
      .single<NotificationRow>();
    if (error || !data) fail(error, 'bildirim');
    return mapNotification(data);
  }

  async markNotificationRead(id: Id, nowIso: string): Promise<void> {
    const { error } = await this.client
      .from('notifications')
      .update({ read_at: nowIso })
      .eq('id', id);
    if (error) fail(error, 'bildirim');
  }

  async markAllNotificationsRead(userId: Id, nowIso: string): Promise<void> {
    const { error } = await this.client
      .from('notifications')
      .update({ read_at: nowIso })
      .eq('user_id', userId)
      .is('read_at', null);
    if (error) fail(error, 'bildirimler');
  }

  async listFavorites(userId: Id): Promise<Favorite[]> {
    const { data, error } = await this.client
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .returns<Array<{ user_id: string; package_id: string; created_at: string }>>();
    if (error) fail(error, 'favoriler');
    return (data ?? []).map((r) => ({
      userId: r.user_id,
      packageId: r.package_id,
      createdAt: r.created_at,
    }));
  }

  async toggleFavorite(userId: Id, packageId: Id, nowIso: string): Promise<boolean> {
    const { data: existing } = await this.client
      .from('favorites')
      .select('user_id')
      .eq('user_id', userId)
      .eq('package_id', packageId)
      .maybeSingle<{ user_id: string }>();

    if (existing) {
      await this.client
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('package_id', packageId);
      return false;
    }

    await this.client
      .from('favorites')
      .insert({ user_id: userId, package_id: packageId, created_at: nowIso });
    return true;
  }

  // =========================================================================
  // İçerik ve SEO
  // =========================================================================

  async listHelpArticles(options?: { onlyPublic?: boolean }): Promise<HelpArticle[]> {
    let query = this.client.from('help_articles').select('*').order('sort_order');
    if (options?.onlyPublic) query = query.eq('is_public', true);
    const { data, error } = await query.returns<HelpArticleRow[]>();
    if (error) fail(error, 'yardım içerikleri');
    return (data ?? []).map(mapHelpArticle);
  }

  async getHelpArticle(slug: string): Promise<HelpArticle | null> {
    const { data, error } = await this.client
      .from('help_articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle<HelpArticleRow>();
    if (error) fail(error, 'yardım içeriği');
    return data ? mapHelpArticle(data) : null;
  }

  async listSeoRedirects(): Promise<SeoRedirect[]> {
    const { data, error } = await this.client
      .from('seo_redirects')
      .select('*')
      .eq('is_active', true)
      .returns<SeoRedirectRow[]>();
    if (error) fail(error, 'yönlendirmeler');
    return (data ?? []).map(mapSeoRedirect);
  }

  async findRedirect(fromPath: string): Promise<SeoRedirect | null> {
    const { data, error } = await this.client
      .from('seo_redirects')
      .select('*')
      .eq('from_path', fromPath)
      .eq('is_active', true)
      .maybeSingle<SeoRedirectRow>();
    if (error) fail(error, 'yönlendirme');
    return data ? mapSeoRedirect(data) : null;
  }

  // =========================================================================
  // Yönetim
  // =========================================================================

  async getAdminOverview(): Promise<AdminOverviewStats> {
    const count = async (table: string, filter?: (q: ReturnType<SupabaseClient['from']>) => unknown) => {
      const query = this.admin.from(table).select('*', { count: 'exact', head: true });
      void filter;
      const { count: result } = await query;
      return result ?? 0;
    };

    const [users, businesses, packages, plans, reservations, cities] = await Promise.all([
      count('profiles'),
      count('businesses'),
      count('packages'),
      count('plans'),
      count('reservations'),
      count('cities'),
    ]);

    const { count: pendingApplications } = await this.admin
      .from('business_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: openReports } = await this.admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: openTickets } = await this.admin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: activeCities } = await this.admin
      .from('cities')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    void cities;

    return {
      userCount: users,
      businessCount: businesses,
      pendingApplications: pendingApplications ?? 0,
      packageCount: packages,
      planCount: plans,
      reservationCount: reservations,
      openReports: openReports ?? 0,
      openTickets: openTickets ?? 0,
      activeCities: activeCities ?? 0,
    };
  }

  async getBusinessDashboard(businessId: Id, todayIso: IsoDate): Promise<BusinessDashboardStats> {
    const [packages, reservations] = await Promise.all([
      this.listPackages({ businessId }),
      this.listReservationsForBusiness(businessId),
    ]);

    const all = reservations.map((r) => r.reservation);
    const confirmed = all.filter((r) => r.status === 'confirmed');
    const responded = all.filter(
      (r) => r.status !== 'pending_business' && r.status !== 'created',
    );

    const averageResponseHours =
      responded.length === 0
        ? null
        : Math.round(
            (responded.reduce(
              (sum, r) =>
                sum +
                Math.max(0, new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) /
                  3_600_000,
              0,
            ) /
              responded.length) *
              10,
          ) / 10;

    return {
      totalPackages: packages.length,
      activePackages: packages.filter((p) => p.isActive).length,
      pendingReservations: all.filter((r) => r.status === 'pending_business').length,
      confirmedReservations: confirmed.length,
      upcomingReservations: confirmed.filter((r) => r.reservedDate >= todayIso).length,
      totalGuestsThisMonth: all
        .filter((r) => r.reservedDate.startsWith(todayIso.slice(0, 7)) && r.status !== 'rejected')
        .reduce((sum, r) => sum + r.peopleCount, 0),
      averageResponseHours,
    };
  }

  async listAdminLogs(limit = 100): Promise<AdminLogEntry[]> {
    const { data, error } = await this.admin
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .returns<AdminLogRow[]>();
    if (error) fail(error, 'audit log');
    return (data ?? []).map(mapAdminLog);
  }

  async writeAdminLog(entry: Omit<AdminLogEntry, 'id'>): Promise<void> {
    await this.admin.from('admin_logs').insert({
      actor_id: entry.actorId,
      actor_name: entry.actorName,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      before: entry.before,
      after: entry.after,
      created_at: entry.createdAt,
    });
  }

  // =========================================================================
  // Hız sınırı
  // =========================================================================

  async incrementRateLimit(key: string, windowStartMs: number): Promise<number> {
    const { data, error } = await this.admin.rpc('increment_rate_limit', {
      p_key: key,
      p_window_start: new Date(windowStartMs).toISOString(),
    });
    if (error) {
      // Hız sınırı altyapısı çalışmıyorsa isteği engelleme; olayı loglamak yeterli.
      return 0;
    }
    return typeof data === 'number' ? data : 0;
  }

  async resetRateLimit(key: string): Promise<void> {
    await this.admin.from('rate_limits').delete().eq('key', key);
  }
}
