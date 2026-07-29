# Bilinen Sınırlamalar — HazırGrup

Faz 1 kapsamında bilinçli olarak kapatılan, sınırlanan veya eksik bırakılan konular.
Hiçbiri kritik kullanıcı akışını bozmaz.

---

### L-01 — Demo modda veriler kalıcı değil
`DemoRepository` bellek içidir. Sunucu yeniden başlarsa demo verisi seed haline döner.
**Etki:** Yalnızca Supabase yapılandırılmadığında. **Çözüm:** `.env` içine Supabase
anahtarlarını ekleyin (`docs/SETUP.md`).

---

### L-02 — Gerçek e-posta gönderimi yok
Şifre sıfırlama ve doğrulama e-postaları Supabase Auth'a devredilmiştir. Demo modda
e-posta gönderilmez; sıfırlama bağlantısı sunucu loguna yazılır.
**Etki:** Demo modda şifre sıfırlama akışı log üzerinden test edilir.

---

### L-03 — Misafir kimliği cookie'ye bağlı
Misafir katılımcı `hg_guest_{planId}` cookie'siyle tanınır. Cookie silinir, gizli sekme
kullanılır veya cihaz değiştirilirse aynı kişi **yeni katılımcı** olarak görünür ve
ikinci kez oy verebilir.
**Azaltma:** IP + token bazlı rate limiting, plan sahibinin katılımcı silme yetkisi.
**Tam çözüm:** Telefon doğrulaması — Faz 1 kapsamı dışı (bkz. `FUTURE_ROADMAP.md`).

---

### L-04 — Push bildirimi yapılandırma gerektirir
`expo-notifications` entegrasyonu adaptör arkasındadır. FCM/APNs kimlik bilgileri
olmadan push gönderilmez; **uygulama içi bildirim merkezi tam çalışır**.
**Çözüm:** `docs/BUILD_ANDROID.md` §5 içinde FCM kurulum adımları.

---

### L-05 — Mobil ekranlarda otomatik render testi yok
Karar D-012. Ekran durum mantığı saf fonksiyon testleriyle, hesaplama mantığı
`packages/core` testleriyle korunur; görsel/etkileşim regresyonu manuel QA listesiyle
doğrulanır (`docs/MOBILE_QA_CHECKLIST.md`).

---

### L-06 — Gizli oylama seçeneği yok
Karar D-007 gereği oylar açıktır. Gizli oylama isteyen gruplar için seçenek Faz 1'de
bulunmuyor.

---

### L-07 — Harita ve konum servisi yok
Şube adresleri metin olarak gösterilir; `lat`/`lng` alanları şemada mevcuttur ancak
harita gömme veya yol tarifi Faz 1'de yok (harici harita servisi anahtarı gerektirir).
Adres, telefon ve WhatsApp aksiyonu çalışır.

---

### L-08 — Google ile giriş varsayılan olarak kapalı
`GOOGLE_CLIENT_ID` tanımlı değilse buton **gösterilmez**. Adaptör ve dokümantasyon
hazırdır (`docs/SETUP.md` §6); kimlik bilgisi eklendiğinde otomatik etkinleşir.

---

### L-09 — Sitemap parçalama devrede değil
`SITEMAP_CHUNK_SIZE = 5000` altındaki içerik hacminde tek sitemap üretilir. Parçalama
altyapısı hazırdır, eşik aşılınca devreye girer. Gerçek veriyle doğrulanmamıştır.

---

### L-10 — Görsel yeniden boyutlandırma sunucuda yapılmıyor
Yükleme sırasında boyut ve tip doğrulaması yapılır; yeniden boyutlandırma Supabase
Storage'ın görüntü dönüşümüne bırakılmıştır (cloud'da mevcut, local'de sınırlı).
Demo modda görseller `picsum`-benzeri yerel yer tutuculardır.

---

### L-11 — Rezervasyon çakışma/kapasite kontrolü yok
Aynı şube ve saat için birden fazla rezervasyon talebi oluşturulabilir; çakışma kararını
işletme onay/ret aşamasında verir. Otomatik masa/saha kapasitesi yönetimi Faz 1'de yok.

---

### L-12 — Çoklu dil altyapısı hazır ama tek dil yüklü
Sözlük tabanlı i18n kurulu; yalnızca `tr` sözlüğü doludur. `hreflang` ve dil seçici
ikinci dil eklendiğinde devreye alınacaktır.

---

### L-13 — Supabase Realtime demo modda simüle edilir
Demo modda in-process event emitter kullanılır; farklı tarayıcı sekmeleri arasında
canlı senkronizasyon **aynı sunucu süreci** üzerinden çalışır. Supabase modunda gerçek
Realtime kanalı kullanılır, kurulamazsa 5 sn polling'e düşer (D-027).

---

### L-14 — RLS SQL testleri Supabase CLI gerektirir
`npm run test:rls` yalnızca Supabase CLI kuruluysa çalışır. CLI yoksa komut uyarı verip
atlar; RLS mantığının uygulama tarafı karşılığı `tests/security/` içinde test edilir.

---

### L-15 — Üretim CSP'si `script-src 'unsafe-inline'` gerektirir
Next.js App Router'ın satır içi RSC yükü nedeniyle `script-src` direktifi
`'unsafe-inline'` içerir (D-031). Katı nonce tabanlı CSP, tüm sayfaları dinamik
render etmeye zorlayacağı için SEO açısından kritik statik/ISR üretimini bozar.

**Etki:** Bir XSS açığı ortaya çıkarsa CSP ikinci savunma hattı olarak devreye giremez.
`object-src`, `base-uri`, `form-action` ve `frame-ancestors` kilitli olduğu için
enjeksiyon sonrası yükseltme yolları yine de dardır.

**Çözüm yolu:** Next.js statik sayfalarda nonce üretimini desteklediğinde ya da
RSC yükü satır içi olmaktan çıktığında `script-src 'self' 'nonce-…' 'strict-dynamic'`
şeklinde sıkılaştırılmalıdır. Alternatif olarak public sayfalar statik kalırken
kimlik doğrulamalı rotalara ayrı ve katı bir CSP uygulanabilir.
