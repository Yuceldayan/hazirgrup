import { RESERVED_SLUGS, isReservedSlug } from '../config/constants';

/** Public route üretimi ve robots politikası — tek kaynak. */

export const ROUTES = {
  home: () => '/',
  howItWorks: () => '/nasil-calisir',
  cities: () => '/sehirler',
  city: (citySlug: string) => `/${citySlug}`,
  district: (citySlug: string, districtSlug: string) => `/${citySlug}/${districtSlug}`,
  categories: () => '/kategoriler',
  category: (slug: string) => `/kategoriler/${slug}`,
  business: (slug: string) => `/mekanlar/${slug}`,
  package: (slug: string) => `/paketler/${slug}`,
  guides: () => '/rehber',
  guide: (slug: string) => `/rehber/${slug}`,
  faq: () => '/sss',
  help: (slug: string) => `/yardim/${slug}`,
  legal: (slug: string) => `/legal/${slug}`,
  invite: (token: string) => `/davet/${token}`,
  signIn: () => '/auth/giris',
  signUp: () => '/auth/kayit',
  account: () => '/hesap',
  plan: (id: string) => `/hesap/plan/${id}`,
  businessPanel: () => '/business',
  adminPanel: () => '/admin',
} as const;

/** Arama motorlarına kapalı yol önekleri. */
export const NOINDEX_PREFIXES: readonly string[] = [
  '/admin',
  '/business',
  '/auth',
  '/hesap',
  '/davet',
  '/plan',
  '/rezervasyon',
  '/onizleme',
  '/api',
];

export function isNoindexPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return NOINDEX_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/**
 * Yolu tekilleştirir: sondaki eğik çizgi kaldırılır, çoklu eğik çizgi
 * teke indirilir, sorgu ve fragment atılır (docs/SEO_STRATEGY.md §4).
 */
export function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? '/';
  const collapsed = withoutQuery.replace(/\/{2,}/g, '/');
  if (collapsed === '/') return '/';
  return collapsed.replace(/\/+$/, '');
}

/** Mutlak canonical URL üretir. */
export function absoluteUrl(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const path = normalizePath(pathname);
  return path === '/' ? `${base}/` : `${base}${path}`;
}

/**
 * Kök seviyedeki `[city]` segmentinin statik route'larla çakışmadığını doğrular (D-006).
 * Rezerve bir slug şehir olarak çözülmeye çalışılırsa 404 döndürülmelidir.
 */
export function isValidCitySlugCandidate(slug: string): boolean {
  return !isReservedSlug(slug) && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

export { RESERVED_SLUGS, isReservedSlug };
