'use client';

import { useActionState, useState } from 'react';
import type { City, District } from '@hazirgrup/core';
import { Alert, Card } from '@/components/ui';
import { FormError, FormSuccess, Select, SubmitButton, TextInput } from '@/components/ui/form';
import { deleteAccountAction, updateProfileAction } from '@/server/actions/account';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function ProfileForm({
  cities,
  districtsByCity,
  defaultValues,
}: {
  cities: City[];
  districtsByCity: Record<string, District[]>;
  defaultValues: {
    displayName: string;
    phone: string;
    cityId: string;
    districtId: string;
  };
}) {
  const [state, formAction] = useActionState(updateProfileAction, EMPTY_ACTION_RESULT);
  const [cityId, setCityId] = useState(defaultValues.cityId);

  const districts = districtsByCity[cityId] ?? [];

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormError message={state.message && !state.ok ? state.message : null} />
      <FormSuccess message={state.ok ? state.message : null} />

      <TextInput
        label="Görünen ad"
        name="displayName"
        defaultValue={defaultValues.displayName}
        required
        hint="Planlarda arkadaşlarının göreceği isim."
        {...(state.fieldErrors?.displayName ? { error: state.fieldErrors.displayName } : {})}
      />

      <TextInput
        label="Telefon (isteğe bağlı)"
        name="phone"
        type="tel"
        inputMode="tel"
        defaultValue={defaultValues.phone}
        placeholder="0555 111 22 33"
        hint="Yalnızca rezervasyon gönderdiğinde ilgili işletmeyle paylaşılır."
        {...(state.fieldErrors?.phone ? { error: state.fieldErrors.phone } : {})}
      />

      <Select
        label="Şehir"
        name="cityId"
        value={cityId}
        onChange={(event) => setCityId(event.target.value)}
        placeholder="Seçilmedi"
        options={cities.map((city) => ({ value: city.id, label: city.name }))}
      />

      <Select
        label="İlçe"
        name="districtId"
        defaultValue={defaultValues.districtId}
        placeholder="Farketmez"
        options={districts.map((district) => ({ value: district.id, label: district.name }))}
        hint="Plan oluştururken varsayılan olarak seçilir."
      />

      <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri kaydet</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccountAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-danger-text)' }}>
        Hesabı sil
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        Hesabını silmen 30 gün içinde geri alınabilir. Süre sonunda kişisel verilerin kalıcı
        olarak silinir veya anonimleştirilir.
      </p>

      <details>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--color-danger-text)',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Hesabımı silmek istiyorum
        </summary>

        <form
          action={formAction}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
        >
          <FormError message={state.message && !state.ok ? state.message : null} />

          <Alert tone="warning" title="Verilerine ne olacak?">
            Profil bilgilerin silinir · Planların anonimleştirilir · Oyların anonim sayılır ·
            Rezervasyon kayıtları ticari kayıt olarak maskelenmiş şekilde saklanır.
          </Alert>

          <TextInput
            label='Onaylamak için "HESABIMI SİL" yaz'
            name="confirmation"
            required
            placeholder="HESABIMI SİL"
            {...(state.fieldErrors?.confirmation ? { error: state.fieldErrors.confirmation } : {})}
          />

          <SubmitButton variant="danger" pendingLabel="Siliniyor…">
            Hesabımı kalıcı olarak sil
          </SubmitButton>
        </form>
      </details>
    </Card>
  );
}
