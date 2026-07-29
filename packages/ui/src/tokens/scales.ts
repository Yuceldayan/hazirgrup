/** Spacing, tipografi, radius, elevation ve hareket ölçekleri. */

// ---------------------------------------------------------------------------
// Spacing — 4px tabanlı
// ---------------------------------------------------------------------------

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export type SpacingToken = keyof typeof spacing;

// ---------------------------------------------------------------------------
// Tipografi
// ---------------------------------------------------------------------------

export interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: 400 | 500 | 600 | 700;
  letterSpacing?: number;
}

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: 700, letterSpacing: -0.5 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: 700, letterSpacing: -0.3 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: 600, letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: 600 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: 400 },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: 600 },
  small: { fontSize: 13, lineHeight: 18, fontWeight: 400 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: 500 },
  mono: { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 1 },
} as const satisfies Record<string, TypeStyle>;

export type TypographyToken = keyof typeof typography;

/**
 * Sistem font yığını — harici font yüklenmez (docs/DECISIONS.md D-009).
 * Ek ağ isteği yok, FOUT/CLS riski yok.
 */
export const fontStacks = {
  sans: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
  mono: `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`,
} as const;

/** Sistem yazı ölçeklenmesinde düzenin bozulmaması için üst sınır. */
export const MAX_FONT_SCALE = 1.4;

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;

// ---------------------------------------------------------------------------
// Elevation
// ---------------------------------------------------------------------------

export interface ElevationStyle {
  /** Web `box-shadow` değeri. */
  boxShadow: string;
  /** Android `elevation` değeri. */
  elevation: number;
  /** iOS gölge parametreleri. */
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffsetY: number;
}

export const elevation = {
  none: { boxShadow: 'none', elevation: 0, shadowOpacity: 0, shadowRadius: 0, shadowOffsetY: 0 },
  sm: {
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
    elevation: 1,
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffsetY: 1,
  },
  md: {
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffsetY: 2,
  },
  lg: {
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
    elevation: 8,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffsetY: 8,
  },
} as const satisfies Record<string, ElevationStyle>;

export type ElevationToken = keyof typeof elevation;

// ---------------------------------------------------------------------------
// Hareket
// ---------------------------------------------------------------------------

export const motion = {
  duration: {
    press: 120,
    transition: 200,
    page: 300,
  },
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

// ---------------------------------------------------------------------------
// Düzen
// ---------------------------------------------------------------------------

export const layout = {
  /** Erişilebilirlik: minimum dokunma alanı. */
  minTouchTarget: 44,
  contentMaxWidth: 1120,
  proseMaxWidth: 72, // ch
  screenPaddingMobile: spacing.base,
  screenPaddingDesktop: spacing.xl,
} as const;

export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointToken = keyof typeof breakpoints;
