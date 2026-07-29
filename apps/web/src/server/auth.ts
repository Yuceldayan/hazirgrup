import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { AppError, type AppRole, type SessionUser } from '@hazirgrup/core';
import { getRepository } from './repository';
import { readSessionUserId } from './session';

/**
 * Sunucu tarafı yetkilendirme.
 *
 * Bu katman, veritabanı RLS'inin ÜSTÜNE eklenen ikinci savunmadır
 * (docs/SECURITY_MODEL.md §3). İstemci tarafı gizleme güvenlik sınırı değildir.
 */

/** İstek başına tek kez çözülür (React cache). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const userId = await readSessionUserId();
  if (!userId) return null;

  const repo = await getRepository();
  return repo.getSessionUser(userId);
});

export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const target = returnTo ? `?devam=${encodeURIComponent(returnTo)}` : '';
    redirect(`/auth/giris${target}`);
  }
  return user;
}

/**
 * Yetki yoksa `/yetkisiz` sayfasına yönlendirilir.
 * Ham hata sınırı yerine anlaşılır bir ekran gösterilir; içerik hiçbir koşulda
 * render edilmez (docs/SECURITY_MODEL.md §3).
 */
export async function requireRole(role: AppRole, returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (!user.roles.includes(role)) redirect('/yetkisiz');
  return user;
}

export async function requireAdmin(returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (!user.roles.includes('admin') && !user.roles.includes('moderator')) {
    redirect('/yetkisiz');
  }
  return user;
}

export interface BusinessContext {
  user: SessionUser;
  businessId: string;
  isOwner: boolean;
}

/**
 * Kullanıcının üyesi olduğu işletmeyi çözer.
 * Birden fazla işletmesi varsa ilki kullanılır (Faz 1'de çoklu işletme
 * seçici arayüzü yok — `docs/KNOWN_LIMITATIONS.md`).
 */
export async function requireBusinessMember(
  businessId?: string,
  returnTo?: string,
): Promise<BusinessContext> {
  const user = await requireUser(returnTo);
  const repo = await getRepository();
  const businesses = await repo.getBusinessesForUser(user.id);

  if (businesses.length === 0) {
    redirect('/business/basvuru');
  }

  const target = businessId
    ? businesses.find((b) => b.id === businessId)
    : businesses[0];

  if (!target) {
    throw AppError.forbidden('Bu işletmeye erişim yetkin yok.');
  }

  const members = await repo.listBusinessMembers(target.id);
  const membership = members.find((m) => m.userId === user.id);
  if (!membership) redirect('/yetkisiz');

  return { user, businessId: target.id, isOwner: membership.role === 'owner' };
}

/** Kullanıcının belirli bir role sahip olup olmadığını sessizce kontrol eder. */
export async function hasRole(role: AppRole): Promise<boolean> {
  const user = await getCurrentUser();
  return Boolean(user?.roles.includes(role));
}
