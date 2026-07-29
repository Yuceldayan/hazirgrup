'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { enforceRateLimit } from '@hazirgrup/core';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@hazirgrup/validation';
import { getRepository } from '@/server/repository';
import { createSession, destroySession, rateLimitIdentifier } from '@/server/session';
import {
  actionError,
  actionSuccess,
  actionValidationError,
  isRedirectError,
  type ActionResult,
} from '@/server/actionResult';

/**
 * Kimlik doğrulama server action'ları.
 *
 * Hız sınırlama (docs/SECURITY_MODEL.md §6) ve jenerik hata mesajları
 * (kullanıcı numaralandırma koruması) burada uygulanır.
 */

/** Repository tabanlı hız sınırı deposu. */
async function rateStore() {
  const repo = await getRepository();
  return {
    increment: (key: string, windowStartMs: number, windowMs: number) =>
      repo.incrementRateLimit(key, windowStartMs, windowMs),
    reset: (key: string) => repo.resetRateLimit(key),
  };
}

function safeRedirectTarget(value: FormDataEntryValue | null): string {
  const raw = typeof value === 'string' ? value : '';
  // Açık yönlendirme koruması: yalnızca site içi mutlak yollar kabul edilir.
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/hesap';
}

export async function signInAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const store = await rateStore();
    const requestHeaders = await headers();
    await enforceRateLimit(
      store,
      'signIn',
      `${rateLimitIdentifier(requestHeaders)}:${parsed.data.email}`,
      Date.now(),
    );

    const repo = await getRepository();
    const { user } = await repo.signIn(parsed.data);
    await createSession(user.id);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }

  redirect(safeRedirectTarget(formData.get('devam')));
}

export async function signUpAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  });

  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const store = await rateStore();
    const requestHeaders = await headers();
    await enforceRateLimit(store, 'signUp', rateLimitIdentifier(requestHeaders), Date.now());

    const repo = await getRepository();
    const { user } = await repo.signUp({
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      password: parsed.data.password,
    });
    await createSession(user.id);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }

  redirect(safeRedirectTarget(formData.get('devam')));
}

export async function forgotPasswordAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const store = await rateStore();
    await enforceRateLimit(store, 'passwordReset', parsed.data.email, Date.now());

    const repo = await getRepository();
    const { resetToken } = await repo.requestPasswordReset(parsed.data.email);

    if (resetToken) {
      // Demo modda e-posta gönderilmez; bağlantı sunucu loguna yazılır (L-02).
      console.warn(
        `[hazirgrup] DEMO şifre sıfırlama bağlantısı: /auth/sifre-sifirla?token=${resetToken}`,
      );
    }
  } catch (error) {
    return actionError(error);
  }

  // Kullanıcı numaralandırmasını engellemek için sonuç her durumda aynıdır.
  return actionSuccess(
    'Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunu kontrol et.',
  );
}

export async function resetPasswordAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  });

  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.resetPassword({ token: parsed.data.token, password: parsed.data.password });
  } catch (error) {
    return actionError(error);
  }

  return actionSuccess('Şifren güncellendi. Artık yeni şifrenle giriş yapabilirsin.', '/auth/giris');
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect('/');
}
