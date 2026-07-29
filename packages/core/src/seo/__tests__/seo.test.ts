import { describe, expect, it } from 'vitest';
import type { PublicBusiness, PublicPackage } from '@hazirgrup/types';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../../config/constants';
import {
  buildMetadata,
  businessMetadata,
  categoryMetadata,
  cityMetadata,
  districtMetadata,
  homeMetadataInput,
  inviteMetadata,
  packageMetadata,
  validateSeoText,
} from '../metadata';
import {
  decideBusinessIndexability,
  decideIndexability,
  decidePackageIndexability,
  packagePageBehavior,
} from '../indexability';
import {
  absoluteUrl,
  isNoindexPath,
  isValidCitySlugCandidate,
  normalizePath,
  RESERVED_SLUGS,
  ROUTES,
} from '../routes';
import {
  breadcrumbJsonLd,
  faqJsonLd,
  itemListJsonLd,
  localBusinessJsonLd,
  localBusinessType,
  organizationJsonLd,
  packageOfferJsonLd,
  serializeJsonLd,
  webSiteJsonLd,
} from '../structured-data';

const CTX = { siteUrl: 'https://hazirgrup.app', isProduction: true };

// ---------------------------------------------------------------------------
// Route ve canonical
// ---------------------------------------------------------------------------

describe('normalizePath', () => {
  it('sondaki eğik çizgiyi kaldırır', () => {
    expect(normalizePath('/hakkari/')).toBe('/hakkari');
  });

  it('kök yolu korur', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('çoklu eğik çizgiyi teke indirir', () => {
    expect(normalizePath('/hakkari//merkez')).toBe('/hakkari/merkez');
  });

  it('sorgu ve fragment atar', () => {
    expect(normalizePath('/paketler/x?siralama=ucuz#detay')).toBe('/paketler/x');
  });
});

describe('absoluteUrl', () => {
  it('mutlak URL üretir', () => {
    expect(absoluteUrl('https://hazirgrup.app', '/hakkari')).toBe('https://hazirgrup.app/hakkari');
  });

  it('site URL sonundaki eğik çizgiyi tekrarlamaz', () => {
    expect(absoluteUrl('https://hazirgrup.app/', '/hakkari')).toBe('https://hazirgrup.app/hakkari');
  });

  it('kök için sondaki eğik çizgiyi korur', () => {
    expect(absoluteUrl('https://hazirgrup.app', '/')).toBe('https://hazirgrup.app/');
  });

  it('sorgu parametresini canonical dışına atar', () => {
    expect(absoluteUrl('https://hazirgrup.app', '/hakkari?sayfa=2')).toBe(
      'https://hazirgrup.app/hakkari',
    );
  });
});

describe('isNoindexPath', () => {
  it.each([
    '/admin',
    '/admin/sehirler',
    '/business',
    '/business/paketler',
    '/auth/giris',
    '/hesap',
    '/hesap/planlar',
    '/davet/abc123',
    '/plan/xyz',
    '/rezervasyon/1',
    '/api/og',
  ])('%s indekslenmez', (path) => {
    expect(isNoindexPath(path)).toBe(true);
  });

  it.each([
    '/',
    '/hakkari',
    '/hakkari/merkez',
    '/mekanlar/ornek-kafe',
    '/paketler/ornek-paket',
    '/kategoriler/kafe-restoran',
    '/rehber/hakkari-grup-paketleri',
    '/sss',
  ])('%s indekslenir', (path) => {
    expect(isNoindexPath(path)).toBe(false);
  });

  it('benzer başlayan public yolu yanlışlıkla kapatmaz', () => {
    expect(isNoindexPath('/administrasyon-rehberi')).toBe(false);
    expect(isNoindexPath('/businessoft')).toBe(false);
  });
});

describe('rezerve slug koruması (D-006)', () => {
  it('rezerve slugları şehir olarak kabul etmez', () => {
    for (const slug of RESERVED_SLUGS) {
      expect(isValidCitySlugCandidate(slug), slug).toBe(false);
    }
  });

  it('geçerli şehir slug\'ını kabul eder', () => {
    expect(isValidCitySlugCandidate('hakkari')).toBe(true);
    expect(isValidCitySlugCandidate('kahramanmaras')).toBe(true);
  });

  it('geçersiz biçimli slugu reddeder', () => {
    expect(isValidCitySlugCandidate('Hakkari')).toBe(false);
    expect(isValidCitySlugCandidate('hakkari_merkez')).toBe(false);
    expect(isValidCitySlugCandidate('')).toBe(false);
  });

  it('statik route üreticileri rezerve listeyle tutarlıdır', () => {
    // Kök seviyede yeni bir statik route eklenirse RESERVED_SLUGS güncellenmelidir.
    const rootStaticPaths = [
      ROUTES.howItWorks(),
      ROUTES.cities(),
      ROUTES.categories(),
      ROUTES.guides(),
      ROUTES.faq(),
      ROUTES.businessPanel(),
      ROUTES.adminPanel(),
      ROUTES.account(),
    ];

    for (const path of rootStaticPaths) {
      const firstSegment = path.split('/')[1] ?? '';
      expect(RESERVED_SLUGS, `${path} rezerve listede olmalı`).toContain(firstSegment);
    }
  });
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

describe('buildMetadata', () => {
  it('temel alanları doldurur', () => {
    const meta = buildMetadata(CTX, {
      title: 'Hakkâri Grup Paketleri | HazırGrup',
      description: 'Hakkâri genelinde arkadaş grupları için mekân paketleri ve fiyat bilgisi.',
      path: '/hakkari',
    });

    expect(meta.canonical).toBe('https://hazirgrup.app/hakkari');
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph.locale).toBe('tr_TR');
    expect(meta.openGraph.url).toBe(meta.canonical);
    expect(meta.openGraph.images[0]!.width).toBe(1200);
    expect(meta.twitter.card).toBe('summary_large_image');
  });

  it('üretim dışı ortamda her sayfayı noindex yapar (staging koruması)', () => {
    const meta = buildMetadata(
      { ...CTX, isProduction: false },
      { title: 'Başlık', description: 'Açıklama', path: '/hakkari', shouldIndex: true },
    );
    expect(meta.robots.index).toBe(false);
  });

  it('shouldIndex=false olduğunda indekslemez ama takip eder', () => {
    const meta = buildMetadata(CTX, {
      title: 'Başlık',
      description: 'Açıklama',
      path: '/hakkari/bos-ilce',
      shouldIndex: false,
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it('canonical override uygular', () => {
    const meta = buildMetadata(CTX, {
      title: 'Başlık',
      description: 'Açıklama',
      path: '/paketler/x?siralama=ucuz',
      canonicalOverride: 'https://hazirgrup.app/paketler/x',
    });
    expect(meta.canonical).toBe('https://hazirgrup.app/paketler/x');
  });

  it('uzun başlığı kelime sınırında kısaltır', () => {
    const meta = buildMetadata(CTX, {
      title:
        'Hakkâri Yüksekova İlçesinde Arkadaş Grupları İçin Uygun Fiyatlı Kafe ve Restoran Paketleri Listesi',
      description: 'Açıklama metni burada yer alır ve yeterince uzundur ki eşiği aşmasın.',
      path: '/hakkari/yuksekova',
    });
    expect(meta.title.length).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
    expect(meta.title.endsWith('…')).toBe(true);
  });
});

describe('sayfa metadata üreticileri', () => {
  const cases = [
    homeMetadataInput(['Hakkâri']),
    cityMetadata({
      cityName: 'Hakkâri',
      districtNames: ['Merkez', 'Yüksekova'],
      packageCount: 24,
      categoryNames: ['kafe', 'halı saha'],
      minPerPerson: 15000,
    }),
    districtMetadata({
      districtName: 'Yüksekova',
      cityName: 'Hakkâri',
      packageCount: 12,
      categoryNames: ['kafe'],
      minPerPerson: 18000,
    }),
    categoryMetadata({
      categoryName: 'Halı Saha',
      cityName: 'Hakkâri',
      packageCount: 8,
      minPerPerson: 12000,
    }),
    businessMetadata({
      businessName: 'Örnek Kafe',
      districtName: 'Merkez',
      cityName: 'Hakkâri',
      categoryName: 'Kafe & Restoran',
      packageCount: 4,
      minPerPerson: 20000,
      description: 'Kurgusal demo işletmesi, grup buluşmaları için uygun salon.',
    }),
    packageMetadata({
      packageName: '6–10 Kişilik Akşam Yemeği Paketi',
      businessName: 'Örnek Kafe',
      districtName: 'Merkez',
      cityName: 'Hakkâri',
      minPeople: 6,
      maxPeople: 10,
      perPersonFrom: 22000,
      totalFrom: 132000,
      itemLabels: ['ana yemek', 'salata', 'tatlı', 'içecek'],
    }),
    inviteMetadata({
      planName: 'Cuma Akşamı Buluşması',
      dateLabel: '14 Ağustos Cuma',
      districtName: 'Merkez',
    }),
  ];

  it.each(cases.map((c, i) => [i, c] as const))(
    'üretici %i başlık ve açıklama üretir',
    (_i, meta) => {
      expect(meta.title.trim().length).toBeGreaterThan(10);
      expect(meta.description.trim().length).toBeGreaterThan(40);
    },
  );

  it('başlıklar birbirinden farklıdır (kopya içerik koruması)', () => {
    const titles = cases.map((c) => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('kısaltmadan sonra tüm başlıklar sınır içinde kalır', () => {
    for (const c of cases) {
      const meta = buildMetadata(CTX, { title: c.title, description: c.description, path: '/x' });
      expect(meta.title.length, meta.title).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
      expect(meta.description.length, meta.description).toBeLessThanOrEqual(
        SEO_DESCRIPTION_MAX_LENGTH,
      );
    }
  });

  it('şehir başlığı istenen şablona uyar', () => {
    const meta = cityMetadata({
      cityName: 'Hakkâri',
      districtNames: [],
      packageCount: 10,
      categoryNames: [],
      minPerPerson: null,
    });
    expect(meta.title).toBe("Hakkâri'de Arkadaş Grubuna Uygun Mekân Paketleri | HazırGrup");
  });

  it('davet açıklaması kişisel veri içermez', () => {
    const meta = inviteMetadata({
      planName: 'Doğum Günü',
      dateLabel: '3 Eylül',
      districtName: 'Merkez',
    });
    expect(meta.description).not.toMatch(/₺|telefon|bütçe|kişi başı/i);
  });
});

describe('validateSeoText', () => {
  it('geçerli metinde uyarı vermez', () => {
    expect(
      validateSeoText(
        'Hakkâri Grup Mekân Paketleri | HazırGrup',
        'Hakkâri genelinde arkadaş grupları için 24 paket. Bütçene ve kişi sayına göre karşılaştır.',
      ),
    ).toHaveLength(0);
  });

  it('boş başlığı hata sayar', () => {
    const issues = validateSeoText('', 'Yeterince uzun bir açıklama metni burada bulunuyor efendim.');
    expect(issues.some((i) => i.field === 'title' && i.severity === 'error')).toBe(true);
  });

  it('uzun açıklamayı uyarır', () => {
    const issues = validateSeoText('Yeterince uzun bir başlık', 'x'.repeat(200));
    expect(issues.some((i) => i.field === 'description' && i.severity === 'warning')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// İndekslenebilirlik
// ---------------------------------------------------------------------------

describe('decideIndexability', () => {
  const base = {
    isIndexable: true,
    isActive: true,
    isPublic: true,
    packageCount: 5,
    businessCount: 2,
  };

  it('yeterli içerikte indeksler', () => {
    const decision = decideIndexability(base);
    expect(decision.shouldIndex).toBe(true);
    expect(decision.includeInSitemap).toBe(true);
  });

  it('paket sayısı eşiğin altındaysa indekslemez', () => {
    const decision = decideIndexability({ ...base, packageCount: 2 });
    expect(decision.shouldIndex).toBe(false);
    expect(decision.reason).toBe('insufficient_packages');
    expect(decision.includeInSitemap).toBe(false);
  });

  it('doğrulanmış işletme yoksa indekslemez', () => {
    const decision = decideIndexability({ ...base, businessCount: 0 });
    expect(decision.reason).toBe('insufficient_businesses');
  });

  it('yönetici noindex işaretlediyse indekslemez', () => {
    expect(decideIndexability({ ...base, isIndexable: false }).reason).toBe('flagged_noindex');
  });

  it('pasif ve public olmayan sayfayı indekslemez', () => {
    expect(decideIndexability({ ...base, isActive: false }).reason).toBe('inactive');
    expect(decideIndexability({ ...base, isPublic: false }).reason).toBe('not_public');
  });
});

describe('decideBusinessIndexability', () => {
  it('doğrulanmamış işletmeyi indekslemez (D-026)', () => {
    expect(
      decideBusinessIndexability({
        isIndexable: true,
        isPublic: true,
        status: 'pending_review',
        activePackageCount: 5,
      }).shouldIndex,
    ).toBe(false);
  });

  it('doğrulanmış ve en az bir paketi olan işletmeyi indeksler', () => {
    expect(
      decideBusinessIndexability({
        isIndexable: true,
        isPublic: true,
        status: 'verified',
        activePackageCount: 1,
      }).shouldIndex,
    ).toBe(true);
  });

  it('paketi olmayan işletmeyi indekslemez', () => {
    expect(
      decideBusinessIndexability({
        isIndexable: true,
        isPublic: true,
        status: 'verified',
        activePackageCount: 0,
      }).shouldIndex,
    ).toBe(false);
  });
});

describe('decidePackageIndexability', () => {
  it('aktif public paketi indeksler', () => {
    expect(
      decidePackageIndexability({
        isIndexable: true,
        isPublic: true,
        isActive: true,
        businessStatus: 'verified',
      }).shouldIndex,
    ).toBe(true);
  });

  it('pasif paketi indekslemez', () => {
    expect(
      decidePackageIndexability({
        isIndexable: true,
        isPublic: true,
        isActive: false,
        businessStatus: 'verified',
      }).shouldIndex,
    ).toBe(false);
  });
});

describe('packagePageBehavior', () => {
  const base = { exists: true, isPublic: true, isActive: true, businessStatus: 'verified' };

  it('normal durumda sayfayı gösterir', () => {
    expect(packagePageBehavior(base)).toEqual({ kind: 'ok' });
  });

  it('geçici pasiflikte açıklama gösterir (200)', () => {
    const behavior = packagePageBehavior({ ...base, isActive: false });
    expect(behavior.kind).toBe('inactive_notice');
    if (behavior.kind === 'inactive_notice') {
      expect(behavior.message).toContain('rezervasyona kapalı');
    }
  });

  it('public olmayan pakette 404 döner', () => {
    expect(packagePageBehavior({ ...base, isPublic: false })).toEqual({ kind: 'not_found' });
  });

  it('doğrulanmamış işletmenin paketinde 404 döner', () => {
    expect(packagePageBehavior({ ...base, businessStatus: 'suspended' })).toEqual({
      kind: 'not_found',
    });
  });

  it('kalıcı silinmede 410 döner', () => {
    expect(packagePageBehavior({ ...base, exists: false, isGone: true })).toEqual({ kind: 'gone' });
  });

  it('slug değiştiyse yönlendirir', () => {
    expect(packagePageBehavior({ ...base, redirectTo: '/paketler/yeni-slug' })).toEqual({
      kind: 'redirect',
      to: '/paketler/yeni-slug',
    });
  });
});

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

const PUBLIC_BRANCH = {
  id: 'branch-1',
  name: 'Merkez Şube',
  address: 'Demo Caddesi No:1',
  city: { id: 'c1', name: 'Hakkâri', slug: 'hakkari' },
  district: { id: 'd1', name: 'Merkez', slug: 'merkez' },
  phone: '05001112233',
  whatsapp: '05001112233',
  lat: 37.5744,
  lng: 43.7408,
  hours: [
    { weekday: 1 as const, opensAt: '10:00', closesAt: '23:00', isClosed: false },
    { weekday: 2 as const, opensAt: null, closesAt: null, isClosed: true },
  ],
};

const PUBLIC_BUSINESS: PublicBusiness = {
  id: 'biz-1',
  name: 'Örnek Kafe',
  slug: 'ornek-kafe',
  description: 'Kurgusal demo işletmesi.',
  category: { id: 'cat-1', name: 'Kafe & Restoran', slug: 'kafe-restoran' },
  logoUrl: 'https://cdn.example/logo.png',
  coverUrl: null,
  phone: '05001112233',
  whatsapp: '05001112233',
  website: null,
  instagram: null,
  isVerified: true,
  branches: [PUBLIC_BRANCH],
  packages: [],
  seoTitle: null,
  seoDescription: null,
  seoCanonical: null,
  ogImageUrl: null,
  isIndexable: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const PUBLIC_PACKAGE: PublicPackage = {
  id: 'pkg-1',
  name: '6–10 Kişilik Akşam Yemeği Paketi',
  slug: '6-10-kisilik-aksam-yemegi-paketi',
  description: 'Kurgusal demo paketi.',
  minPeople: 6,
  maxPeople: 10,
  pricingModel: 'per_person',
  priceAmount: 22000,
  perPersonFrom: 22000,
  totalFrom: 132000,
  durationMinutes: 150,
  reservationTerms: null,
  cancellationTerms: null,
  isActive: true,
  items: [],
  images: [],
  availability: [],
  category: { id: 'cat-1', name: 'Kafe & Restoran', slug: 'kafe-restoran' },
  business: {
    id: 'biz-1',
    name: 'Örnek Kafe',
    slug: 'ornek-kafe',
    logoUrl: null,
    isVerified: true,
    phone: '05001112233',
    whatsapp: null,
  },
  branch: PUBLIC_BRANCH,
  seoTitle: null,
  seoDescription: null,
  seoCanonical: null,
  ogImageUrl: null,
  isIndexable: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('structured data', () => {
  it('Organization ve WebSite düğümleri geçerlidir', () => {
    expect(organizationJsonLd(CTX.siteUrl)['@type']).toBe('Organization');
    expect(webSiteJsonLd(CTX.siteUrl)['@type']).toBe('WebSite');
    expect(webSiteJsonLd(CTX.siteUrl).inLanguage).toBe('tr-TR');
  });

  it('BreadcrumbList sıralı ve mutlak URL içerir', () => {
    const node = breadcrumbJsonLd(CTX.siteUrl, [
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Hakkâri', path: '/hakkari' },
      { name: 'Merkez', path: '/hakkari/merkez' },
    ]);
    const items = node.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0]!.position).toBe(1);
    expect(items[2]!.item).toBe('https://hazirgrup.app/hakkari/merkez');
  });

  it('kategori anahtarına göre doğru LocalBusiness alt tipi seçilir', () => {
    expect(localBusinessType('cafe_restaurant')).toBe('Restaurant');
    expect(localBusinessType('football_pitch')).toBe('SportsActivityLocation');
    expect(localBusinessType('game_lounge')).toBe('EntertainmentBusiness');
    expect(localBusinessType('bilinmeyen')).toBe('LocalBusiness');
  });

  it('LocalBusiness adres, konum ve çalışma saatlerini içerir', () => {
    const node = localBusinessJsonLd(CTX.siteUrl, PUBLIC_BUSINESS, 'cafe_restaurant');
    expect(node['@type']).toBe('Restaurant');
    expect(node.telephone).toBe('05001112233');
    expect((node.address as Record<string, string>).addressLocality).toBe('Merkez');
    expect((node.geo as Record<string, number>).latitude).toBe(37.5744);

    const hours = node.openingHoursSpecification as Array<Record<string, string>>;
    expect(hours).toHaveLength(1); // kapalı gün eklenmez
    expect(hours[0]!.dayOfWeek).toBe('https://schema.org/Monday');
  });

  it('SAHTE puan üretmez (kullanıcı yorumu yok)', () => {
    const node = localBusinessJsonLd(CTX.siteUrl, PUBLIC_BUSINESS, 'cafe_restaurant');
    expect(node).not.toHaveProperty('aggregateRating');
    expect(node).not.toHaveProperty('review');
    expect(node).not.toHaveProperty('ratingValue');
  });

  it('Offer fiyat, para birimi ve stok durumunu doğru verir', () => {
    const node = packageOfferJsonLd(CTX.siteUrl, PUBLIC_PACKAGE);
    expect(node['@type']).toBe('Offer');
    expect(node.price).toBe('1320.00');
    expect(node.priceCurrency).toBe('TRY');
    expect(node.availability).toBe('https://schema.org/InStock');
    expect((node.eligibleQuantity as Record<string, number>).minValue).toBe(6);
  });

  it('pasif paket OutOfStock olarak işaretlenir', () => {
    const node = packageOfferJsonLd(CTX.siteUrl, { ...PUBLIC_PACKAGE, isActive: false });
    expect(node.availability).toBe('https://schema.org/OutOfStock');
  });

  it('FAQPage üretir, boş listede null döner', () => {
    const node = faqJsonLd([{ question: 'Nasıl çalışır?', answer: 'Plan oluştur, davet et.' }]);
    expect(node?.['@type']).toBe('FAQPage');
    expect(faqJsonLd([])).toBeNull();
  });

  it('ItemList üretir, boş listede null döner', () => {
    const node = itemListJsonLd(CTX.siteUrl, [
      { name: 'Paket A', slug: 'paket-a', perPersonFrom: 20000 },
    ]);
    expect(node?.numberOfItems).toBe(1);
    expect(itemListJsonLd(CTX.siteUrl, [])).toBeNull();
  });

  it('serileştirme script kaçışı yapar (XSS koruması)', () => {
    const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(output).not.toContain('</script>');
    expect(output).toContain('\\u003c');
  });

  it('üretilen JSON-LD geçerli JSON olarak ayrıştırılabilir', () => {
    const nodes = [
      organizationJsonLd(CTX.siteUrl),
      webSiteJsonLd(CTX.siteUrl),
      localBusinessJsonLd(CTX.siteUrl, PUBLIC_BUSINESS, 'cafe_restaurant'),
      packageOfferJsonLd(CTX.siteUrl, PUBLIC_PACKAGE),
    ];
    for (const node of nodes) {
      expect(() => JSON.parse(JSON.stringify(node))).not.toThrow();
      expect(node['@context']).toBe('https://schema.org');
    }
  });
});
