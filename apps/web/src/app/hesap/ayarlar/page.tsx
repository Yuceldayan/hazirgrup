import type { Metadata } from 'next';
import Link from 'next/link';
import type { District } from '@hazirgrup/core';
import { NOTIFICATION_TYPES, ROUTES } from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Card, SectionHeader } from '@/components/ui';
import { DeleteAccountForm, ProfileForm } from './SettingsForms';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Ayarlar | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await requireUser('/hesap/ayarlar');
  const repo = await getRepository();

  const [profile, cities] = await Promise.all([
    repo.getProfile(user.id),
    repo.listCities({ onlyActive: true }),
  ]);

  const districtsByCity: Record<string, District[]> = {};
  for (const city of cities) {
    districtsByCity[city.id] = await repo.listDistricts(city.id, { onlyActive: true });
  }

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Ayarlar</h1>
        <p className={styles.panelSubtitle}>
          Profil bilgilerini, tercihlerini ve hesap ayarlarını buradan yönetebilirsin.
        </p>
      </header>

      <section>
        <SectionHeader title="Profil bilgileri" />
        <Card>
          <ProfileForm
            cities={cities}
            districtsByCity={districtsByCity}
            defaultValues={{
              displayName: profile?.displayName ?? user.displayName,
              phone: profile?.phone ?? '',
              cityId: profile?.cityId ?? '',
              districtId: profile?.districtId ?? '',
            }}
          />
        </Card>
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="Tema"
          description="Tema tercihini sayfanın üst kısmındaki düğmeden değiştirebilirsin."
        />
        <Card flat>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Sistem · Açık · Koyu seçenekleri arasında geçiş yapabilirsin. Tercihin bu tarayıcıda
            saklanır.
          </p>
        </Card>
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="Bildirim tercihleri"
          description="Uygulama içi bildirimler her zaman açıktır."
        />
        <Card flat>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Şu bildirim türleri destekleniyor:
          </p>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            {NOTIFICATION_TYPES.slice(0, 10).map((type) => (
              <li
                key={type}
                style={{
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'var(--color-bg-subtle)',
                }}
              >
                {type}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 10 }}>
            Push bildirimleri mobil uygulamada cihaz izniyle etkinleşir. Kanal bazlı tercihler
            mobil uygulamadan yönetilir.
          </p>
        </Card>
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Gizlilik ve yasal" />
        <Card flat>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <li>
              <Link href={ROUTES.legal('gizlilik-politikasi')}>Gizlilik politikası</Link>
            </li>
            <li>
              <Link href={ROUTES.legal('kvkk-aydinlatma-metni')}>KVKK aydınlatma metni</Link>
            </li>
            <li>
              <Link href={ROUTES.legal('kullanim-kosullari')}>Kullanım koşulları</Link>
            </li>
            <li>
              <Link href={ROUTES.help('hesabimi-nasil-silerim')}>
                Hesabımı nasıl silerim?
              </Link>
            </li>
          </ul>
        </Card>
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader title="Tehlikeli bölge" />
        <DeleteAccountForm />
      </section>
    </div>
  );
}
