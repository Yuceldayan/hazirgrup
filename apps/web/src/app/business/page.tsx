import type { Metadata } from 'next';
import Link from 'next/link';
import {
  formatCurrency,
  formatDate,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  ROUTES,
} from '@hazirgrup/core';
import { getCurrentUser, requireBusinessMember } from '@/server/auth';
import { getRepository, todayDate } from '@/server/repository';
import { Badge, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'İşletme paneli | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function BusinessOverviewPage() {
  const user = await getCurrentUser();
  const repo = await getRepository();

  // İşletmesi olmayan kullanıcıya başvuru çağrısı gösterilir.
  const businesses = user ? await repo.getBusinessesForUser(user.id) : [];
  if (businesses.length === 0) {
    return (
      <div style={{ maxWidth: 640, paddingBlock: 24 }}>
        <EmptyState
          icon="🏪"
          title="İşletmeni HazırGrup'a ekle"
          description="Hazır grup paketlerini yayınla, rezervasyon taleplerini tek panelden yönet. Başvurun yönetici incelemesinden sonra yayına alınır."
          action={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <LinkButton href="/business/basvuru">İşletme başvurusu yap</LinkButton>
              <LinkButton href={ROUTES.howItWorks()} variant="secondary">
                Nasıl çalışır?
              </LinkButton>
            </div>
          }
        />
      </div>
    );
  }

  const { businessId } = await requireBusinessMember();
  const today = todayDate();

  const [business, stats, reservations, packages, branches] = await Promise.all([
    repo.getBusiness(businessId),
    repo.getBusinessDashboard(businessId, today),
    repo.listReservationsForBusiness(businessId, 'pending_business'),
    repo.listPackages({ businessId }),
    repo.listBranches(businessId),
  ]);

  const upcoming = (await repo.listReservationsForBusiness(businessId, 'confirmed'))
    .filter((row) => row.reservation.reservedDate >= today)
    .slice(0, 3);

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>{business?.name ?? 'İşletme paneli'}</h1>
        <p className={styles.panelSubtitle}>
          {business?.status === 'verified'
            ? 'İşletmen doğrulandı ve public sayfalarda görünüyor.'
            : 'İşletmen henüz doğrulanmadı; paketlerin public sayfalarda görünmez.'}
        </p>
      </header>

      {/* --- İstatistikler ------------------------------------------------ */}
      <div className={publicStyles.grid}>
        {[
          { label: 'Bekleyen talep', value: stats.pendingReservations, icon: '⏳' },
          { label: 'Onaylanan rezervasyon', value: stats.confirmedReservations, icon: '✅' },
          { label: 'Yaklaşan rezervasyon', value: stats.upcomingReservations, icon: '📅' },
          { label: 'Aktif paket', value: `${stats.activePackages}/${stats.totalPackages}`, icon: '📦' },
          { label: 'Bu ay misafir', value: stats.totalGuestsThisMonth, icon: '👥' },
          {
            label: 'Ort. yanıt süresi',
            value:
              stats.averageResponseHours !== null
                ? `${stats.averageResponseHours} saat`
                : '—',
            icon: '⚡',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <p style={{ fontSize: 20 }} aria-hidden="true">
              {stat.icon}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* --- Bekleyen talepler --------------------------------------------- */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="Yanıt bekleyen talepler"
          description="Hızlı yanıt vermek rezervasyon oranını artırır."
          action={
            <LinkButton href="/business/rezervasyonlar" variant="ghost" size="sm">
              Tümü →
            </LinkButton>
          }
        />

        {reservations.length === 0 ? (
          <EmptyState
            icon="✅"
            title="Bekleyen talep yok"
            description="Yeni bir rezervasyon talebi geldiğinde burada görünecek ve bildirim alacaksın."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reservations.slice(0, 3).map((row) => (
              <Card key={row.reservation.id}>
                <Badge
                  tone={RESERVATION_STATUS_TONES[row.reservation.status]}
                  icon={RESERVATION_STATUS_ICONS[row.reservation.status]}
                >
                  {RESERVATION_STATUS_LABELS[row.reservation.status]}
                </Badge>
                <p style={{ fontWeight: 600, marginTop: 8 }}>{row.packageName}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {formatDate(row.reservation.reservedDate)} · {row.reservation.peopleCount} kişi ·{' '}
                  {formatCurrency(row.reservation.totalPrice)}
                </p>
                <div style={{ marginTop: 12 }}>
                  <LinkButton href="/business/rezervasyonlar" size="sm">
                    Talebi yanıtla
                  </LinkButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* --- Yaklaşan ------------------------------------------------------- */}
      {upcoming.length > 0 ? (
        <section style={{ marginTop: 32 }}>
          <SectionHeader title="Yaklaşan rezervasyonlar" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map((row) => (
              <Card key={row.reservation.id} flat>
                <p style={{ fontWeight: 600, fontSize: 14 }}>
                  {formatDate(row.reservation.reservedDate)} · {row.packageName}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {row.reservation.peopleCount} kişi · {row.branchName} · Kod:{' '}
                  <code>{row.reservation.code}</code>
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Kurulum durumu -------------------------------------------------- */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Kurulum durumu" />
        <Card>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                done: Boolean(business?.description && business.description.length > 20),
                label: 'İşletme açıklaması eklendi',
                href: '/business/isletme',
              },
              { done: branches.length > 0, label: 'En az bir şube tanımlandı', href: '/business/subeler' },
              { done: packages.length > 0, label: 'En az bir paket oluşturuldu', href: '/business/paketler' },
              {
                done: packages.some((p) => p.isActive && p.isPublic),
                label: 'En az bir paket yayında',
                href: '/business/paketler',
              },
              {
                done: business?.status === 'verified',
                label: 'İşletme doğrulandı',
                href: '/business/isletme',
              },
            ].map((item) => (
              <li
                key={item.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}
              >
                <span aria-hidden="true">{item.done ? '✅' : '⬜'}</span>
                <Link href={item.href} style={{ color: 'var(--color-text-primary)' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {business?.status === 'verified' && business.isPublic ? (
        <section style={{ marginTop: 24 }}>
          <Card flat>
            <p style={{ fontSize: 13 }}>
              Public sayfan:{' '}
              <Link href={ROUTES.business(business.slug)}>
                hazirgrup.app{ROUTES.business(business.slug)}
              </Link>
            </p>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
