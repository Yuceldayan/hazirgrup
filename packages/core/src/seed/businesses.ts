import type {
  BranchHours,
  Business,
  BusinessBranch,
  PackageAvailability,
  VenuePackage,
  Weekday,
} from '@hazirgrup/types';

/**
 * Demo işletme, şube ve paket verileri.
 *
 * TÜM İŞLETMELER KURGUSALDIR. Gerçek işletme adı, adresi veya telefonu
 * kullanılmamıştır. Telefonlar `0500` ile başlayan geçersiz numaralardır.
 */

const SEED_TIME = '2026-01-15T09:00:00.000Z';

function hours(spec: Partial<Record<Weekday, [string, string] | null>>): BranchHours[] {
  const weekdays: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
  return weekdays.map((weekday) => {
    const entry = spec[weekday];
    if (entry === null) {
      return { weekday, opensAt: null, closesAt: null, isClosed: true };
    }
    const [opensAt, closesAt] = entry ?? ['10:00', '23:00'];
    return { weekday, opensAt, closesAt, isClosed: false };
  });
}

/** Her gün aynı saat aralığında geçerli uygunluk. */
function everyDay(startTime: string, endTime: string): PackageAvailability[] {
  return ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => ({ weekday, startTime, endTime }));
}

/** Belirli günlerde geçerli uygunluk. */
function onDays(days: Weekday[], startTime: string, endTime: string): PackageAvailability[] {
  return days.map((weekday) => ({ weekday, startTime, endTime }));
}

// ---------------------------------------------------------------------------
// İşletmeler
// ---------------------------------------------------------------------------

interface BusinessSpec {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  ownerId: string;
  phone: string;
  instagram: string | null;
  media: string;
}

const BUSINESS_SPECS: BusinessSpec[] = [
  {
    id: 'biz-01',
    name: 'Kuzey Işığı Kahve Evi',
    slug: 'kuzey-isigi-kahve-evi',
    description:
      'Merkez’de kalabalık arkadaş grupları için ayrı salonu ve geniş bahçesi olan kurgusal bir kahve evi. Kahvaltı, tatlı ve akşam yemeği paketleri sunar.',
    categoryId: 'cat-cafe',
    ownerId: 'user-owner-01',
    phone: '05001110001',
    instagram: 'kuzeyisigi_demo',
    media: 'cafe-1',
  },
  {
    id: 'biz-02',
    name: 'Semaver Bahçe',
    slug: 'semaver-bahce',
    description:
      'Geleneksel çay ve kahvaltı sunan, açık bahçesiyle yaz aylarında grup buluşmalarına uygun kurgusal işletme.',
    categoryId: 'cat-cafe',
    ownerId: 'user-owner-02',
    phone: '05001110002',
    instagram: 'semaverbahce_demo',
    media: 'cafe-2',
  },
  {
    id: 'biz-03',
    name: 'Zirve Sofrası',
    slug: 'zirve-sofrasi',
    description:
      'Yöresel tatlar sunan kurgusal restoran. 20 kişiye kadar grup masası ayırma imkânı sağlar.',
    categoryId: 'cat-cafe',
    ownerId: 'user-owner-03',
    phone: '05001110003',
    instagram: null,
    media: 'cafe-3',
  },
  {
    id: 'biz-04',
    name: 'Meydan Kahvaltı Salonu',
    slug: 'meydan-kahvalti-salonu',
    description:
      'Serpme kahvaltı ve grup brunch paketleri sunan kurgusal salon. Hafta sonu erken saatlerde yoğun çalışır.',
    categoryId: 'cat-cafe',
    ownerId: 'user-owner-04',
    phone: '05001110004',
    instagram: 'meydankahvalti_demo',
    media: 'cafe-4',
  },
  {
    id: 'biz-05',
    name: 'Gol Krallığı Halı Saha',
    slug: 'gol-kralligi-hali-saha',
    description:
      'İki kapalı, bir açık sahası bulunan kurgusal halı saha tesisi. Duş, soyunma odası ve forma kiralama hizmeti verir.',
    categoryId: 'cat-pitch',
    ownerId: 'user-owner-05',
    phone: '05001110005',
    instagram: null,
    media: 'pitch-1',
  },
  {
    id: 'biz-06',
    name: 'Yayla Spor Tesisleri',
    slug: 'yayla-spor-tesisleri',
    description:
      'Halı saha ve basketbol sahası bulunan kurgusal spor tesisi. Turnuva organizasyonlarına uygundur.',
    categoryId: 'cat-pitch',
    ownerId: 'user-owner-06',
    phone: '05001110006',
    instagram: 'yaylaspor_demo',
    media: 'pitch-2',
  },
  {
    id: 'biz-07',
    name: 'Çınaraltı Saha',
    slug: 'cinaralti-saha',
    description: 'Tek sahalı, uygun fiyatlı kurgusal halı saha işletmesi.',
    categoryId: 'cat-pitch',
    ownerId: 'user-owner-07',
    phone: '05001110007',
    instagram: null,
    media: 'pitch-3',
  },
  {
    id: 'biz-08',
    name: 'Pixel Arena Oyun Salonu',
    slug: 'pixel-arena-oyun-salonu',
    description:
      'PlayStation 5 istasyonları, turnuva ekranı ve bilardo masaları bulunan kurgusal oyun salonu.',
    categoryId: 'cat-game',
    ownerId: 'user-owner-08',
    phone: '05001110008',
    instagram: 'pixelarena_demo',
    media: 'game-1',
  },
  {
    id: 'biz-09',
    name: 'Konsol Kulübü',
    slug: 'konsol-kulubu',
    description: 'Grup turnuvalarına özel salon ayıran kurgusal oyun merkezi.',
    categoryId: 'cat-game',
    ownerId: 'user-owner-09',
    phone: '05001110009',
    instagram: null,
    media: 'game-2',
  },
  {
    id: 'biz-10',
    name: 'Şelale Teras Kafe',
    slug: 'selale-teras-kafe',
    description:
      'Teras katında projeksiyonlu maç yayını yapan, doğum günü organizasyonlarına uygun kurgusal kafe.',
    categoryId: 'cat-cafe',
    ownerId: 'user-owner-10',
    phone: '05001110010',
    instagram: 'selaleteras_demo',
    media: 'cafe-5',
  },
];

export const BUSINESSES: Business[] = BUSINESS_SPECS.map((spec) => ({
  id: spec.id,
  ownerId: spec.ownerId,
  name: spec.name,
  slug: spec.slug,
  description: spec.description,
  categoryId: spec.categoryId,
  status: 'verified',
  isPublic: true,
  logoUrl: `/media/${spec.media}.svg`,
  coverUrl: `/media/${spec.media}.svg`,
  phone: spec.phone,
  whatsapp: spec.phone,
  website: null,
  instagram: spec.instagram,
  verifiedAt: SEED_TIME,
  verifiedBy: 'user-admin',
  createdAt: SEED_TIME,
  updatedAt: SEED_TIME,
  seoTitle: null,
  seoDescription: null,
  seoCanonical: null,
  ogImageUrl: null,
  isIndexable: true,
}));

// ---------------------------------------------------------------------------
// Şubeler
// ---------------------------------------------------------------------------

interface BranchSpec {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  districtId: string;
  address: string;
  lat: number;
  lng: number;
  hours: BranchHours[];
}

const LATE_NIGHT = hours({ 5: ['10:00', '01:00'], 6: ['10:00', '01:00'] });
const STANDARD = hours({});
const EARLY = hours({ 0: ['07:00', '18:00'], 1: ['07:00', '18:00'], 2: ['07:00', '18:00'], 3: ['07:00', '18:00'], 4: ['07:00', '18:00'], 5: ['07:00', '18:00'], 6: ['07:00', '18:00'] });
const SPORTS = hours({
  0: ['09:00', '00:00'],
  1: ['09:00', '00:00'],
  2: ['09:00', '00:00'],
  3: ['09:00', '00:00'],
  4: ['09:00', '00:00'],
  5: ['09:00', '01:00'],
  6: ['09:00', '01:00'],
});
const GAME_HOURS = hours({
  0: ['12:00', '00:00'],
  1: ['12:00', '00:00'],
  2: ['12:00', '00:00'],
  3: ['12:00', '00:00'],
  4: ['12:00', '00:00'],
  5: ['12:00', '02:00'],
  6: ['12:00', '02:00'],
});

const BRANCH_SPECS: BranchSpec[] = [
  { id: 'branch-01', businessId: 'biz-01', name: 'Merkez Şube', slug: 'merkez-sube', districtId: 'district-merkez', address: 'Cumhuriyet Mahallesi, Örnek Caddesi No:12, Merkez', lat: 37.5744, lng: 43.7408, hours: LATE_NIGHT },
  { id: 'branch-02', businessId: 'biz-01', name: 'Yüksekova Şube', slug: 'yuksekova-sube', districtId: 'district-yuksekova', address: 'Esentepe Mahallesi, Demo Bulvarı No:44, Yüksekova', lat: 37.5744, lng: 44.2836, hours: STANDARD },
  { id: 'branch-03', businessId: 'biz-02', name: 'Bahçe Şube', slug: 'bahce-sube', districtId: 'district-merkez', address: 'Bulak Mahallesi, Örnek Sokak No:3, Merkez', lat: 37.5751, lng: 43.7395, hours: STANDARD },
  { id: 'branch-04', businessId: 'biz-03', name: 'Merkez Restoran', slug: 'merkez-restoran', districtId: 'district-merkez', address: 'Pehlivan Mahallesi, Demo Caddesi No:87, Merkez', lat: 37.5732, lng: 43.7421, hours: STANDARD },
  { id: 'branch-05', businessId: 'biz-03', name: 'Şemdinli Şube', slug: 'semdinli-sube', districtId: 'district-semdinli', address: 'Yeni Mahalle, Örnek Caddesi No:9, Şemdinli', lat: 37.3, lng: 44.5667, hours: STANDARD },
  { id: 'branch-06', businessId: 'biz-04', name: 'Meydan Şube', slug: 'meydan-sube', districtId: 'district-merkez', address: 'Dağgöl Mahallesi, Demo Sokak No:21, Merkez', lat: 37.5769, lng: 43.74, hours: EARLY },
  { id: 'branch-07', businessId: 'biz-04', name: 'Yüksekova Meydan', slug: 'yuksekova-meydan', districtId: 'district-yuksekova', address: 'Cumhuriyet Mahallesi, Örnek Caddesi No:5, Yüksekova', lat: 37.5721, lng: 44.2811, hours: EARLY },
  { id: 'branch-08', businessId: 'biz-05', name: 'Merkez Tesis', slug: 'merkez-tesis', districtId: 'district-merkez', address: 'Kıran Mahallesi, Spor Caddesi No:2, Merkez', lat: 37.5701, lng: 43.7445, hours: SPORTS },
  { id: 'branch-09', businessId: 'biz-05', name: 'Yüksekova Tesis', slug: 'yuksekova-tesis', districtId: 'district-yuksekova', address: 'Güngör Mahallesi, Demo Caddesi No:60, Yüksekova', lat: 37.5688, lng: 44.2902, hours: SPORTS },
  { id: 'branch-10', businessId: 'biz-06', name: 'Yayla Tesisi', slug: 'yayla-tesisi', districtId: 'district-yuksekova', address: 'Orman Mahallesi, Örnek Yolu No:14, Yüksekova', lat: 37.5812, lng: 44.2755, hours: SPORTS },
  { id: 'branch-11', businessId: 'biz-07', name: 'Çınaraltı Saha', slug: 'cinaralti-saha-sube', districtId: 'district-cukurca', address: 'Merkez Mahallesi, Demo Caddesi No:1, Çukurca', lat: 37.2464, lng: 43.6122, hours: SPORTS },
  { id: 'branch-12', businessId: 'biz-08', name: 'Pixel Merkez', slug: 'pixel-merkez', districtId: 'district-merkez', address: 'Medrese Mahallesi, Örnek Sokak No:7, Merkez', lat: 37.5758, lng: 43.7382, hours: GAME_HOURS },
  { id: 'branch-13', businessId: 'biz-08', name: 'Pixel Yüksekova', slug: 'pixel-yuksekova', districtId: 'district-yuksekova', address: 'Yeni Mahalle, Demo Bulvarı No:18, Yüksekova', lat: 37.5734, lng: 44.2848, hours: GAME_HOURS },
  { id: 'branch-14', businessId: 'biz-09', name: 'Konsol Merkez', slug: 'konsol-merkez', districtId: 'district-merkez', address: 'Biçer Mahallesi, Örnek Caddesi No:33, Merkez', lat: 37.5715, lng: 43.7369, hours: GAME_HOURS },
  { id: 'branch-15', businessId: 'biz-09', name: 'Derecik Şube', slug: 'derecik-sube', districtId: 'district-derecik', address: 'Merkez Mahallesi, Demo Sokak No:4, Derecik', lat: 37.2833, lng: 44.35, hours: GAME_HOURS },
  { id: 'branch-16', businessId: 'biz-10', name: 'Teras Şube', slug: 'teras-sube', districtId: 'district-merkez', address: 'Berçelan Mahallesi, Örnek Caddesi No:56, Merkez', lat: 37.5779, lng: 43.7433, hours: LATE_NIGHT },
];

export const BRANCHES: BusinessBranch[] = BRANCH_SPECS.map((spec) => {
  const business = BUSINESS_SPECS.find((b) => b.id === spec.businessId);
  return {
    id: spec.id,
    businessId: spec.businessId,
    name: spec.name,
    slug: spec.slug,
    cityId: 'city-hakkari',
    districtId: spec.districtId,
    address: spec.address,
    lat: spec.lat,
    lng: spec.lng,
    phone: business?.phone ?? null,
    whatsapp: business?.phone ?? null,
    isActive: true,
    hours: spec.hours,
    createdAt: SEED_TIME,
  };
});

// ---------------------------------------------------------------------------
// Paketler
// ---------------------------------------------------------------------------

interface PackageSpec {
  id: string;
  branchId: string;
  name: string;
  description: string;
  minPeople: number;
  maxPeople: number;
  pricingModel: 'per_person' | 'total';
  /** Kuruş. */
  priceAmount: number;
  durationMinutes: number;
  items: string[];
  availability: PackageAvailability[];
  preferenceKeys: string[];
  popularity: number;
  isActive?: boolean;
}

const PACKAGE_SPECS: PackageSpec[] = [
  // --- biz-01 Kuzey Işığı Kahve Evi -----------------------------------------
  {
    id: 'pkg-01', branchId: 'branch-01',
    name: '4–6 Kişilik Kahve ve Tatlı Paketi',
    description: 'Arkadaş grubun için sıcak içecek ve tatlı tabağı. Ayrı masa ayrılır.',
    minPeople: 4, maxPeople: 6, pricingModel: 'per_person', priceAmount: 18000, durationMinutes: 120,
    items: ['Kişi başı 2 sıcak içecek', 'Paylaşımlık tatlı tabağı', 'Sınırsız su', 'Ayrı masa'],
    availability: everyDay('12:00', '23:00'),
    preferenceKeys: ['quiet', 'wifi', 'parking'], popularity: 78,
  },
  {
    id: 'pkg-02', branchId: 'branch-01',
    name: '6–10 Kişilik Akşam Yemeği Paketi',
    description: 'Ana yemek, meze ve tatlıdan oluşan grup menüsü. Ayrı salonda servis edilir.',
    minPeople: 6, maxPeople: 10, pricingModel: 'per_person', priceAmount: 32000, durationMinutes: 150,
    items: ['Kişi başı ana yemek', 'Ortaya 4 çeşit meze', 'Salata', 'Tatlı', 'İçecek'],
    availability: everyDay('18:00', '23:30'),
    preferenceKeys: ['private_room', 'quiet', 'vegetarian', 'parking', 'wifi'], popularity: 92,
  },
  {
    id: 'pkg-03', branchId: 'branch-01',
    name: '8–14 Kişilik Doğum Günü Paketi',
    description: 'Süsleme, pasta ve grup menüsü dahil doğum günü organizasyonu.',
    minPeople: 8, maxPeople: 14, pricingModel: 'total', priceAmount: 380000, durationMinutes: 180,
    items: ['Masa süslemesi', '3 kg pasta', 'Kişi başı içecek', 'Atıştırmalık tabağı', 'Müzik sistemi'],
    availability: onDays([4, 5, 6, 0], '17:00', '23:00'),
    preferenceKeys: ['birthday_setup', 'private_room', 'live_music', 'parking'], popularity: 85,
  },
  {
    id: 'pkg-04', branchId: 'branch-02',
    name: '4–8 Kişilik Kahvaltı Paketi',
    description: 'Serpme kahvaltı, sınırsız çay. Hafta içi ve hafta sonu geçerli.',
    minPeople: 4, maxPeople: 8, pricingModel: 'per_person', priceAmount: 22000, durationMinutes: 120,
    items: ['Serpme kahvaltı', 'Sınırsız çay', 'Taze sıkılmış portakal suyu'],
    availability: everyDay('08:00', '13:00'),
    preferenceKeys: ['outdoor', 'wifi', 'vegetarian'], popularity: 71,
  },

  // --- biz-02 Semaver Bahçe -------------------------------------------------
  {
    id: 'pkg-05', branchId: 'branch-03',
    name: '5–9 Kişilik Bahçe Çay Keyfi',
    description: 'Bahçe masasında semaver çay, kuru pasta ve meyve tabağı.',
    minPeople: 5, maxPeople: 9, pricingModel: 'per_person', priceAmount: 12000, durationMinutes: 120,
    items: ['Semaver çay (sınırsız)', 'Kuru pasta tabağı', 'Mevsim meyve tabağı'],
    availability: everyDay('11:00', '22:00'),
    preferenceKeys: ['outdoor', 'quiet', 'accessible'], popularity: 64,
  },
  {
    id: 'pkg-06', branchId: 'branch-03',
    name: '10–16 Kişilik Bahçe Grup Menüsü',
    description: 'Kalabalık gruplar için bahçede uzun masa, ortak menü.',
    minPeople: 10, maxPeople: 16, pricingModel: 'per_person', priceAmount: 26000, durationMinutes: 180,
    items: ['Ortaya mezeler', 'Izgara çeşitleri', 'Salata', 'Tatlı', 'Sınırsız çay'],
    availability: onDays([4, 5, 6, 0], '17:00', '23:00'),
    preferenceKeys: ['outdoor', 'private_room', 'vegetarian', 'parking'], popularity: 74,
  },
  {
    id: 'pkg-07', branchId: 'branch-03',
    name: '2–4 Kişilik Kahve Molası',
    description: 'Küçük gruplar için hızlı ve uygun fiyatlı kahve molası.',
    minPeople: 2, maxPeople: 4, pricingModel: 'per_person', priceAmount: 9000, durationMinutes: 60,
    items: ['Kişi başı 1 sıcak içecek', 'Kurabiye'],
    availability: everyDay('11:00', '22:00'),
    preferenceKeys: ['quiet', 'wifi'], popularity: 55,
  },

  // --- biz-03 Zirve Sofrası -------------------------------------------------
  {
    id: 'pkg-08', branchId: 'branch-04',
    name: '6–12 Kişilik Yöresel Sofra',
    description: 'Yöresel tatlardan oluşan paylaşımlı sofra. Uzun masa ayrılır.',
    minPeople: 6, maxPeople: 12, pricingModel: 'per_person', priceAmount: 29000, durationMinutes: 150,
    items: ['4 çeşit yöresel meze', 'Ana yemek', 'Pilav', 'Tatlı', 'Ayran'],
    availability: everyDay('12:00', '23:00'),
    preferenceKeys: ['private_room', 'parking', 'accessible'], popularity: 88,
  },
  {
    id: 'pkg-09', branchId: 'branch-04',
    name: '12–20 Kişilik Kutlama Menüsü',
    description: 'Büyük gruplar için sabit fiyatlı kutlama menüsü.',
    minPeople: 12, maxPeople: 20, pricingModel: 'total', priceAmount: 620000, durationMinutes: 210,
    items: ['Ortaya mezeler', 'Karışık ızgara', 'Tatlı', 'İçecek', 'Ayrı salon'],
    availability: onDays([5, 6, 0], '18:00', '23:30'),
    preferenceKeys: ['private_room', 'birthday_setup', 'parking'], popularity: 69,
  },
  {
    id: 'pkg-10', branchId: 'branch-05',
    name: '4–8 Kişilik Öğle Menüsü',
    description: 'Öğle saatlerinde uygun fiyatlı grup menüsü.',
    minPeople: 4, maxPeople: 8, pricingModel: 'per_person', priceAmount: 17000, durationMinutes: 90,
    items: ['Çorba', 'Ana yemek', 'Pilav', 'İçecek'],
    availability: everyDay('11:30', '15:00'),
    preferenceKeys: ['parking', 'accessible'], popularity: 48,
  },
  {
    id: 'pkg-11', branchId: 'branch-05',
    name: '8–14 Kişilik Akşam Sofrası',
    description: 'Şemdinli şubesinde akşam grup sofrası.',
    minPeople: 8, maxPeople: 14, pricingModel: 'per_person', priceAmount: 25000, durationMinutes: 150,
    items: ['Mezeler', 'Ana yemek', 'Tatlı', 'İçecek'],
    availability: onDays([3, 4, 5, 6], '18:00', '23:00'),
    preferenceKeys: ['private_room', 'quiet'], popularity: 52,
  },

  // --- biz-04 Meydan Kahvaltı Salonu ---------------------------------------
  {
    id: 'pkg-12', branchId: 'branch-06',
    name: '4–7 Kişilik Serpme Kahvaltı',
    description: 'Klasik serpme kahvaltı, sınırsız çay ile.',
    minPeople: 4, maxPeople: 7, pricingModel: 'per_person', priceAmount: 20000, durationMinutes: 120,
    items: ['Serpme kahvaltı (18 çeşit)', 'Sınırsız çay', 'Sıcak ekmek'],
    availability: everyDay('07:30', '13:00'),
    preferenceKeys: ['vegetarian', 'wifi', 'accessible'], popularity: 81,
  },
  {
    id: 'pkg-13', branchId: 'branch-06',
    name: '8–15 Kişilik Grup Brunch',
    description: 'Kalabalık gruplar için hafta sonu brunch düzeni.',
    minPeople: 8, maxPeople: 15, pricingModel: 'per_person', priceAmount: 27000, durationMinutes: 150,
    items: ['Serpme kahvaltı', 'Sıcak menemen', 'Sınırsız çay', 'Tatlı tabağı', 'Uzun masa'],
    availability: onDays([6, 0], '08:00', '13:30'),
    preferenceKeys: ['vegetarian', 'private_room', 'parking'], popularity: 76,
  },
  {
    id: 'pkg-14', branchId: 'branch-07',
    name: '5–10 Kişilik Yüksekova Kahvaltı',
    description: 'Yüksekova şubesinde grup kahvaltısı.',
    minPeople: 5, maxPeople: 10, pricingModel: 'per_person', priceAmount: 19000, durationMinutes: 120,
    items: ['Serpme kahvaltı', 'Sınırsız çay'],
    availability: everyDay('07:30', '13:00'),
    preferenceKeys: ['vegetarian', 'parking'], popularity: 58,
  },

  // --- biz-05 Gol Krallığı Halı Saha ---------------------------------------
  {
    id: 'pkg-15', branchId: 'branch-08',
    name: '10–14 Kişilik Halı Saha (1 Saat)',
    description: 'Kapalı sahada 1 saatlik kiralama. Duş ve soyunma odası dahil.',
    minPeople: 10, maxPeople: 14, pricingModel: 'total', priceAmount: 90000, durationMinutes: 60,
    items: ['1 saat kapalı saha', 'Soyunma odası', 'Duş', 'Su'],
    availability: everyDay('09:00', '23:00'),
    preferenceKeys: ['indoor_pitch', 'shower', 'night_lighting', 'parking'], popularity: 95,
  },
  {
    id: 'pkg-16', branchId: 'branch-08',
    name: '10–14 Kişilik Halı Saha + Forma (1.5 Saat)',
    description: 'Forma, top ve hakem dahil uzun süreli maç paketi.',
    minPeople: 10, maxPeople: 14, pricingModel: 'total', priceAmount: 160000, durationMinutes: 90,
    items: ['1,5 saat kapalı saha', 'Forma kiralama', 'Maç topu', 'Hakem', 'Duş', 'Su'],
    availability: everyDay('09:00', '23:00'),
    preferenceKeys: ['indoor_pitch', 'shower', 'equipment', 'night_lighting'], popularity: 87,
  },
  {
    id: 'pkg-17', branchId: 'branch-08',
    name: '16–22 Kişilik Turnuva Paketi',
    description: 'İki takımdan fazla grup için 3 saatlik turnuva düzeni.',
    minPeople: 16, maxPeople: 22, pricingModel: 'total', priceAmount: 420000, durationMinutes: 180,
    items: ['3 saat saha', 'Fikstür düzeni', 'Hakem', 'Forma', 'Su ve meyve'],
    availability: onDays([6, 0], '10:00', '20:00'),
    preferenceKeys: ['indoor_pitch', 'shower', 'equipment'], popularity: 62,
  },
  {
    id: 'pkg-18', branchId: 'branch-09',
    name: '10–14 Kişilik Yüksekova Saha (1 Saat)',
    description: 'Yüksekova tesisinde açık sahada 1 saatlik kiralama.',
    minPeople: 10, maxPeople: 14, pricingModel: 'total', priceAmount: 75000, durationMinutes: 60,
    items: ['1 saat açık saha', 'Soyunma odası', 'Su'],
    availability: everyDay('09:00', '23:00'),
    preferenceKeys: ['shower', 'night_lighting', 'parking'], popularity: 73,
  },

  // --- biz-06 Yayla Spor Tesisleri -----------------------------------------
  {
    id: 'pkg-19', branchId: 'branch-10',
    name: '12–16 Kişilik Akşam Maçı',
    description: 'Akşam saatlerinde aydınlatmalı sahada maç paketi.',
    minPeople: 12, maxPeople: 16, pricingModel: 'total', priceAmount: 110000, durationMinutes: 90,
    items: ['1,5 saat saha', 'Gece aydınlatması', 'Soyunma odası', 'Su'],
    availability: everyDay('17:00', '23:59'),
    preferenceKeys: ['night_lighting', 'shower', 'parking'], popularity: 80,
  },
  {
    id: 'pkg-20', branchId: 'branch-10',
    name: '8–12 Kişilik Hafta İçi Saha',
    description: 'Hafta içi gündüz saatlerinde indirimli saha kiralama.',
    minPeople: 8, maxPeople: 12, pricingModel: 'total', priceAmount: 60000, durationMinutes: 60,
    items: ['1 saat saha', 'Soyunma odası'],
    availability: onDays([1, 2, 3, 4, 5], '09:00', '17:00'),
    preferenceKeys: ['shower', 'parking'], popularity: 45,
  },

  // --- biz-07 Çınaraltı Saha ------------------------------------------------
  {
    id: 'pkg-21', branchId: 'branch-11',
    name: '10–14 Kişilik Çukurca Saha',
    description: 'Çukurca’da tek sahalı tesiste 1 saatlik kiralama.',
    minPeople: 10, maxPeople: 14, pricingModel: 'total', priceAmount: 65000, durationMinutes: 60,
    items: ['1 saat saha', 'Soyunma odası', 'Su'],
    availability: everyDay('10:00', '22:00'),
    preferenceKeys: ['night_lighting', 'parking'], popularity: 41,
  },
  {
    id: 'pkg-22', branchId: 'branch-11',
    name: '10–14 Kişilik Saha + Çay Molası',
    description: 'Maç sonrası çay ve simit ikramı dahil paket.',
    minPeople: 10, maxPeople: 14, pricingModel: 'total', priceAmount: 88000, durationMinutes: 90,
    items: ['1 saat saha', 'Maç sonrası çay', 'Simit ikramı', 'Soyunma odası'],
    availability: onDays([5, 6, 0], '14:00', '22:00'),
    preferenceKeys: ['night_lighting', 'parking'], popularity: 50,
  },

  // --- biz-08 Pixel Arena ---------------------------------------------------
  {
    id: 'pkg-23', branchId: 'branch-12',
    name: '4–8 Kişilik PlayStation Turnuvası',
    description: 'PS5 istasyonlarında 3 saatlik turnuva düzeni.',
    minPeople: 4, maxPeople: 8, pricingModel: 'per_person', priceAmount: 15000, durationMinutes: 180,
    items: ['3 saat PS5 kullanımı', 'Turnuva fikstürü', 'Kişi başı içecek', 'Cips ikramı'],
    availability: everyDay('12:00', '23:59'),
    preferenceKeys: ['ps5', 'tournament', 'wifi'], popularity: 90,
  },
  {
    id: 'pkg-24', branchId: 'branch-12',
    name: '2–4 Kişilik Oyun Saati',
    description: 'Küçük gruplar için 2 saatlik konsol kiralama.',
    minPeople: 2, maxPeople: 4, pricingModel: 'per_person', priceAmount: 9000, durationMinutes: 120,
    items: ['2 saat PS5 kullanımı', 'Kişi başı içecek'],
    availability: everyDay('12:00', '23:59'),
    preferenceKeys: ['ps5', 'wifi'], popularity: 66,
  },
  {
    id: 'pkg-25', branchId: 'branch-12',
    name: '6–12 Kişilik Bilardo & Konsol Paketi',
    description: 'Bilardo masası ve konsol istasyonlarının birlikte kullanımı.',
    minPeople: 6, maxPeople: 12, pricingModel: 'total', priceAmount: 240000, durationMinutes: 180,
    items: ['3 saat bilardo masası', '3 saat konsol', 'Sınırsız çay', 'Atıştırmalık'],
    availability: onDays([4, 5, 6, 0], '14:00', '23:59'),
    preferenceKeys: ['ps5', 'billiards', 'tournament'], popularity: 79,
  },
  {
    id: 'pkg-26', branchId: 'branch-13',
    name: '4–8 Kişilik Yüksekova Oyun Paketi',
    description: 'Yüksekova şubesinde grup konsol paketi.',
    minPeople: 4, maxPeople: 8, pricingModel: 'per_person', priceAmount: 13000, durationMinutes: 150,
    items: ['2,5 saat PS5 kullanımı', 'Kişi başı içecek'],
    availability: everyDay('12:00', '23:59'),
    preferenceKeys: ['ps5', 'wifi'], popularity: 57,
  },

  // --- biz-09 Konsol Kulübü -------------------------------------------------
  {
    id: 'pkg-27', branchId: 'branch-14',
    name: '8–16 Kişilik Özel Salon Turnuvası',
    description: 'Gruba özel salonda 4 saatlik turnuva.',
    minPeople: 8, maxPeople: 16, pricingModel: 'total', priceAmount: 480000, durationMinutes: 240,
    items: ['Özel salon', '4 saat konsol kullanımı', 'Projeksiyon', 'İçecek', 'Atıştırmalık'],
    availability: onDays([5, 6, 0], '13:00', '23:59'),
    preferenceKeys: ['ps5', 'tournament', 'private_room'], popularity: 72,
  },
  {
    id: 'pkg-28', branchId: 'branch-14',
    name: '4–6 Kişilik Hafta İçi Konsol',
    description: 'Hafta içi indirimli konsol paketi.',
    minPeople: 4, maxPeople: 6, pricingModel: 'per_person', priceAmount: 10000, durationMinutes: 120,
    items: ['2 saat konsol kullanımı', 'Çay ikramı'],
    availability: onDays([1, 2, 3, 4], '12:00', '20:00'),
    preferenceKeys: ['ps5', 'wifi'], popularity: 44,
  },
  {
    id: 'pkg-29', branchId: 'branch-15',
    name: '4–10 Kişilik Derecik Oyun Paketi',
    description: 'Derecik şubesinde grup oyun paketi.',
    minPeople: 4, maxPeople: 10, pricingModel: 'per_person', priceAmount: 11000, durationMinutes: 150,
    items: ['2,5 saat konsol kullanımı', 'İçecek'],
    availability: everyDay('13:00', '23:00'),
    preferenceKeys: ['ps5'], popularity: 38,
  },

  // --- biz-10 Şelale Teras Kafe --------------------------------------------
  {
    id: 'pkg-30', branchId: 'branch-16',
    name: '6–12 Kişilik Maç Yayını Paketi',
    description: 'Terasta projeksiyonla maç izleme, atıştırmalık ve içecek dahil.',
    minPeople: 6, maxPeople: 12, pricingModel: 'per_person', priceAmount: 16000, durationMinutes: 150,
    items: ['Projeksiyonla maç yayını', 'Kişi başı içecek', 'Ortaya atıştırmalık', 'Teras masası'],
    availability: everyDay('16:00', '23:59'),
    preferenceKeys: ['projector', 'outdoor', 'live_music', 'wifi'], popularity: 84,
  },
  {
    id: 'pkg-31', branchId: 'branch-16',
    name: '10–18 Kişilik Teras Doğum Günü',
    description: 'Teras katında süsleme ve pasta dahil doğum günü paketi.',
    minPeople: 10, maxPeople: 18, pricingModel: 'total', priceAmount: 520000, durationMinutes: 180,
    items: ['Teras katı özel kullanım', 'Süsleme', '4 kg pasta', 'İçecek', 'Müzik sistemi'],
    availability: onDays([4, 5, 6, 0], '16:00', '23:30'),
    preferenceKeys: ['birthday_setup', 'outdoor', 'live_music', 'private_room'], popularity: 77,
  },
  {
    id: 'pkg-32', branchId: 'branch-16',
    name: '4–8 Kişilik Teras Kahve',
    description: 'Manzaralı terasta kahve ve tatlı.',
    minPeople: 4, maxPeople: 8, pricingModel: 'per_person', priceAmount: 14000, durationMinutes: 90,
    items: ['Kişi başı sıcak içecek', 'Paylaşımlık tatlı'],
    availability: everyDay('12:00', '23:00'),
    preferenceKeys: ['outdoor', 'quiet', 'wifi'], popularity: 68,
  },
  {
    // Pasif paket: SEO'da "geçici olarak kapalı" davranışını göstermek için.
    id: 'pkg-33', branchId: 'branch-16',
    name: '20–30 Kişilik Kapalı Grup Etkinliği',
    description: 'Tüm mekânın gruba özel kullanımı. Şu anda rezervasyona kapalı.',
    minPeople: 20, maxPeople: 30, pricingModel: 'total', priceAmount: 950000, durationMinutes: 240,
    items: ['Mekânın tamamı', 'Süsleme', 'Menü', 'Müzik sistemi'],
    availability: onDays([5, 6], '17:00', '23:59'),
    preferenceKeys: ['private_room', 'birthday_setup', 'live_music'], popularity: 30,
    isActive: false,
  },
];

const BRANCH_TO_BUSINESS = new Map(BRANCH_SPECS.map((b) => [b.id, b.businessId]));
const BUSINESS_TO_CATEGORY = new Map(BUSINESS_SPECS.map((b) => [b.id, b.categoryId]));
const BUSINESS_TO_MEDIA = new Map(BUSINESS_SPECS.map((b) => [b.id, b.media]));

function slugForPackage(spec: PackageSpec, businessSlug: string): string {
  // Slug benzersizliği için işletme slug'ı ile birleştirilir.
  const namePart = spec.name
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${businessSlug}-${namePart}`;
}

export const PACKAGES: VenuePackage[] = PACKAGE_SPECS.map((spec) => {
  const businessId = BRANCH_TO_BUSINESS.get(spec.branchId) ?? 'biz-01';
  const businessSpec = BUSINESS_SPECS.find((b) => b.id === businessId);
  const media = BUSINESS_TO_MEDIA.get(businessId) ?? 'cafe-1';

  return {
    id: spec.id,
    businessId,
    branchId: spec.branchId,
    categoryId: BUSINESS_TO_CATEGORY.get(businessId) ?? 'cat-cafe',
    name: spec.name,
    slug: slugForPackage(spec, businessSpec?.slug ?? 'mekan'),
    description: spec.description,
    minPeople: spec.minPeople,
    maxPeople: spec.maxPeople,
    pricingModel: spec.pricingModel,
    priceAmount: spec.priceAmount,
    durationMinutes: spec.durationMinutes,
    reservationTerms:
      'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.',
    cancellationTerms:
      'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.',
    isActive: spec.isActive ?? true,
    isPublic: true,
    popularity: spec.popularity,
    items: spec.items.map((label, index) => ({
      id: `${spec.id}-item-${index + 1}`,
      label,
      detail: null,
      sortOrder: index + 1,
    })),
    images: [
      {
        id: `${spec.id}-img-1`,
        url: `/media/${media}.svg`,
        alt: `${spec.name} — ${businessSpec?.name ?? ''} (temsilî görsel)`,
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
    ],
    availability: spec.availability,
    preferenceKeys: spec.preferenceKeys,
    createdAt: SEED_TIME,
    updatedAt: SEED_TIME,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable: true,
  };
});
