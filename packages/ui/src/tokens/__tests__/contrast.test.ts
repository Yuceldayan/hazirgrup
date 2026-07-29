import { describe, expect, it } from 'vitest';
import { contrastRatio, meetsAA, parseColor, WCAG_AA_LARGE, WCAG_AA_NORMAL } from '../contrast';
import { colorSchemes, type SemanticColors } from '../semantic';
import { badgeColors, BADGE_TONES, buttonColors, BUTTON_VARIANTS } from '../variants';

describe('parseColor', () => {
  it('kısa hex biçimini çözer', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('uzun hex biçimini çözer', () => {
    expect(parseColor('#4F46E5')).toEqual({ r: 79, g: 70, b: 229 });
  });

  it('rgba biçimini çözer', () => {
    expect(parseColor('rgba(15, 23, 42, 0.48)')).toEqual({ r: 15, g: 23, b: 42 });
  });

  it('geçersiz değerde null döner', () => {
    expect(parseColor('mavi')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('siyah/beyaz için 21 döner', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('aynı renk için 1 döner', () => {
    expect(contrastRatio('#4F46E5', '#4F46E5')).toBeCloseTo(1, 5);
  });

  it('sıra bağımsızdır', () => {
    expect(contrastRatio('#0F172A', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#0F172A'), 5);
  });
});

/**
 * Erişilebilirlik kapısı: tasarım sistemindeki metin/zemin kombinasyonları
 * WCAG AA eşiğini karşılamalı (docs/DESIGN_SYSTEM.md §10).
 */
const surfaceKeys = ['bgCanvas', 'bgSurface', 'bgRaised', 'bgSubtle'] as const;

describe.each(Object.entries(colorSchemes))('%s teması kontrast', (schemeName, colors) => {
  const c = colors as SemanticColors;

  it.each(surfaceKeys)('birincil metin / %s ≥ 4.5:1', (surfaceKey) => {
    const ratio = contrastRatio(c.textPrimary, c[surfaceKey]);
    expect(ratio, `${schemeName}.textPrimary / ${surfaceKey} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    );
  });

  it.each(surfaceKeys)('ikincil metin / %s ≥ 4.5:1', (surfaceKey) => {
    const ratio = contrastRatio(c.textSecondary, c[surfaceKey]);
    expect(
      ratio,
      `${schemeName}.textSecondary / ${surfaceKey} = ${ratio.toFixed(2)}`,
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it('yardımcı metin yüzey üzerinde en az büyük metin eşiğini karşılar', () => {
    expect(contrastRatio(c.textMuted, c.bgSurface)).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
  });

  it.each(['success', 'warning', 'danger', 'info'] as const)(
    '%s metni kendi zemini üzerinde okunabilir',
    (tone) => {
      const text = c[`${tone}Text` as keyof SemanticColors] as string;
      const bg = c[`${tone}Bg` as keyof SemanticColors] as string;
      const ratio = contrastRatio(text, bg);
      expect(ratio, `${schemeName}.${tone} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL,
      );
    },
  );

  it.each([...BUTTON_VARIANTS])('%s butonu metni zeminine karşı okunabilir', (variant) => {
    const spec = buttonColors(c, variant);
    const background = spec.background === 'transparent' ? c.bgSurface : spec.background;
    const ratio = contrastRatio(spec.text, background);
    expect(ratio, `${schemeName}.button.${variant} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    );
  });

  it.each([...BADGE_TONES])('%s rozeti okunabilir', (tone) => {
    const spec = badgeColors(c, tone);
    const ratio = contrastRatio(spec.text, spec.background);
    expect(ratio, `${schemeName}.badge.${tone} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    );
  });

  it('odak halkası zeminden ayırt edilebilir', () => {
    expect(meetsAA(c.borderFocus, c.bgCanvas, true)).toBe(true);
  });
});
