import type {
  Business,
  BusinessBranch,
  Category,
  City,
  District,
  PublicBranch,
  PublicBusiness,
  PublicPackage,
  PublicPackageSummary,
  VenuePackage,
} from '@hazirgrup/types';
import { packageStartingPrices } from '../budget/index';

/**
 * Public projeksiyonlar.
 *
 * Bu fonksiyonlar herkese açık sayfalara giden veriyi üretir ve **alan beyaz
 * listesi** görevi görür: kişisel veri (kullanıcı adı, e-posta, plan bütçesi,
 * katılımcı bilgisi) hiçbir koşulda çıktıya giremez.
 * (docs/SECURITY_MODEL.md T-5, testleri: tests/security/public-projection.test.ts)
 */

export function toPublicBranch(
  branch: BusinessBranch,
  city: City,
  district: District,
): PublicBranch {
  return {
    id: branch.id,
    name: branch.name,
    address: branch.address,
    city: { id: city.id, name: city.name, slug: city.slug },
    district: { id: district.id, name: district.name, slug: district.slug },
    phone: branch.phone,
    whatsapp: branch.whatsapp,
    lat: branch.lat,
    lng: branch.lng,
    hours: branch.hours,
  };
}

export function toPublicPackageSummary(
  pkg: VenuePackage,
  business: Business,
  category: Category,
  district: District,
): PublicPackageSummary {
  const prices = packageStartingPrices({
    pricingModel: pkg.pricingModel,
    priceAmount: pkg.priceAmount,
    minPeople: pkg.minPeople,
    maxPeople: pkg.maxPeople,
  });

  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    categoryName: category.name,
    minPeople: pkg.minPeople,
    maxPeople: pkg.maxPeople,
    pricingModel: pkg.pricingModel,
    perPersonFrom: prices.perPersonFrom,
    totalFrom: prices.totalFrom,
    imageUrl: pkg.images[0]?.url ?? null,
    businessName: business.name,
    districtName: district.name,
  };
}

export function toPublicBusiness(input: {
  business: Business;
  category: Category;
  branches: Array<{ branch: BusinessBranch; city: City; district: District }>;
  packages: Array<{ pkg: VenuePackage; category: Category; district: District }>;
}): PublicBusiness {
  const { business, category, branches, packages } = input;

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    category: { id: category.id, name: category.name, slug: category.slug },
    logoUrl: business.logoUrl,
    coverUrl: business.coverUrl,
    phone: business.phone,
    whatsapp: business.whatsapp,
    website: business.website,
    instagram: business.instagram,
    isVerified: business.status === 'verified',
    branches: branches.map((b) => toPublicBranch(b.branch, b.city, b.district)),
    packages: packages
      .filter((p) => p.pkg.isActive && p.pkg.isPublic)
      .map((p) => toPublicPackageSummary(p.pkg, business, p.category, p.district)),
    seoTitle: business.seoTitle,
    seoDescription: business.seoDescription,
    seoCanonical: business.seoCanonical,
    ogImageUrl: business.ogImageUrl,
    isIndexable: business.isIndexable,
    updatedAt: business.updatedAt,
  };
}

export function toPublicPackage(input: {
  pkg: VenuePackage;
  business: Business;
  branch: BusinessBranch;
  category: Category;
  city: City;
  district: District;
}): PublicPackage {
  const { pkg, business, branch, category, city, district } = input;
  const prices = packageStartingPrices({
    pricingModel: pkg.pricingModel,
    priceAmount: pkg.priceAmount,
    minPeople: pkg.minPeople,
    maxPeople: pkg.maxPeople,
  });

  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description,
    minPeople: pkg.minPeople,
    maxPeople: pkg.maxPeople,
    pricingModel: pkg.pricingModel,
    priceAmount: pkg.priceAmount,
    perPersonFrom: prices.perPersonFrom,
    totalFrom: prices.totalFrom,
    durationMinutes: pkg.durationMinutes,
    reservationTerms: pkg.reservationTerms,
    cancellationTerms: pkg.cancellationTerms,
    isActive: pkg.isActive,
    items: pkg.items,
    images: pkg.images,
    availability: pkg.availability,
    category: { id: category.id, name: category.name, slug: category.slug },
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      logoUrl: business.logoUrl,
      isVerified: business.status === 'verified',
      phone: business.phone,
      whatsapp: business.whatsapp,
    },
    branch: toPublicBranch(branch, city, district),
    seoTitle: pkg.seoTitle,
    seoDescription: pkg.seoDescription,
    seoCanonical: pkg.seoCanonical,
    ogImageUrl: pkg.ogImageUrl,
    isIndexable: pkg.isIndexable,
    updatedAt: pkg.updatedAt,
  };
}

/**
 * Public çıktıda bulunmaması gereken alan adları.
 * Güvenlik testi bu listeyi kullanarak sızıntı kontrolü yapar.
 */
export const FORBIDDEN_PUBLIC_FIELDS = [
  'ownerId',
  'createdBy',
  'email',
  'password',
  'taxInfo',
  'budgetPerPerson',
  'budgetTotal',
  'contactPhone',
  'contactName',
  'guestTokenHash',
  'tokenHash',
  'displayName',
  'note',
] as const;
