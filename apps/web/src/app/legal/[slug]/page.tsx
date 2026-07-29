import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  formatDateWithYear,
  LEGAL_DOCUMENTS,
  ROUTES,
} from '@hazirgrup/core';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { Markdown } from '@/components/Markdown';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCUMENTS.find((d) => d.slug === slug);
  if (!doc) notFound();

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: `${doc.title} | HazırGrup`,
      description: `HazırGrup ${doc.title.toLocaleLowerCase('tr-TR')}. Son güncelleme: ${formatDateWithYear(doc.updatedAt)}.`,
      path: ROUTES.legal(doc.slug),
      type: 'article',
    }),
  );
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const doc = LEGAL_DOCUMENTS.find((d) => d.slug === slug);
  if (!doc) notFound();

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: doc.title, path: ROUTES.legal(doc.slug) },
  ];

  const others = LEGAL_DOCUMENTS.filter((d) => d.slug !== doc.slug);

  return (
    <div className="container">
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, breadcrumb)} />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <article style={{ maxWidth: 760 }}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{doc.title}</h1>
          <p className={styles.pageLead}>
            Son güncelleme: {formatDateWithYear(doc.updatedAt)}
          </p>
        </header>

        <Markdown content={doc.body} />
      </article>

      <section className={styles.section}>
        <SectionHeader title="Diğer belgeler" />
        <div className={styles.chipRow}>
          {others.map((other) => (
            <Link key={other.slug} href={ROUTES.legal(other.slug)} className={styles.chip}>
              {other.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
