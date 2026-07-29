import { expect, test, type Page } from '@playwright/test';

/**
 * Kabul akışı — 10 adım (docs/TEST_STRATEGY.md §4).
 *
 * 1 kayıt → 2 plan → 3 davet → 4 misafir katılımı → 5 paketler → 6 oy
 * → 7 oylamayı bitir → 8 rezervasyon → 9 işletme onayı → 10 kullanıcı görür
 */

const UNIQUE = Date.now();
const USER = {
  name: 'E2E Kullanıcı',
  email: `e2e-${UNIQUE}@ornek.test`,
  password: 'E2eTest1234',
};

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth/giris');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await page.waitForURL(/\/hesap|\/business/, { timeout: 20_000 }).catch(() => undefined);
}

/**
 * Sihirbazda bir sonraki adıma geçer.
 *
 * "Devam et" istemci tarafı bir durum değişimidir; hydration tamamlanmadan
 * yapılan tıklama sessizce kaybolur. `toPass` ile tıklama, adım gerçekten
 * değişene kadar tekrarlanır — testin zamanlamaya bağlı kırılganlığı önlenir.
 */
async function goToStep(page: Page, expectedStep: number) {
  await expect(async () => {
    await page.getByRole('button', { name: 'Devam et →' }).click();
    await expect(page.getByText(`Adım ${expectedStep} / 7`)).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20_000 });
}

test.describe.configure({ mode: 'serial' });

test('uçtan uca: kayıt → plan → davet → misafir oyu → rezervasyon → işletme onayı', async ({
  browser,
}) => {
  // 10 adımlık kabul akışı: 3 ayrı tarayıcı bağlamı ve birden fazla oturum açma
  // içerir; varsayılan 60 sn bu senaryo için yetersizdir.
  test.setTimeout(180_000);

  const ownerContext = await browser.newContext();
  const page = await ownerContext.newPage();

  // --- 1. Kullanıcı kayıt olur ---------------------------------------------
  await page.goto('/auth/kayit');
  await page.locator('input[name="displayName"]').fill(USER.name);
  await page.locator('input[name="email"]').fill(USER.email);
  // Zorunlu alan yıldızı erişilebilir ada karıştığı için alan adıyla hedeflenir.
  await page.locator('input[name="password"]').fill(USER.password);
  await page.locator('input[name="passwordConfirm"]').fill(USER.password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Hesap oluştur' }).click();

  await expect(page).toHaveURL(/\/hesap/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Merhaba');

  // --- 2. Plan oluşturur (7 adımlı sihirbaz) --------------------------------
  await page.goto('/hesap/plan/yeni');
  await expect(page.getByText('Adım 1 / 7')).toBeVisible();
  // Sihirbaz taslağı hydration sonrası localStorage'a yazar: hazır olma işareti.
  await page.waitForFunction(() => window.localStorage.getItem('hg-plan-taslak') !== null);

  await page.getByRole('button', { name: 'Hafta sonu' }).click();
  await goToStep(page, 2);

  await goToStep(page, 3);
  await page.getByRole('button', { name: '5–8 kişi' }).click();

  await goToStep(page, 4);
  await page.locator('input[name="budgetAmountInput"]').fill('350');

  await goToStep(page, 5);
  // Footer'da aynı adlı kategori bağlantısı var; seçim sihirbaz formuna sınırlanır.
  await page.locator('form').getByText('Kafe & Restoran').click();

  await goToStep(page, 6);
  await goToStep(page, 7);
  await page.locator('input[name="nameInput"]').fill('E2E Test Buluşması');
  await page.getByRole('button', { name: 'Planı oluştur' }).click();

  // `yeni` hariç tutulur: sihirbaz gönderilemezse URL değişmez ve test sessizce
  // yanlış sayfada devam ederdi.
  await expect(page).toHaveURL(/\/hesap\/plan\/(?!yeni$)[^/]+$/, { timeout: 20_000 });
  const planId = new URL(page.url()).pathname.split('/').filter(Boolean).pop()!;
  await expect(page.getByRole('heading', { level: 1 })).toContainText('E2E Test Buluşması');

  // --- 3. Davet bağlantısını alır -------------------------------------------
  await page.goto(`/hesap/plan/${planId}/davet`);
  await expect(page.getByRole('heading', { level: 1 }), `davet sayfası açılmalı (planId=${planId})`)
    .toContainText('Arkadaşlarını davet et');
  await page
    .getByRole('button', { name: /Davet bağlantısı oluştur|Yeni bağlantı oluştur/ })
    .click();

  const inviteLocator = page.locator('text=/\\/davet\\//').first();
  await expect(inviteLocator).toBeVisible({ timeout: 20_000 });
  const inviteUrl = (await inviteLocator.textContent())?.trim() ?? '';
  expect(inviteUrl).toContain('/davet/');
  const invitePath = new URL(inviteUrl).pathname;

  // --- 4. Misafir web üzerinden katılır (ayrı tarayıcı bağlamı) --------------
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();

  await guestPage.goto(invitePath);
  await expect(guestPage.getByRole('heading', { level: 1 })).toContainText('E2E Test Buluşması');

  // Davet sayfası indekslenmemeli
  await expect(guestPage.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

  await guestPage.locator('input[name="displayName"]').fill('E2E Misafir');
  await guestPage.getByText('Katılıyorum').click();
  await guestPage.getByRole('button', { name: 'Plana katıl' }).click();
  await expect(guestPage.getByText('Katılım durumun kaydedildi.')).toBeVisible({
    timeout: 20_000,
  });

  // --- 5. Paketler görüntülenir --------------------------------------------
  await expect(
    guestPage.getByRole('heading', { name: /Uygun paketler|Paketleri oyla/ }),
  ).toBeVisible();

  /*
    NOT: Sunucu aksiyonlarının başarı mesajları burada beklenmez.
    `revalidatePath` sonrası sayfa yeni duruma göre yeniden render edilir ve
    mesajı taşıyan form ağaçtan kalkar. Bu yüzden her adımda mesaj yerine
    GÖZLEMLENEBİLİR SONUÇ doğrulanır — bu aynı zamanda daha güçlü bir iddiadır.
  */

  // --- 6. Oylama başlatılır ve oy kullanılır --------------------------------
  await page.goto(`/hesap/plan/${planId}`);
  await page.getByRole('button', { name: 'Oylamayı başlat' }).click();
  // Oylama başlayınca kart "Oylamayı başlat"tan "Herkes oy verdi mi?"ye döner.
  await expect(page.getByText('Herkes oy verdi mi?')).toBeVisible({ timeout: 20_000 });

  await guestPage.reload();
  await expect(guestPage.getByRole('heading', { name: 'Paketleri oyla' })).toBeVisible();
  // Sayfada katılım formu da var; oy butonları `aria-pressed` ile ayrışır.
  await guestPage.locator('form button[aria-pressed]').first().click();
  await expect(guestPage.getByText('✓ Senin oyun')).toBeVisible({ timeout: 20_000 });

  await page.reload();
  await page.locator('#paketler form button[aria-pressed]').first().click();
  await expect(page.getByText('✓ Senin oyun')).toBeVisible({ timeout: 20_000 });

  // --- 7. Plan sahibi oylamayı bitirir --------------------------------------
  await page.getByRole('button', { name: 'Oylamayı bitir' }).click();
  // Oylama kapanınca kazanan paket için rezervasyon çağrısı belirir.
  await expect(page.getByText('Kazanan paket belli').first()).toBeVisible({ timeout: 20_000 });

  // --- 8. Rezervasyon talebi gönderilir -------------------------------------
  await page.goto(`/hesap/plan/${planId}/rezervasyon`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rezervasyon talebi');

  await page.locator('input[name="contactPhone"]').fill('05551112233');
  await page.getByRole('button', { name: 'Rezervasyon talebini gönder' }).click();
  // Talep oluşunca sayfa "zaten rezervasyon var" durumuna geçer.
  await expect(page.getByText('Bu plan için zaten bir rezervasyon var')).toBeVisible({
    timeout: 20_000,
  });

  // Rezervasyon kodu, işletme panelinde DOĞRU kaydı bulmak için gerekir:
  // seed'de başka bekleyen talepler de vardır, yanlışlıkla onaylanmamalıdır.
  // Kod, onaydan önce yalnızca listede görünür (detay sayfası kodu büyük puntoyla
  // ancak rezervasyon onaylandıktan sonra gösterir).
  await page.goto('/hesap/rezervasyonlar?sekme=bekleyen');
  const codeText = (await page.getByText(/HG-[0-9A-Z]{6}/).first().textContent()) ?? '';
  const reservationCode = codeText.match(/HG-[0-9A-Z]{6}/)?.[0] ?? '';
  expect(reservationCode, 'bekleyen rezervasyon kodu okunabilmeli').toMatch(/^HG-[0-9A-Z]{6}$/);

  // --- 9. İşletme onaylar ----------------------------------------------------
  const businessContext = await browser.newContext();
  const businessPage = await businessContext.newPage();

  let approved = false;
  for (let index = 1; index <= 10 && !approved; index += 1) {
    const email = `isletme${String(index).padStart(2, '0')}@ornek.test`;
    await signIn(businessPage, email, 'Isletme1234');
    await businessPage.goto('/business/rezervasyonlar?sekme=bekleyen');

    const card = businessPage.locator('[class*="card"]').filter({ hasText: reservationCode });
    if ((await card.count()) === 0) continue;

    await card.getByRole('button', { name: 'Onayla' }).first().click();
    // Onaylanan kayıt "bekleyen" sekmesinden çıkar.
    await expect(card).toHaveCount(0, { timeout: 20_000 });
    approved = true;
  }

  expect(approved, 'işletme panelinden rezervasyon onaylanabilmeli').toBe(true);

  // --- 10. Kullanıcı rezervasyon durumunu görür ------------------------------
  await page.goto('/hesap/rezervasyonlar?sekme=onaylanan');
  await expect(page.getByText('Onaylandı').first()).toBeVisible({ timeout: 20_000 });

  await page.getByRole('link', { name: /Detayı gör/ }).first().click();
  await expect(page.getByText('Rezervasyon kodun', { exact: true })).toBeVisible();
  // Onaylanan kayıt, 8. adımda okunan kodun ta kendisi olmalıdır.
  await expect(page.getByText(reservationCode).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Durum geçmişi' })).toBeVisible();

  await ownerContext.close();
  await guestContext.close();
  await businessContext.close();
});
