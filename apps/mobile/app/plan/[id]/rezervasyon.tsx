import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  buildPackageContext,
  calculatePackagePricing,
  countParticipation,
  createReservationRequest,
  estimateAttendance,
  formatCurrency,
  userMessageOf,
} from '@hazirgrup/core';
import { createReservationSchema, toFieldErrors } from '@hazirgrup/validation';
import { Alert, Button, Card, EmptyState, Field, LoadingCards, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getServiceContext } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

export default function ReservationRequestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [peopleCount, setPeopleCount] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useAsync(async () => {
    if (!id || !user) return null;
    const ctx = await getServiceContext();
    const plan = await ctx.repo.getPlan(id);
    if (!plan?.winningPackageId) return { plan, context: null, estimated: 0 };

    const context = await buildPackageContext(ctx, plan.winningPackageId);
    const participants = await ctx.repo.listParticipants(plan.id);
    const counts = countParticipation(participants.map((p) => p.status));
    const estimated = estimateAttendance({
      counts,
      planEstimatedPeople: plan.estimatedPeople,
      planMinPeople: plan.minPeople,
    });

    const profile = await ctx.repo.getProfile(user.id);
    setPeopleCount((current) => current || String(estimated));
    setContactName((current) => current || user.displayName);
    setContactPhone((current) => current || (profile?.phone ?? ''));

    return { plan, context, estimated };
  }, [id, user?.id]);

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards count={2} />
      </ScrollView>
    );
  }

  if (!data?.context) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <EmptyState
          icon="🗳️"
          title="Önce oylamanın tamamlanması gerekiyor"
          description="Rezervasyon talebi ancak kazanan paket belirlendikten sonra gönderilebilir."
          action={<Button title="Plana dön" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  const pkg = data.context.package;
  const count = Math.max(1, Number(peopleCount) || 1);
  const pricing = calculatePackagePricing({
    pricingModel: pkg.pricingModel,
    priceAmount: pkg.priceAmount,
    peopleCount: count,
    minPeople: pkg.minPeople,
  });
  const outOfRange = count < pkg.minPeople || count > pkg.maxPeople;

  async function handleSubmit() {
    setFormError(null);
    const parsed = createReservationSchema.safeParse({
      planId: id,
      packageId: pkg.id,
      peopleCount: count,
      contactName,
      contactPhone,
      note,
    });

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const ctx = await getServiceContext();
      await createReservationRequest(ctx, {
        planId: parsed.data.planId,
        userId: user!.id,
        packageId: parsed.data.packageId,
        peopleCount: count,
        contactName: parsed.data.contactName,
        contactPhone: parsed.data.contactPhone,
        note: parsed.data.note,
      });
      router.replace(`/plan/${id}`);
    } catch (cause) {
      setFormError(userMessageOf(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}
        keyboardShouldPersistTaps="handled"
      >
        <Txt variant="h1">Rezervasyon talebi</Txt>

        {formError ? <Alert tone="error" message={formError} /> : null}

        <Card>
          <Txt variant="bodyStrong">{pkg.name}</Txt>
          <Txt variant="small" color="secondary">
            {data.context.business.name} · {data.context.branch.name}
          </Txt>
        </Card>

        <Card>
          <Field
            label="Kesin kişi sayısı"
            value={peopleCount}
            onChangeText={setPeopleCount}
            keyboardType="number-pad"
            hint={`Bu paket ${pkg.minPeople}–${pkg.maxPeople} kişilik gruplar içindir.`}
            {...(errors.peopleCount ? { error: errors.peopleCount } : {})}
          />

          {outOfRange ? (
            <Alert
              tone="warning"
              message={`Kişi sayısı kapasite dışında. ${pkg.minPeople}–${pkg.maxPeople} arası bir değer gir.`}
            />
          ) : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Txt variant="h2">{formatCurrency(pricing.perPersonPrice)}</Txt>
              <Txt variant="small" color="secondary">
                kişi başı
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt variant="h2">{formatCurrency(pricing.totalPrice)}</Txt>
              <Txt variant="small" color="secondary">
                toplam
              </Txt>
            </View>
          </View>

          <Field
            label="İletişim adı"
            value={contactName}
            onChangeText={setContactName}
            {...(errors.contactName ? { error: errors.contactName } : {})}
          />

          <Field
            label="İletişim telefonu"
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            placeholder="0555 111 22 33"
            hint="Yalnızca bu rezervasyon için ilgili işletmeyle paylaşılır."
            {...(errors.contactPhone ? { error: errors.contactPhone } : {})}
          />

          <Field
            label="Not (isteğe bağlı)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Talebi gönder"
            size="lg"
            fullWidth
            loading={busy}
            disabled={outOfRange}
            onPress={handleSubmit}
          />

          <Txt variant="caption" color="muted" style={{ textAlign: 'center' }}>
            Talebin işletmeye iletilir. Onaylandığında bildirim alırsın ve rezervasyon kodun
            oluşur. Ödeme mekânda yapılır.
          </Txt>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
