# Kararlar — HazırGrup

Bu dosya, kullanıcıya soru sorulmadan alınan tüm ürün, tasarım ve teknik kararları
gerekçeleriyle kaydeder.

Biçim: **D-NNN — Başlık** · Bağlam · Karar · Gerekçe · Sonuç/Ödün

---

### D-001 — Paket yöneticisi: npm workspaces
**Bağlam:** Monorepo için pnpm, yarn, npm workspaces seçenekleri var.
**Karar:** npm workspaces.
**Gerekçe:** Node ile birlikte gelir, ek kurulum gerektirmez, Windows'ta sembolik link
sorunu çıkarmaz, Expo ve Next.js monorepo desteği belgelenmiştir.
**Ödün:** pnpm'e göre daha yavaş kurulum ve daha büyük `node_modules`.

---

### D-002 — `packages/ui` React bileşeni içermez, token sağlar
**Bağlam:** Master prompt `packages/ui` istiyor; ancak React Native ve DOM render hedefleri
farklı, ortak bileşen katmanı `react-native-web` + Next transpile yapılandırması gerektirir.
**Karar:** `packages/ui` yalnızca **tasarım tokenları ve varyant tanımlarını** ihraç eder.
Bileşenler her uygulamada kendi platformuna uygun yazılır ama **aynı tokenları** kullanır.
**Gerekçe:** Görsel tutarlılık token seviyesinde garanti edilir; kırılgan bir çapraz platform
soyutlaması ve ağır build zinciri eklenmez ("aşırı soyutlama yapma" ilkesi).
**Ödün:** Buton/kart gibi bileşenler iki yerde yazılır (yaklaşık 400 satır tekrar).

---

### D-003 — Web'de CSS Modules + token'dan üretilen CSS değişkenleri (Tailwind değil)
**Karar:** `packages/ui` tokenlarından `tokens.css` üretilir; bileşenler CSS Modules kullanır.
**Gerekçe:** Tasarım tokenları zaten tek kaynakta; Tailwind ikinci bir token sistemi ve
build zinciri getirirdi. Mobil tarafla token paritesi korunuyor.
**Ödün:** Yardımcı sınıf ergonomisi yok; biraz daha fazla CSS dosyası.

---

### D-004 — İki kaynaklı veri katmanı: `demo` ve `supabase`
**Bağlam:** Supabase anahtarı olmadan uygulama çalışmalı ("uygulamayı durdurma, güvenli
alternatif hazırla").
**Karar:** `createRepository()` fabrikası; ortam değişkeni varsa `SupabaseRepository`,
yoksa bellek içi `DemoRepository`.
**Gerekçe:** `npm install && npm run dev` ile anahtarsız çalışan bir ürün; testler ağsız
çalışır; anahtar eklendiğinde kod değişmeden gerçek veritabanına geçilir.
**Ödün:** İki uygulama yolu bakım maliyeti; demo veriler süreç ömrüyle sınırlıdır.

---

### D-005 — Demo verisi ve `seed.sql` tek TypeScript kaynağından üretilir
**Karar:** `packages/core/src/seed/dataset.ts` tek gerçek kaynak;
`scripts/generate-seed-sql.ts` bundan `supabase/seed/seed.sql` üretir.
**Gerekçe:** İki ortam arasında veri sapması olmaz; 10 işletme / 15 şube / 30+ paket
elle SQL yazmaktan güvenli ve tutarlıdır.
**Ödün:** Seed SQL üretilmiş dosyadır, elle düzenlenmez.

---

### D-006 — Kök seviyede `/[city]` route'u + rezerve slug listesi
**Bağlam:** Master prompt `/hakkari` ve `/hakkari/merkez` istiyor; bu, kök dinamik segment
demek ve statik route'larla karışma riski taşıyor.
**Karar:** Kök `[city]` dinamik segmenti kullanılır; `RESERVED_SLUGS` listesindeki değerler
(`admin`, `business`, `auth`, `hesap`, `davet`, `mekanlar`, `paketler`, `kategoriler`,
`rehber`, `sss`, `yardim`, `legal`, `sehirler`, `nasil-calisir`, `api`, `og`) 404 döner.
**Gerekçe:** İstenen kısa ve SEO dostu URL yapısı korunur; çakışma açıkça engellenir ve
testle doğrulanır.
**Ödün:** Yeni bir kök route eklerken `RESERVED_SLUGS` güncellenmelidir (test bunu hatırlatır).

---

### D-007 — Oylar varsayılan olarak **açık** (kim ne oyladı görünür)
**Bağlam:** Prompt açık/gizli seçeneği bırakıyor, "varsayılan sade ve anlaşılır olanı seç".
**Karar:** Oylar açık; katılımcı adı ve seçtiği paket plan katılımcılarına görünür.
Gizli oylama Faz 1'de yok.
**Gerekçe:** Arkadaş grubunda şeffaflık karar hızlandırır ("Ali de burayı seçmiş"),
ek ayar ve açıklama gerektirmez, sosyal baskı riski küçük gruplarda düşüktür.
**Ödün:** Gizli oylama isteyen grup için seçenek yok → `FUTURE_ROADMAP.md`.

---

### D-008 — Eşitlikte karar plan sahibinde
**Karar:** Oylama bitiminde eşitlik varsa otomatik kazanan seçilmez; plan sahibine
**yalnızca eşit olan paketler arasından** seçim ekranı gösterilir.
**Gerekçe:** Rastgele seçim güven kırar; sahip zaten organizasyondan sorumludur.
**Ödün:** Sahip aksiyon almazsa plan `voting_closed` durumunda bekler (bildirimle hatırlatılır).

---

### D-009 — Harici font kullanılmaz, sistem font yığını
**Karar:** `-apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`.
**Gerekçe:** Ek ağ isteği yok, FOUT/CLS riski yok, LCP iyileşir, düşük segment cihazda hızlı.
**Ödün:** Platformlar arası küçük görsel farklar.

---

### D-010 — Dinamik OG görselleri `next/og` ile yerel üretilir
**Karar:** Harici görsel servisi kullanılmaz; `ImageResponse` ile runtime'da üretilir,
üretim başarısız olursa statik varsayılan OG görseline düşülür.
**Gerekçe:** Ücretli/harici servis bağımlılığı yasak; fallback ile akış hiç bozulmaz.
**Ödün:** OG üretimi sunucu CPU'su kullanır (ISR cache ile hafifletilir).

---

### D-011 — Misafir kimliği imzalı HttpOnly cookie ile
**Karar:** Misafir katılımcı, plan başına `hg_guest_{planId}` cookie'sindeki gizli değerin
SHA-256 özetiyle temsil edilir.
**Gerekçe:** Hesap istemeden aynı kişiyi tanır, oy değiştirmeyi mümkün kılar,
veritabanında düz sır saklanmaz.
**Ödün:** Cookie silinir/gizli sekme kullanılırsa yeni katılımcı oluşur → `KNOWN_LIMITATIONS` L-03.

---

### D-012 — Mobil ekranlar için render testi yerine saf durum fonksiyonu testi
**Karar:** RN bileşen render testi kurulmaz; ekran durum mantığı saf fonksiyonlara çıkarılır
ve test edilir. Manuel QA listesi hazırlanır.
**Gerekçe:** Expo + jsdom + Metro test kurulumu Faz 1 için kırılgan ve yüksek maliyetli;
asıl risk olan hesaplama ve durum mantığı `packages/core` ile zaten kapsanıyor.
**Ödün:** Ekran regresyonu otomatik yakalanmaz → `KNOWN_LIMITATIONS` L-05.

---

### D-013 — Mobil uygulama Supabase ile doğrudan konuşur (ayrı API katmanı yok)
**Karar:** Mobil, web'in route handler'larına değil, `packages/core` repository'si üzerinden
doğrudan Supabase'e (veya demo kaynağına) gider.
**Gerekçe:** Ek API yüzeyi, ek dağıtım bağımlılığı ve çift doğrulama katmanı olmaz;
güvenlik RLS ile veritabanı seviyesinde zaten zorunlu.
**Ödün:** Mobil için web sunucusunun çalışması gerekmez; ancak sunucu-özel işlemler
(rate limit sayacı) mobilde veritabanı fonksiyonuna taşınır.

---

### D-014 — Para birimi tam sayı kuruş olarak saklanır
**Karar:** Fiyatlar veritabanında `integer` kuruş (`price_amount` = 25000 → 250,00 ₺).
**Gerekçe:** Kayan nokta yuvarlama hataları önlenir; kişi başı bölme işleminde
tutarlı yuvarlama uygulanır (yukarı yuvarlama, grubun eksik ödeme riskini önler).
**Ödün:** Görüntülemede her yerde biçimlendirme fonksiyonu kullanılmalı.

---

### D-015 — Kişi başı fiyat yukarı yuvarlanır
**Karar:** `perPerson = ceil(total / people)`.
**Gerekçe:** 3 kişiye bölünen 100 ₺'de aşağı yuvarlama grubu eksik bırakır; kullanıcıya
gösterilen tutar gerçekte ödenecek tutardan az olmamalı.
**Ödün:** Toplamda birkaç kuruş fazla görünebilir; UI'da toplam ayrıca gösterilir.

---

### D-016 — Plan durumu `packages_ready` otomatik hesaplanır
**Karar:** Katılım netleştikten sonra eşleşen paket sayısı > 0 ise durum otomatik
`packages_ready` olur; 0 ise `confirming_participation` kalır ve kullanıcıya kısıt gevşetme
önerileri gösterilir.
**Gerekçe:** Kullanıcı "sıradaki adım ne?" sorusunun cevabını her zaman görür.

---

### D-017 — Türkçe UI metinleri sözlük dosyasında toplanır
**Karar:** `apps/*/src/i18n/tr.ts` sözlüğü; bileşenlerde `t('key')` kullanılır.
**Gerekçe:** i18n altyapısı hazır olur, metin tutarlılığı sağlanır, ileride dil eklemek
kod değişikliği gerektirmez.
**Ödün:** Ek dolaylama; kritik olmayan tek kullanımlık metinler doğrudan yazılabilir.

---

### D-018 — Rezervasyon kodu formatı `HG-XXXXXX`
**Karar:** Crockford Base32 (karıştırılabilir karakterler I, L, O, U hariç), 6 karakter.
**Gerekçe:** Telefonda sözlü okunabilir, çakışma olasılığı düşük, kısa.

---

### D-019 — Faz 1'de ödeme tabloları oluşturulur ama kullanılmaz
**Karar:** `subscription_plans`, `payments` vb. şema olarak eklenir; hiçbir akış yazmaz.
**Gerekçe:** Prompt "şema yeri" istiyor; ileride migration ile tablo eklemek yerine
ilişkiler baştan doğru kurulur. Aktif ödeme akışı yok.

---

### D-020 — Public sayfalarda ISR, panellerde tam dinamik render
**Karar:** Public: `revalidate` 900–3600 sn. Panel/hesap/davet: `dynamic = 'force-dynamic'`.
**Gerekçe:** SEO ve Core Web Vitals için önbellek; kişisel veride bayat/karışık içerik riski yok.

---

### D-021 — Şifre kuralı: en az 8 karakter, harf + rakam
**Karar:** Özel karakter zorunlu değil.
**Gerekçe:** NIST 800-63B önerisi doğrultusunda uzunluk odaklı; aşırı kural kullanıcıyı
zayıf ve tahmin edilebilir kalıplara iter. Hedef kitle genç ve mobil.

---

### D-022 — TypeScript 5.9 (7.x değil), ESLint 9 flat config
**Karar:** Kararlı ve geniş araç desteği olan sürümler sabitlendi.
**Gerekçe:** Next.js, Expo ve typescript-eslint ekosistemi bu sürümlerle doğrulanmış;
en yeni sürüm uyumsuzluk riskini artırırdı.

---

### D-023 — Esnek saat toleransı: ±90 dakika
**Karar:** Plan `is_time_flexible` ise paket uygunluk saatiyle 90 dakikaya kadar fark
kabul edilir ve "Saatte küçük fark var" gerekçesiyle gösterilir.
**Gerekçe:** Grup planlarında yarım–bir buçuk saatlik kayma yaygındır; daha geniş tolerans
sonuçları alakasızlaştırır.

---

### D-024 — Bütçe aşım toleransı: %15
**Karar:** Kişi başı bütçeyi en fazla %15 aşan paketler "Bütçene yakın" etiketiyle listelenir;
üstü elenir.
**Gerekçe:** Sıfır tolerans çok az sonuç üretir; %15 gerçekçi bir esneme payıdır ve
kullanıcıya aşım miktarı açıkça gösterilir.

---

### D-025 — Katılım sayısı hesabı: `going` + `maybe`/2
**Karar:** Tahmini katılımcı sayısı = kesin gelenler + kararsızların yarısı (yukarı yuvarlanır),
alt sınır plan `min_people` değeridir.
**Gerekçe:** Yalnızca `going` saymak paketleri erken eler; hepsini saymak fiyatı düşük gösterir.
Kullanıcıya hesabın nasıl yapıldığı arayüzde açıklanır.

---

### D-026 — Onay bekleyen içerik public'te görünmez
**Karar:** `businesses.status != 'verified'` olan hiçbir işletme ve paketi public sayfalarda
veya sitemap'te yer almaz; doğrudan URL ile erişilmek istenirse 404.
**Gerekçe:** Doğrulanmamış içerik hem SEO hem güven riski.

---

### D-027 — Realtime yoksa 5 saniyelik polling'e düşülür
**Karar:** Supabase Realtime kanalı kurulamazsa oylama ekranı 5 sn aralıkla yeniler.
**Gerekçe:** Özellik hiç çalışmamaktansa biraz gecikmeli çalışsın; kullanıcı akışı bozulmaz.

---

### D-028 — Kök `README.md` ve kurulum rehberleri Türkçe
**Karar:** Dokümantasyon Türkçe, kod ve tanımlayıcılar İngilizce.
**Gerekçe:** Prompt "Türkçe UI, İngilizce kod isimlendirmesi" diyor; ekip ve paydaş
dokümanlarının Türkçe olması ürünün hedef bağlamına uygun.

---

### D-029 — `plan_package_matches` önbellek tablosudur, gerçek kaynak hesaplamadır
**Karar:** Eşleşmeler her istekte `packages/core/matching` ile hesaplanır; tablo yalnızca
son hesaplanan sonucu ve gerekçeleri saklar (geçmiş ve hızlı gösterim için).
**Gerekçe:** Paket/katılımcı değiştiğinde bayat eşleşme gösterilmez.

---

### D-030 — Faz 1'de Edge Function yazılmaz
**Karar:** `supabase/functions/` klasörü README ile bırakılır.
**Gerekçe:** Gereken tüm mantık (rate limit, oy sayımı, durum geçişi) SQL fonksiyonları,
trigger'lar ve sunucu tarafı kodla karşılanıyor; ek dağıtım birimi eklemek gereksiz karmaşa.

---

### D-031 — CSP `script-src` üretimde `'unsafe-inline'` içerir
**Karar:** Üretim CSP'si `script-src 'self' 'unsafe-inline'` olarak yayınlanır.
`'unsafe-eval'` yalnızca geliştirme modunda açıktır. `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'` ve `frame-ancestors 'none'` kilitli kalır.

**Gerekçe:** Next.js App Router, React Server Component yükünü satır içi
`<script>self.__next_f.push(...)</script>` etiketleriyle aktarır; tema FOUC önleyici
betik de satır içidir. `script-src 'self'` bu betikleri engeller ve **hydration hiç
tamamlanmaz**: sayfa sunucu HTML'iyle doğru görünür ama plan sihirbazı, mobil menü ve
tema düğmesi dahil tüm istemci etkileşimi sessizce ölür. Bu, yalnızca E2E ile
yakalanabilen bir hatadır — statik analiz veya birim testi göstermez.

**Değerlendirilen alternatif:** Nonce tabanlı katı CSP (`'strict-dynamic'`).
Next.js, nonce kullanan her sayfayı **dinamik** render eder; bu da public SEO
sayfalarının statik/ISR üretimini (D-020) tamamen ortadan kaldırır. SEO, ürünün
birincil edinim kanalı olduğu için bu bedel kabul edilemez.

**Azaltıcı önlemler:**
- Kullanıcı üretimi HTML hiçbir yerde `dangerouslySetInnerHTML` ile basılmaz;
  tüm çıktı React tarafından kaçışlanır (XSS'in birincil vektörü kapalı).
- `object-src 'none'` ve `base-uri 'self'` ile enjeksiyon sonrası yükseltme yolları kapalı.
- `form-action 'self'` ile veri sızdıran form yönlendirmesi engellenir.
- `e2e/auth-guard.spec.ts` içindeki regresyon testi hem CSP direktiflerini hem de
  hydration'ın gerçekten tamamlandığını doğrular.

**İzleme:** docs/KNOWN_LIMITATIONS.md L-15.
