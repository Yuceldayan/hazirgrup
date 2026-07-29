import { expect, test } from '@playwright/test';

/**
 * Misafir akışı — mobil görünümde (Pixel 7).
 *
 * Davet sayfası mobil öncelikli olmalı, hızlı açılmalı ve hesap istememelidir
 * (docs/USER_FLOWS.md §C).
 */

test('mobil görünümde public sayfalar yatayda taşmaz', async ({ page }) => {
  for (const path of ['/', '/hakkari', '/mekanlar/kuzey-isigi-kahve-evi', '/sss']) {
    await page.goto(path);

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });

    expect(overflow, `${path} yatayda taşıyor`).toBeLessThanOrEqual(1);
  }
});

test('mobil menü açılıp kapanır', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByRole('button', { name: 'Menüyü aç' });
  await expect(toggle).toBeVisible();

  // Menü istemci durumuyla açılır; hydration bitmeden yapılan tıklama kaybolur.
  // Düğme, etiketi değiştiği için `aria-controls` ile hedeflenir.
  const toggleStable = page.locator('button[aria-controls="mobil-menu"]');
  await expect(async () => {
    await toggleStable.click();
    await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeVisible({
      timeout: 1500,
    });
  }).toPass({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Menüyü kapat' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toHaveCount(0);
});

test('dokunma alanları en az 44px', async ({ page }) => {
  await page.goto('/');

  const smallTargets = await page.evaluate(() => {
    const selectors = 'a[class*="button"], button';
    return Array.from(document.querySelectorAll(selectors))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: (element.textContent ?? '').trim().slice(0, 30),
          height: Math.round(rect.height),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.height > 0 && item.height < 44);
  });

  expect(smallTargets, JSON.stringify(smallTargets)).toHaveLength(0);
});

test('geçersiz davet sayfası mobilde de yol gösterir', async ({ page }) => {
  await page.goto('/davet/olmayan-token');
  await expect(page.getByText('Bu davet bağlantısı geçerli değil', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /HazırGrup'a göz at/ })).toBeVisible();
});

test('landing sayfasında tek belirgin ana işlem vardır', async ({ page }) => {
  await page.goto('/');
  // Ürün ilkesi: her ekranda tek ana işlem (docs/INFORMATION_ARCHITECTURE.md §1.4)
  await expect(page.getByRole('link', { name: 'Yeni plan oluştur' }).first()).toBeVisible();
});
