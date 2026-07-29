import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { env, isProduction } from '@/lib/env';

/**
 * Oturum ve misafir kimliği cookie'leri.
 *
 * Güvenlik (docs/SECURITY_MODEL.md §2, §5):
 *  - HttpOnly + SameSite=Lax + Secure (üretimde)
 *  - Erişim tokenı localStorage'a yazılmaz
 *  - Misafir sırrı yalnızca cookie'de; veritabanında SHA-256 özeti tutulur
 */

const SESSION_COOKIE = 'hg_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 gün
const GUEST_COOKIE_PREFIX = 'hg_guest_';
const GUEST_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 gün

function sign(payload: string): string {
  return createHmac('sha256', env.sessionSecret).update(payload).digest('base64url');
}

function verify(payload: string, signature: string): boolean {
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

interface SessionPayload {
  userId: string;
  expiresAt: number;
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

function decode(value: string): SessionPayload | null {
  const separator = value.lastIndexOf('.');
  if (separator <= 0) return null;

  const body = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!verify(body, signature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof parsed.userId !== 'string' || typeof parsed.expiresAt !== 'number') return null;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  path: '/',
} as const;

// ---------------------------------------------------------------------------
// Oturum
// ---------------------------------------------------------------------------

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    encode({ userId, expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 }),
    { ...baseCookieOptions, maxAge: SESSION_MAX_AGE_SECONDS },
  );
}

export async function readSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decode(raw)?.userId ?? null;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Misafir kimliği (plan başına)
// ---------------------------------------------------------------------------

function guestCookieName(planId: string): string {
  // Cookie adı yalnızca güvenli karakterler içermeli.
  return `${GUEST_COOKIE_PREFIX}${planId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

export async function readGuestSecret(planId: string): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(guestCookieName(planId))?.value;
  if (!raw) return null;

  const separator = raw.lastIndexOf('.');
  if (separator <= 0) return null;
  const body = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (!verify(body, signature)) return null;
  return body;
}

export async function writeGuestSecret(planId: string, secret: string): Promise<void> {
  const store = await cookies();
  store.set(guestCookieName(planId), `${secret}.${sign(secret)}`, {
    ...baseCookieOptions,
    maxAge: GUEST_MAX_AGE_SECONDS,
  });
}

// ---------------------------------------------------------------------------
// Hız sınırı kimliği
// ---------------------------------------------------------------------------

/**
 * İstek sahibini hız sınırı için tanımlar.
 * IP başlığı yoksa oturum/misafir kimliğine düşer; hiçbiri yoksa sabit anahtar
 * kullanılır (kötü senaryoda sınır tüm anonim istekleri kapsar).
 */
export function rateLimitIdentifier(
  headers: Headers,
  fallback: string | null = null,
): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headers.get('x-real-ip') || null;
  return ip ?? fallback ?? 'anonim';
}
