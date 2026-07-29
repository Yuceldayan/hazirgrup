import type { Metadata } from 'next';
import Link from 'next/link';
import { formatRelativeTime } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Alert, Card, LinkButton, SectionHeader } from '@/components/ui';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Yönetici paneli | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  await requireAdmin('/admin');
  const repo = await getRepository();

  const [stats, logs, pending] = await Promise.all([
    repo.getAdminOverview(),
    repo.listAdminLogs(8),
    repo.listApplications('pending'),
  ]);

  const now = Date.now();

  const cards = [
    { label: 'Kullanıcı', value: stats.userCount, icon: '👤', href: '/admin/kullanicilar' },
    { label: 'Doğrulanmış işletme', value: stats.businessCount, icon: '🏪', href: '/admin/isletmeler' },
    { label: 'Bekleyen başvuru', value: stats.pendingApplications, icon: '📥', href: '/admin/basvurular' },
    { label: 'Paket', value: stats.packageCount, icon: '📦', href: '/admin/paketler' },
    { label: 'Plan', value: stats.planCount, icon: '📋', href: '/admin' },
    { label: 'Rezervasyon', value: stats.reservationCount, icon: '📅', href: '/admin' },
    { label: 'Aktif şehir', value: stats.activeCities, icon: '🏙️', href: '/admin/sehirler' },
    { label: 'Açık şikâyet', value: stats.openReports, icon: '⚠️', href: '/admin' },
  ];

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Sistem özeti</h1>
        <p className={styles.panelSubtitle}>
          Platformun genel durumu ve son yönetici işlemleri.
        </p>
      </header>

      {pending.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="warning" title={`${pending.length} işletme başvurusu inceleme bekliyor`}>
            Başvuruları hızlı sonuçlandırmak işletme kazanımını artırır.{' '}
            <Link href="/admin/basvurular">Başvuruları incele →</Link>
          </Alert>
        </div>
      ) : null}

      <div className={publicStyles.grid}>
        {cards.map((card) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <Card>
              <p style={{ fontSize: 20 }} aria-hidden="true">
                {card.icon}
              </p>
              <p style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{card.value}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{card.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="Son yönetici işlemleri"
          action={
            <LinkButton href="/admin/audit" variant="ghost" size="sm">
              Tüm audit log →
            </LinkButton>
          }
        />
        <Card>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.map((log) => (
              <li
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 13,
                  paddingBottom: 8,
                  borderBottom: '1px solid var(--color-border-default)',
                }}
              >
                <span>
                  <strong>{log.actorName}</strong> · <code>{log.action}</code> ·{' '}
                  {log.entityType}
                </span>
                <span style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatRelativeTime(log.createdAt, now)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
