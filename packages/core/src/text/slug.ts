/**
 * SEO dostu slug üretimi.
 *
 * Türkçe karakterler ASCII karşılıklarına çevrilir; sonuç yalnızca
 * `[a-z0-9-]` içerir ve `^[a-z0-9]+(-[a-z0-9]+)*$` kalıbına uyar.
 */

const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  i: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Î: 'i',
  û: 'u',
  Û: 'u',
  é: 'e',
  É: 'e',
};

/** Türkçe karakterleri ASCII karşılığına çevirir, diğer metni değiştirmez. */
export function transliterateTurkish(input: string): string {
  let out = '';
  for (const char of input) {
    out += TURKISH_MAP[char] ?? char;
  }
  return out;
}

/**
 * Metinden slug üretir.
 *
 * @example slugify("Hakkâri Şemdinli Halı Saha") → "hakkari-semdinli-hali-saha"
 */
export function slugify(input: string): string {
  if (!input) return '';

  return transliterateTurkish(input)
    .normalize('NFD')
    // Birleşik aksan işaretlerini at (U+0300–U+036F)
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // & → ve
    .replace(/&/g, ' ve ')
    // Alfanümerik olmayan her şey tire
    .replace(/[^a-z0-9]+/g, '-')
    // Baştaki/sondaki tireleri temizle
    .replace(/^-+|-+$/g, '');
}

/** Slug'ın geçerli biçimde olup olmadığını kontrol eder. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * Var olan slug'lar arasında benzersiz bir slug üretir.
 * Çakışma varsa `-2`, `-3` … eki verilir.
 */
export function uniqueSlug(input: string, existing: Iterable<string>): string {
  const base = slugify(input) || 'kayit';
  const taken = new Set(existing);
  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}

/**
 * Birden fazla parçadan slug birleştirir.
 * @example composeSlug("Kahve Durağı", "Merkez") → "kahve-duragi-merkez"
 */
export function composeSlug(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .map((p) => slugify(p))
    .filter(Boolean)
    .join('-');
}
