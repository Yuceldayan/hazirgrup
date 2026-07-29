import { z } from 'zod';

/**
 * Ortak doğrulama parçaları.
 *
 * Hata mesajları Türkçe ve kullanıcıya doğrudan gösterilebilir niteliktedir.
 * Aynı şemalar hem istemcide hem sunucuda kullanılır; istemci doğrulaması
 * atlanabilir varsayılır (docs/SECURITY_MODEL.md §7).
 */

export const idSchema = z.string().min(1, 'Geçersiz kayıt.');

export const slugSchema = z
  .string()
  .min(2, 'Adres en az 2 karakter olmalı.')
  .max(120, 'Adres en fazla 120 karakter olabilir.')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Adres yalnızca küçük harf, rakam ve tire içerebilir.');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'E-posta adresini gir.')
  .max(255, 'E-posta adresi çok uzun.')
  .email('Geçerli bir e-posta adresi gir.')
  .transform((value) => value.toLowerCase());

/** Şifre kuralı: en az 8 karakter, en az bir harf ve bir rakam (D-021). */
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı.')
  .max(128, 'Şifre en fazla 128 karakter olabilir.')
  .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, 'Şifre en az bir harf içermeli.')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermeli.');

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Adın en az 2 karakter olmalı.')
  .max(60, 'Ad en fazla 60 karakter olabilir.')
  .regex(/^[^<>{}]*$/, 'Ad geçersiz karakter içeriyor.');

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+?90)?0?5\d{9}$/,
    'Geçerli bir cep telefonu numarası gir (örnek: 0555 111 22 33).',
  );

export const optionalPhoneSchema = z
  .union([phoneSchema, z.literal('')])
  .optional()
  .transform((value) => (value ? value : null));

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih seç.')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Geçerli bir tarih seç.');

export const clockTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Saati SS:DD biçiminde gir (örnek: 20:30).');

export const optionalClockTimeSchema = z
  .union([clockTimeSchema, z.literal('')])
  .optional()
  .transform((value) => (value ? value : null));

/** Kuruş cinsinden tutar (D-014). */
export const kurusSchema = z
  .number({ message: 'Geçerli bir tutar gir.' })
  .int('Tutar tam sayı olmalı.')
  .min(0, 'Tutar negatif olamaz.')
  .max(100_000_000, 'Tutar çok yüksek.');

export const positiveKurusSchema = kurusSchema.refine((v) => v > 0, 'Tutar sıfırdan büyük olmalı.');

export const peopleCountSchema = z
  .number({ message: 'Kişi sayısını gir.' })
  .int('Kişi sayısı tam sayı olmalı.')
  .min(1, 'En az 1 kişi olmalı.')
  .max(200, 'En fazla 200 kişi olabilir.');

export const shortTextSchema = (max = 200) =>
  z.string().trim().max(max, `En fazla ${max} karakter olabilir.`);

export const noteSchema = z
  .string()
  .trim()
  .max(500, 'Not en fazla 500 karakter olabilir.')
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

export const urlSchema = z
  .string()
  .trim()
  .url('Geçerli bir bağlantı gir.')
  .max(500, 'Bağlantı çok uzun.');

export const optionalUrlSchema = z
  .union([urlSchema, z.literal('')])
  .optional()
  .transform((value) => (value ? value : null));

export const weekdaySchema = z
  .number()
  .int()
  .min(0, 'Geçersiz gün.')
  .max(6, 'Geçersiz gün.');

/** Zod hatasını alan → mesaj sözlüğüne çevirir (form gösterimi için). */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** İlk hata mesajını döner (toast gösterimi için). */
export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Girdiğin bilgilerde bir sorun var.';
}
