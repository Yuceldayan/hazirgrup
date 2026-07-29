import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  categoryMetadata,
  decideIndexability,
  formatCurrency,
  itemListJsonLd,
  ROUTES,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { PackageCard } from '@/components/PackageCard';
import styles from '@/components/public.module.css';

export const revalidate = 900;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = await getRepository();
  const categories = await repo.listCategories({ onlyActive: true });
  return categories.map((category) => ({ slug: category.slug }));
}

async function loadCategory(slug: string) {
  const repo = await getRepository();
  const summary = await repo.getPublicCategorySummary(slug);
  if (!summary) return null;

  const packages = await repo.listPublicPackages({ categorySlug: slug });
  const prices = packages.map((p) => p.perPersonFrom);

  return {
    summary,
    packages,
    cheapest: prices.length > 0 ? Math.min(...prices) : null,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadCategory(slug);
  if (!data) notFound();

  const { summary, cheapest } = data;
  const primaryCity = summary.cities[0]?.city.name ?? null;

  const content = categoryMetadata({
    categoryName: summary.category.name,
    cityName: primaryCity,
    packageCount: summary.packageCount,
    minPerPerson: cheapest,
  });

  const decision = decideIndexability({
    isIndexable: summary.category.isIndexable,
    isActive: summary.category.isActive,
    isPublic: true,
    packageCount: summary.packageCount,
    businessCount: summary.businessCount,
  });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: summary.category.seoTitle ?? content.title,
      description: summary.category.seoDescription ?? content.description,
      path: ROUTES.category(summary.category.slug),
      shouldIndex: decision.shouldIndex,
    }),
  );
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const data = await loadCategory(slug);
  if (!data) notFound();

  const { summary, packages, cheapest } = data;
  const category = summary.category;

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Kategoriler', path: ROUTES.categories() },
    { name: category.name, path: ROUTES.category(category.slug) },
  ];

  return (
    <div className="container">
      <JsonLd
        data={[
          breadcrumbJsonLd(env.siteUrl, breadcrumb),
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
        <h1 className={styles.pageTitle}>{category.name} grup paketleri</h1>
        <p className={styles.pageLead}>
          {category.description ??
            `Arkadaş grupları için ${category.name.toLocaleLowerCase('tr-TR')} paketleri.`}
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
      </header>

      {summary.cities.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionFirst}`}>
          <SectionHeader title="Şehirlere göre" />
          <div className={styles.chipRow}>
            {summary.cities.map(({ city, packageCount }) => (
              <Link key={city.id} href={ROUTES.city(city.slug)} className={styles.chip}>
                {city.name}
                <span className={styles.chipCount}>{packageCount} paket</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <SectionHeader title="Paketler" />
        {packages.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Bu kategoride henüz paket yok"
            description="Diğer kategorilere göz atabilir veya plan oluşturarak sana uygun seçenekleri görebilirsin."
            action={
              <LinkButton href={ROUTES.categories()} variant="secondary">
                Kategorilere dön
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
    </div>
  );
}
