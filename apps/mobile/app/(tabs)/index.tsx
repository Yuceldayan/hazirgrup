import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  buildPlanSummary,
  formatDate,
  formatRelativeDay,
  groupPlansByTab,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
} from '@hazirgrup/core';
import { Alert, Badge, Button, Card, EmptyState, ErrorState, LoadingCards, Txt } from '@/components/ui';
import { PlanListItem } from '@/components/PlanListItem';
import { useAsync } from '@/hooks/useAsync';
import { getRepository, getServiceContext, todayDate } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { homeSections } from '@/screens/state';
import { useTheme } from '@/theme';

/** Ana sayfa (docs/INFORMATION_ARCHITECTURE.md §1.3). */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { data, error, isLoading, reload } = useAsync(async () => {
    if (!user) return null;

    const ctx = await getServiceContext();
    const repo = await getRepository();
    const today = todayDate();

    const plans = await repo.listPlansForUser(user.id);
    const summaries = await Promise.all(plans.map((plan) => buildPlanSummary(ctx, plan, user.id)));
    const grouped = groupPlansByTab(summaries, today);

    const reservations = await repo.listReservationsForUser(user.id);
    const upcoming = reservations
      .filter((r) => r.status === 'confirmed' && r.reservedDate >= today)
      .sort((a, b) => a.reservedDate.localeCompare(b.reservedDate));

    const notifications = await repo.listNotifications(user.id);
    const categories = await repo.listCategories({ onlyActive: true });

    return {
      grouped,
      invites: summaries.filter(
        (summary) =>
          summary.plan.ownerId !== user.id &&
          summary.plan.status !== 'cancelled' &&
          summary.plan.status !== 'completed',
      ),
      upcoming,
      unread: notifications.filter((n) => !n.readAt),
      categories,
      today,
    };
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}>
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

  const sections = homeSections({
    activePlans: data.grouped.active,
    invitePlans: data.invites,
    upcomingReservations: data.upcoming,
  });

  const activePlan = data.grouped.active[0] ?? data.grouped.upcoming[0] ?? null;

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.lg }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
    >
      <View style={{ gap: 4 }}>
        <Txt variant="h1">Merhaba {user.displayName.split(' ')[0]} 👋</Txt>
        <Txt variant="small" color="secondary">
          Planlarını yönet, arkadaşlarını davet et, birlikte karar verin.
        </Txt>
      </View>

      {/* --- Tek ana işlem ------------------------------------------------ */}
      <Card>
        <Txt variant="h3">Yeni bir buluşma mı planlıyorsun?</Txt>
        <Txt variant="small" color="secondary">
          Bir dakikada plan oluştur, bağlantıyı gruba at.
        </Txt>
        <Button
          title="Yeni plan oluştur"
          size="lg"
          fullWidth
          onPress={() => router.push('/(tabs)/yeni')}
        />
      </Card>

      {data.unread.length > 0 ? (
        <Alert
          tone="info"
          title={`${data.unread.length} okunmamış bildirim`}
          message={data.unread[0]?.body ?? ''}
        />
      ) : null}

      {sections.showEmptyPrompt ? (
        <EmptyState
          icon="📋"
          title="Henüz planın yok"
          description="İlk planını oluştur ve arkadaşlarını tek bağlantıyla davet et."
          action={
            <Button title="Yeni plan oluştur" onPress={() => router.push('/(tabs)/yeni')} />
          }
        />
      ) : null}

      {/* --- Devam eden plan ---------------------------------------------- */}
      {sections.showActivePlan && activePlan ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Txt variant="h2">Devam eden planın</Txt>
          <PlanListItem summary={activePlan} viewerId={user.id} />
        </View>
      ) : null}

      {/* --- Davetler ------------------------------------------------------ */}
      {sections.showInvites ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Txt variant="h2">Seni bekleyen davetler</Txt>
          {data.invites.slice(0, 3).map((summary) => (
            <PlanListItem key={summary.plan.id} summary={summary} viewerId={user.id} />
          ))}
        </View>
      ) : null}

      {/* --- Yaklaşan rezervasyon ------------------------------------------ */}
      {sections.showUpcomingReservation ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Txt variant="h2">Yaklaşan rezervasyon</Txt>
          {data.upcoming.slice(0, 2).map((reservation) => (
            <Card key={reservation.id}>
              <Badge
                tone={RESERVATION_STATUS_TONES[reservation.status]}
                icon={RESERVATION_STATUS_ICONS[reservation.status]}
                label={RESERVATION_STATUS_LABELS[reservation.status]}
              />
              <Txt variant="bodyStrong">
                {formatDate(reservation.reservedDate)} ·{' '}
                {formatRelativeDay(reservation.reservedDate, data.today)}
              </Txt>
              <Txt variant="small" color="secondary">
                {reservation.peopleCount} kişi · Kod: {reservation.code}
              </Txt>
              <Button
                title="Rezervasyonu gör"
                variant="secondary"
                size="sm"
                onPress={() => router.push(`/rezervasyon/${reservation.id}`)}
              />
            </Card>
          ))}
        </View>
      ) : null}

      {/* --- Son kullanılan kategoriler -------------------------------------- */}
      <View style={{ gap: theme.spacing.sm }}>
        <Txt variant="h2">Ne yapmak istiyorsun?</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {data.categories.map((category) => (
            <Button
              key={category.id}
              title={category.name}
              variant="secondary"
              size="sm"
              onPress={() => router.push('/(tabs)/yeni')}
            />
          ))}
        </View>
      </View>

      {/* --- Yardım kartı ---------------------------------------------------- */}
      <Card flat>
        <Txt variant="bodyStrong">HazırGrup nasıl çalışır?</Txt>
        <Txt variant="small" color="secondary">
          Plandan rezervasyona kadar tüm adımlar.
        </Txt>
        <Button
          title="Yardıma göz at"
          variant="ghost"
          size="sm"
          onPress={() => router.push('/yardim')}
        />
      </Card>
    </ScrollView>
  );
}
