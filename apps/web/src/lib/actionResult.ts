/**
 * Server Action sonuç zarfı — hem sunucu hem istemci tarafında kullanılır.
 *
 * NOT: Bu dosya `server-only` içermez; `useActionState` çağıran istemci
 * bileşenleri başlangıç değerini buradan alır. Sunucuya özel yardımcılar
 * `@/server/actionResult` içindedir.
 */
export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Başarıdan sonra istemcinin gideceği adres (yönlendirme gerekiyorsa). */
  redirectTo?: string;
  /** Formu tekrar doldurmamak veya sonuç göstermek için dönen değerler. */
  values?: Record<string, string>;
}

export const EMPTY_ACTION_RESULT: ActionResult = { ok: false };
