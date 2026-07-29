# Bilgi Mimarisi — HazırGrup

## 1. Mobil Uygulama

### 1.1. Alt Menü (Tab Bar)

| # | Sekme | Route | Ana işlem |
| - | --- | --- | --- |
| 1 | Ana Sayfa | `/(tabs)/index` | Yeni plan oluştur |
| 2 | Planlarım | `/(tabs)/plans` | Planı aç |
| 3 | Yeni Plan | `/(tabs)/new` | Sihirbazı başlat |
| 4 | Rezervasyonlar | `/(tabs)/reservations` | Rezervasyonu aç |
| 5 | Profil | `/(tabs)/profile` | Ayarlar |

### 1.2. Ekran Ağacı

```
(auth)
  sign-in
  sign-up
  forgot-password
  reset-password
onboarding
  city  → district → interests
(tabs)
  index                Ana sayfa
  plans                Planlarım  [Aktif · Yaklaşan · Geçmiş · Taslaklar]
  new                  Plan sihirbazı (7 adım, tek route + step state)
  reservations         Rezervasyonlar [Bekleyen · Onaylanan · Geçmiş · İptal]
  profile              Profil
plan/[id]              Plan detayı
plan/[id]/invite       Davet et
plan/[id]/packages     Uygun paketler
plan/[id]/compare      Paket karşılaştırma
plan/[id]/vote         Oylama
plan/[id]/result       Oylama sonucu
plan/[id]/reserve      Rezervasyon talebi
plan/[id]/settings     Plan ayarları
package/[id]           Paket detayı
business/[id]          Mekân detayı
reservation/[id]       Rezervasyon detayı
notifications          Bildirim merkezi
help                   Yardım merkezi (aranabilir)
help/[slug]            Yardım makalesi
settings/notifications
settings/theme
settings/account       Hesabı sil / çıkış
legal/[slug]           KVKK · Gizlilik · Kullanım koşulları
```

### 1.3. Ana Sayfa Blokları (sırayla)

1. Karşılama — "Merhaba {ad}" + seçili şehir/ilçe.
2. **Yeni plan oluştur** (birincil, belirgin).
3. Devam eden plan kartı (varsa) + sıradaki adım etiketi.
4. Cevaplanması gereken davetler.
5. Yaklaşan rezervasyon.
6. Son kullanılan kategoriler (hızlı başlangıç).
7. Yardım kartı ("HazırGrup nasıl çalışır?").

Ana sayfa **sosyal akış değildir**; sonsuz liste ve içerik beslemesi yoktur.

### 1.4. Ekran Başına Tek Ana İşlem

| Ekran | Ana işlem |
| --- | --- |
| Ana sayfa | Yeni plan oluştur |
| Plan sihirbazı | Devam et |
| Plan özeti | Arkadaşlarını davet et |
| Paket listesi | Paketleri karşılaştır |
| Oylama | Oyunu kullan |
| Oylama sonucu | Rezervasyon talebi gönder |
| Rezervasyon | Mekânla iletişime geç |

İkincil işlemler görsel olarak geri planda (tertiary/ghost buton, alt menü).

---

## 2. Web Uygulaması

### 2.1. Route Haritası

| Route | Tip | Robots |
| --- | --- | --- |
| `/` | Landing | index |
| `/nasil-calisir` | İçerik | index |
| `/sehirler` | Liste | index |
| `/[city]` | Şehir landing | index (yeterli içerik varsa) |
| `/[city]/[district]` | İlçe landing | index (yeterli içerik varsa) |
| `/kategoriler` | Kategori listesi | index |
| `/kategoriler/[slug]` | Kategori landing | index |
| `/mekanlar/[slug]` | Public işletme | index (doğrulanmışsa) |
| `/paketler/[slug]` | Public paket | index (aktif + public ise) |
| `/rehber` | Rehber listesi | index |
| `/rehber/[slug]` | Kullanım senaryosu | index |
| `/sss` | SSS | index |
| `/yardim/[slug]` | Public yardım | index |
| `/legal/[slug]` | KVKK/gizlilik/koşullar | index |
| `/davet/[token]` | Misafir davet | **noindex, nofollow** |
| `/auth/*` | Giriş/kayıt | **noindex** |
| `/hesap/*` | Kullanıcı hesabı | **noindex** |
| `/business/*` | İşletme paneli | **noindex** |
| `/admin/*` | Yönetici paneli | **noindex** |
| `/sitemap.xml` | Dinamik sitemap | — |
| `/robots.txt` | Dinamik robots | — |

Kök seviyedeki `[city]` dinamik segmenti, statik segmentlerle (`nasil-calisir`, `sehirler`,
`admin`, ...) çakışmaz: Next.js statik segmenti önceler. Ek güvenlik için `RESERVED_SLUGS`
listesi kontrol edilir ve eşleşen istekler 404 döner.

### 2.2. Dahili Linkleme Grafiği

```
/  ─┬─ /sehirler ── /[city] ─┬─ /[city]/[district] ─┬─ /mekanlar/[slug] ── /paketler/[slug]
    │                        │                      └─ /paketler/[slug]
    │                        ├─ /kategoriler/[slug]
    │                        └─ /rehber/[slug]
    ├─ /nasil-calisir
    ├─ /kategoriler ── /kategoriler/[slug] ── /mekanlar/[slug]
    ├─ /rehber ── /rehber/[slug]
    └─ /sss ── /yardim/[slug]
```

Her paket sayfasından: mekân, şube ilçesi, şehir, kategori ve benzer paketlere link verilir.
Breadcrumb tüm public derin sayfalarda bulunur.

---

## 3. Plan Durum Modeli

| Durum | Kod | İkon | Kullanıcıya mesaj | Sonraki adım |
| --- | --- | :-: | --- | --- |
| Taslak | `draft` | ✏️ | Planın henüz oluşturulmadı | Sihirbazı tamamla |
| Arkadaşlar bekleniyor | `awaiting_participants` | 👥 | Davet ettiklerin cevap bekliyor | Arkadaşlarını davet et |
| Katılım netleştiriliyor | `confirming_participation` | ✅ | Kimlerin geleceği netleşiyor | Katılımı kapat |
| Paketler hazır | `packages_ready` | 📦 | Grubuna uygun paketler bulundu | Oylamayı başlat |
| Oylama devam ediyor | `voting` | 🗳️ | Arkadaşların oy kullanıyor | Oyunu kullan |
| Oylama tamamlandı | `voting_closed` | 🏆 | Kazanan paket belli | Rezervasyon talebi gönder |
| Rezervasyon onayı bekleniyor | `reservation_pending` | ⏳ | İşletmenin onayı bekleniyor | Mekânla iletişime geç |
| Rezervasyon onaylandı | `reservation_confirmed` | 🎉 | Rezervasyonun onaylandı | Rezervasyon detayını gör |
| Tamamlandı | `completed` | ✔️ | Plan tamamlandı | — |
| İptal edildi | `cancelled` | ⛔ | Plan iptal edildi | Yeni plan oluştur |

Durumlar **yalnızca renkle** anlatılmaz: ikon + metin + kısa açıklama birlikte kullanılır.

## 4. Rezervasyon Durum Modeli

`created` → `pending_business` → `confirmed` | `rejected` | `cancelled_by_user` |
`cancelled_by_business` → `completed` | `no_show`

## 5. Bildirim Tipleri

### Kullanıcı
`participant_joined`, `participation_changed`, `vote_cast`, `voting_ending_soon`,
`voting_closed`, `reservation_submitted`, `reservation_confirmed`, `reservation_rejected`,
`reservation_reminder`, `plan_cancelled`

### İşletme
`new_reservation_request`, `reservation_updated`, `reservation_cancelled_by_user`,
`upcoming_reservation`

Her tip için kanal tercihleri: `in_app`, `push`, `email` (Faz 1'de `in_app` her zaman açık).

## 6. Boş Durum İçerikleri

| Bağlam | Metin | Aksiyon |
| --- | --- | --- |
| Plan yok | İlk planını oluştur ve arkadaşlarını tek bağlantıyla davet et. | Yeni plan oluştur |
| Paket yok | Bütçeyi, kişi sayısını veya saati değiştirerek daha fazla paket görebilirsin. | Filtreleri gevşet |
| Rezervasyon yok | Oylaması biten planından rezervasyon oluşturabilirsin. | Planlarıma git |
| Davetli yok | WhatsApp bağlantısını paylaşarak arkadaşlarını plana çağır. | Bağlantıyı paylaş |
| Bildirim yok | Yeni bir hareket olduğunda burada göreceksin. | Ana sayfaya dön |
| Taslak yok | Yarım kalan planın yok. | Yeni plan oluştur |
| Favori yok | Beğendiğin paketleri kaydederek burada topla. | Paketlere göz at |

## 7. Yardım Merkezi Konuları

1. Plan nasıl oluşturulur?
2. Arkadaşlar nasıl davet edilir?
3. Oy nasıl değiştirilir?
4. Kişi sayısı değişirse ne olur?
5. Fiyat neden değişti?
6. Rezervasyon nasıl çalışır?
7. İşletme rezervasyonu reddederse ne olur?
8. Davet bağlantım çalışmıyor.
9. Hesabımı nasıl silerim?

Yardım merkezi aranabilir; her makale kısa ve tek konuludur. Public kopyaları
`/yardim/[slug]` altında indekslenir.
