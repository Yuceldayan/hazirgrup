'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Card } from '@/components/ui';
import { FormError, FormSuccess, SubmitButton, TextInput } from '@/components/ui/form';
import { forgotPasswordAction } from '@/server/actions/auth';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Şifremi unuttum</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
        E-posta adresini gir; şifreni sıfırlaman için bağlantı gönderelim.
      </p>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FormError message={state.message && !state.ok ? state.message : null} />
        <FormSuccess message={state.ok ? state.message : null} />

        <TextInput
          label="E-posta"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          {...(state.fieldErrors?.email ? { error: state.fieldErrors.email } : {})}
        />

        <SubmitButton fullWidth size="lg" pendingLabel="Gönderiliyor…">
          Sıfırlama bağlantısı gönder
        </SubmitButton>
      </form>

      <p style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
        <Link href="/auth/giris">Giriş ekranına dön</Link>
      </p>
    </Card>
  );
}
