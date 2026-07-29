import { RATE_LIMITS, type RateLimitKey } from '../config/constants';
import { AppError } from '../errors/AppError';

/**
 * Pencere tabanlı hız sınırlama.
 *
 * Sayaç deposu dışarıdan verilir: demo modda bellek içi Map, Supabase modunda
 * `rate_limits` tablosu üzerinde atomik sayaç.
 */

export interface RateLimitStore {
  /** Anahtarı verilen pencerede artırır ve yeni değeri döner. */
  increment(key: string, windowStartMs: number, windowMs: number): Promise<number>;
  reset(key: string): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Pencerenin sıfırlanmasına kalan süre (saniye). */
  retryAfterSeconds: number;
}

export function windowStartFor(nowMs: number, windowMs: number): number {
  return Math.floor(nowMs / windowMs) * windowMs;
}

export async function checkRateLimit(
  store: RateLimitStore,
  action: RateLimitKey,
  identifier: string,
  nowMs: number,
): Promise<RateLimitResult> {
  const { limit, windowMs } = RATE_LIMITS[action];
  const windowStart = windowStartFor(nowMs, windowMs);
  const key = `${action}:${identifier}`;

  const count = await store.increment(key, windowStart, windowMs);
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + windowMs - nowMs) / 1000));

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    limit,
    retryAfterSeconds,
  };
}

/** Sınır aşıldıysa `AppError('rate_limited')` fırlatır. */
export async function enforceRateLimit(
  store: RateLimitStore,
  action: RateLimitKey,
  identifier: string,
  nowMs: number,
): Promise<void> {
  const result = await checkRateLimit(store, action, identifier, nowMs);
  if (!result.allowed) {
    throw AppError.rateLimited(result.retryAfterSeconds);
  }
}

/**
 * Bellek içi sayaç deposu.
 * Demo modda ve testlerde kullanılır; süreç ömrüyle sınırlıdır.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly counters = new Map<string, { windowStart: number; count: number }>();

  async increment(key: string, windowStartMs: number): Promise<number> {
    const existing = this.counters.get(key);
    if (!existing || existing.windowStart !== windowStartMs) {
      this.counters.set(key, { windowStart: windowStartMs, count: 1 });
      return 1;
    }
    existing.count += 1;
    return existing.count;
  }

  async reset(key: string): Promise<void> {
    this.counters.delete(key);
  }

  /** Test yardımı: tüm sayaçları temizler. */
  clear(): void {
    this.counters.clear();
  }
}

/** Sınırlamayı devre dışı bırakan depo (yalnızca testlerde). */
export class NoopRateLimitStore implements RateLimitStore {
  async increment(): Promise<number> {
    return 0;
  }
  async reset(): Promise<void> {
    // no-op
  }
}
