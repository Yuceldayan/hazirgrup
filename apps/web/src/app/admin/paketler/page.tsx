import type { Metadata } from 'next';
import Link from 'next/link';
import {
  decidePackageIndexability,
  formatCurrency,
  formatPeopleRange,
  packageStartingPrices,
  ROUTES,
} from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState } from '@/components/ui';
import { AdminPackageToggle } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Paketler | Yönetici',
  robots: { index: false, follow: false },
};

export default async function AdminPackagesPage() {
  await requireAdmin('/admin/paketler');
  const repo = await getRepository();

  const [packages, businesses] = await Promise.all([
    repo.listPackages(),
    repo.listBusinesses(),
  ]);

  const businessById = new Map(businesses.map((b) => [b.id, b]));

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Paketler</h1>
        <p className={styles.panelSubtitle}>
          Uygunsuz içerikli paketleri pasife alabilirsin. İşlem audit log&apos;a yazılır.
        </p>
      </header>

      {packages.length === 0 ? (
        <EmptyState icon="📦" title="Paket yok" description="İşletmeler paket ekledikçe burada listelenir." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {packages.map((pkg) => {
            const business = businessById.get(pkg.businessId);
            const prices = packageStartingPrices({
              pricingModel: pkg.pricingModel,
              priceAmount: pkg.priceAmount,
              minPeople: pkg.minPeople,
              maxPeople: pkg.maxPeople,
            });
            const decision = decidePackageIndexability({
              isIndexable: pkg.isIndexable,
              isPublic: pkg.isPublic,
              isActive: pkg.isActive,
              businessStatus: business?.status ?? 'pending_review',
            });

            return (
              <Card key={pkg.id} flat>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge tone={pkg.isActive ? 'success' : 'warning'}>
                        {pkg.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                      <Badge tone={decision.shouldIndex ? 'brand' : 'neutral'}>
                        {decision.shouldIndex ? 'İndeksleniyor' : `noindex (${decision.reason})`}
                      </Badge>
                    </div>

                    <p style={{ fontWeight: 600, marginTop: 8 }}>{pkg.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {business?.name ?? '—'} · {formatPeopleRange(pkg.minPeople, pkg.maxPeople)}{' '}
                      · {formatCurrency(prices.perPersonFrom)} kişi başı
                    </p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>
                      <code>{ROUTES.package(pkg.slug)}</code>
                      {decision.shouldIndex ? (
                        <>
                          {' · '}
                          <Link href={ROUTES.package(pkg.slug)}>Public sayfayı gör</Link>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <AdminPackageToggle packageId={pkg.id} isActive={pkg.isActive} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
