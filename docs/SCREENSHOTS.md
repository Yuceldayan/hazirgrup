# Ekran görüntüleri

> **Durum:** Bu depoda ekran görüntüsü dosyası **bulunmamaktadır.** Görüntüler
> çalışan bir tarayıcı/cihaz oturumu gerektirir ve otomatik üretilmiş görseller
> gerçek ürünü yanlış temsil edebilir. Bunun yerine aşağıda **hangi ekranın
> nereden yakalanacağı** ve **nasıl üretileceği** tanımlanmıştır.
>
> Depoda sahte/yer tutucu görsel bırakılmamıştır (bkz. master prompt §1.3:
> "sahte ekran bırakma").

---

## 1. Nasıl üretilir

### 1.1 Web (elle)

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` — demo modda tüm ekranlar veri doludur.

Yakalama:
- **Masaüstü:** 1440×900, tarayıcı arayüzü olmadan (DevTools → Cmd/Ctrl+Shift+P → "Capture screenshot")
- **Mobil web:** DevTools cihaz emülasyonu → Pixel 7 (412×915)

### 1.2 Web (otomatik)

Playwright zaten tüm bu sayfaları geziyor. Görüntü üretmek için geçici bir
spec yazmak yeterlidir:

```ts
// e2e/screenshots.spec.ts (geçici — depoya eklenmez)
import { test } from '@playwright/test';

const PAGES = ['/', '/hakkari', '/kategoriler/kafe-restoran', '/sss'];

for (const path of PAGES) {
  test(`ss ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.screenshot({ path: `docs/screenshots${path === '/' ? '/anasayfa' : path}.png`, fullPage: true });
  });
}
```

```bash
npx playwright test e2e/screenshots.spec.ts --project=masaustu
```

> Oturum gerektiren ekranlar için `e2e/full-flow.spec.ts` içindeki giriş
> adımlarını yeniden kullanın.

### 1.3 Mobil

```bash
npm run dev:mobile
```

- **Android cihaz:** Güç + Ses kısma
- **Android emülatör:** yan menüdeki kamera simgesi
- **iOS simülatör:** Cmd+S

---

## 2. Yakalanacak ekranlar

### 2.1 Public site (oturum gerekmez)

| # | Ekran | Yol | Ne gösterilmeli |
| --- | --- | --- | --- |
| 1 | Ana sayfa | `/` | Tek belirgin ana işlem, değer önerisi |
| 2 | Şehir | `/hakkari` | Şehre özel paketler, ilçe bağlantıları |
| 3 | İlçe | `/hakkari/merkez` | Daraltılmış liste |
| 4 | Kategori | `/kategoriler/kafe-restoran` | Kategori paketleri |
| 5 | Mekân detayı | `/mekanlar/kuzey-isigi-kahve-evi` | Adres, çalışma saatleri, paketler |
| 6 | Paket detayı | `/paketler/<slug>` | Fiyat, kapsam, kişi aralığı |
| 7 | Rehber yazısı | `/rehber/hakkari-grup-paketleri` | İçerik + iç bağlantılar |
| 8 | SSS | `/sss` | FAQ (JSON-LD ile) |
| 9 | Nasıl çalışır | `/nasil-calisir` | Akışın 4 adımı |
| 10 | 404 | `/olmayan-sayfa` | Yol gösteren boş durum |

### 2.2 Kullanıcı akışı (`elif@ornek.test` / `Demo1234`)

| # | Ekran | Yol | Ne gösterilmeli |
| --- | --- | --- | --- |
| 11 | Giriş | `/auth/giris` | Demo hesap ipuçları |
| 12 | Hesap özeti | `/hesap` | Sıradaki eylem |
| 13 | Sihirbaz adım 1 | `/hesap/plan/yeni` | İlerleme göstergesi |
| 14 | Sihirbaz adım 4 | — | Bütçe iki yönlü hesap |
| 15 | Sihirbaz adım 7 | — | Plan özeti |
| 16 | Plan detayı | `/hesap/plan/<id>` | Katılımcılar, eşleşen paketler |
| 17 | Davet paneli | `/hesap/plan/<id>/davet` | Üretilen bağlantı + paylaş |
| 18 | Oylama | `/hesap/plan/<id>#paketler` | Oy sayıları, "✓ Senin oyun" |
| 19 | Rezervasyon formu | `/hesap/plan/<id>/rezervasyon` | Özet + iletişim |
| 20 | Rezervasyon detayı | `/hesap/rezervasyonlar/<id>` | Kod + durum geçmişi |

### 2.3 Misafir akışı (oturumsuz, mobil görünüm)

| # | Ekran | Yol | Ne gösterilmeli |
| --- | --- | --- | --- |
| 21 | Davet karşılama | `/davet/<token>` | Plan özeti, hesap istemiyor |
| 22 | Katılım formu | — | Ad + katılım durumu |
| 23 | Misafir oylama | — | Paket kartları ve oy |
| 24 | Geçersiz davet | `/davet/gecersiz` | Yol gösteren mesaj |

### 2.4 İşletme paneli (`isletme01@ornek.test` / `Isletme1234`)

| # | Ekran | Yol |
| --- | --- | --- |
| 25 | Panel özeti | `/business` |
| 26 | Paketler | `/business/paketler` |
| 27 | Bekleyen rezervasyonlar | `/business/rezervasyonlar?sekme=bekleyen` |
| 28 | Onay/ret akışı | — |
| 29 | Şubeler ve çalışma saatleri | `/business/subeler` |

### 2.5 Yönetici paneli (`admin@ornek.test` / `Admin1234`)

| # | Ekran | Yol |
| --- | --- | --- |
| 30 | Sistem özeti | `/admin` |
| 31 | Başvurular | `/admin/basvurular` |
| 32 | Kullanıcılar | `/admin/kullanicilar` |
| 33 | Denetim kaydı | `/admin/audit` |

### 2.6 Mobil uygulama

| # | Ekran | Rota |
| --- | --- | --- |
| 34 | Keşfet | `(tabs)/index` |
| 35 | Planlarım | `(tabs)/planlar` |
| 36 | Yeni plan sihirbazı | `(tabs)/yeni` |
| 37 | Plan detayı / oylama | `plan/[id]` |
| 38 | Rezervasyonlar | `(tabs)/rezervasyonlar` |
| 39 | Rezervasyon detayı | `rezervasyon/[id]` |
| 40 | Bildirimler | `bildirimler` |
| 41 | Profil | `(tabs)/profil` |

### 2.7 Tema ve erişilebilirlik kanıtı

| # | Ekran | Not |
| --- | --- | --- |
| 42 | Ana sayfa — koyu tema | Tema düğmesiyle |
| 43 | Ana sayfa — 320 px genişlik | Yatay taşma olmamalı |
| 44 | Herhangi bir form — hata durumu | Hata metni + odak halkası |

---

## 3. Yakalama kuralları

- **Demo veri kullanın.** Gerçek kullanıcı verisi görüntülenmemelidir.
- **Boş ekran yakalamayın.** Liste ekranlarında en az birkaç kayıt olsun;
  boş durumu gösterecekseniz bunu ayrıca ve etiketleyerek yapın.
- **Kişisel bilgi sızdırmayın.** Tarayıcı sekmeleri, yer imleri ve bildirimler
  kadraja girmesin.
- **Tutarlı ölçü kullanın:** masaüstü 1440×900, mobil 412×915.
- Dosyaları `docs/screenshots/` altına, tablodaki numaralandırmayla kaydedin
  (`01-anasayfa.png` gibi). Bu klasör depoda yoktur; oluşturmanız gerekir.

---

## 4. İlgili dokümanlar

- Ekranların içerik ve amaç tanımı: [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md)
- Akış adımları: [USER_FLOWS.md](USER_FLOWS.md)
- Görsel dil, renk ve tipografi: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- Mobil cihaz doğrulaması: [MOBILE_QA_CHECKLIST.md](MOBILE_QA_CHECKLIST.md)
