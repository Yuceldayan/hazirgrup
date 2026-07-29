# Android derleme rehberi

Bu doküman `apps/mobile` Expo uygulamasından yüklenebilir bir Android paketi
üretmeyi anlatır.

> **Kapsam notu:** Bu depoda Google Play hesabı, imzalama anahtarı ya da EAS
> projesi **yoktur** ve oluşturulamaz (ücretli/hesap gerektiren adımlar kapsam
> dışıdır). Aşağıdaki adımlar kendi hesabınızla çalıştırılmak üzere yazılmıştır.
> Hesap gerektirmeyen **yerel derleme** yolu (Yol B) hiçbir ücretli servise
> ihtiyaç duymaz.

---

## 0. Uygulama kimliği

`apps/mobile/app.json` içinde tanımlı:

| Alan | Değer |
| --- | --- |
| `name` | HazırGrup |
| `slug` | hazirgrup |
| `android.package` | `app.hazirgrup.mobile` |
| `android.versionCode` | 1 |
| `version` | 1.0.0 |
| `scheme` | `hazirgrup` |

**Yayına çıkmadan önce mutlaka değiştirin:**

- `extra.eas.projectId` — şu an `00000000-0000-0000-0000-000000000000`
  yer tutucudur. `eas init` bunu kendisi doldurur.
- `android.intentFilters[].data.host` — şu an `hazirgrup.app`. Davet
  bağlantılarının uygulamada açılması için **kendi alan adınız** olmalıdır.

---

## Yol A — EAS Build (bulut, Expo hesabı gerekir)

Expo'nun ücretsiz katmanı sıraya girerek derleme yapmanıza izin verir.

### A.1 Hazırlık

```bash
npm install -g eas-cli
eas login                       # Expo hesabı
cd apps/mobile
eas init                        # projectId üretir ve app.json'a yazar
```

### A.2 Derleme profilleri

`apps/mobile/eas.json` **depoda hazırdır**; üç profil tanımlıdır:

| Profil | Çıktı | Dağıtım | Not |
| --- | --- | --- | --- |
| `development` | APK | internal | Geliştirme istemcisi, `EXPO_PUBLIC_DATA_SOURCE=demo` |
| `preview` | APK | internal | Cihaza doğrudan kurulan test paketi |
| `production` | AAB | store | `autoIncrement: true` — `versionCode` otomatik artar |

`preview` ve `production` profilleri `EXPO_PUBLIC_SITE_URL` değerini
`https://hazirgrup.app` olarak veriyor. **Kendi alan adınızla değiştirin.**

### A.3 Test APK'sı (cihaza doğrudan kurulur)

```bash
eas build --platform android --profile preview
```

Derleme bitince indirme bağlantısı verilir. APK'yı telefona kurmak için
**Ayarlar → Güvenlik → Bilinmeyen kaynaklar** iznini açmanız gerekir.

### A.4 Play Store paketi (AAB)

```bash
eas build --platform android --profile production
```

İlk çalıştırmada EAS bir **upload keystore** üretmeyi teklif eder; kabul edin.
Bu anahtar Expo tarafında saklanır ve **kaybedilirse uygulama güncellenemez**.
Yedeğini almak için:

```bash
eas credentials
```

---

## Yol B — Yerel derleme (hesap gerekmez)

Hiçbir bulut servisi kullanılmaz. Android Studio ve JDK yeterlidir.

### B.1 Ön koşullar

| Araç | Sürüm |
| --- | --- |
| JDK | 17 |
| Android Studio | güncel (SDK 35+, Build Tools, Platform Tools) |
| `ANDROID_HOME` | SDK yolunu gösterir |

### B.2 Native projeyi üret

```bash
cd apps/mobile
npx expo prebuild --platform android --clean
```

Bu komut `apps/mobile/android/` klasörünü üretir. Klasör depoya **eklenmez**;
`app.json` tek gerçek kaynaktır (bkz. docs/DECISIONS.md).

### B.3 Debug APK

```bash
cd android
./gradlew assembleDebug          # Windows: .\gradlew.bat assembleDebug
```

Çıktı: `android/app/build/outputs/apk/debug/app-debug.apk`

Bağlı cihaza kurmak için:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### B.4 İmzalı release APK

Keystore üretin (**parolayı güvenli saklayın, repoya yazmayın**):

```bash
keytool -genkeypair -v \
  -keystore hazirgrup-upload.keystore \
  -alias hazirgrup \
  -keyalg RSA -keysize 2048 -validity 10000
```

`android/gradle.properties` içine ekleyin (bu dosya **sürüm kontrolüne girmemeli**):

```properties
HAZIRGRUP_UPLOAD_STORE_FILE=hazirgrup-upload.keystore
HAZIRGRUP_UPLOAD_KEY_ALIAS=hazirgrup
HAZIRGRUP_UPLOAD_STORE_PASSWORD=****
HAZIRGRUP_UPLOAD_KEY_PASSWORD=****
```

`android/app/build.gradle` içinde `signingConfigs.release` bloğunu bu
değişkenlere bağlayın, sonra:

```bash
./gradlew assembleRelease        # APK
./gradlew bundleRelease          # AAB (Play Store)
```

Çıktılar:
- `android/app/build/outputs/apk/release/app-release.apk`
- `android/app/build/outputs/bundle/release/app-release.aab`

---

## Ortam değişkenleri

Expo derleme sırasında yalnızca `EXPO_PUBLIC_` önekli değişkenleri paketler.

`apps/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SITE_URL=https://<alan-adiniz>
EXPO_PUBLIC_DATA_SOURCE=auto
EXPO_PUBLIC_PUSH_ENABLED=false
```

Boş bırakılırsa uygulama demo veri kaynağıyla derlenir ve **çalışır** — bu,
tanıtım/derleme doğrulaması için kasıtlı bir davranıştır.

> `EXPO_PUBLIC_` değişkenleri **paketin içine gömülür** ve okunabilir.
> `SUPABASE_SERVICE_ROLE_KEY` gibi gizli anahtarları **asla** buraya koymayın.

---

## Derleme öncesi kontrol listesi

- [ ] `npm run verify` temiz (lint + typecheck + test)
- [ ] `npx expo-doctor` uyarısız
- [ ] `app.json` → `extra.eas.projectId` gerçek değerle değiştirildi
- [ ] `app.json` → `intentFilters` host'u kendi alan adınız
- [ ] `eas.json` → `preview`/`production` içindeki `EXPO_PUBLIC_SITE_URL` kendi alan adınız
- [ ] `android.versionCode` bir önceki sürümden büyük
      (`production` profilinde `autoIncrement` bunu üstlenir)
- [ ] `version` (semver) güncellendi
- [ ] `.env` içinde gizli anahtar **yok**
- [ ] Keystore yedeklendi ve repoya **girmedi**
- [ ] [MOBILE_QA_CHECKLIST.md](MOBILE_QA_CHECKLIST.md) gerçek cihazda tamamlandı

---

## Sık karşılaşılan hatalar

| Hata | Çözüm |
| --- | --- |
| `SDK location not found` | `ANDROID_HOME` tanımlayın ya da `android/local.properties` içine `sdk.dir=...` yazın |
| `Unsupported class file major version` | JDK 17 kullanın (`java -version`) |
| `Duplicate class` / eski artıklar | `npx expo prebuild --clean` |
| Metro "unable to resolve" | `npx expo start -c` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Farklı imzayla kurulu eski sürüm var: `adb uninstall app.hazirgrup.mobile` |
| Davet bağlantısı uygulamada açılmıyor | `intentFilters` host'u yayındaki alan adıyla aynı olmalı ve `assetlinks.json` sunulmalı |
