import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  alternativePackagesFor,
  buildReservationDetail,
  cancelReservation,
  formatCurrency,
  formatDate,
  formatPhone,
  formatTimeRange,
  REJECTION_REASON_LABELS,
  RESERVATION_STATUS_DESCRIPTIONS,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  reservationTimelineSteps,
  toWhatsAppNumber,
  userMessageOf,
} from '@hazirgrup/core';
import { Alert, Badge, Button, Card, EmptyState, LoadingCards, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getServiceContext } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { reservationActions } from '@/screens/state';
import { useTheme } from '@/theme';

export default function ReservationDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading, reload } = useAsync(async () => {
    if (!id) return null;
    const ctx = await getServiceContext();
    const detail = await buildReservationDetail(ctx, id);
    if (!detail) return null;

    const alternatives = reservationActions(detail.reservation.status).showAlternatives
      ? await alternativePackagesFor(ctx, {
          planId: detail.reservation.planId,
          excludePackageId: detail.reservation.packageId,
        })
      : [];

    return { detail, alternatives };
  }, [id]);

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards count={2} />
      </ScrollView>
    );
  }

  if (!data) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <EmptyState
          icon="🔍"
          title="Rezervasyon bulunamadı"
          description="Bu rezervasyon silinmiş olabilir."
          action={
            <Button
              title="Rezervasyonlarıma dön"
              onPress={() => router.replace('/(tabs)/rezervasyonlar')}
            />
          }
        />
      </View>
    );
  }

  const { detail, alternatives } = data;
  const { reservation } = detail;
  const actions = reservationActions(reservation.status);

  async function handleCancel() {
    setActionError(null);
    setBusy(true);
    try {
      const ctx = await getServiceContext();
      await cancelReservation(ctx, {
        reservationId: reservation.id,
        actorId: user!.id,
        byBusiness: false,
        reason: null,
      });
      reload();
    } catch (cause) {
      setActionError(userMessageOf(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}>
      <View style={{ gap: 8 }}>
        <Badge
          tone={RESERVATION_STATUS_TONES[reservation.status]}
          icon={RESERVATION_STATUS_ICONS[reservation.status]}
          label={RESERVATION_STATUS_LABELS[reservation.status]}
        />
        <Txt variant="h1">{detail.business.name}</Txt>
        <Txt variant="small" color="secondary">
          {RESERVATION_STATUS_DESCRIPTIONS[reservation.status]}
        </Txt>
      </View>

      {actionError ? <Alert tone="error" message={actionError} /> : null}

      {reservation.status === 'rejected' ? (
        <Alert
          tone="error"
          title="Talebin kabul edilmedi"
          message={
            reservation.rejectionNote ??
            (reservation.rejectionReason
              ? REJECTION_REASON_LABELS[reservation.rejectionReason]
              : 'İşletme talebi kabul edemedi.')
          }
        />
      ) : null}

      {actions.showCode ? (
        <Card>
          <Txt variant="small" color="secondary">
            Rezervasyon kodun
          </Txt>
          <Txt variant="display" style={{ letterSpacing: 2 }}>
            {reservation.code}
          </Txt>
          <Txt variant="small" color="secondary">
            Mekâna vardığında bu kodu söylemen yeterli.
          </Txt>
        </Card>
      ) : null}

      <Card>
        <Txt variant="h2">Rezervasyon bilgileri</Txt>
        {[
          ['Paket', detail.package.name],
          ['Şube', detail.branch.name],
          ['Adres', detail.branch.address],
          ['Tarih', formatDate(reservation.reservedDate)],
          [
            'Saat',
            formatTimeRange(reservation.reservedStartTime, reservation.reservedEndTime),
          ],
          ['Kişi sayısı', `${reservation.peopleCount} kişi`],
          ['Toplam', formatCurrency(reservation.totalPrice)],
          ['Kişi başı', formatCurrency(reservation.perPersonPrice)],
        ].map(([label, value]) => (
          <View
            key={label}
            style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
          >
            <Txt variant="small" color="secondary">
              {label}
            </Txt>
            <Txt variant="small" style={{ flex: 1, textAlign: 'right' }}>
              {value}
            </Txt>
          </View>
        ))}
      </Card>

      {actions.showContact && detail.branch.phone ? (
        <Card>
          <Txt variant="h2">Mekânla iletişime geç</Txt>
          <Button
            title={`📞 ${formatPhone(detail.branch.phone)}`}
            variant="secondary"
            fullWidth
            onPress={() => Linking.openURL(`tel:${detail.branch.phone}`)}
          />
          {detail.branch.whatsapp ? (
            <Button
              title="💬 WhatsApp"
              variant="secondary"
              fullWidth
              onPress={() =>
                Linking.openURL(`https://wa.me/${toWhatsAppNumber(detail.branch.whatsapp!)}`)
              }
            />
          ) : null}
        </Card>
      ) : null}

      <Card>
        <Txt variant="h2">Durum geçmişi</Txt>
        {reservationTimelineSteps(reservation.status).map((step) => (
          <View key={step.status} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Txt>{step.state === 'done' ? '✅' : step.state === 'current' ? '🔵' : '⚪'}</Txt>
            <Txt variant="small" color={step.state === 'upcoming' ? 'muted' : 'primary'}>
              {step.label}
            </Txt>
          </View>
        ))}
      </Card>

      {alternatives.length > 0 ? (
        <Card>
          <Txt variant="h2">Alternatif paketler</Txt>
          {alternatives.map((match) => (
            <View key={match.package.id} style={{ gap: 4 }}>
              <Txt variant="bodyStrong">{match.package.name}</Txt>
              <Txt variant="small" color="secondary">
                {match.business.name} · {formatCurrency(match.pricing.perPersonPrice)} kişi başı
              </Txt>
            </View>
          ))}
          <Button
            title="Plana dön ve yeni talep gönder"
            variant="secondary"
            fullWidth
            onPress={() => router.push(`/plan/${reservation.planId}`)}
          />
        </Card>
      ) : null}

      {actions.canCancel ? (
        <Button
          title="Rezervasyonu iptal et"
          variant="danger"
          fullWidth
          loading={busy}
          onPress={handleCancel}
        />
      ) : null}
    </ScrollView>
  );
}
