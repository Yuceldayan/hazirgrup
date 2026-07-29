import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { buildPlanSummary, groupPlansByTab, type PlanSummary } from '@hazirgrup/core';
import { Button, EmptyState, ErrorState, LoadingCards } from '@/components/ui';
import { PlanListItem } from '@/components/PlanListItem';
import { useAsync } from '@/hooks/useAsync';
import { getRepository, getServiceContext, todayDate } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

const TABS = [
  { key: 'active', label: 'Aktif' },
  { key: 'upcoming', label: 'Yaklaşan' },
  { key: 'past', label: 'Geçmiş' },
  { key: 'drafts', label: 'Taslaklar' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const EMPTY_TEXT: Record<TabKey, { title: string; description: string }> = {
  active: {
    title: 'Aktif planın yok',
    description: 'İlk planını oluştur ve arkadaşlarını tek bağlantıyla davet et.',
  },
  upcoming: {
    title: 'Yaklaşan planın yok',
    description: 'Rezervasyonu onaylanan planların burada görünür.',
  },
  past: {
    title: 'Geçmiş planın yok',
    description: 'Tamamlanan ve iptal edilen planların burada listelenir.',
  },
  drafts: {
    title: 'Yarım kalan planın yok',
    description: 'Sihirbazı yarıda bıraktığın planlar burada birikir.',
  },
};

export default function PlansScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('active');

  const { data, error, isLoading, reload } = useAsync(async () => {
    if (!user) return null;
    const ctx = await getServiceContext();
    const repo = await getRepository();
    const plans = await repo.listPlansForUser(user.id);
    const summaries = await Promise.all(plans.map((plan) => buildPlanSummary(ctx, plan, user.id)));
    return groupPlansByTab(summaries, todayDate());
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  if (!data || !user) return null;

  const current: PlanSummary[] = data[tab];

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TABS.map((item) => (
          <Button
            key={item.key}
            title={`${item.label} (${data[item.key].length})`}
            size="sm"
            variant={tab === item.key ? 'primary' : 'secondary'}
            onPress={() => setTab(item.key)}
          />
        ))}
      </View>

      {current.length === 0 ? (
        <EmptyState
          icon="📋"
          title={EMPTY_TEXT[tab].title}
          description={EMPTY_TEXT[tab].description}
          action={
            <Button title="Yeni plan oluştur" onPress={() => router.push('/(tabs)/yeni')} />
          }
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {current.map((summary) => (
            <PlanListItem key={summary.plan.id} summary={summary} viewerId={user.id} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
