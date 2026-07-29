import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd, buildMetadata, formatCurrency, ROUTES } from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, EmptyState, LinkButton } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const repo = await getRepository();
  const cities = await repo.listCities({ onlyActive: true });
  const names = cities.map((c) => c.name).join(', ');

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: 'HazırGrup’un Aktif Olduğu Şehirler | HazırGrup',
      description: names
        ? `${names} şehirlerinde arkadaş grupları için hazır mekân paketleri. Şehrini seç, kişi sayına ve bütçene uyan paketleri karşılaştır.`
        : 'HazırGrup’un aktif olduğu şehirler ve grup mekân paketleri.',
      path: ROUTES.cities(),
    }),
  );
}

export default async function CitiesPage() {
  const repo = await getRepository();
  const cities = await repo.listCities({ onlyActive: true });

  const summaries = await Promise.all(
    cities.map(async (city) => {
      const [packages, businesses, districts] = await Promise.all([
        repo.listPublicPackages({ citySlug: city.slug }),
        repo.listPublicBusinesses({ citySlug: city.slug }),
        repo.listDistricts(city.id, { onlyActive: true }),
      ]);
      const prices = packages.map((p) => p.perPersonFrom);
      return {
        city,
        packageCount: packages.length,
        businessCount: businesses.length,
        districts,
        cheapest: prices.length > 0 ? Math.min(...prices) : null,
      };
    }),
  );

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Şehirler', path: ROUTES.cities() },
  ];

  return (
    <div className="container">
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, breadcrumb)} />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Aktif şehirler</h1>
        <p className={styles.pageLead}>
          HazırGrup şu anda aşağıdaki şehirlerde hizmet veriyor. Şehrini seçerek ilçelere,
          mekânlara ve hazır grup paketlerine göz atabilirsin.
        </p>
      </header>

      {summaries.length === 0 ? (
        <EmptyState
          icon="🏙️"
          title="Henüz aktif şehir yok"
          description="Yeni şehirler eklendiğinde burada listelenecek. Bu arada nasıl çalıştığımıza göz atabilirsin."
          action={
            <LinkButton href={ROUTES.howItWorks()} variant="secondary">
              Nasıl çalışır?
            </LinkButton>
          }
        />
      ) : (
        <div className={styles.gridWide}>
          {summaries.map((summary) => (
            <Card key={summary.city.id}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                <Link href={ROUTES.city(summary.city.slug)}>{summary.city.name}</Link>
              </h2>

              {summary.city.intro ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  {summary.city.intro}
                </p>
              ) : null}

              <div className={styles.statRow} style={{ marginTop: 12, gap: 20 }}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{summary.packageCount}</span>
                  <span className={styles.statLabel}>paket</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{summary.businessCount}</span>
                  <span className={styles.statLabel}>mekân</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{summary.districts.length}</span>
                  <span className={styles.statLabel}>ilçe</span>
                </div>
                {summary.cheapest !== null ? (
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{formatCurrency(summary.cheapest)}</span>
                    <span className={styles.statLabel}>kişi başı başlangıç</span>
                  </div>
                ) : null}
              </div>

              {summary.districts.length > 0 ? (
                <div className={styles.chipRow} style={{ marginTop: 16 }}>
                  {summary.districts.map((district) => (
                    <Link
                      key={district.id}
                      href={ROUTES.district(summary.city.slug, district.slug)}
                      className={styles.chip}
                    >
                      {district.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div style={{ marginTop: 16 }}>
                <LinkButton href={ROUTES.city(summary.city.slug)} size="sm" variant="secondary">
                  {summary.city.name} paketlerini gör
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <section className={styles.section}>
        <Card raised>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Şehrin listede yok mu?</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 12 }}>
            Yeni şehirler işletme yoğunluğuna göre açılıyor. Şehrindeki bir mekânın sahibiysen
            başvuru yaparak süreci başlatabilirsin.
          </p>
          <LinkButton href="/business/basvuru" size="sm">
            İşletmeni ekle
          </LinkButton>
        </Card>
      </section>
    </div>
  );
}
