/**
 * Tasarım tokenlarından CSS değişkeni üretici.
 *
 * `packages/ui` tek gerçek kaynaktır (docs/DECISIONS.md D-002/D-003).
 * Bu script `apps/web/src/styles/tokens.css` dosyasını üretir; token değerleri
 * CSS'e elle yazılmaz.
 *
 * Çalıştırma:  npm run tokens:css   (web build/dev öncesinde otomatik çalışır)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  breakpoints,
  darkColors,
  elevation,
  fontStacks,
  layout,
  lightColors,
  motion,
  radius,
  spacing,
  typography,
  type SemanticColors,
} from '../packages/ui/src/index';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, '../apps/web/src/styles/tokens.css');

/** camelCase → kebab-case */
const kebab = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function colorBlock(colors: SemanticColors, indent = '  '): string {
  return Object.entries(colors)
    .map(([key, value]) => `${indent}--color-${kebab(key)}: ${value};`)
    .join('\n');
}

function main(): void {
  const lines: string[] = [];

  lines.push(`/* ============================================================================
 * BU DOSYA ÜRETİLMİŞTİR. Elle düzenlemeyin.
 * Kaynak: packages/ui/src/tokens/*.ts   ·   Üretim: npm run tokens:css
 * ============================================================================ */

:root {
  color-scheme: light dark;

  /* --- Tipografi --------------------------------------------------------- */
  --font-sans: ${fontStacks.sans};
  --font-mono: ${fontStacks.mono};`);

  for (const [name, style] of Object.entries(typography)) {
    lines.push(`  --type-${kebab(name)}-size: ${style.fontSize}px;`);
    lines.push(`  --type-${kebab(name)}-line: ${style.lineHeight}px;`);
    lines.push(`  --type-${kebab(name)}-weight: ${style.fontWeight};`);
  }

  lines.push('\n  /* --- Spacing ------------------------------------------------------------ */');
  for (const [name, value] of Object.entries(spacing)) {
    lines.push(`  --space-${name}: ${value}px;`);
  }

  lines.push('\n  /* --- Radius ------------------------------------------------------------- */');
  for (const [name, value] of Object.entries(radius)) {
    lines.push(`  --radius-${name}: ${value}px;`);
  }

  lines.push('\n  /* --- Elevation ---------------------------------------------------------- */');
  for (const [name, value] of Object.entries(elevation)) {
    lines.push(`  --elevation-${name}: ${value.boxShadow};`);
  }

  lines.push('\n  /* --- Hareket ------------------------------------------------------------ */');
  lines.push(`  --duration-press: ${motion.duration.press}ms;`);
  lines.push(`  --duration-transition: ${motion.duration.transition}ms;`);
  lines.push(`  --duration-page: ${motion.duration.page}ms;`);
  lines.push(`  --easing: ${motion.easing};`);

  lines.push('\n  /* --- Düzen -------------------------------------------------------------- */');
  lines.push(`  --content-max-width: ${layout.contentMaxWidth}px;`);
  lines.push(`  --prose-max-width: ${layout.proseMaxWidth}ch;`);
  lines.push(`  --min-touch-target: ${layout.minTouchTarget}px;`);
  lines.push(`  --screen-padding: ${layout.screenPaddingMobile}px;`);

  lines.push('\n  /* --- Renkler (açık tema) ------------------------------------------------- */');
  lines.push(colorBlock(lightColors));
  lines.push('}');

  lines.push(`
@media (min-width: ${breakpoints.md}px) {
  :root {
    --screen-padding: ${layout.screenPaddingDesktop}px;
  }
}

/* --- Koyu tema: sistem tercihi ---------------------------------------------- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${colorBlock(darkColors, '    ')}
  }
}

/* --- Koyu tema: kullanıcı tercihi (sistem ayarını geçersiz kılar) ----------- */
:root[data-theme='dark'] {
${colorBlock(darkColors, '  ')}
}

:root[data-theme='light'] {
${colorBlock(lightColors, '  ')}
}

/* --- Kırılım noktaları (dokümantasyon amaçlı) ------------------------------- */
/* sm: ${breakpoints.sm}px · md: ${breakpoints.md}px · lg: ${breakpoints.lg}px · xl: ${breakpoints.xl}px */
`);

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
  console.log(`✓ tokens.css üretildi: ${OUTPUT}`);
}

main();
