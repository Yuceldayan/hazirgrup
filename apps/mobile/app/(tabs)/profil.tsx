import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { userMessageOf } from '@hazirgrup/core';
import { Alert, Button, Card, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getRepository } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';
import { env } from '@/lib/env';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const { data } = useAsync(async () => {
    if (!user) return null;
    const repo = await getRepository();
    const [profile, notifications, favorites, plans] = await Promise.all([
      repo.getProfile(user.id),
      repo.listNotifications(user.id),
      repo.listFavorites(user.id),
      repo.listPlansForUser(user.id),
    ]);
    return {
      profile,
      unread: notifications.filter((n) => !n.readAt).length,
      favoriteCount: favorites.length,
      planCount: plans.length,
      mode: repo.mode,
    };
  }, [user?.id]);

  async function handleDeleteAccount() {
    if (!user) return;
    try {
      const repo = await getRepository();
      await repo.deleteAccount(user.id, new Date().toISOString());
      await signOut();
      router.replace('/(auth)/giris');
    } catch (error) {
      setMessage(userMessageOf(error));
    }
  }

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}>
      <Card>
        <Txt variant="h2">{user.displayName}</Txt>
        <Txt variant="small" color="secondary">
          {user.email}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <View>
            <Txt variant="h3">{data?.planCount ?? 0}</Txt>
            <Txt variant="caption" color="secondary">
              plan
            </Txt>
          </View>
          <View>
            <Txt variant="h3">{data?.favoriteCount ?? 0}</Txt>
            <Txt variant="caption" color="secondary">
              favori
            </Txt>
          </View>
          <View>
            <Txt variant="h3">{data?.unread ?? 0}</Txt>
            <Txt variant="caption" color="secondary">
              okunmamış
            </Txt>
          </View>
        </View>
      </Card>

      {message ? <Alert tone="error" message={message} /> : null}

      <Card>
        <Txt variant="bodyStrong">Hesap</Txt>
        <Button
          title="Bildirimler"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/bildirimler')}
        />
        <Button
          title="Yardım merkezi"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/yardim')}
        />
      </Card>

      <Card>
        <Txt variant="bodyStrong">Tema</Txt>
        <Txt variant="small" color="secondary">
          Uygulama cihazının sistem temasını izler. Şu an{' '}
          {theme.isDark ? 'koyu' : 'açık'} tema kullanılıyor.
        </Txt>
      </Card>

      <Card>
        <Txt variant="bodyStrong">Bildirim tercihleri</Txt>
        <Txt variant="small" color="secondary">
          Uygulama içi bildirimler her zaman açıktır. Push bildirimleri{' '}
          {env.pushEnabled
            ? 'etkin; cihaz izni istendiğinde onaylaman yeterli.'
            : 'bu derlemede yapılandırılmamıştır (docs/KNOWN_LIMITATIONS.md L-04).'}
        </Txt>
      </Card>

      <Card>
        <Txt variant="bodyStrong">Veri kaynağı</Txt>
        <Txt variant="small" color="secondary">
          {data?.mode === 'demo'
            ? 'Demo modu — kurgusal örnek verilerle çalışıyorsun. Tüm akışlar eksiksiz çalışır.'
            : 'Supabase bağlantısı etkin.'}
        </Txt>
      </Card>

      <Card>
        <Txt variant="bodyStrong">Gizlilik ve yasal</Txt>
        <Txt variant="small" color="secondary">
          Gizlilik politikası, KVKK aydınlatma metni ve kullanım koşullarına web sitesinden
          ulaşabilirsin: {env.siteUrl}/legal/kvkk-aydinlatma-metni
        </Txt>
      </Card>

      <Card>
        <Txt variant="bodyStrong" color="danger">
          Tehlikeli bölge
        </Txt>
        <Txt variant="small" color="secondary">
          Hesabını silersen profil bilgilerin 30 gün içinde kalıcı olarak silinir; planların
          anonimleştirilir.
        </Txt>
        <Button
          title="Hesabımı sil"
          variant="danger"
          fullWidth
          onPress={handleDeleteAccount}
        />
      </Card>

      <Button
        title="Çıkış yap"
        variant="secondary"
        fullWidth
        onPress={async () => {
          await signOut();
          router.replace('/(auth)/giris');
        }}
      />
    </ScrollView>
  );
}
