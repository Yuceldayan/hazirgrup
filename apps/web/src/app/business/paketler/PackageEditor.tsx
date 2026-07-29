'use client';

import { useActionState, useState } from 'react';
import {
  formatCurrency,
  kurusToLira,
  WEEKDAY_SHORT_LABELS,
  type BusinessBranch,
  type Category,
  type Preference,
  type VenuePackage,
  type Weekday,
} from '@hazirgrup/core';
import { Alert, Button, Card } from '@/components/ui';
import {
  FormError,
  FormSuccess,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from '@/components/ui/form';
import { togglePackageActiveAction, upsertPackageAction } from '@/server/actions/business';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/ui/ui.module.css';
import publicStyles from '@/components/public.module.css';

/** Hazır paket şablonları — işletmenin hızlı başlaması için (FR-8.2). */
const TEMPLATES = [
  {
    key: 'cafe_group',
    label: 'Kahve & tatlı paketi',
    name: '4–6 Kişilik Kahve ve Tatlı Paketi',
    description:
      'Arkadaş grubun için sıcak içecek ve paylaşımlık tatlı tabağı. Ayrı masa ayrılır.',
    minPeople: 4,
    maxPeople: 6,
    price: '180',
    pricingModel: 'per_person' as const,
    duration: '120',
    items: 'Kişi başı 2 sıcak içecek\nPaylaşımlık tatlı tabağı\nSınırsız su',
  },
  {
    key: 'dinner_group',
    label: 'Akşam yemeği paketi',
    name: '6–10 Kişilik Akşam Yemeği Paketi',
    description: 'Ana yemek, meze ve tatlıdan oluşan grup menüsü. Ayrı salonda servis edilir.',
    minPeople: 6,
    maxPeople: 10,
    price: '320',
    pricingModel: 'per_person' as const,
    duration: '150',
    items: 'Kişi başı ana yemek\nOrtaya 4 çeşit meze\nSalata\nTatlı\nİçecek',
  },
  {
    key: 'pitch_hour',
    label: 'Halı saha (1 saat)',
    name: '10–14 Kişilik Halı Saha (1 Saat)',
    description: '1 saatlik saha kiralama. Soyunma odası ve duş dahil.',
    minPeople: 10,
    maxPeople: 14,
    price: '900',
    pricingModel: 'total' as const,
    duration: '60',
    items: '1 saat saha\nSoyunma odası\nDuş\nSu',
  },
  {
    key: 'game_tournament',
    label: 'Oyun turnuvası',
    name: '4–8 Kişilik PlayStation Turnuvası',
    description: 'Konsol istasyonlarında turnuva düzeni, içecek dahil.',
    minPeople: 4,
    maxPeople: 8,
    price: '150',
    pricingModel: 'per_person' as const,
    duration: '180',
    items: '3 saat konsol kullanımı\nTurnuva fikstürü\nKişi başı içecek',
  },
  {
    key: 'birthday',
    label: 'Doğum günü paketi',
    name: '8–14 Kişilik Doğum Günü Paketi',
    description: 'Süsleme, pasta ve grup menüsü dahil doğum günü organizasyonu.',
    minPeople: 8,
    maxPeople: 14,
    price: '3800',
    pricingModel: 'total' as const,
    duration: '180',
    items: 'Masa süslemesi\nPasta\nKişi başı içecek\nAtıştırmalık tabağı\nMüzik sistemi',
  },
];

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function PackageEditor({
  branches,
  categories,
  preferences,
  editing,
}: {
  branches: BusinessBranch[];
  categories: Category[];
  preferences: Preference[];
  editing: VenuePackage | null;
}) {
  const [state, formAction] = useActionState(upsertPackageAction, EMPTY_ACTION_RESULT);
  const [template, setTemplate] = useState<(typeof TEMPLATES)[number] | null>(null);
  const [pricingModel, setPricingModel] = useState<'per_person' | 'total'>(
    editing?.pricingModel ?? 'per_person',
  );
  const [price, setPrice] = useState(
    editing ? String(kurusToLira(editing.priceAmount)) : '',
  );

  const defaults = editing
    ? {
        name: editing.name,
        description: editing.description,
        minPeople: String(editing.minPeople),
        maxPeople: String(editing.maxPeople),
        duration: editing.durationMinutes ? String(editing.durationMinutes) : '',
        items: editing.items.map((i) => i.label).join('\n'),
        branchId: editing.branchId,
        categoryId: editing.categoryId,
        reservationTerms: editing.reservationTerms ?? '',
        cancellationTerms: editing.cancellationTerms ?? '',
      }
    : template
      ? {
          name: template.name,
          description: template.description,
          minPeople: String(template.minPeople),
          maxPeople: String(template.maxPeople),
          duration: template.duration,
          items: template.items,
          branchId: branches[0]?.id ?? '',
          categoryId: categories[0]?.id ?? '',
          reservationTerms: 'Rezervasyon en az 2 saat önce yapılmalıdır.',
          cancellationTerms: 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal.',
        }
      : {
          name: '',
          description: '',
          minPeople: '4',
          maxPeople: '8',
          duration: '120',
          items: '',
          branchId: branches[0]?.id ?? '',
          categoryId: categories[0]?.id ?? '',
          reservationTerms: '',
          cancellationTerms: '',
        };

  const priceKurus = Math.round((Number(price.replace(',', '.')) || 0) * 100);
  const previewPeople = Number(defaults.maxPeople) || 1;
  const previewPerPerson =
    pricingModel === 'per_person' ? priceKurus : Math.ceil(priceKurus / previewPeople);

  const selectedDays = editing
    ? new Set(editing.availability.map((a) => a.weekday))
    : new Set(WEEKDAYS);

  return (
    <Card>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        {editing ? 'Paketi düzenle' : 'Yeni paket oluştur'}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        {editing
          ? 'Değişiklikler kaydedildiğinde public sayfada da güncellenir.'
          : 'Hazır şablondan başlayabilir veya sıfırdan oluşturabilirsin.'}
      </p>

      {!editing ? (
        <div className={publicStyles.chipRow} style={{ marginBottom: 20 }}>
          {TEMPLATES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={publicStyles.chip}
              onClick={() => {
                setTemplate(item);
                setPricingModel(item.pricingModel);
                setPrice(item.price);
              }}
              aria-pressed={template?.key === item.key}
              style={
                template?.key === item.key
                  ? {
                      borderColor: 'var(--color-brand-default)',
                      background: 'var(--color-brand-surface)',
                      color: 'var(--color-brand-text)',
                      fontWeight: 600,
                    }
                  : undefined
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <form
        action={formAction}
        key={template?.key ?? editing?.id ?? 'new'}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <FormError message={state.message && !state.ok ? state.message : null} />
        <FormSuccess message={state.ok ? state.message : null} />

        <TextInput
          label="Paket adı"
          name="name"
          defaultValue={defaults.name}
          required
          maxLength={120}
          hint="Kişi sayısını içeren adlar daha çok tıklanır: “6–10 Kişilik Akşam Yemeği Paketi”."
          {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
        />

        <TextArea
          label="Açıklama"
          name="description"
          defaultValue={defaults.description}
          required
          maxLength={1000}
          {...(state.fieldErrors?.description ? { error: state.fieldErrors.description } : {})}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            label="Şube"
            name="branchId"
            defaultValue={defaults.branchId}
            required
            options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
          />
          <Select
            label="Kategori"
            name="categoryId"
            defaultValue={defaults.categoryId}
            required
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <TextInput
            label="En az kişi"
            name="minPeople"
            type="number"
            min={1}
            defaultValue={defaults.minPeople}
            required
          />
          <TextInput
            label="En fazla kişi"
            name="maxPeople"
            type="number"
            min={1}
            defaultValue={defaults.maxPeople}
            required
            {...(state.fieldErrors?.maxPeople ? { error: state.fieldErrors.maxPeople } : {})}
          />
        </div>

        <Select
          label="Fiyatlandırma modeli"
          name="pricingModel"
          value={pricingModel}
          onChange={(event) => setPricingModel(event.target.value as 'per_person' | 'total')}
          options={[
            { value: 'per_person', label: 'Kişi başı fiyat' },
            { value: 'total', label: 'Sabit toplam fiyat' },
          ]}
          hint="Sabit toplamda kişi sayısı arttıkça müşterinin kişi başı maliyeti azalır."
        />

        <TextInput
          label={pricingModel === 'per_person' ? 'Kişi başı fiyat (₺)' : 'Toplam fiyat (₺)'}
          name="price"
          type="number"
          inputMode="decimal"
          min={1}
          step={10}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
          {...(state.fieldErrors?.priceAmount ? { error: state.fieldErrors.priceAmount } : {})}
        />

        {priceKurus > 0 ? (
          <Alert tone="info">
            Müşteri {previewPeople} kişilik grup için kişi başı{' '}
            <strong>{formatCurrency(previewPerPerson)}</strong> görecek.
          </Alert>
        ) : null}

        <TextInput
          label="Süre (dakika)"
          name="durationMinutes"
          type="number"
          min={15}
          max={720}
          defaultValue={defaults.duration}
          hint="Boş bırakabilirsin."
        />

        <TextArea
          label="Paket içeriği"
          name="items"
          defaultValue={defaults.items}
          required
          rows={6}
          hint="Her satıra bir madde yaz. Bu maddeler paket sayfasında listelenir."
          {...(state.fieldErrors?.items ? { error: state.fieldErrors.items } : {})}
        />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className={styles.label} style={{ marginBottom: 8 }}>
            Geçerli günler
          </legend>
          <div className={styles.choiceGroup}>
            {WEEKDAYS.map((weekday) => (
              <label key={weekday} className={styles.choice}>
                <input
                  type="checkbox"
                  name={`day-${weekday}`}
                  defaultChecked={selectedDays.has(weekday)}
                />
                <span>{WEEKDAY_SHORT_LABELS[weekday]}</span>
              </label>
            ))}
          </div>
          {state.fieldErrors?.availability ? (
            <p className={styles.errorText} style={{ marginTop: 6 }} role="alert">
              <span aria-hidden="true">⚠</span>
              {state.fieldErrors.availability}
            </p>
          ) : null}
        </fieldset>

        <div style={{ display: 'flex', gap: 12 }}>
          <TextInput
            label="Geçerlilik başlangıcı"
            name="availStart"
            type="time"
            defaultValue={editing?.availability[0]?.startTime ?? '12:00'}
          />
          <TextInput
            label="Geçerlilik bitişi"
            name="availEnd"
            type="time"
            defaultValue={editing?.availability[0]?.endTime ?? '23:00'}
          />
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className={styles.label} style={{ marginBottom: 8 }}>
            Özellikler (isteğe bağlı)
          </legend>
          <div className={styles.choiceGroup}>
            {preferences.map((preference) => (
              <label key={preference.key} className={styles.choice}>
                <input
                  type="checkbox"
                  name="preferenceKeys"
                  value={preference.key}
                  defaultChecked={editing?.preferenceKeys.includes(preference.key)}
                />
                <span>{preference.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <TextArea
          label="Rezervasyon şartı"
          name="reservationTerms"
          defaultValue={defaults.reservationTerms}
          maxLength={500}
        />
        <TextArea
          label="İptal şartı"
          name="cancellationTerms"
          defaultValue={defaults.cancellationTerms}
          maxLength={500}
        />

        <div className={styles.choiceGroup}>
          <label className={styles.choice}>
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
            <span>Rezervasyona açık</span>
          </label>
          <label className={styles.choice}>
            <input type="checkbox" name="isPublic" defaultChecked={editing?.isPublic ?? true} />
            <span>Public sayfalarda göster</span>
          </label>
        </div>

        <SubmitButton size="lg" pendingLabel="Kaydediliyor…">
          {editing ? 'Değişiklikleri kaydet' : 'Paketi oluştur'}
        </SubmitButton>
      </form>
    </Card>
  );
}

/** Paketi yayına alma / kapatma düğmesi. */
export function TogglePackageButton({
  packageId,
  isActive,
}: {
  packageId: string;
  isActive: boolean;
}) {
  const [state, formAction] = useActionState(togglePackageActiveAction, EMPTY_ACTION_RESULT);

  return (
    <form action={formAction} style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      <input type="hidden" name="packageId" value={packageId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <Button type="submit" size="sm" variant={isActive ? 'secondary' : 'primary'}>
        {isActive ? 'Rezervasyona kapat' : 'Yayına al'}
      </Button>
      {state.message && !state.ok ? (
        <span style={{ fontSize: 12, color: 'var(--color-danger-text)' }}>{state.message}</span>
      ) : null}
    </form>
  );
}
