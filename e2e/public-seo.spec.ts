import { expect, test } from '@playwright/test';

/**
 * Public sayfaların SEO çıktısı — gerçek HTML üzerinde
 * (docs/SEO_STRATEGY.md §15).
 */

const PUBLIC_PAGES = [
  '/',
  '/nasil-calisir',
  '/sehirler',
  '/kategoriler',
  '/hakkari',
  '/hakkari/merkez',
  '/kategoriler/kafe-restoran',
  '/mekanlar/kuzey-isigi-kahve-evi',
  '/rehber/hakkari-grup-paketleri',
  '/sss',
];

test.describe('public sayfa SEO çıktısı', () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} — metadata, canonical ve tek h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Başlık
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThanOrEqual(70);

      // Açıklama
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(description).toBeTruthy();
      expect((description ?? '').length).toBeGreaterThan(40);

      // Canonical — tek ve mutlak
      const canonicals = page.locator('link[rel="canonical"]');
      await expect(canonicals).toHaveCount(1);
      const canonical = await canonicals.getAttribute('href');
      expect(canonical).toMatch(/^https?:\/\//);
      expect(canonical).not.toContain('?');

      // Tek h1
      await expect(page.locator('h1')).toHaveCount(1);

      // Open Graph
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        'tr_TR',
      );
    });
  }
});

test('JSON-LD geçerli ve sahte rating içermez', async ({ page }) => {
  await page.goto('/mekanlar/kuzey-isigi-kahve-evi');

  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(scripts.length).toBeGreaterThan(0);

  let sawLocalBusiness = false;
  for (const raw of scripts) {
    const parsed = JSON.parse(raw) as unknown;
    const nodes = Array.isArray(parsed) ? parsed : [parsed];

    for (const node of nodes as Array<Record<string, unknown>>) {
      expect(node['@context']).toBe('https://schema.org');
      expect(node).not.toHaveProperty('aggregateRating');
      expect(node).not.toHaveProperty('review');
      if (typeof node['@type'] === 'string' && node['@type'].includes('Restaurant')) {
        sawLocalBusiness = true;
      }
    }
  }

  expect(sawLocalBusiness, 'LocalBusiness alt tipi bulunmalı').toBe(true);
});

test('mekân sayfası içeriği server-rendered', async ({ request }) => {
  // JavaScript çalıştırmadan ham HTML alınır.
  const response = await request.get('/mekanlar/kuzey-isigi-kahve-evi');
  const html = await response.text();

  expect(html).toContain('Kuzey Işığı Kahve Evi');
  expect(html).toContain('Cumhuriyet Mahallesi');
  expect(html).toContain('çalışma saatleri');
});

test('paket sayfası içeriği server-rendered ve fiyat görünür', async ({ request }) => {
  const listResponse = await request.get('/paketler/kuzey-isigi-kahve-evi-4-6-kisilik-kahve-ve-tatli-paketi');
  expect(listResponse.status()).toBe(200);

  const html = await listResponse.text();
  expect(html).toContain('kişi başı');
  expect(html).toContain('Pakete dahil olanlar');
});

test('robots.txt sitemap adresini bildirir ve private yolları kapatır', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(body).toContain('Sitemap:');
  for (const prefix of ['/admin/', '/business/', '/auth/', '/hesap/', '/davet/']) {
    expect(body).toContain(`Disallow: ${prefix}`);
  }
});

test('sitemap yalnızca public URL içerir', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const body = await response.text();

  expect(body).toContain('<urlset');
  expect(body).toContain('/hakkari');
  expect(body).toContain('/mekanlar/');

  for (const forbidden of ['/admin', '/business/', '/auth/', '/hesap', '/davet/']) {
    expect(body, `sitemap içinde private yol: ${forbidden}`).not.toContain(forbidden);
  }
});

test('private sayfalar noindex döner', async ({ page }) => {
  for (const path of ['/auth/giris', '/auth/kayit']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
});

test('rezerve slug şehir sayfası olarak çözülmez (D-006)', async ({ request }) => {
  for (const slug of ['/admin', '/business', '/auth', '/hesap']) {
    const response = await request.get(slug, { maxRedirects: 0 });
    // Yönlendirme (giriş) veya 404 kabul edilir; 200 içerik sayfası OLMAMALI.
    expect([200, 307, 308, 404]).toContain(response.status());
    if (response.status() === 200) {
      const html = await response.text();
      expect(html).not.toContain('Arkadaş Grubuna Uygun Mekân Paketleri');
    }
  }
});

test('breadcrumb derin sayfalarda bulunur', async ({ page }) => {
  await page.goto('/hakkari/merkez');
  await expect(page.getByRole('navigation', { name: 'Neredesiniz' })).toBeVisible();
});

test('dahili linkler kırık değil', async ({ page, request }) => {
  await page.goto('/hakkari');

  const hrefs = await page.locator('main a[href^="/"]').evaluateAll((anchors) =>
    Array.from(new Set(anchors.map((a) => a.getAttribute('href') ?? ''))).filter(Boolean),
  );

  expect(hrefs.length).toBeGreaterThan(5);

  for (const href of hrefs.slice(0, 25)) {
    const response = await request.get(href, { maxRedirects: 3 });
    expect([200, 307, 308], `kırık link: ${href} (${response.status()})`).toContain(
      response.status(),
    );
  }
});
