# Mobil QA kontrol listesi

Gerçek cihazda elle yapılacak testler. Otomatik testler bu listenin yerini
tutmaz: dokunma hedefleri, klavye davranışı ve derin bağlantılar yalnızca
cihazda doğrulanabilir.

**Test ortamı:** `EXPO_PUBLIC_DATA_SOURCE=demo` (varsayılan) — harici servis gerekmez.
**Demo hesabı:** `elif@ornek.test` / `Demo1234`

---

## 0. Kapsam

| Cihaz sınıfı | Örnek | Neden |
| --- | --- | --- |
| Küçük Android | 360×640 dp | En dar ekran; taşma ve kırpma yakalar |
| Orta Android | Pixel 7 (412×915) | Referans cihaz |
| Büyük / katlanabilir | 800 dp+ | Düzen esnemesi |
| Düşük bellekli | 2 GB RAM | Liste performansı |

En az **bir küçük** ve **bir orta** cihazda tam listeyi geçin.

---

## 1. Kurulum ve ilk açılış

- [ ] Uygulama kurulup ilk açılışta çökmüyor
- [ ] Splash ekranı marka rengiyle geliyor, takılıp kalmıyor
- [ ] İnternet **kapalıyken** açılış anlamlı bir mesaj veriyor (beyaz ekran yok)
- [ ] Uygulama ilk açılışta oturum istemiyor; keşif yapılabiliyor
- [ ] Sistem teması koyu iken uygulama koyu geliyor

## 2. Kimlik doğrulama

- [ ] Kayıt formu: boş alan, geçersiz e-posta, kısa şifre için **anlaşılır** hata
- [ ] Şifre alanı maskeli; göster/gizle varsa çalışıyor
- [ ] Kayıt sonrası doğrudan ana sekmeye düşülüyor
- [ ] Giriş → çıkış → tekrar giriş sorunsuz
- [ ] Uygulama kapatılıp açıldığında oturum **korunuyor** (secure store)
- [ ] Yanlış şifre denemesi kilitlenmeye değil, hataya yol açıyor
- [ ] Google butonu yapılandırılmamışsa **görünmüyor** (kırık buton yok)

## 3. Sekmeler ve gezinme

- [ ] Beş sekme de açılıyor: Keşfet, Planlarım, Yeni, Rezervasyonlar, Profil
- [ ] Aktif sekme görsel olarak belirgin
- [ ] Sekme ikonları hem açık hem koyu temada okunur
- [ ] Donanım **geri** tuşu beklendiği gibi çalışıyor, uygulamadan erken çıkmıyor
- [ ] Derin ekranlardan geri dönüş sekme durumunu koruyor
- [ ] Sekme rozetleri (okunmamış bildirim vb.) doğru sayı gösteriyor

## 4. Plan sihirbazı

- [ ] 7 adımın tamamı ilerliyor ve geri gidiliyor
- [ ] İlerleme göstergesi doğru adımı gösteriyor
- [ ] Zorunlu alan boşken **Devam** pasif ve nedeni belli
- [ ] Sayısal alanlarda sayı klavyesi açılıyor
- [ ] Klavye açıkken aktif alan **klavyenin altında kalmıyor**
- [ ] Tarih seçici cihazın yerel biçimini kullanıyor
- [ ] Bütçe iki yönlü hesaplanıyor (kişi başı ↔ toplam)
- [ ] Uygulama arka plana alınıp geri gelindiğinde girilenler kayboluyor **değil**
- [ ] Sihirbaz ortasında çıkılıp dönülünce taslak korunuyor
- [ ] Plan oluşturulunca plan detayına gidiliyor

## 5. Davet ve misafir akışı

- [ ] Davet bağlantısı üretiliyor
- [ ] **Paylaş** sistem paylaşım sayfasını açıyor
- [ ] WhatsApp'a gönderilen mesaj okunabilir ve bütçe/isim sızdırmıyor
- [ ] Bağlantı kopyalanıyor, panoya gerçekten yapışıyor
- [ ] Bağlantı **başka bir telefonun tarayıcısında** açılıyor
- [ ] Derin bağlantı uygulama kuruluysa uygulamada açılıyor (`intentFilters`)
- [ ] Geçersiz/süresi dolmuş bağlantı yol gösteren ekran veriyor (çökme yok)

## 6. Oylama

- [ ] Paket kartları listeleniyor, fiyatlar okunur
- [ ] Oy verme dokunuşu **anında** geri bildirim veriyor
- [ ] Oy değiştirilebiliyor
- [ ] Oy sayıları güncelleniyor
- [ ] Ağ yavaşken çift dokunuş çift oy üretmiyor
- [ ] Oylama kapandıktan sonra oy butonları pasif

## 7. Rezervasyon

- [ ] Rezervasyon talebi gönderiliyor
- [ ] Telefon alanı telefon klavyesi açıyor
- [ ] Durum (bekliyor / onaylandı / reddedildi) doğru görünüyor
- [ ] Onaylanınca rezervasyon kodu büyük ve okunur
- [ ] Mekânı **ara** düğmesi telefon uygulamasını açıyor
- [ ] Harita/yol tarifi düğmesi harita uygulamasını açıyor
- [ ] Durum geçmişi kronolojik

## 8. Erişilebilirlik

- [ ] Tüm dokunma hedefleri **en az 44×44 dp**
- [ ] Sistem yazı boyutu **en büyük** iken düzen bozulmuyor, metin kırpılmıyor
- [ ] Ekran okuyucu (TalkBack) ile ana akış tamamlanabiliyor
- [ ] İkon-only butonların erişilebilirlik etiketi var
- [ ] Renk tek başına anlam taşımıyor (durumlar metinle de belirtiliyor)
- [ ] Hareket azaltma açıkken animasyonlar sakinleşiyor

## 9. Ağ ve hata durumları

- [ ] Uçak modunda liste ekranları **anlamlı** boş durum gösteriyor
- [ ] Ağ geri gelince yenileme çalışıyor
- [ ] Yavaş bağlantıda yükleniyor göstergesi var, ekran donmuyor
- [ ] Sunucu hatası kullanıcıya teknik yığın izi göstermiyor
- [ ] Aynı işlemin tekrarı çift kayıt oluşturmuyor

## 10. Yaşam döngüsü ve performans

- [ ] Arka plan → ön plan geçişinde durum korunuyor
- [ ] Uzun listede kaydırma takılmıyor
- [ ] Bellek düşükken uygulama öldürülüp geri dönüldüğünde ekran yeniden kuruluyor
- [ ] Ekran döndürme (destekleniyorsa) düzeni bozmuyor
- [ ] Uygulama arka plandayken pil tüketimi anormal değil

## 11. Gizlilik

- [ ] Uygulama gereksiz izin istemiyor (yalnızca `INTERNET`)
- [ ] Uygulama içinde gerçek kişi verisi görünmüyor (tüm veri kurgusal)
- [ ] Çıkış yapınca yerel oturum verisi siliniyor
- [ ] Uygulama geçmişi önizlemesinde hassas bilgi görünmüyor

---

## Sonuç kaydı

| Alan | Değer |
| --- | --- |
| Tarih | |
| Uygulama sürümü / versionCode | |
| Cihaz(lar) ve Android sürümü | |
| Veri kaynağı | demo / supabase |
| Geçen / toplam | |
| Açılan hata kayıtları | |

**Kural:** Kritik akışı (kayıt → plan → davet → oy → rezervasyon) engelleyen
tek bir madde bile kaldıysa sürüm yayınlanmaz.
