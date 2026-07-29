/**
 * Temel tipler ve birimler.
 *
 * Para birimi kuruş cinsinden tam sayı olarak saklanır (bkz. docs/DECISIONS.md D-014).
 * 250,00 ₺ → 25000
 */

/** Kuruş cinsinden tam sayı tutar. */
export type Kurus = number;

/** ISO 8601 tarih (YYYY-MM-DD). */
export type IsoDate = string;

/** 24 saat biçiminde saat (HH:mm). */
export type ClockTime = string;

/** ISO 8601 tarih-saat. */
export type IsoDateTime = string;

/** Pazar = 0 … Cumartesi = 6 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export const WEEKDAY_LABELS: Readonly<Record<Weekday, string>> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
};

export const WEEKDAY_SHORT_LABELS: Readonly<Record<Weekday, string>> = {
  0: 'Paz',
  1: 'Pzt',
  2: 'Sal',
  3: 'Çar',
  4: 'Per',
  5: 'Cum',
  6: 'Cmt',
};

/** Sayfalanmış sonuç zarfı. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** SEO alanları — şehir, ilçe, kategori, işletme, paket ve yardım içeriklerinde ortak. */
export interface SeoFields {
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  ogImageUrl: string | null;
  isIndexable: boolean;
}

export const EMPTY_SEO_FIELDS: SeoFields = {
  seoTitle: null,
  seoDescription: null,
  seoCanonical: null,
  ogImageUrl: null,
  isIndexable: true,
};
