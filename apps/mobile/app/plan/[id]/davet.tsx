import { useState } from 'react';
import { Linking, ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { createInvitation, userMessageOf } from '@hazirgrup/core';
import { Alert, Button, Card, LoadingCards, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getServiceContext } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

/**
 * Davet ekranı.
 *
 * Davet tokenı veritabanında düz metin saklanmadığı için (docs/SECURITY_MODEL.md §4)
 * bağlantı yalnızca üretildiği anda gösterilir. "Yeni bağlantı oluştur" eskisini
 * anında geçersiz kılar.
 */
export default function InviteScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [invite, setInvite] = useState<{
    url: string;
    message: string;
    whatsapp: string;
    shortCode: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useAsync(async () => {
    if (!id) return null;
    const ctx = await getServiceContext();
    const [plan, invitation, participants] = await Promise.all([
      ctx.repo.getPlan(id),
      ctx.repo.getActiveInvitation(id),
      ctx.repo.listParticipants(id),
    ]);
    return { plan, invitation, participants };
  }, [id]);

  async function generate() {
    if (!id || !user) return;
    setError(null);
    setBusy(true);
    try {
      const ctx = await getServiceContext();
      const result = await createInvitation(ctx, { planId: id, userId: user.id });
      setInvite({
        url: result.inviteUrl,
        message: result.shareMessage,
        whatsapp: result.whatsappUrl,
        shortCode: result.invitation.shortCode,
      });
    } catch (cause) {
      setError(userMessageOf(cause));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards count={2} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}>
      <Txt variant="h1">Arkadaşlarını davet et</Txt>
      <Txt variant="small" color="secondary">
        Tek bağlantı yeter. Arkadaşların uygulama indirmeden tarayıcıda katılabilir.
      </Txt>

      {error ? <Alert tone="error" message={error} /> : null}

      {invite ? (
        <Card>
          <Txt variant="bodyStrong">Davet bağlantın hazır</Txt>
          <Txt variant="mono" color="secondary" selectable>
            {invite.url}
          </Txt>
          <Txt variant="small" color="secondary">
            Sözlü paylaşım için kod: {invite.shortCode}
          </Txt>

          <Button
            title="WhatsApp'ta paylaş"
            fullWidth
            onPress={() => Linking.openURL(invite.whatsapp)}
          />
          <Button
            title="Diğer uygulamalarla paylaş"
            variant="secondary"
            fullWidth
            onPress={() => Share.share({ message: invite.message })}
          />

          <Txt variant="caption" color="muted">
            Paylaşım metninde bütçe, katılımcı isimleri veya özel notun yer almaz.
          </Txt>
        </Card>
      ) : null}

      <Card>
        <Txt variant="bodyStrong">
          {data?.invitation ? 'Yeni bağlantı oluştur' : 'Davet bağlantısı oluştur'}
        </Txt>
        <Txt variant="small" color="secondary">
          {data?.invitation
            ? 'Güvenlik gereği mevcut bağlantı tekrar gösterilemez. Yeni bağlantı oluşturduğunda eski bağlantı anında geçersiz olur.'
            : 'Bağlantıyı oluştur ve gruba gönder.'}
        </Txt>
        <Button
          title={data?.invitation ? 'Yeni bağlantı oluştur' : 'Bağlantı oluştur'}
          fullWidth
          loading={busy}
          onPress={generate}
        />
      </Card>

      <Card flat>
        <Txt variant="bodyStrong">Nasıl çalışır?</Txt>
        {[
          '1. Bağlantıyı WhatsApp grubuna gönder.',
          '2. Arkadaşların bağlantıya dokunup adını yazar.',
          '3. Katılım durumunu seçer.',
          '4. Uygun paketleri görüp oy verir.',
          '5. Sen oylamayı bitirip rezervasyon talebini gönderirsin.',
        ].map((line) => (
          <Txt key={line} variant="small" color="secondary">
            {line}
          </Txt>
        ))}
      </Card>

      {data?.participants && data.participants.length > 0 ? (
        <Card>
          <Txt variant="bodyStrong">Şu ana kadar katılanlar ({data.participants.length})</Txt>
          {data.participants.map((participant) => (
            <Txt key={participant.id} variant="small" color="secondary">
              {participant.status === 'going'
                ? '✅'
                : participant.status === 'maybe'
                  ? '🤔'
                  : participant.status === 'not_going'
                    ? '🚫'
                    : '⏳'}{' '}
              {participant.displayName}
            </Txt>
          ))}
        </Card>
      ) : null}

      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  );
}
