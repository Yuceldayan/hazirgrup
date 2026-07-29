import Link from 'next/link';
import { ROUTES } from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import styles from './layout.module.css';

export async function SiteFooter() {
  const repo = await getRepository();
  const cities = await repo.listCities({ onlyActive: true });
  const categories = await repo.listCategories({ onlyActive: true });

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div>
            <p className={styles.logo} style={{ fontSize: 17 }}>
              <span className={styles.logoMark} aria-hidden="true">
                HG
              </span>
              HazırGrup
            </p>
            <p className={styles.footerTagline}>
              Grubunu oluştur, paketini seç, birlikte karar ver. Arkadaş gruplarının mekân
              kararını tek akışta toplayan şehir bazlı platform.
            </p>
          </div>

          <div>
            <p className={styles.footerTitle}>Keşfet</p>
            <ul className={styles.footerList}>
              <li>
                <Link href={ROUTES.howItWorks()}>Nasıl çalışır</Link>
              </li>
              <li>
                <Link href={ROUTES.cities()}>Şehirler</Link>
              </li>
              {cities.slice(0, 3).map((city) => (
                <li key={city.id}>
                  <Link href={ROUTES.city(city.slug)}>{city.name} paketleri</Link>
                </li>
              ))}
              <li>
                <Link href={ROUTES.guides()}>Rehber</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={styles.footerTitle}>Kategoriler</p>
            <ul className={styles.footerList}>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={ROUTES.category(category.slug)}>{category.name}</Link>
                </li>
              ))}
              <li>
                <Link href={ROUTES.categories()}>Tüm kategoriler</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={styles.footerTitle}>Destek ve yasal</p>
            <ul className={styles.footerList}>
              <li>
                <Link href={ROUTES.faq()}>Sık sorulan sorular</Link>
              </li>
              <li>
                <Link href="/business/basvuru">İşletmeni ekle</Link>
              </li>
              <li>
                <Link href={ROUTES.legal('kullanim-kosullari')}>Kullanım koşulları</Link>
              </li>
              <li>
                <Link href={ROUTES.legal('gizlilik-politikasi')}>Gizlilik politikası</Link>
              </li>
              <li>
                <Link href={ROUTES.legal('kvkk-aydinlatma-metni')}>KVKK aydınlatma metni</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} HazırGrup. Tüm hakları saklıdır.</p>
          <p>
            HazırGrup bir aracı platformdur; mekân işletmecisi değildir. Ödeme mekânda yapılır.
          </p>
        </div>
      </div>
    </footer>
  );
}
