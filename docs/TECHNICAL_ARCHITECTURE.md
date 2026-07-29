# Teknik Mimari — HazırGrup

## 1. Monorepo Yapısı

```text
hazirgrup/
  apps/
    mobile/            React Native + Expo + Expo Router
    web/               Next.js (App Router) — public SEO, davet, hesap, işletme, admin
  packages/
    types/             Domain + veritabanı tipleri (framework bağımsız)
    validation/        Zod şemaları (web + mobile ortak)
    core/              Domain mantığı: bütçe, eşleştirme, durum makineleri, slug, SEO metadata
    ui/                Tasarım tokenları + varyant tanımları (RN & CSS ortak kaynak)
    config/            Ortak tsconfig / eslint temelleri
  supabase/
    migrations/        Sıralı SQL migration dosyaları
    seed/              Üretilen seed.sql
    functions/         Edge Functions (Faz 1'de boş — gerekli değil)
  docs/
  e2e/                 Playwright uçtan uca testler
  scripts/             Seed üretimi, bakım scriptleri
```

**Paket yöneticisi:** npm workspaces (ek araç kurulumu gerektirmez, Windows'ta sorunsuz).

**Neden `packages/ui` React bileşeni içermiyor:** React Native ve DOM render hedefleri
farklıdır; ortak bir bileşen katmanı `react-native-web` bağımlılığı ve Next.js transpile
yapılandırması gerektirir. Bunun yerine `packages/ui` **tasarım tokenlarını ve varyant
tanımlarını** (renk, spacing, tipografi, radius, shadow, buton/badge varyantları) tek
kaynaktan sağlar; web bunları CSS değişkenlerine, mobil `StyleSheet` nesnelerine dönüştürür.
Karar gerekçesi: `docs/DECISIONS.md` → D-002.

## 2. Katman Mimarisi

```
┌──────────────────────────────────────────────┐
│ UI (Next.js RSC / React Native ekranları)    │
├──────────────────────────────────────────────┤
│ Uygulama servisleri (server actions / hooks) │
├──────────────────────────────────────────────┤
│ Domain (packages/core)                       │  ← saf, test edilebilir, IO yok
│  bütçe · eşleştirme · durum makineleri · slug│
├──────────────────────────────────────────────┤
│ Repository arayüzü (packages/core/data)      │
├──────────────┬───────────────────────────────┤
│ SupabaseRepo │ DemoRepo (bellek içi)         │
└──────────────┴───────────────────────────────┘
```

**Kural:** Domain kuralları UI içine dağıtılmaz. Fiyat hesabı, eşleştirme skoru ve durum
geçişleri yalnızca `packages/core` içinde yaşar ve unit testlerle korunur.

## 3. Veri Erişim Adaptörü (kritik karar)

Uygulama iki veri kaynağıyla çalışır:

| Mod | Koşul | Kullanım |
| --- | --- | --- |
| `supabase` | `NEXT_PUBLIC_SUPABASE_URL` **ve** `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlı | Gerçek geliştirme/üretim |
| `demo` | Anahtarlar yok | Sıfır yapılandırmayla çalışan, seed verisiyle dolu bellek içi kaynak |

Her iki uygulama da `createRepository()` fabrikasını çağırır; hangi modda olduğunu bilmez.
Böylece:

- Depoyu klonlayan biri `npm install && npm run dev` ile **anahtarsız** çalışan bir ürün görür.
- Testler ağ bağımlılığı olmadan gerçek domain mantığını uçtan uca çalıştırır.
- Supabase kimlik bilgileri eklendiğinde tek satır kod değişmeden gerçek veritabanına geçilir.

Demo verisi ile `supabase/seed/seed.sql` **aynı TypeScript kaynağından** üretilir
(`packages/core/src/seed/dataset.ts` → `scripts/generate-seed-sql.ts`), böylece iki ortam
arasında veri sapması oluşmaz.

## 4. Mobil Teknoloji Yığını

| Alan | Seçim |
| --- | --- |
| Çatı | React Native + Expo (SDK 54+) |
| Yönlendirme | Expo Router (dosya tabanlı) |
| Dil | TypeScript (strict) |
| Sunucu durumu | TanStack Query |
| İstemci durumu | Zustand (sihirbaz taslağı, tema, oturum) |
| Form | React Hook Form + Zod |
| Güvenli depolama | `expo-secure-store` |
| Bildirim | `expo-notifications` (adaptör arkasında, opsiyonel) |
| Tema | Açık + koyu, `packages/ui` tokenlarından |
| Dil | Türkçe UI, i18n sözlük altyapısı hazır |

## 5. Web Teknoloji Yığını

| Alan | Seçim |
| --- | --- |
| Çatı | Next.js App Router |
| Render | Public sayfalar Server Component + ISR; paneller dinamik SSR |
| Dil | TypeScript (strict) |
| Form | React Hook Form + Zod (yalnızca etkileşimli formlarda) |
| Mutasyon | Server Actions |
| Sunucu durumu | TanStack Query yalnızca canlı oy sayacı gibi gerçek ihtiyaçta |
| Stil | CSS Modules + `packages/ui` tokenlarından üretilen CSS değişkenleri |
| SEO | Next.js Metadata API, `sitemap.ts`, `robots.ts`, JSON-LD |

**Neden Tailwind değil:** Tasarım tokenları zaten `packages/ui` içinde tek kaynakta;
CSS değişkenleri + CSS Modules ile mobil tarafla token paritesi korunuyor ve ek build
zinciri gerekmiyor. (D-003)

## 6. Render Stratejisi

| Sayfa grubu | Strateji | Gerekçe |
| --- | --- | --- |
| `/`, `/nasil-calisir`, `/sehirler`, `/kategoriler`, `/rehber/*`, `/sss` | Statik + ISR (1 saat) | İçerik nadiren değişir |
| `/[city]`, `/[city]/[district]`, `/kategoriler/[slug]` | ISR (15 dk) | Paket sayısı değişir |
| `/mekanlar/[slug]`, `/paketler/[slug]` | ISR (15 dk) + `generateStaticParams` | SEO kritik, server-rendered HTML zorunlu |
| `/davet/[token]` | Dinamik (no-store) | Kişiye özel, canlı oy durumu |
| `/hesap/*`, `/business/*`, `/admin/*` | Dinamik SSR | Yetki kontrolü, kişisel veri |

## 7. Kimlik Doğrulama

Faz 1: **e-posta + şifre**.

```
İstemci → Server Action → AuthAdapter
                            ├─ SupabaseAuth   (gerçek)
                            └─ DemoAuth       (imzalı HttpOnly cookie, seed kullanıcıları)
```

- Oturum HttpOnly + SameSite=Lax cookie'de; web'de token localStorage'a yazılmaz.
- Mobilde token `expo-secure-store` içinde saklanır.
- Şifre sıfırlama akışı; e-posta doğrulamasına hazır yapı.
- Google girişi `AuthProvider` adaptörü arkasında; kimlik bilgisi yoksa buton **gizlenir**,
  uygulama bozulmaz.
- Telefon OTP zorunlu bağımlılık **değildir**.
- Misafir davet akışı hesap istemez; misafir kimliği plan başına imzalı `guest` cookie'sidir.

## 8. Yetkilendirme

İki katman, ikisi de zorunlu:

1. **Veritabanı:** Row Level Security politikaları (tek gerçek kaynak).
2. **Sunucu:** Her server action / route handler başında `requireRole()` kontrolü.

İstemci tarafı kontroller yalnızca UX içindir, güvenlik sınırı sayılmaz.

## 9. Realtime

- Birincil: Supabase Realtime kanalı (`plan:{id}` → `votes`, `plan_participants`).
- Yedek: Kanal kurulamazsa 5 sn'lik polling. Kullanıcı farkı hissetmez.
- Demo modda in-process event emitter aynı arayüzü sağlar.

## 10. Önbellek Stratejisi

| Veri | Web | Mobil (TanStack Query) |
| --- | --- | --- |
| Şehir/ilçe/kategori | ISR 1 saat | `staleTime: 1h`, `gcTime: 24h` |
| Public işletme/paket | ISR 15 dk | `staleTime: 15m` |
| Plan detayı | no-store | `staleTime: 30s` |
| Oy sayıları | no-store | `staleTime: 0` + realtime invalidate |
| Rezervasyonlar | no-store | `staleTime: 1m` |

Aynı veri gereksiz yere tekrar çekilmez; liste → detay geçişinde `initialData` kullanılır.

## 11. Hata Modeli

`packages/core` tek bir hata tipi ihraç eder:

```ts
class AppError extends Error {
  code: AppErrorCode;      // 'not_found' | 'forbidden' | 'validation' | 'conflict' | 'rate_limited' | 'unavailable' | 'unknown'
  userMessage: string;     // kullanıcıya gösterilecek Türkçe metin
  details?: Record<string, string>;
}
```

UI yalnızca `userMessage` gösterir; teknik ayrıntı loglanır. Hassas veri loglanmaz.

## 12. Ortam Değişkenleri

`.env.example` içinde tam liste bulunur. Zorunlu değişken **yoktur**; hepsi opsiyoneldir
ve eksikliğinde uygulama demo moda düşer.

## 13. Dağıtım Hazırlığı

- **Android:** `apps/mobile` içinde `eas.json` profilleri; `docs/BUILD_ANDROID.md`.
- **iOS:** uyumluluk korunur, build alınmaz.
- **Web:** standart Next.js hosting (`npm run build && npm start`).
- **Supabase:** local (`supabase start`) ve cloud kurulum adımları `docs/SETUP.md`.
- Production deploy **yapılmaz**.

## 14. Komutlar

| Komut | Etki |
| --- | --- |
| `npm run dev` | Web geliştirme sunucusu |
| `npm run dev:mobile` | Expo geliştirme sunucusu |
| `npm run build` | Tüm paketler + web build |
| `npm run lint` | ESLint (tüm workspace) |
| `npm run typecheck` | `tsc --noEmit` (tüm workspace) |
| `npm test` | Vitest unit + integration |
| `npm run test:e2e` | Playwright |
| `npm run seed:sql` | `supabase/seed/seed.sql` üret |
| `npm run verify` | lint + typecheck + test (CI kapısı) |
