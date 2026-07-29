# Uygulama Planı — HazırGrup

Görevler bağımlılık ve önem sırasına göre dizilmiştir. Her faz sonunda
`npm run lint && npm run typecheck && npm test` çalıştırılır; hepsi geçmeden sonraki faza
geçilmez. İlerleme `docs/PROGRESS.md` içinde tutulur.

Durum işaretleri: `[ ]` yapılacak · `[~]` devam ediyor · `[x]` tamam

---

## Faz 0 — Analiz ve Temel

- [x] 0.1 Mevcut repository incelemesi (boş dizin tespit edildi)
- [x] 0.2 Planlama dokümanlarının yazılması
- [x] 0.3 Kök `package.json`, npm workspaces yapılandırması
- [x] 0.4 `tsconfig.base.json`, strict mode, path alias'ları
- [x] 0.5 ESLint 9 flat config + Prettier
- [x] 0.6 Vitest workspace yapılandırması
- [x] 0.7 `.gitignore`, `.env.example`, `.editorconfig`
- [x] 0.8 `git init` + ilk commit
- [x] 0.9 `npm run verify` bileşik komutu

---

## Faz 1 — Ortak Paketler ve Domain Mantığı

### 1.1 `packages/types`
- [x] Enum ve birleşim tipleri (plan/rezervasyon durumları, roller, fiyat modeli)
- [x] Domain varlık tipleri (City, District, Category, Business, Branch, Package, Plan, …)
- [x] Public projeksiyon tipleri (`PublicBusiness`, `PublicPackage` — kişisel alan içermez)
- [x] Repository arayüz tipleri

### 1.2 `packages/ui`
- [x] Renk tokenları (açık/koyu, semantik katman)
- [x] Tipografi, spacing, radius, elevation, motion tokenları
- [x] Buton/badge/input varyant tanımları
- [x] Kontrast testi (`contrast.test.ts`)

### 1.3 `packages/core`
- [x] `text/slug.ts` — Türkçe karakter dönüşümü + testler
- [x] `format/` — para, tarih, saat, sayı biçimlendirme + testler
- [x] `errors/AppError.ts` — standart hata tipi
- [x] `budget/` — kişi başı ↔ toplam, katılımcı hesabı + testler
- [x] `matching/` — eşleştirme motoru, skor, gerekçeler, sıralama + testler
- [x] `status/plan.ts` — plan durum makinesi + sıradaki adım + testler
- [x] `status/reservation.ts` — rezervasyon durum makinesi + testler
- [x] `invite/token.ts` — token/kısa kod üretimi ve doğrulama + testler
- [x] `rate-limit/` — pencere tabanlı sayaç + testler
- [x] `seo/metadata.ts`, `seo/indexability.ts`, `seo/structured-data.ts` + testler
- [x] `seed/dataset.ts` — 10 işletme, 15+ şube, 30+ paket, kullanıcılar, planlar
- [x] `data/repository.ts` — arayüz
- [x] `data/demo/DemoRepository.ts` — bellek içi uygulama
- [x] `data/supabase/SupabaseRepository.ts` — Supabase uygulaması
- [x] `data/createRepository.ts` — fabrika + mod tespiti
- [x] `services/` — plan, davet, oy, rezervasyon, işletme servisleri

### 1.4 `packages/validation`
- [x] Auth şemaları (kayıt, giriş, şifre sıfırlama)
- [x] Plan sihirbazı şemaları (adım bazlı + tam)
- [x] Paket/şube/işletme şemaları
- [x] Rezervasyon, oy, katılım şemaları
- [x] Admin/SEO şemaları
- [x] Türkçe hata mesajları + testler

**Kapı:** `npm run lint && npm run typecheck && npm test`

---

## Faz 2 — Veritabanı

- [x] 2.1 `0001_extensions.sql` — uzantılar, yardımcı fonksiyonlar
- [x] 2.2 `0002_enums.sql` — enum tipleri
- [x] 2.3 `0003_identity.sql` — profiles, roles, user_roles, trigger
- [x] 2.4 `0004_location.sql` — countries, cities, districts, categories, preferences
- [x] 2.5 `0005_business.sql` — businesses, branches, hours, members, applications
- [x] 2.6 `0006_packages.sql` — packages, items, images, availability, preferences
- [x] 2.7 `0007_plans.sql` — plans, categories, preferences, participants, invitations, matches
- [x] 2.8 `0008_voting.sql` — votes + unique constraint
- [x] 2.9 `0009_reservations.sql` — reservations + status history + trigger
- [x] 2.10 `0010_support.sql` — favorites, notifications, prefs, push, reports, tickets, logs, redirects, help, rate_limits
- [x] 2.11 `0011_revenue_schema.sql` — gelir modeli tabloları (pasif)
- [x] 2.12 `0012_indexes.sql` — tüm performans indeksleri
- [x] 2.13 `0013_rls.sql` — yardımcı fonksiyonlar + tüm RLS politikaları
- [x] 2.14 `scripts/generate-seed-sql.ts` + `supabase/seed/seed.sql`
- [x] 2.15 `supabase/tests/rls.sql` — politika testleri
- [x] 2.16 `supabase/config.toml`

---

## Faz 3 — Web Temeli, Auth, Tasarım Katmanı

- [x] 3.1 Next.js uygulama iskeleti, App Router, `next.config.ts`
- [x] 3.2 `scripts/generate-css-vars.ts` → `tokens.css`, global stiller
- [x] 3.3 Ortak UI bileşenleri (Button, Input, Card, Badge, EmptyState, Skeleton, Toast, Modal, StatusBadge, Breadcrumb)
- [x] 3.4 Layout: header, footer, navigasyon, tema geçişi
- [x] 3.5 Auth adaptörü (Supabase + demo), oturum cookie'si
- [x] 3.6 `/auth/giris`, `/auth/kayit`, `/auth/sifremi-unuttum`, `/auth/sifre-sifirla`
- [x] 3.7 Middleware route koruması + güvenlik başlıkları
- [x] 3.8 `requireUser` / `requireRole` / `requireBusinessMember` yardımcıları
- [x] 3.9 Hata ve `not-found` sayfaları, `error.tsx`, `loading.tsx`

---

## Faz 4 — Public SEO Sayfaları

- [x] 4.1 `/` landing
- [x] 4.2 `/nasil-calisir`
- [x] 4.3 `/sehirler`
- [x] 4.4 `/[city]` şehir landing (kategoriler, ilçeler, paketler, SSS, JSON-LD)
- [x] 4.5 `/[city]/[district]` ilçe landing
- [x] 4.6 `/kategoriler`, `/kategoriler/[slug]`
- [x] 4.7 `/mekanlar/[slug]` public işletme (LocalBusiness JSON-LD)
- [x] 4.8 `/paketler/[slug]` public paket (Offer JSON-LD, pasif/404/410 davranışı)
- [x] 4.9 `/rehber`, `/rehber/[slug]` kullanım senaryosu sayfaları
- [x] 4.10 `/sss`, `/yardim/[slug]` (FAQPage JSON-LD)
- [x] 4.11 `/legal/[slug]` KVKK, gizlilik, kullanım koşulları
- [x] 4.12 Breadcrumb + dahili linkleme
- [x] 4.13 `RESERVED_SLUGS` koruması ve 404 davranışı

---

## Faz 5 — Davet, Misafir Katılımı, Oylama

- [x] 5.1 Davet tokenı üretimi ve yönetimi (oluştur, yenile, iptal)
- [x] 5.2 WhatsApp paylaşım bağlantısı + kopyalama
- [x] 5.3 `/davet/[token]` misafir akışı (özet → ad → katılım)
- [x] 5.4 Misafir cookie kimliği + rate limiting
- [x] 5.5 Davet sayfası paket listesi ve oy verme
- [x] 5.6 Oy değiştirme, canlı sayaç (realtime + polling fallback)
- [x] 5.7 Oylama sonucu ekranı, eşitlik yönetimi
- [x] 5.8 `noindex` + gizlilik korumalı OG kartı

---

## Faz 6 — Hesap Alanı: Plan Sihirbazı ve Rezervasyon

- [x] 6.1 `/hesap` panel özeti (devam eden plan, davetler, yaklaşan rezervasyon)
- [x] 6.2 `/hesap/plan/yeni` 7 adımlı sihirbaz + taslak kaydı
- [x] 6.3 `/hesap/planlar` (Aktif · Yaklaşan · Geçmiş · Taslaklar)
- [x] 6.4 `/hesap/plan/[id]` plan detayı (durum, katılımcılar, paketler, oylama, rezervasyon)
- [x] 6.5 Paket listesi, sıralama, karşılaştırma
- [x] 6.6 Rezervasyon talebi oluşturma
- [x] 6.7 `/hesap/rezervasyonlar` + detay + zaman çizelgesi + iptal
- [x] 6.8 `/hesap/bildirimler` bildirim merkezi
- [x] 6.9 `/hesap/ayarlar` profil, tercihler, tema, bildirim, hesap silme
- [x] 6.10 `/hesap/favoriler`

---

## Faz 7 — İşletme ve Yönetici Panelleri

- [x] 7.1 `/business/basvuru` işletme başvuru formu
- [x] 7.2 `/business` genel bakış + istatistikler
- [x] 7.3 `/business/isletme` bilgiler, `/business/subeler` şube + çalışma saatleri
- [x] 7.4 `/business/paketler` paket CRUD + şablondan oluşturma + uygunluk
- [x] 7.5 `/business/rezervasyonlar` talepler, onay/ret + gerekçe, geçmiş
- [x] 7.6 `/business/calisanlar` çalışan yetkilendirme
- [x] 7.7 `/admin` sistem özeti
- [x] 7.8 `/admin/basvurular` inceleme/onay/ret
- [x] 7.9 `/admin/sehirler`, `/admin/ilceler`, `/admin/kategoriler` (+SEO alanları)
- [x] 7.10 `/admin/isletmeler`, `/admin/paketler` denetim
- [x] 7.11 `/admin/kullanicilar` askıya alma
- [x] 7.12 `/admin/sikayetler`, `/admin/destek`
- [x] 7.13 `/admin/audit` log görüntüleme
- [x] 7.14 Tüm panellerde yetki kontrolü (middleware + server + RLS)

---

## Faz 8 — Mobil Uygulama

- [x] 8.1 Expo projesi, Expo Router, tema sağlayıcısı, tokenlar
- [x] 8.2 Ortak mobil bileşenler (Button, Input, Card, Badge, EmptyState, Skeleton, Toast)
- [x] 8.3 Auth ekranları + SecureStore oturum
- [x] 8.4 Onboarding (şehir/ilçe/ilgi alanı)
- [x] 8.5 Tab navigasyonu + Ana sayfa
- [x] 8.6 Plan sihirbazı (7 adım, taslak, canlı bütçe hesabı)
- [x] 8.7 Planlarım + Plan detayı
- [x] 8.8 Davet ekranı + WhatsApp paylaşımı
- [x] 8.9 Paketler, karşılaştırma, paket detayı
- [x] 8.10 Oylama + sonuç
- [x] 8.11 Rezervasyon talebi + rezervasyon listesi/detayı
- [x] 8.12 Bildirim merkezi + push adaptörü
- [x] 8.13 Profil, ayarlar, yardım, hukuki metinler, hesap silme
- [x] 8.14 Loading/empty/error halleri, ekran durum fonksiyonları + testleri

---

## Faz 9 — SEO Tamamlama ve Kalite

- [x] 9.1 `sitemap.ts` dinamik üretim
- [x] 9.2 `robots.ts` + staging koruması
- [x] 9.3 JSON-LD tüm ilgili sayfalarda
- [x] 9.4 Dinamik OG görselleri + fallback
- [x] 9.5 `seo_redirects` middleware uygulaması
- [x] 9.6 Erişilebilirlik geçişi (focus, kontrast, etiket, aria)
- [x] 9.7 Performans geçişi (görsel, client JS, skeleton)
- [x] 9.8 SEO testleri (`tests/seo/`)
- [x] 9.9 Güvenlik testleri (`tests/security/`)
- [x] 9.10 Playwright E2E akışları

---

## Faz 10 — Dokümantasyon ve Release Hazırlığı

- [x] 10.1 `README.md`
- [x] 10.2 `docs/SETUP.md` — kurulum, Supabase local/cloud
- [x] 10.3 `docs/BUILD_ANDROID.md`
- [x] 10.4 `docs/DEPLOY_WEB.md`
- [x] 10.5 `docs/MOBILE_QA_CHECKLIST.md`
- [x] 10.6 `docs/KNOWN_LIMITATIONS.md`
- [x] 10.7 `docs/FUTURE_ROADMAP.md`
- [x] 10.8 `docs/RELEASE_CHECKLIST.md` + kabul kriterleri doğrulaması
- [x] 10.9 `docs/SCREENSHOTS.md` — ekran görüntüsü listesi
- [x] 10.10 Demo kullanıcıları ve giriş bilgileri dokümantasyonu
