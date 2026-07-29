# Ürün Gereksinimleri — HazırGrup

> **Slogan:** Grubunu oluştur, paketini seç, birlikte karar ver.

## 1. Ürün Tanımı

HazırGrup; arkadaş gruplarının kişi sayısı, bütçesi, tarih, saat ve aktivite tercihlerine göre
uygun mekân paketlerini bulmasını, arkadaşlarını bağlantıyla davet etmesini, seçenekleri birlikte
oylamasını ve seçilen paket için rezervasyon talebi oluşturmasını sağlayan şehir bazlı mobil
platformdur.

## 2. Çözülen Problem

Arkadaş grupları dışarı çıkmadan önce mesajlaşma uygulamalarında dağınık konuşmalar yapar:
kim geliyor, hangi gün, saat kaçta, nereye, kişi başı ne kadar, hangi paket, son karar ne,
rezervasyonu kim yapacak. HazırGrup bu süreci tek ve yönlendirilmiş bir akışa dönüştürür.

**Ana akış:**

```
Plan oluştur → Arkadaşlarını davet et → Katılımı netleştir → Uygun paketleri gör
→ Birlikte oyla → Kazanan paketi seç → Rezervasyon talebi gönder → İşletme onaylasın
```

## 3. Hedef Kitle

| Segment | İhtiyaç |
| --- | --- |
| 18–35 yaş gençler | Hızlı karar, düşük sürtünme |
| Üniversite öğrencileri | Bütçe şeffaflığı, kişi başı fiyat |
| Halı saha ekipleri | Kişi sayısı + saat uygunluğu |
| Doğum günü planlayanlar | Paket içeriği, kapasite |
| İş arkadaşları / aile grupları | Net rezervasyon, iletişim |

## 4. Kullanıcı Rolleri ve Yetkileri

| Yetenek | Misafir | Kayıtlı Kullanıcı | İşletme | Yönetici |
| --- | :-: | :-: | :-: | :-: |
| Davet bağlantısını açma | ✅ | ✅ | ✅ | ✅ |
| Plan özetini görme | ✅ | ✅ | — | ✅ |
| Katılım durumu bildirme | ✅ | ✅ | — | — |
| Oy kullanma / değiştirme | ✅ | ✅ | — | — |
| Plan oluşturma | ❌ | ✅ | — | — |
| Katılımcı yönetimi | ❌ | ✅ (sahip) | — | — |
| Oylamayı bitirme | ❌ | ✅ (sahip) | — | — |
| Rezervasyon talebi | ❌ | ✅ (sahip) | — | — |
| Paket CRUD | ❌ | ❌ | ✅ | ✅ |
| Rezervasyon onay/ret | ❌ | ❌ | ✅ | ✅ |
| İşletme doğrulama | ❌ | ❌ | ❌ | ✅ |
| Şehir/ilçe/kategori yönetimi | ❌ | ❌ | ❌ | ✅ |
| SEO indeks yönetimi | ❌ | ❌ | ❌ | ✅ |
| Audit log | ❌ | ❌ | ❌ | ✅ |

Misafir katılımcı **hesap açmadan** mobil web üzerinden plana katılır, oy verir ve oyunu
değiştirebilir. Plan oluşturamaz, rezervasyon gönderemez.

## 5. Faz 1 Kapsamı

### 5.1. Kapsam İçi (Must)

1. E-posta + şifre ile kayıt/giriş, şifre sıfırlama, güvenli oturum.
2. Ülke → il → ilçe hiyerarşisi, yönetici panelinden şehir aktifleştirme.
3. Çok adımlı plan sihirbazı + taslak kaydı.
4. Bütçe hesaplama (kişi başı ↔ toplam, canlı yeniden hesaplama).
5. Paket eşleştirme motoru + eşleşme gerekçeleri.
6. Güvenli davet tokenı, WhatsApp paylaşımı, misafir web akışı.
7. Oylama (tek aktif oy, değiştirilebilir, realtime, erken bitirme, eşitlik yönetimi).
8. Rezervasyon talebi ve durum zaman çizelgesi.
9. İşletme paneli (şube, paket, uygunluk, rezervasyon onay/ret).
10. Yönetici paneli (başvuru onayı, şehir/ilçe/kategori, SEO, audit log).
11. Public SEO web sayfaları (landing, şehir, ilçe, kategori, işletme, paket, rehber, SSS).
12. Uygulama içi bildirim merkezi + push'a hazır altyapı.
13. RLS, rol bazlı yetki, rate limiting, audit log, hesap silme, KVKK metinleri.

### 5.2. Kapsam Dışı (Faz 1'de **yok**)

Sosyal medya akışı, takipçi sistemi, genel gönderi paylaşımı, kullanıcılar arası özel
mesajlaşma, yabancılarla arkadaş bulma, iş ilanları, ikinci el, araç çağırma, canlı konum
takibi, uygulama içi ödeme, kredi kartı saklama, sadakat puanı, gelişmiş yorum sistemi,
yapay zekâ önerileri, yemek siparişi, kurye, otel rezervasyonu, mikroservis mimarisi,
işletmelerin canlı açık artırma teklifi.

Kapsam dışı talepler `docs/FUTURE_ROADMAP.md` dosyasına yazılır.

## 6. Fonksiyonel Gereksinimler

### FR-1 Kimlik ve Hesap
- FR-1.1 E-posta + şifre ile kayıt; şifre en az 8 karakter, harf ve rakam içerir.
- FR-1.2 Giriş, çıkış, şifre sıfırlama akışı.
- FR-1.3 Google girişi için adaptör; kimlik bilgisi yoksa buton gizlenir, uygulama bozulmaz.
- FR-1.4 Kullanıcı hesabını silebilir; silme politikası dokümante edilir.
- FR-1.5 Profil: görünen ad, şehir/ilçe tercihi, tema, bildirim tercihleri.

### FR-2 Konum
- FR-2.1 Ülke → il → ilçe hiyerarşisi veritabanında tutulur, kodda sabitlenmez.
- FR-2.2 Şehir ve ilçede `is_active`, `is_public`, `is_indexable`, `slug`, SEO alanları bulunur.
- FR-2.3 Yönetici yeni şehri kod değişikliği olmadan aktif eder.

### FR-3 Plan Oluşturma
- FR-3.1 7 adımlı sihirbaz: Ne zaman → Nerede → Kaç kişi → Bütçe → Aktivite → Tercihler → Özet.
- FR-3.2 Her adımda ilerleme göstergesi, geri butonu, taslak kaydı, yardımcı metin, anlık doğrulama.
- FR-3.3 Hızlı seçenekler: `Bu akşam`, `Yarın`, `Hafta sonu`; kişi sayısı `2–4`, `5–8`, `9–14`, `15+`.
- FR-3.4 Kişi başı ↔ toplam bütçe iki yönlü otomatik hesaplama.
- FR-3.5 Plan adı otomatik önerilir, kullanıcı değiştirebilir.
- FR-3.6 Taslak kaydedilir; oturum kaybında veri kaybolmaz.

### FR-4 Paket Eşleştirme
- FR-4.1 Kriterler: il, ilçe, kategori, tarih, saat, esnek saat, kişi sayısı, kapasite,
  toplam bütçe, kişi başı bütçe, tercihler, paket aktifliği, şube çalışma saatleri.
- FR-4.2 Her sonuç için eşleşme gerekçesi etiketleri gösterilir.
- FR-4.3 Sıralama: En uygun, En düşük kişi başı fiyat, Bütçeye en yakın, En popüler, Yeni eklenen.
- FR-4.4 Sonuç yoksa hangi kısıtın gevşetileceği önerilir.

### FR-5 Davet ve Katılım
- FR-5.1 Plan için tahmin edilemez davet tokenı (≥128 bit entropi) ve kısa davet kodu üretilir.
- FR-5.2 WhatsApp paylaşım bağlantısı hazır metinle oluşturulur.
- FR-5.3 Misafir: ad girer, `Katılıyorum` / `Kararsızım` / `Katılmıyorum` seçer.
- FR-5.4 Davet sayfası `noindex`; OG kartında kişisel veri yer almaz.
- FR-5.5 Token iptal edilebilir / yenilenebilir.

### FR-6 Oylama
- FR-6.1 Her katılımcı bir aktif oy kullanır, oyunu değiştirebilir.
- FR-6.2 Oylama başlangıç/bitiş zamanı olabilir; plan sahibi erken bitirebilir.
- FR-6.3 Realtime güncelleme (Supabase Realtime; yoksa polling fallback).
- FR-6.4 Duplicate oy engellenir (DB unique constraint).
- FR-6.5 Oylama bitince sonuç sabitlenir; eşitlikte plan sahibi karar verir.

### FR-7 Rezervasyon
- FR-7.1 Talep: plan, paket, şube, kesin kişi sayısı, tarih/saat, toplam fiyat, iletişim, not.
- FR-7.2 Durumlar: Oluşturuldu → İşletme onayı bekleniyor → Onaylandı / Reddedildi /
  Kullanıcı iptal / İşletme iptal / Tamamlandı / No-show.
- FR-7.3 Ret gerekçesi zorunlu; kullanıcı alternatif paketlere yönlendirilir.
- FR-7.4 Durum geçmişi zaman çizelgesi olarak gösterilir.
- FR-7.5 Telefon ve WhatsApp iletişim aksiyonları sunulur.

### FR-8 İşletme Paneli
- FR-8.1 Başvuru formu → yönetici onayı → doğrulanmış işletme.
- FR-8.2 Şube, çalışma saatleri, paket CRUD, uygunluk gün/saat, aktif/pasif.
- FR-8.3 Rezervasyon talepleri listesi, onay/ret, geçmiş, istatistik.
- FR-8.4 İşletme yalnızca kendi verisini görür (RLS + server-side yetki).

### FR-9 Yönetici Paneli
- FR-9.1 Başvuru inceleme/onay/ret, işletme doğrulama, askıya alma.
- FR-9.2 Şehir, ilçe, kategori yönetimi; yeni şehir aktifleştirme.
- FR-9.3 Paket denetimi, plan/rezervasyon inceleme, şikâyet ve destek.
- FR-9.4 SEO alanları (başlık, açıklama, slug, canonical override, OG görseli, index/noindex).
- FR-9.5 Audit log görüntüleme.

### FR-10 Bildirim
- FR-10.1 Kullanıcı ve işletme bildirim tipleri (bkz. `docs/INFORMATION_ARCHITECTURE.md`).
- FR-10.2 Uygulama içi bildirim merkezi tam çalışır.
- FR-10.3 Push yapılandırması yoksa uygulama bozulmaz; push adaptörü hazırdır.
- FR-10.4 Kullanıcı bildirim tercihlerini kanal bazında yönetir.

## 7. Fonksiyonel Olmayan Gereksinimler

| Kod | Gereksinim | Ölçüt |
| --- | --- | --- |
| NFR-1 | Public sayfalar server-rendered | HTML kaynağında içerik görünür |
| NFR-2 | Core Web Vitals | LCP < 2.5s, CLS < 0.1, INP < 200ms (hedef) |
| NFR-3 | Hedef cihaz | Orta/düşük segment Android, API 24+ |
| NFR-4 | Erişilebilirlik | Dokunma alanı ≥ 44dp, kontrast ≥ 4.5:1, focus görünür |
| NFR-5 | Dil | Türkçe UI, i18n altyapısı hazır, İngilizce kod |
| NFR-6 | Güvenlik | Tüm hassas tablolarda RLS, server-side yetki kontrolü |
| NFR-7 | Gizlilik | Public sayfa ve OG kartlarında kişisel veri yok |
| NFR-8 | Dayanıklılık | Bağlantı kesilirse form verisi kaybolmaz |
| NFR-9 | Test | Domain mantığı unit test kapsamında, kritik akışlar E2E |
| NFR-10 | Ölçeklenme | Yeni şehir kod değişikliği olmadan aktif edilir |

## 8. Tamamlanma Kriterleri

`docs/RELEASE_CHECKLIST.md` içindeki 24 maddelik kabul listesi karşılanmadan proje
tamamlanmış sayılmaz.

## 9. Başarı Ölçütü

Üretilen dosya sayısı değil; kullanıcının plan oluşturup arkadaşlarını davet edebilmesi,
birlikte oy kullanabilmesi, rezervasyon oluşturabilmesi ve public web içeriğinin arama
motorlarına doğru sunulmasıdır.
