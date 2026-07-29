'use client';

import { useActionState, useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDays,
  formatCurrency,
  formatDate,
  GROUP_SIZE_PRESETS,
  nextWeekend,
  perPersonFromTotal,
  TIME_SLOT_PRESETS,
  totalFromPerPerson,
  type Category,
  type City,
  type District,
  type Preference,
} from '@hazirgrup/core';
import { Alert, Button, Card, Progress } from '@/components/ui';
import { FormError, SubmitButton, TextArea, TextInput } from '@/components/ui/form';
import { createPlanAction } from '@/server/actions/plan';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from './wizard.module.css';

/**
 * 7 adımlı plan sihirbazı (docs/USER_FLOWS.md §B).
 *
 * - Her adımda ilerleme göstergesi, geri butonu ve yardımcı metin bulunur.
 * - Girilen değerler `localStorage`'a yazılır: sayfa kapansa bile veri kaybolmaz
 *   (docs/PRODUCT_REQUIREMENTS.md FR-3.6, NFR-8).
 * - Bütçe iki yönlü canlı hesaplanır.
 */

const STORAGE_KEY = 'hg-plan-taslak';
const TOTAL_STEPS = 7;

interface WizardState {
  name: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  isTimeFlexible: boolean;
  cityId: string;
  districtId: string;
  estimatedPeople: string;
  minPeople: string;
  maxPeople: string;
  budgetMode: 'per_person' | 'total';
  budgetAmount: string;
  categoryIds: string[];
  preferenceKeys: string[];
  note: string;
}

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
  'Katılım netleşmemişse geniş bir aralık ver; fiyatlar kişi sayısına göre güncellenir.',
  'Kişi başı veya toplam bütçe gir; diğeri otomatik hesaplanır.',
  'Birden fazla seçebilirsin; seçenekleri yan yana karşılaştırırsın.',
  'Tercihler zorunlu değildir, eşleşmeyi iyileştirir.',
  'Her şey doğruysa planı oluştur ve arkadaşlarını davet et.',
];

export function PlanWizard({
  cities,
  districtsByCity,
  categories,
  preferences,
  today,
  defaultCityId,
  defaultDistrictId,
  preselectedCategoryId,
  suggestedName,
}: {
  cities: City[];
  districtsByCity: Record<string, District[]>;
  categories: Category[];
  preferences: Preference[];
  today: string;
  defaultCityId: string | null;
  defaultDistrictId: string | null;
  preselectedCategoryId: string | null;
  suggestedName: string;
}) {
  const [state, formAction] = useActionState(createPlanAction, EMPTY_ACTION_RESULT);
  const [step, setStep] = useState(1);
  const [restored, setRestored] = useState(false);

  const [data, setData] = useState<WizardState>({
    name: suggestedName,
    eventDate: addDays(today, 1),
    startTime: '20:00',
    endTime: '23:00',
    isTimeFlexible: true,
    cityId: defaultCityId ?? cities[0]?.id ?? '',
    districtId: defaultDistrictId ?? '',
    estimatedPeople: '6',
    minPeople: '5',
    maxPeople: '8',
    budgetMode: 'per_person',
    budgetAmount: '250',
    categoryIds: preselectedCategoryId ? [preselectedCategoryId] : [],
    preferenceKeys: [],
    note: '',
  });

  // --- Taslak: yükleme --------------------------------------------------
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WizardState>;
        setData((current) => ({ ...current, ...parsed }));
        setRestored(true);
      }
    } catch {
      // Bozuk taslak yok sayılır.
    }
  }, []);

  // --- Taslak: kaydetme --------------------------------------------------
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Depolama kotası dolabilir; akış bozulmaz.
    }
  }, [data]);

  const update = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  }, []);

  const districts = districtsByCity[data.cityId] ?? [];

  // --- Bütçe hesabı ------------------------------------------------------
  const people = Math.max(1, Number(data.estimatedPeople) || 1);
  const amountKurus = Math.round((Number(data.budgetAmount.replace(',', '.')) || 0) * 100);
  const perPerson =
    data.budgetMode === 'per_person' ? amountKurus : perPersonFromTotal(amountKurus, people);
  const total =
    data.budgetMode === 'total' ? amountKurus : totalFromPerPerson(amountKurus, people);

  const selectedCity = cities.find((c) => c.id === data.cityId);
  const selectedDistrict = districts.find((d) => d.id === data.districtId);
  const selectedCategories = categories.filter((c) => data.categoryIds.includes(c.id));

  const stepValid = useMemo(() => {
    switch (step) {
      case 1:
        return Boolean(data.eventDate);
      case 2:
        return Boolean(data.cityId);
      case 3:
        return (
          Number(data.minPeople) >= 1 &&
          Number(data.minPeople) <= Number(data.estimatedPeople) &&
          Number(data.estimatedPeople) <= Number(data.maxPeople)
        );
      case 4:
        return amountKurus > 0;
      case 5:
        return data.categoryIds.length > 0;
      case 6:
        return true;
      case 7:
        return data.name.trim().length >= 3;
      default:
        return true;
    }
  }, [step, data, amountKurus]);

  const relevantPreferences = preferences.filter(
    (preference) =>
      preference.categoryKey === null ||
      selectedCategories.some((category) => category.key === preference.categoryKey),
  );

  function toggleArrayValue(key: 'categoryIds' | 'preferenceKeys', value: string) {
    setData((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.header}>
        <div className={styles.stepMeta}>
          <span>
            Adım {step} / {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={step} max={TOTAL_STEPS} />
        <h1 className={styles.stepTitle}>{STEP_TITLES[step - 1]}</h1>
        <p className={styles.stepHint}>{STEP_HINTS[step - 1]}</p>
      </div>

      {restored && step === 1 ? (
        <Alert tone="info" title="Yarım kalan planın yüklendi">
          Önceki bilgilerin geri getirildi. Sıfırdan başlamak istersen aşağıdaki alanları
          değiştirebilirsin.
        </Alert>
      ) : null}

      <form action={formAction}>
        {/* Tüm adımların değerleri gizli alanlarla gönderilir. */}
        <input type="hidden" name="name" value={data.name} />
        <input type="hidden" name="eventDate" value={data.eventDate} />
        <input type="hidden" name="startTime" value={data.startTime} />
        <input type="hidden" name="endTime" value={data.endTime} />
        {data.isTimeFlexible ? <input type="hidden" name="isTimeFlexible" value="on" /> : null}
        <input type="hidden" name="cityId" value={data.cityId} />
        <input type="hidden" name="districtId" value={data.districtId} />
        <input type="hidden" name="estimatedPeople" value={data.estimatedPeople} />
        <input type="hidden" name="minPeople" value={data.minPeople} />
        <input type="hidden" name="maxPeople" value={data.maxPeople} />
        <input type="hidden" name="budgetMode" value={data.budgetMode} />
        <input type="hidden" name="budgetAmount" value={data.budgetAmount} />
        {data.categoryIds.map((id) => (
          <input key={id} type="hidden" name="categoryIds" value={id} />
        ))}
        {data.preferenceKeys.map((key) => (
          <input key={key} type="hidden" name="preferenceKeys" value={key} />
        ))}
        <input type="hidden" name="note" value={data.note} />

        <Card>
          <div className={styles.body}>
            <FormError message={state.message && !state.ok ? state.message : null} />

            {/* --- Adım 1: Ne zaman? ------------------------------------- */}
            {step === 1 ? (
              <>
                <div className={styles.quickRow}>
                  {[
                    { label: 'Bu akşam', date: today },
                    { label: 'Yarın', date: addDays(today, 1) },
                    { label: 'Hafta sonu', date: nextWeekend(today) },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={`${styles.quickButton} ${data.eventDate === option.date ? styles.quickButtonActive : ''}`}
                      onClick={() => update('eventDate', option.date)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <TextInput
                  label="Tarih"
                  name="eventDateInput"
                  type="date"
                  min={today}
                  value={data.eventDate}
                  onChange={(event) => update('eventDate', event.target.value)}
                  hint={data.eventDate ? formatDate(data.eventDate) : undefined}
                  required
                />

                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Saat aralığı</p>
                  <div className={styles.quickRow}>
                    {TIME_SLOT_PRESETS.map((slot) => (
                      <button
                        key={slot.key}
                        type="button"
                        className={`${styles.quickButton} ${
                          data.startTime === slot.startTime && data.endTime === slot.endTime
                            ? styles.quickButtonActive
                            : ''
                        }`}
                        onClick={() => {
                          update('startTime', slot.startTime);
                          update('endTime', slot.endTime);
                        }}
                      >
                        {slot.label} · {slot.startTime}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <TextInput
                    label="Başlangıç"
                    name="startTimeInput"
                    type="time"
                    value={data.startTime}
                    onChange={(event) => update('startTime', event.target.value)}
                  />
                  <TextInput
                    label="Bitiş"
                    name="endTimeInput"
                    type="time"
                    value={data.endTime}
                    onChange={(event) => update('endTime', event.target.value)}
                  />
                </div>

                <label className={styles.optionCard} style={{ minHeight: 'auto' }}>
                  <input
                    type="checkbox"
                    checked={data.isTimeFlexible}
                    onChange={(event) => update('isTimeFlexible', event.target.checked)}
                  />
                  <span className={styles.optionTitle}>Saatim esnek</span>
                  <span className={styles.optionHint}>
                    ±90 dakikaya kadar farklı saatlerdeki paketler de listelenir.
                  </span>
                </label>
              </>
            ) : null}

            {/* --- Adım 2: Nerede? ---------------------------------------- */}
            {step === 2 ? (
              <>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Şehir</p>
                  <div className={styles.optionGrid}>
                    {cities.map((city) => (
                      <label key={city.id} className={styles.optionCard}>
                        <input
                          type="radio"
                          name="cityChoice"
                          checked={data.cityId === city.id}
                          onChange={() => {
                            update('cityId', city.id);
                            update('districtId', '');
                          }}
                        />
                        <span className={styles.optionTitle}>{city.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>İlçe</p>
                  <div className={styles.optionGrid}>
                    <label className={styles.optionCard}>
                      <input
                        type="radio"
                        name="districtChoice"
                        checked={data.districtId === ''}
                        onChange={() => update('districtId', '')}
                      />
                      <span className={styles.optionTitle}>Farketmez</span>
                      <span className={styles.optionHint}>Şehirdeki tüm paketler</span>
                    </label>
                    {districts.map((district) => (
                      <label key={district.id} className={styles.optionCard}>
                        <input
                          type="radio"
                          name="districtChoice"
                          checked={data.districtId === district.id}
                          onChange={() => update('districtId', district.id)}
                        />
                        <span className={styles.optionTitle}>{district.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {/* --- Adım 3: Kaç kişi? -------------------------------------- */}
            {step === 3 ? (
              <>
                <div className={styles.quickRow}>
                  {GROUP_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      className={`${styles.quickButton} ${
                        data.minPeople === String(preset.min) &&
                        data.maxPeople === String(preset.max)
                          ? styles.quickButtonActive
                          : ''
                      }`}
                      onClick={() => {
                        update('minPeople', String(preset.min));
                        update('maxPeople', String(preset.max));
                        update('estimatedPeople', String(preset.estimated));
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <TextInput
                  label="Tahmini kişi sayısı"
                  name="estimatedPeopleInput"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={200}
                  value={data.estimatedPeople}
                  onChange={(event) => update('estimatedPeople', event.target.value)}
                  hint="Fiyatlar bu sayıya göre hesaplanır; katılım netleştikçe güncellenir."
                  required
                />

                <div style={{ display: 'flex', gap: 12 }}>
                  <TextInput
                    label="En az"
                    name="minPeopleInput"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={data.minPeople}
                    onChange={(event) => update('minPeople', event.target.value)}
                  />
                  <TextInput
                    label="En fazla"
                    name="maxPeopleInput"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={data.maxPeople}
                    onChange={(event) => update('maxPeople', event.target.value)}
                  />
                </div>

                {!stepValid ? (
                  <Alert tone="warning">
                    Kişi sayıları tutarsız: en az ≤ tahmini ≤ en fazla olmalı.
                  </Alert>
                ) : null}
              </>
            ) : null}

            {/* --- Adım 4: Bütçe ------------------------------------------ */}
            {step === 4 ? (
              <>
                <div className={styles.quickRow}>
                  <button
                    type="button"
                    className={`${styles.quickButton} ${data.budgetMode === 'per_person' ? styles.quickButtonActive : ''}`}
                    onClick={() => update('budgetMode', 'per_person')}
                  >
                    Kişi başı bütçe
                  </button>
                  <button
                    type="button"
                    className={`${styles.quickButton} ${data.budgetMode === 'total' ? styles.quickButtonActive : ''}`}
                    onClick={() => update('budgetMode', 'total')}
                  >
                    Toplam bütçe
                  </button>
                </div>

                <TextInput
                  label={data.budgetMode === 'per_person' ? 'Kişi başı bütçe (₺)' : 'Toplam bütçe (₺)'}
                  name="budgetAmountInput"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={10}
                  value={data.budgetAmount}
                  onChange={(event) => update('budgetAmount', event.target.value)}
                  required
                />

                <div className={styles.calcBox}>
                  <div className={styles.calcRow}>
                    <div>
                      <p className={styles.calcValue}>{formatCurrency(perPerson)}</p>
                      <p className={styles.calcLabel}>kişi başı</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className={styles.calcValue}>{formatCurrency(total)}</p>
                      <p className={styles.calcLabel}>toplam ({people} kişi)</p>
                    </div>
                  </div>
                  <p className={styles.calcNote}>
                    Bütçeni %15&apos;e kadar aşan paketler de gösterilir; aşım miktarı kart
                    üzerinde açıkça belirtilir.
                  </p>
                </div>
              </>
            ) : null}

            {/* --- Adım 5: Kategoriler ------------------------------------ */}
            {step === 5 ? (
              <div className={styles.optionGrid}>
                {categories.map((category) => (
                  <label key={category.id} className={styles.optionCard}>
                    <input
                      type="checkbox"
                      checked={data.categoryIds.includes(category.id)}
                      onChange={() => toggleArrayValue('categoryIds', category.id)}
                    />
                    <span className={styles.optionTitle}>{category.name}</span>
                  </label>
                ))}
                {data.categoryIds.length === 0 ? (
                  <p style={{ gridColumn: '1 / -1', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    Devam etmek için en az bir aktivite türü seç.
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* --- Adım 6: Tercihler -------------------------------------- */}
            {step === 6 ? (
              <>
                <div className={styles.quickRow}>
                  {relevantPreferences.map((preference) => (
                    <button
                      key={preference.key}
                      type="button"
                      className={`${styles.quickButton} ${
                        data.preferenceKeys.includes(preference.key)
                          ? styles.quickButtonActive
                          : ''
                      }`}
                      onClick={() => toggleArrayValue('preferenceKeys', preference.key)}
                      aria-pressed={data.preferenceKeys.includes(preference.key)}
                    >
                      {preference.label}
                    </button>
                  ))}
                </div>

                <TextArea
                  label="Not (isteğe bağlı)"
                  name="noteInput"
                  maxLength={500}
                  value={data.note}
                  onChange={(event) => update('note', event.target.value)}
                  hint="Bu not yalnızca sende ve rezervasyon talebinde görünür; davet kartında paylaşılmaz."
                  placeholder="Örnek: Ayrı salon olursa süper olur."
                />
              </>
            ) : null}

            {/* --- Adım 7: Özet ------------------------------------------- */}
            {step === 7 ? (
              <>
                <TextInput
                  label="Plan adı"
                  name="nameInput"
                  value={data.name}
                  onChange={(event) => update('name', event.target.value)}
                  maxLength={80}
                  required
                  hint="Arkadaşlarının davet kartında göreceği başlık."
                  {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
                />

                <div className={styles.summaryList}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Tarih</span>
                    <span className={styles.summaryValue}>{formatDate(data.eventDate)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Saat</span>
                    <span className={styles.summaryValue}>
                      {data.startTime} – {data.endTime}
                      {data.isTimeFlexible ? ' (esnek)' : ''}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Konum</span>
                    <span className={styles.summaryValue}>
                      {selectedDistrict ? `${selectedDistrict.name}, ` : ''}
                      {selectedCity?.name ?? '—'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Kişi sayısı</span>
                    <span className={styles.summaryValue}>
                      {data.estimatedPeople} kişi ({data.minPeople}–{data.maxPeople})
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Bütçe</span>
                    <span className={styles.summaryValue}>
                      {formatCurrency(perPerson)} kişi başı · {formatCurrency(total)} toplam
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Aktivite</span>
                    <span className={styles.summaryValue}>
                      {selectedCategories.map((c) => c.name).join(', ') || '—'}
                    </span>
                  </div>
                  {data.preferenceKeys.length > 0 ? (
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Tercihler</span>
                      <span className={styles.summaryValue}>
                        {preferences
                          .filter((p) => data.preferenceKeys.includes(p.key))
                          .map((p) => p.label)
                          .join(', ')}
                      </span>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          {/* --- Aksiyonlar ---------------------------------------------- */}
          <div className={styles.actions}>
            {step > 1 ? (
              <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
                ← Geri
              </Button>
            ) : null}

            <span className={styles.actionsSpacer} />

            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                disabled={!stepValid}
              >
                Devam et →
              </Button>
            ) : (
              <>
                <button
                  type="submit"
                  name="asDraft"
                  value="true"
                  className="hg-draft-button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    fontSize: 14,
                    textDecoration: 'underline',
                    minHeight: 44,
                    padding: '0 8px',
                  }}
                >
                  Taslak olarak kaydet
                </button>
                <SubmitButton size="lg" pendingLabel="Oluşturuluyor…" disabled={!stepValid}>
                  Planı oluştur
                </SubmitButton>
              </>
            )}
          </div>
        </Card>
      </form>

      <p className={styles.draftNote}>
        Girdiğin bilgiler bu cihazda otomatik kaydedilir; sayfayı kapatsan bile kaybolmaz.
      </p>
    </div>
  );
}
