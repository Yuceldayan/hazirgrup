import type { Metadata } from 'next';
import { formatRelativeTime } from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { markAllNotificationsReadAction } from '@/server/actions/account';
import { Button, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Bildirimler | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const user = await requireUser('/hesap/bildirimler');
  const repo = await getRepository();
  const notifications = await repo.listNotifications(user.id);
  const now = Date.now();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Bildirimler</h1>
        <p className={styles.panelSubtitle}>
          Planlarındaki ve rezervasyonlarındaki tüm hareketler burada toplanır.
        </p>
      </header>

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Henüz bildirimin yok"
          description="Yeni bir hareket olduğunda burada göreceksin."
          action={<LinkButton href="/hesap">Ana sayfaya dön</LinkButton>}
        />
      ) : (
        <>
          {unreadCount > 0 ? (
            <SectionHeader
              title={`${unreadCount} okunmamış bildirim`}
              action={
                <form action={markAllNotificationsReadAction}>
                  <Button type="submit" variant="secondary" size="sm">
                    Tümünü okundu işaretle
                  </Button>
                </form>
              }
            />
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                flat={Boolean(notification.readAt)}
                style={
                  notification.readAt
                    ? undefined
                    : { borderLeft: '3px solid var(--color-brand-default)' }
                }
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: 14 }}>
                    {notification.readAt ? '' : '● '}
                    {notification.title}
                  </p>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {formatRelativeTime(notification.createdAt, now)}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {notification.body}
                </p>
                {notification.data.planId ? (
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    <LinkButton
                      href={`/hesap/plan/${notification.data.planId}`}
                      size="sm"
                      variant="ghost"
                    >
                      Planı aç →
                    </LinkButton>
                  </p>
                ) : notification.data.reservationId ? (
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    <LinkButton
                      href={`/hesap/rezervasyonlar/${notification.data.reservationId}`}
                      size="sm"
                      variant="ghost"
                    >
                      Rezervasyonu aç →
                    </LinkButton>
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      )}

      <section style={{ marginTop: 32 }}>
        <Card flat>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Push bildirimleri</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Mobil uygulamada push bildirimleri, cihaz izni verildiğinde etkinleşir. Uygulama içi
            bildirim merkezi her koşulda çalışır.
          </p>
        </Card>
      </section>
    </div>
  );
}
