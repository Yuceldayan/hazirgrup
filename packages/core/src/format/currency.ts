import type { Kurus } from '@hazirgrup/types';

/**
 * Para biçimlendirme. Tutarlar kuruş cinsinden tam sayıdır (D-014).
 */

const TRY_FORMATTER = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const TRY_FORMATTER_WITH_CENTS = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Kuruşu okunabilir Türk Lirası metnine çevirir.
 *
 * @example formatCurrency(25000) → "250 ₺"
 * @example formatCurrency(25050) → "250,50 ₺"
 */
export function formatCurrency(amount: Kurus): string {
  const lira = amount / 100;
  const hasCents = amount % 100 !== 0;
  const formatted = hasCents ? TRY_FORMATTER_WITH_CENTS.format(lira) : TRY_FORMATTER.format(lira);
  return `${formatted} ₺`;
}

/** @example formatPerPerson(25000) → "kişi başı 250 ₺" */
export function formatPerPerson(amount: Kurus): string {
  return `kişi başı ${formatCurrency(amount)}`;
}

/** @example formatPriceRange(20000, 35000) → "200 – 350 ₺" */
export function formatPriceRange(min: Kurus, max: Kurus): string {
  if (min === max) return formatCurrency(min);
  const lo = min / 100;
  const hi = max / 100;
  return `${TRY_FORMATTER.format(lo)} – ${TRY_FORMATTER.format(hi)} ₺`;
}

/** @example formatFrom(20000) → "200 ₺'den başlayan" */
export function formatFrom(amount: Kurus): string {
  return `${formatCurrency(amount)}'den başlayan`;
}

/** Lira cinsinden kullanıcı girdisini kuruşa çevirir. Geçersizse null. */
export function parseLiraToKurus(input: string | number): Kurus | null {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) return null;
    return Math.round(input * 100);
  }

  const cleaned = input
    .trim()
    .replace(/[₺\s]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

  if (cleaned === '') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Kuruşu lira sayısına çevirir (form alanlarında gösterim için). */
export function kurusToLira(amount: Kurus): number {
  return amount / 100;
}

/** Lira sayısını kuruşa çevirir. */
export function liraToKurus(lira: number): Kurus {
  return Math.round(lira * 100);
}
