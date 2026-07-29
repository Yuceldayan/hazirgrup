import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  addDays,
  createPlan,
  formatCurrency,
  formatDate,
  GROUP_SIZE_PRESETS,
  nextWeekend,
  perPersonFromTotal,
  TIME_SLOT_PRESETS,
  totalFromPerPerson,
  userMessageOf,
  type Category,
  type City,
  type District,
  type Preference,
} from '@hazirgrup/core';
import { Alert, Button, Card, EmptyState, ErrorState, Field, LoadingCards, Progress, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getRepository, getServiceContext, todayDate } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { isWizardStepValid, wizardProgress } from '@/screens/state';
import { useTheme } from '@/theme';

/**
 * 7 adımlı plan sihirbazı (docs/USER_FLOWS.md §B).
 * Her adımda ilerleme göstergesi, geri butonu ve yardımcı metin bulunur.
 */

const STEP_TITLES = [
  'Ne zaman buluşuyorsunuz?',
  'Nerede buluşacaksınız?',
  'Kaç kişisiniz?',
  'Bütçeniz ne kadar?',
  'Ne yapmak istiyorsunuz?',
  'Tercihleriniz var mı?',
  'Plan özeti',
];

const STEP_HINTS = [
  'Kesin tarihi bilmiyorsan yaklaşık bir gün seç; sonradan değiştirebilirsin.',
  'İlçe seçmezsen şehirdeki tüm paketler listelenir.',
  'Katılım netleşmemişse geniş bir aralık ver.',
  'Kişi başı veya toplam gir; diğeri otomatik hesaplanır.',
  'Birden fazla seçebilirsin.',
  'Tercihler zorunlu değildir, eşleşmeyi iyileştirir.',
  'Her şey doğruysa planı oluştur.',
];

interface Catalog {
  cities: City[];
  districtsByCity: Record<string, District[]>;
  categories: Category[];
  preferences: Preference[];
  today: string;
}

export default function NewPlanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { data, error, isLoading, reload } = useAsync<Catalog | null>(async () => {
    const repo = await getRepository();
    const [cities, categories, preferences] = await Promise.all([
      repo.listCities({ onlyActive: true }),
      repo.listCategories({ onlyActive: true }),
      repo.listPreferences(),
    ]);

    const districtsByCity: Record<string, District[]> = {};
    for (const city of cities) {
      districtsByCity[city.id] = await repo.listDistricts(city.id, { onlyActive: true });
    }

    return { cities, districtsByCity, categories, preferences, today: todayDate() };
  }, []);

  const [step, setStep] = useState(1);
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('23:00');
  const [isTimeFlexible, setIsTimeFlexible] = useState(true);
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [estimatedPeople, setEstimatedPeople] = useState('6');
  const [minPeople, setMinPeople] = useState('5');
  const [maxPeople, setMaxPeople] = useState('8');
  const [budgetMode, setBudgetMode] = useState<'per_person' | 'total'>('per_person');
  const [budgetAmount, setBudgetAmount] = useState('250');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [preferenceKeys, setPreferenceKeys] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards count={2} />
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

  if (data.cities.length === 0) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <EmptyState
          icon="🏙️"
          title="Henüz aktif şehir yok"
          description="Plan oluşturmak için en az bir aktif şehir gerekiyor."
        />
      </View>
    );
  }

  const today = data.today;
  const resolvedCityId = cityId || data.cities[0]?.id || '';
  const resolvedDate = eventDate || addDays(today, 1);
  const districts = data.districtsByCity[resolvedCityId] ?? [];

  const people = Math.max(1, Number(estimatedPeople) || 1);
  const amountKurus = Math.round((Number(budgetAmount.replace(',', '.')) || 0) * 100);
  const perPerson =
    budgetMode === 'per_person' ? amountKurus : perPersonFromTotal(amountKurus, people);
  const total = budgetMode === 'total' ? amountKurus : totalFromPerPerson(amountKurus, people);

  const resolvedName = name || `${formatDate(resolvedDate).split(' ').slice(-1)[0]} Buluşması`;

  const stepValid = isWizardStepValid(step, {
    eventDate: resolvedDate,
    cityId: resolvedCityId,
    estimatedPeople: Number(estimatedPeople) || 0,
    minPeople: Number(minPeople) || 0,
    maxPeople: Number(maxPeople) || 0,
    budgetAmount: amountKurus,
    categoryIds,
    name: resolvedName,
  });

  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  async function handleSubmit(asDraft: boolean) {
    setSubmitError(null);
    setSaving(true);

    try {
      const ctx = await getServiceContext();
      const plan = await createPlan(ctx, {
        ownerId: user!.id,
        ownerDisplayName: user!.displayName,
        name: resolvedName,
        cityId: resolvedCityId,
        districtId: districtId || null,
        eventDate: resolvedDate,
        startTime,
        endTime,
        isTimeFlexible,
        estimatedPeople: Number(estimatedPeople),
        minPeople: Number(minPeople),
        maxPeople: Number(maxPeople),
        budgetMode,
        budgetPerPerson: budgetMode === 'per_person' ? amountKurus : null,
        budgetTotal: budgetMode === 'total' ? amountKurus : null,
        note: note || null,
        categoryIds,
        preferenceKeys,
        asDraft,
      });

      router.replace(`/plan/${plan.id}`);
    } catch (cause) {
      setSubmitError(userMessageOf(cause));
    } finally {
      setSaving(false);
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
        <View style={{ gap: 8 }}>
          <Txt variant="small" color="secondary">
            Adım {step} / 7
          </Txt>
          <Progress value={wizardProgress(step)} />
          <Txt variant="h1">{STEP_TITLES[step - 1]}</Txt>
          <Txt variant="small" color="secondary">
            {STEP_HINTS[step - 1]}
          </Txt>
        </View>

        {submitError ? <Alert tone="error" message={submitError} /> : null}

        <Card>
          {/* --- Adım 1 ---------------------------------------------------- */}
          {step === 1 ? (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: 'Bu akşam', value: today },
                  { label: 'Yarın', value: addDays(today, 1) },
                  { label: 'Hafta sonu', value: nextWeekend(today) },
                ].map((option) => (
                  <Button
                    key={option.label}
                    title={option.label}
                    size="sm"
                    variant={resolvedDate === option.value ? 'primary' : 'secondary'}
                    onPress={() => setEventDate(option.value)}
                  />
                ))}
              </View>

              <Field
                label="Tarih (YYYY-AA-GG)"
                value={resolvedDate}
                onChangeText={setEventDate}
                placeholder="2026-08-14"
                keyboardType="numbers-and-punctuation"
                hint={formatDate(resolvedDate)}
              />

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIME_SLOT_PRESETS.map((slot) => (
                  <Button
                    key={slot.key}
                    title={slot.label}
                    size="sm"
                    variant={startTime === slot.startTime ? 'primary' : 'secondary'}
                    onPress={() => {
                      setStartTime(slot.startTime);
                      setEndTime(slot.endTime);
                    }}
                  />
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Başlangıç"
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="20:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Bitiş" value={endTime} onChangeText={setEndTime} placeholder="23:00" />
                </View>
              </View>

              <Button
                title={isTimeFlexible ? '✓ Saatim esnek' : 'Saatim esnek'}
                variant={isTimeFlexible ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setIsTimeFlexible((value) => !value)}
              />
            </>
          ) : null}

          {/* --- Adım 2 ---------------------------------------------------- */}
          {step === 2 ? (
            <>
              <Txt variant="small" style={{ fontWeight: '600' }}>
                Şehir
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {data.cities.map((city) => (
                  <Button
                    key={city.id}
                    title={city.name}
                    size="sm"
                    variant={resolvedCityId === city.id ? 'primary' : 'secondary'}
                    onPress={() => {
                      setCityId(city.id);
                      setDistrictId('');
                    }}
                  />
                ))}
              </View>

              <Txt variant="small" style={{ fontWeight: '600', marginTop: 8 }}>
                İlçe
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  title="Farketmez"
                  size="sm"
                  variant={districtId === '' ? 'primary' : 'secondary'}
                  onPress={() => setDistrictId('')}
                />
                {districts.map((district) => (
                  <Button
                    key={district.id}
                    title={district.name}
                    size="sm"
                    variant={districtId === district.id ? 'primary' : 'secondary'}
                    onPress={() => setDistrictId(district.id)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {/* --- Adım 3 ---------------------------------------------------- */}
          {step === 3 ? (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GROUP_SIZE_PRESETS.map((preset) => (
                  <Button
                    key={preset.key}
                    title={preset.label}
                    size="sm"
                    variant={
                      minPeople === String(preset.min) && maxPeople === String(preset.max)
                        ? 'primary'
                        : 'secondary'
                    }
                    onPress={() => {
                      setMinPeople(String(preset.min));
                      setMaxPeople(String(preset.max));
                      setEstimatedPeople(String(preset.estimated));
                    }}
                  />
                ))}
              </View>

              <Field
                label="Tahmini kişi sayısı"
                value={estimatedPeople}
                onChangeText={setEstimatedPeople}
                keyboardType="number-pad"
                hint="Fiyatlar bu sayıya göre hesaplanır."
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="En az"
                    value={minPeople}
                    onChangeText={setMinPeople}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="En fazla"
                    value={maxPeople}
                    onChangeText={setMaxPeople}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {!stepValid ? (
                <Alert
                  tone="warning"
                  message="Kişi sayıları tutarsız: en az ≤ tahmini ≤ en fazla olmalı."
                />
              ) : null}
            </>
          ) : null}

          {/* --- Adım 4 ---------------------------------------------------- */}
          {step === 4 ? (
            <>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  title="Kişi başı"
                  size="sm"
                  variant={budgetMode === 'per_person' ? 'primary' : 'secondary'}
                  onPress={() => setBudgetMode('per_person')}
                />
                <Button
                  title="Toplam"
                  size="sm"
                  variant={budgetMode === 'total' ? 'primary' : 'secondary'}
                  onPress={() => setBudgetMode('total')}
                />
              </View>

              <Field
                label={budgetMode === 'per_person' ? 'Kişi başı bütçe (₺)' : 'Toplam bütçe (₺)'}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="decimal-pad"
              />

              <Card flat style={{ backgroundColor: theme.colors.brandSurface }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Txt variant="h2" color="brand">
                      {formatCurrency(perPerson)}
                    </Txt>
                    <Txt variant="small" color="secondary">
                      kişi başı
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Txt variant="h2" color="brand">
                      {formatCurrency(total)}
                    </Txt>
                    <Txt variant="small" color="secondary">
                      toplam ({people} kişi)
                    </Txt>
                  </View>
                </View>
              </Card>
            </>
          ) : null}

          {/* --- Adım 5 ---------------------------------------------------- */}
          {step === 5 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {data.categories.map((category) => (
                <Button
                  key={category.id}
                  title={category.name}
                  size="sm"
                  variant={categoryIds.includes(category.id) ? 'primary' : 'secondary'}
                  onPress={() => setCategoryIds((list) => toggle(list, category.id))}
                />
              ))}
            </View>
          ) : null}

          {/* --- Adım 6 ---------------------------------------------------- */}
          {step === 6 ? (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {data.preferences
                  .filter(
                    (preference) =>
                      preference.categoryKey === null ||
                      data.categories.some(
                        (category) =>
                          categoryIds.includes(category.id) &&
                          category.key === preference.categoryKey,
                      ),
                  )
                  .map((preference) => (
                    <Button
                      key={preference.key}
                      title={preference.label}
                      size="sm"
                      variant={preferenceKeys.includes(preference.key) ? 'primary' : 'secondary'}
                      onPress={() => setPreferenceKeys((list) => toggle(list, preference.key))}
                    />
                  ))}
              </View>

              <Field
                label="Not (isteğe bağlı)"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                hint="Bu not davet kartında paylaşılmaz."
              />
            </>
          ) : null}

          {/* --- Adım 7 ---------------------------------------------------- */}
          {step === 7 ? (
            <>
              <Field
                label="Plan adı"
                value={resolvedName}
                onChangeText={setName}
                hint="Arkadaşlarının davet kartında göreceği başlık."
              />

              <View style={{ gap: 6, marginTop: 8 }}>
                {[
                  ['Tarih', formatDate(resolvedDate)],
                  ['Saat', `${startTime} – ${endTime}${isTimeFlexible ? ' (esnek)' : ''}`],
                  [
                    'Konum',
                    `${districts.find((d) => d.id === districtId)?.name ?? 'Farketmez'}, ${
                      data.cities.find((c) => c.id === resolvedCityId)?.name ?? ''
                    }`,
                  ],
                  ['Kişi', `${estimatedPeople} kişi (${minPeople}–${maxPeople})`],
                  [
                    'Bütçe',
                    `${formatCurrency(perPerson)} kişi başı · ${formatCurrency(total)} toplam`,
                  ],
                  [
                    'Aktivite',
                    data.categories
                      .filter((c) => categoryIds.includes(c.id))
                      .map((c) => c.name)
                      .join(', ') || '—',
                  ],
                ].map(([label, value]) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 12,
                      paddingBottom: 6,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.borderDefault,
                    }}
                  >
                    <Txt variant="small" color="secondary">
                      {label}
                    </Txt>
                    <Txt variant="small" style={{ flex: 1, textAlign: 'right' }}>
                      {value}
                    </Txt>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </Card>

        {/* --- Aksiyonlar ---------------------------------------------------- */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {step > 1 ? (
            <Button
              title="← Geri"
              variant="secondary"
              onPress={() => setStep((value) => value - 1)}
            />
          ) : null}
          <View style={{ flex: 1 }} />
          {step < 7 ? (
            <Button
              title="Devam et →"
              disabled={!stepValid}
              onPress={() => setStep((value) => Math.min(7, value + 1))}
            />
          ) : (
            <>
              <Button
                title="Taslak kaydet"
                variant="ghost"
                loading={saving}
                onPress={() => handleSubmit(true)}
              />
              <Button
                title="Planı oluştur"
                size="lg"
                loading={saving}
                disabled={!stepValid}
                onPress={() => handleSubmit(false)}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
