import type { Metadata } from 'next';
import { decideIndexability, ROUTES } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, LinkButton, SectionHeader } from '@/components/ui';
import { CityForm } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Şehirler | Yönetici',
  robots: { index: false, follow: false },
};

export default async function AdminCitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ duzenle?: string }>;
}) {
  await requireAdmin('/admin/sehirler');
  const { duzenle } = await searchParams;

  const repo = await getRepository();
  const cities = await repo.listCities();

  const rows = await Promise.all(
    cities.map(async (city) => {
      const summary = await repo.getPublicCitySummary(city.slug);
      const districts = await repo.listDistricts(city.id);
      const decision = decideIndexability({
        isIndexable: city.isIndexable,
        isActive: city.isActive,
        isPublic: city.isPublic,
        packageCount: summary?.packageCount ?? 0,
        businessCount: summary?.businessCount ?? 0,
      });
      return { city, summary, districts, decision };
    }),
  );

  const editing = duzenle ? (cities.find((c) => c.id === duzenle) ?? null) : null;

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Şehirler</h1>
        <p className={styles.panelSubtitle}>
          Yeni şehri buradan ekleyip aktif edebilirsin — kod değişikliği gerekmez.
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          title={`Şehirler (${cities.length})`}
          action={
            editing ? (
              <LinkButton href="/admin/sehirler" variant="ghost" size="sm">
                Düzenlemeyi bırak
              </LinkButton>
            ) : undefined
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(({ city, summary, districts, decision }) => (
            <Card key={city.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge tone={city.isActive ? 'success' : 'neutral'} icon={city.isActive ? '✓' : '⏸'}>
                      {city.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <Badge tone={city.isPublic ? 'brand' : 'neutral'}>
                      {city.isPublic ? 'Public' : 'Gizli'}
                    </Badge>
                    <Badge tone={decision.shouldIndex ? 'success' : 'warning'}>
                      {decision.shouldIndex ? 'İndeksleniyor' : 'noindex'}
                    </Badge>
                  </div>

                  <p style={{ fontWeight: 600, marginTop: 8 }}>{city.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <code>{ROUTES.city(city.slug)}</code> · {districts.length} ilçe ·{' '}
                    {summary?.packageCount ?? 0} paket · {summary?.businessCount ?? 0} mekân
                  </p>

                  {!decision.shouldIndex ? (
                    <p style={{ fontSize: 12, color: 'var(--color-warning-text)', marginTop: 4 }}>
                      İndekslenmeme nedeni: {decision.reason}
                    </p>
                  ) : null}
                </div>

                <LinkButton
                  href={`/admin/sehirler?duzenle=${city.id}`}
                  size="sm"
                  variant="secondary"
                >
                  Düzenle
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <CityForm
        editing={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                intro: editing.intro,
                isActive: editing.isActive,
                isPublic: editing.isPublic,
                isIndexable: editing.isIndexable,
              }
            : null
        }
      />

      <section style={{ marginTop: 24 }}>
        <Card flat>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <strong>İçerik eşiği:</strong> Bir şehir sayfası, en az 3 aktif paket ve 1
            doğrulanmış işletme olmadan indekslenmez. Sayfa yine de kullanıcıya gösterilir ancak
            sitemap&apos;e eklenmez.
          </p>
        </Card>
      </section>

      <div className={publicStyles.chipRow} style={{ marginTop: 16 }}>
        <LinkButton href="/admin/ilceler" size="sm" variant="ghost">
          İlçeleri yönet →
        </LinkButton>
      </div>
    </div>
  );
}
