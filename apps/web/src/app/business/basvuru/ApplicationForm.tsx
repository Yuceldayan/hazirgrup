'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { Category, City, District } from '@hazirgrup/core';
import { Card } from '@/components/ui';
import {
  FormError,
  FormSuccess,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from '@/components/ui/form';
import { submitApplicationAction } from '@/server/actions/business';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/ui/ui.module.css';

export function ApplicationForm({
  cities,
  districtsByCity,
  categories,
  defaultEmail,
  defaultName,
}: {
  cities: City[];
  districtsByCity: Record<string, District[]>;
  categories: Category[];
  defaultEmail: string;
  defaultName: string;
}) {
  const [state, formAction] = useActionState(submitApplicationAction, EMPTY_ACTION_RESULT);
  const [cityId, setCityId] = useState(cities[0]?.id ?? '');

  const districts = districtsByCity[cityId] ?? [];

  return (
    <Card>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FormError message={state.message && !state.ok ? state.message : null} />
        <FormSuccess message={state.ok ? state.message : null} />

        <TextInput
          label="İşletme adı"
          name="businessName"
          required
          {...(state.fieldErrors?.businessName ? { error: state.fieldErrors.businessName } : {})}
        />

        <TextInput
          label="Yetkili kişi"
          name="contactName"
          defaultValue={defaultName}
          required
          {...(state.fieldErrors?.contactName ? { error: state.fieldErrors.contactName } : {})}
        />

        <TextInput
          label="Telefon"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="0555 111 22 33"
          required
          {...(state.fieldErrors?.phone ? { error: state.fieldErrors.phone } : {})}
        />

        <TextInput
          label="E-posta"
          name="email"
          type="email"
          inputMode="email"
          defaultValue={defaultEmail}
          required
          {...(state.fieldErrors?.email ? { error: state.fieldErrors.email } : {})}
        />

        <Select
          label="Kategori"
          name="categoryId"
          required
          placeholder="Kategori seç"
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          {...(state.fieldErrors?.categoryId ? { error: state.fieldErrors.categoryId } : {})}
        />

        <Select
          label="Şehir"
          name="cityId"
          required
          value={cityId}
          onChange={(event) => setCityId(event.target.value)}
          options={cities.map((city) => ({ value: city.id, label: city.name }))}
        />

        <Select
          label="İlçe"
          name="districtId"
          required
          placeholder="İlçe seç"
          options={districts.map((district) => ({ value: district.id, label: district.name }))}
          {...(state.fieldErrors?.districtId ? { error: state.fieldErrors.districtId } : {})}
        />

        <TextArea
          label="Açık adres"
          name="address"
          required
          maxLength={300}
          hint="Mahalle, cadde, numara — müşterilerin sizi bulabileceği kadar ayrıntılı."
          {...(state.fieldErrors?.address ? { error: state.fieldErrors.address } : {})}
        />

        <TextInput
          label="Vergi / işletme kayıt bilgisi (isteğe bağlı)"
          name="taxInfo"
          maxLength={60}
          hint="Bu bilgi yalnızca doğrulama için yöneticiye gösterilir, hiçbir public sayfada yer almaz."
        />

        <TextInput label="Instagram (isteğe bağlı)" name="instagram" maxLength={60} />
        <TextInput
          label="Web sitesi (isteğe bağlı)"
          name="website"
          type="url"
          placeholder="https://"
        />

        <label className={styles.choice} style={{ alignItems: 'flex-start', padding: 12 }}>
          <input type="checkbox" name="acceptTerms" required />
          <span style={{ fontSize: 13, fontWeight: 400 }}>
            Verdiğim bilgilerin doğru olduğunu ve{' '}
            <Link href="/legal/kullanim-kosullari">kullanım koşullarını</Link> kabul ediyorum.
          </span>
        </label>
        {state.fieldErrors?.acceptTerms ? (
          <p className={styles.errorText} role="alert">
            <span aria-hidden="true">⚠</span>
            {state.fieldErrors.acceptTerms}
          </p>
        ) : null}

        <SubmitButton size="lg" fullWidth pendingLabel="Gönderiliyor…">
          Başvuruyu gönder
        </SubmitButton>

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Başvurun yönetici incelemesinden geçer. Onaylandığında işletme paneline erişebilir ve
          paketlerini yayınlayabilirsin.
        </p>
      </form>
    </Card>
  );
}
