import { createHash, randomBytes as nodeRandomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { constantTimeEquals, randomBytes, sha256Hex, toBase64Url, toHex } from '../index';

describe('sha256Hex', () => {
  it('bilinen test vektörlerini doğru hesaplar', () => {
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(sha256Hex('The quick brown fox jumps over the lazy dog')).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    );
  });

  it('Node.js crypto ile birebir aynı sonucu üretir', () => {
    const samples = [
      '',
      'a',
      'hakkari',
      'Türkçe karakterler: çğıöşü ÇĞİÖŞÜ',
      'x'.repeat(55), // tek blok sınırı
      'y'.repeat(56), // ek blok gerektiren sınır
      'z'.repeat(64),
      'w'.repeat(1000),
      JSON.stringify({ planId: 'plan-1', token: 'abc-123' }),
    ];

    for (const sample of samples) {
      const expected = createHash('sha256').update(sample, 'utf8').digest('hex');
      expect(sha256Hex(sample), `girdi uzunluğu ${sample.length}`).toBe(expected);
    }
  });

  it('rastgele girdilerde Node.js ile uyumludur', () => {
    for (let i = 0; i < 100; i += 1) {
      const sample = nodeRandomBytes(i * 3 + 1).toString('base64');
      expect(sha256Hex(sample)).toBe(createHash('sha256').update(sample, 'utf8').digest('hex'));
    }
  });

  it('64 karakterlik hex döner', () => {
    expect(sha256Hex('herhangi bir metin')).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('randomBytes', () => {
  it('istenen uzunlukta üretir', () => {
    expect(randomBytes(32)).toHaveLength(32);
    expect(randomBytes(1)).toHaveLength(1);
  });

  it('her çağrıda farklı değer üretir', () => {
    const values = new Set(Array.from({ length: 200 }, () => toHex(randomBytes(16))));
    expect(values.size).toBe(200);
  });
});

describe('toBase64Url', () => {
  it('Node.js base64url ile aynı sonucu üretir', () => {
    for (let i = 0; i < 60; i += 1) {
      const bytes = nodeRandomBytes(i + 1);
      expect(toBase64Url(new Uint8Array(bytes))).toBe(bytes.toString('base64url'));
    }
  });

  it('URL güvenli karakterler üretir', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(toBase64Url(randomBytes(32))).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});

describe('toHex', () => {
  it('baytları hex biçimine çevirir', () => {
    expect(toHex(new Uint8Array([0, 15, 16, 255]))).toBe('000f10ff');
  });
});

describe('constantTimeEquals', () => {
  it('aynı metinlerde true döner', () => {
    expect(constantTimeEquals('abc123', 'abc123')).toBe(true);
  });

  it('farklı metinlerde false döner', () => {
    expect(constantTimeEquals('abc123', 'abc124')).toBe(false);
  });

  it('farklı uzunlukta false döner', () => {
    expect(constantTimeEquals('abc', 'abcd')).toBe(false);
  });

  it('boş metinleri karşılaştırır', () => {
    expect(constantTimeEquals('', '')).toBe(true);
  });
});
