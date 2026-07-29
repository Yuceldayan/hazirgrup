import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { PanelNav, type PanelNavItem } from '@/components/layout/PanelNav';
import styles from '@/components/layout/layout.module.css';

/** Yönetici paneli — hiçbir zaman indekslenmez. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin('/admin');
  const repo = await getRepository();
  const pending = await repo.listApplications('pending');

  const nav: PanelNavItem[] = [
    { href: '/admin', label: 'Sistem özeti', icon: '📊' },
    {
      href: '/admin/basvurular',
      label: 'Başvurular',
      icon: '📥',
      badge: pending.length,
    },
    { href: '/admin/isletmeler', label: 'İşletmeler', icon: '🏪' },
    { href: '/admin/paketler', label: 'Paketler', icon: '📦' },
    { href: '/admin/sehirler', label: 'Şehirler', icon: '🏙️' },
    { href: '/admin/ilceler', label: 'İlçeler', icon: '📍' },
    { href: '/admin/kategoriler', label: 'Kategoriler', icon: '🏷️' },
    { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: '👤' },
    { href: '/admin/audit', label: 'Audit log', icon: '🧾' },
  ];

  return (
    <div className="container">
      <div className={styles.panel}>
        <PanelNav items={nav} />
        <div className={styles.panelBody}>{children}</div>
      </div>
    </div>
  );
}
