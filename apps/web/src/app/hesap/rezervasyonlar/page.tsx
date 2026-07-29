import type { Metadata } from 'next';
import Link from 'next/link';
import {
  formatCurrency,
  formatDate,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  type Reservation,
} from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState, LinkButton } from '@/components/ui';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Rezervasyonlarım | HazırGrup',
  robots: { index: false, follow: false },
};

const TABS = [
  { key: 'bekleyen', label: 'Onay bekleyen' },
  { key: 'onaylanan', label: 'Onaylanan' },
  { key: 'gecmis', label: 'Geçmiş' },
  { key: 'iptal', label: 'İptal edilen' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function groupReservations(reservations: Reservation[]): Record<TabKey, Reservation[]> {
  return {
    bekleyen: reservations.filter(
      (r) => r.status === 'pending_business' || r.status === 'created',
    ),
    onaylanan: reservations.filter((r) => r.status === 'confirmed'),
    gecmis: reservations.filter((r) => r.status === 'completed' || r.status === 'no_show'),
    iptal: reservations.filter(
      (r) =>
        r.status === 'rejected' ||
        r.status === 'cancelled_by_user' ||
        r.status === 'cancelled_by_business',
    ),
  };
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sekme?: string }>;
}) {
  const user = await requireUser('/hesap/rezervasyonlar');
  const { sekme } = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === sekme) ? (sekme as TabKey) : 'bekleyen';

  const repo = await getRepository();
  const reservations = await repo.listReservationsForUser(user.id);
  const grouped = groupReservations(reservations);
  const current = grouped[activeTab];

  const packageNames = new Map<string, string>();
  const businessNames = new Map<string, string>();
  for (const reservation of reservations) {
    if (!packageNames.has(reservation.packageId)) {
      const pkg = await repo.getPackage(reservation.packageId);
      packageNames.set(reservation.packageId, pkg?.name ?? 'Paket');
    }
    if (!businessNames.has(reservation.businessId)) {
      const business = await repo.getBusiness(reservation.businessId);
      businessNames.set(reservation.businessId, business?.name ?? 'Mekân');
    }
  }

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Rezervasyonlarım</h1>
        <p className={styles.panelSubtitle}>
          Gönderdiğin rezervasyon taleplerinin durumunu buradan takip edebilirsin.
        </p>
      </header>

      <nav className={publicStyles.chipRow} style={{ marginBottom: 20 }} aria-label="Rezervasyon sekmeleri">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/hesap/rezervasyonlar?sekme=${tab.key}`}
            className={publicStyles.chip}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            style={
              activeTab === tab.key
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
            <span className={publicStyles.chipCount}>{grouped[tab.key].length}</span>
          </Link>
        ))}
      </nav>

      {current.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Bu bölümde rezervasyon yok"
          description="Oylaması biten planından rezervasyon oluşturabilirsin."
          action={<LinkButton href="/hesap/planlar">Planlarıma git</LinkButton>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {current.map((reservation) => (
            <Card key={reservation.id}>
              <Badge
                tone={RESERVATION_STATUS_TONES[reservation.status]}
                icon={RESERVATION_STATUS_ICONS[reservation.status]}
              >
                {RESERVATION_STATUS_LABELS[reservation.status]}
              </Badge>

              <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>
                <Link href={`/hesap/rezervasyonlar/${reservation.id}`}>
                  {businessNames.get(reservation.businessId)}
                </Link>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {packageNames.get(reservation.packageId)}
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {formatDate(reservation.reservedDate)} · {reservation.peopleCount} kişi ·{' '}
                {formatCurrency(reservation.totalPrice)}
              </p>
              <p style={{ fontSize: 13, marginTop: 6 }}>
                Kod: <code style={{ fontWeight: 700 }}>{reservation.code}</code>
              </p>

              <div style={{ marginTop: 12 }}>
                <LinkButton
                  href={`/hesap/rezervasyonlar/${reservation.id}`}
                  size="sm"
                  variant="secondary"
                >
                  Detayı gör
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
