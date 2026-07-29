'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './layout.module.css';

export interface NavItem {
  href: string;
  label: string;
}

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobil-menu"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      {open ? (
        <nav id="mobil-menu" className={styles.mobileMenu} aria-label="Mobil menü">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
