# Kurulum

Bu doküman üç senaryoyu kapsar:

1. **Demo mod** — hiçbir harici servis olmadan (varsayılan)
2. **Supabase local** — Docker üzerinde tam veritabanı
3. **Supabase bulut** — gerçek proje

---

## 0. Ön koşullar

| Araç | Sürüm | Zorunlu mu? |
| --- | --- | --- |
| Node.js | ≥ 20.11.0 | Evet |
| npm | ≥ 10 | Evet |
| Docker Desktop | güncel | Yalnızca Supabase local için |
| Supabase CLI | ≥ 2.0 | Yalnızca Supabase için |
| Expo Go (telefon) | güncel | Yalnızca mobil için |

Sürüm kontrolü:

```bash
node -v
npm -v
```

---

## 1. Demo mod (varsayılan, önerilen başlangıç)

```bash
git clone <repo>
cd HazırGrup
npm install
npm run dev
```

`http://localhost:3000` açılır. **`.env` dosyası oluşturmanıza gerek yoktur.**

### Neden çalışıyor?

`HG_DATA_SOURCE` varsayılan olarak `auto`'dur. Supabase anahtarları tanımlı
olmadığı için `createRepository()` `DemoRepository` döner: seed verisiyle dolu,
bellek içi bir veri kaynağı. Plan oluşturma, davet, oylama ve rezervasyon dahil
tüm akışlar gerçek uygulamadaki gibi çalışır (bkz. docs/DECISIONS.md D-004).

### Demo modun sınırları

- Veriler **sunucu süreci** belleğindedir; sunucu yeniden başlarsa seed durumuna döner.
- Aynı süreç içinde çalıştığı için çok sunuculu bir ortamda kullanılamaz.
- Gerçek e-posta gönderimi ve push bildirimi yoktur (uygulama içi bildirim çalışır).

### Demo hesapları

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Kullanıcı | `elif@ornek.test` | `Demo1234` |
| Arkadaş | `kerem@ornek.test` | `Demo1234` |
| Arkadaş | `zeynep@ornek.test` | `Demo1234` |
| İşletme sahibi | `isletme01@ornek.test` … `isletme10@ornek.test` | `Isletme1234` |
| İşletme personeli | `personel@ornek.test` | `Demo1234` |
| Başvuru sahibi | `basvuru@ornek.test` | `Demo1234` |
| Yönetici | `admin@ornek.test` | `Admin1234` |

Giriş ekranı demo modda ilk üç hesabı zaten gösterir. Tüm hesaplar kurgusaldır.

### 5 dakikada tam akışı denemek

1. `elif@ornek.test` ile giriş yapın.
2. **Yeni plan oluştur** → 7 adımlı sihirbazı tamamlayın.
3. Plan sayfasında **Arkadaşlarını davet et** → bağlantı üretin.
4. Bağlantıyı **gizli sekmede** açın (misafir olursunuz), adınızı yazıp katılın.
5. Plan sahibi olarak **Oylamayı başlat**, iki taraftan da oy verin.
6. **Oylamayı bitir** → **Rezervasyon talebi gönder**.
7. Ayrı bir tarayıcıda `isletme01@ornek.test` ile girip talebi onaylayın.
   (Talep başka bir işletmeye gitmişse rezervasyon kodundaki işletmeyi kullanın.)
8. Kullanıcı hesabına dönün: **Rezervasyonlarım → Onaylanan**.

---

## 2. Supabase local (Docker)

### 2.1 CLI kurulumu

```bash
npm install -g supabase        # ya da: scoop install supabase / brew install supabase/tap/supabase
supabase --version
```

### 2.2 Başlatma

Depo kökünde:

```bash
supabase start
```

İlk çalıştırma imajları indirir (birkaç dakika). Çıktıda şunlar yer alır:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOi...
service_role key: eyJhbGciOi...
Studio URL: http://127.0.0.1:54323
```

### 2.3 Migration ve seed

```bash
supabase db reset
```

Bu komut sırasıyla:
1. Veritabanını sıfırlar,
2. `supabase/migrations/0001…0013` dosyalarını uygular,
3. `supabase/seed/seed.sql` dosyasını yükler.

> **Uyarı:** `supabase/seed/seed.sql` **üretilen** bir dosyadır. Elle düzenlemeyin.
> Seed verisini değiştirmek için `packages/core/src/seed/` içindeki kaynakları
> düzenleyip `npm run seed:sql` çalıştırın.

### 2.4 Ortam değişkenleri

```bash
cp .env.example .env.local
```

`.env.local` içinde:

```bash
HG_DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase start çıktısındaki anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase start çıktısındaki service_role key>
HG_SESSION_SECRET=<en az 32 karakter rastgele değer>
```

Rastgele secret üretmek için:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Ardından:

```bash
npm run dev
```

Üstteki "Demo modu" bandı kaybolduysa Supabase'e bağlanmışsınızdır.

### 2.5 RLS testleri

```bash
npm run test:rls
```

Supabase CLI kurulu değilse komut uyarı verip atlar (docs/KNOWN_LIMITATIONS.md L-14).

### 2.6 Durdurma

```bash
supabase stop           # veriler korunur
supabase stop --no-backup   # veriler silinir
```

---

## 3. Supabase bulut

1. [supabase.com](https://supabase.com) üzerinde **ücretsiz** bir proje oluşturun.
2. Projeyi bağlayın ve migration'ları uygulayın:

   ```bash
   supabase link --project-ref <proje-ref>
   supabase db push
   ```

3. Seed'i yükleyin (yalnızca demo/staging ortamında — **üretimde çalıştırmayın**):

   ```bash
   supabase db execute --file supabase/seed/seed.sql
   ```

4. `.env.local` (ya da dağıtım sağlayıcınızın ortam değişkenleri):

   ```bash
   HG_DATA_SOURCE=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://<proje-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   NEXT_PUBLIC_SITE_URL=https://<alan-adiniz>
   NEXT_PUBLIC_ENVIRONMENT=production
   HG_SESSION_SECRET=<en az 32 karakter>
   ```

> `SUPABASE_SERVICE_ROLE_KEY` RLS'i tamamen atlar. Yalnızca sunucu tarafında
> kullanın, istemciye asla göndermeyin ve repoya asla yazmayın.

---

## 4. Ortam değişkenleri sözlüğü

Tam liste ve açıklamalar için `.env.example` dosyasına bakın. Özet:

| Değişken | Zorunlu | Varsayılan | Ne işe yarar |
| --- | --- | --- | --- |
| `HG_DATA_SOURCE` | Hayır | `auto` | `auto` / `demo` / `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | Hayır | — | Supabase API adresi |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Hayır | — | İstemci anahtarı (RLS geçerli) |
| `SUPABASE_SERVICE_ROLE_KEY` | Hayır | — | Sunucu anahtarı (RLS atlar) |
| `NEXT_PUBLIC_SITE_URL` | Hayır | `http://localhost:3000` | Canonical, sitemap, OG |
| `NEXT_PUBLIC_ENVIRONMENT` | Hayır | `development` | `production` dışında robots kapalı |
| `HG_SESSION_SECRET` | Üretimde evet | dev değeri | Oturum ve misafir çerezi imzası |
| `GOOGLE_CLIENT_ID` / `SECRET` | Hayır | — | Yoksa Google butonu gösterilmez |
| `EXPO_PUBLIC_*` | Hayır | — | Mobil karşılıkları |

**Hiçbir değişken zorunlu değildir.** Eksik anahtar uygulamayı çökertmez; ilgili
özellik güvenli biçimde kapanır (docs/DECISIONS.md D-004, D-023).

---

## 5. Mobil uygulama

```bash
npm run dev:mobile
```

- Telefonunuza **Expo Go** kurun, QR kodu okutun.
- Emülatör için terminalde `a` (Android) veya `i` (iOS) tuşlayın.
- Mobil de varsayılan olarak demo veri kaynağını kullanır.
- Supabase'e bağlamak için `apps/mobile/.env` içine `EXPO_PUBLIC_SUPABASE_URL`
  ve `EXPO_PUBLIC_SUPABASE_ANON_KEY` yazın.

> Telefon ile bilgisayar **aynı ağda** olmalıdır. Kurumsal/misafir Wi-Fi ağları
> cihaz izolasyonu uygulayabilir; bu durumda `npx expo start --tunnel` kullanın.

APK üretimi için: [BUILD_ANDROID.md](BUILD_ANDROID.md).

---

## 6. Sorun giderme

| Belirti | Neden / Çözüm |
| --- | --- |
| `EADDRINUSE :3000` | Port dolu. `npm run dev -- --port 3001` |
| Sayfa açılıyor ama butonlar tepkisiz | Tarayıcı konsolunda CSP hatası var mı bakın (docs/DECISIONS.md D-031) |
| "Demo modu" bandı Supabase'e rağmen görünüyor | `.env.local` okunmuyor. Dosya adı doğru mu? Sunucuyu yeniden başlattınız mı? |
| `supabase start` Docker hatası | Docker Desktop açık ve çalışır durumda olmalı |
| `supabase db reset` seed hatası | `npm run seed:sql` ile seed'i yeniden üretin |
| Expo Go bağlanmıyor | Aynı ağda olun ya da `npx expo start --tunnel` |
| Metro "unable to resolve" | `npx expo start -c` (cache temizler) |
| Playwright tarayıcı bulamıyor | `npx playwright install` |
| E2E testleri eski davranışı gösteriyor | Port 3210'da eski bir sunucu açık olabilir; kapatın |
