import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  decideIndexability,
  districtMetadata,
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

/** İlçe landing sayfası — `/hakkari/merkez` */

export const revalidate = 900;

interface Params {
  params: Promise<{ city: string; district: string }>;
}

export async function generateStaticParams() {
  const repo = await getRepository();
  const cities = await repo.listCities({ onlyActive: true });

  const params: Array<{ city: string; district: string }> = [];
  for (const city of cities) {
    const districts = await repo.listDistricts(city.id, { onlyActive: true });
    for (const district of districts) {
      params.push({ city: city.slug, district: district.slug });
    }
  }
  return params;
}

async function loadDistrict(citySlug: string, districtSlug: string) {
  if (!isValidCitySlugCandidate(citySlug)) return null;

  const repo = await getRepository();
  const summary = await repo.getPublicDistrictSummary(citySlug, districtSlug);
  if (!summary) return null;

  const [packages, businesses, siblingDistricts] = await Promise.all([
    repo.listPublicPackages({ citySlug, districtSlug }),
    repo.listPublicBusinesses({ citySlug, districtSlug }),
    repo.listDistricts(summary.city.id, { onlyActive: true }),
  ]);

  const prices = packages.map((p) => p.perPersonFrom);

  return {
    summary,
    packages,
    businesses,
    siblingDistricts: siblingDistricts.filter((d) => d.slug !== districtSlug),
    cheapest: prices.length > 0 ? Math.min(...prices) : null,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city: citySlug, district: districtSlug } = await params;
  const data = await loadDistrict(citySlug, districtSlug);
  if (!data) notFound();

  const { summary, cheapest } = data;
  const content = districtMetadata({
    districtName: summary.district.name,
    cityName: summary.city.name,
    packageCount: summary.packageCount,
    categoryNames: summary.categories.map((c) => c.category.name),
    minPerPerson: cheapest,
  });

  const decision = decideIndexability({
    isIndexable: summary.district.isIndexable,
    isActive: summary.district.isActive,
    isPublic: summary.district.isPublic,
    packageCount: summary.packageCount,
    businessCount: summary.businessCount,
  });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: summary.district.seoTitle ?? content.title,
      description: summary.district.seoDescription ?? content.description,
      path: ROUTES.district(summary.city.slug, summary.district.slug),
      shouldIndex: decision.shouldIndex,
      ...(summary.district.seoCanonical
        ? { canonicalOverride: summary.district.seoCanonical }
        : {}),
    }),
  );
}

export default async function DistrictPage({ params }: Params) {
  const { city: citySlug, district: districtSlug } = await params;
  const data = await loadDistrict(citySlug, districtSlug);
  if (!data) notFound();

  const { summary, packages, businesses, siblingDistricts, cheapest } = data;
  const { city, district } = summary;

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Şehirler', path: ROUTES.cities() },
    { name: city.name, path: ROUTES.city(city.slug) },
    { name: district.name, path: ROUTES.district(city.slug, district.slug) },
  ];

  const faq = [
    {
      question: `${district.name}'de kaç kişilik gruplar için paket var?`,
      answer:
        packages.length > 0
          ? `Paketler ${Math.min(...packages.map((p) => p.minPeople))} ile ${Math.max(...packages.map((p) => p.maxPeople))} kişi arasındaki grupları kapsıyor.`
          : `${district.name} için henüz paket bulunmuyor; ${city.name} genelinde arama yapabilirsin.`,
    },
    {
      question: `${district.name}'de fiyatlar ne kadar?`,
      answer: cheapest
        ? `Kişi başı ${formatCurrency(cheapest)}'den başlıyor. Her pakette kişi başı ve toplam tutar birlikte gösterilir.`
        : 'Fiyatlar pakete ve kişi sayısına göre değişir.',
    },
    {
      question: 'Rezervasyon ücreti var mı?',
      answer:
        'Hayır. HazırGrup üzerinden ödeme alınmaz; ücretlendirme doğrudan mekânda yapılır.',
    },
  ];

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
          {district.name}, {city.name} grup mekân paketleri
        </h1>
        <p className={styles.pageLead}>
          {district.intro ??
            `${district.name} ilçesindeki mekânların arkadaş grupları için hazırladığı paketleri kişi sayınıza ve bütçenize göre karşılaştırın.`}
        </p>

        <div className={styles.statRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.packageCount}</span>
            <span className={styles.statLabel}>paket</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.businessCount}</span>
            <span className={styles.statLabel}>mekân</span>
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
            {district.name} için plan oluştur
          </LinkButton>
        </div>
      </header>

      {summary.categories.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionFirst}`}>
          <SectionHeader title="Kategoriler" />
          <div className={styles.chipRow}>
            {summary.categories.map(({ category, packageCount }) => (
              <Link key={category.id} href={ROUTES.category(category.slug)} className={styles.chip}>
                {category.name}
                <span className={styles.chipCount}>{packageCount}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <SectionHeader title={`${district.name} paketleri`} />
        {packages.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Bu ilçede henüz paket yok"
            description={`${city.name} genelindeki diğer paketlere göz atarak grubuna uygun seçenekleri görebilirsin.`}
            action={
              <LinkButton href={ROUTES.city(city.slug)} variant="secondary">
                {city.name} paketlerini gör
              </LinkButton>
            }
          />
        ) : (
          <div className={styles.grid}>
            {packages.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} priority={index < 3} />
            ))}
          </div>
        )}
      </section>

      {businesses.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader title={`${district.name}'deki mekânlar`} />
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
                    {business.category.name} · {business.packages.length} paket
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {siblingDistricts.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader title={`${city.name}'in diğer ilçeleri`} />
          <div className={styles.chipRow}>
            {siblingDistricts.map((sibling) => (
              <Link
                key={sibling.id}
                href={ROUTES.district(city.slug, sibling.slug)}
                className={styles.chip}
              >
                {sibling.name}
              </Link>
            ))}
            <Link href={ROUTES.city(city.slug)} className={styles.chip}>
              {city.name} geneli
            </Link>
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <SectionHeader title="Sık sorulanlar" />
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
