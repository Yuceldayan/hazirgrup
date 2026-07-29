import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  businessMetadata,
  decideBusinessIndexability,
  formatCurrency,
  formatPhone,
  localBusinessJsonLd,
  ROUTES,
  toWhatsAppNumber,
  WEEKDAY_LABELS,
  type Weekday,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Badge, Breadcrumb, Card, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { PackageCard } from '@/components/PackageCard';
import styles from '@/components/public.module.css';

/**
 * Public işletme sayfası.
 *
 * İçerik SERVER-RENDERED'dır: adres, çalışma saatleri, paketler ve iletişim
 * bilgileri HTML kaynağında bulunur (docs/SEO_STRATEGY.md §8).
 */

export const revalidate = 900;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = await getRepository();
  const businesses = await repo.listPublicBusinesses({});
  return businesses.map((business) => ({ slug: business.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepository();
  const business = await repo.getPublicBusiness(slug);
  if (!business) notFound();

  const branch = business.branches[0];
  const prices = business.packages.map((p) => p.perPersonFrom);

  const content = businessMetadata({
    businessName: business.name,
    districtName: branch?.district.name ?? '',
    cityName: branch?.city.name ?? '',
    categoryName: business.category.name,
    packageCount: business.packages.length,
    minPerPerson: prices.length > 0 ? Math.min(...prices) : null,
    description: business.description,
  });

  const decision = decideBusinessIndexability({
    isIndexable: business.isIndexable,
    isPublic: true,
    status: business.isVerified ? 'verified' : 'pending_review',
    activePackageCount: business.packages.length,
  });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: business.seoTitle ?? content.title,
      description: business.seoDescription ?? content.description,
      path: ROUTES.business(business.slug),
      shouldIndex: decision.shouldIndex,
      ...(business.ogImageUrl ? { ogImagePath: business.ogImageUrl } : {}),
      ...(business.seoCanonical ? { canonicalOverride: business.seoCanonical } : {}),
    }),
  );
}

export default async function BusinessPage({ params }: Params) {
  const { slug } = await params;
  const repo = await getRepository();
  const business = await repo.getPublicBusiness(slug);
  if (!business) notFound();

  const categories = await repo.listCategories();
  const categoryKey = categories.find((c) => c.id === business.category.id)?.key ?? '';

  const primaryBranch = business.branches[0];
  const prices = business.packages.map((p) => p.perPersonFrom);
  const cheapest = prices.length > 0 ? Math.min(...prices) : null;

  const relatedPackages = primaryBranch
    ? await repo.listPublicPackages({
        citySlug: primaryBranch.city.slug,
        categorySlug: business.category.slug,
        limit: 6,
      })
    : [];

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    ...(primaryBranch
      ? [
          { name: primaryBranch.city.name, path: ROUTES.city(primaryBranch.city.slug) },
          {
            name: primaryBranch.district.name,
            path: ROUTES.district(primaryBranch.city.slug, primaryBranch.district.slug),
          },
        ]
      : []),
    { name: business.name, path: ROUTES.business(business.slug) },
  ];

  return (
    <div className="container">
      <JsonLd
        data={[
          breadcrumbJsonLd(env.siteUrl, breadcrumb),
          localBusinessJsonLd(env.siteUrl, business, categoryKey),
        ]}
      />

      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <div className={styles.detail}>
        <div>
          {business.coverUrl ? (
            <div className={styles.hero}>
              <Image
                src={business.coverUrl}
                alt={`${business.name} — temsilî görsel`}
                width={1200}
                height={800}
                sizes="(min-width: 960px) 760px, 100vw"
                className={styles.heroImage}
                priority
              />
            </div>
          ) : null}

          <div className={styles.metaRow}>
            <Badge tone="brand">{business.category.name}</Badge>
            {business.isVerified ? (
              <Badge tone="success" icon="✓">
                Doğrulanmış işletme
              </Badge>
            ) : null}
          </div>

          <h1 className={styles.pageTitle}>{business.name}</h1>
          {primaryBranch ? (
            <p className={styles.pageLead}>
              {primaryBranch.district.name}, {primaryBranch.city.name} ·{' '}
              {business.branches.length} şube · {business.packages.length} paket
            </p>
          ) : null}

          <p className={styles.pageLead} style={{ marginTop: 12 }}>
            {business.description}
          </p>

          {/* --- Paketler --------------------------------------------------- */}
          <section className={styles.section}>
            <SectionHeader
              title="Grup paketleri"
              description={
                cheapest !== null
                  ? `Kişi başı ${formatCurrency(cheapest)}'den başlıyor.`
                  : undefined
              }
            />
            {business.packages.length === 0 ? (
              <Card>
                <p>Bu mekânın şu anda yayında paketi bulunmuyor.</p>
              </Card>
            ) : (
              <div className={styles.itemList}>
                {business.packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>
                          <Link href={ROUTES.package(pkg.slug)}>{pkg.name}</Link>
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          {pkg.minPeople}–{pkg.maxPeople} kişi · {pkg.districtName}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700 }}>{formatCurrency(pkg.perPersonFrom)}</p>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>kişi başı</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* --- Şubeler ---------------------------------------------------- */}
          <section className={styles.section}>
            <SectionHeader title="Şubeler ve çalışma saatleri" />
            <div className={styles.itemList}>
              {business.branches.map((branch) => (
                <Card key={branch.id}>
                  <p style={{ fontWeight: 600 }}>{branch.name}</p>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {branch.address}
                  </p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>
                    <Link href={ROUTES.district(branch.city.slug, branch.district.slug)}>
                      {branch.district.name}
                    </Link>
                    {' · '}
                    <Link href={ROUTES.city(branch.city.slug)}>{branch.city.name}</Link>
                  </p>

                  <table className={styles.hoursTable} style={{ marginTop: 12 }}>
                    <caption className="sr-only">{branch.name} çalışma saatleri</caption>
                    <tbody>
                      {branch.hours.map((entry) => (
                        <tr key={entry.weekday}>
                          <td>{WEEKDAY_LABELS[entry.weekday as Weekday]}</td>
                          <td className={entry.isClosed ? styles.closed : undefined}>
                            {entry.isClosed || !entry.opensAt || !entry.closesAt
                              ? 'Kapalı'
                              : `${entry.opensAt} – ${entry.closesAt}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {branch.phone ? (
                    <div className={styles.contactRow} style={{ marginTop: 12 }}>
                      <a
                        href={`tel:${branch.phone}`}
                        className={styles.chip}
                        aria-label={`${branch.name} şubesini ara`}
                      >
                        📞 {formatPhone(branch.phone)}
                      </a>
                      {branch.whatsapp ? (
                        <a
                          href={`https://wa.me/${toWhatsAppNumber(branch.whatsapp)}`}
                          className={styles.chip}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          💬 WhatsApp
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          </section>

          {/* --- İlgili paketler -------------------------------------------- */}
          {relatedPackages.filter((p) => p.business.id !== business.id).length > 0 ? (
            <section className={styles.section}>
              <SectionHeader
                title="Benzer mekânlardan paketler"
                description={`${primaryBranch?.city.name ?? ''} bölgesindeki diğer ${business.category.name.toLocaleLowerCase('tr-TR')} paketleri.`}
              />
              <div className={styles.grid}>
                {relatedPackages
                  .filter((p) => p.business.id !== business.id)
                  .slice(0, 3)
                  .map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* --- Yan panel -------------------------------------------------- */}
        <aside className={styles.detailAside}>
          <Card raised>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Bu mekân için plan oluştur</p>
            <p
              style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}
            >
              Kişi sayını ve bütçeni gir, arkadaşlarını davet et, birlikte oylayın.
            </p>
            <LinkButton href="/hesap/plan/yeni" fullWidth>
              Yeni plan oluştur
            </LinkButton>
          </Card>

          <Card>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>İletişim</p>
            <div className={styles.infoList}>
              {business.phone ? (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Telefon</span>
                  <a href={`tel:${business.phone}`} className={styles.infoValue}>
                    {formatPhone(business.phone)}
                  </a>
                </div>
              ) : null}
              {business.instagram ? (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Instagram</span>
                  <span className={styles.infoValue}>@{business.instagram}</span>
                </div>
              ) : null}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Kategori</span>
                <Link href={ROUTES.category(business.category.slug)} className={styles.infoValue}>
                  {business.category.name}
                </Link>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Şube sayısı</span>
                <span className={styles.infoValue}>{business.branches.length}</span>
              </div>
            </div>

            {business.whatsapp ? (
              <div style={{ marginTop: 12 }}>
                <a
                  href={`https://wa.me/${toWhatsAppNumber(business.whatsapp)}`}
                  className={styles.chip}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 WhatsApp ile yaz
                </a>
              </div>
            ) : null}
          </Card>

          <Card flat>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              HazırGrup bir aracı platformdur; mekân işletmecisi değildir. Rezervasyon işletme
              onayıyla kesinleşir, ödeme mekânda yapılır.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
