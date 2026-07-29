import type { Metadata } from 'next';
import type { District } from '@hazirgrup/core';
import { addDays, formatDate } from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository, todayDate } from '@/server/repository';
import { EmptyState, LinkButton } from '@/components/ui';
import { PlanWizard } from './PlanWizard';

export const metadata: Metadata = {
  title: 'Yeni plan oluştur | HazırGrup',
  robots: { index: false, follow: false },
};

/**
 * Plan adı önerisi — kullanıcı istediği gibi değiştirebilir (FR-3.5).
 * Varsayılan tarih yarın olduğu için yarının gün adı kullanılır.
 */
function suggestPlanName(today: string): string {
  const parts = formatDate(addDays(today, 1)).split(' ');
  const dayName = parts[parts.length - 1] ?? 'Hafta Sonu';
  return `${dayName} Buluşması`;
}

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const user = await requireUser('/hesap/plan/yeni');
  const { kategori } = await searchParams;
  const repo = await getRepository();
  const today = todayDate();

  const [cities, categories, preferences] = await Promise.all([
    repo.listCities({ onlyActive: true }),
    repo.listCategories({ onlyActive: true }),
    repo.listPreferences(),
  ]);

  if (cities.length === 0) {
    return (
      <EmptyState
        icon="🏙️"
        title="Henüz aktif şehir yok"
        description="Plan oluşturmak için en az bir aktif şehir gerekiyor. Yakında yeni şehirler ekleniyor."
        action={
          <LinkButton href="/sehirler" variant="secondary">
            Şehirlere göz at
          </LinkButton>
        }
      />
    );
  }

  const districtsByCity: Record<string, District[]> = {};
  for (const city of cities) {
    districtsByCity[city.id] = await repo.listDistricts(city.id, { onlyActive: true });
  }

  const preselectedCategory = kategori && categories.some((c) => c.id === kategori) ? kategori : null;

  return (
    <PlanWizard
      cities={cities}
      districtsByCity={districtsByCity}
      categories={categories}
      preferences={preferences}
      today={today}
      defaultCityId={user.cityId ?? cities[0]?.id ?? null}
      defaultDistrictId={user.districtId}
      preselectedCategoryId={preselectedCategory}
      suggestedName={suggestPlanName(today)}
    />
  );
}
