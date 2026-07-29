import 'server-only';
import { toAppError } from '@hazirgrup/core';
import type { ZodError } from 'zod';
import { toFieldErrors } from '@hazirgrup/validation';
import type { ActionResult } from '@/lib/actionResult';

/**
 * Server Action yardımcıları (yalnızca sunucu).
 * Tip ve başlangıç değeri `@/lib/actionResult` içindedir.
 */

export type { ActionResult };

export function actionSuccess(message?: string, redirectTo?: string): ActionResult {
  return {
    ok: true,
    ...(message ? { message } : {}),
    ...(redirectTo ? { redirectTo } : {}),
  };
}

export function actionValidationError(error: ZodError): ActionResult {
  return {
    ok: false,
    message: 'Girdiğin bilgilerde bir sorun var. İşaretli alanları kontrol eder misin?',
    fieldErrors: toFieldErrors(error),
  };
}

/** Beklenmedik hataları kullanıcı dostu sonuca çevirir; teknik ayrıntı loglanır. */
export function actionError(error: unknown): ActionResult {
  const appError = toAppError(error);

  // Hassas veri loglanmaz (docs/SECURITY_MODEL.md §10).
  console.error('[hazirgrup] action hatası', {
    code: appError.code,
    context: appError.context,
  });

  return {
    ok: false,
    message: appError.userMessage,
    ...(appError.details ? { fieldErrors: appError.details } : {}),
  };
}

/** `redirect()` çağrısı bir hata fırlatır; onu yakalayıp yutmamak için kontrol. */
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}
