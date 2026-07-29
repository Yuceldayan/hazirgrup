'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { FormError, SubmitButton, TextInput } from '@/components/ui/form';
import { signInAction } from '@/server/actions/auth';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';

export function SignInForm({
  redirectTo,
  demoHints,
}: {
  redirectTo: string;
  demoHints: ReadonlyArray<{ label: string; email: string; password: string }>;
}) {
  const [state, formAction] = useActionState(signInAction, EMPTY_ACTION_RESULT);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.redirectTo) router.push(state.redirectTo);
  }, [state, router]);

  return (
    <>
      <Card>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Giriş yap</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Planlarını yönetmek ve rezervasyon göndermek için giriş yap.
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="hidden" name="devam" value={redirectTo} />

          <FormError message={state.message && !state.ok ? state.message : null} />

          <TextInput
            label="E-posta"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="ornek@eposta.com"
            {...(state.fieldErrors?.email ? { error: state.fieldErrors.email } : {})}
          />

          <TextInput
            label="Şifre"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            {...(state.fieldErrors?.password ? { error: state.fieldErrors.password } : {})}
          />

          <SubmitButton fullWidth size="lg" pendingLabel="Giriş yapılıyor…">
            Giriş yap
          </SubmitButton>
        </form>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 16,
            fontSize: 14,
          }}
        >
          <Link href="/auth/sifremi-unuttum">Şifremi unuttum</Link>
          <Link href="/auth/kayit">Hesabın yok mu? Kayıt ol</Link>
        </div>
      </Card>

      {demoHints.length > 0 ? (
        <Card flat style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Demo hesapları</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Demo modunda hazır hesaplarla giriş yapabilirsin.
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {demoHints.map((hint) => (
              <li key={hint.email} style={{ fontSize: 13 }}>
                <strong>{hint.label}:</strong>{' '}
                <code style={{ fontSize: 12 }}>{hint.email}</code> ·{' '}
                <code style={{ fontSize: 12 }}>{hint.password}</code>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
