import type {
  Business,
  BusinessBranch,
  Category,
  City,
  ClockTime,
  District,
  Id,
  IsoDate,
  Kurus,
  MatchReason,
  MatchedPackage,
  PackageSortOption,
  VenuePackage,
} from '@hazirgrup/types';
import { calculatePackagePricing, compareToBudget } from '../budget/index';
import {
  BUDGET_OVERRUN_TOLERANCE,
  FLEXIBLE_TIME_TOLERANCE_MINUTES,
  STRICT_TIME_TOLERANCE_MINUTES,
} from '../config/constants';
import { minutesOutsideRange, weekdayOf } from '../format/datetime';
import { formatCurrency, formatPercent } from '../format/index';

/**
 * Paket eşleştirme motoru.
 *
 * Saf fonksiyondur: veri erişimi yapmaz, "şu an" kullanmaz. Aday paketler
 * dışarıdan verilir, sonuç skorlanmış ve gerekçelendirilmiş olarak döner.
 */

export interface MatchCriteria {
  cityId: Id;
  districtId: Id | null;
  categoryIds: Id[];
  eventDate: IsoDate;
  startTime: ClockTime | null;
  endTime: ClockTime | null;
  isTimeFlexible: boolean;
  /** Fiyatlandırmada kullanılacak tahmini katılımcı sayısı. */
  peopleCount: number;
  budgetPerPerson: Kurus | null;
  preferenceKeys: string[];
}

export interface MatchCandidate {
  package: VenuePackage;
  business: Business;
  branch: BusinessBranch;
  category: Category;
  city: City;
  district: District;
}

/** Bir adayın neden elendiği — boş sonuç ekranında öneri üretmek için. */
export const REJECTION_KEYS = [
  'inactive',
  'unverified_business',
  'inactive_branch',
  'wrong_city',
  'wrong_category',
  'capacity',
  'day_unavailable',
  'time',
  'budget',
] as const;

export type RejectionKey = (typeof REJECTION_KEYS)[number];

export interface MatchOutcome {
  matches: MatchedPackage[];
  /** Elenen aday sayısının nedene göre dağılımı. */
  rejections: Record<RejectionKey, number>;
  totalCandidates: number;
}

// ---------------------------------------------------------------------------
// Skor ağırlıkları (toplam 100)
// ---------------------------------------------------------------------------

const WEIGHTS = {
  budget: 30,
  capacity: 20,
  time: 20,
  location: 15,
  preferences: 10,
  popularity: 5,
} as const;

// ---------------------------------------------------------------------------

function emptyRejections(): Record<RejectionKey, number> {
  return {
    inactive: 0,
    unverified_business: 0,
    inactive_branch: 0,
    wrong_city: 0,
    wrong_category: 0,
    capacity: 0,
    day_unavailable: 0,
    time: 0,
    budget: 0,
  };
}

/** Paketin o gün için geçerli olduğu saat aralıkları. */
function availabilityForDate(pkg: VenuePackage, date: IsoDate) {
  const weekday = weekdayOf(date);
  return pkg.availability.filter((slot) => slot.weekday === weekday);
}

/**
 * Planın saatiyle paketin uygunluk aralığı arasındaki en küçük sapma (dakika).
 * Saat belirtilmemişse 0 (kısıt yok). Uygun aralık yoksa Infinity.
 */
function timeDeviationMinutes(
  pkg: VenuePackage,
  date: IsoDate,
  startTime: ClockTime | null,
): { deviation: number; hasSlotForDay: boolean } {
  const slots = availabilityForDate(pkg, date);
  if (slots.length === 0) return { deviation: Number.POSITIVE_INFINITY, hasSlotForDay: false };
  if (!startTime) return { deviation: 0, hasSlotForDay: true };

  let best = Number.POSITIVE_INFINITY;
  for (const slot of slots) {
    best = Math.min(best, minutesOutsideRange(startTime, slot.startTime, slot.endTime));
  }
  return { deviation: best, hasSlotForDay: true };
}

/** Grup büyüklüğünün kapasite aralığındaki konumuna göre 0–1 puan. */
function capacityFitScore(people: number, min: number, max: number): number {
  if (people < min || people > max) return 0;
  if (max === min) return 1;
  // Aralığın ortasına yakın olmak en iyi uyum sayılır.
  const center = (min + max) / 2;
  const halfSpan = (max - min) / 2;
  const distance = Math.abs(people - center) / halfSpan;
  return 1 - 0.4 * distance;
}

/** Bütçe uyumuna göre 0–1 puan. Bütçe yoksa nötr (0.7). */
function budgetFitScore(perPersonPrice: Kurus, budgetPerPerson: Kurus | null): number {
  if (!budgetPerPerson || budgetPerPerson <= 0) return 0.7;
  const ratio = perPersonPrice / budgetPerPerson;
  if (ratio <= 0.6) return 0.85; // çok ucuz — "acaba kalitesiz mi" algısı, tam puan verilmez
  if (ratio <= 1) return 1;
  const overrun = ratio - 1;
  return Math.max(0, 1 - overrun / BUDGET_OVERRUN_TOLERANCE) * 0.6;
}

/** Saat sapmasına göre 0–1 puan. */
function timeFitScore(deviation: number, tolerance: number): number {
  if (deviation === 0) return 1;
  if (!Number.isFinite(deviation) || deviation > tolerance) return 0;
  return Math.max(0, 1 - deviation / tolerance) * 0.7;
}

// ---------------------------------------------------------------------------
// Gerekçe etiketleri
// ---------------------------------------------------------------------------

function buildReasons(input: {
  candidate: MatchCandidate;
  criteria: MatchCriteria;
  perPersonPrice: Kurus;
  overBudgetPercent: number;
  isWithinBudget: boolean;
  timeDeviation: number;
  matchedPreferences: string[];
  isDistrictMatch: boolean;
}): MatchReason[] {
  const {
    candidate,
    criteria,
    perPersonPrice,
    overBudgetPercent,
    isWithinBudget,
    timeDeviation,
    matchedPreferences,
    isDistrictMatch,
  } = input;

  const reasons: MatchReason[] = [];

  // Bütçe
  if (criteria.budgetPerPerson && criteria.budgetPerPerson > 0) {
    if (isWithinBudget) {
      reasons.push({ key: 'within_budget', label: 'Bütçene uygun', tone: 'positive' });
    } else {
      reasons.push({
        key: 'near_budget',
        label: `Bütçeni ${formatPercent(overBudgetPercent)} aşıyor (${formatCurrency(perPersonPrice)})`,
        tone: 'warning',
      });
    }
  }

  // Kapasite
  reasons.push({
    key: 'group_size_fits',
    label: `${criteria.peopleCount} kişilik grubuna uygun`,
    tone: 'positive',
  });

  // Saat
  if (criteria.startTime) {
    if (timeDeviation === 0) {
      reasons.push({ key: 'time_valid', label: 'Seçtiğin saatte geçerli', tone: 'positive' });
    } else {
      reasons.push({
        key: 'time_close',
        label: `Saatte ${Math.round(timeDeviation)} dakika fark var`,
        tone: 'warning',
      });
    }
  }

  // Konum
  if (isDistrictMatch) {
    reasons.push({ key: 'in_district', label: `${candidate.district.name}'de`, tone: 'positive' });
  } else {
    reasons.push({
      key: 'in_city',
      label: `${candidate.district.name}, ${candidate.city.name}`,
      tone: 'neutral',
    });
  }

  // Kategori
  reasons.push({ key: 'category_match', label: candidate.category.name, tone: 'neutral' });

  // Tercihler
  if (matchedPreferences.length > 0) {
    reasons.push({
      key: 'preference_match',
      label: `Tercihlerinden ${matchedPreferences.length} tanesi var`,
      tone: 'positive',
    });
  }

  // Popülerlik
  if (candidate.package.popularity >= 80) {
    reasons.push({ key: 'popular', label: 'Çok tercih ediliyor', tone: 'neutral' });
  }

  // Tam eşleşme rozeti, diğerlerinin başına eklenir
  const isPerfect =
    isWithinBudget &&
    timeDeviation === 0 &&
    isDistrictMatch &&
    (!criteria.budgetPerPerson || isWithinBudget);
  if (isPerfect) {
    reasons.unshift({ key: 'exact_match', label: 'Tam eşleşme', tone: 'positive' });
  }

  return reasons;
}

// ---------------------------------------------------------------------------
// Ana fonksiyon
// ---------------------------------------------------------------------------

export function matchPackages(
  criteria: MatchCriteria,
  candidates: MatchCandidate[],
): MatchOutcome {
  const rejections = emptyRejections();
  const matches: MatchedPackage[] = [];

  const tolerance = criteria.isTimeFlexible
    ? FLEXIBLE_TIME_TOLERANCE_MINUTES
    : STRICT_TIME_TOLERANCE_MINUTES;

  const wantedCategories = new Set(criteria.categoryIds);
  const wantedPreferences = new Set(criteria.preferenceKeys);

  for (const candidate of candidates) {
    const pkg = candidate.package;

    // --- Sert filtreler ---------------------------------------------------
    if (!pkg.isActive) {
      rejections.inactive += 1;
      continue;
    }
    if (candidate.business.status !== 'verified') {
      rejections.unverified_business += 1;
      continue;
    }
    if (!candidate.branch.isActive) {
      rejections.inactive_branch += 1;
      continue;
    }
    if (candidate.branch.cityId !== criteria.cityId) {
      rejections.wrong_city += 1;
      continue;
    }
    if (wantedCategories.size > 0 && !wantedCategories.has(pkg.categoryId)) {
      rejections.wrong_category += 1;
      continue;
    }
    if (criteria.peopleCount < pkg.minPeople || criteria.peopleCount > pkg.maxPeople) {
      rejections.capacity += 1;
      continue;
    }

    const { deviation, hasSlotForDay } = timeDeviationMinutes(pkg, criteria.eventDate, criteria.startTime);
    if (!hasSlotForDay) {
      rejections.day_unavailable += 1;
      continue;
    }
    if (deviation > tolerance) {
      rejections.time += 1;
      continue;
    }

    const pricing = calculatePackagePricing({
      pricingModel: pkg.pricingModel,
      priceAmount: pkg.priceAmount,
      peopleCount: criteria.peopleCount,
      minPeople: pkg.minPeople,
    });

    const budget = compareToBudget(pricing.perPersonPrice, criteria.budgetPerPerson);
    if (!budget.isWithinBudget && budget.overBudgetPercent > BUDGET_OVERRUN_TOLERANCE) {
      rejections.budget += 1;
      continue;
    }

    // --- Skorlama ---------------------------------------------------------
    const isDistrictMatch =
      criteria.districtId !== null && candidate.branch.districtId === criteria.districtId;

    const matchedPreferences = pkg.preferenceKeys.filter((key) => wantedPreferences.has(key));
    const preferenceScore =
      wantedPreferences.size === 0 ? 0.5 : matchedPreferences.length / wantedPreferences.size;

    const score =
      WEIGHTS.budget * budgetFitScore(pricing.perPersonPrice, criteria.budgetPerPerson) +
      WEIGHTS.capacity * capacityFitScore(criteria.peopleCount, pkg.minPeople, pkg.maxPeople) +
      WEIGHTS.time * timeFitScore(deviation, tolerance) +
      WEIGHTS.location * (criteria.districtId === null ? 0.8 : isDistrictMatch ? 1 : 0.35) +
      WEIGHTS.preferences * preferenceScore +
      WEIGHTS.popularity * (Math.min(100, Math.max(0, pkg.popularity)) / 100);

    matches.push({
      package: pkg,
      business: candidate.business,
      branch: candidate.branch,
      category: candidate.category,
      city: candidate.city,
      district: candidate.district,
      score: Math.round(score * 100) / 100,
      reasons: buildReasons({
        candidate,
        criteria,
        perPersonPrice: pricing.perPersonPrice,
        overBudgetPercent: budget.overBudgetPercent,
        isWithinBudget: budget.isWithinBudget,
        timeDeviation: deviation,
        matchedPreferences,
        isDistrictMatch,
      }),
      pricing: {
        peopleCount: pricing.peopleCount,
        totalPrice: pricing.totalPrice,
        perPersonPrice: pricing.perPersonPrice,
        perPersonDiff: budget.perPersonDiff,
        overBudgetPercent: budget.overBudgetPercent,
      },
    });
  }

  return {
    matches: sortMatches(matches, 'best_match', criteria.budgetPerPerson),
    rejections,
    totalCandidates: candidates.length,
  };
}

// ---------------------------------------------------------------------------
// Sıralama
// ---------------------------------------------------------------------------

export function sortMatches(
  matches: MatchedPackage[],
  option: PackageSortOption,
  budgetPerPerson: Kurus | null = null,
): MatchedPackage[] {
  const sorted = [...matches];

  switch (option) {
    case 'lowest_per_person':
      sorted.sort(
        (a, b) =>
          a.pricing.perPersonPrice - b.pricing.perPersonPrice || b.score - a.score,
      );
      break;

    case 'closest_to_budget':
      if (budgetPerPerson && budgetPerPerson > 0) {
        sorted.sort(
          (a, b) =>
            Math.abs(a.pricing.perPersonPrice - budgetPerPerson) -
              Math.abs(b.pricing.perPersonPrice - budgetPerPerson) || b.score - a.score,
        );
      } else {
        sorted.sort((a, b) => b.score - a.score);
      }
      break;

    case 'most_popular':
      sorted.sort((a, b) => b.package.popularity - a.package.popularity || b.score - a.score);
      break;

    case 'newest':
      sorted.sort(
        (a, b) =>
          new Date(b.package.createdAt).getTime() - new Date(a.package.createdAt).getTime() ||
          b.score - a.score,
      );
      break;

    case 'best_match':
    default:
      sorted.sort(
        (a, b) => b.score - a.score || a.pricing.perPersonPrice - b.pricing.perPersonPrice,
      );
      break;
  }

  return sorted;
}

// ---------------------------------------------------------------------------
// Boş sonuç önerileri
// ---------------------------------------------------------------------------

export interface RelaxationSuggestion {
  key: RejectionKey;
  label: string;
  description: string;
  /** Kaç paket bu kısıt yüzünden elendi. */
  affectedCount: number;
}

/**
 * Hiç sonuç çıkmadığında hangi kısıtın gevşetilmesinin en çok işe yarayacağını
 * söyler. "Kayıt bulunamadı" yerine kullanıcıya yol gösterir.
 */
export function suggestRelaxations(outcome: MatchOutcome): RelaxationSuggestion[] {
  const catalog: Record<RejectionKey, { label: string; description: string } | null> = {
    budget: {
      label: 'Bütçeyi biraz genişlet',
      description: 'Kişi başı bütçeni artırırsan daha fazla paket görürsün.',
    },
    capacity: {
      label: 'Kişi sayısını değiştir',
      description: 'Bu kişi sayısına uygun paket az; aralığı biraz esnetebilirsin.',
    },
    time: {
      label: 'Saati esnet',
      description: '"Saatim esnek" seçeneğini işaretlersen yakın saatlerdeki paketler de gelir.',
    },
    day_unavailable: {
      label: 'Başka bir gün dene',
      description: 'Seçtiğin günde bu paketler sunulmuyor. Başka bir tarih deneyebilirsin.',
    },
    wrong_category: {
      label: 'Daha fazla kategori seç',
      description: 'Birden fazla aktivite türü seçersen seçenek sayın artar.',
    },
    wrong_city: {
      label: 'Şehri kontrol et',
      description: 'Seçtiğin şehirde henüz yeterli paket yok.',
    },
    inactive: null,
    unverified_business: null,
    inactive_branch: null,
  };

  return (Object.keys(outcome.rejections) as RejectionKey[])
    .filter((key) => catalog[key] !== null && outcome.rejections[key] > 0)
    .map((key) => {
      const entry = catalog[key];
      return {
        key,
        label: entry?.label ?? '',
        description: entry?.description ?? '',
        affectedCount: outcome.rejections[key],
      };
    })
    .sort((a, b) => b.affectedCount - a.affectedCount);
}

/** Eşleşen paketler arasındaki kişi başı fiyat aralığı. */
export function priceRangeOf(matches: MatchedPackage[]): { min: Kurus; max: Kurus } | null {
  if (matches.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const match of matches) {
    min = Math.min(min, match.pricing.perPersonPrice);
    max = Math.max(max, match.pricing.perPersonPrice);
  }
  return { min, max };
}
