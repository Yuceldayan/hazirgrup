import type { BudgetMode, Kurus, ParticipationStatus, PricingModel } from '@hazirgrup/types';
import { MAYBE_PARTICIPANT_WEIGHT } from '../config/constants';

/**
 * Bütçe ve fiyat hesaplama.
 *
 * Tüm tutarlar kuruş cinsinden tam sayıdır (D-014).
 * Kişi başı fiyat **yukarı yuvarlanır** (D-015): kullanıcıya gösterilen tutar,
 * gerçekte ödenecek tutardan az olmamalıdır.
 */

/** Toplam tutarı kişi sayısına böler, yukarı yuvarlar. */
export function perPersonFromTotal(total: Kurus, people: number): Kurus {
  if (people <= 0) return 0;
  if (total <= 0) return 0;
  return Math.ceil(total / people);
}

/** Kişi başı tutardan toplamı hesaplar. */
export function totalFromPerPerson(perPerson: Kurus, people: number): Kurus {
  if (people <= 0 || perPerson <= 0) return 0;
  return perPerson * people;
}

export interface BudgetInput {
  mode: BudgetMode;
  perPerson: Kurus | null;
  total: Kurus | null;
  people: number;
}

export interface BudgetBreakdown {
  mode: BudgetMode;
  people: number;
  perPerson: Kurus;
  total: Kurus;
}

/**
 * Bütçenin iki yönünü de doldurur.
 * Kullanıcı hangi alanı girdiyse (`mode`) diğeri ondan türetilir.
 */
export function resolveBudget(input: BudgetInput): BudgetBreakdown {
  const people = Math.max(1, Math.trunc(input.people));

  if (input.mode === 'per_person') {
    const perPerson = Math.max(0, input.perPerson ?? 0);
    return { mode: 'per_person', people, perPerson, total: totalFromPerPerson(perPerson, people) };
  }

  const total = Math.max(0, input.total ?? 0);
  return { mode: 'total', people, perPerson: perPersonFromTotal(total, people), total };
}

/**
 * Katılımcı sayısı değiştiğinde bütçeyi yeniden hesaplar.
 *
 * - `per_person` modunda kişi başı sabit kalır, toplam değişir.
 * - `total` modunda toplam sabit kalır, kişi başı değişir.
 */
export function recalculateForPeople(
  budget: BudgetBreakdown,
  newPeopleCount: number,
): BudgetBreakdown {
  return resolveBudget({
    mode: budget.mode,
    perPerson: budget.mode === 'per_person' ? budget.perPerson : null,
    total: budget.mode === 'total' ? budget.total : null,
    people: newPeopleCount,
  });
}

// ---------------------------------------------------------------------------
// Paket fiyatlandırması
// ---------------------------------------------------------------------------

export interface PackagePricingInput {
  pricingModel: PricingModel;
  priceAmount: Kurus;
  peopleCount: number;
  minPeople: number;
}

export interface PackagePricing {
  peopleCount: number;
  totalPrice: Kurus;
  perPersonPrice: Kurus;
}

/**
 * Bir paketin belirli bir grup büyüklüğü için fiyatını hesaplar.
 *
 * `total` modelinde paket sabit fiyatlıdır; grup paketin minimum kişi sayısından
 * az kişiyle gelse bile toplam değişmez (bu yüzden kişi başı artar).
 */
export function calculatePackagePricing(input: PackagePricingInput): PackagePricing {
  const people = Math.max(1, Math.trunc(input.peopleCount));

  if (input.pricingModel === 'per_person') {
    const perPerson = Math.max(0, input.priceAmount);
    return { peopleCount: people, perPersonPrice: perPerson, totalPrice: perPerson * people };
  }

  const total = Math.max(0, input.priceAmount);
  return {
    peopleCount: people,
    totalPrice: total,
    perPersonPrice: perPersonFromTotal(total, people),
  };
}

/** Paketin listelerde gösterilen "başlangıç" fiyatları (en avantajlı senaryo). */
export function packageStartingPrices(input: {
  pricingModel: PricingModel;
  priceAmount: Kurus;
  minPeople: number;
  maxPeople: number;
}): { perPersonFrom: Kurus; totalFrom: Kurus } {
  if (input.pricingModel === 'per_person') {
    return {
      perPersonFrom: input.priceAmount,
      totalFrom: input.priceAmount * input.minPeople,
    };
  }
  // Sabit toplamda kişi başı en düşük, maksimum kişi sayısında olur.
  return {
    perPersonFrom: perPersonFromTotal(input.priceAmount, input.maxPeople),
    totalFrom: input.priceAmount,
  };
}

// ---------------------------------------------------------------------------
// Bütçe karşılaştırması
// ---------------------------------------------------------------------------

export interface BudgetComparison {
  /** Kişi başı fark (pozitif = bütçeyi aşıyor). */
  perPersonDiff: Kurus;
  /** Bütçeye göre aşım oranı (0.12 = %12 aşım). Bütçe yoksa 0. */
  overBudgetPercent: number;
  isWithinBudget: boolean;
}

export function compareToBudget(
  packagePerPerson: Kurus,
  budgetPerPerson: Kurus | null,
): BudgetComparison {
  if (!budgetPerPerson || budgetPerPerson <= 0) {
    return { perPersonDiff: 0, overBudgetPercent: 0, isWithinBudget: true };
  }

  const diff = packagePerPerson - budgetPerPerson;
  return {
    perPersonDiff: diff,
    overBudgetPercent: diff > 0 ? diff / budgetPerPerson : 0,
    isWithinBudget: diff <= 0,
  };
}

// ---------------------------------------------------------------------------
// Katılımcı sayısı tahmini
// ---------------------------------------------------------------------------

export interface ParticipationCounts {
  going: number;
  maybe: number;
  notGoing: number;
  pending: number;
}

export function countParticipation(statuses: ParticipationStatus[]): ParticipationCounts {
  const counts: ParticipationCounts = { going: 0, maybe: 0, notGoing: 0, pending: 0 };
  for (const status of statuses) {
    if (status === 'going') counts.going += 1;
    else if (status === 'maybe') counts.maybe += 1;
    else if (status === 'not_going') counts.notGoing += 1;
    else counts.pending += 1;
  }
  return counts;
}

/**
 * Fiyatlandırma için kullanılacak tahmini katılımcı sayısı (D-025).
 *
 * Kesin gelenler + kararsızların yarısı (yukarı yuvarlanır).
 * Henüz kimse cevaplamadıysa planın tahmini kişi sayısına düşülür.
 * Sonuç her zaman en az `minPeople` kadardır.
 */
export function estimateAttendance(input: {
  counts: ParticipationCounts;
  planEstimatedPeople: number;
  planMinPeople: number;
}): number {
  const { counts, planEstimatedPeople, planMinPeople } = input;
  const answered = counts.going + counts.maybe + counts.notGoing;

  if (answered === 0) {
    return Math.max(planMinPeople, planEstimatedPeople);
  }

  const weighted = counts.going + Math.ceil(counts.maybe * MAYBE_PARTICIPANT_WEIGHT);
  return Math.max(planMinPeople, weighted);
}

/** Katılım hesabının kullanıcıya açıklaması (arayüzde ipucu olarak gösterilir). */
export function explainAttendance(counts: ParticipationCounts, estimated: number): string {
  const answered = counts.going + counts.maybe + counts.notGoing;
  if (answered === 0) {
    const pendingNote = counts.pending > 0 ? ` (${counts.pending} kişi cevapsız)` : '';
    return `Henüz kimse cevap vermedi${pendingNote}; fiyatlar ${estimated} kişiye göre hesaplandı.`;
  }

  const parts: string[] = [];
  if (counts.going > 0) parts.push(`${counts.going} kesin`);
  if (counts.maybe > 0) parts.push(`${counts.maybe} kararsız`);
  if (counts.pending > 0) parts.push(`${counts.pending} cevapsız`);

  return `${parts.join(', ')} — fiyatlar ${estimated} kişiye göre hesaplandı.`;
}
