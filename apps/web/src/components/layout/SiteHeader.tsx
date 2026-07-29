import Link from 'next/link';
import { ROUTES } from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { LinkButton } from '@/components/ui';
import { MobileMenu, type NavItem } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import styles from './layout.module.css';

/**
 * Site başlığı.
 *
 * ÖNEMLİ: Bu bileşen oturum bilgisini OKUMAZ. `cookies()` çağrısı kök layout'u
 * dinamik hâle getirir ve public sayfaların statik/ISR üretimini engellerdi
 * (docs/DECISIONS.md D-020). Bunun yerine "Hesabım" bağlantısı her zaman
 * gösterilir; oturum yoksa `/hesap` kullanıcıyı giriş ekranına yönlendirir.
 */

const PUBLIC_NAV: NavItem[] = [
  { href: ROUTES.howItWorks(), label: 'Nasıl çalışır' },
  { href: ROUTES.cities(), label: 'Şehirler' },
  { href: ROUTES.categories(), label: 'Kategoriler' },
  { href: ROUTES.guides(), label: 'Rehber' },
  { href: ROUTES.faq(), label: 'SSS' },
];

const MOBILE_NAV: NavItem[] = [
  ...PUBLIC_NAV,
  { href: '/hesap', label: 'Hesabım' },
  { href: '/hesap/plan/yeni', label: 'Yeni plan oluştur' },
  { href: '/business', label: 'İşletme paneli' },
];

export async function SiteHeader() {
  const repo = await getRepository();

  return (
    <>
      {repo.mode === 'demo' ? (
        <div className={styles.demoBanner} role="status">
          <div className="container">
            <strong>Demo modu</strong> — Supabase yapılandırılmadığı için kurgusal örnek
            verilerle çalışıyorsunuz. Tüm akışlar eksiksiz çalışır.{' '}
            <Link href="/yardim/plan-nasil-olusturulur">Nasıl çalışır?</Link>
          </div>
        </div>
      ) : null}

      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark} aria-hidden="true">
              HG
            </span>
            HazırGrup
          </Link>

          <nav className={styles.nav} aria-label="Ana menü">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <ThemeToggle />
            <LinkButton href="/hesap" size="sm" variant="secondary">
              Hesabım
            </LinkButton>
            {/*
              Sarmalayıcı span kullanılıyor: `.desktopOnly` sınıfı doğrudan butona
              verilseydi `.button { display: inline-flex }` ile aynı özgüllükte
              çakışır ve dosya sırasına göre kazanan değişirdi.
            */}
            <span className={styles.desktopOnly}>
              <LinkButton href="/hesap/plan/yeni" size="sm">
                Yeni plan oluştur
              </LinkButton>
            </span>
            <MobileMenu items={MOBILE_NAV} />
          </div>
        </div>
      </header>
    </>
  );
}
