import Image from 'next/image';
import Link from 'next/link';
import type { PublicPackage } from '@hazirgrup/types';
import { formatCurrency, formatPeopleRange, ROUTES } from '@hazirgrup/core';
import { Badge } from '@/components/ui';
import styles from './package-card.module.css';

/**
 * Public paket kartı — liste sayfalarında kullanılır.
 *
 * Görsel boyutları sabittir (CLS koruması, docs/SEO_STRATEGY.md §13).
 */
export function PackageCard({
  pkg,
  showBusiness = true,
  priority = false,
}: {
  pkg: PublicPackage;
  showBusiness?: boolean;
  priority?: boolean;
}) {
  const image = pkg.images[0];

  return (
    <article className={styles.card}>
      <Link href={ROUTES.package(pkg.slug)} className={styles.imageLink}>
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 900px) 360px, (min-width: 560px) 45vw, 100vw"
            className={styles.image}
            priority={priority}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            📦
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          <Badge tone="neutral">{pkg.category.name}</Badge>
          <span className={styles.location}>
            {pkg.branch.district.name}, {pkg.branch.city.name}
          </span>
        </div>

        <h3 className={styles.title}>
          <Link href={ROUTES.package(pkg.slug)}>{pkg.name}</Link>
        </h3>

        {showBusiness ? (
          <p className={styles.business}>
            <Link href={ROUTES.business(pkg.business.slug)}>{pkg.business.name}</Link>
            {pkg.business.isVerified ? (
              <span className={styles.verified} title="Doğrulanmış işletme">
                {' '}
                ✓ Doğrulanmış
              </span>
            ) : null}
          </p>
        ) : null}

        <p className={styles.capacity}>{formatPeopleRange(pkg.minPeople, pkg.maxPeople)}</p>

        <div className={styles.priceRow}>
          <div>
            <p className={styles.price}>{formatCurrency(pkg.perPersonFrom)}</p>
            <p className={styles.priceLabel}>kişi başı</p>
          </div>
          <div className={styles.totalBox}>
            <p className={styles.total}>{formatCurrency(pkg.totalFrom)}</p>
            <p className={styles.priceLabel}>toplam</p>
          </div>
        </div>
      </div>
    </article>
  );
}
