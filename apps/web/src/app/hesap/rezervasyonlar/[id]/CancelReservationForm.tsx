'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui';
import { SubmitButton, TextInput } from '@/components/ui/form';
import { cancelReservationAction } from '@/server/actions/account';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function CancelReservationForm({
  reservationId,
  cancellationTerms,
}: {
  reservationId: string;
  cancellationTerms: string | null;
}) {
  const [state, formAction] = useActionState(cancelReservationAction, EMPTY_ACTION_RESULT);

  return (
    <details>
      <summary
        style={{
          cursor: 'pointer',
          color: 'var(--color-danger-text)',
          fontSize: 14,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Rezervasyonu iptal et
      </summary>

      <form
        action={formAction}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
      >
        <input type="hidden" name="reservationId" value={reservationId} />

        {state.message ? (
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        ) : null}

        {cancellationTerms ? <Alert tone="warning">{cancellationTerms}</Alert> : null}

        <TextInput
          label="İptal nedeni (isteğe bağlı)"
          name="reason"
          maxLength={300}
          placeholder="Örnek: Grup planı değişti"
        />

        <SubmitButton variant="danger" pendingLabel="İptal ediliyor…">
          Rezervasyonu iptal et
        </SubmitButton>
      </form>
    </details>
  );
}
