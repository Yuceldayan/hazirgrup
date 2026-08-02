# HazırGrup

> **Grubunu oluştur, paketini seç, birlikte karar ver.**

Arkadaş gruplarının "nereye gidelim?" sorusunu tek akışta çözen şehir bazlı platform.
Grup kurulur, kişi sayısı/bütçe/tarih girilir, uygun mekân paketleri listelenir,
arkadaşlar bağlantıyla davet edilip birlikte oy verir ve kazanan paket için
işletmeye rezervasyon talebi gönderilir.

---

## Tek komutla çalıştır

```bash
npm install
npm run dev
```

`http://localhost:3000` — **hiçbir ortam değişkeni ya da harici servis gerekmez.**

Supabase anahtarı tanımlı değilse uygulama otomatik olarak **demo moduna** düşer:
seed verisiyle dolu bellek içi bir veri kaynağı kullanılır ve plan → davet → oy →
rezervasyon akışının tamamı eksiksiz çalışır. Üstte bir "Demo modu" bandı gösterilir.

### Demo hesapları

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Kullanıcı | `elif@ornek.test` | `Demo1234` |
| İşletme | `isletme01@ornek.test` | `Isletme1234` |
| Yönetici | `admin@ornek.test` | `Admin1234` |

Bu hesaplar giriş ekranında da listelenir (yalnızca demo modda). Tümü kurgusaldır;
gerçek kişi verisi içermez.

### Mobil uygulama

```bash
npm run dev:mobile      # Expo geliştirme sunucusu
```

Expo Go ile QR kodu okutun. Mobil de aynı demo veri kaynağını kullanır.

---

## Ne içeriyor?

| Alan | Durum |
| --- | --- |
| Public SEO sitesi (Next.js) | Şehir, ilçe, kategori, mekân, paket, rehber, SSS sayfaları — statik/ISR |
| Misafir davet akışı | Hesap açmadan katılım ve oy (imzalı çerez kimliği) |
| Kullanıcı paneli | 7 adımlı plan sihirbazı, davet, oylama, rezervasyon takibi |
| İşletme paneli | Paket yönetimi, rezervasyon onay/ret, çalışma saatleri |
| Yönetici paneli | Başvuru inceleme, kullanıcı/işletme yönetimi, denetim kaydı |
| Mobil uygulama (Expo) | Giriş, plan sihirbazı, oylama, rezervasyon, bildirimler |
| Veritabanı | 13 migration + RLS politikaları + seed |
| Testler | 479 birim/entegrasyon (Vitest) + 44 E2E (Playwright) |

---

## Depo yapısı

```
apps/
  web/            Next.js 16 (App Router) — public site + tüm paneller
  mobile/         Expo SDK 57 + Expo Router
packages/
  types/          Paylaşılan domain tipleri
  core/           İş mantığı: eşleştirme, bütçe, durum makineleri, SEO, seed
  validation/     Zod şemaları (web + mobil ortak)
  ui/             Tasarım tokenları (tek kaynak; web'e CSS, mobile'a TS)
supabase/
  migrations/     0001…0013 — şema, indeksler, RLS
  seed/seed.sql   packages/core seed'inden ÜRETİLİR (elle düzenlemeyin)
  tests/rls.sql   RLS politika testleri
e2e/              Playwright senaryoları
tests/            Entegrasyon, SEO ve güvenlik testleri
scripts/          Kod üretimi (tokenlar, seed SQL) ve yardımcılar
docs/             Ürün, mimari, güvenlik, SEO, test ve karar dokümanları
```

---

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Web geliştirme sunucusu |
| `npm run dev:mobile` | Expo geliştirme sunucusu |
| `npm run build` | Web üretim derlemesi |
| `npm run start` | Üretim derlemesini çalıştırır |
| `npm run lint` | ESLint (tüm depo) |
| `npm run typecheck` | Tüm workspace'lerde `tsc --noEmit` |
| `npm test` | Vitest (birim + entegrasyon) |
| `npm run test:e2e` | Playwright (web sunucusunu kendi başlatır) |
| `npm run test:rls` | RLS SQL testleri (Supabase CLI gerektirir) |
| `npm run verify` | lint + typecheck + test |
| `npm run seed:sql` | `supabase/seed/seed.sql` dosyasını yeniden üretir |
| `npm run tokens:css` | `apps/web/src/styles/tokens.css` dosyasını yeniden üretir |

---

## Dokümantasyon

**Başlangıç**
- [SETUP.md](docs/SETUP.md) — kurulum, demo mod, Supabase (local ve bulut)
- [DEPLOY_WEB.md](docs/DEPLOY_WEB.md) — web dağıtımı ve ortam değişkenleri
- [BUILD_ANDROID.md](docs/BUILD_ANDROID.md) — Android APK/AAB üretimi
- [MOBILE_QA_CHECKLIST.md](docs/MOBILE_QA_CHECKLIST.md) — cihaz test listesi

**Ürün ve tasarım**
- [PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) · [USER_FLOWS.md](docs/USER_FLOWS.md) · [INFORMATION_ARCHITECTURE.md](docs/INFORMATION_ARCHITECTURE.md) · [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) · [SCREENSHOTS.md](docs/SCREENSHOTS.md)

**Teknik**
- [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) · [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) · [SECURITY_MODEL.md](docs/SECURITY_MODEL.md) · [SEO_STRATEGY.md](docs/SEO_STRATEGY.md) · [TEST_STRATEGY.md](docs/TEST_STRATEGY.md)

**Süreç**
- [DECISIONS.md](docs/DECISIONS.md) — gerekçeleriyle tüm teknik kararlar (D-001…D-031)
- [PROGRESS.md](docs/PROGRESS.md) — faz faz ne yapıldı
- [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) — bilinen sınırlar (L-01…L-15)
- [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) · [FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md)

---

## Mimari kısa özet

**Veri erişimi adaptör desenlidir.** `createRepository()` ya `DemoRepository`
(bellek içi, seed dolu) ya da `SupabaseRepository` döner; uygulama katmanı hangisi
olduğunu bilmez. Bu sayede depo klonlandığı anda hiçbir hesap açmadan çalışır ve
Supabase eklendiğinde tek satır uygulama kodu değişmez.

**Seed tek kaynaktan gelir.** `packages/core/src/seed/dataset.ts` hem demo
deposunu hem de `supabase/seed/seed.sql` dosyasını besler (`npm run seed:sql`).
İkisi asla birbirinden ayrışmaz.

**Tasarım tokenları tek kaynaktan gelir.** `packages/ui` içindeki tokenlardan web
için CSS değişkenleri üretilir (`npm run tokens:css`); mobil doğrudan TS olarak
kullanır. Renk kontrastları otomatik testle doğrulanır.

**Güvenlik çok katmanlıdır.** RLS politikaları asıl otorite; sunucu tarafında
`requireUser` / `requireRole` / `requireBusinessMember` ve rota koruması bunu
tekrarlar. Davet tokenları veritabanında yalnızca SHA-256 özet olarak saklanır.

Ayrıntılar: [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md),
[SECURITY_MODEL.md](docs/SECURITY_MODEL.md).

---

## Bilinmesi gerekenler

- **Bu depoda gerçek gizli anahtar yoktur.** `.env.example` şablondur; `.env.local`
  sürüm kontrolüne girmez.
- **Tüm veriler kurgusaldır.** Kişi adları, işletmeler, telefonlar ve yorumlar
  örnektir; gerçek kişi ya da işletme bilgisi içermez.
- **Üretim CSP'si `script-src 'unsafe-inline'` içerir.** Next.js App Router'ın
  satır içi RSC yükü nedeniyle zorunludur; gerekçe ve azaltıcı önlemler için
  [D-031](docs/DECISIONS.md) ve [L-15](docs/KNOWN_LIMITATIONS.md).
- Kapsamı bilerek dışarıda bırakılan özellikler ve nedenleri
  [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) içinde listelidir.

---

## Rolum

**Tek gelistirici.** Urun fikri, veri modeli, Next.js web uygulamasi, mobil
uygulama, paylasilan paketler (core / types / ui / validation), Supabase semasi
ve RLS politikalari ile test altyapisinin tamami bana ait.
