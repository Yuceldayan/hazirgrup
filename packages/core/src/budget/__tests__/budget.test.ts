import { describe, expect, it } from 'vitest';
import {
  calculatePackagePricing,
  compareToBudget,
  countParticipation,
  estimateAttendance,
  explainAttendance,
  packageStartingPrices,
  perPersonFromTotal,
  recalculateForPeople,
  resolveBudget,
  totalFromPerPerson,
} from '../index';

describe('perPersonFromTotal', () => {
  it('tam bölünen tutarı böler', () => {
    expect(perPersonFromTotal(60000, 4)).toBe(15000);
  });

  it('kişi başını YUKARI yuvarlar (D-015)', () => {
    // 100,00 ₺ / 3 kişi = 33,333… → 33,34 ₺
    expect(perPersonFromTotal(10000, 3)).toBe(3334);
  });

  it('sıfır veya negatif kişide 0 döner', () => {
    expect(perPersonFromTotal(10000, 0)).toBe(0);
    expect(perPersonFromTotal(10000, -2)).toBe(0);
  });

  it('sıfır tutarda 0 döner', () => {
    expect(perPersonFromTotal(0, 5)).toBe(0);
  });
});

describe('totalFromPerPerson', () => {
  it('kişi başından toplamı hesaplar', () => {
    expect(totalFromPerPerson(25000, 6)).toBe(150000);
  });

  it('geçersiz girdide 0 döner', () => {
    expect(totalFromPerPerson(25000, 0)).toBe(0);
    expect(totalFromPerPerson(0, 6)).toBe(0);
  });
});

describe('resolveBudget', () => {
  it('kişi başı modunda toplamı türetir', () => {
    expect(resolveBudget({ mode: 'per_person', perPerson: 25000, total: null, people: 8 })).toEqual({
      mode: 'per_person',
      people: 8,
      perPerson: 25000,
      total: 200000,
    });
  });

  it('toplam modunda kişi başını türetir', () => {
    expect(resolveBudget({ mode: 'total', perPerson: null, total: 200000, people: 8 })).toEqual({
      mode: 'total',
      people: 8,
      perPerson: 25000,
      total: 200000,
    });
  });

  it('kişi sayısını en az 1 kabul eder', () => {
    const result = resolveBudget({ mode: 'total', perPerson: null, total: 10000, people: 0 });
    expect(result.people).toBe(1);
    expect(result.perPerson).toBe(10000);
  });

  it('negatif tutarı sıfırlar', () => {
    const result = resolveBudget({ mode: 'per_person', perPerson: -500, total: null, people: 4 });
    expect(result.perPerson).toBe(0);
    expect(result.total).toBe(0);
  });

  it('iki yönlü dönüşüm tutarlıdır', () => {
    const a = resolveBudget({ mode: 'per_person', perPerson: 30000, total: null, people: 5 });
    const b = resolveBudget({ mode: 'total', perPerson: null, total: a.total, people: 5 });
    expect(b.perPerson).toBe(a.perPerson);
  });
});

describe('recalculateForPeople', () => {
  it('kişi başı modunda toplamı günceller, kişi başını korur', () => {
    const initial = resolveBudget({ mode: 'per_person', perPerson: 25000, total: null, people: 6 });
    const updated = recalculateForPeople(initial, 9);
    expect(updated.perPerson).toBe(25000);
    expect(updated.total).toBe(225000);
  });

  it('toplam modunda kişi başını günceller, toplamı korur', () => {
    const initial = resolveBudget({ mode: 'total', perPerson: null, total: 180000, people: 6 });
    const updated = recalculateForPeople(initial, 9);
    expect(updated.total).toBe(180000);
    expect(updated.perPerson).toBe(20000);
  });
});

describe('calculatePackagePricing', () => {
  it('kişi başı fiyatlı paketi hesaplar', () => {
    expect(
      calculatePackagePricing({
        pricingModel: 'per_person',
        priceAmount: 18000,
        peopleCount: 7,
        minPeople: 4,
      }),
    ).toEqual({ peopleCount: 7, perPersonPrice: 18000, totalPrice: 126000 });
  });

  it('sabit toplam fiyatlı pakette kişi başını böler', () => {
    expect(
      calculatePackagePricing({
        pricingModel: 'total',
        priceAmount: 140000,
        peopleCount: 10,
        minPeople: 8,
      }),
    ).toEqual({ peopleCount: 10, totalPrice: 140000, perPersonPrice: 14000 });
  });

  it('sabit toplamda az kişi gelirse kişi başı artar', () => {
    const many = calculatePackagePricing({
      pricingModel: 'total',
      priceAmount: 140000,
      peopleCount: 14,
      minPeople: 10,
    });
    const few = calculatePackagePricing({
      pricingModel: 'total',
      priceAmount: 140000,
      peopleCount: 10,
      minPeople: 10,
    });
    expect(few.perPersonPrice).toBeGreaterThan(many.perPersonPrice);
    expect(few.totalPrice).toBe(many.totalPrice);
  });
});

describe('packageStartingPrices', () => {
  it('kişi başı modelde minimum kişiyle toplam verir', () => {
    expect(
      packageStartingPrices({
        pricingModel: 'per_person',
        priceAmount: 20000,
        minPeople: 4,
        maxPeople: 8,
      }),
    ).toEqual({ perPersonFrom: 20000, totalFrom: 80000 });
  });

  it('sabit toplamda kişi başı en düşük değeri maksimum kişide olur', () => {
    expect(
      packageStartingPrices({
        pricingModel: 'total',
        priceAmount: 120000,
        minPeople: 6,
        maxPeople: 12,
      }),
    ).toEqual({ perPersonFrom: 10000, totalFrom: 120000 });
  });
});

describe('compareToBudget', () => {
  it('bütçe içindeyse aşım yok', () => {
    const result = compareToBudget(20000, 25000);
    expect(result.isWithinBudget).toBe(true);
    expect(result.perPersonDiff).toBe(-5000);
    expect(result.overBudgetPercent).toBe(0);
  });

  it('bütçeyi aşarsa oranı hesaplar', () => {
    const result = compareToBudget(28000, 25000);
    expect(result.isWithinBudget).toBe(false);
    expect(result.perPersonDiff).toBe(3000);
    expect(result.overBudgetPercent).toBeCloseTo(0.12, 5);
  });

  it('bütçe tanımlı değilse her paket uygundur', () => {
    expect(compareToBudget(50000, null).isWithinBudget).toBe(true);
    expect(compareToBudget(50000, 0).isWithinBudget).toBe(true);
  });
});

describe('countParticipation', () => {
  it('durumları sayar', () => {
    expect(
      countParticipation(['going', 'going', 'maybe', 'not_going', 'pending', 'pending']),
    ).toEqual({ going: 2, maybe: 1, notGoing: 1, pending: 2 });
  });
});

describe('estimateAttendance', () => {
  it('kimse cevaplamadıysa plandaki tahmini kullanır', () => {
    expect(
      estimateAttendance({
        counts: { going: 0, maybe: 0, notGoing: 0, pending: 5 },
        planEstimatedPeople: 8,
        planMinPeople: 5,
      }),
    ).toBe(8);
  });

  it('kesin gelenler + kararsızların yarısı (yukarı yuvarlanır)', () => {
    // 6 kesin + ceil(3 * 0.5) = 6 + 2 = 8
    expect(
      estimateAttendance({
        counts: { going: 6, maybe: 3, notGoing: 1, pending: 0 },
        planEstimatedPeople: 10,
        planMinPeople: 4,
      }),
    ).toBe(8);
  });

  it('sonuç asla minimum kişi sayısının altına düşmez', () => {
    expect(
      estimateAttendance({
        counts: { going: 1, maybe: 0, notGoing: 4, pending: 0 },
        planEstimatedPeople: 8,
        planMinPeople: 4,
      }),
    ).toBe(4);
  });
});

describe('explainAttendance', () => {
  it('cevap yoksa açıklar', () => {
    expect(explainAttendance({ going: 0, maybe: 0, notGoing: 0, pending: 4 }, 6)).toContain(
      'Henüz kimse cevap vermedi',
    );
  });

  it('cevap dağılımını özetler', () => {
    const text = explainAttendance({ going: 5, maybe: 2, notGoing: 1, pending: 3 }, 6);
    expect(text).toContain('5 kesin');
    expect(text).toContain('2 kararsız');
    expect(text).toContain('3 cevapsız');
    expect(text).toContain('6 kişiye göre');
  });
});
