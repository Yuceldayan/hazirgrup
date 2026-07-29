import { beforeEach, describe, expect, it } from 'vitest';
import { AppError } from '../../errors/AppError';
import { RATE_LIMITS } from '../../config/constants';
import {
  checkRateLimit,
  enforceRateLimit,
  InMemoryRateLimitStore,
  windowStartFor,
} from '../index';

describe('windowStartFor', () => {
  it('pencereyi hizalar', () => {
    expect(windowStartFor(1_000_500, 1000)).toBe(1_000_000);
    expect(windowStartFor(1_000_999, 1000)).toBe(1_000_000);
    expect(windowStartFor(1_001_000, 1000)).toBe(1_001_000);
  });
});

describe('checkRateLimit', () => {
  let store: InMemoryRateLimitStore;
  const now = 1_700_000_000_000;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
  });

  it('limit altındaki istekleri kabul eder', async () => {
    const result = await checkRateLimit(store, 'signIn', '1.2.3.4', now);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(RATE_LIMITS.signIn.limit);
    expect(result.remaining).toBe(RATE_LIMITS.signIn.limit - 1);
  });

  it('limite kadar izin verir, sonra reddeder', async () => {
    const limit = RATE_LIMITS.signIn.limit;
    for (let i = 0; i < limit; i += 1) {
      const result = await checkRateLimit(store, 'signIn', 'user@example.com', now);
      expect(result.allowed, `${i + 1}. istek`).toBe(true);
    }
    const overflow = await checkRateLimit(store, 'signIn', 'user@example.com', now);
    expect(overflow.allowed).toBe(false);
    expect(overflow.remaining).toBe(0);
  });

  it('farklı kimlikler birbirini etkilemez', async () => {
    const limit = RATE_LIMITS.signIn.limit;
    for (let i = 0; i < limit + 1; i += 1) {
      await checkRateLimit(store, 'signIn', 'a', now);
    }
    const other = await checkRateLimit(store, 'signIn', 'b', now);
    expect(other.allowed).toBe(true);
  });

  it('farklı eylemler birbirini etkilemez', async () => {
    for (let i = 0; i < RATE_LIMITS.signIn.limit + 1; i += 1) {
      await checkRateLimit(store, 'signIn', 'a', now);
    }
    expect((await checkRateLimit(store, 'vote', 'a', now)).allowed).toBe(true);
  });

  it('yeni pencerede sayaç sıfırlanır', async () => {
    const { limit, windowMs } = RATE_LIMITS.signIn;
    for (let i = 0; i < limit + 1; i += 1) {
      await checkRateLimit(store, 'signIn', 'a', now);
    }
    expect((await checkRateLimit(store, 'signIn', 'a', now)).allowed).toBe(false);

    const nextWindow = now + windowMs;
    expect((await checkRateLimit(store, 'signIn', 'a', nextWindow)).allowed).toBe(true);
  });

  it('yeniden deneme süresini hesaplar', async () => {
    const { windowMs } = RATE_LIMITS.signIn;
    const windowStart = windowStartFor(now, windowMs);
    const result = await checkRateLimit(store, 'signIn', 'a', windowStart + 1000);
    expect(result.retryAfterSeconds).toBe(Math.ceil((windowMs - 1000) / 1000));
  });
});

describe('enforceRateLimit', () => {
  it('limit aşılınca AppError fırlatır', async () => {
    const store = new InMemoryRateLimitStore();
    const now = 1_700_000_000_000;
    const limit = RATE_LIMITS.createReservation.limit;

    for (let i = 0; i < limit; i += 1) {
      await enforceRateLimit(store, 'createReservation', 'user-1', now);
    }

    await expect(enforceRateLimit(store, 'createReservation', 'user-1', now)).rejects.toThrow(
      AppError,
    );

    try {
      await enforceRateLimit(store, 'createReservation', 'user-1', now);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe('rate_limited');
      expect(appError.httpStatus).toBe(429);
      expect(appError.userMessage).toContain('Çok fazla deneme');
    }
  });

  it('limit altındayken sessizce geçer', async () => {
    const store = new InMemoryRateLimitStore();
    await expect(enforceRateLimit(store, 'vote', 'p-1', 0)).resolves.toBeUndefined();
  });
});
