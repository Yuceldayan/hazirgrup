import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getCurrentUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { PanelNav, type PanelNavItem } from '@/components/layout/PanelNav';
import styles from '@/components/layout/layout.module.css';

/** İşletme paneli — hiçbir zaman indekslenmez. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

const NAV: PanelNavItem[] = [
  { href: '/business', label: 'Genel bakış', icon: '📊' },
  { href: '/business/rezervasyonlar', label: 'Rezervasyonlar', icon: '📅', matchPrefix: true },
  { href: '/business/paketler', label: 'Paketler', icon: '📦', matchPrefix: true },
  { href: '/business/subeler', label: 'Şubeler', icon: '📍' },
  { href: '/business/isletme', label: 'İşletme bilgileri', icon: '🏪' },
  { href: '/business/calisanlar', label: 'Çalışanlar', icon: '👥' },
];

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const repo = await getRepository();
  const businesses = user ? await repo.getBusinessesForUser(user.id) : [];

  // Henüz işletmesi olmayan kullanıcı (başvuru akışı) panel çerçevesi görmez.
  if (businesses.length === 0) {
    return <div className="container">{children}</div>;
  }

  return (
    <div className="container">
      <div className={styles.panel}>
        <PanelNav items={NAV} />
        <div className={styles.panelBody}>{children}</div>
      </div>
    </div>
  );
}
