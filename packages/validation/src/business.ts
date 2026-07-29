import { z } from 'zod';
import { REJECTION_REASONS } from '@hazirgrup/types';
import {
  clockTimeSchema,
  displayNameSchema,
  emailSchema,
  idSchema,
  noteSchema,
  optionalUrlSchema,
  peopleCountSchema,
  phoneSchema,
  positiveKurusSchema,
  shortTextSchema,
  slugSchema,
  weekdaySchema,
} from './common';

// ---------------------------------------------------------------------------
// İşletme başvurusu
// ---------------------------------------------------------------------------

export const businessApplicationSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'İşletme adı en az 2 karakter olmalı.')
    .max(120, 'İşletme adı en fazla 120 karakter olabilir.'),
  contactName: displayNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  address: z
    .string()
    .trim()
    .min(10, 'Adresi daha ayrıntılı yaz.')
    .max(300, 'Adres en fazla 300 karakter olabilir.'),
  cityId: idSchema,
  districtId: idSchema,
  categoryId: idSchema,
  /** Vergi/işletme kimlik bilgisi — yalnızca yönetici görür. */
  taxInfo: shortTextSchema(60).optional().transform((v) => (v ? v : null)),
  instagram: shortTextSchema(60).optional().transform((v) => (v ? v : null)),
  website: optionalUrlSchema,
  acceptTerms: z.literal(true, {
    message: 'Başvuru için işletme koşullarını kabul etmelisin.',
  }),
});

export type BusinessApplicationInput = z.infer<typeof businessApplicationSchema>;

export const reviewApplicationSchema = z
  .object({
    applicationId: idSchema,
    decision: z.enum(['approved', 'rejected']),
    note: z.string().trim().max(400, 'Not en fazla 400 karakter olabilir.').optional(),
  })
  .refine((data) => data.decision !== 'rejected' || (data.note && data.note.length >= 5), {
    message: 'Reddederken gerekçe yazman gerekiyor.',
    path: ['note'],
  });

// ---------------------------------------------------------------------------
// İşletme bilgileri
// ---------------------------------------------------------------------------

export const updateBusinessSchema = z.object({
  name: z.string().trim().min(2, 'İşletme adı en az 2 karakter olmalı.').max(120),
  description: z
    .string()
    .trim()
    .min(20, 'Açıklama en az 20 karakter olmalı; müşteriye ne sunduğunu anlat.')
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir.'),
  phone: phoneSchema,
  whatsapp: z
    .union([phoneSchema, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  website: optionalUrlSchema,
  instagram: shortTextSchema(60).optional().transform((v) => (v ? v : null)),
});

// ---------------------------------------------------------------------------
// Şube
// ---------------------------------------------------------------------------

export const branchHoursSchema = z
  .object({
    weekday: weekdaySchema,
    isClosed: z.boolean(),
    opensAt: z.union([clockTimeSchema, z.literal('')]).optional(),
    closesAt: z.union([clockTimeSchema, z.literal('')]).optional(),
  })
  .refine((data) => data.isClosed || (data.opensAt && data.closesAt), {
    message: 'Açık günler için açılış ve kapanış saatini gir.',
    path: ['opensAt'],
  });

export const upsertBranchSchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(2, 'Şube adı en az 2 karakter olmalı.').max(80),
  cityId: idSchema,
  districtId: idSchema,
  address: z.string().trim().min(10, 'Adresi daha ayrıntılı yaz.').max(300),
  phone: z
    .union([phoneSchema, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  whatsapp: z
    .union([phoneSchema, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  isActive: z.boolean().default(true),
  hours: z.array(branchHoursSchema).length(7, 'Haftanın 7 günü için saat bilgisi gerekli.'),
});

export type UpsertBranchInputSchema = z.infer<typeof upsertBranchSchema>;

// ---------------------------------------------------------------------------
// Paket
// ---------------------------------------------------------------------------

export const packageAvailabilitySchema = z
  .object({
    weekday: weekdaySchema,
    startTime: clockTimeSchema,
    endTime: clockTimeSchema,
  })
  .refine((data) => data.startTime !== data.endTime, {
    message: 'Başlangıç ve bitiş saati aynı olamaz.',
    path: ['endTime'],
  });

export const upsertPackageSchema = z
  .object({
    id: idSchema.optional(),
    branchId: idSchema,
    categoryId: idSchema,
    name: z
      .string()
      .trim()
      .min(5, 'Paket adı en az 5 karakter olmalı.')
      .max(120, 'Paket adı en fazla 120 karakter olabilir.'),
    description: z
      .string()
      .trim()
      .min(20, 'Açıklama en az 20 karakter olmalı; pakette ne olduğunu anlat.')
      .max(1000),
    minPeople: peopleCountSchema,
    maxPeople: peopleCountSchema,
    pricingModel: z.enum(['per_person', 'total'], { message: 'Fiyatlandırma modelini seç.' }),
    priceAmount: positiveKurusSchema,
    durationMinutes: z
      .number()
      .int()
      .min(15, 'Süre en az 15 dakika olmalı.')
      .max(720, 'Süre en fazla 12 saat olabilir.')
      .nullable(),
    reservationTerms: z.string().trim().max(500).optional().transform((v) => (v ? v : null)),
    cancellationTerms: z.string().trim().max(500).optional().transform((v) => (v ? v : null)),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(true),
    items: z
      .array(z.string().trim().min(2, 'Boş içerik satırı olamaz.').max(120))
      .min(1, 'Pakete en az bir içerik ekle.')
      .max(20, 'En fazla 20 içerik ekleyebilirsin.'),
    availability: z
      .array(packageAvailabilitySchema)
      .min(1, 'Paketin geçerli olduğu en az bir gün seç.'),
    preferenceKeys: z.array(z.string().max(60)).max(15).default([]),
  })
  .refine((data) => data.minPeople <= data.maxPeople, {
    message: 'En az kişi sayısı, en fazla kişi sayısından büyük olamaz.',
    path: ['maxPeople'],
  });

export type UpsertPackageInputSchema = z.infer<typeof upsertPackageSchema>;

/** Hazır paket şablonu — işletmenin hızlı başlaması için. */
export const packageTemplateSchema = z.object({
  templateKey: z.enum(['cafe_group', 'dinner_group', 'pitch_hour', 'game_tournament', 'birthday']),
  branchId: idSchema,
});

// ---------------------------------------------------------------------------
// Rezervasyon
// ---------------------------------------------------------------------------

export const createReservationSchema = z.object({
  planId: idSchema,
  packageId: idSchema,
  peopleCount: peopleCountSchema.optional(),
  contactName: displayNameSchema,
  contactPhone: phoneSchema,
  note: noteSchema,
});

export type CreateReservationInputSchema = z.infer<typeof createReservationSchema>;

export const respondReservationSchema = z
  .object({
    reservationId: idSchema,
    decision: z.enum(['confirm', 'reject']),
    rejectionReason: z.enum(REJECTION_REASONS).optional(),
    note: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.decision !== 'reject' || Boolean(data.rejectionReason), {
    message: 'Reddetme gerekçesi seçmelisin.',
    path: ['rejectionReason'],
  });

export const cancelReservationSchema = z.object({
  reservationId: idSchema,
  reason: z.string().trim().max(300).optional(),
});

// ---------------------------------------------------------------------------
// Ekip
// ---------------------------------------------------------------------------

export const addTeamMemberSchema = z.object({
  businessId: idSchema,
  email: emailSchema,
});

// ---------------------------------------------------------------------------
// SEO / yönetici
// ---------------------------------------------------------------------------

export const seoFieldsSchema = z.object({
  seoTitle: z
    .string()
    .trim()
    .max(70, 'SEO başlığı en fazla 70 karakter olabilir.')
    .optional()
    .transform((v) => (v ? v : null)),
  seoDescription: z
    .string()
    .trim()
    .max(170, 'Meta açıklama en fazla 170 karakter olabilir.')
    .optional()
    .transform((v) => (v ? v : null)),
  slug: slugSchema.optional(),
  seoCanonical: z
    .union([z.string().url('Geçerli bir canonical URL gir.'), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  ogImageUrl: z
    .union([z.string().url('Geçerli bir görsel bağlantısı gir.'), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  isIndexable: z.boolean().default(true),
});

export const upsertCitySchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(2, 'Şehir adı en az 2 karakter olmalı.').max(80),
  slug: slugSchema.optional(),
  intro: z.string().trim().max(1000).optional().transform((v) => (v ? v : null)),
  isActive: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  isIndexable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const upsertDistrictSchema = upsertCitySchema.extend({
  cityId: idSchema,
});

export const upsertCategorySchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(2, 'Kategori adı en az 2 karakter olmalı.').max(80),
  slug: slugSchema.optional(),
  icon: z.string().trim().max(40).default('tag'),
  description: z.string().trim().max(500).optional().transform((v) => (v ? v : null)),
  isActive: z.boolean().default(true),
  isIndexable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const suspendUserSchema = z.object({
  userId: idSchema,
  suspended: z.boolean(),
});

// ---------------------------------------------------------------------------
// Profil ve ayarlar
// ---------------------------------------------------------------------------

export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
  phone: z
    .union([phoneSchema, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  cityId: z
    .union([idSchema, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  districtId: z
    .union([idSchema, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
});

export const updateThemeSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('HESABIMI SİL', {
    message: 'Onaylamak için "HESABIMI SİL" yazmalısın.',
  }),
});

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(5, 'Konu en az 5 karakter olmalı.').max(120),
  body: z.string().trim().min(20, 'Mesajın en az 20 karakter olmalı.').max(2000),
});

export const reportSchema = z.object({
  subjectType: z.enum(['business', 'package', 'plan', 'user']),
  subjectId: idSchema,
  reason: z.string().trim().min(5, 'Şikâyet nedenini yaz.').max(200),
  detail: z.string().trim().max(1000).optional().transform((v) => (v ? v : null)),
});
