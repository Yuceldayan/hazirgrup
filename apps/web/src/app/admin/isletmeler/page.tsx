import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPhone, ROUTES } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState, SectionHeader } from '@/components/ui';
import { BusinessStatusForm } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'İşletmeler | Yönetici',
  robots: { index: false, follow: false },
};

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending_review: 'warning',
  draft: 'neutral',
  rejected: 'danger',
  suspended: 'danger',
};

const STATUS_LABEL: Record<string, string> = {
  verified: 'Doğrulandı',
  pending_review: 'İnceleniyor',
  draft: 'Taslak',
  rejected: 'Reddedildi',
  suspended: 'Askıya alındı',
};

export default async function AdminBusinessesPage() {
  await requireAdmin('/admin/isletmeler');
  const repo = await getRepository();

  const businesses = await repo.listBusinesses();
  const categories = await repo.listCategories();

  const rows = await Promise.all(
    businesses.map(async (business) => ({
      business,
      branches: await repo.listBranches(business.id),
      packages: await repo.listPackages({ businessId: business.id }),
    })),
  );

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>İşletmeler</h1>
        <p className={styles.panelSubtitle}>
          Doğrulama durumunu yönet. Yalnızca doğrulanmış işletmeler public sayfalarda görünür.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon="🏪"
          title="Kayıtlı işletme yok"
          description="Başvurular onaylandığında işletmeler burada listelenir."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(({ business, branches, packages }) => (
            <Card key={business.id}>
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
                    <Badge tone={STATUS_TONE[business.status] ?? 'neutral'}>
                      {STATUS_LABEL[business.status] ?? business.status}
                    </Badge>
                    <Badge tone={business.isPublic ? 'brand' : 'neutral'}>
                      {business.isPublic ? 'Public' : 'Gizli'}
                    </Badge>
                  </div>

                  <p style={{ fontWeight: 700, marginTop: 8 }}>{business.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {categories.find((c) => c.id === business.categoryId)?.name ?? '—'} ·{' '}
                    {branches.length} şube · {packages.length} paket
                    {business.phone ? ` · ${formatPhone(business.phone)}` : ''}
                  </p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>
                    <code>{ROUTES.business(business.slug)}</code>
                    {business.status === 'verified' && business.isPublic ? (
                      <>
                        {' · '}
                        <Link href={ROUTES.business(business.slug)}>Public sayfayı gör</Link>
                      </>
                    ) : null}
                  </p>
                </div>

                <BusinessStatusForm businessId={business.id} status={business.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        <SectionHeader title="Kural" />
        <Card flat>
          <p className={publicStyles.chipCount} style={{ fontSize: 13 }}>
            Doğrulanmamış işletmelerin sayfaları ve paketleri public&apos;te 404 döner, sitemap&apos;e
            eklenmez (docs/DECISIONS.md D-026).
          </p>
        </Card>
      </section>
    </div>
  );
}
