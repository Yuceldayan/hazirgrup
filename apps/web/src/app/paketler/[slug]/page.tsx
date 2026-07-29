import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  breadcrumbJsonLd,
  buildMetadata,
  decidePackageIndexability,
  formatCurrency,
  formatDuration,
  formatPeopleRange,
  formatPhone,
  packageMetadata,
  packageOfferJsonLd,
  packagePageBehavior,
  ROUTES,
  toWhatsAppNumber,
  WEEKDAY_SHORT_LABELS,
  type Weekday,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { env, metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Alert, Badge, Breadcrumb, Card, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { PackageCard } from '@/components/PackageCard';
import styles from '@/components/public.module.css';

/**
 * Public paket sayfası.
 *
 * HTTP davranışı (docs/SEO_STRATEGY.md §9):
 *  - Slug değişmişse 301
 *  - Geçici pasif → 200 + açıklama + noindex
 *  - Public değil / doğrulanmamış işletme → 404
 *  - Kalıcı silinmiş → 410 kaydı varsa 404 gövdesiyle birlikte
 */

export const revalidate = 900;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = await getRepository();
  const packages = await repo.listPublicPackages({});
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepository();
  const pkg = await repo.getPublicPackage(slug);

  if (!pkg) {
    // Slug değişmişse sayfa 301 yönlendirecek; bu durumda 404 üretme.
    const redirect = await repo.findRedirect(ROUTES.package(slug));
    if (redirect?.statusCode === 301) {
      return { title: 'Yönlendiriliyor | HazırGrup', robots: { index: false, follow: true } };
    }
    // Metadata aşamasında 404 üretmek doğru HTTP durumunu garanti eder (soft 404 önlenir).
    notFound();
  }

  const content = packageMetadata({
    packageName: pkg.name,
    businessName: pkg.business.name,
    districtName: pkg.branch.district.name,
    cityName: pkg.branch.city.name,
    minPeople: pkg.minPeople,
    maxPeople: pkg.maxPeople,
    perPersonFrom: pkg.perPersonFrom,
    totalFrom: pkg.totalFrom,
    itemLabels: pkg.items.map((item) => item.label),
  });

  const decision = decidePackageIndexability({
    isIndexable: pkg.isIndexable,
    isPublic: true,
    isActive: pkg.isActive,
    businessStatus: pkg.business.isVerified ? 'verified' : 'pending_review',
  });

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: pkg.seoTitle ?? content.title,
      description: pkg.seoDescription ?? content.description,
      path: ROUTES.package(pkg.slug),
      shouldIndex: decision.shouldIndex,
      ...(pkg.images[0] ? { ogImagePath: pkg.images[0].url } : {}),
      ...(pkg.seoCanonical ? { canonicalOverride: pkg.seoCanonical } : {}),
    }),
  );
}

export default async function PackagePage({ params }: Params) {
  const { slug } = await params;
  const repo = await getRepository();

  const pkg = await repo.getPublicPackage(slug);

  // Slug değişmişse kalıcı yönlendirme uygula.
  if (!pkg) {
    const redirect = await repo.findRedirect(ROUTES.package(slug));
    if (redirect && redirect.statusCode === 301 && redirect.toPath) {
      permanentRedirect(redirect.toPath);
    }
    notFound();
  }

  const behavior = packagePageBehavior({
    exists: true,
    isPublic: true,
    isActive: pkg.isActive,
    businessStatus: pkg.business.isVerified ? 'verified' : 'pending_review',
  });

  if (behavior.kind === 'not_found') notFound();

  const [siblingPackages, relatedPackages] = await Promise.all([
    repo.listPublicPackages({ businessSlug: pkg.business.slug }),
    repo.listPublicPackages({
      citySlug: pkg.branch.city.slug,
      categorySlug: pkg.category.slug,
      limit: 8,
    }),
  ]);

  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: pkg.branch.city.name, path: ROUTES.city(pkg.branch.city.slug) },
    {
      name: pkg.branch.district.name,
      path: ROUTES.district(pkg.branch.city.slug, pkg.branch.district.slug),
    },
    { name: pkg.business.name, path: ROUTES.business(pkg.business.slug) },
    { name: pkg.name, path: ROUTES.package(pkg.slug) },
  ];

  const availabilityByDay = new Map<Weekday, string[]>();
  for (const slot of pkg.availability) {
    const existing = availabilityByDay.get(slot.weekday) ?? [];
    existing.push(`${slot.startTime}–${slot.endTime}`);
    availabilityByDay.set(slot.weekday, existing);
  }

  const image = pkg.images[0];

  return (
    <div className="container">
      <JsonLd
        data={[breadcrumbJsonLd(env.siteUrl, breadcrumb), packageOfferJsonLd(env.siteUrl, pkg)]}
      />

      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      {behavior.kind === 'inactive_notice' ? (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="warning" title="Bu paket şu anda rezervasyona kapalı">
            {behavior.message}
          </Alert>
        </div>
      ) : null}

      <div className={styles.detail}>
        <div>
          {image ? (
            <div className={styles.hero}>
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 960px) 760px, 100vw"
                className={styles.heroImage}
                priority
              />
            </div>
          ) : null}

          <div className={styles.metaRow}>
            <Badge tone="brand">{pkg.category.name}</Badge>
            <Badge tone="neutral">{formatPeopleRange(pkg.minPeople, pkg.maxPeople)}</Badge>
            {pkg.durationMinutes ? (
              <Badge tone="neutral">{formatDuration(pkg.durationMinutes)}</Badge>
            ) : null}
            {pkg.isActive ? (
              <Badge tone="success" icon="✓">
                Rezervasyona açık
              </Badge>
            ) : (
              <Badge tone="warning" icon="⏸">
                Geçici olarak kapalı
              </Badge>
            )}
          </div>

          <h1 className={styles.pageTitle}>{pkg.name}</h1>

          <p className={styles.pageLead}>
            <Link href={ROUTES.business(pkg.business.slug)}>{pkg.business.name}</Link>
            {' · '}
            {pkg.branch.name}
            {' · '}
            <Link href={ROUTES.district(pkg.branch.city.slug, pkg.branch.district.slug)}>
              {pkg.branch.district.name}
            </Link>
            {', '}
            <Link href={ROUTES.city(pkg.branch.city.slug)}>{pkg.branch.city.name}</Link>
          </p>

          <p className={styles.pageLead} style={{ marginTop: 12 }}>
            {pkg.description}
          </p>

          {/* --- İçerik ------------------------------------------------------ */}
          {pkg.items.length > 0 ? (
            <section className={styles.section}>
              <SectionHeader title="Pakete dahil olanlar" />
              <ul className={styles.itemList}>
                {pkg.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <span className={styles.itemCheck} aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      {item.label}
                      {item.detail ? (
                        <span style={{ color: 'var(--color-text-secondary)' }}> — {item.detail}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* --- Geçerlilik --------------------------------------------------- */}
          {availabilityByDay.size > 0 ? (
            <section className={styles.section}>
              <SectionHeader
                title="Geçerli gün ve saatler"
                description="Planındaki saatle uyuşan paketler otomatik eşleşir."
              />
              <table className={styles.hoursTable}>
                <caption className="sr-only">{pkg.name} geçerlilik saatleri</caption>
                <tbody>
                  {([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => {
                    const slots = availabilityByDay.get(weekday);
                    return (
                      <tr key={weekday}>
                        <td>{WEEKDAY_SHORT_LABELS[weekday]}</td>
                        <td className={slots ? undefined : styles.closed}>
                          {slots ? slots.join(', ') : 'Sunulmuyor'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ) : null}

          {/* --- Şartlar ------------------------------------------------------ */}
          <section className={styles.section}>
            <SectionHeader title="Rezervasyon ve iptal şartları" />
            <div className={styles.itemList}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>Rezervasyon</p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  {pkg.reservationTerms ??
                    'Rezervasyon talebi işletme onayından sonra kesinleşir.'}
                </p>
              </div>
              <div style={{ marginTop: 12 }}>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>İptal</p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  {pkg.cancellationTerms ?? 'İptal koşulları için işletmeyle iletişime geçin.'}
                </p>
              </div>
            </div>
          </section>

          {/* --- Aynı mekânın diğer paketleri --------------------------------- */}
          {siblingPackages.filter((p) => p.id !== pkg.id).length > 0 ? (
            <section className={styles.section}>
              <SectionHeader title={`${pkg.business.name} mekânının diğer paketleri`} />
              <div className={styles.grid}>
                {siblingPackages
                  .filter((p) => p.id !== pkg.id)
                  .slice(0, 3)
                  .map((item) => (
                    <PackageCard key={item.id} pkg={item} showBusiness={false} />
                  ))}
              </div>
            </section>
          ) : null}

          {/* --- İlgili paketler ---------------------------------------------- */}
          {relatedPackages.filter((p) => p.business.id !== pkg.business.id).length > 0 ? (
            <section className={styles.section}>
              <SectionHeader
                title="İlgili paketler"
                description={`${pkg.branch.city.name} bölgesindeki benzer seçenekler.`}
              />
              <div className={styles.grid}>
                {relatedPackages
                  .filter((p) => p.business.id !== pkg.business.id)
                  .slice(0, 3)
                  .map((item) => (
                    <PackageCard key={item.id} pkg={item} />
                  ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* --- Yan panel ------------------------------------------------------ */}
        <aside className={styles.detailAside}>
          <Card raised>
            <div className={styles.priceBlock}>
              <span className={styles.priceMain}>{formatCurrency(pkg.perPersonFrom)}</span>
              <span className={styles.priceUnit}>kişi başı</span>
            </div>
            <p className={styles.priceSecondary}>
              {pkg.pricingModel === 'total'
                ? `Sabit toplam ${formatCurrency(pkg.totalFrom)} — kişi sayısı arttıkça kişi başı düşer.`
                : `${pkg.minPeople} kişide toplam ${formatCurrency(pkg.totalFrom)}`}
            </p>

            <div style={{ marginTop: 16 }}>
              <LinkButton href="/hesap/plan/yeni" fullWidth size="lg">
                Bu paket için plan oluştur
              </LinkButton>
            </div>
            <p
              style={{
                fontSize: 12,
                color: 'var(--color-text-muted)',
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Ödeme mekânda yapılır. Rezervasyon işletme onayıyla kesinleşir.
            </p>
          </Card>

          <Card>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Paket bilgileri</p>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Kişi sayısı</span>
                <span className={styles.infoValue}>
                  {formatPeopleRange(pkg.minPeople, pkg.maxPeople)}
                </span>
              </div>
              {pkg.durationMinutes ? (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Süre</span>
                  <span className={styles.infoValue}>{formatDuration(pkg.durationMinutes)}</span>
                </div>
              ) : null}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Fiyatlandırma</span>
                <span className={styles.infoValue}>
                  {pkg.pricingModel === 'per_person' ? 'Kişi başı' : 'Sabit toplam'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Şube</span>
                <span className={styles.infoValue}>{pkg.branch.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Adres</span>
                <span className={styles.infoValue}>{pkg.branch.address}</span>
              </div>
            </div>

            {pkg.branch.phone ? (
              <div className={styles.contactRow} style={{ marginTop: 12 }}>
                <a href={`tel:${pkg.branch.phone}`} className={styles.chip}>
                  📞 {formatPhone(pkg.branch.phone)}
                </a>
                {pkg.branch.whatsapp ? (
                  <a
                    href={`https://wa.me/${toWhatsAppNumber(pkg.branch.whatsapp)}`}
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
        </aside>
      </div>
    </div>
  );
}
