import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildPlanSummary,
  formatDate,
  formatRelativeDay,
  groupPlansByTab,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
} from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository, getServiceContext, todayDate } from '@/server/repository';
import { Badge, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { PlanCard } from '@/components/PlanCard';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Hesabım | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function AccountHomePage() {
  const user = await requireUser('/hesap');
  const ctx = await getServiceContext();
  const repo = await getRepository();
  const today = todayDate();

  const plans = await repo.listPlansForUser(user.id);
  const summaries = await Promise.all(plans.map((plan) => buildPlanSummary(ctx, plan, user.id)));
  const grouped = groupPlansByTab(summaries, today);

  // Cevaplanmayı bekleyen davetler
  const pendingInvites = summaries.filter((summary) => {
    if (summary.plan.ownerId === user.id) return false;
    return summary.plan.status !== 'cancelled' && summary.plan.status !== 'completed';
  });

  const reservations = await repo.listReservationsForUser(user.id);
  const upcoming = reservations
    .filter((r) => r.status === 'confirmed' && r.reservedDate >= today)
    .sort((a, b) => a.reservedDate.localeCompare(b.reservedDate));

  const notifications = await repo.listNotifications(user.id);
  const unread = notifications.filter((n) => !n.readAt).slice(0, 3);

  const activePlan = grouped.active[0] ?? grouped.upcoming[0] ?? null;

  const categories = await repo.listCategories({ onlyActive: true });

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Merhaba {user.displayName.split(' ')[0]} 👋</h1>
        <p className={styles.panelSubtitle}>
          Buradan planlarını yönetebilir, arkadaşlarını davet edebilir ve rezervasyonlarını
          takip edebilirsin.
        </p>
      </header>

      {/* --- Ana işlem ---------------------------------------------------- */}
      <Card raised>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>Yeni bir buluşma mı planlıyorsun?</p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 2 }}>
              Bir dakikada plan oluştur, bağlantıyı gruba at.
            </p>
          </div>
          <LinkButton href="/hesap/plan/yeni" size="lg">
            Yeni plan oluştur
          </LinkButton>
        </div>
      </Card>

      {/* --- Devam eden plan ---------------------------------------------- */}
      {activePlan ? (
        <section style={{ marginTop: 32 }}>
          <SectionHeader
            title="Devam eden planın"
            action={
              <LinkButton href="/hesap/planlar" variant="ghost" size="sm">
                Tüm planlar →
              </LinkButton>
            }
          />
          <PlanCard summary={activePlan} viewerId={user.id} />
        </section>
      ) : null}

      {/* --- Davetler ------------------------------------------------------ */}
      {pendingInvites.length > 0 ? (
        <section style={{ marginTop: 32 }}>
          <SectionHeader
            title="Seni bekleyen davetler"
            description="Arkadaşlarının oluşturduğu ve katıldığın planlar."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingInvites.slice(0, 3).map((summary) => (
              <PlanCard key={summary.plan.id} summary={summary} viewerId={user.id} />
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Yaklaşan rezervasyon ------------------------------------------ */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="Yaklaşan rezervasyon"
          action={
            <LinkButton href="/hesap/rezervasyonlar" variant="ghost" size="sm">
              Tümü →
            </LinkButton>
          }
        />
        {upcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Yaklaşan rezervasyonun yok"
            description="Oylaması biten planından rezervasyon oluşturabilirsin."
            action={
              <LinkButton href="/hesap/planlar" variant="secondary">
                Planlarıma git
              </LinkButton>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.slice(0, 2).map((reservation) => (
              <Card key={reservation.id}>
                <Badge
                  tone={RESERVATION_STATUS_TONES[reservation.status]}
                  icon={RESERVATION_STATUS_ICONS[reservation.status]}
                >
                  {RESERVATION_STATUS_LABELS[reservation.status]}
                </Badge>
                <p style={{ fontWeight: 600, marginTop: 8 }}>
                  <Link href={`/hesap/rezervasyonlar/${reservation.id}`}>
                    {formatDate(reservation.reservedDate)} ·{' '}
                    {formatRelativeDay(reservation.reservedDate, today)}
                  </Link>
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {reservation.peopleCount} kişi · Kod: <code>{reservation.code}</code>
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* --- Bildirimler ---------------------------------------------------- */}
      {unread.length > 0 ? (
        <section style={{ marginTop: 32 }}>
          <SectionHeader
            title="Okunmamış bildirimler"
            action={
              <LinkButton href="/hesap/bildirimler" variant="ghost" size="sm">
                Tümü →
              </LinkButton>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unread.map((notification) => (
              <Card key={notification.id} flat>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{notification.title}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {notification.body}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Hızlı başlangıç -------------------------------------------------- */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Hızlı başlangıç" description="Ne yapmak istediğini seç." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/hesap/plan/yeni?kategori=${category.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                minHeight: 44,
                borderRadius: 999,
                border: '1px solid var(--color-border-strong)',
                fontSize: 14,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
              }}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {/* --- Yardım ----------------------------------------------------------- */}
      <section style={{ marginTop: 32 }}>
        <Card flat>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>HazırGrup nasıl çalışır?</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Plandan rezervasyona kadar tüm adımları adım adım anlattık.
          </p>
          <LinkButton href="/nasil-calisir" size="sm" variant="secondary">
            Yardıma göz at
          </LinkButton>
        </Card>
      </section>
    </div>
  );
}
