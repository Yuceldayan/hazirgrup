import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  formatCurrency,
  formatDate,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  type Reservation,
} from '@hazirgrup/core';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingCards, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getRepository } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

const TABS = [
  { key: 'pending', label: 'Bekleyen' },
  { key: 'confirmed', label: 'Onaylanan' },
  { key: 'past', label: 'Geçmiş' },
  { key: 'cancelled', label: 'İptal' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function group(reservations: Reservation[]): Record<TabKey, Reservation[]> {
  return {
    pending: reservations.filter((r) => r.status === 'pending_business' || r.status === 'created'),
    confirmed: reservations.filter((r) => r.status === 'confirmed'),
    past: reservations.filter((r) => r.status === 'completed' || r.status === 'no_show'),
    cancelled: reservations.filter(
      (r) =>
        r.status === 'rejected' ||
        r.status === 'cancelled_by_user' ||
        r.status === 'cancelled_by_business',
    ),
  };
}

export default function ReservationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('pending');

  const { data, error, isLoading, reload } = useAsync(async () => {
    if (!user) return null;
    const repo = await getRepository();
    const reservations = await repo.listReservationsForUser(user.id);

    const names = new Map<string, string>();
    for (const reservation of reservations) {
      if (!names.has(reservation.businessId)) {
        const business = await repo.getBusiness(reservation.businessId);
        names.set(reservation.businessId, business?.name ?? 'Mekân');
      }
    }

    return { grouped: group(reservations), names };
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

  if (!data) return null;

  const current = data.grouped[tab];

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TABS.map((item) => (
          <Button
            key={item.key}
            title={`${item.label} (${data.grouped[item.key].length})`}
            size="sm"
            variant={tab === item.key ? 'primary' : 'secondary'}
            onPress={() => setTab(item.key)}
          />
        ))}
      </View>

      {current.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Bu bölümde rezervasyon yok"
          description="Oylaması biten planından rezervasyon oluşturabilirsin."
          action={
            <Button title="Planlarıma git" onPress={() => router.push('/(tabs)/planlar')} />
          }
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {current.map((reservation) => (
            <Pressable
              key={reservation.id}
              accessibilityRole="button"
              onPress={() => router.push(`/rezervasyon/${reservation.id}`)}
            >
              <Card>
                <Badge
                  tone={RESERVATION_STATUS_TONES[reservation.status]}
                  icon={RESERVATION_STATUS_ICONS[reservation.status]}
                  label={RESERVATION_STATUS_LABELS[reservation.status]}
                />
                <Txt variant="h3">{data.names.get(reservation.businessId)}</Txt>
                <Txt variant="small" color="secondary">
                  {formatDate(reservation.reservedDate)} · {reservation.peopleCount} kişi ·{' '}
                  {formatCurrency(reservation.totalPrice)}
                </Txt>
                <Txt variant="mono" color="secondary">
                  {reservation.code}
                </Txt>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
