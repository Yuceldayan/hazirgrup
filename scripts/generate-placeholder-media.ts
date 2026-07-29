/**
 * Demo görselleri üretir (apps/web/public/media/*.svg).
 *
 * Harici görsel servisi kullanılmaz: CSP sıkı, ağ bağımlılığı yok, boyutlar
 * sabit (CLS koruması). Görseller açıkça temsilîdir.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { palette } from '../packages/ui/src/index';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, '../apps/web/public/media');

interface Spec {
  name: string;
  label: string;
  from: string;
  to: string;
  glyph: string;
}

const SPECS: Spec[] = [
  { name: 'cafe-1', label: 'Kafe', from: palette.brand[500], to: palette.brand[700], glyph: '☕' },
  { name: 'cafe-2', label: 'Bahçe', from: palette.green[600], to: palette.green[900], glyph: '🌿' },
  { name: 'cafe-3', label: 'Restoran', from: palette.accent[600], to: palette.accent[700], glyph: '🍽️' },
  { name: 'cafe-4', label: 'Kahvaltı', from: palette.amber[500], to: palette.amber[700], glyph: '🥐' },
  { name: 'cafe-5', label: 'Teras', from: palette.sky[600], to: palette.sky[900], glyph: '🌆' },
  { name: 'pitch-1', label: 'Halı Saha', from: palette.green[500], to: palette.green[700], glyph: '⚽' },
  { name: 'pitch-2', label: 'Spor Tesisi', from: palette.green[600], to: '#0B3D2E', glyph: '🥅' },
  { name: 'pitch-3', label: 'Saha', from: '#15803D', to: '#052E16', glyph: '⚽' },
  { name: 'game-1', label: 'Oyun Salonu', from: palette.brand[600], to: '#2B0F4E', glyph: '🎮' },
  { name: 'game-2', label: 'Konsol', from: '#7C3AED', to: '#3B0764', glyph: '🕹️' },
];

function svg(spec: Spec): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${spec.label} — temsilî görsel">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${spec.from}"/>
      <stop offset="100%" stop-color="${spec.to}"/>
    </linearGradient>
    <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="6" r="2" fill="rgba(255,255,255,0.10)"/>
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <rect width="1200" height="800" fill="url(#dots)"/>
  <text x="600" y="380" font-size="140" text-anchor="middle" dominant-baseline="middle">${spec.glyph}</text>
  <text x="600" y="500" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="46" font-weight="600" fill="#FFFFFF" text-anchor="middle">${spec.label}</text>
  <text x="600" y="556" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="24" fill="rgba(255,255,255,0.78)" text-anchor="middle">Temsilî görsel — demo verisi</text>
</svg>
`;
}

function favicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${palette.brand[500]}"/>
  <text x="32" y="42" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle">HG</text>
</svg>
`;
}

function logo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="HazırGrup logosu">
  <rect width="512" height="512" rx="112" fill="${palette.brand[500]}"/>
  <text x="256" y="330" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="220" font-weight="700" fill="#FFFFFF" text-anchor="middle">HG</text>
</svg>
`;
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const spec of SPECS) {
    writeFileSync(resolve(OUT_DIR, `${spec.name}.svg`), svg(spec), 'utf8');
  }

  const publicDir = resolve(OUT_DIR, '..');
  writeFileSync(resolve(publicDir, 'favicon.svg'), favicon(), 'utf8');
  writeFileSync(resolve(publicDir, 'logo.svg'), logo(), 'utf8');
  writeFileSync(resolve(publicDir, 'og-default.svg'), svg(SPECS[0] as Spec), 'utf8');

  console.log(`✓ ${SPECS.length} demo görseli + favicon + logo üretildi: ${OUT_DIR}`);
}

main();
