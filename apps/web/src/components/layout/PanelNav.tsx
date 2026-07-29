'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export interface PanelNavItem {
  href: string;
  label: string;
  icon: string;
  /** Alt yolları da aktif sayar. */
  matchPrefix?: boolean;
  badge?: number;
}

export function PanelNav({ items }: { items: PanelNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.panelNav} aria-label="Panel menüsü">
      {items.map((item) => {
        const isActive = item.matchPrefix
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.panelNavLink} ${isActive ? styles.panelNavLinkActive : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span
                style={{
                  marginLeft: 'auto',
                  background: 'var(--color-brand-default)',
                  color: 'var(--color-text-on-brand)',
                  borderRadius: 999,
                  fontSize: 11,
                  padding: '1px 7px',
                  fontWeight: 600,
                }}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
