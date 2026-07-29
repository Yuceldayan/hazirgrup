'use client';

import { useEffect, useState } from 'react';
import styles from './layout.module.css';

type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'hg-theme';
const ORDER: Theme[] = ['system', 'light', 'dark'];

const LABELS: Record<Theme, string> = {
  system: 'Sistem teması',
  light: 'Açık tema',
  dark: 'Koyu tema',
};

const ICONS: Record<Theme, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
};

/**
 * Tema düğmesi.
 *
 * Tercih `localStorage`'da saklanır ve `<html data-theme>` üzerinden uygulanır.
 * `tokens.css` içindeki `[data-theme]` seçicileri sistem tercihini geçersiz kılar.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ORDER.includes(stored)) setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  function cycle() {
    const index = ORDER.indexOf(theme);
    setTheme(ORDER[(index + 1) % ORDER.length] ?? 'system');
  }

  // Sunucu ve istemci çıktısının aynı olması için ilk render'da nötr durum.
  const current = mounted ? theme : 'system';

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={cycle}
      title={LABELS[current]}
      aria-label={`Tema: ${LABELS[current]}. Değiştirmek için tıkla.`}
    >
      <span aria-hidden="true">{ICONS[current]}</span>
    </button>
  );
}

/**
 * Tema tercihini ilk boyamadan önce uygular — sayfa açılışında yanıp sönmeyi
 * (FOUC) engeller.
 */
export const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`;
