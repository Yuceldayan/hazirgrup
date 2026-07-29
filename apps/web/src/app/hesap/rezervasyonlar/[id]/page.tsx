import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  alternativePackagesFor,
  buildReservationDetail,
  canUserCancel,
  formatCurrency,
  formatDate,
  formatPhone,
  formatRelativeTime,
  formatTimeRange,
  REJECTION_REASON_LABELS,
  RESERVATION_STATUS_DESCRIPTIONS,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  reservationTimelineSteps,
  ROUTES,
  shouldOfferAlternatives,
  toWhatsAppNumber,
} from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getServiceContext } from '@/server/repository';
import {
  Alert,
  Badge,
  Breadcrumb,
  Card,
  EmptyState,
  LinkButton,
  SectionHeader,
  Timeline,
} from '@/components/ui';
import { CancelReservationForm } from './CancelReservationForm';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Rezervasyon detayı | HazırGrup',
  robots: { index: false, follow: false },
};

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ReservationDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser(`/hesap/rezervasyonlar/${id}`);
  const ctx = await getServiceContext();

  const detail = await buildReservationDetail(ctx, id);
  if (!detail) notFound();

  const { reservation } = detail;

  // Yetki: talebi oluşturan veya planın katılımcısı görebilir.
  const isCreator = reservation.createdBy === user.id;
  const participant = await ctx.repo.findParticipantByUser(reservation.planId, user.id);
  if (!isCreator && !participant) {
    return (
      <EmptyState
        icon="🔒"
        title="Bu rezervasyonu görüntüleme yetkin yok"
        description="Yalnızca planın katılımcıları bu sayfayı görebilir."
        action={<LinkButton href="/hesap/rezervasyonlar">Rezervasyonlarıma dön</LinkButton>}
      />
    );
  }

  const alternatives = shouldOfferAlternatives(reservation.status)
    ? await alternativePackagesFor(ctx, {
        planId: reservation.planId,
        excludePackageId: reservation.packageId,
      })
    : [];

  return (
    <div>
      <Breadcrumb
        items={[
          { name: 'Rezervasyonlar', href: '/hesap/rezervasyonlar' },
          { name: detail.business.name },
        ]}
      />

      <header className={styles.panelHeader}>
        <Badge
          tone={RESERVATION_STATUS_TONES[reservation.status]}
          icon={RESERVATION_STATUS_ICONS[reservation.status]}
        >
          {RESERVATION_STATUS_LABELS[reservation.status]}
        </Badge>
        <h1 className={styles.panelTitle} style={{ marginTop: 8 }}>
          {detail.business.name}
        </h1>
        <p className={styles.panelSubtitle}>
          {RESERVATION_STATUS_DESCRIPTIONS[reservation.status]}
        </p>
      </header>

      {reservation.status === 'rejected' ? (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="error" title="Talebin kabul edilmedi">
            {reservation.rejectionNote ??
              (reservation.rejectionReason
                ? REJECTION_REASON_LABELS[reservation.rejectionReason]
                : 'İşletme talebi kabul edemedi.')}
          </Alert>
        </div>
      ) : null}

      {reservation.status === 'confirmed' ? (
        <Card raised>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Rezervasyon kodun</p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 2,
              marginTop: 4,
            }}
          >
            {reservation.code}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Mekâna vardığında bu kodu söylemen yeterli.
          </p>
        </Card>
      ) : null}

      {/* --- Bilgiler ------------------------------------------------------ */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Rezervasyon bilgileri" />
        <Card>
          <div className={publicStyles.infoList}>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Paket</span>
              <Link
                href={ROUTES.package(detail.package.slug)}
                className={publicStyles.infoValue}
              >
                {detail.package.name}
              </Link>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Şube</span>
              <span className={publicStyles.infoValue}>{detail.branch.name}</span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Adres</span>
              <span className={publicStyles.infoValue}>{detail.branch.address}</span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Tarih</span>
              <span className={publicStyles.infoValue}>
                {formatDate(reservation.reservedDate)}
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Saat</span>
              <span className={publicStyles.infoValue}>
                {formatTimeRange(reservation.reservedStartTime, reservation.reservedEndTime)}
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Kişi sayısı</span>
              <span className={publicStyles.infoValue}>{reservation.peopleCount} kişi</span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Toplam</span>
              <span className={publicStyles.infoValue}>
                {formatCurrency(reservation.totalPrice)}
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Kişi başı</span>
              <span className={publicStyles.infoValue}>
                {formatCurrency(reservation.perPersonPrice)}
              </span>
            </div>
            {reservation.note ? (
              <div className={publicStyles.infoRow}>
                <span className={publicStyles.infoLabel}>Notun</span>
                <span className={publicStyles.infoValue}>{reservation.note}</span>
              </div>
            ) : null}
            {detail.plan ? (
              <div className={publicStyles.infoRow}>
                <span className={publicStyles.infoLabel}>Plan</span>
                <Link href={`/hesap/plan/${detail.plan.id}`} className={publicStyles.infoValue}>
                  {detail.plan.name}
                </Link>
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      {/* --- İletişim ------------------------------------------------------ */}
      {detail.branch.phone ? (
        <section style={{ marginTop: 24 }}>
          <SectionHeader
            title="Mekânla iletişime geç"
            description="Sorularını doğrudan işletmeye sorabilirsin."
          />
          <div className={publicStyles.contactRow}>
            <a href={`tel:${detail.branch.phone}`} className={publicStyles.chip}>
              📞 {formatPhone(detail.branch.phone)}
            </a>
            {detail.branch.whatsapp ? (
              <a
                href={`https://wa.me/${toWhatsAppNumber(detail.branch.whatsapp)}`}
                className={publicStyles.chip}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* --- Zaman çizelgesi ----------------------------------------------- */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Durum geçmişi" />
        <Card>
          <Timeline
            items={reservationTimelineSteps(reservation.status).map((step) => {
              const event = detail.history.find((h) => h.toStatus === step.status);
              return {
                label: step.label,
                state: step.state,
                ...(event
                  ? { meta: formatRelativeTime(event.createdAt, ctx.nowMs) }
                  : {}),
              };
            })}
          />
        </Card>
      </section>

      {/* --- Alternatifler -------------------------------------------------- */}
      {alternatives.length > 0 ? (
        <section style={{ marginTop: 32 }}>
          <SectionHeader
            title="Alternatif paketler"
            description="Aynı plandaki diğer uygun seçenekler."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alternatives.map((match) => (
              <Card key={match.package.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>{match.package.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {match.business.name} · {match.district.name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700 }}>
                      {formatCurrency(match.pricing.perPersonPrice)}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>kişi başı</p>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <LinkButton
                    href={`/hesap/plan/${reservation.planId}/rezervasyon?paket=${match.package.id}`}
                    size="sm"
                  >
                    Bu paket için talep gönder
                  </LinkButton>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- İptal ---------------------------------------------------------- */}
      {isCreator && canUserCancel(reservation.status) ? (
        <section style={{ marginTop: 32 }}>
          <Card>
            <CancelReservationForm
              reservationId={reservation.id}
              cancellationTerms={detail.package.cancellationTerms}
            />
          </Card>
        </section>
      ) : null}
    </div>
  );
}
