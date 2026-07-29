import type { HelpArticle, LegalDocument } from '@hazirgrup/types';

/** Yardım merkezi, rehber sayfaları ve hukuki metinler. */

function help(
  slug: string,
  title: string,
  summary: string,
  category: string,
  body: string,
  sortOrder: number,
  isIndexable = true,
): HelpArticle {
  return {
    id: `help-${slug}`,
    slug,
    title,
    summary,
    body,
    category,
    isPublic: true,
    sortOrder,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    ogImageUrl: null,
    isIndexable,
  };
}

export const HELP_ARTICLES: HelpArticle[] = [
  help(
    'plan-nasil-olusturulur',
    'Plan nasıl oluşturulur?',
    'Yeni plan sihirbazının 7 adımını ve taslak kaydını anlatır.',
    'Başlangıç',
    `Ana sayfadaki **Yeni plan oluştur** butonuna dokunarak başlarsın. Sihirbaz 7 adımdan oluşur:

1. **Ne zaman?** — Bu akşam, yarın, hafta sonu gibi hızlı seçeneklerden birini seçebilir veya takvimden tarih belirleyebilirsin.
2. **Nerede?** — İl ve ilçe seçersin. İlçe için "Farketmez" diyebilirsin; o zaman şehirdeki tüm paketler listelenir.
3. **Kaç kişisiniz?** — 2–4, 5–8, 9–14, 15+ hazır aralıklarından seçebilir veya kendi sayını girebilirsin.
4. **Bütçeniz ne?** — Kişi başı veya toplam bütçe girersin; diğeri otomatik hesaplanır.
5. **Ne yapmak istiyorsunuz?** — Kafe, halı saha, oyun salonu gibi kategorilerden bir veya birkaçını seçersin.
6. **Tercihleriniz** — Açık alan, ayrı salon, projeksiyon gibi tercihleri işaretlersin. Bunlar zorunlu değildir; eşleşmeyi iyileştirir.
7. **Plan özeti** — Her şeyi kontrol edip planı oluşturursun.

Her adımda yaptığın seçim **otomatik olarak taslağa kaydedilir**. Uygulamayı kapatsan bile Planlarım → Taslaklar altından kaldığın yerden devam edebilirsin.`,
    1,
  ),
  help(
    'arkadaslar-nasil-davet-edilir',
    'Arkadaşlar nasıl davet edilir?',
    'Davet bağlantısı, WhatsApp paylaşımı ve davet kodu kullanımı.',
    'Davet',
    `Planını oluşturduktan sonra plan detayında **Arkadaşlarını davet et** butonunu göreceksin.

- **WhatsApp'ta paylaş**: Hazır bir mesajla bağlantıyı doğrudan grubuna gönderir.
- **Bağlantıyı kopyala**: Bağlantıyı istediğin yere yapıştırabilirsin.
- **Davet kodu**: Sözlü olarak paylaşabileceğin 8 karakterlik bir kod.

Arkadaşların bağlantıya dokunduğunda **uygulama indirmeden**, tarayıcıda plana katılabilir; adını yazar, katılım durumunu seçer ve paketleri oylayabilir.

Bağlantıyı yanlış kişiye gönderdiysen **Bağlantıyı yenile** diyebilirsin; eski bağlantı anında geçersiz olur.`,
    2,
  ),
  help(
    'oy-nasil-degistirilir',
    'Oy nasıl değiştirilir?',
    'Oylama süresince oyunu istediğin kadar değiştirebilirsin.',
    'Oylama',
    `Oylama devam ettiği sürece oyunu istediğin kadar değiştirebilirsin. Oylama ekranında seçtiğin paketin üzerinde bir onay işareti görürsün; başka bir pakete dokunduğunda oyun otomatik olarak oraya taşınır.

Oylama kapandıktan sonra oy değiştirilemez; ekranda oy yerine **sonuç** gösterilir.

Oylar açıktır: kimin hangi paketi seçtiğini plandaki herkes görebilir. Bu, grubun daha hızlı karar vermesini sağlar.`,
    3,
  ),
  help(
    'kisi-sayisi-degisirse',
    'Kişi sayısı değişirse ne olur?',
    'Katılımcı sayısı değiştiğinde fiyatlar ve paket listesi yeniden hesaplanır.',
    'Fiyat',
    `Bir arkadaşın katılım durumunu değiştirdiğinde HazırGrup fiyatları ve paket listesini otomatik olarak yeniden hesaplar.

Tahmini katılımcı sayısı şöyle bulunur: **kesin gelenler + kararsızların yarısı** (yukarı yuvarlanır). Örneğin 6 kişi "Katılıyorum", 3 kişi "Kararsızım" dediyse hesap 6 + 2 = 8 kişi üzerinden yapılır.

- Kişi başı fiyatlı paketlerde toplam tutar değişir.
- Sabit toplam fiyatlı paketlerde (örneğin halı saha kiralama) toplam aynı kalır, kişi başı düşen tutar değişir.
- Kişi sayısı paketin kapasitesinin dışına çıkarsa o paket listeden çıkar ve sana bildirilir.`,
    4,
  ),
  help(
    'fiyat-neden-degisti',
    'Fiyat neden değişti?',
    'Fiyat değişiminin üç olası nedeni.',
    'Fiyat',
    `Gördüğün fiyat üç nedenle değişebilir:

1. **Katılımcı sayısı değişti.** Sabit toplam fiyatlı paketlerde kişi başına düşen tutar, gelen kişi sayısına göre hesaplanır.
2. **İşletme paket fiyatını güncelledi.** Bu durumda planında bir bilgilendirme görürsün.
3. **Farklı bir paket seçildi.** Oylama sonucunda kazanan paket değiştiyse fiyat da değişir.

Rezervasyon talebi gönderdiğinde tutar **sabitlenir**; işletme onayladıktan sonra fiyat değişmez.`,
    5,
  ),
  help(
    'rezervasyon-nasil-calisir',
    'Rezervasyon nasıl çalışır?',
    'Talep gönderme, işletme onayı ve rezervasyon kodu.',
    'Rezervasyon',
    `Oylama bittikten sonra plan sahibi **Rezervasyon talebi gönder** diyebilir. Talep şu bilgileri içerir: seçilen paket, şube, tarih ve saat, kesin kişi sayısı, iletişim bilgisi ve varsa notun.

Talep gönderildikten sonra:

1. Durum **İşletme onayı bekleniyor** olur.
2. İşletme talebi onaylar veya gerekçesiyle reddeder.
3. Onaylanırsa sana bir **rezervasyon kodu** verilir (örneğin HG-7QK4M2). Mekâna gittiğinde bu kodu söylemen yeterlidir.

HazırGrup üzerinden **ödeme alınmaz**. Ödeme mekânda yapılır.`,
    6,
  ),
  help(
    'isletme-reddederse',
    'İşletme rezervasyonu reddederse ne olur?',
    'Ret durumunda alternatif paketlere yönlendirilirsin.',
    'Rezervasyon',
    `İşletme talebi reddederse sana bildirim gelir ve **ret gerekçesi** gösterilir (örneğin "O saat için yerimiz dolu").

Bu durumda plan iptal olmaz. Sana aynı planın diğer uygun paketleri gösterilir ve tek dokunuşla yeni bir talep gönderebilirsin. Dilersen oylamayı yeniden açabilir veya doğrudan başka bir paket seçebilirsin.`,
    7,
  ),
  help(
    'davet-baglantim-calismiyor',
    'Davet bağlantım çalışmıyor',
    'Geçersiz, süresi dolmuş veya iptal edilmiş bağlantılar.',
    'Davet',
    `Davet bağlantısı üç nedenle çalışmayabilir:

- **İptal edilmiş**: Plan sahibi bağlantıyı yenilemiştir. Ondan güncel bağlantıyı iste.
- **Süresi dolmuş**: Bağlantılar plan tarihinden bir gün sonra otomatik olarak geçersiz olur.
- **Plan iptal edilmiş**: Plan sahibi planı iptal etmiştir.

Her üç durumda da ekranda ne yapman gerektiğini anlatan bir açıklama görürsün.`,
    8,
  ),
  help(
    'hesabimi-nasil-silerim',
    'Hesabımı nasıl silerim?',
    'Hesap silme adımları ve verilerine ne olduğu.',
    'Hesap',
    `Profil → Ayarlar → **Hesabı sil** adımlarını izle. Silme talebi anında işleme alınır ve **30 gün içinde** geri alınabilir.

Verilerine ne olduğu:

- Profil bilgilerin, e-postan ve telefonun 30 gün sonra kalıcı olarak silinir.
- Oluşturduğun planlar anonimleştirilir; arkadaşlarının akışı bozulmaz.
- Oylar anonimleştirilir, sayım bütünlüğü korunur.
- Rezervasyonlar ticari kayıt olarak saklanır ancak kişisel alanların maskelenir.
- Bildirimler, favoriler ve cihaz kayıtların anında silinir.

Ayrıntılar için KVKK aydınlatma metnine bakabilirsin.`,
    9,
  ),
];

// ---------------------------------------------------------------------------
// Rehber (kullanım senaryosu) sayfaları
// ---------------------------------------------------------------------------

export interface GuidePage {
  slug: string;
  title: string;
  summary: string;
  /** İlgili şehir slug'ı (varsa) — dahili linkleme için. */
  citySlug: string | null;
  categorySlug: string | null;
  sections: Array<{ heading: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
}

export const GUIDE_PAGES: GuidePage[] = [
  {
    slug: 'arkadas-grubuyla-mekan-secme',
    title: 'Arkadaş Grubuyla Mekân Seçme Rehberi',
    summary:
      'Kalabalık arkadaş gruplarında mekân kararını hızlandırmanın pratik yolu: kişi sayısı, bütçe ve saat üçlüsünü önce netleştirin.',
    citySlug: null,
    categorySlug: null,
    sections: [
      {
        heading: 'Önce üç soruyu netleştirin',
        body: 'Grup kararlarının uzamasının nedeni genellikle aynı anda çok fazla değişkenin konuşulmasıdır. Kaç kişiyiz, ne zaman ve kişi başı ne kadar — bu üç soru netleşmeden mekân konuşmak zaman kaybıdır. HazırGrup planı bu üç soruyla başlatır ve gerisini otomatik daraltır.',
      },
      {
        heading: 'Kişi sayısını aralık olarak düşünün',
        body: 'Arkadaş gruplarında katılım son ana kadar netleşmez. Bu yüzden kesin bir sayı yerine minimum ve maksimum belirleyin. Paketler kapasite aralığına göre eşleştiği için, aralık verdiğinizde hem çok küçük hem çok büyük mekânlar elenir.',
      },
      {
        heading: 'Bütçeyi kişi başı konuşun',
        body: 'Toplam tutar grubun gözünde büyük görünür; kişi başı tutar karar vermeyi kolaylaştırır. HazırGrup her paketin kişi başı fiyatını, katılımcı sayınıza göre yeniden hesaplayarak gösterir. Sabit fiyatlı paketlerde (örneğin halı saha) kişi sayısı arttıkça kişi başı düşer.',
      },
      {
        heading: 'Kararı oylamaya bırakın',
        body: 'Uzun tartışma yerine 2–3 uygun paketi oylamaya açın. Herkes tek oy kullanır, oyunu değiştirebilir ve sonuç canlı görünür. Eşitlik çıkarsa son kararı planı oluşturan kişi verir.',
      },
      {
        heading: 'Rezervasyonu tek kişi göndersin',
        body: 'Oylama bittiğinde plan sahibi tek dokunuşla rezervasyon talebi gönderir. İşletme onayladığında herkese bildirim gider ve rezervasyon kodu paylaşılır.',
      },
    ],
    faq: [
      {
        question: 'Arkadaşlarımın uygulamayı indirmesi gerekiyor mu?',
        answer:
          'Hayır. Davet bağlantısına dokunan kişi tarayıcıda plana katılabilir, paketleri görebilir ve oy kullanabilir. Uygulama yalnızca plan oluşturmak için gerekir.',
      },
      {
        question: 'Kaç kişiye kadar plan yapabilirim?',
        answer:
          'Katılımcı sayısında bir sınır yoktur. Paket eşleştirmesi, seçtiğiniz kişi sayısına uygun kapasitedeki paketleri gösterir.',
      },
      {
        question: 'Bütçemi girmek zorunda mıyım?',
        answer:
          'Hayır. Bütçe girmezseniz fiyat kısıtı uygulanmaz ve tüm uygun paketler listelenir. Bütçe girdiğinizde paketler bütçenize göre etiketlenir.',
      },
    ],
  },
  {
    slug: 'hakkari-grup-paketleri',
    title: 'Hakkâri Grup Paketleri',
    summary:
      'Hakkâri’de arkadaş grupları için kafe, halı saha ve oyun salonu paketleri; kişi sayısına ve bütçeye göre nasıl seçilir.',
    citySlug: 'hakkari',
    categorySlug: null,
    sections: [
      {
        heading: 'Hakkâri’de grup planı nasıl kurulur?',
        body: 'Hakkâri Merkez, Yüksekova, Şemdinli, Çukurca ve Derecik ilçelerindeki mekânların grup paketleri tek listede toplanır. Planınızı oluşturduğunuzda kişi sayınıza, bütçenize ve saatinize uyan paketler otomatik olarak eşleşir.',
      },
      {
        heading: 'Hangi kategoriler var?',
        body: 'Şu anda kafe ve restoran, halı saha, PlayStation ve oyun salonu kategorileri aktiftir. Bir planda birden fazla kategori seçebilir, farklı seçenekleri yan yana karşılaştırabilirsiniz.',
      },
      {
        heading: 'Kişi sayısına göre öneriler',
        body: '4–6 kişilik gruplar için kahve ve tatlı paketleri, 6–12 kişilik gruplar için akşam yemeği ve yöresel sofra menüleri, 10–14 kişilik gruplar için halı saha kiralama paketleri en çok tercih edilenlerdir.',
      },
    ],
    faq: [
      {
        question: 'Hakkâri’de hangi ilçelerde paket var?',
        answer:
          'Merkez, Yüksekova, Şemdinli, Çukurca ve Derecik ilçelerinde aktif paketler bulunur. İlçe seçmeden de arama yapabilir, şehirdeki tüm paketleri görebilirsiniz.',
      },
      {
        question: 'Fiyatlar neye göre değişiyor?',
        answer:
          'Paketler ya kişi başı ya da sabit toplam fiyatlıdır. Sabit fiyatlı paketlerde kişi sayısı arttıkça kişi başına düşen tutar azalır.',
      },
    ],
  },
  {
    slug: 'hakkari-hali-saha-paketleri',
    title: 'Hakkâri Halı Saha Paketleri',
    summary:
      'Hakkâri’de halı saha kiralama paketleri: saatlik fiyatlar, forma ve duş dahil seçenekler, turnuva düzeni.',
    citySlug: 'hakkari',
    categorySlug: 'hali-saha',
    sections: [
      {
        heading: 'Saha kiralamada nelere dikkat etmeli?',
        body: 'Kapalı mı açık mı saha istediğinizi, gece aydınlatması olup olmadığını ve duş/soyunma odası bulunup bulunmadığını önceden netleştirin. HazırGrup’ta bu özellikler tercih etiketleriyle filtrelenir.',
      },
      {
        heading: 'Kaç kişilik takım için hangi paket?',
        body: '10–14 kişilik gruplar için standart 1 saatlik kiralama yeterlidir. Forma ve top dahil paketler ekipman derdini ortadan kaldırır. 16 kişiden kalabalık gruplarda turnuva paketleri fikstür düzeni de sunar.',
      },
      {
        heading: 'Fiyat nasıl paylaşılır?',
        body: 'Halı saha paketleri genellikle sabit toplam fiyatlıdır. HazırGrup, katılımcı sayınıza göre kişi başına düşen tutarı otomatik hesaplar; kaç kişi geleceği netleştikçe rakam güncellenir.',
      },
    ],
    faq: [
      {
        question: 'Halı saha paketlerinde forma ve top dahil mi?',
        answer:
          'Pakete göre değişir. Paket detayında "Forma kiralama" ve "Maç topu" kalemlerini görebilirsiniz; dahil değilse listede yer almaz.',
      },
      {
        question: 'Gece maçı yapabilir miyiz?',
        answer:
          'Evet. Gece aydınlatması olan sahalar tercih etiketiyle işaretlidir; planınızda saat seçerken bu tesisler eşleşir.',
      },
    ],
  },
  {
    slug: 'hakkari-dogum-gunu-mekan-paketleri',
    title: 'Hakkâri Doğum Günü Mekân Paketleri',
    summary:
      'Hakkâri’de doğum günü kutlaması için süsleme, pasta ve grup menüsü dahil mekân paketleri.',
    citySlug: 'hakkari',
    categorySlug: 'kafe-restoran',
    sections: [
      {
        heading: 'Doğum günü paketlerinde neler var?',
        body: 'Doğum günü paketleri genellikle masa süslemesi, pasta, grup menüsü ve müzik sistemini kapsar. Bazı mekânlar teras veya ayrı salon tahsisi de sunar.',
      },
      {
        heading: 'Kaç gün önceden planlamalı?',
        body: 'Süsleme ve pasta hazırlığı gerektirdiği için en az 2 gün önceden rezervasyon talebi göndermeniz önerilir. Hafta sonu akşamları için daha erken planlamak iyi olur.',
      },
      {
        heading: 'Sürpriz kutlamada davet nasıl yönetilir?',
        body: 'Plan adını nötr bırakabilir, davet bağlantısını yalnızca sürprize dahil olacak kişilerle paylaşabilirsiniz. Paylaşım kartında bütçe ve katılımcı isimleri görünmez.',
      },
    ],
    faq: [
      {
        question: 'Pasta ve süsleme fiyata dahil mi?',
        answer:
          'Doğum günü paketlerinde pasta ve süsleme genellikle dahildir; paket detayındaki içerik listesinde tek tek görebilirsiniz.',
      },
      {
        question: 'Mekânın tamamını kiralayabilir miyim?',
        answer:
          'Bazı işletmeler kapalı grup etkinliği paketi sunar. Kişi sayınız 20’nin üzerindeyse bu paketler eşleşme listesinde görünür.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Hukuki metinler
// ---------------------------------------------------------------------------

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    updatedAt: '2026-01-15',
    body: `## 1. Taraflar ve Kapsam

Bu koşullar, HazırGrup platformunu kullanan tüm kullanıcılar için geçerlidir. Platformu kullanarak bu koşulları kabul etmiş olursunuz.

## 2. Hizmetin Niteliği

HazırGrup, arkadaş gruplarının mekân paketlerini karşılaştırmasını, birlikte oylamasını ve işletmelere rezervasyon talebi iletmesini sağlayan bir aracı platformdur.

**HazırGrup bir mekân işletmecisi değildir.** Paketlerin içeriği, fiyatı, kalitesi ve sunumundan ilgili işletme sorumludur. Rezervasyonun kesinleşmesi işletmenin onayına bağlıdır.

## 3. Ödeme

Faz 1'de platform üzerinden **ödeme alınmaz**. Ücretlendirme doğrudan mekânda, işletme ile kullanıcı arasında gerçekleşir.

## 4. Kullanıcı Yükümlülükleri

- Doğru ve güncel bilgi vermek.
- Hesabınızın güvenliğini korumak.
- Platformu yasa dışı amaçlarla kullanmamak.
- Diğer kullanıcıların gizliliğine saygı göstermek; davet bağlantılarını izinsiz üçüncü kişilerle paylaşmamak.

## 5. İşletme Yükümlülükleri

- Yayımlanan paket bilgilerinin doğru olması.
- Rezervasyon taleplerine makul sürede yanıt verilmesi.
- Onaylanan rezervasyonun karşılanması.

## 6. İçerik ve Fikri Mülkiyet

Platformdaki metin, görsel ve yazılım HazırGrup'a aittir. İşletmelerin yüklediği görsellerin haklarından ilgili işletme sorumludur.

## 7. Hesabın Askıya Alınması

Kurallara aykırı kullanım tespit edilirse hesap askıya alınabilir veya kapatılabilir.

## 8. Sorumluluğun Sınırı

HazırGrup, işletme ile kullanıcı arasındaki ilişkiden doğan uyuşmazlıklarda taraf değildir. Platform "olduğu gibi" sunulur.

## 9. Değişiklikler

Koşullarda değişiklik yapıldığında kullanıcılar uygulama içi bildirimle haberdar edilir.`,
  },
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    updatedAt: '2026-01-15',
    body: `## 1. Toplanan Veriler

| Veri | Amaç | Hukuki dayanak |
| --- | --- | --- |
| Ad, e-posta | Hesap oluşturma, giriş | Sözleşmenin ifası |
| Şehir/ilçe tercihi | Uygun paketleri gösterme | Sözleşmenin ifası |
| Plan ve katılım bilgileri | Hizmetin sunulması | Sözleşmenin ifası |
| Telefon (opsiyonel) | Rezervasyon iletişimi | Açık rıza |
| Cihaz bildirim kaydı | Bildirim gönderimi | Açık rıza |

## 2. Toplanmayan Veriler

- Konum takibi yapılmaz.
- Kredi kartı bilgisi saklanmaz (platformda ödeme yoktur).
- Reklam amaçlı üçüncü taraf takip kodu kullanılmaz.

## 3. Verilerin Paylaşımı

Rezervasyon talebi gönderdiğinizde **yalnızca** ilgili işletmeyle şu bilgiler paylaşılır: ad, iletişim telefonu, kişi sayısı, tarih/saat, seçilen paket ve varsa notunuz.

Bütçeniz, diğer katılımcıların isimleri ve oy tercihleri işletmeyle **paylaşılmaz**.

## 4. Herkese Açık Sayfalar

Public sayfalarda (şehir, ilçe, mekân, paket) hiçbir kullanıcı bilgisi gösterilmez. Davet bağlantılarının paylaşım kartında yalnızca plan başlığı, tarih ve ilçe yer alır.

## 5. Saklama Süreleri

- Aktif hesap verileri: hesap açık olduğu sürece.
- Hesap silme sonrası kişisel veriler: 30 gün içinde silinir.
- Rezervasyon kayıtları: ticari kayıt yükümlülüğü nedeniyle 10 yıl (kişisel alanlar maskelenmiş olarak).

## 6. Haklarınız

Verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsiniz. Talepleriniz için uygulama içi destek bölümünü kullanabilirsiniz.

## 7. Çerezler

Yalnızca oturum ve güvenlik için gerekli çerezler kullanılır. Reklam veya profilleme çerezi yoktur.`,
  },
  {
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Aydınlatma Metni',
    updatedAt: '2026-01-15',
    body: `## Veri Sorumlusu

HazırGrup, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla hareket eder.

## İşlenen Kişisel Veriler

**Kimlik:** ad, soyad (görünen ad)
**İletişim:** e-posta, telefon (opsiyonel)
**İşlem güvenliği:** oturum kayıtları, IP adresi (güvenlik amaçlı, sınırlı süre)
**Müşteri işlem:** oluşturulan planlar, oy kayıtları, rezervasyon talepleri

## İşleme Amaçları

1. Üyelik ve kimlik doğrulama işlemlerinin yürütülmesi
2. Hizmetin sunulması (plan, davet, oylama, rezervasyon)
3. İşletmeye rezervasyon talebinin iletilmesi
4. Bilgi güvenliği süreçlerinin yürütülmesi
5. Talep ve şikâyetlerin takibi

## Hukuki Sebepler

KVKK m.5/2-c (sözleşmenin ifası), m.5/2-ç (hukuki yükümlülük), m.5/2-f (meşru menfaat) ve açık rıza gerektiren hallerde m.5/1.

**Açık rıza gerektiren işlemler ayrı ayrı onaya tabidir** ve varsayılan olarak kapalıdır: pazarlama iletişimi, konum tercihinin hatırlanması.

## Aktarım

Kişisel verileriniz, yalnızca rezervasyon talebiniz kapsamında ilgili işletmeye aktarılır. Yurt dışına aktarım, barındırma hizmeti sağlayıcısının bulunduğu ülke sınırlarında ve gerekli güvenlik önlemleriyle yapılır.

## Haklarınız (KVKK m.11)

Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, işlenme amacını öğrenme, aktarıldığı üçüncü kişileri bilme, düzeltilmesini veya silinmesini isteme, otomatik sistemlerle analiz sonucu aleyhinize bir sonuç doğmasına itiraz etme ve zararınızın giderilmesini talep etme haklarına sahipsiniz.

## Hesap Silme

Hesabınızı uygulama içinden silebilirsiniz. Silme talebi 30 gün içinde geri alınabilir; süre sonunda kişisel verileriniz kalıcı olarak silinir veya anonimleştirilir.`,
  },
];
