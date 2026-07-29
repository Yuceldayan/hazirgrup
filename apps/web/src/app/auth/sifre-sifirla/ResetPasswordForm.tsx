'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { Alert, Card, LinkButton } from '@/components/ui';
import { FormError, FormSuccess, SubmitButton, TextInput } from '@/components/ui/form';
import { resetPasswordAction } from '@/server/actions/auth';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, EMPTY_ACTION_RESULT);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      const timer = setTimeout(() => router.push(state.redirectTo as string), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, router]);

  if (!token) {
    return (
      <Card>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Şifre sıfırla</h1>
        <Alert tone="error" title="Bağlantı geçersiz">
          Şifre sıfırlama bağlantısı eksik veya bozuk görünüyor. Yeni bir bağlantı isteyebilirsin.
        </Alert>
        <div style={{ marginTop: 16 }}>
          <LinkButton href="/auth/sifremi-unuttum" fullWidth>
            Yeni bağlantı iste
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Yeni şifre belirle</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
        Güvenliğin için en az 8 karakter, bir harf ve bir rakam içeren bir şifre seç.
      </p>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="hidden" name="token" value={token} />

        <FormError message={state.message && !state.ok ? state.message : null} />
        <FormSuccess message={state.ok ? state.message : null} />

        <TextInput
          label="Yeni şifre"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          {...(state.fieldErrors?.password ? { error: state.fieldErrors.password } : {})}
        />

        <TextInput
          label="Yeni şifre tekrar"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          {...(state.fieldErrors?.passwordConfirm
            ? { error: state.fieldErrors.passwordConfirm }
            : {})}
        />

        <SubmitButton fullWidth size="lg" pendingLabel="Güncelleniyor…">
          Şifreyi güncelle
        </SubmitButton>
      </form>

      <p style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
        <Link href="/auth/giris">Giriş ekranına dön</Link>
      </p>
    </Card>
  );
}
