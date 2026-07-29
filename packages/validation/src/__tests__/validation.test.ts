import { describe, expect, it } from 'vitest';
import {
  businessApplicationSchema,
  castVoteSchema,
  createPlanSchema,
  createReservationSchema,
  deleteAccountSchema,
  emailSchema,
  firstErrorMessage,
  joinPlanSchema,
  passwordSchema,
  phoneSchema,
  respondReservationSchema,
  reviewApplicationSchema,
  seoFieldsSchema,
  signInSchema,
  signUpSchema,
  slugSchema,
  toFieldErrors,
  upsertPackageSchema,
} from '../index';

const VALID_PLAN = {
  name: 'Cuma Akşamı Buluşması',
  eventDate: '2026-08-14',
  startTime: '20:00',
  endTime: '23:00',
  isTimeFlexible: true,
  cityId: 'city-hakkari',
  districtId: 'district-merkez',
  estimatedPeople: 8,
  minPeople: 6,
  maxPeople: 10,
  budgetMode: 'per_person' as const,
  budgetPerPerson: 30000,
  budgetTotal: null,
  categoryIds: ['cat-cafe'],
  preferenceKeys: ['quiet'],
  note: 'Ayrı salon olursa süper olur.',
  asDraft: false,
};

describe('emailSchema', () => {
  it('geçerli e-postayı kabul eder ve küçük harfe çevirir', () => {
    expect(emailSchema.parse('  Elif@Ornek.TEST ')).toBe('elif@ornek.test');
  });

  it.each(['', 'elif', 'elif@', '@ornek.test', 'elif ornek.test'])(
    '%s geçersizdir',
    (value) => {
      expect(emailSchema.safeParse(value).success).toBe(false);
    },
  );

  it('hata mesajı Türkçedir', () => {
    const result = emailSchema.safeParse('elif');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstErrorMessage(result.error)).toMatch(/[çğışöüÇĞİŞÖÜ]|gir\.|adres/i);
    }
  });
});

describe('passwordSchema (D-021)', () => {
  it('8+ karakter, harf ve rakam içeren şifreyi kabul eder', () => {
    expect(passwordSchema.safeParse('Demo1234').success).toBe(true);
    expect(passwordSchema.safeParse('sifre123').success).toBe(true);
  });

  it('kısa şifreyi reddeder', () => {
    expect(passwordSchema.safeParse('Ab1').success).toBe(false);
  });

  it('rakamsız şifreyi reddeder', () => {
    expect(passwordSchema.safeParse('sadeceharf').success).toBe(false);
  });

  it('harfsiz şifreyi reddeder', () => {
    expect(passwordSchema.safeParse('12345678').success).toBe(false);
  });

  it('özel karakter zorunlu değildir', () => {
    expect(passwordSchema.safeParse('parola12').success).toBe(true);
  });
});

describe('phoneSchema', () => {
  it.each(['05551112233', '5551112233', '+905551112233', '905551112233'])(
    '%s geçerlidir',
    (value) => {
      expect(phoneSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each(['0212 111 22 33', '123', 'telefon'])('%s geçersizdir', (value) => {
    expect(phoneSchema.safeParse(value).success).toBe(false);
  });
});

describe('slugSchema', () => {
  it('geçerli slugu kabul eder', () => {
    expect(slugSchema.safeParse('hakkari-merkez').success).toBe(true);
  });

  it.each(['Hakkari', 'hakkari_merkez', '-hakkari', 'şemdinli'])('%s geçersizdir', (value) => {
    expect(slugSchema.safeParse(value).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  const valid = {
    displayName: 'Elif Demir',
    email: 'elif@ornek.test',
    password: 'Demo1234',
    passwordConfirm: 'Demo1234',
    acceptTerms: true as const,
  };

  it('geçerli kaydı kabul eder', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('eşleşmeyen şifreyi reddeder ve doğru alanı işaretler', () => {
    const result = signUpSchema.safeParse({ ...valid, passwordConfirm: 'Baska1234' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error).passwordConfirm).toBe('Şifreler eşleşmiyor.');
    }
  });

  it('koşullar kabul edilmediyse reddeder', () => {
    const result = signUpSchema.safeParse({ ...valid, acceptTerms: false });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('girişte şifre kuralı uygulanmaz (eski şifreler için)', () => {
    expect(signInSchema.safeParse({ email: 'a@b.test', password: 'kisa' }).success).toBe(true);
  });

  it('boş şifreyi reddeder', () => {
    expect(signInSchema.safeParse({ email: 'a@b.test', password: '' }).success).toBe(false);
  });
});

describe('createPlanSchema', () => {
  it('geçerli planı kabul eder', () => {
    expect(createPlanSchema.safeParse(VALID_PLAN).success).toBe(true);
  });

  it('ilçe boşsa null yapar', () => {
    const result = createPlanSchema.parse({ ...VALID_PLAN, districtId: '' });
    expect(result.districtId).toBeNull();
  });

  it('tutarsız kişi aralığını reddeder', () => {
    const result = createPlanSchema.safeParse({ ...VALID_PLAN, estimatedPeople: 20 });
    expect(result.success).toBe(false);
  });

  it('bütçe modu per_person iken tutar zorunludur', () => {
    const result = createPlanSchema.safeParse({ ...VALID_PLAN, budgetPerPerson: null });
    expect(result.success).toBe(false);
  });

  it('bütçe modu total iken toplam tutar yeterlidir', () => {
    const result = createPlanSchema.safeParse({
      ...VALID_PLAN,
      budgetMode: 'total',
      budgetPerPerson: null,
      budgetTotal: 240000,
    });
    expect(result.success).toBe(true);
  });

  it('en az bir kategori ister', () => {
    expect(createPlanSchema.safeParse({ ...VALID_PLAN, categoryIds: [] }).success).toBe(false);
  });

  it('geçersiz tarih biçimini reddeder', () => {
    expect(createPlanSchema.safeParse({ ...VALID_PLAN, eventDate: '14.08.2026' }).success).toBe(
      false,
    );
  });

  it('geçersiz saat biçimini reddeder', () => {
    expect(createPlanSchema.safeParse({ ...VALID_PLAN, startTime: '25:00' }).success).toBe(false);
  });

  it('gece yarısını aşan saat aralığına izin verir', () => {
    const result = createPlanSchema.safeParse({
      ...VALID_PLAN,
      startTime: '22:00',
      endTime: '01:00',
    });
    expect(result.success).toBe(true);
  });

  it('aynı başlangıç ve bitiş saatini reddeder', () => {
    const result = createPlanSchema.safeParse({
      ...VALID_PLAN,
      startTime: '20:00',
      endTime: '20:00',
    });
    expect(result.success).toBe(false);
  });

  it('negatif bütçeyi reddeder', () => {
    expect(createPlanSchema.safeParse({ ...VALID_PLAN, budgetPerPerson: -100 }).success).toBe(false);
  });
});

describe('joinPlanSchema', () => {
  it('misafir katılımını kabul eder', () => {
    expect(joinPlanSchema.safeParse({ displayName: 'Burak', status: 'going' }).success).toBe(true);
  });

  it('boş adı reddeder', () => {
    expect(joinPlanSchema.safeParse({ displayName: 'B', status: 'going' }).success).toBe(false);
  });

  it('HTML enjeksiyon denemesini reddeder', () => {
    const result = joinPlanSchema.safeParse({
      displayName: '<script>alert(1)</script>',
      status: 'going',
    });
    expect(result.success).toBe(false);
  });

  it('pending durumunu kabul etmez (misafir açık cevap vermeli)', () => {
    expect(joinPlanSchema.safeParse({ displayName: 'Burak', status: 'pending' }).success).toBe(
      false,
    );
  });
});

describe('castVoteSchema', () => {
  it('geçerli oyu kabul eder', () => {
    expect(castVoteSchema.safeParse({ planId: 'p1', packageId: 'pkg1' }).success).toBe(true);
  });

  it('eksik paket kimliğini reddeder', () => {
    expect(castVoteSchema.safeParse({ planId: 'p1', packageId: '' }).success).toBe(false);
  });
});

describe('upsertPackageSchema', () => {
  const validPackage = {
    branchId: 'branch-01',
    categoryId: 'cat-cafe',
    name: '6–10 Kişilik Akşam Yemeği Paketi',
    description: 'Ana yemek, meze ve tatlıdan oluşan grup menüsü. Ayrı salonda servis edilir.',
    minPeople: 6,
    maxPeople: 10,
    pricingModel: 'per_person' as const,
    priceAmount: 32000,
    durationMinutes: 150,
    reservationTerms: 'En az 2 saat önce.',
    cancellationTerms: '3 saat öncesine kadar ücretsiz.',
    isActive: true,
    isPublic: true,
    items: ['Ana yemek', 'Meze', 'Tatlı'],
    availability: [{ weekday: 5, startTime: '18:00', endTime: '23:00' }],
    preferenceKeys: ['private_room'],
  };

  it('geçerli paketi kabul eder', () => {
    expect(upsertPackageSchema.safeParse(validPackage).success).toBe(true);
  });

  it('min > max kapasiteyi reddeder', () => {
    const result = upsertPackageSchema.safeParse({ ...validPackage, minPeople: 12 });
    expect(result.success).toBe(false);
  });

  it('içeriksiz paketi reddeder', () => {
    expect(upsertPackageSchema.safeParse({ ...validPackage, items: [] }).success).toBe(false);
  });

  it('uygunluk günü olmayan paketi reddeder', () => {
    expect(upsertPackageSchema.safeParse({ ...validPackage, availability: [] }).success).toBe(false);
  });

  it('kısa açıklamayı reddeder', () => {
    expect(upsertPackageSchema.safeParse({ ...validPackage, description: 'Kısa' }).success).toBe(
      false,
    );
  });

  it('sıfır fiyatı reddeder', () => {
    expect(upsertPackageSchema.safeParse({ ...validPackage, priceAmount: 0 }).success).toBe(false);
  });
});

describe('createReservationSchema', () => {
  it('geçerli talebi kabul eder', () => {
    expect(
      createReservationSchema.safeParse({
        planId: 'plan-1',
        packageId: 'pkg-1',
        contactName: 'Elif Demir',
        contactPhone: '05551112233',
        note: 'Duş kullanacağız.',
      }).success,
    ).toBe(true);
  });

  it('geçersiz telefonu reddeder', () => {
    expect(
      createReservationSchema.safeParse({
        planId: 'plan-1',
        packageId: 'pkg-1',
        contactName: 'Elif Demir',
        contactPhone: '123',
      }).success,
    ).toBe(false);
  });
});

describe('respondReservationSchema', () => {
  it('onayda gerekçe istemez', () => {
    expect(
      respondReservationSchema.safeParse({ reservationId: 'r1', decision: 'confirm' }).success,
    ).toBe(true);
  });

  it('rette gerekçe zorunludur', () => {
    const result = respondReservationSchema.safeParse({ reservationId: 'r1', decision: 'reject' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error).rejectionReason).toBe('Reddetme gerekçesi seçmelisin.');
    }
  });

  it('gerekçeli reti kabul eder', () => {
    expect(
      respondReservationSchema.safeParse({
        reservationId: 'r1',
        decision: 'reject',
        rejectionReason: 'fully_booked',
      }).success,
    ).toBe(true);
  });
});

describe('businessApplicationSchema', () => {
  const valid = {
    businessName: 'Vadi Kahve Atölyesi',
    contactName: 'Aday İşletmeci',
    phone: '05001119999',
    email: 'basvuru@ornek.test',
    address: 'Yeni Mahalle, Örnek Caddesi No:2, Yüksekova',
    cityId: 'city-hakkari',
    districtId: 'district-yuksekova',
    categoryId: 'cat-cafe',
    taxInfo: 'DEMO-VKN-0000000000',
    acceptTerms: true as const,
  };

  it('geçerli başvuruyu kabul eder', () => {
    expect(businessApplicationSchema.safeParse(valid).success).toBe(true);
  });

  it('kısa adresi reddeder', () => {
    expect(businessApplicationSchema.safeParse({ ...valid, address: 'Merkez' }).success).toBe(false);
  });
});

describe('reviewApplicationSchema', () => {
  it('gerekçesiz reti reddeder', () => {
    expect(
      reviewApplicationSchema.safeParse({ applicationId: 'a1', decision: 'rejected' }).success,
    ).toBe(false);
  });

  it('gerekçeli reti kabul eder', () => {
    expect(
      reviewApplicationSchema.safeParse({
        applicationId: 'a1',
        decision: 'rejected',
        note: 'Belgeler eksik.',
      }).success,
    ).toBe(true);
  });
});

describe('seoFieldsSchema', () => {
  it('boş alanları null yapar (otomatik metadata kullanılır)', () => {
    const result = seoFieldsSchema.parse({ isIndexable: true });
    expect(result.seoTitle).toBeNull();
    expect(result.seoDescription).toBeNull();
  });

  it('uzun SEO başlığını reddeder', () => {
    expect(seoFieldsSchema.safeParse({ seoTitle: 'x'.repeat(100) }).success).toBe(false);
  });

  it('geçersiz canonical URL reddeder', () => {
    expect(seoFieldsSchema.safeParse({ seoCanonical: 'canonical-degil' }).success).toBe(false);
  });
});

describe('deleteAccountSchema', () => {
  it('doğru onay metnini ister', () => {
    expect(deleteAccountSchema.safeParse({ confirmation: 'HESABIMI SİL' }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirmation: 'sil' }).success).toBe(false);
  });
});

describe('toFieldErrors', () => {
  it('alan başına ilk hatayı döner', () => {
    const result = signUpSchema.safeParse({
      displayName: 'A',
      email: 'gecersiz',
      password: '123',
      passwordConfirm: '456',
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFieldErrors(result.error);
      expect(Object.keys(errors).length).toBeGreaterThan(2);
      expect(errors.displayName).toBeTruthy();
      expect(errors.email).toBeTruthy();
    }
  });
});
