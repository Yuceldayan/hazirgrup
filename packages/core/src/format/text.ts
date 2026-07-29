/** Sayı ve metin biçimlendirme yardımcıları. */

const NUMBER_FORMATTER = new Intl.NumberFormat('tr-TR');

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

/** @example formatPeople(7) → "7 kişi" */
export function formatPeople(count: number): string {
  return `${formatNumber(count)} kişi`;
}

/** @example formatPeopleRange(4, 6) → "4–6 kişi" */
export function formatPeopleRange(min: number, max: number): string {
  if (min === max) return formatPeople(min);
  return `${min}–${max} kişi`;
}

/** @example formatDuration(150) → "2 saat 30 dakika" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dakika`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} saat ${rest} dakika` : `${hours} saat`;
}

/**
 * Metni kelime sınırında kısaltır.
 * SEO başlık/açıklama üretiminde kullanılır.
 */
export function truncateAtWord(input: string, maxLength: number, suffix = '…'): string {
  const text = input.trim();
  if (text.length <= maxLength) return text;

  const limit = maxLength - suffix.length;
  if (limit <= 0) return suffix;

  const sliced = text.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace > limit * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.replace(/[\s.,;:!?-]+$/u, '')}${suffix}`;
}

/** Birden fazla satır/boşluğu tek boşluğa indirger. */
export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Listeyi Türkçe doğal biçimde birleştirir.
 * @example joinTurkish(['kafe', 'halı saha', 'oyun salonu']) → "kafe, halı saha ve oyun salonu"
 */
export function joinTurkish(items: string[], conjunction = 've'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0] ?? '';
  const head = items.slice(0, -1).join(', ');
  const tail = items[items.length - 1];
  return `${head} ${conjunction} ${tail}`;
}

/** Adın baş harflerini döner (avatar için). */
export function initialsOf(name: string): string {
  const parts = collapseWhitespace(name).split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toLocaleUpperCase('tr-TR');
  return `${(parts[0] ?? '')[0] ?? ''}${(parts[parts.length - 1] ?? '')[0] ?? ''}`.toLocaleUpperCase(
    'tr-TR',
  );
}

/** Telefon numarasını okunabilir biçimde gösterir. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('90') ? digits.slice(2) : digits;
  if (local.length !== 10) return phone;
  return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
}

/** WhatsApp bağlantısı için uluslararası biçim (yalnız rakam). */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90')) return digits;
  if (digits.startsWith('0')) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

/** Yüzde değerini metne çevirir. */
export function formatPercent(ratio: number): string {
  return `%${Math.round(ratio * 100)}`;
}
