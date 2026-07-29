import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd, buildMetadata, GUIDE_PAGES, ROUTES } from '@hazirgrup/core';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: 'Grup Planlama Rehberi | HazırGrup',
      description:
        'Arkadaş grubuyla mekân seçme, halı saha kiralama ve doğum günü organizasyonu için pratik rehberler. Kişi sayısı, bütçe ve saat üçlüsünü nasıl netleştirirsiniz?',
      path: ROUTES.guides(),
    }),
  );
}

export default function GuidesPage() {
  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Rehber', path: ROUTES.guides() },
  ];

  return (
    <div className="container">
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, breadcrumb)} />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Grup planlama rehberi</h1>
        <p className={styles.pageLead}>
          Kalabalık gruplarda kararın neden uzadığını ve nasıl hızlandırılacağını anlatan
          pratik rehberler.
        </p>
      </header>

      <div className={styles.gridWide}>
        {GUIDE_PAGES.map((guide) => (
          <Card key={guide.slug}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>
              <Link href={ROUTES.guide(guide.slug)}>{guide.title}</Link>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{guide.summary}</p>
            <p style={{ marginTop: 12, fontSize: 13 }}>
              <Link href={ROUTES.guide(guide.slug)}>Rehberi oku →</Link>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
