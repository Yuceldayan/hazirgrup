'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { calculatePackagePricing, formatCurrency } from '@hazirgrup/core';
import { Alert, Card } from '@/components/ui';
import { FormError, FormSuccess, SubmitButton, TextArea, TextInput } from '@/components/ui/form';
import { createReservationAction } from '@/server/actions/plan';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/public.module.css';

export function ReservationForm({
  planId,
  packageId,
  packageName,
  businessName,
  branchName,
  pricingModel,
  priceAmount,
  minPeople,
  maxPeople,
  defaultPeopleCount,
  defaultContactName,
  defaultContactPhone,
  reservationTerms,
  cancellationTerms,
}: {
  planId: string;
  packageId: string;
  packageName: string;
  businessName: string;
  branchName: string;
  pricingModel: 'per_person' | 'total';
  priceAmount: number;
  minPeople: number;
  maxPeople: number;
  defaultPeopleCount: number;
  defaultContactName: string;
  defaultContactPhone: string;
  reservationTerms: string | null;
  cancellationTerms: string | null;
}) {
  const [state, formAction] = useActionState(createReservationAction, EMPTY_ACTION_RESULT);
  const [peopleCount, setPeopleCount] = useState(String(defaultPeopleCount));
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(() => router.push(`/hesap/plan/${planId}`), 1600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.ok, planId, router]);

  const count = Math.max(1, Number(peopleCount) || 1);
  const pricing = calculatePackagePricing({
    pricingModel,
    priceAmount,
    peopleCount: count,
    minPeople,
  });

  const outOfRange = count < minPeople || count > maxPeople;

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="packageId" value={packageId} />

      <FormError message={state.message && !state.ok ? state.message : null} />
      <FormSuccess message={state.ok ? state.message : null} />

      <Card>
        <p style={{ fontWeight: 600 }}>{packageName}</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {businessName} · {branchName}
        </p>
      </Card>

      <TextInput
        label="Kesin kişi sayısı"
        name="peopleCount"
        type="number"
        inputMode="numeric"
        min={minPeople}
        max={maxPeople}
        value={peopleCount}
        onChange={(event) => setPeopleCount(event.target.value)}
        hint={`Bu paket ${minPeople}–${maxPeople} kişilik gruplar içindir.`}
        required
        {...(state.fieldErrors?.peopleCount ? { error: state.fieldErrors.peopleCount } : {})}
      />

      {outOfRange ? (
        <Alert tone="warning">
          Kişi sayısı bu paketin kapasitesi dışında. {minPeople} ile {maxPeople} arasında bir
          değer gir.
        </Alert>
      ) : null}

      <Card raised>
        <div className={styles.priceBlock}>
          <span className={styles.priceMain}>{formatCurrency(pricing.perPersonPrice)}</span>
          <span className={styles.priceUnit}>kişi başı</span>
        </div>
        <p className={styles.priceSecondary}>
          Toplam {formatCurrency(pricing.totalPrice)} · {count} kişi
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Talep gönderildiğinde bu tutar sabitlenir. Ödeme mekânda yapılır.
        </p>
      </Card>

      <TextInput
        label="İletişim adı"
        name="contactName"
        defaultValue={defaultContactName}
        required
        hint="İşletme seninle bu isimle iletişime geçer."
        {...(state.fieldErrors?.contactName ? { error: state.fieldErrors.contactName } : {})}
      />

      <TextInput
        label="İletişim telefonu"
        name="contactPhone"
        type="tel"
        inputMode="tel"
        defaultValue={defaultContactPhone}
        placeholder="0555 111 22 33"
        required
        hint="Yalnızca bu rezervasyon için ilgili işletmeyle paylaşılır."
        {...(state.fieldErrors?.contactPhone ? { error: state.fieldErrors.contactPhone } : {})}
      />

      <TextArea
        label="Not (isteğe bağlı)"
        name="note"
        maxLength={500}
        placeholder="Örnek: Ayrı salon olabilir mi?"
      />

      {reservationTerms || cancellationTerms ? (
        <Card flat>
          {reservationTerms ? (
            <>
              <p style={{ fontWeight: 600, fontSize: 13 }}>Rezervasyon şartı</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                {reservationTerms}
              </p>
            </>
          ) : null}
          {cancellationTerms ? (
            <>
              <p style={{ fontWeight: 600, fontSize: 13 }}>İptal şartı</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {cancellationTerms}
              </p>
            </>
          ) : null}
        </Card>
      ) : null}

      <SubmitButton size="lg" fullWidth pendingLabel="Gönderiliyor…" disabled={outOfRange}>
        Rezervasyon talebini gönder
      </SubmitButton>

      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Talebin işletmeye iletilir. Onaylandığında sana bildirim gelir ve rezervasyon kodun
        oluşur.
      </p>
    </form>
  );
}
