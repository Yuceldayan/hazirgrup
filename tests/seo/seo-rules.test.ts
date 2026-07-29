import { beforeAll, describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  businessMetadata,
  categoryMetadata,
  cityMetadata,
  decideBusinessIndexability,
  decideIndexability,
  decidePackageIndexability,
  districtMetadata,
  DemoRepository,
  faqJsonLd,
  GUIDE_PAGES,
  isNoindexPath,
  LEGAL_DOCUMENTS,
  localBusinessJsonLd,
  NOINDEX_PREFIXES,
  packageMetadata,
  packageOfferJsonLd,
  RESERVED_SLUGS,
  ROUTES,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  type PublicBusiness,
  type PublicPackage,
} from '@hazirgrup/core';
import { REFERENCE_DATE } from '../integration/helpers';

/**
 * SEO kuralları — gerçek seed verisi üzerinde (docs/SEO_STRATEGY.md §15).
 *
 * Bu testler, uygulamanın ürettiği metadata/sitemap/robots kararlarını
 * kaynak veriyle birlikte doğrular.
 */

const CTX = { siteUrl: 'https://hazirgrup.app', isProduction: true };

let repo: DemoRepository;
let businesses: PublicBusiness[];
let packages: PublicPackage[];

beforeAll(async () => {
  repo = new DemoRepository(REFERENCE_DATE);
  businesses = await repo.listPublicBusinesses({});
  packages = await repo.listPublicPackages({});
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

describe('metadata — tüm public sayfalar', () => {
  it('her paket için benzersiz başlık ve açıklama üretilir', async () => {
    const titles = new Set<string>();

    for (const pkg of packages) {
      const content = packageMetadata({
        packageName: pkg.name,
        businessName: pkg.business.name,
        districtName: pkg.branch.district.name,
        cityName: pkg.branch.city.name,
        minPeople: pkg.minPeople,
        maxPeople: pkg.maxPeople,
        perPersonFrom: pkg.perPersonFrom,
        totalFrom: pkg.totalFrom,
        itemLabels: pkg.items.map((item) => item.label),
      });

      const meta = buildMetadata(CTX, {
        title: content.title,
        description: content.description,
        path: ROUTES.package(pkg.slug),
      });

      expect(meta.title.length, pkg.slug).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
      expect(meta.description.length, pkg.slug).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX_LENGTH);
      expect(meta.description.length, pkg.slug).toBeGreaterThan(50);
      titles.add(meta.title);
    }

    // Kopya içerik koruması: her paketin başlığı ayrı olmalı.
    expect(titles.size).toBe(packages.length);
  });

  it('her işletme için benzersiz başlık üretilir', () => {
    const titles = new Set<string>();

    for (const business of businesses) {
      const branch = business.branches[0];
      const prices = business.packages.map((p) => p.perPersonFrom);

      const content = businessMetadata({
        businessName: business.name,
        districtName: branch?.district.name ?? '',
        cityName: branch?.city.name ?? '',
        categoryName: business.category.name,
        packageCount: business.packages.length,
        minPerPerson: prices.length > 0 ? Math.min(...prices) : null,
        description: business.description,
      });

      const meta = buildMetadata(CTX, {
        title: content.title,
        description: content.description,
        path: ROUTES.business(business.slug),
      });

      expect(meta.title.length, business.slug).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
      titles.add(meta.title);
    }

    expect(titles.size).toBe(businesses.length);
  });

  it('şehir ve ilçe başlıkları istenen şablona uyar', async () => {
    const cities = await repo.listCities({ onlyActive: true });

    for (const city of cities) {
      const summary = await repo.getPublicCitySummary(city.slug);
      if (!summary) continue;

      const content = cityMetadata({
        cityName: city.name,
        districtNames: [],
        packageCount: summary.packageCount,
        categoryNames: summary.categories.map((c) => c.category.name),
        minPerPerson: null,
      });

      expect(content.title).toContain(city.name);
      expect(content.title).toContain('HazırGrup');

      const districts = await repo.listDistricts(city.id, { onlyActive: true });
      for (const district of districts) {
        const districtSummary = await repo.getPublicDistrictSummary(city.slug, district.slug);
        if (!districtSummary) continue;

        const districtContent = districtMetadata({
          districtName: district.name,
          cityName: city.name,
          packageCount: districtSummary.packageCount,
          categoryNames: [],
          minPerPerson: null,
        });

        expect(districtContent.title).toContain(district.name);
        expect(districtContent.title).toContain(city.name);
      }
    }
  });

  it('kategori metadata üretilir', async () => {
    const categories = await repo.listCategories({ onlyActive: true });
    for (const category of categories) {
      const summary = await repo.getPublicCategorySummary(category.slug);
      const content = categoryMetadata({
        categoryName: category.name,
        cityName: summary?.cities[0]?.city.name ?? null,
        packageCount: summary?.packageCount ?? 0,
        minPerPerson: null,
      });
      expect(content.title).toContain(category.name);
      expect(content.description.length).toBeGreaterThan(40);
    }
  });
});

// ---------------------------------------------------------------------------
// Canonical
// ---------------------------------------------------------------------------

describe('canonical', () => {
  it('her sayfa tek canonical üretir ve sorgu parametresi içermez', () => {
    const meta = buildMetadata(CTX, {
      title: 'Başlık',
      description: 'Yeterince uzun bir açıklama metni burada bulunuyor ve sınırı aşmıyor.',
      path: '/hakkari?siralama=ucuz&sayfa=1',
    });
    expect(meta.canonical).toBe('https://hazirgrup.app/hakkari');
    expect(meta.canonical).not.toContain('?');
  });

  it('trailing slash kullanılmaz', () => {
    expect(absoluteUrl(CTX.siteUrl, '/hakkari/merkez/')).toBe(
      'https://hazirgrup.app/hakkari/merkez',
    );
  });

  it('OG url canonical ile aynıdır', () => {
    const meta = buildMetadata(CTX, {
      title: 'Başlık',
      description: 'Yeterince uzun bir açıklama metni burada bulunuyor ve sınırı aşmıyor.',
      path: '/paketler/ornek',
    });
    expect(meta.openGraph.url).toBe(meta.canonical);
  });
});

// ---------------------------------------------------------------------------
// Robots / noindex
// ---------------------------------------------------------------------------

describe('robots ve noindex', () => {
  it('tüm private route önekleri noindex listesindedir', () => {
    for (const prefix of ['/admin', '/business', '/auth', '/hesap', '/davet', '/api']) {
      expect(NOINDEX_PREFIXES).toContain(prefix);
    }
  });

  it('private yollar indekslenmez', () => {
    const privatePaths = [
      ROUTES.adminPanel(),
      ROUTES.businessPanel(),
      ROUTES.signIn(),
      ROUTES.signUp(),
      ROUTES.account(),
      ROUTES.invite('abc123'),
      ROUTES.plan('plan-1'),
    ];

    for (const path of privatePaths) {
      expect(isNoindexPath(path), path).toBe(true);
    }
  });

  it('public yollar indekslenir', async () => {
    const publicPaths = [
      ROUTES.home(),
      ROUTES.howItWorks(),
      ROUTES.cities(),
      ROUTES.categories(),
      ROUTES.guides(),
      ROUTES.faq(),
      ...businesses.map((b) => ROUTES.business(b.slug)),
      ...packages.slice(0, 5).map((p) => ROUTES.package(p.slug)),
    ];

    for (const path of publicPaths) {
      expect(isNoindexPath(path), path).toBe(false);
    }
  });

  it('staging ortamında her sayfa noindex olur', () => {
    const meta = buildMetadata(
      { siteUrl: CTX.siteUrl, isProduction: false },
      {
        title: 'Başlık',
        description: 'Yeterince uzun bir açıklama metni burada bulunuyor ve sınırı aşmıyor.',
        path: '/hakkari',
      },
    );
    expect(meta.robots.index).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Sitemap kuralları
// ---------------------------------------------------------------------------

describe('sitemap', () => {
  it('yalnızca indekslenebilir paketler sitemap adayıdır', () => {
    for (const pkg of packages) {
      const decision = decidePackageIndexability({
        isIndexable: pkg.isIndexable,
        isPublic: true,
        isActive: pkg.isActive,
        businessStatus: pkg.business.isVerified ? 'verified' : 'pending_review',
      });
      if (!pkg.isActive) {
        expect(decision.includeInSitemap, pkg.slug).toBe(false);
      }
    }
  });

  it('doğrulanmamış işletme sitemap dışıdır', () => {
    const decision = decideBusinessIndexability({
      isIndexable: true,
      isPublic: true,
      status: 'pending_review',
      activePackageCount: 10,
    });
    expect(decision.includeInSitemap).toBe(false);
  });

  it('içerik eşiği altındaki şehir sitemap dışıdır', () => {
    const decision = decideIndexability({
      isIndexable: true,
      isActive: true,
      isPublic: true,
      packageCount: 2,
      businessCount: 1,
    });
    expect(decision.includeInSitemap).toBe(false);
  });

  it('aktif şehir yeterli içerikle sitemap içindedir', async () => {
    const summary = await repo.getPublicCitySummary('hakkari');
    expect(summary).not.toBeNull();

    const decision = decideIndexability({
      isIndexable: summary!.city.isIndexable,
      isActive: summary!.city.isActive,
      isPublic: summary!.city.isPublic,
      packageCount: summary!.packageCount,
      businessCount: summary!.businessCount,
    });
    expect(decision.includeInSitemap).toBe(true);
  });

  it('pasif şehir (Van) sitemap dışıdır', async () => {
    const summary = await repo.getPublicCitySummary('van');
    expect(summary).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

describe('structured data — seed verisi üzerinde', () => {
  it('her işletme geçerli LocalBusiness üretir ve sahte rating içermez', async () => {
    const categories = await repo.listCategories();

    for (const business of businesses) {
      const categoryKey =
        categories.find((c) => c.id === business.category.id)?.key ?? 'cafe_restaurant';
      const node = localBusinessJsonLd(CTX.siteUrl, business, categoryKey);

      expect(node['@context']).toBe('https://schema.org');
      expect(node.name).toBe(business.name);
      expect(node).not.toHaveProperty('aggregateRating');
      expect(node).not.toHaveProperty('review');
      expect(() => JSON.parse(JSON.stringify(node))).not.toThrow();
    }
  });

  it('her paket geçerli Offer üretir', () => {
    for (const pkg of packages) {
      const node = packageOfferJsonLd(CTX.siteUrl, pkg);
      expect(node['@type']).toBe('Offer');
      expect(node.priceCurrency).toBe('TRY');
      expect(Number(node.price)).toBeGreaterThan(0);
      expect(node.availability).toBe(
        pkg.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      );
    }
  });

  it('rehber sayfalarında FAQPage üretilir', () => {
    for (const guide of GUIDE_PAGES) {
      const node = faqJsonLd(guide.faq);
      expect(node, guide.slug).not.toBeNull();
      expect(node?.['@type']).toBe('FAQPage');
    }
  });

  it('breadcrumb mutlak URL kullanır', () => {
    const node = breadcrumbJsonLd(CTX.siteUrl, [
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Hakkâri', path: '/hakkari' },
    ]);
    const items = node.itemListElement as Array<Record<string, string>>;
    for (const item of items) {
      expect(item.item).toMatch(/^https:\/\//);
    }
  });
});

// ---------------------------------------------------------------------------
// Dahili linkleme ve rezerve slug
// ---------------------------------------------------------------------------

describe('dahili linkler', () => {
  it('paketlerin işaret ettiği mekân, şehir ve ilçe sayfaları çözülebilir', async () => {
    for (const pkg of packages) {
      const business = await repo.getPublicBusiness(pkg.business.slug);
      expect(business, `mekân kırık: ${pkg.business.slug}`).not.toBeNull();

      const city = await repo.getCityBySlug(pkg.branch.city.slug);
      expect(city, `şehir kırık: ${pkg.branch.city.slug}`).not.toBeNull();

      const district = await repo.getDistrictBySlug(city!.id, pkg.branch.district.slug);
      expect(district, `ilçe kırık: ${pkg.branch.district.slug}`).not.toBeNull();

      const category = await repo.getCategoryBySlug(pkg.category.slug);
      expect(category, `kategori kırık: ${pkg.category.slug}`).not.toBeNull();
    }
  });

  it('işletme sayfalarındaki paket bağlantıları çözülebilir', async () => {
    for (const business of businesses) {
      for (const summary of business.packages) {
        const pkg = await repo.getPublicPackage(summary.slug);
        expect(pkg, `paket kırık: ${summary.slug}`).not.toBeNull();
      }
    }
  });

  it('yardım ve hukuki içerik bağlantıları çözülebilir', async () => {
    const articles = await repo.listHelpArticles({ onlyPublic: true });
    for (const article of articles) {
      expect(await repo.getHelpArticle(article.slug), article.slug).not.toBeNull();
    }
    for (const doc of LEGAL_DOCUMENTS) {
      expect(ROUTES.legal(doc.slug)).toBe(`/legal/${doc.slug}`);
    }
  });

  it('hiçbir şehir slugu rezerve listeyle çakışmaz (D-006)', async () => {
    const cities = await repo.listCities();
    for (const city of cities) {
      expect(RESERVED_SLUGS, `çakışan şehir slugu: ${city.slug}`).not.toContain(city.slug);
    }
  });
});
