/**
 * WCAG 2.1 kontrast oranı hesabı.
 * Tasarım tokenlarının erişilebilirlik eşiklerini otomatik doğrulamak için kullanılır.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** `#RGB`, `#RRGGBB` veya `rgba(r, g, b, a)` biçimlerini çözer. */
export function parseColor(input: string): Rgb | null {
  const value = input.trim();

  const rgbaMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(value);
  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
    };
  }

  const hex = value.startsWith('#') ? value.slice(1) : null;
  if (!hex) return null;

  if (hex.length === 3) {
    const [r, g, b] = [hex[0], hex[1], hex[2]];
    if (!r || !g || !b) return null;
    return {
      r: parseInt(r + r, 16),
      g: parseInt(g + g, 16),
      b: parseInt(b + b, 16),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function channelLuminance(channel8Bit: number): number {
  const c = channel8Bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG göreli parlaklık (0–1). */
export function relativeLuminance(color: Rgb): number {
  return (
    0.2126 * channelLuminance(color.r) +
    0.7152 * channelLuminance(color.g) +
    0.0722 * channelLuminance(color.b)
  );
}

/** İki renk arasındaki WCAG kontrast oranı (1–21). */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) {
    throw new Error(`Geçersiz renk değeri: ${foreground} / ${background}`);
  }
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;

export function meetsAA(foreground: string, background: string, large = false): boolean {
  return contrastRatio(foreground, background) >= (large ? WCAG_AA_LARGE : WCAG_AA_NORMAL);
}
