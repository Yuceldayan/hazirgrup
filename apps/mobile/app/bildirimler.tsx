import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatRelativeTime } from '@hazirgrup/core';
import { Button, Card, EmptyState, ErrorState, LoadingCards, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getRepository } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { data, error, isLoading, reload } = useAsync(async () => {
    if (!user) return null;
    const repo = await getRepository();
    return repo.listNotifications(user.id);
  }, [user?.id]);

  async function markAllRead() {
    if (!user) return;
    const repo = await getRepository();
    await repo.markAllNotificationsRead(user.id, new Date().toISOString());
    reload();
  }

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

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.readAt);

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.md }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
    >
      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Henüz bildirimin yok"
          description="Yeni bir hareket olduğunda burada göreceksin."
          action={<Button title="Ana sayfaya dön" onPress={() => router.replace('/(tabs)')} />}
        />
      ) : (
        <>
          {unread.length > 0 ? (
            <Button
              title={`${unread.length} bildirimi okundu işaretle`}
              variant="secondary"
              fullWidth
              onPress={markAllRead}
            />
          ) : null}

          {notifications.map((notification) => (
            <Card
              key={notification.id}
              flat={Boolean(notification.readAt)}
              style={
                notification.readAt
                  ? undefined
                  : { borderLeftWidth: 3, borderLeftColor: theme.colors.brandDefault }
              }
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}
              >
                <Txt variant="bodyStrong" style={{ flex: 1 }}>
                  {notification.readAt ? '' : '● '}
                  {notification.title}
                </Txt>
                <Txt variant="caption" color="muted">
                  {formatRelativeTime(notification.createdAt, Date.now())}
                </Txt>
              </View>
              <Txt variant="small" color="secondary">
                {notification.body}
              </Txt>

              {notification.data.planId ? (
                <Button
                  title="Planı aç"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push(`/plan/${notification.data.planId}`)}
                />
              ) : notification.data.reservationId ? (
                <Button
                  title="Rezervasyonu aç"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push(`/rezervasyon/${notification.data.reservationId}`)}
                />
              ) : null}
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}
