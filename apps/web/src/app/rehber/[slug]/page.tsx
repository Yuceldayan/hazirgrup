import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  guideMetadata,
  GUIDE_PAGES,
  ROUTES,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { PackageCard } from '@/components/PackageCard';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDE_PAGES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDE_PAGES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const content = guideMetadata({ title: guide.title, summary: guide.summary });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: content.title,
      description: content.description,
      path: ROUTES.guide(guide.slug),
      type: 'article',
    }),
  );
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = GUIDE_PAGES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const repo = await getRepository();
  const relatedPackages = await repo.listPublicPackages({
    ...(guide.citySlug ? { citySlug: guide.citySlug } : {}),
    ...(guide.categorySlug ? { categorySlug: guide.categorySlug } : {}),
    limit: 3,
  });

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Rehber', path: ROUTES.guides() },
    { name: guide.title, path: ROUTES.guide(guide.slug) },
  ];

  const otherGuides = GUIDE_PAGES.filter((g) => g.slug !== guide.slug);

  return (
    <div className="container">
      <JsonLd data={[breadcrumbJsonLd(env.siteUrl, breadcrumb), faqJsonLd(guide.faq)]} />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <article style={{ maxWidth: 760 }}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{guide.title}</h1>
          <p className={styles.pageLead}>{guide.summary}</p>
        </header>

        <div className="prose">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        {guide.faq.length > 0 ? (
          <section className={styles.section}>
            <SectionHeader title="Sık sorulan sorular" />
            <div>
              {guide.faq.map((item) => (
                <div key={item.question} className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>{item.question}</h3>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {relatedPackages.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader title="İlgili paketler" />
          <div className={styles.grid}>
            {relatedPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <Card raised>
          <SectionHeader
            title="Planını şimdi kur"
            description="Kişi sayını ve bütçeni gir, uygun paketleri gör."
            action={<LinkButton href="/hesap/plan/yeni">Yeni plan oluştur</LinkButton>}
          />
        </Card>
      </section>

      {otherGuides.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader title="Diğer rehberler" />
          <div className={styles.chipRow}>
            {otherGuides.map((other) => (
              <Link key={other.slug} href={ROUTES.guide(other.slug)} className={styles.chip}>
                {other.title}
              </Link>
            ))}
            {guide.citySlug ? (
              <Link href={ROUTES.city(guide.citySlug)} className={styles.chip}>
                {guide.citySlug} paketleri
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
