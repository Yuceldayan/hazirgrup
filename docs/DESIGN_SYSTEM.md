# Tasarım Sistemi — HazırGrup

Ürün genç, modern ve profesyonel görünmelidir. Çocukça, aşırı renkli veya şablon hissi
vermez. Tek kaynak: `packages/ui/src/tokens/`.

---

## 1. Renk

### Marka

| Token | Açık tema | Koyu tema | Kullanım |
| --- | --- | --- | --- |
| `brand.50` | `#EEF2FF` | `#1A1D3A` | Çok hafif zemin |
| `brand.100` | `#E0E7FF` | `#22265066` | Rozet zemini |
| `brand.500` | `#4F46E5` | `#6366F1` | Birincil aksiyon |
| `brand.600` | `#4338CA` | `#4F46E5` | Hover |
| `brand.700` | `#3730A3` | `#4338CA` | Basılı |
| `accent.500` | `#F97316` | `#FB923C` | Vurgu, "kazanan" durumu |

### Nötr

`neutral.0 … neutral.1000` — 12 basamaklı gri ölçeği. Açık temada `0` beyaz, koyu temada
otomatik ters çevrilir (semantik token katmanı üzerinden).

### Semantik

| Token | Anlam | Açık | Koyu |
| --- | --- | --- | --- |
| `bg.canvas` | Sayfa zemini | `#FFFFFF` | `#0B0D17` |
| `bg.surface` | Kart | `#FFFFFF` | `#151827` |
| `bg.raised` | Yükseltilmiş kart | `#F8FAFC` | `#1D2133` |
| `bg.subtle` | Bölüm zemini | `#F1F5F9` | `#11141F` |
| `text.primary` | Ana metin | `#0F172A` | `#F1F5F9` |
| `text.secondary` | İkincil | `#475569` | `#94A3B8` |
| `text.muted` | Yardımcı | `#64748B` | `#64748B` |
| `text.inverse` | Koyu zemin üstü | `#FFFFFF` | `#0B0D17` |
| `border.default` | Kenarlık | `#E2E8F0` | `#252A3D` |
| `border.strong` | Belirgin kenarlık | `#CBD5E1` | `#333A52` |
| `focus.ring` | Odak halkası | `#4F46E5` | `#818CF8` |

### Durum

| Token | Renk (açık) | Kullanım |
| --- | --- | --- |
| `success` | `#059669` | Onaylandı, tamamlandı |
| `warning` | `#D97706` | Bekliyor, dikkat |
| `danger` | `#DC2626` | Hata, iptal, ret |
| `info` | `#0284C7` | Bilgilendirme |

Her durum için `.bg`, `.border`, `.text` varyantı vardır.

**Kontrast kuralı:** Metin/zemin kombinasyonları en az **4.5:1**, büyük metin **3:1**.
Bu, `packages/ui/src/tokens/__tests__/contrast.test.ts` ile otomatik doğrulanır.

**Durum yalnızca renkle anlatılmaz:** her durum rozetinde ikon + metin bulunur.

---

## 2. Tipografi

| Token | Boyut / Satır | Ağırlık | Kullanım |
| --- | --- | --- | --- |
| `display` | 32 / 38 | 700 | Landing başlığı |
| `h1` | 26 / 32 | 700 | Ekran başlığı |
| `h2` | 20 / 26 | 600 | Bölüm başlığı |
| `h3` | 17 / 24 | 600 | Kart başlığı |
| `body` | 15 / 22 | 400 | Gövde |
| `bodyStrong` | 15 / 22 | 600 | Vurgulu gövde |
| `small` | 13 / 18 | 400 | Yardımcı metin |
| `caption` | 12 / 16 | 500 | Etiket, rozet |
| `mono` | 14 / 20 | 500 | Rezervasyon kodu |

**Font:** sistem font yığını (`-apple-system, Segoe UI, Roboto, ...`). Harici font
yüklenmez → CLS ve LCP riski sıfır, ek istek yok. (D-009)

**Ölçeklenme:** Mobilde sistem yazı büyüklüğü ayarına uyum (`allowFontScaling`, maksimum
1.4× ile sınırlı ki düzen bozulmasın). Webde `rem` tabanlı.

---

## 3. Spacing

4 px tabanlı ölçek: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`
→ token adları: `space.0 … space.12`.

**Kurallar:** Kart içi padding `space.16`; bölüm arası `space.24`; ekran kenar boşluğu
`space.16` (mobil), `space.24` (web ≥768px).

---

## 4. Radius

| Token | Değer | Kullanım |
| --- | --- | --- |
| `radius.sm` | 6 | Rozet, input |
| `radius.md` | 10 | Buton |
| `radius.lg` | 14 | Kart |
| `radius.xl` | 20 | Modal, bottom sheet |
| `radius.full` | 999 | Avatar, pill |

---

## 5. Elevation

| Token | Web (`box-shadow`) | Mobil (`elevation`) |
| --- | --- | --- |
| `elevation.0` | none | 0 |
| `elevation.1` | `0 1px 2px rgba(15,23,42,.06)` | 1 |
| `elevation.2` | `0 2px 8px rgba(15,23,42,.08)` | 3 |
| `elevation.3` | `0 8px 24px rgba(15,23,42,.12)` | 8 |

Koyu temada gölge yerine kenarlık kontrastı artırılır.

---

## 6. Bileşenler

### Buton

| Varyant | Kullanım | Görünüm |
| --- | --- | --- |
| `primary` | Ekranın tek ana işlemi | Dolu marka rengi |
| `secondary` | İkincil işlem | Kenarlıklı, şeffaf zemin |
| `ghost` | Üçüncül | Yalnızca metin |
| `danger` | Yıkıcı işlem | Dolu kırmızı |

Boyutlar: `sm` (36px), `md` (44px), `lg` (52px). **Minimum dokunma alanı 44×44 px.**
Durumlar: default, hover, pressed, focus-visible, disabled, loading (spinner + metin korunur).

### Input

Etiket **her zaman** görünür (placeholder etiket yerine kullanılmaz). Yapı:

```
Etiket
[ alan ]           ← 48px yükseklik
Yardımcı metin / hata mesajı
```

Hata durumunda: kırmızı kenarlık + hata ikonu + metin; `aria-invalid` + `aria-describedby`.
Mobilde alan tipine göre klavye (`numeric`, `email-address`, `default`).

### Kart

`bg.surface` + `radius.lg` + `elevation.1` + `border.default`. Tıklanabilir kartta
tüm alan dokunulabilir, focus halkası kart çevresinde.

### Rozet (Badge)

`neutral`, `success`, `warning`, `danger`, `info`, `brand`. İkon + metin. `radius.full`.
Eşleşme rozetleri: `Bütçene uygun`, `7 kişilik grubuna uygun`, `Seçtiğin saatte geçerli`,
`İlçende`.

### Modal / Bottom Sheet

Mobilde bottom sheet, webde ortalanmış modal. Odak tuzağı, `Esc` ile kapanma,
arka plan scroll kilidi, `role="dialog"` + `aria-modal`.

### Boş Durum (Empty State)

İkon + başlık + açıklama + **her zaman bir aksiyon butonu**. Metinler
`docs/INFORMATION_ARCHITECTURE.md` §6'daki tablodan gelir.

### Skeleton

Gerçek içerikle **aynı yükseklikte** olur (CLS koruması). Liste, kart, metin ve
avatar varyantları. Nabız animasyonu `prefers-reduced-motion` ile kapanır.

### Toast

`success`, `error`, `info`. Ekranın altında (mobil), sağ üstte (web). 4 sn otomatik kapanır,
hata toast'ı manuel kapanır. `role="status"` / `role="alert"`.

### Durum Rozeti (Plan / Rezervasyon)

İkon + kısa metin + renk. Renk tek başına anlam taşımaz.

---

## 7. Her Ekran İçin Zorunlu Haller

Her ekran şu hallerde tasarlanır ve uygulanır:

| Hal | Gereklilik |
| --- | --- |
| **Loading** | Skeleton (spinner yalnızca aksiyon içi) |
| **Empty** | Açıklayıcı metin + aksiyon |
| **Error** | Anlaşılır Türkçe mesaj + `Tekrar dene` |
| **Success** | Onay geri bildirimi + sıradaki adım |
| **Disabled** | Neden devre dışı olduğu açıklanır |

---

## 8. Düzen

- **Mobil öncelikli.** Kırılımlar: `sm 480`, `md 768`, `lg 1024`, `xl 1280`.
- Mobil safe area: `useSafeAreaInsets`; alt menü ve birincil buton safe area üstünde.
- Klavye yönetimi: `KeyboardAvoidingView`, form alanı klavye açılınca görünür kalır.
- Web'de içerik maksimum genişlik `1120px`, metin blokları `72ch`.

---

## 9. Hareket

| Süre | Kullanım |
| --- | --- |
| 120 ms | Basma geri bildirimi |
| 200 ms | Geçiş, açılır kapanır |
| 300 ms | Sayfa geçişi |

Easing: `cubic-bezier(0.2, 0, 0, 1)`. `prefers-reduced-motion: reduce` durumunda tüm
süreler 0'a iner.

---

## 10. Erişilebilirlik Kuralları

1. Dokunma alanı ≥ 44×44 px.
2. Metin kontrastı ≥ 4.5:1 (büyük metin 3:1) — otomatik test edilir.
3. Kritik bilgi yalnızca ikonla verilmez; metin eşlik eder.
4. Sistem yazı büyüklüğüne uyum (maks. 1.4×).
5. Form etiketi placeholder ile değiştirilmez.
6. Web panelinde tam klavye navigasyonu; mantıklı tab sırası.
7. `:focus-visible` halkası her zaman görünür, 2px + 2px offset.
8. Form hataları `aria-live="polite"` bölgesiyle duyurulur.
9. Görsellerde anlamlı `alt`; dekoratif görseller `alt=""`.
10. Sayfa başına tek `h1`, başlık hiyerarşisi atlanmaz.
11. Renk körlüğü: durum ikonları biçim olarak da farklıdır (✓ ⏳ ⛔ ⚠).

---

## 11. İçerik ve Ton

- Sen dili, samimi ama profesyonel: "Planını oluştur", "Arkadaşlarını davet et".
- Teknik hata metni gösterilmez. ❌ "500 Internal Server Error"
  ✅ "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dener misin?"
- Buton metni fiil ile başlar: "Planı oluştur", "Oyunu kullan", "Talebi gönder".
- Sayı ve para birimi Türkçe biçimlendirilir: `1.250 ₺`, `kişi başı 250 ₺`.
- Tarih: `12 Ağustos Salı`, saat: `20:00`.

Biçimlendirme yardımcıları: `packages/core/src/format/` (testli).

---

## 12. Token Dağıtımı

```
packages/ui/src/tokens/*.ts   ← tek kaynak (TypeScript)
        │
        ├─ apps/web    : scripts/generate-css-vars.ts → src/styles/tokens.css
        └─ apps/mobile : doğrudan import → StyleSheet / tema sağlayıcısı
```

Token değeri elle CSS'e veya StyleSheet'e yazılmaz; her zaman token üzerinden gelir.
Bu kural ESLint kuralıyla değil, kod incelemesi ve `tokens.css` üretiminin build
adımına bağlanmasıyla korunur.
