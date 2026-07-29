# İlerleme — HazırGrup

Her faz sonunda `npm run lint && npm run typecheck && npm test` çalıştırılır ve
sonucu buraya yazılır. Faz sırasında bulunan **gerçek hatalar** da kayda geçer;
neyin nasıl yakalandığı, hangi testin işe yaradığını gösterir.

**Son durum:** Tüm fazlar tamamlandı.
`lint` temiz · `typecheck` temiz · **479** birim/entegrasyon testi · **44** E2E testi.

---

## Faz 0 — Analiz ve temel

**Durum:** ✅ Tamamlandı

- Mevcut dizin incelendi: **boş**. Korunacak kod veya kullanıcı dosyası yok;
  sıfırdan monorepo kuruldu.
- Ortam: Node v22.18.0, npm 10.9.3, Windows 11.
- npm registry erişimi doğrulandı.
- 15 planlama dokümanı yazıldı (ürün, akış, mimari, şema, güvenlik, SEO,
  tasarım, test, plan, kararlar, sınırlar, kontrol listesi, yol haritası).

---

## Faz 1 — Monorepo ve paylaşılan paketler

**Durum:** ✅ Tamamlandı

- npm workspaces: `packages/*`, `apps/web`, `apps/mobile`.
- TypeScript 5.9.3 `strict` + `noUncheckedIndexedAccess`, ESLint 9 flat config,
  Prettier, Vitest 4.
- `@hazirgrup/types` — domain tipleri.
- `@hazirgrup/ui` — tasarım tokenları (tek kaynak).
- `@hazirgrup/validation` — Zod 4 şemaları.
- `@hazirgrup/core` — bütçe, slug, kripto, oran sınırı, durum makineleri.

**Bulunan hatalar**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| Koyu temada beyaz/`brand-400` kontrastı 2.98:1 (WCAG altı) | Otomatik kontrast testi | `textOnBrand` → `neutral[950]`, `dangerSolid` → `red[600]` |
| SHA-256 dolgusunda off-by-one (uzunluk 55'te yanlış özet) | Node `crypto` ile bayt bayt karşılaştırma testi | Dolgu hesabı `((len+72)>>6)<<6` olarak düzeltildi |
| Zod 4'te `.partial()` refine edilmiş şemada hata veriyor | Şema testi | Refine edilmemiş `planFieldsSchema` ayrıştırıldı |
| `z.string().datetime()` kullanımdan kalktı | Lint/typecheck | `z.iso.datetime()` |
| `rootDir` paketler arası yol aliaslarını bozdu | Typecheck | Paket `tsconfig`'lerinden kaldırıldı |

---

## Faz 2 — Veritabanı

**Durum:** ✅ Tamamlandı

- **13 migration** (`0001_extensions` … `0013_rls`): şema, enum'lar, kimlik,
  konum, işletme, paketler, planlar, oylama, rezervasyonlar, destek tabloları,
  gelir şeması, indeksler, RLS.
- Durum geçişleri veritabanı trigger'larıyla da korunuyor
  (`plans_guard_status`, `reservations_guard_status`) — TS durum makinelerinin aynası.
- `votes` tablosunda katılımcı başına tek oy kısıtı.
- `increment_rate_limit()` ve `increment_invitation_use()` SECURITY DEFINER fonksiyonları.
- RLS yardımcıları: `auth_has_role`, `auth_is_admin`, `auth_is_business_member`,
  `auth_is_business_owner`, `auth_is_plan_owner`, `auth_is_plan_participant`.
- Migration'lar geri dönüşü düşünülerek yazıldı: yıkıcı `DROP` yok.

---

## Faz 3 — Veri katmanı ve seed

**Durum:** ✅ Tamamlandı

- Adaptör deseni: `createRepository()` → `DemoRepository` | `SupabaseRepository`
  (docs/DECISIONS.md D-004). **Sıfır zorunlu ortam değişkeni.**
- Tek seed kaynağı: `packages/core/src/seed/dataset.ts` hem demo deposunu hem de
  `supabase/seed/seed.sql` dosyasını besliyor (`npm run seed:sql`, D-005).
- Seed: 10 işletme, şubeler, paketler, kategoriler, tercihler, şehir/ilçeler,
  rehber içerikleri, SSS, demo hesaplar.

---

## Faz 4 — Eşleştirme motoru

**Durum:** ✅ Tamamlandı

- Ağırlıklar: bütçe 30, kapasite 20, saat 20, konum 15, tercihler 10, popülerlik 5.
- Katı filtreler elenen adayları `rejections` altında sayıyor; `suggestRelaxations()`
  bunu kullanıcıya "bütçeyi 50 ₺ artırırsan 4 paket daha çıkar" gibi öneriye çeviriyor.
- Para tam sayı kuruş; kişi başı fiyat **yukarı** yuvarlanır (D-014, D-015).

---

## Faz 5 — Web: public site ve SEO

**Durum:** ✅ Tamamlandı

- Next.js 16 App Router, React 19, Turbopack.
- Public rotalar statik/ISR üretiliyor — **79 sayfa** önceden render ediliyor.
- İçerik eşiği: yeterli paket/işletme yoksa sayfa indekslenmiyor.
- JSON-LD: Organization, WebSite, BreadcrumbList, LocalBusiness, Offer, FAQPage, ItemList.
  **Sahte `aggregateRating` asla üretilmiyor.**
- `robots.txt` üretim dışı ortamlarda tüm siteyi kapatıyor.

**Bulunan hatalar**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| Turbopack TS kaynağında `.js` uzantılarını çözemedi | Derleme | 46 dosyada göreli import uzantıları kaldırıldı |
| Next yanlış workspace kökünü seçti (kökte kalmış `package-lock.json`) | Derleme uyarısı | `turbopack: { root: MONOREPO_ROOT }` |
| `@hazirgrup/core` tipleri yeniden ihraç etmiyordu → `getCurrentUser()` `any` oldu ve çıkarım zehirlendi | Typecheck | `export * from '@hazirgrup/types'` |
| `server-only` istemci bileşenlerine sızdı | Derleme | `ActionResult` istemci tarafına, sunucu yardımcıları ayrı dosyaya |
| **Soft 404:** bilinmeyen sayfalar HTTP 200 dönüyordu | Gerçek HTTP başlığı kontrolü | Kök `loading.tsx` kaldırıldı (Suspense sınırı kabuğu erken gönderiyordu) + dinamik rotalarda `generateMetadata` içinde `notFound()` |
| Header oturum okuyordu → her sayfa dinamik oldu, ISR/statik üretim öldü | Derleme çıktısındaki sayfa tipleri | `SiteHeader` oturum okumuyor; "Hesabım" her zaman gösteriliyor (D-020) |

---

## Faz 6 — Web: kullanıcı ve misafir akışı

**Durum:** ✅ Tamamlandı

- 7 adımlı plan sihirbazı; taslak `localStorage`'a yazılıyor.
- Davet: token veritabanında **yalnızca SHA-256 özet** olarak saklanıyor.
- Misafir kimliği imzalı HttpOnly çerez (D-011); hesap gerekmiyor.
- Oylama, oy değiştirme, beraberlik durumunda plan sahibinin seçimi.
- Rezervasyon talebi, durum geçmişi, rezervasyon kodu.

**Bulunan hata**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| Misafir katıldığında plan `packages_ready` aşamasına geçmiyordu | Entegrasyon testi | `joinAsGuest`/`joinAsUser` sonrası `refreshPlanStage` çağrısı (D-016) |

---

## Faz 7 — Web: işletme ve yönetici panelleri

**Durum:** ✅ Tamamlandı

- İşletme: paket yönetimi, şubeler, çalışma saatleri, rezervasyon onay/ret
  (ret gerekçesi zorunlu), çalışan yönetimi.
- Yönetici: başvuru inceleme, kullanıcı/işletme/şehir/kategori yönetimi, denetim kaydı.
- **47 sayfa rotası** toplam.

**Bulunan hata**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| Yetkisiz `/admin` erişimi `AppError` fırlatıp hata sınırına düşüyor ve sonraki testleri kirletiyordu | E2E | `requireRole`/`requireAdmin`/`requireBusinessMember` artık `/yetkisiz` sayfasına yönlendiriyor |

---

## Faz 8 — Mobil uygulama

**Durum:** ✅ Tamamlandı

- Expo SDK 57 + Expo Router, React Native 0.86.2, `expo-secure-store`.
- **17 ekran dosyası**: sekmeler (Keşfet, Planlarım, Yeni, Rezervasyonlar, Profil),
  kimlik doğrulama, plan detayı, rezervasyon detayı, bildirimler, yardım.
- Ekran mantığı saf fonksiyonlara ayrıldı (`src/screens/state.ts`, D-012) —
  **37 birim testi** ile doğrulanıyor.
- Davet derin bağlantısı `intentFilters` ile tanımlı.

**Bulunan hatalar**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| Expo peer bağımlılık çakışmaları | `npm install` | `expo-linking ~57.0.4`, `reanimated ~4.5.3` + `worklets ~0.11.3` + `gesture-handler ~3.1.0` |
| Sekme ikonu parametresi ve kullanılmayan import | Typecheck | `ColorValue` tipi verildi, import kaldırıldı |

---

## Faz 9 — Testler: SEO, güvenlik, E2E

**Durum:** ✅ Tamamlandı

- **479** birim/entegrasyon testi (14 dosya): bütçe, kripto, davet tokenı,
  kontrast, durum makineleri, eşleştirme, SEO kuralları, doğrulama, slug,
  oran sınırı, mobil ekran durumu, tam akış entegrasyonu, güvenlik izinleri.
- **44** Playwright testi: public SEO çıktısı, rota koruma, güvenlik başlıkları,
  mobil misafir akışı ve **10 adımlı kabul akışının tamamı**
  (kayıt → plan → davet → misafir oyu → oylama → rezervasyon → işletme onayı → kullanıcı görür).

**Bulunan hatalar**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| **CSP `script-src 'self'` satır içi RSC betiklerini engelliyordu → hydration HİÇ tamamlanmıyor, tüm istemci etkileşimi ölü** | E2E (sihirbaz adım değiştirmedi) + tarayıcı konsolu | `script-src 'self' 'unsafe-inline'` (D-031, L-15) + hydration'ı doğrulayan regresyon testi |
| `.desktopOnly` sınıfı `.button` ile aynı özgüllükte çakıştı → masaüstü CTA mobilde göründü, 52 px yatay taşma ve mobil menü dokunuşunu engelledi | Mobil E2E (taşma testi) | Sarmalayıcı `<span>` |
| `sm` boyutlu butonlar 36 px < 44 px dokunma alanı | Mobil E2E | `@media (pointer: coarse)` ile 44 px |
| Mobil menü paneli flex aksiyon satırının içinde sıkışıyordu | Menü E2E'si + görsel inceleme | `position: absolute` ile başlığa çapalandı, tam genişlik açılıyor |
| Yetkisiz kullanıcıya ham hata sınırı | E2E | `/yetkisiz` bilgilendirme sayfası |

---

## Faz 10 — Dokümantasyon ve teslim

**Durum:** ✅ Tamamlandı

- `README.md` — tek komutla çalıştırma, demo hesapları, depo yapısı, komutlar.
- `docs/SETUP.md` — demo mod, Supabase local (Docker), Supabase bulut, sorun giderme.
- `docs/DEPLOY_WEB.md` — ortam değişkenleri, sağlayıcılar, dağıtım sonrası doğrulama.
- `docs/BUILD_ANDROID.md` — EAS ve hesap gerektirmeyen yerel derleme yolu.
- `docs/MOBILE_QA_CHECKLIST.md` — 11 başlıkta cihaz test listesi.
- `docs/SCREENSHOTS.md` — 44 ekranın envanteri ve yakalama yöntemi.

**Bulunan hatalar**

| Sorun | Nasıl yakalandı | Çözüm |
| --- | --- | --- |
| `react-hooks` kuralları yalnızca `.tsx` dosyalarına bağlıydı; `.ts` içindeki özel hook'lar denetlenmiyor ve oradaki `eslint-disable` yorumu "rule not found" hatası veriyordu | İlk tam `npm run lint` çalıştırması | Kural bloğu `.ts` dosyalarını da kapsayacak şekilde ayrıldı; `jsx-a11y` yalnızca `.tsx`'te kaldı |

---

## Son kapı

| Kontrol | Sonuç |
| --- | --- |
| `npm run lint` | ✅ 0 hata, 0 uyarı |
| `npm run typecheck` | ✅ 6 workspace temiz |
| `npm test` | ✅ 479/479 |
| `npm run test:e2e` | ✅ 44/44 |
| `npm run build` | ✅ 79 sayfa önceden render |

**Kapsam dışı bırakılanlar** ve gerekçeleri: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) (L-01…L-15).
