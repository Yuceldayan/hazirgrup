import 'react-native-get-random-values';
import { createRepository, todayIso, type Repository, type ServiceContext } from '@hazirgrup/core';
import { env } from '@/lib/env';

/**
 * Mobil veri erişimi.
 *
 * Mobil, web sunucusuna değil doğrudan veri kaynağına gider (D-013).
 * Güvenlik veritabanı seviyesinde RLS ile zorunludur.
 *
 * `react-native-get-random-values` importu, `crypto.getRandomValues`
 * polyfill'ini kurar — davet tokenı ve misafir sırrı üretimi bunu gerektirir.
 */

let repositoryPromise: Promise<Repository> | null = null;

export function getRepository(): Promise<Repository> {
  if (!repositoryPromise) {
    repositoryPromise = createRepository({
      mode: env.dataSource,
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey,
      referenceDate: todayIso(Date.now()),
    });
  }
  return repositoryPromise;
}

export async function getServiceContext(): Promise<ServiceContext> {
  const repo = await getRepository();
  return { repo, nowMs: Date.now(), siteUrl: env.siteUrl };
}

export function todayDate(): string {
  return todayIso(Date.now());
}
