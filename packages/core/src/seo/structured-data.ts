import type { BranchHours, Kurus, PublicBusiness, PublicPackage } from '@hazirgrup/types';
import { WEEKDAYS } from '@hazirgrup/types';
import { absoluteUrl } from './routes';
import { SITE_NAME } from './metadata';

/**
 * Schema.org JSON-LD üretimi.
 *
 * Kural (docs/SEO_STRATEGY.md §7): **sahte veri üretilmez**.
 * Kullanıcı yorumu yoksa `aggregateRating` / `review` eklenmez.
 * `Event` yalnızca gerçek bir etkinlik varsa kullanılır — Faz 1'de kullanılmaz.
 */

export type JsonLd = Record<string, unknown>;

const SCHEMA_WEEKDAYS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/** Kategori anahtarına göre uygun LocalBusiness alt tipi. */
export function localBusinessType(categoryKey: string): string {
  switch (categoryKey) {
    case 'cafe_restaurant':
      return 'Restaurant';
    case 'football_pitch':
      return 'SportsActivityLocation';
    case 'game_lounge':
      return 'EntertainmentBusiness';
    default:
      return 'LocalBusiness';
  }
}

export function organizationJsonLd(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl(siteUrl, '/'),
    logo: absoluteUrl(siteUrl, '/logo.svg'),
    description:
      'Arkadaş gruplarının kişi sayısı, bütçe ve saat tercihlerine göre uygun mekân paketlerini bulup birlikte karar vermesini sağlayan platform.',
  };
}

export function webSiteJsonLd(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl(siteUrl, '/'),
    inLanguage: 'tr-TR',
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(siteUrl: string, items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}

function openingHours(hours: BranchHours[]): Array<JsonLd> {
  return WEEKDAYS.flatMap((weekday) => {
    const entry = hours.find((h) => h.weekday === weekday);
    if (!entry || entry.isClosed || !entry.opensAt || !entry.closesAt) return [];
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${SCHEMA_WEEKDAYS[weekday]}`,
        opens: entry.opensAt,
        closes: entry.closesAt,
      },
    ];
  });
}

export function localBusinessJsonLd(
  siteUrl: string,
  business: PublicBusiness,
  categoryKey: string,
): JsonLd {
  const primaryBranch = business.branches[0];

  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': localBusinessType(categoryKey),
    name: business.name,
    description: business.description,
    url: absoluteUrl(siteUrl, `/mekanlar/${business.slug}`),
  };

  if (business.logoUrl) node.image = business.logoUrl;
  if (business.phone) node.telephone = business.phone;

  if (primaryBranch) {
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: primaryBranch.address,
      addressLocality: primaryBranch.district.name,
      addressRegion: primaryBranch.city.name,
      addressCountry: 'TR',
    };

    if (primaryBranch.lat !== null && primaryBranch.lng !== null) {
      node.geo = {
        '@type': 'GeoCoordinates',
        latitude: primaryBranch.lat,
        longitude: primaryBranch.lng,
      };
    }

    const hours = openingHours(primaryBranch.hours);
    if (hours.length > 0) node.openingHoursSpecification = hours;
  }

  if (business.branches.length > 1) {
    node.department = business.branches.slice(1).map((branch) => ({
      '@type': 'LocalBusiness',
      name: `${business.name} — ${branch.name}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: branch.address,
        addressLocality: branch.district.name,
        addressRegion: branch.city.name,
        addressCountry: 'TR',
      },
    }));
  }

  // NOT: aggregateRating / review eklenmez — gerçek kullanıcı yorumu yok.
  return node;
}

export function packageOfferJsonLd(siteUrl: string, pkg: PublicPackage): JsonLd {
  const url = absoluteUrl(siteUrl, `/paketler/${pkg.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: pkg.name,
    description: pkg.description,
    url,
    price: (pkg.totalFrom / 100).toFixed(2),
    priceCurrency: 'TRY',
    availability: pkg.isActive
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: pkg.business.name,
      url: absoluteUrl(siteUrl, `/mekanlar/${pkg.business.slug}`),
    },
    itemOffered: {
      '@type': 'Product',
      name: pkg.name,
      description: pkg.description,
      category: pkg.category.name,
      ...(pkg.images[0] ? { image: pkg.images[0].url } : {}),
    },
    areaServed: {
      '@type': 'City',
      name: pkg.branch.city.name,
    },
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      minValue: pkg.minPeople,
      maxValue: pkg.maxPeople,
      unitText: 'kişi',
    },
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqJsonLd(entries: FaqEntry[]): JsonLd | null {
  if (entries.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/** Paket listesi için ItemList — şehir/kategori sayfalarında kullanılır. */
export function itemListJsonLd(
  siteUrl: string,
  items: Array<{ name: string; slug: string; perPersonFrom: Kurus }>,
): JsonLd | null {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(siteUrl, `/paketler/${item.slug}`),
    })),
  };
}

/**
 * JSON-LD'yi HTML'e güvenle gömmek için serileştirir.
 * `</script>` kaçışı XSS'i önler.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
