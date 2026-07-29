import { z } from 'zod';
import { PARTICIPATION_STATUSES } from '@hazirgrup/types';
import {
  clockTimeSchema,
  displayNameSchema,
  idSchema,
  isoDateSchema,
  noteSchema,
  optionalClockTimeSchema,
  peopleCountSchema,
  positiveKurusSchema,
} from './common';

/**
 * Plan sihirbazı şemaları.
 *
 * Her adım ayrı ayrı doğrulanabilir (anlık geri bildirim için) ve tamamı
 * birleşik şema ile sunucuda yeniden doğrulanır.
 */

// --- Adım 1: Ne zaman? -----------------------------------------------------
export const planStepWhenSchema = z.object({
  eventDate: isoDateSchema,
  startTime: optionalClockTimeSchema,
  endTime: optionalClockTimeSchema,
  isTimeFlexible: z.boolean().default(false),
});

// --- Adım 2: Nerede? -------------------------------------------------------
export const planStepWhereSchema = z.object({
  cityId: idSchema,
  districtId: z
    .union([idSchema, z.literal('')])
    .optional()
    .transform((value) => (value ? value : null)),
});

// --- Adım 3: Kaç kişi? -----------------------------------------------------
export const planStepPeopleSchema = z
  .object({
    estimatedPeople: peopleCountSchema,
    minPeople: peopleCountSchema,
    maxPeople: peopleCountSchema,
  })
  .refine((data) => data.minPeople <= data.estimatedPeople, {
    message: 'Tahmini kişi sayısı, en az kişi sayısından küçük olamaz.',
    path: ['estimatedPeople'],
  })
  .refine((data) => data.estimatedPeople <= data.maxPeople, {
    message: 'Tahmini kişi sayısı, en fazla kişi sayısından büyük olamaz.',
    path: ['estimatedPeople'],
  });

// --- Adım 4: Bütçe ---------------------------------------------------------
export const planStepBudgetSchema = z
  .object({
    budgetMode: z.enum(['per_person', 'total']),
    budgetPerPerson: positiveKurusSchema.nullable(),
    budgetTotal: positiveKurusSchema.nullable(),
  })
  .refine(
    (data) =>
      data.budgetMode === 'per_person' ? data.budgetPerPerson !== null : data.budgetTotal !== null,
    {
      message: 'Bütçe tutarını gir.',
      path: ['budgetPerPerson'],
    },
  );

// --- Adım 5: Kategoriler ---------------------------------------------------
export const planStepCategoriesSchema = z.object({
  categoryIds: z
    .array(idSchema)
    .min(1, 'En az bir aktivite türü seç.')
    .max(5, 'En fazla 5 aktivite türü seçebilirsin.'),
});

// --- Adım 6: Tercihler -----------------------------------------------------
export const planStepPreferencesSchema = z.object({
  preferenceKeys: z.array(z.string().max(60)).max(15, 'En fazla 15 tercih seçebilirsin.').default([]),
  note: noteSchema,
});

// --- Adım 7: Ad ------------------------------------------------------------
export const planNameSchema = z
  .string()
  .trim()
  .min(3, 'Plan adı en az 3 karakter olmalı.')
  .max(80, 'Plan adı en fazla 80 karakter olabilir.');

// --- Birleşik şema ---------------------------------------------------------

/**
 * Ham alan tanımı (refinement'sız).
 * Taslak şeması bunun `.partial()` hâlini kullanır; Zod refinement içeren
 * nesnelerde `.partial()` çağrısına izin vermez.
 */
export const planFieldsSchema = z.object({
  name: planNameSchema,
  eventDate: isoDateSchema,
  startTime: optionalClockTimeSchema,
  endTime: optionalClockTimeSchema,
  isTimeFlexible: z.boolean().default(false),
  cityId: idSchema,
  districtId: z
    .union([idSchema, z.literal('')])
    .optional()
    .transform((value) => (value ? value : null)),
  estimatedPeople: peopleCountSchema,
  minPeople: peopleCountSchema,
  maxPeople: peopleCountSchema,
  budgetMode: z.enum(['per_person', 'total']),
  budgetPerPerson: positiveKurusSchema.nullable(),
  budgetTotal: positiveKurusSchema.nullable(),
  categoryIds: z.array(idSchema).min(1, 'En az bir aktivite türü seç.').max(5),
  preferenceKeys: z.array(z.string().max(60)).max(15).default([]),
  note: noteSchema,
  asDraft: z.boolean().default(false),
});

export const createPlanSchema = z
  .object({
    name: planNameSchema,
    eventDate: isoDateSchema,
    startTime: optionalClockTimeSchema,
    endTime: optionalClockTimeSchema,
    isTimeFlexible: z.boolean().default(false),
    cityId: idSchema,
    districtId: z
      .union([idSchema, z.literal('')])
      .optional()
      .transform((value) => (value ? value : null)),
    estimatedPeople: peopleCountSchema,
    minPeople: peopleCountSchema,
    maxPeople: peopleCountSchema,
    budgetMode: z.enum(['per_person', 'total']),
    budgetPerPerson: positiveKurusSchema.nullable(),
    budgetTotal: positiveKurusSchema.nullable(),
    categoryIds: z.array(idSchema).min(1, 'En az bir aktivite türü seç.').max(5),
    preferenceKeys: z.array(z.string().max(60)).max(15).default([]),
    note: noteSchema,
    asDraft: z.boolean().default(false),
  })
  .refine((data) => data.minPeople <= data.estimatedPeople && data.estimatedPeople <= data.maxPeople, {
    message: 'Kişi sayısı aralığı tutarsız.',
    path: ['estimatedPeople'],
  })
  .refine(
    (data) =>
      data.budgetMode === 'per_person' ? data.budgetPerPerson !== null : data.budgetTotal !== null,
    { message: 'Bütçe tutarını gir.', path: ['budgetPerPerson'] },
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      // Gece yarısını aşan aralıklara izin verilir (22:00 → 01:00).
      return data.startTime !== data.endTime;
    },
    { message: 'Başlangıç ve bitiş saati aynı olamaz.', path: ['endTime'] },
  );

export type CreatePlanInputSchema = z.infer<typeof createPlanSchema>;

/**
 * Taslak kaydında yalnızca girilen alanlar doğrulanır; sihirbaz yarım
 * bırakılsa bile veri kaybolmaz (docs/USER_FLOWS.md §B).
 */
export const savePlanDraftSchema = planFieldsSchema.partial();

export type SavePlanDraftInput = z.infer<typeof savePlanDraftSchema>;

export const updatePlanSchema = createPlanSchema;

// --- Katılım ---------------------------------------------------------------

export const participationStatusSchema = z.enum(PARTICIPATION_STATUSES);

export const joinPlanSchema = z.object({
  displayName: displayNameSchema,
  status: z.enum(['going', 'maybe', 'not_going'], {
    message: 'Katılım durumunu seç.',
  }),
});

export type JoinPlanInput = z.infer<typeof joinPlanSchema>;

export const updateParticipationSchema = z.object({
  participantId: idSchema,
  status: participationStatusSchema,
});

// --- Oylama ----------------------------------------------------------------

export const castVoteSchema = z.object({
  planId: idSchema,
  packageId: idSchema,
});

export const startVotingSchema = z.object({
  planId: idSchema,
  endsAt: z
    .union([z.iso.datetime({ message: 'Geçerli bir bitiş zamanı seç.' }), z.literal('')])
    .optional()
    .transform((value) => (value ? value : null)),
});

export const resolveTieSchema = z.object({
  planId: idSchema,
  packageId: idSchema,
});

// --- Davet -----------------------------------------------------------------

export const inviteCodeSchema = z
  .string()
  .trim()
  .min(4, 'Davet kodu en az 4 karakter olmalı.')
  .max(20, 'Davet kodu çok uzun.');

export const cancelPlanSchema = z.object({
  planId: idSchema,
  reason: z.string().trim().max(300, 'Gerekçe en fazla 300 karakter olabilir.').optional(),
});

export const planTimeRangeSchema = z.object({
  startTime: clockTimeSchema,
  endTime: clockTimeSchema,
});
