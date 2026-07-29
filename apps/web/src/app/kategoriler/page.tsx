import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd, buildMetadata, formatCurrency, ROUTES } from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, LinkButton } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const repo = await getRepository();
  const categories = await repo.listCategories({ onlyActive: true });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: 'Grup Paketi Kategorileri | HazırGrup',
      description: `Arkadaş grupları için ${categories.map((c) => c.name.toLocaleLowerCase('tr-TR')).join(', ')} paketleri. Kişi sayına ve bütçene uygun kategoriden başla.`,
      path: ROUTES.categories(),
    }),
  );
}

export default async function CategoriesPage() {
  const repo = await getRepository();
  const categories = await repo.listCategories({ onlyActive: true });

  const summaries = await Promise.all(
    categories.map(async (category) => {
      const packages = await repo.listPublicPackages({ categorySlug: category.slug });
      const prices = packages.map((p) => p.perPersonFrom);
      return {
        category,
        packageCount: packages.length,
        cheapest: prices.length > 0 ? Math.min(...prices) : null,
      };
    }),
  );

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Kategoriler', path: ROUTES.categories() },
  ];

  return (
    <div className="container">
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, breadcrumb)} />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Ne yapmak istiyorsunuz?</h1>
        <p className={styles.pageLead}>
          Bir planda birden fazla kategori seçebilir, farklı seçenekleri yan yana
          karşılaştırabilirsiniz. Kategoriler yönetici panelinden yönetilir; yeni kategoriler
          zamanla eklenir.
        </p>
      </header>

      <div className={styles.gridWide}>
        {summaries.map(({ category, packageCount, cheapest }) => (
          <Card key={category.id}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              <Link href={ROUTES.category(category.slug)}>{category.name}</Link>
            </h2>
            {category.description ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                {category.description}
              </p>
            ) : null}

            <div className={styles.statRow} style={{ marginTop: 12, gap: 20 }}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{packageCount}</span>
                <span className={styles.statLabel}>paket</span>
              </div>
              {cheapest !== null ? (
                <div className={styles.stat}>
                  <span className={styles.statValue}>{formatCurrency(cheapest)}</span>
                  <span className={styles.statLabel}>kişi başı başlangıç</span>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 16 }}>
              <LinkButton href={ROUTES.category(category.slug)} size="sm" variant="secondary">
                {category.name} paketlerini gör
              </LinkButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
