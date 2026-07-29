# Web dağıtım rehberi

> **Bu depoda dağıtım YAPILMAZ.** Aşağıdaki adımlar, dağıtımı siz yapacağınız
> zaman izlenecek yolu tanımlar. Depo hiçbir üretim ortamına bağlı değildir ve
> gerçek anahtar içermez.

---

## 1. Derleme çıktısı

```bash
npm run build
npm run start
```

`apps/web` standart bir Next.js 16 uygulamasıdır; özel bir çıktı modu
(`output: 'standalone'` / `'export'`) kullanılmaz. Dolayısıyla Node.js
çalıştırabilen her ortamda dağıtılabilir.

Derleme, public sayfaları statik ya da ISR olarak önceden üretir. Bu SEO için
kritiktir: bot ilk istekte tam HTML görür (docs/SEO_STRATEGY.md, docs/DECISIONS.md D-020).

---

## 2. Ortam değişkenleri

Dağıtım öncesi **mutlaka** ayarlanmalı:

| Değişken | Üretim değeri | Neden |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://<alan-adiniz>` (sonda `/` yok) | Canonical, sitemap, OG |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` | Aksi hâlde robots.txt tüm siteyi kapatır |
| `HG_SESSION_SECRET` | ≥ 32 karakter rastgele | Oturum/misafir çerezi imzası |

Supabase kullanacaksanız ek olarak:

| Değişken | Not |
| --- | --- |
| `HG_DATA_SOURCE` | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | Proje adresi |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | İstemci anahtarı (RLS geçerli) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yalnızca sunucu.** İstemciye asla verilmez |

Ayarlanmazsa uygulama **demo moduna** düşer ve üstte "Demo modu" bandı gösterir.
Bu bilinçli bir davranıştır: dağıtım hiçbir zaman "beyaz ekran" ile başarısız olmaz.

### Ortam ayrımı

| Ortam | `NEXT_PUBLIC_ENVIRONMENT` | robots.txt |
| --- | --- | --- |
| Yerel | `development` | Tümü `Disallow` |
| Önizleme / staging | `staging` | Tümü `Disallow` |
| Üretim | `production` | Public yollar açık, private yollar kapalı |

Staging'in indekslenmesi kopya içerik cezasına yol açar; bu kilit kasıtlıdır ve
`e2e/public-seo.spec.ts` ile test edilir.

---

## 3. Sağlayıcı seçenekleri

### Vercel (en az yapılandırma)

1. Depoyu içe aktarın.
2. **Root Directory**: depo kökü (monorepo otomatik algılanır).
3. Build Command: `npm run build` · Output: varsayılan.
4. Ortam değişkenlerini Production ve Preview için ayrı ayrı girin.
   Preview ortamında `NEXT_PUBLIC_ENVIRONMENT=staging` verin.

### Kendi sunucunuz (Node.js)

```bash
npm ci
npm run build
NODE_ENV=production npm run start -- --port 3000
```

Süreç yöneticisi (`pm2`, `systemd`) ve önünde bir ters vekil (nginx/Caddy) kullanın.
TLS sonlandırmasını vekilde yapın; uygulama HSTS başlığını `production` modda kendisi ekler.

### Docker

Depoda Dockerfile yoktur (kapsam dışı). Eklerseniz `output: 'standalone'`
ayarını açıp `.next/standalone` çıktısını kopyalamanız gerekir.

---

## 4. Veritabanı geçişi

```bash
supabase link --project-ref <proje-ref>
supabase db push
```

Migration'lar `0001…0013` sırasıyla uygulanır ve **geri dönüşü düşünülerek**
yazılmıştır (yıkıcı `DROP` içermez, ekleme odaklıdır).

**Seed'i üretimde çalıştırmayın.** `supabase/seed/seed.sql` tanıtım verisidir;
yalnızca demo/staging ortamına yüklenmelidir.

---

## 5. Güvenlik başlıkları

`apps/web/next.config.ts` tarafından tüm yollara uygulanır:

- `Content-Security-Policy` — `frame-ancestors 'none'`, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin` (davet sayfalarında `no-referrer`)
- `Permissions-Policy` — kamera/mikrofon/ödeme kapalı
- `Strict-Transport-Security` — yalnızca `production`

`script-src` üretimde `'unsafe-inline'` içerir; bu Next.js App Router için
zorunludur ve gerekçesi docs/DECISIONS.md D-031 ile docs/KNOWN_LIMITATIONS.md
L-15 içinde açıklanmıştır. Ters vekilde bu başlıkları **tekrar yazmayın**;
çakışırsa en kısıtlayıcı olan uygulanır ve hydration bozulabilir.

---

## 6. Dağıtım sonrası doğrulama

```bash
# 1. Ana sayfa 200 ve canonical doğru
curl -sI https://<alan> | head -20
curl -s https://<alan> | grep -o '<link rel="canonical"[^>]*>'

# 2. robots.txt üretim modunda mı
curl -s https://<alan>/robots.txt

# 3. sitemap erişilebilir
curl -sI https://<alan>/sitemap.xml

# 4. Olmayan sayfa gerçekten 404 dönüyor mu (soft 404 kontrolü)
curl -sI https://<alan>/olmayan-sayfa | head -1

# 5. Private sayfa noindex mi
curl -sI https://<alan>/hesap | grep -i x-robots-tag

# 6. Güvenlik başlıkları
curl -sI https://<alan> | grep -iE 'content-security|x-frame|x-content-type|strict-transport'
```

Tarayıcıda ayrıca:

- [ ] Konsolda **hiç CSP hatası yok** (varsa hydration ölür, tüm butonlar tepkisiz kalır)
- [ ] Tema düğmesi çalışıyor (hydration kanıtı)
- [ ] Mobil menü açılıp kapanıyor
- [ ] Plan sihirbazı adım değiştiriyor
- [ ] Google Rich Results Test ile JSON-LD geçerli
- [ ] Lighthouse: Performans / Erişilebilirlik / SEO

Tam liste: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

---

## 7. Geri alma

Uygulama katmanı durum tutmaz; önceki derlemeye dönmek yeterlidir
(Vercel'de "Promote to Production", kendi sunucunuzda önceki sürüme geçiş).

Veritabanı migration'ları ileri yönlüdür. Geri almak gerekirse ilgili
migration'ın tersini yeni bir migration olarak yazın — uygulanmış bir dosyayı
**düzenlemeyin**; sürüm karışıklığına yol açar.
