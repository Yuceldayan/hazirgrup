import { palette } from './palette';

/**
 * Anlamsal renk tokenları. Web `tokens.css` değişkenlerine, mobil doğrudan
 * `StyleSheet` değerlerine dönüştürür. Ham palet değeri UI'da kullanılmaz.
 */
export interface SemanticColors {
  // Zeminler
  bgCanvas: string;
  bgSurface: string;
  bgRaised: string;
  bgSubtle: string;
  bgOverlay: string;

  // Metin
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textOnBrand: string;

  // Kenarlık
  borderDefault: string;
  borderStrong: string;
  borderFocus: string;

  // Marka
  brandSurface: string;
  brandSubtle: string;
  brandDefault: string;
  brandHover: string;
  brandPressed: string;
  brandText: string;

  // Vurgu
  accentDefault: string;
  accentSubtle: string;
  accentText: string;

  // Durumlar
  successBg: string;
  successBorder: string;
  successText: string;
  successSolid: string;

  warningBg: string;
  warningBorder: string;
  warningText: string;
  warningSolid: string;

  dangerBg: string;
  dangerBorder: string;
  dangerText: string;
  dangerSolid: string;

  infoBg: string;
  infoBorder: string;
  infoText: string;
  infoSolid: string;

  // Diğer
  skeleton: string;
  disabledBg: string;
  disabledText: string;
}

export const lightColors: SemanticColors = {
  bgCanvas: palette.neutral[0],
  bgSurface: palette.neutral[0],
  bgRaised: palette.neutral[50],
  bgSubtle: palette.neutral[100],
  bgOverlay: 'rgba(15, 23, 42, 0.48)',

  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textMuted: palette.neutral[500],
  textInverse: palette.neutral[0],
  textOnBrand: palette.neutral[0],

  borderDefault: palette.neutral[200],
  borderStrong: palette.neutral[300],
  borderFocus: palette.brand[500],

  brandSurface: palette.brand[50],
  brandSubtle: palette.brand[100],
  brandDefault: palette.brand[500],
  brandHover: palette.brand[600],
  brandPressed: palette.brand[700],
  brandText: palette.brand[700],

  accentDefault: palette.accent[500],
  accentSubtle: palette.accent[100],
  accentText: palette.accent[700],

  successBg: palette.green[50],
  successBorder: palette.green[100],
  successText: palette.green[700],
  successSolid: palette.green[600],

  warningBg: palette.amber[50],
  warningBorder: palette.amber[100],
  warningText: palette.amber[700],
  warningSolid: palette.amber[600],

  dangerBg: palette.red[50],
  dangerBorder: palette.red[100],
  dangerText: palette.red[700],
  dangerSolid: palette.red[600],

  infoBg: palette.sky[50],
  infoBorder: palette.sky[100],
  infoText: palette.sky[700],
  infoSolid: palette.sky[600],

  skeleton: palette.neutral[200],
  disabledBg: palette.neutral[100],
  disabledText: palette.neutral[500],
};

export const darkColors: SemanticColors = {
  bgCanvas: palette.dark.canvas,
  bgSurface: palette.dark.surface,
  bgRaised: palette.dark.raised,
  bgSubtle: palette.dark.subtle,
  bgOverlay: 'rgba(0, 0, 0, 0.62)',

  textPrimary: palette.neutral[100],
  textSecondary: palette.neutral[400],
  textMuted: palette.neutral[400],
  textInverse: palette.neutral[950],
  // Koyu temada marka rengi açık tonda olduğu için üstüne koyu metin gelir (WCAG AA).
  textOnBrand: palette.neutral[950],

  borderDefault: palette.dark.border,
  borderStrong: palette.dark.borderStrong,
  borderFocus: palette.brand[400],

  brandSurface: '#1A1D3A',
  brandSubtle: '#232650',
  brandDefault: palette.brand[400],
  brandHover: palette.brand[300],
  brandPressed: palette.brand[500],
  brandText: palette.brand[300],

  accentDefault: palette.accent[400],
  accentSubtle: '#3A2415',
  accentText: palette.accent[300],

  successBg: '#0B2A20',
  successBorder: '#14523E',
  successText: palette.green[400],
  successSolid: palette.green[500],

  warningBg: '#2C1F07',
  warningBorder: '#5A3F0E',
  warningText: palette.amber[400],
  warningSolid: palette.amber[500],

  dangerBg: '#2C1114',
  dangerBorder: '#5A2126',
  dangerText: palette.red[400],
  // Beyaz metnin AA eşiğini geçebilmesi için koyu temada da 600 tonu kullanılır.
  dangerSolid: palette.red[600],

  infoBg: '#08243A',
  infoBorder: '#0F4266',
  infoText: palette.sky[400],
  infoSolid: palette.sky[500],

  skeleton: palette.dark.raised,
  disabledBg: palette.dark.raised,
  disabledText: palette.neutral[500],
};

export const colorSchemes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ColorSchemeName = keyof typeof colorSchemes;
