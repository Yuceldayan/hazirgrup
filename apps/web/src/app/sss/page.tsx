import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, ROUTES } from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: 'Sık Sorulan Sorular | HazırGrup',
      description:
        'Plan oluşturma, davet, oylama, fiyatlandırma ve rezervasyon hakkında en çok sorulan sorular ve yanıtları.',
      path: ROUTES.faq(),
    }),
  );
}

export default async function FaqPage() {
  const repo = await getRepository();
  const articles = await repo.listHelpArticles({ onlyPublic: true });

  const faqEntries = articles.map((article) => ({
    question: article.title,
    answer: article.summary,
  }));

  const byCategory = new Map<string, typeof articles>();
  for (const article of articles) {
    const list = byCategory.get(article.category) ?? [];
    list.push(article);
    byCategory.set(article.category, list);
  }

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Sık sorulan sorular', path: ROUTES.faq() },
  ];

  return (
    <div className="container">
      <JsonLd data={[breadcrumbJsonLd(env.siteUrl, breadcrumb), faqJsonLd(faqEntries)]} />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sık sorulan sorular</h1>
        <p className={styles.pageLead}>
          Aradığın cevabı bulamazsan hesabındaki destek bölümünden bize yazabilirsin.
        </p>
      </header>

      {[...byCategory.entries()].map(([category, items]) => (
        <section key={category} className={styles.section}>
          <SectionHeader title={category} as="h2" />
          <div>
            {items.map((article) => (
              <div key={article.id} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  <Link href={ROUTES.help(article.slug)}>{article.title}</Link>
                </h3>
                <p className={styles.faqAnswer}>{article.summary}</p>
                <p style={{ marginTop: 6, fontSize: 13 }}>
                  <Link href={ROUTES.help(article.slug)}>Ayrıntılı yanıt →</Link>
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className={styles.section}>
        <Card raised>
          <SectionHeader
            title="Cevabını bulamadın mı?"
            description="Nasıl çalıştığımızı adım adım anlattığımız sayfaya göz atabilirsin."
            action={
              <LinkButton href={ROUTES.howItWorks()} variant="secondary">
                Nasıl çalışır?
              </LinkButton>
            }
          />
        </Card>
      </section>
    </div>
  );
}
