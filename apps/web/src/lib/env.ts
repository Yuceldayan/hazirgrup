import type { DataSourceMode } from '@hazirgrup/core';

/**
 * Ortam değişkenleri.
 *
 * ZORUNLU DEĞİŞKEN YOKTUR: Supabase anahtarları tanımlı değilse uygulama
 * otomatik olarak demo moduna düşer ve tüm akışlar çalışmaya devam eder
 * (docs/DECISIONS.md D-004).
 */

function readMode(): DataSourceMode {
  const value = process.env.HG_DATA_SOURCE;
  if (value === 'demo' || value === 'supabase' || value === 'auto') return value;
  return 'auto';
}

function normalizeSiteUrl(value: string | undefined): string {
  const raw = value && value.trim().length > 0 ? value.trim() : 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export const env = {
  dataSource: readMode(),

  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,

  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? 'development',

  sessionSecret:
    process.env.HG_SESSION_SECRET ?? 'hazirgrup-gelistirme-imzalama-anahtari-degistirin',

  /** Google girişi yalnızca kimlik bilgileri verilmişse gösterilir (L-08). */
  googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
} as const;

export const isProduction = env.environment === 'production';

/**
 * Üretim dışı ortamlarda tüm sayfalar `noindex` olur ve robots.txt siteyi
 * tamamen kapatır (docs/SEO_STRATEGY.md §6).
 */
export const allowIndexing = isProduction;

export function metadataContext(): { siteUrl: string; isProduction: boolean } {
  return { siteUrl: env.siteUrl, isProduction: allowIndexing };
}
