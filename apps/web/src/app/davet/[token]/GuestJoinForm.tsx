'use client';

import { useActionState } from 'react';
import type { ParticipationStatus } from '@hazirgrup/core';
import { Card } from '@/components/ui';
import { FormError, FormSuccess, SubmitButton, TextInput } from '@/components/ui/form';
import { joinPlanAction } from '@/server/actions/invite';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from './invite.module.css';

const OPTIONS: Array<{ value: ParticipationStatus; icon: string; label: string }> = [
  { value: 'going', icon: '✅', label: 'Katılıyorum' },
  { value: 'maybe', icon: '🤔', label: 'Kararsızım' },
  { value: 'not_going', icon: '🚫', label: 'Katılmıyorum' },
];

export function GuestJoinForm({
  token,
  currentName,
  currentStatus,
}: {
  token: string;
  currentName: string | null;
  currentStatus: ParticipationStatus | null;
}) {
  const [state, formAction] = useActionState(joinPlanAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>
        {currentName ? 'Katılım durumunu güncelle' : 'Sen de katıl'}
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 16 }}>
        {currentName
          ? `${currentName} olarak katıldın. Durumunu istediğin zaman değiştirebilirsin.`
          : 'Adını yaz ve katılım durumunu seç. Hesap açmana gerek yok.'}
      </p>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="hidden" name="token" value={token} />

        <FormError message={state.message && !state.ok ? state.message : null} />
        <FormSuccess message={state.ok ? state.message : null} />

        <TextInput
          label="Adın"
          name="displayName"
          required
          maxLength={60}
          defaultValue={currentName ?? ''}
          placeholder="Örnek: Burak"
          hint="Arkadaşların bu ismi görecek."
          {...(state.fieldErrors?.displayName ? { error: state.fieldErrors.displayName } : {})}
        />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend
            style={{
              fontSize: 'var(--type-small-size)',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Geliyor musun?
          </legend>
          <div className={styles.statusOptions}>
            {OPTIONS.map((option) => (
              <label key={option.value} className={styles.statusOption}>
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  defaultChecked={currentStatus === option.value}
                  required
                />
                <span className={styles.statusIcon} aria-hidden="true">
                  {option.icon}
                </span>
                <span className={styles.statusLabel}>{option.label}</span>
              </label>
            ))}
          </div>
          {state.fieldErrors?.status ? (
            <p style={{ color: 'var(--color-danger-text)', fontSize: 13, marginTop: 6 }} role="alert">
              ⚠ {state.fieldErrors.status}
            </p>
          ) : null}
        </fieldset>

        <SubmitButton fullWidth size="lg" pendingLabel="Kaydediliyor…">
          {currentName ? 'Durumu güncelle' : 'Plana katıl'}
        </SubmitButton>
      </form>
    </Card>
  );
}
