import { expect, test } from '@playwright/test';

/**
 * Route koruma testleri (docs/TEST_STRATEGY.md §6).
 *
 * Yetkisiz kullanıcı korumalı alanlara erişemez; erişim denemesi giriş
 * ekranına yönlendirilir ve dönüş adresi korunur.
 */

const PROTECTED_PATHS = [
  '/hesap',
  '/hesap/planlar',
  '/hesap/plan/yeni',
  '/hesap/rezervasyonlar',
  '/hesap/ayarlar',
  '/business',
  '/business/paketler',
  '/business/rezervasyonlar',
  '/admin',
  '/admin/basvurular',
  '/admin/kullanicilar',
];

test.describe('oturumsuz erişim', () => {
  for (const path of PROTECTED_PATHS) {
    test(`${path} giriş ekranına yönlendirir`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/giris/);
      // Dönüş adresi korunur
      expect(page.url()).toContain('devam=');
    });
  }
});

test('normal kullanıcı yönetici paneline erişemez', async ({ page }) => {
  await page.goto('/auth/giris');
  await page.locator('input[name="email"]').fill('elif@ornek.test');
  await page.locator('input[name="password"]').fill('Demo1234');
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(/\/hesap/, { timeout: 20_000 });

  await page.goto('/admin');
  // Yetkisiz kullanıcı bilgilendirme sayfasına yönlendirilir; panel içeriği ASLA görünmez.
  await expect(page).toHaveURL(/yetkisiz/);
  await expect(page.getByText('Bu sayfayı görüntüleme yetkin yok')).toBeVisible();
  expect(await page.content()).not.toContain('Sistem özeti');
});

test('normal kullanıcı işletme paneli yerine başvuru çağrısı görür', async ({ page }) => {
  await page.goto('/auth/giris');
  await page.locator('input[name="email"]').fill('elif@ornek.test');
  await page.locator('input[name="password"]').fill('Demo1234');
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(/\/hesap/, { timeout: 20_000 });

  await page.goto('/business');
  await expect(page.getByText(/İşletmeni HazırGrup'a ekle/)).toBeVisible();
});

test('geçersiz davet bağlantısı yol gösterir', async ({ page }) => {
  await page.goto('/davet/gecersiz-token-12345');
  await expect(page.getByText('Bu davet bağlantısı geçerli değil', { exact: true })).toBeVisible();
});

test('geçersiz şehir slugu 404 döner', async ({ request }) => {
  const response = await request.get('/olmayan-sehir', { maxRedirects: 0 });
  expect(response.status()).toBe(404);
});

test('geçersiz paket slugu 404 döner', async ({ request }) => {
  const response = await request.get('/paketler/olmayan-paket', { maxRedirects: 0 });
  expect(response.status()).toBe(404);
});

test('güvenlik başlıkları uygulanır', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();

  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).toContain("object-src 'none'");
  expect(headers['content-security-policy']).toContain("base-uri 'self'");
  expect(headers['content-security-policy']).toContain("form-action 'self'");
  expect(headers['referrer-policy']).toBeTruthy();

  // Üretimde eval açılmamalıdır (docs/DECISIONS.md D-031).
  expect(headers['content-security-policy']).not.toContain("'unsafe-eval'");
});

/**
 * REGRESYON: CSP satır içi RSC betiklerini engellerse hydration hiç tamamlanmaz
 * ve tüm istemci etkileşimi sessizce ölür — sayfa "çalışıyor" gibi görünür.
 * Bu test etkileşimin gerçekten canlı olduğunu doğrular (docs/DECISIONS.md D-031).
 */
test('istemci tarafı hydration tamamlanır (CSP satır içi betikleri engellemez)', async ({
  page,
}) => {
  const cspViolations: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /Content Security Policy/i.test(message.text())) {
      cspViolations.push(message.text());
    }
  });

  await page.goto('/');

  // Tema düğmesi yalnızca hydration sonrası çalışır: durum değişimi kanıttır.
  const themeToggle = page.locator('button[aria-label^="Tema:"]').first();
  await expect(themeToggle).toBeVisible();

  const beforeTheme = await page.evaluate(
    () => document.documentElement.dataset.theme ?? document.documentElement.className,
  );
  await expect(async () => {
    await themeToggle.click();
    const afterTheme = await page.evaluate(
      () => document.documentElement.dataset.theme ?? document.documentElement.className,
    );
    expect(afterTheme).not.toBe(beforeTheme);
  }).toPass({ timeout: 20_000 });

  expect(cspViolations, `CSP ihlalleri:\n${cspViolations.join('\n')}`).toHaveLength(0);
});

test('davet sayfası referrer sızdırmaz', async ({ request }) => {
  const response = await request.get('/davet/herhangi-bir-token');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  expect(response.headers()['x-robots-tag']).toContain('noindex');
});
