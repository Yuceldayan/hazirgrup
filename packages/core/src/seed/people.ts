import type { AppRole, BusinessMember, Profile } from '@hazirgrup/types';

/**
 * Demo kullanıcılar.
 *
 * TÜM KULLANICILAR KURGUSALDIR. E-posta adresleri, IETF tarafından test için
 * ayrılmış `.test` üst alan adını kullanır ve gerçek bir adrese ulaşmaz.
 * Şifreler `docs/SETUP.md` içinde belgelenmiştir.
 */

export interface DemoUser {
  profile: Profile;
  roles: AppRole[];
  /** Yalnızca demo modda kullanılır; Supabase modunda Auth yönetir. */
  password: string;
}

const T = '2026-01-10T08:00:00.000Z';

function profile(
  id: string,
  displayName: string,
  email: string,
  overrides: Partial<Profile> = {},
): Profile {
  return {
    id,
    displayName,
    email,
    phone: null,
    avatarUrl: null,
    cityId: 'city-hakkari',
    districtId: 'district-merkez',
    theme: 'system',
    locale: 'tr',
    isSuspended: false,
    deletedAt: null,
    createdAt: T,
    updatedAt: T,
    ...overrides,
  };
}

const OWNER_NAMES: Array<[string, string]> = [
  ['user-owner-01', 'Serkan Aydın'],
  ['user-owner-02', 'Nazlı Ergün'],
  ['user-owner-03', 'Hakan Toprak'],
  ['user-owner-04', 'Sevil Barış'],
  ['user-owner-05', 'Onur Çetin'],
  ['user-owner-06', 'Derya Kılıç'],
  ['user-owner-07', 'Volkan Tunç'],
  ['user-owner-08', 'Ceren Aksoy'],
  ['user-owner-09', 'Burak Yalçın'],
  ['user-owner-10', 'Melis Duran'],
];

export const DEMO_USERS: DemoUser[] = [
  {
    profile: profile('user-demo', 'Elif Demir', 'elif@ornek.test', { phone: '05001234567' }),
    roles: ['user'],
    password: 'Demo1234',
  },
  {
    profile: profile('user-friend-1', 'Kerem Aslan', 'kerem@ornek.test'),
    roles: ['user'],
    password: 'Demo1234',
  },
  {
    profile: profile('user-friend-2', 'Zeynep Kaya', 'zeynep@ornek.test'),
    roles: ['user'],
    password: 'Demo1234',
  },
  {
    profile: profile('user-friend-3', 'Mert Şahin', 'mert@ornek.test', {
      districtId: 'district-yuksekova',
    }),
    roles: ['user'],
    password: 'Demo1234',
  },
  {
    profile: profile('user-admin', 'Sistem Yöneticisi', 'admin@ornek.test'),
    roles: ['user', 'admin'],
    password: 'Admin1234',
  },
  {
    profile: profile('user-staff-01', 'Kuzey Işığı Personeli', 'personel@ornek.test'),
    roles: ['user', 'business_staff'],
    password: 'Demo1234',
  },
  // Başvurusu inceleme aşamasında olan aday işletmeci
  {
    profile: profile('user-applicant', 'Aday İşletmeci', 'basvuru@ornek.test'),
    roles: ['user'],
    password: 'Demo1234',
  },
  ...OWNER_NAMES.map(([id, name], index) => ({
    profile: profile(id, name, `isletme${String(index + 1).padStart(2, '0')}@ornek.test`, {
      phone: `0500111${String(index + 1).padStart(4, '0')}`,
    }),
    roles: ['user', 'business_owner'] as AppRole[],
    password: 'Isletme1234',
  })),
];

export const BUSINESS_MEMBERS: BusinessMember[] = [
  ...OWNER_NAMES.map(([userId], index) => ({
    businessId: `biz-${String(index + 1).padStart(2, '0')}`,
    userId,
    role: 'owner' as const,
    invitedBy: null,
    createdAt: T,
  })),
  {
    businessId: 'biz-01',
    userId: 'user-staff-01',
    role: 'staff',
    invitedBy: 'user-owner-01',
    createdAt: T,
  },
];

/** Giriş ekranında gösterilecek demo hesapları (yalnızca demo modda). */
export const DEMO_LOGIN_HINTS = [
  { label: 'Kullanıcı', email: 'elif@ornek.test', password: 'Demo1234' },
  { label: 'İşletme', email: 'isletme01@ornek.test', password: 'Isletme1234' },
  { label: 'Yönetici', email: 'admin@ornek.test', password: 'Admin1234' },
] as const;
