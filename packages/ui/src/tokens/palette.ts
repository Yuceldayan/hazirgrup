/**
 * Ham renk paleti. Bileşenler bu değerleri **doğrudan kullanmaz**;
 * her zaman `semantic.ts` üzerinden anlamsal token kullanılır.
 */

export const palette = {
  brand: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#4F46E5',
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#1E1B4B',
  },
  accent: {
    100: '#FFEDD5',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
  },
  neutral: {
    0: '#FFFFFF',
    25: '#FBFCFD',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#0B0D17',
    1000: '#000000',
  },
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    900: '#064E3B',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    900: '#78350F',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    900: '#7F1D1D',
  },
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    900: '#0C4A6E',
  },
  /** Koyu tema yüzeyleri — nötr ölçekten türetilmez, ayrı ayarlanmıştır. */
  dark: {
    canvas: '#0B0D17',
    surface: '#151827',
    raised: '#1D2133',
    subtle: '#11141F',
    border: '#252A3D',
    borderStrong: '#333A52',
  },
} as const;

export type Palette = typeof palette;
