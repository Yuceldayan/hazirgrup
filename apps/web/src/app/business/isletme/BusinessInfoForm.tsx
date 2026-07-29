'use client';

import { useActionState } from 'react';
import { FormError, FormSuccess, SubmitButton, TextArea, TextInput } from '@/components/ui/form';
import { updateBusinessAction } from '@/server/actions/business';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function BusinessInfoForm({
  defaultValues,
}: {
  defaultValues: {
    name: string;
    description: string;
    phone: string;
    whatsapp: string;
    website: string;
    instagram: string;
  };
}) {
  const [state, formAction] = useActionState(updateBusinessAction, EMPTY_ACTION_RESULT);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormError message={state.message && !state.ok ? state.message : null} />
      <FormSuccess message={state.ok ? state.message : null} />

      <TextInput
        label="İşletme adı"
        name="name"
        defaultValue={defaultValues.name}
        required
        {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
      />

      <TextArea
        label="Açıklama"
        name="description"
        defaultValue={defaultValues.description}
        required
        rows={5}
        maxLength={1000}
        hint="Müşterilerin sizi neden tercih etmesi gerektiğini anlatın. En az 20 karakter."
        {...(state.fieldErrors?.description ? { error: state.fieldErrors.description } : {})}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <TextInput
          label="Telefon"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaultValues.phone}
          required
          {...(state.fieldErrors?.phone ? { error: state.fieldErrors.phone } : {})}
        />
        <TextInput
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          defaultValue={defaultValues.whatsapp}
        />
      </div>

      <TextInput
        label="Web sitesi"
        name="website"
        type="url"
        defaultValue={defaultValues.website}
        placeholder="https://"
        {...(state.fieldErrors?.website ? { error: state.fieldErrors.website } : {})}
      />

      <TextInput label="Instagram" name="instagram" defaultValue={defaultValues.instagram} />

      <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri kaydet</SubmitButton>
    </form>
  );
}
