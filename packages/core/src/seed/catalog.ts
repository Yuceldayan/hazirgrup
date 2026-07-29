import type { Category, Country, District, City, Preference } from '@hazirgrup/types';

/**
 * Konum ve sınıflandırma seed verisi.
 *
 * Hakkâri **sabit kodlanmamıştır**: burada yalnızca başlangıç verisi olarak
 * bulunur. Yeni şehir yönetici panelinden kod değişikliği olmadan eklenip
 * aktif edilebilir.
 */

export const COUNTRIES: Country[] = [
  { id: 'country-tr', code: 'TR', name: 'Türkiye', slug: 'turkiye', isActive: true },
];

export const CITIES: City[] = [
  {
    id: 'city-hakkari',
    countryId: 'country-tr',
    name: 'Hakkâri',
    slug: 'hakkari',
    intro:
      'Hakkâri’de arkadaş grubunuzla buluşmak için kafe, halı saha ve oyun salonu paketlerini tek yerden karşılaştırın. Kişi sayınızı ve bütçenizi girin, uygun paketleri görün, arkadaşlarınızı davet edip birlikte oylayın.',
    isActive: true,
    isPublic: true,
    sortOrder: 1,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
  },
  {
    // Yönetici panelinden aktifleştirme akışını göstermek için hazır bekleyen şehir.
    id: 'city-van',
    countryId: 'country-tr',
    name: 'Van',
    slug: 'van',
    intro: null,
    isActive: false,
    isPublic: false,
    sortOrder: 2,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: false,
  },
];

function district(
  id: string,
  name: string,
  slug: string,
  sortOrder: number,
  intro: string | null,
): District {
  return {
    id,
    cityId: 'city-hakkari',
    name,
    slug,
    intro,
    isActive: true,
    isPublic: true,
    sortOrder,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
  };
}

export const DISTRICTS: District[] = [
  district(
    'district-merkez',
    'Merkez',
    'merkez',
    1,
    'Hakkâri Merkez’de kalabalık arkadaş grupları için en çok tercih edilen kafe ve oyun salonu paketleri burada.',
  ),
  district(
    'district-yuksekova',
    'Yüksekova',
    'yuksekova',
    2,
    'Yüksekova’da halı saha ve grup yemeği paketlerini kişi sayınıza göre filtreleyin.',
  ),
  district(
    'district-semdinli',
    'Şemdinli',
    'semdinli',
    3,
    'Şemdinli’de arkadaş buluşmaları için uygun bütçeli mekân paketleri.',
  ),
  district('district-cukurca', 'Çukurca', 'cukurca', 4, null),
  district('district-derecik', 'Derecik', 'derecik', 5, null),
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-cafe',
    key: 'cafe_restaurant',
    name: 'Kafe & Restoran',
    slug: 'kafe-restoran',
    icon: 'coffee',
    description:
      'Kahve, tatlı, kahvaltı ve akşam yemeği paketleri. Grup masası ayırtın, kişi başı fiyatı önceden görün.',
    isActive: true,
    sortOrder: 1,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
  },
  {
    id: 'cat-pitch',
    key: 'football_pitch',
    name: 'Halı Saha',
    slug: 'hali-saha',
    icon: 'football',
    description:
      'Saatlik halı saha kiralama paketleri. Takım sayınıza göre uygun saatleri ve ek hizmetleri karşılaştırın.',
    isActive: true,
    sortOrder: 2,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
  },
  {
    id: 'cat-game',
    key: 'game_lounge',
    name: 'PlayStation & Oyun Salonu',
    slug: 'oyun-salonu',
    icon: 'gamepad',
    description:
      'PlayStation, bilardo ve turnuva paketleri. Grup halinde saatlik kiralama seçeneklerini görün.',
    isActive: true,
    sortOrder: 3,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
  },
];

export const PREFERENCES: Preference[] = [
  { key: 'outdoor', label: 'Açık alan / bahçe', categoryKey: 'cafe_restaurant', sortOrder: 1 },
  { key: 'quiet', label: 'Sakin ortam', categoryKey: 'cafe_restaurant', sortOrder: 2 },
  { key: 'live_music', label: 'Canlı müzik', categoryKey: 'cafe_restaurant', sortOrder: 3 },
  { key: 'projector', label: 'Projeksiyon / maç yayını', categoryKey: 'cafe_restaurant', sortOrder: 4 },
  { key: 'birthday_setup', label: 'Doğum günü süslemesi', categoryKey: 'cafe_restaurant', sortOrder: 5 },
  { key: 'vegetarian', label: 'Vejetaryen seçenek', categoryKey: 'cafe_restaurant', sortOrder: 6 },
  { key: 'private_room', label: 'Ayrı salon', categoryKey: 'cafe_restaurant', sortOrder: 7 },

  { key: 'indoor_pitch', label: 'Kapalı saha', categoryKey: 'football_pitch', sortOrder: 1 },
  { key: 'shower', label: 'Duş ve soyunma odası', categoryKey: 'football_pitch', sortOrder: 2 },
  { key: 'equipment', label: 'Forma / top dahil', categoryKey: 'football_pitch', sortOrder: 3 },
  { key: 'night_lighting', label: 'Gece aydınlatması', categoryKey: 'football_pitch', sortOrder: 4 },

  { key: 'ps5', label: 'PlayStation 5', categoryKey: 'game_lounge', sortOrder: 1 },
  { key: 'tournament', label: 'Turnuva düzeni', categoryKey: 'game_lounge', sortOrder: 2 },
  { key: 'billiards', label: 'Bilardo', categoryKey: 'game_lounge', sortOrder: 3 },

  { key: 'parking', label: 'Otopark', categoryKey: null, sortOrder: 20 },
  { key: 'wifi', label: 'Wi-Fi', categoryKey: null, sortOrder: 21 },
  { key: 'accessible', label: 'Engelli erişimi', categoryKey: null, sortOrder: 22 },
];

export const PREFERENCE_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  PREFERENCES.map((p) => [p.key, p.label]),
);
