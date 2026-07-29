# Test Stratejisi — HazırGrup

## 1. Araçlar

| Katman | Araç | Konum |
| --- | --- | --- |
| Unit | Vitest | `packages/*/src/**/__tests__/` |
| Integration | Vitest + `DemoRepository` | `tests/integration/` |
| SEO | Vitest | `tests/seo/` |
| Güvenlik / RLS | Vitest (mantık) + SQL (Supabase) | `tests/security/`, `supabase/tests/` |
| E2E (web) | Playwright | `e2e/` |
| Mobil | Vitest (domain + hook) + manuel akış listesi | `apps/mobile/src/**/__tests__/` |

**Neden entegrasyon testleri `DemoRepository` üzerinde:** Domain servisleri repository
arayüzüne karşı yazıldığı için, aynı servis kodu Supabase ve demo kaynağıyla çalışır.
Böylece CI'da veritabanı sunucusu olmadan gerçek akış (plan → davet → oy → rezervasyon)
uçtan uca doğrulanır. RLS politikaları ayrıca SQL testleriyle Supabase local üzerinde
doğrulanır (`npm run test:rls`, Supabase CLI gerektirir).

---

## 2. Unit Testler

### `packages/core`

| Modül | Test edilen |
| --- | --- |
| `budget` | Kişi başı ↔ toplam dönüşümü, yuvarlama, sıfır/negatif koruma, kişi sayısı değişince yeniden hesap |
| `matching` | Eşleştirme kriterleri, skor sıralaması, gerekçe etiketleri, kapasite/saat/bütçe dışı elemeler, esnek saat toleransı |
| `plan-status` | İzinli/yasak durum geçişleri, sıradaki adım hesabı |
| `reservation-status` | İzinli/yasak geçişler, terminal durumlar |
| `text/slug` | Türkçe karakter dönüşümü, çoklu tire, baş/son tire, boş girdi, benzersizleştirme |
| `seo/metadata` | Başlık/açıklama şablonları, uzunluk kısaltma, canonical üretimi |
| `seo/indexability` | İçerik eşiği, `is_indexable` etkileşimi |
| `seo/structured-data` | JSON-LD şekli, sahte rating üretmeme |
| `format` | Para, tarih, saat, kişi sayısı biçimlendirme |
| `invite/token` | Token üretimi, hash, kısa kod alfabesi, doğrulama |
| `rate-limit` | Pencere sınırı, sıfırlama |

### `packages/validation`

Her Zod şeması için geçerli/geçersiz örnekler; hata mesajlarının Türkçe olması.

### `packages/ui`

Kontrast oranı testi (tüm semantik metin/zemin çiftleri, açık + koyu tema).

---

## 3. Integration Testler

`tests/integration/` — gerçek servis + `DemoRepository`:

| Test | Kapsam |
| --- | --- |
| `auth.test.ts` | Kayıt, giriş, hatalı şifre, şifre sıfırlama, oturum |
| `plan-create.test.ts` | Sihirbaz verisi → plan, taslak kaydı, durum `awaiting_participants` |
| `invitation.test.ts` | Token üretimi, doğrulama, iptal, süresi geçmiş token, yenileme |
| `guest-join.test.ts` | Misafir katılımı, aynı cookie ile tekrar giriş, katılım durumu değişimi |
| `voting.test.ts` | Oy verme, oy değiştirme, duplicate engeli, erken bitirme, eşitlik |
| `reservation.test.ts` | Talep oluşturma, işletme onayı, ret + gerekçe, iptal, durum geçmişi |
| `business-approval.test.ts` | Başvuru → yönetici onayı → işletme + rol oluşumu |
| `matching.test.ts` | Seed verisi üzerinde gerçek eşleştirme sonuçları |
| `permissions.test.ts` | Rol bazlı erişim (kullanıcı/işletme/admin/misafir matrisi) |

---

## 4. E2E Akışı (Playwright)

`e2e/full-flow.spec.ts` — tek senaryo, 10 adım:

1. Kullanıcı kayıt olur.
2. Plan oluşturur (7 adımlı sihirbaz).
3. Davet bağlantısını alır.
4. **Yeni tarayıcı bağlamında** misafir olarak katılır.
5. Paketleri görür.
6. Misafir oy kullanır; oyunu değiştirir.
7. Plan sahibi oylamayı bitirir.
8. Rezervasyon talebi gönderir.
9. İşletme hesabıyla giriş yapılıp talep onaylanır.
10. Kullanıcı rezervasyon durumunu ve zaman çizelgesini görür.

Ek E2E dosyaları: `e2e/public-seo.spec.ts` (public sayfaların yüklenmesi, breadcrumb,
canonical), `e2e/auth-guard.spec.ts` (korumalı route'lara yetkisiz erişim).

E2E, demo modda (`HG_DATA_SOURCE=demo`) çalışır → deterministik seed, harici bağımlılık yok.

---

## 5. SEO Testleri

`tests/seo/` — bkz. `docs/SEO_STRATEGY.md` §15.

Ek olarak `e2e/public-seo.spec.ts` gerçek HTML çıktısı üzerinde:
`<title>`, `<meta name="description">`, `<link rel="canonical">`, `robots` meta,
JSON-LD script varlığı ve geçerliliği, `h1` tekilliği.

---

## 6. Güvenlik Testleri

`tests/security/`:

- Yetkisiz kullanıcı `/admin` ve `/business` erişimi reddedilir.
- İşletme A → işletme B verisi okuyamaz/yazamaz.
- Katılımcı olmayan kullanıcı plan detayını okuyamaz.
- Duplicate oy reddedilir.
- Geçersiz/iptal/süresi geçmiş davet tokenı reddedilir.
- Rate limit aşımında `rate_limited` hatası döner.
- Public projeksiyon çıktısında kişisel alan yok (beyaz liste testi).
- Davet OG kartında bütçe/isim/telefon yok.
- Geçersiz durum geçişleri reddedilir.

`supabase/tests/rls.sql` — Supabase local üzerinde politika testleri
(`npm run test:rls`; Supabase CLI kuruluysa çalışır, değilse atlanır ve uyarı verir).

---

## 7. Lighthouse

```bash
npm run build
npm start                       # http://localhost:3000
npx lighthouse http://localhost:3000/hakkari \
  --preset=desktop --output=html --output-path=./lighthouse-hakkari.html
npx lighthouse http://localhost:3000/paketler/<slug> \
  --form-factor=mobile --throttling-method=simulate \
  --output=html --output-path=./lighthouse-paket.html
```

Hedefler: Performance ≥ 90 (desktop) / ≥ 75 (mobile 4G), Accessibility ≥ 95,
Best Practices ≥ 95, SEO = 100.

Sonuçlar `docs/PROGRESS.md` içinde faz sonlarında kaydedilir.

---

## 8. Mobil Test Yaklaşımı

React Native ekranları için tam render testi Expo + jsdom uyumsuzlukları nedeniyle
Faz 1'de kurulmaz (D-012). Bunun yerine:

1. **Domain ve hesaplama mantığı** `packages/core` içinde %100 test edilir — mobil ve web
   aynı kodu kullanır, bu yüzden ekranın gösterdiği sayı doğrudur.
2. **Ekran durum mantığı** (hangi hal gösterilecek, hangi buton aktif) saf fonksiyonlara
   çıkarılır ve test edilir: `apps/mobile/src/screens/**/state.ts`.
3. **TypeScript strict** + ESLint tüm ekranları kapsar.
4. **Manuel doğrulama listesi** `docs/MOBILE_QA_CHECKLIST.md` içinde adım adım verilir.

---

## 9. Komutlar

| Komut | Kapsam |
| --- | --- |
| `npm test` | Tüm Vitest testleri (unit + integration + seo + security) |
| `npm run test:watch` | İzleme modu |
| `npm run test:coverage` | Kapsam raporu |
| `npm run test:e2e` | Playwright |
| `npm run test:rls` | Supabase RLS SQL testleri (CLI gerekli) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | lint + typecheck + test |

---

## 10. Kapsam Hedefleri

| Alan | Hedef |
| --- | --- |
| `packages/core` | ≥ 90 % satır |
| `packages/validation` | ≥ 85 % |
| Integration akışları | 9 senaryonun tamamı geçer |
| E2E | Kabul akışı uçtan uca geçer |

Kapsam bir kalite göstergesidir, hedef değildir; kritik domain mantığında boşluk
bırakılmaması esastır.

---

## 11. Faz Kapısı

Her fazın sonunda sırasıyla çalıştırılır ve **hepsi geçmeden** sonraki faza geçilmez:

```
npm run lint && npm run typecheck && npm test
```

Sonuç `docs/PROGRESS.md` içine yazılır.
