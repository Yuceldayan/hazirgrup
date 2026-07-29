/**
 * Uygulama genelinde tek hata tipi.
 * UI yalnızca `userMessage` gösterir; teknik ayrıntı loglanır (hassas veri hariç).
 */

export const APP_ERROR_CODES = [
  'validation',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
  'unavailable',
  'unknown',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

const DEFAULT_MESSAGES: Record<AppErrorCode, string> = {
  validation: 'Girdiğin bilgilerde bir sorun var. Kontrol edip tekrar dener misin?',
  unauthorized: 'Bu işlem için giriş yapman gerekiyor.',
  forbidden: 'Bu işlem için yetkin yok.',
  not_found: 'Aradığın kayıt bulunamadı.',
  conflict: 'Bu işlem şu anki durumda yapılamıyor.',
  rate_limited: 'Çok fazla deneme yaptın. Biraz sonra tekrar dener misin?',
  unavailable: 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dener misin?',
  unknown: 'Beklenmedik bir sorun oluştu. Tekrar dener misin?',
};

const HTTP_STATUS: Record<AppErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  unavailable: 503,
  unknown: 500,
};

export interface AppErrorOptions {
  /** Kullanıcıya gösterilecek Türkçe metin. Verilmezse koda göre varsayılan kullanılır. */
  userMessage?: string;
  /** Alan bazlı doğrulama hataları: { alanAdi: 'mesaj' } */
  details?: Record<string, string>;
  /** Teknik bağlam — loglanır, kullanıcıya gösterilmez. */
  context?: Record<string, unknown>;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly details?: Record<string, string>;
  readonly context?: Record<string, unknown>;

  constructor(code: AppErrorCode, technicalMessage?: string, options: AppErrorOptions = {}) {
    super(technicalMessage ?? code);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = options.userMessage ?? DEFAULT_MESSAGES[code];
    if (options.details) this.details = options.details;
    if (options.context) this.context = options.context;
    if (options.cause !== undefined) this.cause = options.cause;
  }

  get httpStatus(): number {
    return HTTP_STATUS[this.code];
  }

  toJSON(): { code: AppErrorCode; message: string; details?: Record<string, string> } {
    return {
      code: this.code,
      message: this.userMessage,
      ...(this.details ? { details: this.details } : {}),
    };
  }

  // ---- Kısayollar -------------------------------------------------------

  static validation(details?: Record<string, string>, userMessage?: string): AppError {
    return new AppError('validation', 'Doğrulama hatası', {
      ...(details ? { details } : {}),
      ...(userMessage ? { userMessage } : {}),
    });
  }

  static unauthorized(userMessage?: string): AppError {
    return new AppError('unauthorized', 'Oturum gerekli', {
      ...(userMessage ? { userMessage } : {}),
    });
  }

  static forbidden(userMessage?: string): AppError {
    return new AppError('forbidden', 'Yetki yok', { ...(userMessage ? { userMessage } : {}) });
  }

  static notFound(entity?: string, userMessage?: string): AppError {
    return new AppError('not_found', `Bulunamadı: ${entity ?? 'kayıt'}`, {
      ...(userMessage ? { userMessage } : {}),
      ...(entity ? { context: { entity } } : {}),
    });
  }

  static conflict(userMessage?: string, context?: Record<string, unknown>): AppError {
    return new AppError('conflict', 'Durum çakışması', {
      ...(userMessage ? { userMessage } : {}),
      ...(context ? { context } : {}),
    });
  }

  static rateLimited(retryAfterSeconds?: number): AppError {
    return new AppError('rate_limited', 'Hız sınırı aşıldı', {
      ...(retryAfterSeconds !== undefined ? { context: { retryAfterSeconds } } : {}),
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Bilinmeyen bir hatayı güvenle AppError'a çevirir. */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return new AppError('unknown', error.message, { cause: error });
  }
  return new AppError('unknown', String(error));
}

/** Kullanıcıya gösterilecek metni her koşulda güvenli biçimde döner. */
export function userMessageOf(error: unknown): string {
  return toAppError(error).userMessage;
}
