'use client';

import { useActionState } from 'react';
import { Alert, Button } from '@/components/ui';
import { SubmitButton, TextInput } from '@/components/ui/form';
import {
  cancelPlanAction,
  closeVotingAction,
  startVotingAction,
} from '@/server/actions/plan';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

/** Oylamayı başlat — isteğe bağlı bitiş zamanıyla. */
export function StartVotingForm({ planId }: { planId: string }) {
  const [state, formAction] = useActionState(startVotingAction, EMPTY_ACTION_RESULT);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="hidden" name="planId" value={planId} />

      {state.message ? (
        <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
      ) : null}

      <TextInput
        label="Oylama bitiş zamanı (isteğe bağlı)"
        name="endsAtLocal"
        type="datetime-local"
        hint="Boş bırakırsan oylamayı istediğin an elle bitirebilirsin."
        onChange={(event) => {
          const hidden = event.currentTarget.form?.elements.namedItem('endsAt');
          if (hidden instanceof HTMLInputElement) {
            hidden.value = event.target.value ? new Date(event.target.value).toISOString() : '';
          }
        }}
      />
      <input type="hidden" name="endsAt" defaultValue="" />

      <SubmitButton pendingLabel="Başlatılıyor…">Oylamayı başlat</SubmitButton>
    </form>
  );
}

/** Oylamayı bitir. */
export function CloseVotingForm({ planId }: { planId: string }) {
  const [state, formAction] = useActionState(closeVotingAction, EMPTY_ACTION_RESULT);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="hidden" name="planId" value={planId} />
      {state.message ? (
        <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
      ) : null}
      <SubmitButton variant="secondary" pendingLabel="Bitiriliyor…">
        Oylamayı bitir
      </SubmitButton>
    </form>
  );
}

/** Planı iptal et — gerekçe isteğe bağlı, katılımcılar bilgilendirilir. */
export function CancelPlanForm({ planId }: { planId: string }) {
  const [state, formAction] = useActionState(cancelPlanAction, EMPTY_ACTION_RESULT);

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
        Planı iptal et
      </summary>

      <form
        action={formAction}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
      >
        <input type="hidden" name="planId" value={planId} />

        {state.message ? (
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        ) : null}

        <Alert tone="warning">
          Plan iptal edilince tüm katılımcılara bildirim gider ve oylama kapanır. Bu işlem geri
          alınamaz.
        </Alert>

        <TextInput
          label="Gerekçe (isteğe bağlı)"
          name="reason"
          maxLength={300}
          placeholder="Örnek: Çoğunluk müsait değil"
        />

        <SubmitButton variant="danger" pendingLabel="İptal ediliyor…">
          Planı iptal et
        </SubmitButton>
      </form>
    </details>
  );
}

/** Taslak planı yayına alma. */
export function PublishDraftButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <Button type="submit" size="lg">
        Planı yayına al ve davet et
      </Button>
    </form>
  );
}
