import type { Metadata } from 'next';
import { ROUTES } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, LinkButton, SectionHeader } from '@/components/ui';
import { DistrictForm } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'İlçeler | Yönetici',
  robots: { index: false, follow: false },
};

export default async function AdminDistrictsPage({
  searchParams,
}: {
  searchParams: Promise<{ duzenle?: string; sehir?: string }>;
}) {
  await requireAdmin('/admin/ilceler');
  const { duzenle } = await searchParams;

  const repo = await getRepository();
  const cities = await repo.listCities();

  const groups = await Promise.all(
    cities.map(async (city) => ({
      city,
      districts: await repo.listDistricts(city.id),
    })),
  );

  const allDistricts = groups.flatMap((group) => group.districts);
  const editing = duzenle ? (allDistricts.find((d) => d.id === duzenle) ?? null) : null;

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>İlçeler</h1>
        <p className={styles.panelSubtitle}>
          İlçe sayfaları da içerik eşiğine tabidir; yeterli paket yoksa indekslenmez.
        </p>
      </header>

      {groups.map(({ city, districts }) => (
        <section key={city.id} style={{ marginBottom: 24 }}>
          <SectionHeader title={`${city.name} (${districts.length} ilçe)`} as="h2" />
          {districts.length === 0 ? (
            <Card flat>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Bu şehirde henüz ilçe yok.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {districts.map((district) => (
                <Card key={district.id} flat>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Badge tone={district.isActive ? 'success' : 'neutral'}>
                          {district.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                        <Badge tone={district.isIndexable ? 'brand' : 'warning'}>
                          {district.isIndexable ? 'İndekslenebilir' : 'noindex'}
                        </Badge>
                      </div>
                      <p style={{ fontWeight: 600, marginTop: 6 }}>{district.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        <code>{ROUTES.district(city.slug, district.slug)}</code>
                      </p>
                    </div>

                    <LinkButton
                      href={`/admin/ilceler?duzenle=${district.id}`}
                      size="sm"
                      variant="secondary"
                    >
                      Düzenle
                    </LinkButton>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      ))}

      <DistrictForm
        cities={cities.map((city) => ({ id: city.id, name: city.name }))}
        editing={
          editing
            ? {
                id: editing.id,
                cityId: editing.cityId,
                name: editing.name,
                slug: editing.slug,
                isActive: editing.isActive,
                isPublic: editing.isPublic,
                isIndexable: editing.isIndexable,
              }
            : null
        }
      />
    </div>
  );
}
