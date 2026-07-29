import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { PanelNav, type PanelNavItem } from '@/components/layout/PanelNav';
import { signOutAction } from '@/server/actions/auth';
import { Button } from '@/components/ui';
import styles from '@/components/layout/layout.module.css';

/** Hesap alanı — hiçbir zaman indekslenmez. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser('/hesap');
  const repo = await getRepository();

  const notifications = await repo.listNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const items: PanelNavItem[] = [
    { href: '/hesap', label: 'Genel bakış', icon: '🏠' },
    { href: '/hesap/planlar', label: 'Planlarım', icon: '📋', matchPrefix: true },
    { href: '/hesap/plan/yeni', label: 'Yeni plan', icon: '➕' },
    { href: '/hesap/rezervasyonlar', label: 'Rezervasyonlar', icon: '📅', matchPrefix: true },
    { href: '/hesap/bildirimler', label: 'Bildirimler', icon: '🔔', badge: unreadCount },
    { href: '/hesap/favoriler', label: 'Favoriler', icon: '⭐' },
    { href: '/hesap/ayarlar', label: 'Ayarlar', icon: '⚙️' },
  ];

  return (
    <div className="container">
      <div className={styles.panel}>
        <div>
          <PanelNav items={items} />
          <form action={signOutAction} style={{ marginTop: 16 }}>
            <Button type="submit" variant="ghost" size="sm" fullWidth>
              Çıkış yap
            </Button>
          </form>
        </div>
        <div className={styles.panelBody}>{children}</div>
      </div>
    </div>
  );
}
