import type { ClockTime, IsoDate, IsoDateTime, Weekday } from '@hazirgrup/types';

/**
 * Tarih ve saat biçimlendirme.
 *
 * Bu modül saf tutulur: "şu an" değeri her zaman parametre olarak geçirilir,
 * böylece testler deterministiktir.
 */

const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

const DAY_NAMES = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
] as const;

/** `YYYY-MM-DD` metnini yerel saat diliminde Date'e çevirir. */
export function parseIsoDate(date: IsoDate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Date'i `YYYY-MM-DD` biçimine çevirir (yerel saat dilimi). */
export function toIsoDate(date: Date): IsoDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `YYYY-MM-DD` için haftanın günü (0 = Pazar). */
export function weekdayOf(date: IsoDate): Weekday {
  return parseIsoDate(date).getDay() as Weekday;
}

/** @example formatDate('2026-08-12') → "12 Ağustos Çarşamba" */
export function formatDate(date: IsoDate): string {
  const d = parseIsoDate(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAY_NAMES[d.getDay()]}`;
}

/** @example formatDateShort('2026-08-12') → "12 Ağustos" */
export function formatDateShort(date: IsoDate): string {
  const d = parseIsoDate(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** @example formatDateWithYear('2026-08-12') → "12 Ağustos 2026" */
export function formatDateWithYear(date: IsoDate): string {
  const d = parseIsoDate(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** @example formatTimeRange('20:00', '23:00') → "20:00 – 23:00" */
export function formatTimeRange(start: ClockTime | null, end: ClockTime | null): string {
  if (!start && !end) return 'Saat belirtilmedi';
  if (start && !end) return `${start}'den itibaren`;
  if (!start && end) return `${end}'e kadar`;
  return `${start} – ${end}`;
}

/**
 * Tarihi bugüne göre doğal dille ifade eder.
 * @example formatRelativeDay('2026-08-12', '2026-08-12') → "Bugün"
 */
export function formatRelativeDay(date: IsoDate, today: IsoDate): string {
  const target = parseIsoDate(date);
  const base = parseIsoDate(today);
  const diffDays = Math.round((target.getTime() - base.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Yarın';
  if (diffDays === -1) return 'Dün';
  if (diffDays > 1 && diffDays < 7) return DAY_NAMES[target.getDay()] ?? formatDateShort(date);
  return formatDateShort(date);
}

/** Tarih + saat özetini tek satırda verir. */
export function formatDateTimeSummary(
  date: IsoDate,
  start: ClockTime | null,
  end: ClockTime | null,
): string {
  const timePart = start || end ? `, ${formatTimeRange(start, end)}` : '';
  return `${formatDate(date)}${timePart}`;
}

/** `HH:mm` → gün başından itibaren dakika. Geçersizse null. */
export function timeToMinutes(time: ClockTime): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Dakikayı `HH:mm` biçimine çevirir (24 saati aşarsa döner). */
export function minutesToTime(minutes: number): ClockTime {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(normalized / 60)).padStart(2, '0');
  const m = String(normalized % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * İki saat aralığının kesişip kesişmediğini kontrol eder.
 * Gece yarısını aşan aralıklar (22:00–01:00) desteklenir.
 */
export function timeRangesOverlap(
  aStart: ClockTime,
  aEnd: ClockTime,
  bStart: ClockTime,
  bEnd: ClockTime,
): boolean {
  const a1 = timeToMinutes(aStart);
  const b1 = timeToMinutes(bStart);
  let a2 = timeToMinutes(aEnd);
  let b2 = timeToMinutes(bEnd);
  if (a1 === null || a2 === null || b1 === null || b2 === null) return false;

  if (a2 <= a1) a2 += 1440;
  if (b2 <= b1) b2 += 1440;

  return a1 < b2 && b1 < a2;
}

/**
 * Bir saatin verilen aralığa uzaklığı (dakika). Aralık içindeyse 0.
 * Gece yarısını aşan aralıkları destekler.
 */
export function minutesOutsideRange(time: ClockTime, start: ClockTime, end: ClockTime): number {
  const t = timeToMinutes(time);
  const s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (t === null || s === null || e === null) return Number.POSITIVE_INFINITY;
  if (e <= s) e += 1440;

  const candidates = [t, t + 1440];
  let best = Number.POSITIVE_INFINITY;
  for (const value of candidates) {
    if (value >= s && value <= e) return 0;
    best = Math.min(best, value < s ? s - value : value - e);
  }
  return best;
}

/** ISO tarih-saat metnini "5 dakika önce" gibi ifade eder. */
export function formatRelativeTime(iso: IsoDateTime, nowMs: number): string {
  const diffMs = nowMs - new Date(iso).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return 'Az önce';
  if (diffMinutes < 60) return `${diffMinutes} dakika önce`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} hafta önce`;
  return formatDateWithYear(toIsoDate(new Date(iso)));
}

/** Kalan süreyi "2 saat 15 dakika" gibi ifade eder. Süre bittiyse null. */
export function formatTimeRemaining(targetIso: IsoDateTime, nowMs: number): string | null {
  const diffMs = new Date(targetIso).getTime() - nowMs;
  if (diffMs <= 0) return null;

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} dakika`;

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (hours < 24) {
    return restMinutes > 0 ? `${hours} saat ${restMinutes} dakika` : `${hours} saat`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours > 0 ? `${days} gün ${restHours} saat` : `${days} gün`;
}

/** Tarihe gün ekler. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const d = parseIsoDate(date);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/**
 * "Hafta sonu" hızlı seçimi için tarih.
 * Bugün zaten hafta sonuysa bugünü, değilse gelecek Cumartesi'yi döner.
 */
export function nextWeekend(today: IsoDate): IsoDate {
  const day = parseIsoDate(today).getDay();
  if (day === 6 || day === 0) return today;
  return addDays(today, 6 - day);
}

export { MONTHS, DAY_NAMES };
