import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildMetadata,
  formatCurrency,
  homeMetadataInput,
  ROUTES,
} from '@hazirgrup/core';
import { getRepository } from '@/server/repository';
import { metadataContext } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Card, LinkButton, SectionHeader } from '@/components/ui';
import { PackageCard } from '@/components/PackageCard';
import styles from './home.module.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const repo = await getRepository();
  const cities = await repo.listCities({ onlyActive: true });
  const content = homeMetadataInput(cities.map((c) => c.name));

  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: content.title,
      description: content.description,
      path: '/',
    }),
  );
}

const FLOW_STEPS = [
  {
    title: 'Planını oluştur',
    text: 'Tarih, kişi sayısı ve bütçeni gir. 7 kısa adım, her adımda taslak kaydı.',
  },
  {
    title: 'Arkadaşlarını davet et',
    text: 'Tek bağlantı yeter. Arkadaşların uygulama indirmeden katılır.',
  },
  {
    title: 'Uygun paketleri gör',
    text: 'Kişi sayınıza ve bütçenize uyan paketler gerekçeleriyle listelenir.',
  },
  {
    title: 'Birlikte oylayın',
    text: 'Herkes tek oy kullanır, oyunu değiştirebilir. Sonuç canlı görünür.',
  },
  {
    title: 'Rezervasyon talebi gönder',
    text: 'Kazanan paket için mekâna tek dokunuşla talep iletilir.',
  },
];

const FEATURES = [
  {
    icon: '💸',
    title: 'Kişi başı fiyat net',
    text: 'Toplam ve kişi başı tutar her zaman birlikte gösterilir. Kişi sayısı değişince fiyat anında güncellenir.',
  },
  {
    icon: '🔗',
    title: 'Tek bağlantıyla davet',
    text: 'Arkadaşların hesap açmadan, tarayıcıdan katılır ve oy verir.',
  },
  {
    icon: '🗳️',
    title: 'Karar oylamayla',
    text: 'Uzun tartışma yerine 2–3 paketi oylayın. Eşitlikte son kararı planı kuran verir.',
  },
  {
    icon: '📅',
    title: 'Rezervasyon takibi',
    text: 'Talebin hangi aşamada olduğunu zaman çizelgesinde görürsün.',
  },
];

export default async function HomePage() {
  const repo = await getRepository();

  const [cities, categories, featuredPackages] = await Promise.all([
    repo.listCities({ onlyActive: true }),
    repo.listCategories({ onlyActive: true }),
    repo.listPublicPackages({ limit: 6 }),
  ]);

  const allPackages = await repo.listPublicPackages({});
  const businesses = await repo.listPublicBusinesses({});

  const perPersonPrices = allPackages.map((p) => p.perPersonFrom);
  const cheapest = perPersonPrices.length > 0 ? Math.min(...perPersonPrices) : null;
  const priciest = perPersonPrices.length > 0 ? Math.max(...perPersonPrices) : null;

  return (
    <div className="container">
      {/* --- Hero ------------------------------------------------------- */}
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">📍</span>
            {cities.length > 0
              ? `${cities.map((c) => c.name).join(', ')} — ${allPackages.length} paket`
              : 'Yeni şehirler yolda'}
          </p>

          <h1 className={styles.heroTitle}>
            Grubunu oluştur, paketini seç,
            <br />
            birlikte karar ver.
          </h1>

          <p className={styles.heroLead}>
            &ldquo;Kim geliyor? Nereye gidiyoruz? Kişi başı ne kadar?&rdquo; — HazırGrup bu
            konuşmayı tek akışa indirir. Kişi sayınıza, bütçenize ve saatinize uyan mekân
            paketlerini bulur, arkadaşlarınızın oylamasına açar ve rezervasyon talebini iletir.
          </p>

          <div className={styles.heroActions}>
            <LinkButton href='/hesap/plan/yeni' size="lg">
              Yeni plan oluştur
            </LinkButton>
            <LinkButton href={ROUTES.howItWorks()} size="lg" variant="secondary">
              Nasıl çalışır?
            </LinkButton>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{businesses.length}</span>
              <span className={styles.heroStatLabel}>doğrulanmış mekân</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{allPackages.length}</span>
              <span className={styles.heroStatLabel}>hazır grup paketi</span>
            </div>
            {cheapest !== null ? (
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{formatCurrency(cheapest)}</span>
                <span className={styles.heroStatLabel}>kişi başı başlangıç</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.flowCard}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Nasıl işliyor?</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Plandan rezervasyona 5 adım.
          </p>
          {FLOW_STEPS.map((step, index) => (
            <div key={step.title} className={styles.flowStep}>
              <span className={styles.flowNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className={styles.flowTitle}>{step.title}</p>
                <p className={styles.flowText}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Problem / çözüm --------------------------------------------- */}
      <section className={styles.section}>
        <SectionHeader
          title="Dışarı çıkmadan önceki o uzun konuşma"
          description="Aynı sorular her seferinde tekrar ediliyor. HazırGrup bunları sırayla ve tek yerde soruyor."
        />
        <div className={styles.compare}>
          <Card>
            <p style={{ fontWeight: 600 }}>Şu anki hâli</p>
            <ul className={styles.compareList}>
              {[
                'Kim geliyor, kim gelmiyor belli değil',
                'Herkes farklı mekân öneriyor',
                'Kişi başı ne kadar tutacağı bilinmiyor',
                'Karar bir türlü netleşmiyor',
                'Rezervasyonu kimse üstlenmiyor',
              ].map((item) => (
                <li key={item} className={styles.compareItem}>
                  <span aria-hidden="true">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card raised>
            <p style={{ fontWeight: 600 }}>HazırGrup ile</p>
            <ul className={styles.compareList}>
              {[
                'Katılım durumu tek ekranda görünür',
                'Uygun paketler otomatik eşleşir',
                'Kişi başı tutar canlı hesaplanır',
                'Oylama sonucu herkese açıktır',
                'Rezervasyon talebi tek dokunuşla gider',
              ].map((item) => (
                <li key={item} className={styles.compareItem}>
                  <span aria-hidden="true" style={{ color: 'var(--color-success-text)' }}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* --- Özellikler ---------------------------------------------------- */}
      <section className={styles.section}>
        <SectionHeader title="Neden HazırGrup?" />
        <div className={styles.grid4}>
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <p className={styles.featureIcon} aria-hidden="true">
                {feature.icon}
              </p>
              <p className={styles.featureTitle}>{feature.title}</p>
              <p className={styles.featureText}>{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* --- Kategoriler --------------------------------------------------- */}
      {categories.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader
            title="Ne yapmak istiyorsunuz?"
            description="Bir planda birden fazla kategori seçip seçenekleri yan yana karşılaştırabilirsin."
            action={
              <LinkButton href={ROUTES.categories()} variant="ghost" size="sm">
                Tüm kategoriler →
              </LinkButton>
            }
          />
          <div className={styles.grid3}>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={ROUTES.category(category.slug)}
                style={{ textDecoration: 'none' }}
              >
                <Card>
                  <p className={styles.featureTitle}>{category.name}</p>
                  <p className={styles.featureText}>{category.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Öne çıkan paketler -------------------------------------------- */}
      {featuredPackages.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader
            title="Uygun fiyatlı grup paketleri"
            {...(cheapest !== null && priciest !== null
              ? {
                  description: `Kişi başı ${formatCurrency(cheapest)} ile ${formatCurrency(priciest)} arasında.`,
                }
              : {})}
          />
          <div className={styles.grid3}>
            {featuredPackages.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} priority={index < 3} />
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Şehirler ------------------------------------------------------- */}
      {cities.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader
            title="Aktif şehirler"
            description="Şehrin listede yoksa yakında ekleyebiliriz."
            action={
              <LinkButton href={ROUTES.cities()} variant="ghost" size="sm">
                Tüm şehirler →
              </LinkButton>
            }
          />
          <div className={styles.grid3}>
            {cities.map((city) => (
              <Link key={city.id} href={ROUTES.city(city.slug)} style={{ textDecoration: 'none' }}>
                <Card>
                  <p className={styles.featureTitle}>{city.name}</p>
                  <p className={styles.featureText}>
                    {allPackages.filter((p) => p.branch.city.slug === city.slug).length} paket ·{' '}
                    {businesses.filter((b) => b.branches.some((br) => br.city.slug === city.slug)).length}{' '}
                    mekân
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- CTA ------------------------------------------------------------ */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Bu hafta sonu için planı sen kur</h2>
        <p className={styles.ctaText}>
          Bir dakikada plan oluştur, bağlantıyı gruba at. Gerisini HazırGrup halleder.
        </p>
        <div className={styles.ctaActions}>
          <LinkButton href='/hesap/plan/yeni' size="lg">
            Yeni plan oluştur
          </LinkButton>
          <LinkButton href="/business/basvuru" size="lg" variant="secondary">
            İşletmeni ekle
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
