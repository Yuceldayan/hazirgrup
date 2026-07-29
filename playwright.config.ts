import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright yapılandırması.
 *
 * E2E testleri DEMO modda çalışır (`HG_DATA_SOURCE=demo`): deterministik seed,
 * harici bağımlılık yok (docs/TEST_STRATEGY.md §4).
 */

const PORT = 3210;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'masaustu',
      use: { ...devices['Desktop Chrome'] },
      // Mobil-özel senaryolar yalnızca 'mobil' projesinde çalışır.
      testIgnore: /guest-flow\.spec\.ts/,
    },
    {
      name: 'mobil',
      use: { ...devices['Pixel 7'] },
      testMatch: /guest-flow\.spec\.ts/,
    },
  ],

  webServer: {
    command: `npm run build --workspace @hazirgrup/web && npm run start --workspace @hazirgrup/web -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      HG_DATA_SOURCE: 'demo',
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      NEXT_PUBLIC_ENVIRONMENT: 'production',
    },
  },
});
