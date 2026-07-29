import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPhone, formatRelativeTime } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState, LinkButton } from '@/components/ui';
import { ApplicationReview } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'İşletme başvuruları | Yönetici',
  robots: { index: false, follow: false },
};

const TABS = [
  { key: 'pending', label: 'Bekleyen' },
  { key: 'approved', label: 'Onaylanan' },
  { key: 'rejected', label: 'Reddedilen' },
] as const;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  await requireAdmin('/admin/basvurular');
  const { durum } = await searchParams;
  const status = TABS.some((t) => t.key === durum)
    ? (durum as 'pending' | 'approved' | 'rejected')
    : 'pending';

  const repo = await getRepository();
  const [applications, cities, categories] = await Promise.all([
    repo.listApplications(status),
    repo.listCities(),
    repo.listCategories(),
  ]);

  const allApplications = await repo.listApplications();
  const counts = {
    pending: allApplications.filter((a) => a.status === 'pending').length,
    approved: allApplications.filter((a) => a.status === 'approved').length,
    rejected: allApplications.filter((a) => a.status === 'rejected').length,
  };

  const now = Date.now();
  const districts = await Promise.all(cities.map((city) => repo.listDistricts(city.id)));
  const allDistricts = districts.flat();

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>İşletme başvuruları</h1>
        <p className={styles.panelSubtitle}>
          Başvuruyu onayladığında işletme kaydı, sahiplik rolü ve ilk şube otomatik oluşur.
        </p>
      </header>

      <nav className={publicStyles.chipRow} style={{ marginBottom: 20 }} aria-label="Durum">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/basvurular?durum=${tab.key}`}
            className={publicStyles.chip}
            aria-current={status === tab.key ? 'page' : undefined}
            style={
              status === tab.key
                ? {
                    borderColor: 'var(--color-brand-default)',
                    background: 'var(--color-brand-surface)',
                    color: 'var(--color-brand-text)',
                    fontWeight: 600,
                  }
                : undefined
            }
          >
            {tab.label}
            <span className={publicStyles.chipCount}>{counts[tab.key]}</span>
          </Link>
        ))}
      </nav>

      {applications.length === 0 ? (
        <EmptyState
          icon="📥"
          title="Bu durumda başvuru yok"
          description="Yeni başvurular geldiğinde burada listelenir."
          action={<LinkButton href="/admin" variant="secondary">Panele dön</LinkButton>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((application) => {
            const city = cities.find((c) => c.id === application.cityId);
            const district = allDistricts.find((d) => d.id === application.districtId);
            const category = categories.find((c) => c.id === application.categoryId);

            return (
              <Card key={application.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge
                    tone={
                      application.status === 'approved'
                        ? 'success'
                        : application.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {application.status === 'approved'
                      ? 'Onaylandı'
                      : application.status === 'rejected'
                        ? 'Reddedildi'
                        : 'İnceleniyor'}
                  </Badge>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {formatRelativeTime(application.createdAt, now)}
                  </span>
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
                  {application.businessName}
                </h2>

                <div className={publicStyles.infoList} style={{ marginTop: 10 }}>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Yetkili</span>
                    <span className={publicStyles.infoValue}>{application.contactName}</span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>İletişim</span>
                    <span className={publicStyles.infoValue}>
                      {formatPhone(application.phone)} · {application.email}
                    </span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Konum</span>
                    <span className={publicStyles.infoValue}>
                      {district?.name ?? '—'}, {city?.name ?? '—'}
                    </span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Adres</span>
                    <span className={publicStyles.infoValue}>{application.address}</span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Kategori</span>
                    <span className={publicStyles.infoValue}>{category?.name ?? '—'}</span>
                  </div>
                  {application.taxInfo ? (
                    <div className={publicStyles.infoRow}>
                      <span className={publicStyles.infoLabel}>Vergi/işletme bilgisi</span>
                      <span className={publicStyles.infoValue}>
                        <code>{application.taxInfo}</code>
                      </span>
                    </div>
                  ) : null}
                  {application.reviewNote ? (
                    <div className={publicStyles.infoRow}>
                      <span className={publicStyles.infoLabel}>İnceleme notu</span>
                      <span className={publicStyles.infoValue}>{application.reviewNote}</span>
                    </div>
                  ) : null}
                </div>

                {application.status === 'pending' ? (
                  <ApplicationReview applicationId={application.id} />
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
