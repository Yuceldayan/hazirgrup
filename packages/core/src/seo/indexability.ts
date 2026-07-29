import { INDEXABLE_MIN_BUSINESSES, INDEXABLE_MIN_PACKAGES } from '../config/constants';

/**
 * İçerik eşiği kuralı (docs/SEO_STRATEGY.md §1).
 *
 * Yeterli içeriği olmayan şehir/ilçe/kategori sayfaları kullanıcıya **gösterilir**
 * (yararlıdır) ancak `noindex, follow` alır ve sitemap'e eklenmez. Böylece
 * programatik olarak yüzlerce boş sayfa indekslenmez.
 */

export interface IndexabilityInput {
  /** Yöneticinin veya varsayılanın belirlediği indekslenebilirlik. */
  isIndexable: boolean;
  isActive: boolean;
  isPublic: boolean;
  packageCount: number;
  businessCount: number;
}

export interface IndexabilityDecision {
  shouldIndex: boolean;
  /** Sayfanın sitemap'e eklenip eklenmeyeceği. */
  includeInSitemap: boolean;
  reason:
    | 'ok'
    | 'flagged_noindex'
    | 'inactive'
    | 'not_public'
    | 'insufficient_packages'
    | 'insufficient_businesses';
}

export function decideIndexability(input: IndexabilityInput): IndexabilityDecision {
  if (!input.isActive) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'inactive' };
  }
  if (!input.isPublic) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'not_public' };
  }
  if (!input.isIndexable) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'flagged_noindex' };
  }
  if (input.packageCount < INDEXABLE_MIN_PACKAGES) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'insufficient_packages' };
  }
  if (input.businessCount < INDEXABLE_MIN_BUSINESSES) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'insufficient_businesses' };
  }
  return { shouldIndex: true, includeInSitemap: true, reason: 'ok' };
}

/** Doğrulanmış işletme sayfası için indekslenebilirlik. */
export function decideBusinessIndexability(input: {
  isIndexable: boolean;
  isPublic: boolean;
  status: string;
  activePackageCount: number;
}): IndexabilityDecision {
  if (input.status !== 'verified') {
    return { shouldIndex: false, includeInSitemap: false, reason: 'inactive' };
  }
  if (!input.isPublic) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'not_public' };
  }
  if (!input.isIndexable) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'flagged_noindex' };
  }
  // İşletme sayfası tek paketle bile anlamlı içerik taşır (adres, saatler, iletişim).
  if (input.activePackageCount < 1) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'insufficient_packages' };
  }
  return { shouldIndex: true, includeInSitemap: true, reason: 'ok' };
}

/** Paket sayfası için indekslenebilirlik. */
export function decidePackageIndexability(input: {
  isIndexable: boolean;
  isPublic: boolean;
  isActive: boolean;
  businessStatus: string;
}): IndexabilityDecision {
  if (input.businessStatus !== 'verified') {
    return { shouldIndex: false, includeInSitemap: false, reason: 'inactive' };
  }
  if (!input.isPublic) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'not_public' };
  }
  if (!input.isActive) {
    // Geçici pasiflik: sayfa 200 döner ve kullanıcıya açıklanır, ama indekslenmez.
    return { shouldIndex: false, includeInSitemap: false, reason: 'inactive' };
  }
  if (!input.isIndexable) {
    return { shouldIndex: false, includeInSitemap: false, reason: 'flagged_noindex' };
  }
  return { shouldIndex: true, includeInSitemap: true, reason: 'ok' };
}

/**
 * Paket sayfasının HTTP davranışı (docs/SEO_STRATEGY.md §9).
 */
export type PackagePageBehavior =
  | { kind: 'ok' }
  | { kind: 'inactive_notice'; message: string }
  | { kind: 'not_found' }
  | { kind: 'gone' }
  | { kind: 'redirect'; to: string };

export function packagePageBehavior(input: {
  exists: boolean;
  isPublic: boolean;
  isActive: boolean;
  businessStatus: string;
  redirectTo?: string | null;
  isGone?: boolean;
}): PackagePageBehavior {
  if (input.redirectTo) return { kind: 'redirect', to: input.redirectTo };
  if (input.isGone) return { kind: 'gone' };
  if (!input.exists) return { kind: 'not_found' };
  if (!input.isPublic || input.businessStatus !== 'verified') return { kind: 'not_found' };
  if (!input.isActive) {
    return {
      kind: 'inactive_notice',
      message:
        'Bu paket şu anda rezervasyona kapalı. Aynı mekânın diğer paketlerine göz atabilirsin.',
    };
  }
  return { kind: 'ok' };
}
