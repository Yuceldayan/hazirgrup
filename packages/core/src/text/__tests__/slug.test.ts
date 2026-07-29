import { describe, expect, it } from 'vitest';
import {
  composeSlug,
  isValidSlug,
  slugify,
  transliterateTurkish,
  uniqueSlug,
} from '../slug';

describe('transliterateTurkish', () => {
  it('tüm Türkçe karakterleri çevirir', () => {
    expect(transliterateTurkish('çğıöşüÇĞİÖŞÜ')).toBe('cgiosucgiosu');
  });

  it('şapkalı harfleri çevirir', () => {
    expect(transliterateTurkish('Hakkâri')).toBe('Hakkari');
  });

  it('ASCII metni değiştirmez', () => {
    expect(transliterateTurkish('Merkez 2024')).toBe('Merkez 2024');
  });
});

describe('slugify', () => {
  it('Türkçe metni slug yapar', () => {
    expect(slugify('Hakkâri Şemdinli Halı Saha')).toBe('hakkari-semdinli-hali-saha');
  });

  it('büyük İ harfini doğru çevirir', () => {
    expect(slugify('İstanbul')).toBe('istanbul');
    expect(slugify('IĞDIR')).toBe('igdir');
  });

  it('birden fazla boşluğu tek tire yapar', () => {
    expect(slugify('Kafe    ve   Restoran')).toBe('kafe-ve-restoran');
  });

  it('& işaretini "ve" yapar', () => {
    expect(slugify('Kahve & Tatlı')).toBe('kahve-ve-tatli');
  });

  it('noktalama işaretlerini temizler', () => {
    expect(slugify("Ali'nin Yeri (Merkez) — 2. Şube!")).toBe('ali-nin-yeri-merkez-2-sube');
  });

  it('baştaki ve sondaki tireleri temizler', () => {
    expect(slugify('   -- Merkez --   ')).toBe('merkez');
  });

  it('boş girdide boş string döner', () => {
    expect(slugify('')).toBe('');
    expect(slugify('!!!')).toBe('');
  });

  it('sayı içeren metni korur', () => {
    expect(slugify('6-10 Kişilik Akşam Yemeği Paketi')).toBe('6-10-kisilik-aksam-yemegi-paketi');
  });

  it('ürettiği her slug geçerli biçimdedir', () => {
    const samples = [
      'Hakkâri',
      'Yüksekova Merkez',
      'PlayStation & Oyun Salonu',
      "Şef'in Özel Menüsü — 4 Kişilik",
      '  boşluklu  ',
      'ÇOK BÜYÜK HARFLİ İSİM',
    ];
    for (const sample of samples) {
      expect(isValidSlug(slugify(sample)), `slug: ${slugify(sample)}`).toBe(true);
    }
  });
});

describe('isValidSlug', () => {
  it.each([
    ['hakkari', true],
    ['hakkari-merkez', true],
    ['paket-2', true],
    ['Hakkari', false],
    ['hakkari_merkez', false],
    ['-hakkari', false],
    ['hakkari-', false],
    ['hakkari--merkez', false],
    ['', false],
    ['şemdinli', false],
  ])('%s → %s', (slug, expected) => {
    expect(isValidSlug(slug)).toBe(expected);
  });
});

describe('uniqueSlug', () => {
  it('çakışma yoksa temel slug döner', () => {
    expect(uniqueSlug('Merkez Şube', [])).toBe('merkez-sube');
  });

  it('çakışmada sayaç ekler', () => {
    expect(uniqueSlug('Merkez Şube', ['merkez-sube'])).toBe('merkez-sube-2');
  });

  it('ardışık çakışmalarda sayacı artırır', () => {
    expect(uniqueSlug('Merkez', ['merkez', 'merkez-2', 'merkez-3'])).toBe('merkez-4');
  });

  it('slug üretilemeyen girdide yedek değer kullanır', () => {
    expect(uniqueSlug('!!!', [])).toBe('kayit');
    expect(uniqueSlug('!!!', ['kayit'])).toBe('kayit-2');
  });
});

describe('composeSlug', () => {
  it('parçaları birleştirir', () => {
    expect(composeSlug('Kahve Durağı', 'Merkez')).toBe('kahve-duragi-merkez');
  });

  it('boş parçaları atlar', () => {
    expect(composeSlug('Kafe', null, undefined, '', 'Yüksekova')).toBe('kafe-yuksekova');
  });
});
