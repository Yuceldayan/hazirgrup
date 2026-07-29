import { describe, expect, it } from 'vitest';
import type { MatchReasonKey } from '@hazirgrup/types';
import {
  makeBranch,
  makeBusiness,
  makeCandidate,
  makeDistrict,
} from '../../testing/factories';
import { matchPackages, priceRangeOf, sortMatches, suggestRelaxations } from '../index';
import type { MatchCriteria } from '../index';

// 2026-08-12 → Çarşamba (weekday 3)
const BASE_CRITERIA: MatchCriteria = {
  cityId: 'city-hakkari',
  districtId: 'district-merkez',
  categoryIds: ['cat-cafe'],
  eventDate: '2026-08-12',
  startTime: '20:00',
  endTime: '23:00',
  isTimeFlexible: false,
  peopleCount: 5,
  budgetPerPerson: 25000,
  preferenceKeys: [],
};

function reasonKeys(reasons: { key: MatchReasonKey }[]): MatchReasonKey[] {
  return reasons.map((r) => r.key);
}

describe('matchPackages — sert filtreler', () => {
  it('uygun paketi eşleştirir', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate()]);
    expect(outcome.matches).toHaveLength(1);
    expect(outcome.matches[0]!.package.id).toBe('pkg-1');
  });

  it('pasif paketi eler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ isActive: false })]);
    expect(outcome.matches).toHaveLength(0);
    expect(outcome.rejections.inactive).toBe(1);
  });

  it('doğrulanmamış işletmenin paketini eler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({}, { business: makeBusiness({ status: 'pending_review' }) }),
    ]);
    expect(outcome.matches).toHaveLength(0);
    expect(outcome.rejections.unverified_business).toBe(1);
  });

  it('pasif şubenin paketini eler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({}, { branch: makeBranch({ isActive: false }) }),
    ]);
    expect(outcome.rejections.inactive_branch).toBe(1);
  });

  it('başka şehirdeki paketi eler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({}, { branch: makeBranch({ cityId: 'city-van' }) }),
    ]);
    expect(outcome.rejections.wrong_city).toBe(1);
  });

  it('seçilmeyen kategorideki paketi eler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ categoryId: 'cat-halisaha' })]);
    expect(outcome.rejections.wrong_category).toBe(1);
  });

  it('kategori seçilmemişse tüm kategorileri kabul eder', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, categoryIds: [] }, [
      makeCandidate({ categoryId: 'cat-halisaha' }),
    ]);
    expect(outcome.matches).toHaveLength(1);
  });

  it('kapasite dışındaki paketi eler (grup çok kalabalık)', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, peopleCount: 12 }, [makeCandidate()]);
    expect(outcome.rejections.capacity).toBe(1);
  });

  it('kapasite dışındaki paketi eler (grup çok küçük)', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, peopleCount: 2 }, [makeCandidate()]);
    expect(outcome.rejections.capacity).toBe(1);
  });

  it('o gün sunulmayan paketi eler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({ availability: [{ weekday: 6, startTime: '12:00', endTime: '23:00' }] }),
    ]);
    expect(outcome.rejections.day_unavailable).toBe(1);
  });
});

describe('matchPackages — saat toleransı', () => {
  it('uygunluk aralığı içindeki saati kabul eder', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate()]);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('time_valid');
  });

  it('katı modda 30 dakikayı aşan sapmayı eler', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, startTime: '09:00' }, [
      makeCandidate({ availability: [{ weekday: 3, startTime: '12:00', endTime: '23:00' }] }),
    ]);
    expect(outcome.rejections.time).toBe(1);
  });

  it('katı modda 30 dakikaya kadar sapmayı kabul eder ve uyarır', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, startTime: '11:45' }, [
      makeCandidate({ availability: [{ weekday: 3, startTime: '12:00', endTime: '23:00' }] }),
    ]);
    expect(outcome.matches).toHaveLength(1);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('time_close');
  });

  it('esnek modda 90 dakikaya kadar sapmayı kabul eder', () => {
    const outcome = matchPackages(
      { ...BASE_CRITERIA, startTime: '10:45', isTimeFlexible: true },
      [makeCandidate({ availability: [{ weekday: 3, startTime: '12:00', endTime: '23:00' }] })],
    );
    expect(outcome.matches).toHaveLength(1);
  });

  it('esnek modda 90 dakikayı aşan sapmayı eler', () => {
    const outcome = matchPackages(
      { ...BASE_CRITERIA, startTime: '10:00', isTimeFlexible: true },
      [makeCandidate({ availability: [{ weekday: 3, startTime: '12:00', endTime: '23:00' }] })],
    );
    expect(outcome.rejections.time).toBe(1);
  });

  it('saat belirtilmemişse saat kısıtı uygulanmaz', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, startTime: null, endTime: null }, [
      makeCandidate({ availability: [{ weekday: 3, startTime: '12:00', endTime: '14:00' }] }),
    ]);
    expect(outcome.matches).toHaveLength(1);
    expect(reasonKeys(outcome.matches[0]!.reasons)).not.toContain('time_valid');
  });

  it('gece yarısını aşan uygunluk aralığını doğru değerlendirir', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, startTime: '23:30' }, [
      makeCandidate({ availability: [{ weekday: 3, startTime: '22:00', endTime: '02:00' }] }),
    ]);
    expect(outcome.matches).toHaveLength(1);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('time_valid');
  });
});

describe('matchPackages — bütçe', () => {
  it('bütçe içindeki paketi "Bütçene uygun" etiketler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ priceAmount: 20000 })]);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('within_budget');
    expect(outcome.matches[0]!.pricing.overBudgetPercent).toBe(0);
  });

  it('%15 tolerans içindeki aşımı gösterir ve uyarır', () => {
    // Bütçe 250 ₺, paket 275 ₺ → %10 aşım
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ priceAmount: 27500 })]);
    expect(outcome.matches).toHaveLength(1);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('near_budget');
    expect(outcome.matches[0]!.pricing.overBudgetPercent).toBeCloseTo(0.1, 5);
  });

  it('%15 toleransı aşan paketi eler', () => {
    // Bütçe 250 ₺, paket 300 ₺ → %20 aşım
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ priceAmount: 30000 })]);
    expect(outcome.matches).toHaveLength(0);
    expect(outcome.rejections.budget).toBe(1);
  });

  it('bütçe belirtilmemişse fiyat kısıtı uygulanmaz', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, budgetPerPerson: null }, [
      makeCandidate({ priceAmount: 90000 }),
    ]);
    expect(outcome.matches).toHaveLength(1);
    expect(reasonKeys(outcome.matches[0]!.reasons)).not.toContain('within_budget');
  });

  it('sabit toplam fiyatlı pakette kişi başını doğru hesaplar', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({ pricingModel: 'total', priceAmount: 100000, minPeople: 4, maxPeople: 8 }),
    ]);
    // 1000 ₺ / 5 kişi = 200 ₺
    expect(outcome.matches[0]!.pricing.perPersonPrice).toBe(20000);
    expect(outcome.matches[0]!.pricing.totalPrice).toBe(100000);
  });
});

describe('matchPackages — gerekçeler', () => {
  it('kusursuz eşleşmeye "Tam eşleşme" rozeti verir', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ priceAmount: 20000 })]);
    expect(outcome.matches[0]!.reasons[0]!.key).toBe('exact_match');
  });

  it('kişi sayısı etiketini gerçek grup büyüklüğüyle üretir', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, peopleCount: 6 }, [makeCandidate()]);
    const reason = outcome.matches[0]!.reasons.find((r) => r.key === 'group_size_fits');
    expect(reason?.label).toBe('6 kişilik grubuna uygun');
  });

  it('aynı ilçedeki paketi "İlçende" olarak işaretler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate()]);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('in_district');
  });

  it('farklı ilçedeki paketi şehir etiketiyle gösterir', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate(
        {},
        {
          branch: makeBranch({ districtId: 'district-yuksekova' }),
          district: makeDistrict({ id: 'district-yuksekova', name: 'Yüksekova', slug: 'yuksekova' }),
        },
      ),
    ]);
    const keys = reasonKeys(outcome.matches[0]!.reasons);
    expect(keys).toContain('in_city');
    expect(keys).not.toContain('in_district');
  });

  it('tercih eşleşmesini gösterir', () => {
    const outcome = matchPackages({ ...BASE_CRITERIA, preferenceKeys: ['outdoor', 'quiet'] }, [
      makeCandidate({ preferenceKeys: ['outdoor'] }),
    ]);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('preference_match');
  });

  it('popüler paketi işaretler', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ popularity: 95 })]);
    expect(reasonKeys(outcome.matches[0]!.reasons)).toContain('popular');
  });
});

describe('matchPackages — sıralama', () => {
  const candidates = [
    makeCandidate({ id: 'ucuz', slug: 'ucuz', priceAmount: 12000, popularity: 10 }),
    makeCandidate({ id: 'orta', slug: 'orta', priceAmount: 22000, popularity: 90 }),
    makeCandidate({ id: 'pahali', slug: 'pahali', priceAmount: 26000, popularity: 40 }),
  ];

  it('varsayılan olarak en uygun sıralamayı uygular', () => {
    const outcome = matchPackages(BASE_CRITERIA, candidates);
    expect(outcome.matches).toHaveLength(3);
    const scores = outcome.matches.map((m) => m.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('en düşük kişi başı fiyata göre sıralar', () => {
    const outcome = matchPackages(BASE_CRITERIA, candidates);
    const sorted = sortMatches(outcome.matches, 'lowest_per_person');
    expect(sorted.map((m) => m.package.id)).toEqual(['ucuz', 'orta', 'pahali']);
  });

  it('bütçeye en yakına göre sıralar', () => {
    const outcome = matchPackages(BASE_CRITERIA, candidates);
    const sorted = sortMatches(outcome.matches, 'closest_to_budget', 25000);
    // Bütçe 250 ₺ → pahali 260 ₺ (10 ₺ fark), orta 220 ₺ (30 ₺), ucuz 120 ₺ (130 ₺)
    expect(sorted.map((m) => m.package.id)).toEqual(['pahali', 'orta', 'ucuz']);
  });

  it('popülerliğe göre sıralar', () => {
    const outcome = matchPackages(BASE_CRITERIA, candidates);
    const sorted = sortMatches(outcome.matches, 'most_popular');
    expect(sorted.map((m) => m.package.id)).toEqual(['orta', 'pahali', 'ucuz']);
  });

  it('yeni eklenene göre sıralar', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({ id: 'eski', slug: 'eski', createdAt: '2025-01-01T00:00:00.000Z' }),
      makeCandidate({ id: 'yeni', slug: 'yeni', createdAt: '2026-06-01T00:00:00.000Z' }),
    ]);
    const sorted = sortMatches(outcome.matches, 'newest');
    expect(sorted[0]!.package.id).toBe('yeni');
  });
});

describe('suggestRelaxations', () => {
  it('en çok elemeye yol açan kısıtı önce önerir', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({ id: 'a', slug: 'a', priceAmount: 40000 }),
      makeCandidate({ id: 'b', slug: 'b', priceAmount: 45000 }),
      makeCandidate({ id: 'c', slug: 'c', minPeople: 10, maxPeople: 14 }),
    ]);
    expect(outcome.matches).toHaveLength(0);

    const suggestions = suggestRelaxations(outcome);
    expect(suggestions[0]!.key).toBe('budget');
    expect(suggestions[0]!.affectedCount).toBe(2);
    expect(suggestions.map((s) => s.key)).toContain('capacity');
  });

  it('kullanıcıya gösterilmeyecek teknik elemeleri öneri listesine koymaz', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ isActive: false })]);
    expect(suggestRelaxations(outcome)).toHaveLength(0);
  });

  it('her önerinin başlığı ve açıklaması vardır', () => {
    const outcome = matchPackages(BASE_CRITERIA, [makeCandidate({ priceAmount: 40000 })]);
    for (const suggestion of suggestRelaxations(outcome)) {
      expect(suggestion.label.length).toBeGreaterThan(0);
      expect(suggestion.description.length).toBeGreaterThan(0);
    }
  });
});

describe('priceRangeOf', () => {
  it('eşleşen paketlerin fiyat aralığını verir', () => {
    const outcome = matchPackages(BASE_CRITERIA, [
      makeCandidate({ id: 'a', slug: 'a', priceAmount: 12000 }),
      makeCandidate({ id: 'b', slug: 'b', priceAmount: 26000 }),
    ]);
    expect(priceRangeOf(outcome.matches)).toEqual({ min: 12000, max: 26000 });
  });

  it('boş listede null döner', () => {
    expect(priceRangeOf([])).toBeNull();
  });
});
