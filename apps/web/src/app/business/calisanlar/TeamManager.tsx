'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui';
import { SubmitButton, TextInput } from '@/components/ui/form';
import { addTeamMemberAction, removeTeamMemberAction } from '@/server/actions/business';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function TeamManager(
  props: { mode: 'add' } | { mode: 'remove'; userId: string },
) {
  const [addState, addAction] = useActionState(addTeamMemberAction, EMPTY_ACTION_RESULT);
  const [removeState, removeAction] = useActionState(removeTeamMemberAction, EMPTY_ACTION_RESULT);

  if (props.mode === 'remove') {
    return (
      <form action={removeAction} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <input type="hidden" name="userId" value={props.userId} />
        <SubmitButton size="sm" variant="ghost" pendingLabel="Çıkarılıyor…">
          Ekipten çıkar
        </SubmitButton>
        {removeState.message && !removeState.ok ? (
          <span style={{ fontSize: 12, color: 'var(--color-danger-text)' }}>
            {removeState.message}
          </span>
        ) : null}
      </form>
    );
  }

  return (
    <form action={addAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {addState.message ? (
        <Alert tone={addState.ok ? 'success' : 'error'}>{addState.message}</Alert>
      ) : null}

      <TextInput
        label="Çalışanın e-posta adresi"
        name="email"
        type="email"
        inputMode="email"
        required
        hint="Bu kişi rezervasyonları ve paketleri yönetebilecek."
        {...(addState.fieldErrors?.email ? { error: addState.fieldErrors.email } : {})}
      />

      <SubmitButton pendingLabel="Ekleniyor…">Çalışanı ekle</SubmitButton>
    </form>
  );
}
