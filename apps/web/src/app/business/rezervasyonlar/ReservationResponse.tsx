'use client';

import { useActionState, useState } from 'react';
import { REJECTION_REASON_LABELS, REJECTION_REASONS } from '@hazirgrup/core';
import { Alert, Button } from '@/components/ui';
import { Select, SubmitButton, TextArea } from '@/components/ui/form';
import {
  businessCancelReservationAction,
  completeReservationAction,
  respondReservationAction,
} from '@/server/actions/business';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

/** Bekleyen talebe yanıt: onayla veya gerekçeli reddet. */
export function ReservationResponse({ reservationId }: { reservationId: string }) {
  const [state, formAction] = useActionState(respondReservationAction, EMPTY_ACTION_RESULT);
  const [mode, setMode] = useState<'idle' | 'reject'>('idle');

  return (
    <div style={{ marginTop: 12 }}>
      {state.message ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        </div>
      ) : null}

      {mode === 'idle' ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <form action={formAction}>
            <input type="hidden" name="reservationId" value={reservationId} />
            <input type="hidden" name="decision" value="confirm" />
            <SubmitButton pendingLabel="Onaylanıyor…">Onayla</SubmitButton>
          </form>
          <Button type="button" variant="secondary" onClick={() => setMode('reject')}>
            Reddet
          </Button>
        </div>
      ) : (
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="hidden" name="reservationId" value={reservationId} />
          <input type="hidden" name="decision" value="reject" />

          <Select
            label="Ret gerekçesi"
            name="rejectionReason"
            required
            placeholder="Gerekçe seç"
            options={REJECTION_REASONS.map((reason) => ({
              value: reason,
              label: REJECTION_REASON_LABELS[reason],
            }))}
            hint="Gerekçe müşteriye gösterilir ve alternatif paketlere yönlendirilir."
            {...(state.fieldErrors?.rejectionReason
              ? { error: state.fieldErrors.rejectionReason }
              : {})}
          />

          <TextArea label="Ek açıklama (isteğe bağlı)" name="note" maxLength={300} />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SubmitButton variant="danger" pendingLabel="Gönderiliyor…">
              Talebi reddet
            </SubmitButton>
            <Button type="button" variant="ghost" onClick={() => setMode('idle')}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Onaylı rezervasyonu tamamla / gelinmedi olarak işaretle / iptal et. */
export function ReservationLifecycle({ reservationId }: { reservationId: string }) {
  const [completeState, completeAction] = useActionState(
    completeReservationAction,
    EMPTY_ACTION_RESULT,
  );
  const [cancelState, cancelAction] = useActionState(
    businessCancelReservationAction,
    EMPTY_ACTION_RESULT,
  );

  const message = completeState.message ?? cancelState.message;
  const ok = completeState.message ? completeState.ok : cancelState.ok;

  return (
    <div style={{ marginTop: 12 }}>
      {message ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone={ok ? 'success' : 'error'}>{message}</Alert>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <form action={completeAction}>
          <input type="hidden" name="reservationId" value={reservationId} />
          <input type="hidden" name="noShow" value="false" />
          <SubmitButton size="sm" pendingLabel="Kaydediliyor…">
            Tamamlandı
          </SubmitButton>
        </form>

        <form action={completeAction}>
          <input type="hidden" name="reservationId" value={reservationId} />
          <input type="hidden" name="noShow" value="true" />
          <SubmitButton size="sm" variant="secondary" pendingLabel="Kaydediliyor…">
            Gelinmedi
          </SubmitButton>
        </form>

        <details>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--color-danger-text)',
              minHeight: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
            }}
          >
            İptal et
          </summary>
          <form
            action={cancelAction}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
          >
            <input type="hidden" name="reservationId" value={reservationId} />
            <TextArea label="İptal gerekçesi" name="reason" maxLength={300} required />
            <SubmitButton size="sm" variant="danger" pendingLabel="İptal ediliyor…">
              Rezervasyonu iptal et
            </SubmitButton>
          </form>
        </details>
      </div>
    </div>
  );
}
