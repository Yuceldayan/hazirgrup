# Kullanıcı Akışları — HazırGrup

Her akışta ekranın cevaplaması gereken üç soru: **Neredeyim? Ne yapmalıyım? Sıradaki adım ne?**

---

## A. Kayıt ve İlk Kurulum

```
Açılış → Giriş / Kayıt seçimi
  ├─ Kayıt: ad, e-posta, şifre → Doğrulama → Onboarding
  └─ Giriş: e-posta, şifre → (şifre unuttum → e-posta → sıfırlama)
Onboarding (3 adım)
  1. Şehir seç (varsayılan: aktif tek şehir varsa otomatik)
  2. İlçe seç (opsiyonel, "Farketmez" seçilebilir)
  3. İlgi alanı kategorileri (opsiyonel, atlanabilir)
→ Ana Sayfa
```

**Kurtarma:** Onboarding atlanabilir; eksik tercih plan sihirbazında sorulur.

---

## B. Plan Oluşturma Sihirbazı

```
Ana Sayfa → [Yeni plan oluştur]
  Adım 1/7  Ne zaman?      tarih (Bu akşam · Yarın · Hafta sonu · takvim)
  Adım 2/7  Nerede?        il → ilçe (Farketmez seçilebilir)
  Adım 3/7  Kaç kişisiniz? 2–4 · 5–8 · 9–14 · 15+ · özel; min/max
  Adım 4/7  Bütçeniz?      kişi başı ↔ toplam (çift yönlü canlı hesap)
  Adım 5/7  Ne yapmak      kategori çoklu seçim (kafe/restoran, halı saha, oyun salonu)
            istiyorsunuz?
  Adım 6/7  Tercihler      tercih etiketleri + saat aralığı + esnek saat + kısa not
  Adım 7/7  Plan özeti     → [Planı oluştur]
→ Plan Detayı (durum: Arkadaşlar bekleniyor)
```

**Her adımda:** ilerleme göstergesi (`3/7`), geri butonu, otomatik taslak kaydı,
kısa yardımcı metin, anlık doğrulama, mobil klavye tipi (numeric/date).

**Kurtarma:** Uygulama kapanırsa taslak korunur; `Planlarım → Taslaklar` altından devam edilir.

---

## C. Davet ve Katılım

```
Plan Detayı → [Arkadaşlarını davet et]
  → Davet sayfası: bağlantı + davet kodu + [WhatsApp'ta paylaş] + [Bağlantıyı kopyala]
  → (opsiyonel) [Bağlantıyı yenile]  → eski token geçersiz olur

Misafir tarafı (mobil web, uygulama indirmeden):
  /davet/{token}
    → Plan özeti (ad, tarih, saat, ilçe, katılımcı sayısı)   [kişisel veri yok]
    → "Adın ne?"  → görünen ad
    → Katılım: [Katılıyorum] [Kararsızım] [Katılmıyorum]
    → Paketleri gör → Oy ver → Oyu değiştir → Sonucu gör
```

**Kurtarma:**
- Token geçersiz/iptal → "Bu davet artık geçerli değil" + plan sahibinden yeni bağlantı isteme yönergesi.
- Plan iptal edilmiş → durum açıklaması, oy ekranı gösterilmez.
- Rate limit → "Çok fazla deneme yaptın, biraz sonra tekrar dene."

---

## D. Paket Eşleştirme ve Karşılaştırma

```
Plan Detayı → Uygun paketler
  → Liste: paket kartı (mekân, şube, kişi başı fiyat, toplam, kapasite, eşleşme rozetleri)
  → Sıralama: En uygun · En düşük kişi başı · Bütçeye en yakın · En popüler · Yeni
  → [Paketleri karşılaştır] → yan yana karşılaştırma
  → Paket detayı → içerik, geçerli gün/saat, iptal şartı, iletişim
Sonuç yoksa:
  → "Bütçeyi, kişi sayısını veya saati değiştirerek daha fazla paket görebilirsin."
  → [Bütçeyi genişlet] [Saati esnet] [İlçe kısıtını kaldır] hızlı aksiyonları
```

---

## E. Oylama

```
Plan sahibi → [Oylamayı başlat]  (opsiyonel bitiş zamanı)
  → Durum: Oylama devam ediyor
Katılımcı (kayıtlı veya misafir)
  → Paket listesi → [Oyunu kullan] → seçim → onay
  → Oy değiştirme süresi bitene kadar serbest
  → Realtime: oy sayıları canlı güncellenir
Plan sahibi
  → [Oylamayı bitir] (erken bitirme mümkün)
  → Eşitlik varsa: [Kazananı seç] ekranı (yalnızca eşit olanlar arasından)
  → Durum: Oylama tamamlandı + Kazanan paket
```

**Kurtarma:** Oylama bittiyse oy ekranı yerine sonuç ekranı gösterilir.

---

## F. Rezervasyon

```
Oylama tamamlandı → [Rezervasyon talebi gönder]
  → Özet: paket, şube, tarih/saat, kesin kişi sayısı (düzenlenebilir), toplam + kişi başı
  → İletişim bilgisi + özel not
  → [Talebi gönder]
→ Durum: İşletme onayı bekleniyor
İşletme paneli → Rezervasyon talepleri → [Onayla] / [Reddet + gerekçe]
  ├─ Onaylandı  → kullanıcıya bildirim + rezervasyon kodu
  └─ Reddedildi → kullanıcıya bildirim + gerekçe
                → [Alternatif paketlere dön] (aynı planın diğer eşleşmeleri)
Rezervasyon detayı: durum zaman çizelgesi, [Ara], [WhatsApp], [İptal et]
```

---

## G. İşletme Kaydı

```
/business → [İşletmeni ekle]
  → Başvuru formu: işletme adı, yetkili, telefon, e-posta, adres, il/ilçe,
    kategori, vergi/işletme bilgisi, sosyal medya, logo
  → Durum: İnceleniyor
Yönetici → Başvurular → [Onayla] / [Reddet + gerekçe]
  → Onay: işletme + sahip rolü oluşur → İşletme paneline erişim
İşletme paneli → Şube ekle → Çalışma saatleri → Paket oluştur (şablondan) → Yayınla
```

---

## H. Yönetici Akışları

```
/admin → Sistem özeti
  ├─ Başvurular → doğrula / reddet
  ├─ Şehirler → yeni şehir ekle → is_active / is_public / is_indexable
  ├─ İlçeler → aynı alanlar
  ├─ Kategoriler → ekle / sırala / aktif-pasif
  ├─ Paketler → uygunsuz paketi pasife al
  ├─ Kullanıcılar → askıya al
  ├─ Şikâyet / destek → çöz
  ├─ SEO → başlık, açıklama, slug, canonical override, OG, index/noindex
  └─ Audit log → kim, ne zaman, neyi değiştirdi
```

---

## I. Uçtan Uca Kabul Akışı (E2E)

1. Kullanıcı kayıt olur.
2. Plan oluşturur (7 adım, taslak kaydı doğrulanır).
3. Davet bağlantısını paylaşır.
4. Misafir web üzerinden katılır (hesap açmadan).
5. Paketler görüntülenir (eşleşme gerekçeleriyle).
6. Oy kullanılır; oy değiştirilir.
7. Plan sahibi oylamayı bitirir; kazanan belirlenir.
8. Rezervasyon talebi gönderilir.
9. İşletme onaylar.
10. Kullanıcı rezervasyon durumunu ve zaman çizelgesini görür.

---

## J. Hata ve Kenar Durumları

| Durum | Davranış |
| --- | --- |
| İnternet yok | Form verisi local'de tutulur, `Tekrar dene` gösterilir |
| İstek başarısız | Anlaşılır Türkçe mesaj + `Tekrar dene` |
| Oturum süresi doldu | Veri kaybettirmeden giriş ekranına yönlendir, dönüşte kaldığı yere |
| Davet tokenı geçersiz | Açıklama + plan sahibiyle iletişim yolu |
| Oylama bitti | Oy ekranı yerine sonuç |
| Katılımcı sayısı değişti | Fiyatlar ve eşleşmeler yeniden hesaplanır, kullanıcı bilgilendirilir |
| Paket pasife alındı | Plan içinde "artık uygun değil" rozeti + alternatif öneri |
| Rezervasyon reddedildi | Gerekçe + alternatif paketlere yönlendirme |
| Plan iptal edildi | Tüm katılımcılara bildirim, oy/rezervasyon aksiyonları kapatılır |
