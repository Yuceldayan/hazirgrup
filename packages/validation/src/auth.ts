import { z } from 'zod';
import { displayNameSchema, emailSchema, passwordSchema } from './common';

export const signUpSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    acceptTerms: z.literal(true, {
      message: 'Devam etmek için kullanım koşullarını kabul etmelisin.',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler eşleşmiyor.',
    path: ['passwordConfirm'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  // Girişte şifre kuralı uygulanmaz; yalnızca boş olmaması kontrol edilir.
  password: z.string().min(1, 'Şifreni gir.'),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Sıfırlama bağlantısı geçersiz.'),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler eşleşmiyor.',
    path: ['passwordConfirm'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
