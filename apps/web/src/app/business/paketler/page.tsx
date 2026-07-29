import type { Metadata } from 'next';
import Link from 'next/link';
import {
  formatCurrency,
  formatPeopleRange,
  packageStartingPrices,
  ROUTES,
} from '@hazirgrup/core';
import { requireBusinessMember } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Alert, Badge, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { PackageEditor, TogglePackageButton } from './PackageEditor';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Paketler | İşletme paneli',
  robots: { index: false, follow: false },
};

export default async function BusinessPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ duzenle?: string }>;
}) {
  const { businessId } = await requireBusinessMember();
  const { duzenle } = await searchParams;

  const repo = await getRepository();
  const [packages, branches, categories, preferences] = await Promise.all([
    repo.listPackages({ businessId }),
    repo.listBranches(businessId),
    repo.listCategories({ onlyActive: true }),
    repo.listPreferences(),
  ]);

  const editing = duzenle ? (packages.find((p) => p.id === duzenle) ?? null) : null;

  if (branches.length === 0) {
    return (
      <div>
        <header className={styles.panelHeader}>
          <h1 className={styles.panelTitle}>Paketler</h1>
        </header>
        <EmptyState
          icon="📍"
          title="Önce bir şube eklemelisin"
          description="Paketler bir şubeye bağlıdır. Şube ekledikten sonra paket oluşturabilirsin."
          action={<LinkButton href="/business/subeler">Şube ekle</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Paketler</h1>
        <p className={styles.panelSubtitle}>
          Grup paketlerini oluştur, fiyatlandır ve yayına al.
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          title={`Paketlerin (${packages.length})`}
          action={
            editing ? (
              <LinkButton href="/business/paketler" variant="ghost" size="sm">
                Düzenlemeyi bırak
              </LinkButton>
            ) : undefined
          }
        />

        {packages.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Henüz paketin yok"
            description="Aşağıdaki formdan hazır bir şablon seçerek ilk paketini dakikalar içinde oluşturabilirsin."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {packages.map((pkg) => {
              const prices = packageStartingPrices({
                pricingModel: pkg.pricingModel,
                priceAmount: pkg.priceAmount,
                minPeople: pkg.minPeople,
                maxPeople: pkg.maxPeople,
              });
              const branch = branches.find((b) => b.id === pkg.branchId);

              return (
                <Card key={pkg.id}>
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
                        <Badge tone={pkg.isActive ? 'success' : 'warning'} icon={pkg.isActive ? '✓' : '⏸'}>
                          {pkg.isActive ? 'Rezervasyona açık' : 'Kapalı'}
                        </Badge>
                        {pkg.isPublic ? (
                          <Badge tone="neutral">Public</Badge>
                        ) : (
                          <Badge tone="neutral" icon="🔒">
                            Gizli
                          </Badge>
                        )}
                      </div>

                      <p style={{ fontWeight: 600, marginTop: 8 }}>{pkg.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {branch?.name ?? '—'} ·{' '}
                        {formatPeopleRange(pkg.minPeople, pkg.maxPeople)} ·{' '}
                        {pkg.pricingModel === 'per_person' ? 'kişi başı' : 'sabit toplam'}
                      </p>
                      <p style={{ fontSize: 13, marginTop: 4 }}>
                        {formatCurrency(prices.perPersonFrom)} kişi başı ·{' '}
                        {formatCurrency(prices.totalFrom)} toplam
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <LinkButton
                        href={`/business/paketler?duzenle=${pkg.id}`}
                        size="sm"
                        variant="secondary"
                      >
                        Düzenle
                      </LinkButton>
                      <TogglePackageButton packageId={pkg.id} isActive={pkg.isActive} />
                    </div>
                  </div>

                  {pkg.isActive && pkg.isPublic ? (
                    <p style={{ fontSize: 12, marginTop: 10 }}>
                      <Link href={ROUTES.package(pkg.slug)}>Public sayfayı gör →</Link>
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {editing ? (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="info">
            <strong>{editing.name}</strong> paketini düzenliyorsun.
          </Alert>
        </div>
      ) : null}

      <PackageEditor
        branches={branches}
        categories={categories}
        preferences={preferences}
        editing={editing}
      />
    </div>
  );
}
