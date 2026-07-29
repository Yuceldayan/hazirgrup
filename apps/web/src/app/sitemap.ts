import type { MetadataRoute } from 'next';
import {
  absoluteUrl,
  decideBusinessIndexability,
  decideIndexability,
  decidePackageIndexability,
  GUIDE_PAGES,
  LEGAL_DOCUMENTS,
  ROUTES,
  SITEMAP_CHUNK_SIZE,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { allowIndexing, env } from '@/lib/env';

/**
 * Dinamik sitemap (docs/SEO_STRATEGY.md §5).
 *
 * YALNIZCA indekslenebilir URL'ler eklenir. Private, pasif, doğrulanmamış veya
 * içerik eşiğinin altındaki sayfalar ile davet/plan yolları HİÇBİR ZAMAN yer almaz.
 */

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Üretim dışı ortamda sitemap boş döner (staging koruması).
  if (!allowIndexing) return [];

  const repo = await getRepository();
  const url = (path: string) => absoluteUrl(env.siteUrl, path);

  const entries: MetadataRoute.Sitemap = [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    { url: url(ROUTES.howItWorks()), changeFrequency: 'monthly', priority: 0.7 },
    { url: url(ROUTES.cities()), changeFrequency: 'weekly', priority: 0.8 },
    { url: url(ROUTES.categories()), changeFrequency: 'weekly', priority: 0.8 },
    { url: url(ROUTES.guides()), changeFrequency: 'monthly', priority: 0.6 },
    { url: url(ROUTES.faq()), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // --- Şehirler ------------------------------------------------------------
  const cities = await repo.listCities({ onlyActive: true });
  for (const city of cities) {
    const summary = await repo.getPublicCitySummary(city.slug);
    if (!summary) continue;

    const decision = decideIndexability({
      isIndexable: city.isIndexable,
      isActive: city.isActive,
      isPublic: city.isPublic,
      packageCount: summary.packageCount,
      businessCount: summary.businessCount,
    });
    if (!decision.includeInSitemap) continue;

    entries.push({ url: url(ROUTES.city(city.slug)), changeFrequency: 'daily', priority: 0.9 });

    // --- İlçeler -----------------------------------------------------------
    const districts = await repo.listDistricts(city.id, { onlyActive: true });
    for (const district of districts) {
      const districtSummary = await repo.getPublicDistrictSummary(city.slug, district.slug);
      if (!districtSummary) continue;

      const districtDecision = decideIndexability({
        isIndexable: district.isIndexable,
        isActive: district.isActive,
        isPublic: district.isPublic,
        packageCount: districtSummary.packageCount,
        businessCount: districtSummary.businessCount,
      });
      if (!districtDecision.includeInSitemap) continue;

      entries.push({
        url: url(ROUTES.district(city.slug, district.slug)),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  }

  // --- Kategoriler ---------------------------------------------------------
  const categories = await repo.listCategories({ onlyActive: true });
  for (const category of categories) {
    const summary = await repo.getPublicCategorySummary(category.slug);
    if (!summary) continue;

    const decision = decideIndexability({
      isIndexable: category.isIndexable,
      isActive: category.isActive,
      isPublic: true,
      packageCount: summary.packageCount,
      businessCount: summary.businessCount,
    });
    if (!decision.includeInSitemap) continue;

    entries.push({
      url: url(ROUTES.category(category.slug)),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // --- İşletmeler ----------------------------------------------------------
  const businesses = await repo.listPublicBusinesses({});
  for (const business of businesses) {
    const decision = decideBusinessIndexability({
      isIndexable: business.isIndexable,
      isPublic: true,
      status: business.isVerified ? 'verified' : 'pending_review',
      activePackageCount: business.packages.length,
    });
    if (!decision.includeInSitemap) continue;

    entries.push({
      url: url(ROUTES.business(business.slug)),
      lastModified: new Date(business.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // --- Paketler ------------------------------------------------------------
  const packages = await repo.listPublicPackages({});
  for (const pkg of packages) {
    const decision = decidePackageIndexability({
      isIndexable: pkg.isIndexable,
      isPublic: true,
      isActive: pkg.isActive,
      businessStatus: pkg.business.isVerified ? 'verified' : 'pending_review',
    });
    if (!decision.includeInSitemap) continue;

    entries.push({
      url: url(ROUTES.package(pkg.slug)),
      lastModified: new Date(pkg.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // --- Rehber ve yardım ----------------------------------------------------
  for (const guide of GUIDE_PAGES) {
    entries.push({ url: url(ROUTES.guide(guide.slug)), changeFrequency: 'monthly', priority: 0.6 });
  }

  const helpArticles = await repo.listHelpArticles({ onlyPublic: true });
  for (const article of helpArticles) {
    if (!article.isIndexable) continue;
    entries.push({ url: url(ROUTES.help(article.slug)), changeFrequency: 'monthly', priority: 0.5 });
  }

  for (const doc of LEGAL_DOCUMENTS) {
    entries.push({ url: url(ROUTES.legal(doc.slug)), changeFrequency: 'yearly', priority: 0.3 });
  }

  if (entries.length > SITEMAP_CHUNK_SIZE) {
    // Eşiğe ulaşıldığında `generateSitemaps()` ile parçalama devreye alınmalıdır
    // (docs/KNOWN_LIMITATIONS.md L-09).
    console.warn(
      `[hazirgrup] sitemap ${entries.length} URL içeriyor; parçalama eşiği ${SITEMAP_CHUNK_SIZE}.`,
    );
  }

  return entries;
}
