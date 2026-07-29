import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, helpMetadata, ROUTES } from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { Markdown } from '@/components/Markdown';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = await getRepository();
  const articles = await repo.listHelpArticles({ onlyPublic: true });
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepository();
  const article = await repo.getHelpArticle(slug);
  if (!article || !article.isPublic) notFound();

  const content = helpMetadata({ title: article.title, summary: article.summary });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: article.seoTitle ?? content.title,
      description: article.seoDescription ?? content.description,
      path: ROUTES.help(article.slug),
      shouldIndex: article.isIndexable,
      type: 'article',
    }),
  );
}

export default async function HelpArticlePage({ params }: Params) {
  const { slug } = await params;
  const repo = await getRepository();
  const article = await repo.getHelpArticle(slug);
  if (!article || !article.isPublic) notFound();

  const allArticles = await repo.listHelpArticles({ onlyPublic: true });
  const related = allArticles.filter(
    (item) => item.id !== article.id && item.category === article.category,
  );

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Sık sorulan sorular', path: ROUTES.faq() },
    { name: article.title, path: ROUTES.help(article.slug) },
  ];

  return (
    <div className="container">
      <JsonLd
        data={[
          breadcrumbJsonLd(env.siteUrl, breadcrumb),
          faqJsonLd([{ question: article.title, answer: article.summary }]),
        ]}
      />
      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <article style={{ maxWidth: 760 }}>
        <header className={styles.pageHeader}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{article.category}</p>
          <h1 className={styles.pageTitle}>{article.title}</h1>
          <p className={styles.pageLead}>{article.summary}</p>
        </header>

        <Markdown content={article.body} />
      </article>

      {related.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader title="İlgili konular" />
          <div className={styles.chipRow}>
            {related.map((item) => (
              <Link key={item.id} href={ROUTES.help(item.slug)} className={styles.chip}>
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <Card raised>
          <SectionHeader
            title="Hâlâ yardım gerekiyor mu?"
            description="Tüm yardım konularına göz atabilirsin."
            action={
              <LinkButton href={ROUTES.faq()} variant="secondary">
                Tüm sorular
              </LinkButton>
            }
          />
        </Card>
      </section>
    </div>
  );
}
