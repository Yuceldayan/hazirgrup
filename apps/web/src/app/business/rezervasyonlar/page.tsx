import type { Metadata } from 'next';
import Link from 'next/link';
import {
  canBusinessRespond,
  formatCurrency,
  formatDate,
  formatPhone,
  formatRelativeTime,
  formatTimeRange,
  REJECTION_REASON_LABELS,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  toWhatsAppNumber,
  type BusinessReservationRow,
} from '@hazirgrup/core';
import { requireBusinessMember } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState, LinkButton } from '@/components/ui';
import { ReservationLifecycle, ReservationResponse } from './ReservationResponse';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Rezervasyonlar | İşletme paneli',
  robots: { index: false, follow: false },
};

const TABS = [
  { key: 'bekleyen', label: 'Bekleyen talepler' },
  { key: 'onaylanan', label: 'Onaylanan' },
  { key: 'gecmis', label: 'Geçmiş' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default async function BusinessReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sekme?: string }>;
}) {
  const { businessId } = await requireBusinessMember();
  const { sekme } = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === sekme) ? (sekme as TabKey) : 'bekleyen';

  const repo = await getRepository();
  const all = await repo.listReservationsForBusiness(businessId);
  const now = Date.now();

  const grouped: Record<TabKey, BusinessReservationRow[]> = {
    bekleyen: all.filter((row) => canBusinessRespond(row.reservation.status)),
    onaylanan: all.filter((row) => row.reservation.status === 'confirmed'),
    gecmis: all.filter(
      (row) =>
        row.reservation.status !== 'pending_business' &&
        row.reservation.status !== 'created' &&
        row.reservation.status !== 'confirmed',
    ),
  };

  const current = grouped[activeTab];

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Rezervasyonlar</h1>
        <p className={styles.panelSubtitle}>
          Gelen talepleri yanıtla, onaylanan rezervasyonları yönet.
        </p>
      </header>

      <nav className={publicStyles.chipRow} style={{ marginBottom: 20 }} aria-label="Sekmeler">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/business/rezervasyonlar?sekme=${tab.key}`}
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
          description="Yeni talepler geldiğinde burada görünür ve bildirim alırsın."
          action={<LinkButton href="/business/paketler" variant="secondary">Paketlerini yönet</LinkButton>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {current.map((row) => {
            const { reservation } = row;
            return (
              <Card key={reservation.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge
                    tone={RESERVATION_STATUS_TONES[reservation.status]}
                    icon={RESERVATION_STATUS_ICONS[reservation.status]}
                  >
                    {RESERVATION_STATUS_LABELS[reservation.status]}
                  </Badge>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {formatRelativeTime(reservation.createdAt, now)}
                  </span>
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{row.packageName}</h2>

                <div className={publicStyles.infoList} style={{ marginTop: 10 }}>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Tarih / saat</span>
                    <span className={publicStyles.infoValue}>
                      {formatDate(reservation.reservedDate)} ·{' '}
                      {formatTimeRange(
                        reservation.reservedStartTime,
                        reservation.reservedEndTime,
                      )}
                    </span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Kişi sayısı</span>
                    <span className={publicStyles.infoValue}>{reservation.peopleCount} kişi</span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Şube</span>
                    <span className={publicStyles.infoValue}>{row.branchName}</span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Toplam</span>
                    <span className={publicStyles.infoValue}>
                      {formatCurrency(reservation.totalPrice)} (
                      {formatCurrency(reservation.perPersonPrice)} kişi başı)
                    </span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>İletişim</span>
                    <span className={publicStyles.infoValue}>
                      {reservation.contactName} · {formatPhone(reservation.contactPhone)}
                    </span>
                  </div>
                  <div className={publicStyles.infoRow}>
                    <span className={publicStyles.infoLabel}>Rezervasyon kodu</span>
                    <span className={publicStyles.infoValue}>
                      <code>{reservation.code}</code>
                    </span>
                  </div>
                  {reservation.note ? (
                    <div className={publicStyles.infoRow}>
                      <span className={publicStyles.infoLabel}>Müşteri notu</span>
                      <span className={publicStyles.infoValue}>{reservation.note}</span>
                    </div>
                  ) : null}
                  {reservation.rejectionReason ? (
                    <div className={publicStyles.infoRow}>
                      <span className={publicStyles.infoLabel}>Ret gerekçesi</span>
                      <span className={publicStyles.infoValue}>
                        {REJECTION_REASON_LABELS[reservation.rejectionReason]}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className={publicStyles.contactRow} style={{ marginTop: 12 }}>
                  <a href={`tel:${reservation.contactPhone}`} className={publicStyles.chip}>
                    📞 Ara
                  </a>
                  <a
                    href={`https://wa.me/${toWhatsAppNumber(reservation.contactPhone)}`}
                    className={publicStyles.chip}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 WhatsApp
                  </a>
                </div>

                {canBusinessRespond(reservation.status) ? (
                  <ReservationResponse reservationId={reservation.id} />
                ) : reservation.status === 'confirmed' ? (
                  <ReservationLifecycle reservationId={reservation.id} />
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
