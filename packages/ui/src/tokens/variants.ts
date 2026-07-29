import type { SemanticColors } from './semantic';
import { radius, spacing } from './scales';

/** Bileşen varyant tanımları — web ve mobil aynı kaynağı kullanır. */

export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export interface ButtonSizeSpec {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  gap: number;
  borderRadius: number;
}

export const buttonSizes: Record<ButtonSize, ButtonSizeSpec> = {
  sm: {
    height: 36,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    gap: spacing.xs,
    borderRadius: radius.sm,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.base,
    fontSize: 15,
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    gap: spacing.sm,
    borderRadius: radius.md,
  },
};

export interface ButtonColorSpec {
  background: string;
  backgroundHover: string;
  backgroundPressed: string;
  text: string;
  border: string;
}

export function buttonColors(c: SemanticColors, variant: ButtonVariant): ButtonColorSpec {
  switch (variant) {
    case 'primary':
      return {
        background: c.brandDefault,
        backgroundHover: c.brandHover,
        backgroundPressed: c.brandPressed,
        text: c.textOnBrand,
        border: 'transparent',
      };
    case 'secondary':
      return {
        background: 'transparent',
        backgroundHover: c.bgSubtle,
        backgroundPressed: c.bgRaised,
        text: c.textPrimary,
        border: c.borderStrong,
      };
    case 'ghost':
      return {
        background: 'transparent',
        backgroundHover: c.bgSubtle,
        backgroundPressed: c.bgRaised,
        text: c.brandText,
        border: 'transparent',
      };
    case 'danger':
      return {
        background: c.dangerSolid,
        backgroundHover: c.dangerText,
        backgroundPressed: c.dangerText,
        text: '#FFFFFF',
        border: 'transparent',
      };
  }
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

export const BADGE_TONES = [
  'neutral',
  'brand',
  'success',
  'warning',
  'danger',
  'info',
  'accent',
] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

export interface BadgeColorSpec {
  background: string;
  text: string;
  border: string;
}

export function badgeColors(c: SemanticColors, tone: BadgeTone): BadgeColorSpec {
  switch (tone) {
    case 'brand':
      return { background: c.brandSurface, text: c.brandText, border: c.brandSubtle };
    case 'success':
      return { background: c.successBg, text: c.successText, border: c.successBorder };
    case 'warning':
      return { background: c.warningBg, text: c.warningText, border: c.warningBorder };
    case 'danger':
      return { background: c.dangerBg, text: c.dangerText, border: c.dangerBorder };
    case 'info':
      return { background: c.infoBg, text: c.infoText, border: c.infoBorder };
    case 'accent':
      return { background: c.accentSubtle, text: c.accentText, border: c.accentSubtle };
    case 'neutral':
      return { background: c.bgSubtle, text: c.textSecondary, border: c.borderDefault };
  }
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export const inputSpec = {
  height: 48,
  paddingHorizontal: spacing.md,
  borderRadius: radius.sm,
  borderWidth: 1,
  fontSize: 15,
} as const;

// ---------------------------------------------------------------------------
// Kart
// ---------------------------------------------------------------------------

export const cardSpec = {
  padding: spacing.base,
  borderRadius: radius.lg,
  borderWidth: 1,
  gap: spacing.md,
} as const;

// ---------------------------------------------------------------------------
// Odak halkası
// ---------------------------------------------------------------------------

export const focusRing = {
  width: 2,
  offset: 2,
} as const;
