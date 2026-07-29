'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Card } from '@/components/ui';
import { FormError, SubmitButton, TextInput } from '@/components/ui/form';
import { signUpAction } from '@/server/actions/auth';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/ui/ui.module.css';

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(signUpAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Kayıt ol</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
        Plan oluşturmak ve rezervasyon göndermek için hesap aç. Arkadaşların kayıt olmadan
        katılabilir.
      </p>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="hidden" name="devam" value={redirectTo} />

        <FormError message={state.message && !state.ok ? state.message : null} />

        <TextInput
          label="Görünen adın"
          name="displayName"
          autoComplete="name"
          required
          hint="Arkadaşlarının planda göreceği isim."
          {...(state.fieldErrors?.displayName ? { error: state.fieldErrors.displayName } : {})}
        />

        <TextInput
          label="E-posta"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          {...(state.fieldErrors?.email ? { error: state.fieldErrors.email } : {})}
        />

        <TextInput
          label="Şifre"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="En az 8 karakter, en az bir harf ve bir rakam."
          {...(state.fieldErrors?.password ? { error: state.fieldErrors.password } : {})}
        />

        <TextInput
          label="Şifre tekrar"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          {...(state.fieldErrors?.passwordConfirm
            ? { error: state.fieldErrors.passwordConfirm }
            : {})}
        />

        <label className={styles.choice} style={{ alignItems: 'flex-start', padding: 12 }}>
          <input type="checkbox" name="acceptTerms" required />
          <span style={{ fontSize: 13, fontWeight: 400 }}>
            <Link href="/legal/kullanim-kosullari">Kullanım koşullarını</Link> ve{' '}
            <Link href="/legal/kvkk-aydinlatma-metni">KVKK aydınlatma metnini</Link> okudum,
            kabul ediyorum.
          </span>
        </label>
        {state.fieldErrors?.acceptTerms ? (
          <p className={styles.errorText} role="alert">
            <span aria-hidden="true">⚠</span>
            {state.fieldErrors.acceptTerms}
          </p>
        ) : null}

        <SubmitButton fullWidth size="lg" pendingLabel="Hesap oluşturuluyor…">
          Hesap oluştur
        </SubmitButton>
      </form>

      <p style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
        Zaten hesabın var mı? <Link href="/auth/giris">Giriş yap</Link>
      </p>
    </Card>
  );
}
