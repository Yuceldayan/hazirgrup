'use client';

import { useActionState, useState } from 'react';
import {
  WEEKDAY_LABELS,
  type BusinessBranch,
  type City,
  type District,
  type Weekday,
} from '@hazirgrup/core';
import { Card } from '@/components/ui';
import {
  FormError,
  FormSuccess,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from '@/components/ui/form';
import { upsertBranchAction } from '@/server/actions/business';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/ui/ui.module.css';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function BranchEditor({
  cities,
  districtsByCity,
  editing,
}: {
  cities: City[];
  districtsByCity: Record<string, District[]>;
  editing: BusinessBranch | null;
}) {
  const [state, formAction] = useActionState(upsertBranchAction, EMPTY_ACTION_RESULT);
  const [cityId, setCityId] = useState(editing?.cityId ?? cities[0]?.id ?? '');

  const districts = districtsByCity[cityId] ?? [];

  return (
    <Card>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        {editing ? 'Şubeyi düzenle' : 'Yeni şube ekle'}
      </h2>

      <form
        action={formAction}
        key={editing?.id ?? 'new'}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <FormError message={state.message && !state.ok ? state.message : null} />
        <FormSuccess message={state.ok ? state.message : null} />

        <TextInput
          label="Şube adı"
          name="name"
          defaultValue={editing?.name ?? ''}
          required
          placeholder="Örnek: Merkez Şube"
          {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            label="Şehir"
            name="cityId"
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
            required
            options={cities.map((city) => ({ value: city.id, label: city.name }))}
          />
          <Select
            label="İlçe"
            name="districtId"
            defaultValue={editing?.districtId ?? ''}
            required
            placeholder="İlçe seç"
            options={districts.map((district) => ({
              value: district.id,
              label: district.name,
            }))}
            {...(state.fieldErrors?.districtId ? { error: state.fieldErrors.districtId } : {})}
          />
        </div>

        <TextArea
          label="Açık adres"
          name="address"
          defaultValue={editing?.address ?? ''}
          required
          maxLength={300}
          {...(state.fieldErrors?.address ? { error: state.fieldErrors.address } : {})}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <TextInput
            label="Telefon"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={editing?.phone ?? ''}
            placeholder="0555 111 22 33"
          />
          <TextInput
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={editing?.whatsapp ?? ''}
          />
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className={styles.label} style={{ marginBottom: 8 }}>
            Çalışma saatleri
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WEEKDAYS.map((weekday) => {
              const existing = editing?.hours.find((h) => h.weekday === weekday);
              return (
                <div
                  key={weekday}
                  style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <span style={{ width: 88, fontSize: 13 }}>{WEEKDAY_LABELS[weekday]}</span>
                  <input
                    type="time"
                    name={`opens-${weekday}`}
                    defaultValue={existing?.opensAt ?? '10:00'}
                    className={styles.input}
                    style={{ width: 120, minHeight: 40 }}
                    aria-label={`${WEEKDAY_LABELS[weekday]} açılış saati`}
                  />
                  <input
                    type="time"
                    name={`closes-${weekday}`}
                    defaultValue={existing?.closesAt ?? '23:00'}
                    className={styles.input}
                    style={{ width: 120, minHeight: 40 }}
                    aria-label={`${WEEKDAY_LABELS[weekday]} kapanış saati`}
                  />
                  <label className={styles.choice} style={{ minHeight: 40, padding: '6px 12px' }}>
                    <input
                      type="checkbox"
                      name={`closed-${weekday}`}
                      defaultChecked={existing?.isClosed ?? false}
                    />
                    <span style={{ fontSize: 13 }}>Kapalı</span>
                  </label>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Gece yarısını aşan saatler desteklenir (örn. 10:00 – 01:00).
          </p>
        </fieldset>

        <label className={styles.choice}>
          <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
          <span>Şube aktif</span>
        </label>

        <SubmitButton size="lg" pendingLabel="Kaydediliyor…">
          {editing ? 'Değişiklikleri kaydet' : 'Şubeyi ekle'}
        </SubmitButton>
      </form>
    </Card>
  );
}
