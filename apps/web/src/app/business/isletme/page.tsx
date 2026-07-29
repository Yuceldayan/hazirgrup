import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@hazirgrup/core';
import { requireBusinessMember } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Alert, Badge, Card, SectionHeader } from '@/components/ui';
import { BusinessInfoForm } from './BusinessInfoForm';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'İşletme bilgileri | İşletme paneli',
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  verified: { label: 'Doğrulandı', tone: 'success' },
  pending_review: { label: 'İnceleniyor', tone: 'warning' },
  draft: { label: 'Taslak', tone: 'warning' },
  rejected: { label: 'Reddedildi', tone: 'danger' },
  suspended: { label: 'Askıya alındı', tone: 'danger' },
};

export default async function BusinessInfoPage() {
  const { businessId } = await requireBusinessMember();
  const repo = await getRepository();

  const business = await repo.getBusiness(businessId);
  if (!business) return null;

  const status = STATUS_LABELS[business.status] ?? { label: business.status, tone: 'warning' as const };

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>İşletme bilgileri</h1>
        <p className={styles.panelSubtitle}>
          Bu bilgiler public mekân sayfanda ve arama sonuçlarında görünür.
        </p>
      </header>

      <div style={{ marginBottom: 20 }}>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      {business.status === 'verified' && business.isPublic ? (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="success" title="Public sayfan yayında">
            <Link href={ROUTES.business(business.slug)}>
              hazirgrup.app{ROUTES.business(business.slug)}
            </Link>
          </Alert>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="warning" title="Public sayfan henüz yayında değil">
            İşletmen doğrulandığında paketlerin public sayfalarda ve arama motorlarında
            görünmeye başlar.
          </Alert>
        </div>
      )}

      <Card>
        <BusinessInfoForm
          defaultValues={{
            name: business.name,
            description: business.description,
            phone: business.phone ?? '',
            whatsapp: business.whatsapp ?? '',
            website: business.website ?? '',
            instagram: business.instagram ?? '',
          }}
        />
      </Card>

      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="SEO bilgileri"
          description="Boş bırakırsan otomatik ve kaliteli metadata üretilir."
        />
        <Card flat>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            SEO başlığı, meta açıklaması ve adres (slug) yalnızca yönetici tarafından
            değiştirilebilir. İşletme adını veya açıklamasını güncellediğinde metadata otomatik
            olarak yenilenir.
          </p>
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Mevcut adres: <code>{ROUTES.business(business.slug)}</code>
          </p>
        </Card>
      </section>
    </div>
  );
}
