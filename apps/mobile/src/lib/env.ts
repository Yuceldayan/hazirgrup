import type { DataSourceMode } from '@hazirgrup/core';

/**
 * Mobil ortam değişkenleri.
 *
 * Web'de olduğu gibi hiçbir değişken zorunlu değildir; Supabase anahtarları
 * yoksa uygulama demo moduna düşer ve tüm akışlar çalışmaya devam eder.
 */

function readMode(): DataSourceMode {
  const value = process.env.EXPO_PUBLIC_DATA_SOURCE;
  if (value === 'demo' || value === 'supabase' || value === 'auto') return value;
  return 'auto';
}

export const env = {
  dataSource: readMode(),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || undefined,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || undefined,
  siteUrl: (process.env.EXPO_PUBLIC_SITE_URL || 'https://hazirgrup.app').replace(/\/+$/, ''),
  pushEnabled: process.env.EXPO_PUBLIC_PUSH_ENABLED === 'true',
} as const;
