import { constantTimeEquals, randomBytes, sha256Hex, toBase64Url } from '../crypto/index';
import {
  INVITE_SHORT_CODE_LENGTH,
  INVITE_TOKEN_BYTES,
  READABLE_ALPHABET,
  RESERVATION_CODE_LENGTH,
} from '../config/constants';

/**
 * Davet tokenı ve kodları.
 *
 * Güvenlik kararı (docs/SECURITY_MODEL.md §4): token veritabanında **düz metin
 * saklanmaz**; yalnızca SHA-256 özeti tutulur. Düz token sadece paylaşılan
 * bağlantıda bulunur.
 */

/** 256-bit kriptografik davet tokenı üretir. */
export function generateInviteToken(): string {
  return toBase64Url(randomBytes(INVITE_TOKEN_BYTES));
}

/** Token'ın veritabanında saklanacak özeti. */
export function hashToken(token: string): string {
  return sha256Hex(token);
}

/** Zamanlama saldırılarına karşı güvenli özet karşılaştırması. */
export function verifyTokenHash(token: string, expectedHash: string): boolean {
  return constantTimeEquals(hashToken(token), expectedHash);
}

/** Belirtilen alfabeden kriptografik rastgele kod üretir (modulo yanlılığı olmadan). */
function randomFromAlphabet(length: number, alphabet: string): string {
  const alphabetLength = alphabet.length;
  const maxUnbiased = Math.floor(256 / alphabetLength) * alphabetLength;
  let out = '';

  while (out.length < length) {
    const bytes = randomBytes(length * 2);
    for (const byte of bytes) {
      if (out.length >= length) break;
      if (byte >= maxUnbiased) continue;
      out += alphabet[byte % alphabetLength];
    }
  }
  return out;
}

/**
 * Sözlü paylaşım için kısa davet kodu.
 * Karıştırılabilir karakterler (I, L, O, U) alfabede yoktur.
 */
export function generateShortCode(): string {
  return randomFromAlphabet(INVITE_SHORT_CODE_LENGTH, READABLE_ALPHABET);
}

/** Rezervasyon kodu — `HG-XXXXXX` (D-018). */
export function generateReservationCode(): string {
  return `HG-${randomFromAlphabet(RESERVATION_CODE_LENGTH, READABLE_ALPHABET)}`;
}

/** Kullanıcının girdiği kodu normalleştirir (küçük harf, benzer karakterler). */
export function normalizeShortCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    // Sık karıştırılan karakterleri alfabedeki karşılığına çevir
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/U/g, 'V');
}

/** Misafir katılımcı için cookie'de tutulacak gizli değer. */
export function generateGuestSecret(): string {
  return toBase64Url(randomBytes(32));
}

/** Misafir gizli değerinin veritabanında saklanacak özeti. */
export function hashGuestSecret(secret: string): string {
  return sha256Hex(secret);
}

// ---------------------------------------------------------------------------
// Davet bağlantısı ve paylaşım
// ---------------------------------------------------------------------------

export function buildInviteUrl(siteUrl: string, token: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  return `${base}/davet/${token}`;
}

export interface InviteShareInput {
  planName: string;
  dateLabel: string;
  districtName: string | null;
  inviteUrl: string;
}

/**
 * WhatsApp paylaşım metni.
 *
 * Gizlilik: bütçe, katılımcı isimleri veya özel not **paylaşılmaz**
 * (docs/SEO_STRATEGY.md §12).
 */
export function buildShareMessage(input: InviteShareInput): string {
  const location = input.districtName ? ` · ${input.districtName}` : '';
  return [
    `${input.planName}`,
    `${input.dateLabel}${location}`,
    '',
    'Geliyor musun? Uygun mekân paketlerini birlikte oylayalım:',
    input.inviteUrl,
  ].join('\n');
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Geçerlilik kontrolü
// ---------------------------------------------------------------------------

export interface InvitationValidity {
  isValid: boolean;
  reason: 'ok' | 'revoked' | 'expired' | 'not_found';
  userMessage: string;
}

export function checkInvitationValidity(
  invitation: { revokedAt: string | null; expiresAt: string | null } | null,
  nowMs: number,
): InvitationValidity {
  if (!invitation) {
    return {
      isValid: false,
      reason: 'not_found',
      userMessage:
        'Bu davet bağlantısı geçerli değil. Planı oluşturan arkadaşından yeni bir bağlantı isteyebilirsin.',
    };
  }

  if (invitation.revokedAt) {
    return {
      isValid: false,
      reason: 'revoked',
      userMessage:
        'Bu davet bağlantısı iptal edilmiş. Planı oluşturan arkadaşından güncel bağlantıyı isteyebilirsin.',
    };
  }

  if (invitation.expiresAt && new Date(invitation.expiresAt).getTime() < nowMs) {
    return {
      isValid: false,
      reason: 'expired',
      userMessage:
        'Bu davet bağlantısının süresi dolmuş. Planı oluşturan arkadaşından yeni bir bağlantı isteyebilirsin.',
    };
  }

  return { isValid: true, reason: 'ok', userMessage: '' };
}
