import type { Metadata } from 'next';
import type { District } from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Alert, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { ApplicationForm } from './ApplicationForm';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'İşletme başvurusu | HazırGrup',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function BusinessApplicationPage() {
  const user = await requireUser('/business/basvuru');
  const repo = await getRepository();

  const [cities, categories, applications, businesses] = await Promise.all([
    repo.listCities({ onlyActive: true }),
    repo.listCategories({ onlyActive: true }),
    repo.listApplications(),
    repo.getBusinessesForUser(user.id),
  ]);

  const myApplication = applications.find((a) => a.applicantId === user.id);

  if (businesses.length > 0) {
    return (
      <div style={{ maxWidth: 640, paddingBlock: 24 }}>
        <EmptyState
          icon="✅"
          title="İşletmen zaten kayıtlı"
          description="Paketlerini ve rezervasyonlarını işletme panelinden yönetebilirsin."
          action={<LinkButton href="/business">İşletme paneline git</LinkButton>}
        />
      </div>
    );
  }

  if (myApplication && myApplication.status === 'pending') {
    return (
      <div style={{ maxWidth: 640, paddingBlock: 24 }}>
        <Alert tone="info" title="Başvurun inceleniyor">
          <strong>{myApplication.businessName}</strong> için başvurun alındı. Yönetici
          incelemesinden sonra sana bilgi vereceğiz.
        </Alert>
        <div style={{ marginTop: 16 }}>
          <LinkButton href="/hesap" variant="secondary">
            Hesabıma dön
          </LinkButton>
        </div>
      </div>
    );
  }

  if (myApplication && myApplication.status === 'rejected') {
    return (
      <div style={{ maxWidth: 640, paddingBlock: 24 }}>
        <Alert tone="error" title="Başvurun kabul edilmedi">
          {myApplication.reviewNote ?? 'Başvurun bu haliyle onaylanamadı.'}
        </Alert>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Bilgileri güncelleyerek yeniden başvurabilirsin.
        </p>
      </div>
    );
  }

  const districtsByCity: Record<string, District[]> = {};
  for (const city of cities) {
    districtsByCity[city.id] = await repo.listDistricts(city.id, { onlyActive: true });
  }

  return (
    <div style={{ maxWidth: 640, paddingBlock: 8 }}>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>İşletmeni HazırGrup&apos;a ekle</h1>
        <p className={styles.panelSubtitle}>
          Hazır grup paketlerini yayınla, rezervasyon taleplerini tek panelden yönet. Kayıt
          ücretsizdir.
        </p>
      </header>

      <section style={{ marginBottom: 24 }}>
        <SectionHeader title="Neler kazanırsın?" />
        <Card flat>
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 14,
              color: 'var(--color-text-secondary)',
            }}
          >
            <li>✓ Doğrulanmış mekân sayfası ve arama motorlarında görünürlük</li>
            <li>✓ Grup paketlerini kişi sayısı, saat ve bütçeye göre eşleştirme</li>
            <li>✓ Rezervasyon taleplerini tek panelden onaylama/reddetme</li>
            <li>✓ Kişi sayısı ve tutar netleşmiş talepler</li>
            <li>✓ Komisyon veya abonelik ücreti yok (Faz 1)</li>
          </ul>
        </Card>
      </section>

      <ApplicationForm
        cities={cities}
        districtsByCity={districtsByCity}
        categories={categories}
        defaultEmail={user.email}
        defaultName={user.displayName}
      />
    </div>
  );
}
