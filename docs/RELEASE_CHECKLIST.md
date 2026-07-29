# Release Kontrol Listesi — HazırGrup

**Son doğrulama:** Faz 10 sonu.
`lint` ✅ · `typecheck` ✅ · `npm test` 479/479 ✅ · `npm run test:e2e` 44/44 ✅ · `build` ✅

**İşaretleme kuralı:** ✅ yalnızca **gerçekten çalıştırılıp doğrulanmış** maddeler
içindir. Çalıştırılamayan maddeler ⏸ ile işaretlenir ve nedeni yazılır — burada
"muhtemelen çalışıyor" diye işaretlenmiş hiçbir madde yoktur.

---

## A. Tamamlanma kriterleri (24 madde)

| # | Kriter | Durum | Doğrulama |
| -- | --- | :--: | --- |
| 1 | Kullanıcı kayıt/giriş yapabiliyor | ✅ | `e2e/full-flow.spec.ts` adım 1, `e2e/auth-guard.spec.ts` |
| 2 | Şehir ve ilçe seçebiliyor | ✅ | Sihirbaz adım 2 (E2E), `tests/integration/full-flow.test.ts` |
| 3 | Plan oluşturabiliyor ve taslak kaydedebiliyor | ✅ | E2E adım 2 (7 adım); taslak `localStorage` anahtarı testte doğrulanıyor |
| 4 | WhatsApp davet bağlantısı oluşturabiliyor | ✅ | E2E adım 3; paylaşım metni bütçe/isim sızdırmıyor (`packages/core` testi) |
| 5 | Misafir uygulama indirmeden plana katılabiliyor | ✅ | E2E adım 4 (ayrı tarayıcı bağlamı, oturumsuz) |
| 6 | Paketler otomatik eşleşiyor | ✅ | `packages/core/src/matching/__tests__` (38 test) + E2E adım 5 |
| 7 | Katılımcılar oy kullanabiliyor | ✅ | E2E adım 6 (hem misafir hem plan sahibi oy verdi) |
| 8 | Canlı sonuç görülebiliyor | ⚠️ | Demo modda **süreç içi** event emitter; Supabase modda Realtime, kurulamazsa 5 sn polling (L-13) |
| 9 | Plan sahibi kazanan paketi seçebiliyor | ✅ | Beraberlik senaryosu `packages/core/src/status/__tests__` |
| 10 | Rezervasyon talebi gönderilebiliyor | ✅ | E2E adım 8 |
| 11 | İşletme rezervasyonu onaylayabiliyor/reddedebiliyor | ✅ | E2E adım 9 (rezervasyon koduyla doğru kayıt hedeflenerek) |
| 12 | Kullanıcı rezervasyon durumunu görebiliyor | ✅ | E2E adım 10 (kod eşleşmesi ve durum geçmişi doğrulandı) |
| 13 | İşletme paketlerini yönetebiliyor | ✅ | `/business/paketler`; `tests/security/permissions.test.ts` |
| 14 | Admin işletme ve şehir yönetebiliyor | ✅ | `/admin/basvurular`, `/admin/sehirler`; yetki testleri |
| 15 | RLS yetkileri test edilmiş | ⚠️ | Uygulama katmanı: `tests/security/permissions.test.ts` (31 test) ✅ · SQL katmanı `supabase/tests/rls.sql` **Supabase CLI gerektirir**, bu ortamda çalıştırılmadı (L-14) |
| 16 | Public işletme ve paket sayfaları server-rendered | ✅ | `e2e/public-seo.spec.ts` — HTML kaynağında içerik doğrulanıyor |
| 17 | Metadata, sitemap, robots, structured data çalışıyor | ✅ | `tests/seo/seo-rules.test.ts` (24) + `e2e/public-seo.spec.ts` |
| 18 | Private sayfalar noindex | ✅ | `e2e/public-seo.spec.ts` — `/hesap`, `/business`, `/admin`, `/davet` |
| 19 | Android build hazırlığı tamam | ⚠️ | `app.json` + `eas.json` hazır, `docs/BUILD_ANDROID.md` yazıldı · **APK üretilmedi** (Expo hesabı / Android SDK gerektirir) |
| 20 | Kurulum dokümantasyonu mevcut | ✅ | `README.md`, `docs/SETUP.md` |
| 21 | Lint, typecheck ve testler geçiyor | ✅ | `npm run verify` — 0 hata, 0 uyarı |
| 22 | Kritik akışlarda boş/çalışmayan buton yok | ✅ | 10 adımlık kabul akışı uçtan uca geçti; TODO/FIXME sayısı 0 |
| 23 | Mobil loading/empty/error halleri tamam | ⚠️ | Ekran durumu mantığı 37 birim testiyle doğrulandı (`apps/mobile/src/screens/state.ts`) · **gerçek cihaz testi yapılmadı** (`docs/MOBILE_QA_CHECKLIST.md`) |
| 24 | Demo seed verisi çalışıyor | ✅ | Demo modda tüm akışlar çalışıyor; `npm run seed:sql` seed'i yeniden üretiyor |

**Özet:** 20 ✅ · 4 ⚠️ (hiçbiri ürün akışını engellemiyor; tümü harici hesap/cihaz gerektiren doğrulamalar).

---

## B. Yayın öncesi teknik kontroller

### Kod
- [x] `npm run verify` temiz
- [x] `any` kullanımı: **0** (`@typescript-eslint/no-explicit-any: error`)
- [x] `console.log` üretim kodunda: **0** (`no-console` kuralı; `warn`/`error` serbest)
- [x] TODO/FIXME yorumu: **0** — kapsam dışı kalanlar `KNOWN_LIMITATIONS.md` içinde
- [ ] Kullanılmayan bağımlılık taraması (`depcheck`) çalıştırılmadı

### Güvenlik
- [x] Tüm hassas tablolarda RLS açık (`0013_rls.sql`)
- [x] `.env` repoda yok, `.env.example` güncel ve tüm değişkenleri açıklıyor
- [x] Gerçek anahtar/kimlik bilgisi repoda **yok**
- [x] Güvenlik başlıkları aktif — `e2e/auth-guard.spec.ts` doğruluyor:
      CSP (`frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`,
      `form-action 'self'`), HSTS, nosniff, X-Frame-Options
- [x] Üretimde `'unsafe-eval'` **kapalı** (test ediliyor)
- [x] `script-src 'unsafe-inline'` gerekçesi belgelendi (D-031 / L-15)
- [x] Rate limit uçları çalışıyor (`packages/core/src/rate-limit`)
- [x] Davet tokenı veritabanında yalnızca SHA-256 özet olarak saklanıyor
- [x] Admin/business rotaları proxy + sunucu koruması + RLS ile korunuyor
- [x] Yetkisiz erişim ham hata değil `/yetkisiz` sayfası gösteriyor
- [ ] Hassas veri loglanmıyor — elle gözden geçirildi, otomatik tarama yok

### SEO
- [x] `/robots.txt` doğru üretiliyor, staging tamamen kapalı
- [x] `/sitemap.xml` yalnızca indekslenebilir URL içeriyor
- [x] Her public sayfada benzersiz title + description + canonical
- [x] Canonical query string içermiyor
- [x] JSON-LD geçerli, **sahte rating yok** (test ediyor)
- [x] Breadcrumb tüm derin sayfalarda
- [x] Kırık dahili link yok (`e2e/public-seo.spec.ts`)
- [x] Bilinmeyen sayfalar gerçekten **404** dönüyor (soft 404 regresyon testi)
- [ ] Lighthouse SEO = 100 — **çalıştırılmadı** (yayınlanmış URL gerektirir)

### Performans / erişilebilirlik
- [x] Public sayfalar statik/ISR olarak önceden render ediliyor (79 sayfa)
- [x] Kontrast testi geçiyor (57 test, WCAG AA)
- [x] Dokunma hedefleri ≥ 44 px (mobil E2E ölçüyor)
- [x] Mobil görünümde yatay taşma yok (E2E ölçüyor)
- [x] Focus stilleri tanımlı (`:focus-visible`)
- [x] Hareket azaltma tercihi destekleniyor
- [ ] Lighthouse Performance / Accessibility — **çalıştırılmadı**
- [ ] Klavye ile tam panel gezintisi — elle doğrulanmadı

### Veri
- [x] Migration'lar sırayla temiz uygulanıyor (0001…0013)
- [x] Migration'lar geri dönüşü düşünülerek yazıldı, yıkıcı `DROP` yok
- [x] Seed verisi çalışıyor ve **açıkça kurgusal**
- [x] Gerçek işletme adı / gerçek kişi verisi **yok**
- [x] Seed tek kaynaktan üretiliyor; demo ve SQL asla ayrışmıyor

### Mobil
- [x] `app.json` paket adı, sürüm, splash, tema tanımlı
- [x] `eas.json` üç profil hazır (`development`, `preview`, `production`)
- [x] Derin bağlantı yapılandırılmış (`hazirgrup://` + `/davet` intent filter)
- [x] Ekran durumu mantığı testli (37 test)
- [ ] `app.json` → `extra.eas.projectId` hâlâ **yer tutucu** — `eas init` ile değiştirilmeli
- [ ] `intentFilters` host'u `hazirgrup.app` — gerçek alan adıyla değiştirilmeli
- [ ] Android `minSdkVersion` — Expo SDK 57 varsayılanı kullanılıyor, açıkça sabitlenmedi
- [ ] Koyu tema gerçek cihazda test edilmedi
- [ ] Safe area ve klavye davranışı gerçek cihazda doğrulanmadı

### Dokümantasyon
- [x] `README.md` — tek komutla çalıştırma doğrulandı
- [x] `docs/SETUP.md` — demo + Supabase local + bulut
- [x] `docs/BUILD_ANDROID.md` — EAS ve hesapsız yerel derleme yolu
- [x] `docs/DEPLOY_WEB.md`
- [x] `docs/MOBILE_QA_CHECKLIST.md`
- [x] `docs/SCREENSHOTS.md`
- [x] `docs/DECISIONS.md` güncel (D-001…D-031)
- [x] `docs/PROGRESS.md` faz sonuçları ve bulunan hatalarla dolu
- [x] `docs/KNOWN_LIMITATIONS.md` güncel (L-01…L-15)
- [x] Demo kullanıcı bilgileri belgelenmiş

---

## C. Yapılmayanlar (bilinçli, kapsam gereği)

- [x] `git push` **yapılmadı**
- [x] Production deploy **yapılmadı**
- [x] Ücretli servis satın **alınmadı**
- [x] Gerçek kullanıcı verisi **kullanılmadı**
- [x] Gerçek gizli anahtar repoya **yazılmadı**
- [x] Mağaza hesabı açılmadı, uygulama gönderilmedi
- [x] Tehlikeli veri silme komutu çalıştırılmadı

---

## D. Yayın öncesi kalan işler

Bu depo teslim edilebilir durumdadır; aşağıdakiler **yayına çıkacak kişinin**
kendi hesapları ve altyapısıyla yapması gerekenlerdir:

1. `eas init` ile gerçek `projectId` üretmek
2. `app.json` ve `eas.json` içindeki `hazirgrup.app` alan adını değiştirmek
3. Supabase projesi açıp `supabase db push` ile şemayı yüklemek (seed'i **üretime yüklememek**)
4. `HG_SESSION_SECRET` için üretim değeri üretmek
5. `NEXT_PUBLIC_ENVIRONMENT=production` vermek (aksi hâlde site indekslenmez)
6. Lighthouse ve Google Rich Results Test'i yayınlanmış URL üzerinde çalıştırmak
7. `docs/MOBILE_QA_CHECKLIST.md` listesini en az iki gerçek cihazda tamamlamak
8. Keystore üretip **güvenli biçimde yedeklemek**
