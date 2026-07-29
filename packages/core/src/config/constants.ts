/**
 * Domain sabitleri. Değerlerin gerekçeleri docs/DECISIONS.md içindedir.
 */

/** Esnek saat seçildiğinde kabul edilen sapma (dakika). D-023 */
export const FLEXIBLE_TIME_TOLERANCE_MINUTES = 90;

/** Esnek saat seçilmediğinde kabul edilen küçük sapma (dakika). */
export const STRICT_TIME_TOLERANCE_MINUTES = 30;

/** Kişi başı bütçenin aşılabileceği üst oran. D-024 */
export const BUDGET_OVERRUN_TOLERANCE = 0.15;

/** "Bütçene uygun" etiketinin verildiği üst sınır (aşım yok). */
export const BUDGET_EXACT_TOLERANCE = 0;

/** Katılım tahmininde "kararsız" katılımcıların ağırlığı. D-025 */
export const MAYBE_PARTICIPANT_WEIGHT = 0.5;

/** Bir sayfanın indekslenebilmesi için gereken minimum aktif paket sayısı. */
export const INDEXABLE_MIN_PACKAGES = 3;

/** Bir sayfanın indekslenebilmesi için gereken minimum doğrulanmış işletme sayısı. */
export const INDEXABLE_MIN_BUSINESSES = 1;

/** Sitemap parçalama eşiği. */
export const SITEMAP_CHUNK_SIZE = 5000;

/** SEO metin uzunluk sınırları. */
export const SEO_TITLE_MAX_LENGTH = 60;
export const SEO_DESCRIPTION_MAX_LENGTH = 155;

/** Davet tokenı bayt uzunluğu (256 bit). */
export const INVITE_TOKEN_BYTES = 32;

/** Sözlü paylaşım için kısa davet kodu uzunluğu. */
export const INVITE_SHORT_CODE_LENGTH = 8;

/** Rezervasyon kodu uzunluğu (HG- öneki hariç). D-018 */
export const RESERVATION_CODE_LENGTH = 6;

/**
 * Crockford Base32 — karıştırılabilir karakterler (I, L, O, U) çıkarılmıştır.
 * Telefonda sözlü okunabilirlik için.
 */
export const READABLE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Plan sihirbazı adım sayısı. */
export const PLAN_WIZARD_STEPS = 7;

/** Hızlı kişi sayısı seçenekleri. */
export const GROUP_SIZE_PRESETS = [
  { key: '2-4', label: '2–4 kişi', min: 2, max: 4, estimated: 3 },
  { key: '5-8', label: '5–8 kişi', min: 5, max: 8, estimated: 6 },
  { key: '9-14', label: '9–14 kişi', min: 9, max: 14, estimated: 11 },
  { key: '15+', label: '15+ kişi', min: 15, max: 30, estimated: 18 },
] as const;

/** Sık kullanılan saat aralıkları. */
export const TIME_SLOT_PRESETS = [
  { key: 'afternoon', label: 'Öğleden sonra', startTime: '14:00', endTime: '17:00' },
  { key: 'early_evening', label: 'Akşamüstü', startTime: '17:00', endTime: '20:00' },
  { key: 'evening', label: 'Akşam', startTime: '20:00', endTime: '23:00' },
  { key: 'late', label: 'Gece', startTime: '22:00', endTime: '01:00' },
] as const;

/** Realtime kanalı kurulamazsa kullanılacak yoklama aralığı (ms). D-027 */
export const REALTIME_POLL_INTERVAL_MS = 5000;

/** Varsayılan sayfa boyutu. */
export const DEFAULT_PAGE_SIZE = 20;

/** Kök seviyede şehir slug'ı ile çakışmaması gereken yollar. D-006 */
export const RESERVED_SLUGS: readonly string[] = [
  'admin',
  'api',
  'auth',
  'business',
  'davet',
  'hesap',
  'kategoriler',
  'legal',
  'mekanlar',
  'nasil-calisir',
  'og',
  'paketler',
  'plan',
  'rehber',
  'rezervasyon',
  'sehirler',
  'sitemap.xml',
  'robots.txt',
  'sss',
  'yardim',
  '_next',
  'favicon.ico',
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

/** Rate limit tanımları (docs/SECURITY_MODEL.md §6). */
export const RATE_LIMITS = {
  signIn: { limit: 10, windowMs: 15 * 60_000 },
  signUp: { limit: 5, windowMs: 60 * 60_000 },
  passwordReset: { limit: 5, windowMs: 60 * 60_000 },
  guestJoin: { limit: 20, windowMs: 60 * 60_000 },
  vote: { limit: 30, windowMs: 60 * 60_000 },
  createReservation: { limit: 10, windowMs: 24 * 60 * 60_000 },
  publicSearch: { limit: 120, windowMs: 60_000 },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;
