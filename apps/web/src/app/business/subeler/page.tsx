import type { Metadata } from 'next';
import type { District } from '@hazirgrup/core';
import { WEEKDAY_SHORT_LABELS, type Weekday } from '@hazirgrup/core';
import { requireBusinessMember } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { BranchEditor } from './BranchEditor';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Şubeler | İşletme paneli',
  robots: { index: false, follow: false },
};

export default async function BusinessBranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ duzenle?: string }>;
}) {
  const { businessId } = await requireBusinessMember();
  const { duzenle } = await searchParams;

  const repo = await getRepository();
  const [branches, cities] = await Promise.all([
    repo.listBranches(businessId),
    repo.listCities({ onlyActive: true }),
  ]);

  const districtsByCity: Record<string, District[]> = {};
  for (const city of cities) {
    districtsByCity[city.id] = await repo.listDistricts(city.id, { onlyActive: true });
  }
  const allDistricts = Object.values(districtsByCity).flat();

  const editing = duzenle ? (branches.find((b) => b.id === duzenle) ?? null) : null;

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Şubeler</h1>
        <p className={styles.panelSubtitle}>
          Paketler bir şubeye bağlıdır. Her şubenin adresi ve çalışma saatleri public sayfanda
          görünür.
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          title={`Şubelerin (${branches.length})`}
          action={
            editing ? (
              <LinkButton href="/business/subeler" variant="ghost" size="sm">
                Düzenlemeyi bırak
              </LinkButton>
            ) : undefined
          }
        />

        {branches.length === 0 ? (
          <EmptyState
            icon="📍"
            title="Henüz şuben yok"
            description="Aşağıdaki formdan ilk şubeni ekle; ardından paket oluşturabilirsin."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {branches.map((branch) => {
              const city = cities.find((c) => c.id === branch.cityId);
              const district = allDistricts.find((d) => d.id === branch.districtId);
              const openDays = branch.hours.filter((h) => !h.isClosed);

              return (
                <Card key={branch.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Badge tone={branch.isActive ? 'success' : 'neutral'} icon={branch.isActive ? '✓' : '⏸'}>
                        {branch.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                      <p style={{ fontWeight: 600, marginTop: 8 }}>{branch.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {district?.name ?? '—'}, {city?.name ?? '—'}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {branch.address}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                        Açık günler:{' '}
                        {openDays.length === 7
                          ? 'Her gün'
                          : openDays
                              .map((h) => WEEKDAY_SHORT_LABELS[h.weekday as Weekday])
                              .join(', ') || 'Yok'}
                      </p>
                    </div>

                    <LinkButton
                      href={`/business/subeler?duzenle=${branch.id}`}
                      size="sm"
                      variant="secondary"
                    >
                      Düzenle
                    </LinkButton>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <BranchEditor cities={cities} districtsByCity={districtsByCity} editing={editing} />
    </div>
  );
}
