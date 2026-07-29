import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  cityMetadata,
  decideIndexability,
  faqJsonLd,
  formatCurrency,
  isValidCitySlugCandidate,
  itemListJsonLd,
  ROUTES,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { PackageCard } from '@/components/PackageCard';
import styles from '@/components/public.module.css';

/**
 * Şehir landing sayfası — `/hakkari`
 *
 * Kök seviyedeki dinamik segment rezerve sluglarla çakışmaz (D-006);
 * `isValidCitySlugCandidate` kontrolü geçmeyen istekler 404 döner.
 */

export const revalidate = 900;

interface Params {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const repo = await getRepository();
  const cities = await repo.listCities({ onlyActive: true });
  return cities.map((city) => ({ city: city.slug }));
}

async function loadCity(citySlug: string) {
  if (!isValidCitySlugCandidate(citySlug)) return null;

  const repo = await getRepository();
  const summary = await repo.getPublicCitySummary(citySlug);
  if (!summary) return null;

  const [packages, businesses, districts] = await Promise.all([
    repo.listPublicPackages({ citySlug }),
    repo.listPublicBusinesses({ citySlug }),
    repo.listDistricts(summary.city.id, { onlyActive: true }),
  ]);

  const districtCounts = await Promise.all(
    districts.map(async (district) => ({
      district,
      packageCount: (
        await repo.listPublicPackages({ citySlug, districtSlug: district.slug })
      ).length,
    })),
  );

  const prices = packages.map((p) => p.perPersonFrom);

  return {
    summary,
    packages,
    businesses,
    districts: districtCounts,
    cheapest: prices.length > 0 ? Math.min(...prices) : null,
    priciest: prices.length > 0 ? Math.max(...prices) : null,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city: citySlug } = await params;
  const data = await loadCity(citySlug);
  // Bulunamayan sayfa metadata aşamasında 404 üretir; böylece akış streaming
  // başlamadan doğru HTTP durumu döner (soft 404 önlenir).
  if (!data) notFound();

  const { summary, cheapest } = data;
  const content = cityMetadata({
    cityName: summary.city.name,
    districtNames: data.districts.map((d) => d.district.name),
    packageCount: summary.packageCount,
    categoryNames: summary.categories.map((c) => c.category.name),
    minPerPerson: cheapest,
  });

  // İçerik eşiği: yeterli paket yoksa sayfa gösterilir ama indekslenmez.
  const decision = decideIndexability({
    isIndexable: summary.city.isIndexable,
    isActive: summary.city.isActive,
    isPublic: summary.city.isPublic,
    packageCount: summary.packageCount,
    businessCount: summary.businessCount,
  });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: summary.city.seoTitle ?? content.title,
      description: summary.city.seoDescription ?? content.description,
      path: ROUTES.city(summary.city.slug),
      shouldIndex: decision.shouldIndex,
      ...(summary.city.seoCanonical ? { canonicalOverride: summary.city.seoCanonical } : {}),
      ...(summary.city.ogImageUrl ? { ogImagePath: summary.city.ogImageUrl } : {}),
    }),
  );
}

function cityFaq(cityName: string, districtNames: string[], cheapest: number | null) {
  return [
    {
      question: `${cityName}'de grup paketleri hangi ilçelerde var?`,
      answer:
        districtNames.length > 0
          ? `${districtNames.join(', ')} ilçelerinde aktif paketler bulunuyor. İlçe seçmeden arama yaparak şehirdeki tüm paketleri de görebilirsin.`
          : `${cityName} genelinde arama yapabilirsin.`,
    },
    {
      question: `${cityName}'de kişi başı fiyatlar ne kadar?`,
      answer: cheapest
        ? `Paketler kişi başı ${formatCurrency(cheapest)}'den başlıyor. Sabit toplam fiyatlı paketlerde kişi sayısı arttıkça kişi başına düşen tutar azalır.`
        : 'Fiyatlar pakete ve kişi sayısına göre değişir; her pakette kişi başı ve toplam tutar birlikte gösterilir.',
    },
    {
      question: 'Arkadaşlarım uygulama indirmeden katılabilir mi?',
      answer:
        'Evet. Davet bağlantısına dokunan kişi tarayıcıda plana katılır, paketleri görür ve oy kullanır.',
    },
    {
      question: 'Rezervasyon nasıl kesinleşir?',
      answer:
        'Oylama bittikten sonra plan sahibi rezervasyon talebi gönderir. İşletme onayladığında rezervasyon kesinleşir ve size bir rezervasyon kodu verilir.',
    },
  ];
}

export default async function CityPage({ params }: Params) {
  const { city: citySlug } = await params;
  const data = await loadCity(citySlug);
  if (!data) notFound();

  const { summary, packages, businesses, districts, cheapest } = data;
  const city = summary.city;

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Şehirler', path: ROUTES.cities() },
    { name: city.name, path: ROUTES.city(city.slug) },
  ];

  const faq = cityFaq(
    city.name,
    districts.map((d) => d.district.name),
    cheapest,
  );

  const groupSizeLinks = [4, 8, 12].map((size) => ({
    size,
    count: packages.filter((p) => p.minPeople <= size && p.maxPeople >= size).length,
  }));

  return (
    <div className="container">
      <JsonLd
        data={[
          breadcrumbJsonLd(env.siteUrl, breadcrumb),
          faqJsonLd(faq),
          itemListJsonLd(
            env.siteUrl,
            packages.slice(0, 10).map((p) => ({
              name: p.name,
              slug: p.slug,
              perPersonFrom: p.perPersonFrom,
            })),
          ),
        ]}
      />

      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {city.name}&apos;de arkadaş grubuna uygun mekân paketleri
        </h1>
        <p className={styles.pageLead}>
          {city.intro ??
            `${city.name} genelindeki kafe, halı saha ve oyun salonu paketlerini kişi sayınıza ve bütçenize göre karşılaştırın.`}
        </p>

        <div className={styles.statRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.packageCount}</span>
            <span className={styles.statLabel}>hazır paket</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.businessCount}</span>
            <span className={styles.statLabel}>doğrulanmış mekân</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{districts.length}</span>
            <span className={styles.statLabel}>ilçe</span>
          </div>
          {cheapest !== null ? (
            <div className={styles.stat}>
              <span className={styles.statValue}>{formatCurrency(cheapest)}</span>
              <span className={styles.statLabel}>kişi başı başlangıç</span>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 20 }}>
          <LinkButton href="/hesap/plan/yeni" size="lg">
            {city.name} için plan oluştur
          </LinkButton>
        </div>
      </header>

      {/* --- Kategoriler ---------------------------------------------------- */}
      {summary.categories.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionFirst}`}>
          <SectionHeader title={`${city.name}'de aktif kategoriler`} />
          <div className={styles.chipRow}>
            {summary.categories.map(({ category, packageCount }) => (
              <Link
                key={category.id}
                href={ROUTES.category(category.slug)}
                className={styles.chip}
              >
                {category.name}
                <span className={styles.chipCount}>{packageCount}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- İlçeler --------------------------------------------------------- */}
      {districts.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader
            title="İlçeler"
            description="İlçe seçerek daha yakın mekânları görebilirsin."
          />
          <div className={styles.chipRow}>
            {districts.map(({ district, packageCount }) => (
              <Link
                key={district.id}
                href={ROUTES.district(city.slug, district.slug)}
                className={styles.chip}
              >
                {district.name}
                <span className={styles.chipCount}>{packageCount} paket</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Kişi sayısına göre --------------------------------------------- */}
      <section className={styles.section}>
        <SectionHeader
          title="Kaç kişisiniz?"
          description="Grup büyüklüğüne göre uygun paket sayısı."
        />
        <div className={styles.chipRow}>
          {groupSizeLinks.map((item) => (
            <span key={item.size} className={styles.chip}>
              {item.size} kişilik
              <span className={styles.chipCount}>{item.count} paket</span>
            </span>
          ))}
        </div>
      </section>

      {/* --- Paketler -------------------------------------------------------- */}
      <section className={styles.section}>
        <SectionHeader
          title={`${city.name} grup paketleri`}
          description={`${packages.length} paket listeleniyor.`}
        />
        {packages.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Bu şehirde henüz paket yok"
            description="Yeni mekânlar eklendikçe paketler burada görünecek. Diğer şehirlere göz atabilirsin."
            action={
              <LinkButton href={ROUTES.cities()} variant="secondary">
                Şehirlere dön
              </LinkButton>
            }
          />
        ) : (
          <div className={styles.grid}>
            {packages.slice(0, 12).map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} priority={index < 3} />
            ))}
          </div>
        )}
      </section>

      {/* --- Mekânlar -------------------------------------------------------- */}
      {businesses.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader title={`${city.name}'deki mekânlar`} />
          <div className={styles.grid}>
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={ROUTES.business(business.slug)}
                style={{ textDecoration: 'none' }}
              >
                <Card>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>{business.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {business.category.name} · {business.branches.length} şube ·{' '}
                    {business.packages.length} paket
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Nasıl çalışır --------------------------------------------------- */}
      <section className={styles.section}>
        <SectionHeader title={`HazırGrup ${city.name}'de nasıl çalışır?`} />
        <div className={styles.steps}>
          {[
            {
              title: 'Planını oluştur',
              text: `Tarih, ${city.name} içindeki ilçe, kişi sayısı ve bütçeni gir.`,
            },
            {
              title: 'Arkadaşlarını davet et',
              text: 'Tek bağlantıyı gruba at; arkadaşların uygulama indirmeden katılsın.',
            },
            {
              title: 'Paketleri oylayın',
              text: 'Uygun paketler otomatik listelenir, herkes tek oy kullanır.',
            },
            {
              title: 'Rezervasyon talebi gönder',
              text: 'Kazanan paket için mekâna talebini ilet, onayı takip et.',
            },
          ].map((step, index) => (
            <div key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SSS -------------------------------------------------------------- */}
      <section className={styles.section}>
        <SectionHeader title={`${city.name} hakkında sık sorulanlar`} />
        <div>
          {faq.map((item) => (
            <div key={item.question} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{item.question}</h3>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
