# SEO Stratejisi — HazırGrup

SEO sonradan eklenen bir görev değildir. Veri modeli, route yapısı, içerik yönetimi ve
performans kararları baştan SEO düşünülerek verilmiştir.

Mobil uygulama tek başına arama görünürlüğü sağlamaz; bu nedenle Next.js web uygulaması
herkese açık, hızlı ve indekslenebilir sayfalar üretir.

---

## 1. İndekslenecek Sayfalar

| Route | İçerik kaynağı | Koşul |
| --- | --- | --- |
| `/` | Statik + aktif şehir/kategori özetleri | her zaman |
| `/nasil-calisir` | Statik içerik | her zaman |
| `/sehirler` | `cities` | her zaman |
| `/[city]` | `cities` + ilçeler + paketler | `is_active AND is_public AND is_indexable` **ve** ≥1 public paket |
| `/[city]/[district]` | `districts` + paketler | aynı + ≥1 public paket |
| `/kategoriler` | `categories` | her zaman |
| `/kategoriler/[slug]` | `categories` + paketler | `is_active AND is_indexable` |
| `/mekanlar/[slug]` | `businesses` | `status='verified' AND is_public AND is_indexable` |
| `/paketler/[slug]` | `packages` | `is_active AND is_public AND is_indexable` |
| `/rehber`, `/rehber/[slug]` | Kullanım senaryosu içerikleri | her zaman |
| `/sss`, `/yardim/[slug]` | `help_articles` (`is_public`) | `is_indexable` |
| `/legal/[slug]` | Statik hukuki metinler | her zaman |

### İçerik Eşiği (thin content koruması)

Şehir/ilçe/kategori sayfaları **yeterli içerik yoksa indekslenmez**:

```
INDEXABLE_MIN_PACKAGES = 3      // sayfada en az 3 aktif public paket
INDEXABLE_MIN_BUSINESSES = 1    // en az 1 doğrulanmış işletme
```

Eşik altındaki sayfa kullanıcıya **gösterilir** (yararlıdır) ancak `robots: noindex, follow`
alır ve sitemap'e eklenmez. Bu kural `packages/core/src/seo/indexability.ts` içinde tek
noktadan uygulanır ve testlidir. Programatik olarak yüzlerce boş sayfa üretilmez.

---

## 2. İndekslenmeyecek Sayfalar

`noindex, nofollow` uygulanan yollar:

```
/admin/*        /business/*     /auth/*        /hesap/*
/davet/*        /plan/*         /rezervasyon/* /onizleme/*
```

Ayrıca: arama/filtre query parametreli varyantlar (`?siralama=`, `?butce=`, `?sayfa=` > 1
dışındakiler) canonical ile ana sayfaya işaret eder ve `noindex` alır.

**Özel plan veya davet bilgisi hiçbir zaman sitemap'e eklenmez.**

---

## 3. Metadata

Next.js Metadata API kullanılır. Her public sayfa dinamik ve benzersiz üretir:

`title` · `description` · `canonical` · `openGraph.title` · `openGraph.description` ·
`openGraph.images` · `openGraph.locale` (`tr_TR`) · `twitter.card` · `robots` · `alternates`

Metadata üretimi tek yerde: `packages/core/src/seo/metadata.ts`.

### Başlık Şablonları

| Sayfa | Şablon |
| --- | --- |
| Ana sayfa | `HazırGrup — Grubunu Oluştur, Paketini Seç, Birlikte Karar Ver` |
| Şehir | `{Şehir}'de Arkadaş Grubuna Uygun Mekân Paketleri \| HazırGrup` |
| İlçe | `{İlçe}, {Şehir} Grup Mekân Paketleri \| HazırGrup` |
| Kategori | `{Şehir} {Kategori} Paketleri \| HazırGrup` veya `{Kategori} Paketleri \| HazırGrup` |
| İşletme | `{İşletme} — {İlçe}, {Şehir} \| HazırGrup` |
| Paket | `{Paket} — {İşletme}, {İlçe} \| HazırGrup` |
| Rehber | `{Başlık} \| HazırGrup` |

Başlıklar doğal Türkçedir; anahtar kelime doldurma yapılmaz. Başlık 60, açıklama 155
karakteri aşarsa kelime sınırında kısaltılır (`truncateForSeo`).

### Açıklama Üretimi

Açıklama, sayfanın gerçek verisinden üretilir; sabit şablon tekrarı yapılmaz. Örnek:

> Yüksekova'da 6–10 kişilik gruplar için 12 paket. Kişi başı 250 ₺'den başlayan kafe,
> halı saha ve oyun salonu seçeneklerini karşılaştır, arkadaşlarınla oylayarak seç.

---

## 4. Canonical ve URL Yapısı

- Her içerik için **tek** canonical URL.
- Slug'lar Türkçe karakterlerden arındırılır: `ı→i, ğ→g, ü→u, ş→s, ö→o, ç→c, İ→i`.
  Uygulama: `packages/core/src/text/slug.ts` (testli).
- **Trailing slash yok** (`trailingSlash: false`), tutarlı uygulanır.
- Query parametreli filtre sayfaları → canonical parametresiz sürüme işaret eder.
- Sayfalama: `?sayfa=2` kendi canonical'ına sahiptir ve indekslenebilir.
- Slug değişimi → `seo_redirects` tablosuna 301 kaydı yazılır, middleware uygular.
- www/non-www ve http/https tekilleştirmesi `NEXT_PUBLIC_SITE_URL` üzerinden canonical ile
  yapılır; hosting seviyesindeki yönlendirme `docs/DEPLOY_WEB.md` içinde anlatılır.

---

## 5. Sitemap

`apps/web/src/app/sitemap.ts` dinamik üretir. İçerik:

1. Statik sayfalar (`/`, `/nasil-calisir`, `/sehirler`, `/kategoriler`, `/rehber`, `/sss`, `/legal/*`)
2. İndekslenebilir şehirler
3. İndekslenebilir ilçeler
4. İndekslenebilir kategoriler
5. Doğrulanmış + public + indekslenebilir işletmeler
6. Aktif + public + indekslenebilir paketler
7. Rehber sayfaları
8. Public + indekslenebilir yardım makaleleri

**Eklenmeyenler:** private, pasif, silinmiş, noindex, eşik altı sayfalar; davet ve plan yolları.

`lastModified` gerçek `updated_at` değerinden gelir. İçerik sayısı 5.000 URL'i aşarsa
`sitemap.ts` `generateSitemaps()` ile parçalara bölünür (altyapı hazır, eşik sabiti
`SITEMAP_CHUNK_SIZE`).

---

## 6. Robots.txt

`apps/web/src/app/robots.ts` dinamik üretir.

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /business/
Disallow: /auth/
Disallow: /hesap/
Disallow: /davet/
Disallow: /plan/
Disallow: /rezervasyon/
Disallow: /api/
Sitemap: {SITE_URL}/sitemap.xml
```

**Staging koruması:** `NEXT_PUBLIC_ENVIRONMENT !== 'production'` olduğunda robots.txt
tamamı `Disallow: /` döner ve tüm sayfalara `noindex` eklenir.

---

## 7. Structured Data (JSON-LD)

| Sayfa | Şema |
| --- | --- |
| Tüm sayfalar (layout) | `Organization`, `WebSite` |
| Derin sayfalar | `BreadcrumbList` |
| `/mekanlar/[slug]` | `LocalBusiness` alt tipi (`CafeOrCoffeeShop`, `Restaurant`, `SportsActivityLocation`, `EntertainmentBusiness`) |
| `/paketler/[slug]` | `Offer` (+ `itemOffered: Product`) |
| `/sss`, `/yardim/[slug]`, şehir sayfası SSS bloğu | `FAQPage` |

**Kurallar:**
- Kullanıcı yorumu **yoksa** `aggregateRating` / `review` **üretilmez**. Sahte puan yoktur.
- `Event` yalnızca gerçek bir etkinlik varsa kullanılır — Faz 1'de kullanılmaz.
- `priceCurrency: TRY`, `availability` paketin gerçek aktifliğini yansıtır.
- Üretim tek noktadan: `packages/core/src/seo/structured-data.ts` (testli).

---

## 8. Public İşletme Sayfası

Server-rendered HTML içinde: işletme adı, açıklama, kategori, şubeler, adres, çalışma
saatleri, telefon/WhatsApp aksiyonu, aktif paketler, görseller, doğrulanmış işletme rozeti,
breadcrumb, ilgili şehir/ilçe/kategori bağlantıları.

İçerik yalnızca client-side fetch ile gelmez; `view-source` çıktısında görünür.
Bu bir testle korunur (`tests/seo/ssr-content.test.ts`).

---

## 9. Public Paket Sayfası

Server-rendered HTML içinde: paket adı, mekân + şube, paket içeriği, min/max kişi,
toplam ve kişi başı fiyat, geçerli gün/saat, il/ilçe, rezervasyon şartı, iptal şartı,
ilgili paket önerileri, breadcrumb.

**Pasif paket davranışı:**

| Durum | HTTP | Sayfa |
| --- | --- | --- |
| Geçici pasif (`is_active=false`, kayıt var) | 200 | "Bu paket şu anda rezervasyona kapalı" + aynı mekânın alternatifleri, `noindex` |
| Public'ten kaldırılmış (`is_public=false`) | 404 | Bulunamadı |
| Kalıcı silinmiş | 410 | `seo_redirects` içinde `status_code=410` kaydı varsa Gone, yoksa 404 |
| Slug değişmiş | 301 | `seo_redirects` üzerinden yeni slug'a |

---

## 10. Şehir ve İlçe Sayfaları

Şehir sayfası salt paket listesi değildir. Bölümler:

1. Giriş metni (şehre özgü, `cities.intro`).
2. Şehirde aktif kategoriler + paket sayıları.
3. Öne çıkan paketler (fiyat ve kapasiteyle).
4. İlçeler listesi (paket sayısıyla).
5. "HazırGrup {Şehir}'de nasıl çalışır?" — 4 adımlı açıklama.
6. Kişi sayısına göre hızlı bağlantılar (4 kişilik, 8 kişilik, 12 kişilik paketler).
7. Şehre özel SSS (`FAQPage` JSON-LD ile).

İlçe sayfası aynı yapıyı ilçe kapsamında tekrarlar ve şehir sayfasına geri link verir.

---

## 11. Dahili Linkleme

- Şehir → ilçe → işletme → paket zinciri karşılıklı linklenir.
- Paket sayfasından kategori, ilçe, şehir ve mekân sayfalarına dönüş linkleri.
- Breadcrumb tüm derin public sayfalarda (`BreadcrumbList` ile birlikte).
- "İlgili paketler" ve "Benzer mekânlar" blokları.
- Rehber sayfaları ilgili şehir/kategori sayfalarına link verir.
- Kırık link testi: `tests/seo/internal-links.test.ts` tüm public route'ları gezip
  üretilen `href`'lerin çözülebilir olduğunu doğrular.

---

## 12. Open Graph ve Paylaşım

**Public sayfalar:** dinamik OG görseli `apps/web/src/app/og/route.tsx` içinde
`next/og` (ImageResponse) ile üretilir — harici servis gerekmez. Font yüklenemezse
sistem fontuyla sade bir kart üretilir (fallback).

**Davet sayfası (`/davet/[token]`):** `noindex` olmasına rağmen WhatsApp önizlemesi
anlamlıdır. Kartta **yalnızca** şu bilgiler bulunur:

- Planın genel başlığı (kullanıcının verdiği ad; kişisel değilse)
- Tarih
- İlçe
- Katılım çağrısı ("Sen de katıl, birlikte karar verelim")

Kartta **bulunmaz:** katılımcı isimleri, telefon, bütçe, özel not, mekân seçimi.

---

## 13. Core Web Vitals

| Metrik | Hedef | Uygulama |
| --- | --- | --- |
| LCP | < 2.5 s | Server rendering, `next/image` + `priority`, font `display: swap`, kritik CSS inline |
| CLS | < 0.1 | Tüm görsellerde `width`/`height`, skeleton'lar gerçek yükseklikte, layout shift'siz font |
| INP | < 200 ms | Public sayfalarda minimal client JS; etkileşimli parçalar ayrı client component |

Ek kurallar: üçüncü taraf script yok, analytics opsiyonel ve `afterInteractive`,
ağır client component public sayfalarda kullanılmaz, liste görselleri `sizes` ile responsive.

---

## 14. Yönetici SEO Alanları

Admin panelinde şehir, ilçe, kategori, işletme, paket ve yardım makalesi için:

`seo_title` · `seo_description` · `slug` · `canonical_override` (yalnız admin) ·
`og_image_url` · `is_indexable`

Alanlar **opsiyoneldir**. Boşsa otomatik üretilen kaliteli metadata kullanılır; yönetici
her içerikte SEO alanı doldurmak zorunda değildir. Slug değiştirilirse eski slug için
otomatik 301 kaydı oluşturulur.

---

## 15. SEO Testleri

`tests/seo/` altında:

| Test | Doğruladığı |
| --- | --- |
| `metadata.test.ts` | Başlık/açıklama uzunluğu, benzersizlik, şablon doğruluğu |
| `canonical.test.ts` | Tek canonical, trailing slash, query temizliği |
| `robots.test.ts` | Private route'ların `noindex`, staging tam kapalı |
| `sitemap.test.ts` | Yalnızca indekslenebilir URL'ler, private yol yok |
| `structured-data.test.ts` | Geçerli JSON-LD, sahte rating yok, doğru tip |
| `ssr-content.test.ts` | İşletme/paket içeriği HTML kaynağında |
| `internal-links.test.ts` | Kırık dahili link yok |
| `indexability.test.ts` | İçerik eşiği kuralı |

Lighthouse çalıştırma talimatı: `docs/TEST_STRATEGY.md` → §7.

---

## 16. Yapılacaklar (Faz 1 sonrası)

- Sitemap parçalama gerçek veri hacmiyle devreye alınması
- `hreflang` (çoklu dil eklendiğinde)
- Google Search Console entegrasyonu ve indeksleme raporu
- Gerçek kullanıcı yorumları geldiğinde `AggregateRating` (yalnızca gerçek veriyle)
- Şehir bazlı içerik editörü (yönetici panelinde zengin metin)
