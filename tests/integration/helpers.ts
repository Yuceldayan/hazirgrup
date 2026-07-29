import { DemoRepository, type ServiceContext } from '@hazirgrup/core';

/**
 * Entegrasyon testleri için ortak kurulum.
 *
 * Gerçek servis kodu `DemoRepository` üzerinde çalıştırılır; böylece plan →
 * davet → oy → rezervasyon akışının tamamı veritabanı sunucusu olmadan
 * doğrulanır (docs/TEST_STRATEGY.md §1).
 */

export const REFERENCE_DATE = '2026-03-02';
export const NOW_MS = new Date(`${REFERENCE_DATE}T09:00:00.000Z`).getTime();
export const SITE_URL = 'https://hazirgrup.test';

export function createTestContext(nowMs = NOW_MS): ServiceContext & { repo: DemoRepository } {
  const repo = new DemoRepository(REFERENCE_DATE);
  return { repo, nowMs, siteUrl: SITE_URL };
}

export function advance(ctx: ServiceContext, ms: number): ServiceContext {
  return { ...ctx, nowMs: ctx.nowMs + ms };
}

export const DEMO_CREDENTIALS = {
  user: { email: 'elif@ornek.test', password: 'Demo1234' },
  friend: { email: 'kerem@ornek.test', password: 'Demo1234' },
  businessOwner: { email: 'isletme05@ornek.test', password: 'Isletme1234' },
  cafeOwner: { email: 'isletme01@ornek.test', password: 'Isletme1234' },
  admin: { email: 'admin@ornek.test', password: 'Admin1234' },
  applicant: { email: 'basvuru@ornek.test', password: 'Demo1234' },
} as const;
