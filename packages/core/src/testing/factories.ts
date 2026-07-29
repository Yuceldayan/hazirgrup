import type {
  Business,
  BusinessBranch,
  Category,
  City,
  District,
  VenuePackage,
} from '@hazirgrup/types';
import type { MatchCandidate } from '../matching/index';

/**
 * Test ve demo verisi için nesne fabrikaları.
 * Üretim kodunda kullanılmaz; testlerin okunabilir kalması içindir.
 */

const T = '2026-01-01T00:00:00.000Z';

export function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'city-hakkari',
    countryId: 'country-tr',
    name: 'Hakkâri',
    slug: 'hakkari',
    intro: null,
    isActive: true,
    isPublic: true,
    sortOrder: 0,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
    ...overrides,
  };
}

export function makeDistrict(overrides: Partial<District> = {}): District {
  return {
    id: 'district-merkez',
    cityId: 'city-hakkari',
    name: 'Merkez',
    slug: 'merkez',
    intro: null,
    isActive: true,
    isPublic: true,
    sortOrder: 0,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-cafe',
    key: 'cafe_restaurant',
    name: 'Kafe & Restoran',
    slug: 'kafe-restoran',
    icon: 'coffee',
    description: null,
    isActive: true,
    sortOrder: 0,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
    ...overrides,
  };
}

export function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'biz-1',
    ownerId: 'user-owner',
    name: 'Örnek Kafe',
    slug: 'ornek-kafe',
    description: 'Kurgusal demo işletmesi.',
    categoryId: 'cat-cafe',
    status: 'verified',
    isPublic: true,
    logoUrl: null,
    coverUrl: null,
    phone: '05001112233',
    whatsapp: '05001112233',
    website: null,
    instagram: null,
    verifiedAt: T,
    verifiedBy: 'user-admin',
    createdAt: T,
    updatedAt: T,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
    ...overrides,
  };
}

export function makeBranch(overrides: Partial<BusinessBranch> = {}): BusinessBranch {
  return {
    id: 'branch-1',
    businessId: 'biz-1',
    name: 'Merkez Şube',
    slug: 'merkez-sube',
    cityId: 'city-hakkari',
    districtId: 'district-merkez',
    address: 'Örnek Mahallesi, Demo Caddesi No:1',
    lat: null,
    lng: null,
    phone: '05001112233',
    whatsapp: '05001112233',
    isActive: true,
    hours: [
      { weekday: 0, opensAt: '10:00', closesAt: '23:00', isClosed: false },
      { weekday: 1, opensAt: '10:00', closesAt: '23:00', isClosed: false },
      { weekday: 2, opensAt: '10:00', closesAt: '23:00', isClosed: false },
      { weekday: 3, opensAt: '10:00', closesAt: '23:00', isClosed: false },
      { weekday: 4, opensAt: '10:00', closesAt: '23:00', isClosed: false },
      { weekday: 5, opensAt: '10:00', closesAt: '24:00', isClosed: false },
      { weekday: 6, opensAt: '10:00', closesAt: '24:00', isClosed: false },
    ],
    createdAt: T,
    ...overrides,
  };
}

export function makePackage(overrides: Partial<VenuePackage> = {}): VenuePackage {
  return {
    id: 'pkg-1',
    businessId: 'biz-1',
    branchId: 'branch-1',
    categoryId: 'cat-cafe',
    name: '4–6 Kişilik Kahve ve Tatlı Paketi',
    slug: '4-6-kisilik-kahve-ve-tatli-paketi',
    description: 'Kurgusal demo paketi.',
    minPeople: 4,
    maxPeople: 6,
    pricingModel: 'per_person',
    priceAmount: 20000,
    durationMinutes: 120,
    reservationTerms: 'Rezervasyon en az 2 saat önce yapılmalıdır.',
    cancellationTerms: 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal.',
    isActive: true,
    isPublic: true,
    popularity: 50,
    items: [],
    images: [],
    availability: [
      { weekday: 0, startTime: '12:00', endTime: '23:00' },
      { weekday: 1, startTime: '12:00', endTime: '23:00' },
      { weekday: 2, startTime: '12:00', endTime: '23:00' },
      { weekday: 3, startTime: '12:00', endTime: '23:00' },
      { weekday: 4, startTime: '12:00', endTime: '23:00' },
      { weekday: 5, startTime: '12:00', endTime: '23:00' },
      { weekday: 6, startTime: '12:00', endTime: '23:00' },
    ],
    preferenceKeys: [],
    createdAt: T,
    updatedAt: T,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
    ...overrides,
  };
}

/** Tam bir eşleştirme adayı oluşturur. */
export function makeCandidate(
  packageOverrides: Partial<VenuePackage> = {},
  context: Partial<Omit<MatchCandidate, 'package'>> = {},
): MatchCandidate {
  return {
    package: makePackage(packageOverrides),
    business: context.business ?? makeBusiness(),
    branch: context.branch ?? makeBranch(),
    category: context.category ?? makeCategory(),
    city: context.city ?? makeCity(),
    district: context.district ?? makeDistrict(),
  };
}
