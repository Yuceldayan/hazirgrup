import { describe, expect, it } from 'vitest';
import { READABLE_ALPHABET } from '../../config/constants';
import {
  buildInviteUrl,
  buildShareMessage,
  buildWhatsAppShareUrl,
  checkInvitationValidity,
  generateGuestSecret,
  generateInviteToken,
  generateReservationCode,
  generateShortCode,
  hashGuestSecret,
  hashToken,
  normalizeShortCode,
  verifyTokenHash,
} from '../token';

describe('generateInviteToken', () => {
  it('URL güvenli karakterler üretir', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateInviteToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it('yeterli entropiye sahiptir (256 bit → 43 karakter base64url)', () => {
    expect(generateInviteToken().length).toBeGreaterThanOrEqual(42);
  });

  it('her çağrıda farklı token üretir', () => {
    const tokens = new Set(Array.from({ length: 500 }, () => generateInviteToken()));
    expect(tokens.size).toBe(500);
  });
});

describe('hashToken / verifyTokenHash', () => {
  it('aynı token aynı özeti üretir', () => {
    const token = generateInviteToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('özet 64 karakterlik hex değeridir', () => {
    expect(hashToken('abc')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('özet düz tokenı içermez', () => {
    const token = generateInviteToken();
    expect(hashToken(token)).not.toContain(token);
  });

  it('doğru tokenı doğrular', () => {
    const token = generateInviteToken();
    expect(verifyTokenHash(token, hashToken(token))).toBe(true);
  });

  it('yanlış tokenı reddeder', () => {
    const token = generateInviteToken();
    expect(verifyTokenHash(generateInviteToken(), hashToken(token))).toBe(false);
  });

  it('bozuk özet değerinde çökmeden false döner', () => {
    expect(verifyTokenHash('abc', 'gecersiz-hex')).toBe(false);
    expect(verifyTokenHash('abc', '')).toBe(false);
  });
});

describe('generateShortCode', () => {
  it('8 karakter üretir', () => {
    expect(generateShortCode()).toHaveLength(8);
  });

  it('yalnızca okunabilir alfabeyi kullanır', () => {
    for (let i = 0; i < 200; i += 1) {
      for (const char of generateShortCode()) {
        expect(READABLE_ALPHABET, `beklenmeyen karakter: ${char}`).toContain(char);
      }
    }
  });

  it('karıştırılabilir karakterler (I, L, O, U) içermez', () => {
    const codes = Array.from({ length: 200 }, () => generateShortCode()).join('');
    expect(codes).not.toMatch(/[ILOU]/);
  });

  it('makul ölçüde benzersizdir', () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateShortCode()));
    expect(codes.size).toBe(1000);
  });
});

describe('generateReservationCode', () => {
  it('HG- önekiyle 6 karakter üretir', () => {
    const code = generateReservationCode();
    expect(code).toMatch(/^HG-[0-9A-Z]{6}$/);
    expect(code).not.toMatch(/[ILOU]/);
  });
});

describe('normalizeShortCode', () => {
  it('küçük harfi büyütür ve boşlukları temizler', () => {
    expect(normalizeShortCode(' a2 c4 e6 g8 ')).toBe('A2C4E6G8');
  });

  it('karıştırılan karakterleri düzeltir', () => {
    expect(normalizeShortCode('O1IL')).toBe('0111');
    expect(normalizeShortCode('U')).toBe('V');
  });

  it('geçersiz karakterleri atar', () => {
    expect(normalizeShortCode('A2-C4/E6')).toBe('A2C4E6');
  });
});

describe('misafir sırrı', () => {
  it('her çağrıda farklı üretilir', () => {
    const secrets = new Set(Array.from({ length: 200 }, () => generateGuestSecret()));
    expect(secrets.size).toBe(200);
  });

  it('özet düz sırrı açığa çıkarmaz', () => {
    const secret = generateGuestSecret();
    const hash = hashGuestSecret(secret);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(secret);
  });
});

describe('davet bağlantısı ve paylaşım', () => {
  it('bağlantıyı doğru kurar', () => {
    expect(buildInviteUrl('https://hazirgrup.app', 'abc123')).toBe(
      'https://hazirgrup.app/davet/abc123',
    );
  });

  it('sondaki eğik çizgiyi tekrarlamaz', () => {
    expect(buildInviteUrl('https://hazirgrup.app/', 'abc')).toBe('https://hazirgrup.app/davet/abc');
  });

  it('paylaşım metni gizli bilgi içermez', () => {
    const message = buildShareMessage({
      planName: 'Cuma Akşamı Buluşması',
      dateLabel: '14 Ağustos Cuma, 20:00',
      districtName: 'Merkez',
      inviteUrl: 'https://hazirgrup.app/davet/abc',
    });

    expect(message).toContain('Cuma Akşamı Buluşması');
    expect(message).toContain('14 Ağustos Cuma');
    expect(message).toContain('Merkez');
    expect(message).toContain('https://hazirgrup.app/davet/abc');
    // Gizlilik: bütçe, telefon veya isim listesi paylaşılmaz
    expect(message).not.toMatch(/₺|bütçe|telefon/i);
  });

  it('ilçe yoksa metin bozulmaz', () => {
    const message = buildShareMessage({
      planName: 'Plan',
      dateLabel: 'Yarın',
      districtName: null,
      inviteUrl: 'https://x/davet/a',
    });
    expect(message).toContain('Yarın');
    expect(message).not.toContain('·');
  });

  it('WhatsApp bağlantısını kodlar', () => {
    const url = buildWhatsAppShareUrl('Merhaba & hoş geldin');
    expect(url).toBe('https://wa.me/?text=Merhaba%20%26%20ho%C5%9F%20geldin');
  });
});

describe('checkInvitationValidity', () => {
  const now = new Date('2026-08-10T12:00:00.000Z').getTime();

  it('geçerli daveti kabul eder', () => {
    const result = checkInvitationValidity(
      { revokedAt: null, expiresAt: '2026-08-20T00:00:00.000Z' },
      now,
    );
    expect(result.isValid).toBe(true);
    expect(result.reason).toBe('ok');
  });

  it('süresi olmayan daveti kabul eder', () => {
    expect(checkInvitationValidity({ revokedAt: null, expiresAt: null }, now).isValid).toBe(true);
  });

  it('iptal edilmiş daveti reddeder ve yol gösterir', () => {
    const result = checkInvitationValidity(
      { revokedAt: '2026-08-01T00:00:00.000Z', expiresAt: null },
      now,
    );
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('revoked');
    expect(result.userMessage).toContain('Planı oluşturan arkadaşından');
  });

  it('süresi geçmiş daveti reddeder', () => {
    const result = checkInvitationValidity(
      { revokedAt: null, expiresAt: '2026-08-01T00:00:00.000Z' },
      now,
    );
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('bulunamayan daveti reddeder', () => {
    const result = checkInvitationValidity(null, now);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('not_found');
    expect(result.userMessage.length).toBeGreaterThan(0);
  });
});
