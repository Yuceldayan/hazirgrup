import 'server-only';
import { createRepository, todayIso, type Repository, type ServiceContext } from '@hazirgrup/core';
import { env } from '@/lib/env';

/**
 * Sunucu tarafı veri erişimi.
 *
 * Depo, süreç ömrü boyunca tekildir (demo modda veriler istekler arasında
 * korunur). Hangi kaynağın kullanıldığı `repo.mode` ile öğrenilebilir.
 */

let repositoryPromise: Promise<Repository> | null = null;

export function getRepository(): Promise<Repository> {
  if (!repositoryPromise) {
    repositoryPromise = createRepository({
      mode: env.dataSource,
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey,
      supabaseServiceRoleKey: env.supabaseServiceRoleKey,
      referenceDate: todayIso(Date.now()),
    });
  }
  return repositoryPromise;
}

/** Servis çağrıları için bağlam. "Şu an" her istekte yeniden okunur. */
export async function getServiceContext(): Promise<ServiceContext> {
  const repo = await getRepository();
  return { repo, nowMs: Date.now(), siteUrl: env.siteUrl };
}

export function todayDate(): string {
  return todayIso(Date.now());
}
