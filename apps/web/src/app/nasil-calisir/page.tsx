import type { Metadata } from 'next';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, ROUTES } from '@hazirgrup/core';
import { metadataContext, env } from '@/lib/env';
import { toNextMetadata } from '@/lib/metadata';
import { Breadcrumb, Card, LinkButton, SectionHeader } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import styles from '@/components/public.module.css';

export const revalidate = 3600;

const TITLE = 'HazırGrup Nasıl Çalışır? | HazırGrup';
const DESCRIPTION =
  'Plan oluşturmaktan rezervasyona kadar HazırGrup adım adım nasıl işler? Davet, paket eşleştirme, oylama ve rezervasyon akışını anlatıyoruz.';

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(
    buildMetadata(metadataContext(), {
      title: TITLE,
      description: DESCRIPTION,
      path: ROUTES.howItWorks(),
      type: 'article',
    }),
  );
}

const STEPS = [
  {
    title: 'Planını oluştur',
    text: '7 kısa adımda tarih, konum, kişi sayısı, bütçe ve aktivite tercihlerini gir. Her adım otomatik olarak taslağa kaydedilir; yarıda bırakırsan kaldığın yerden devam edersin.',
  },
  {
    title: 'Arkadaşlarını davet et',
    text: 'Plan oluşunca tek bir davet bağlantısı üretilir. WhatsApp’ta paylaş, arkadaşların uygulama indirmeden tarayıcıda katılsın.',
  },
  {
    title: 'Katılımı netleştir',
    text: 'Herkes "Katılıyorum", "Kararsızım" veya "Katılmıyorum" der. Tahmini kişi sayısı otomatik hesaplanır: kesin gelenler + kararsızların yarısı.',
  },
  {
    title: 'Uygun paketleri gör',
    text: 'Kişi sayınıza, bütçenize, saatinize ve ilçenize uyan paketler listelenir. Her paketin neden eşleştiği rozetlerle açıklanır.',
  },
  {
    title: 'Birlikte oylayın',
    text: 'Her katılımcı tek oy kullanır ve oyunu istediği kadar değiştirebilir. Sonuç canlı görünür; kim ne oyladı herkes bilir.',
  },
  {
    title: 'Kazananı belirle',
    text: 'Plan sahibi oylamayı istediği an bitirebilir. Eşitlik çıkarsa son kararı plan sahibi verir.',
  },
  {
    title: 'Rezervasyon talebi gönder',
    text: 'Kazanan paket için tek dokunuşla mekâna talep iletilir. Talepte kesin kişi sayısı, tarih, saat ve iletişim bilgin yer alır.',
  },
  {
    title: 'İşletme onaylasın',
    text: 'İşletme talebi onaylar veya gerekçesiyle reddeder. Onaylanırsa rezervasyon kodun oluşur; reddedilirse alternatif paketlere yönlendirilirsin.',
  },
];

const FAQ = [
  {
    question: 'HazırGrup ücretli mi?',
    answer:
      'Kullanıcılar için ücretsizdir. Platform üzerinden ödeme alınmaz; mekâna ödeme doğrudan orada yapılır.',
  },
  {
    question: 'Arkadaşlarımın uygulama indirmesi gerekiyor mu?',
    answer:
      'Hayır. Davet bağlantısına dokunan kişi tarayıcıda plana katılır, paketleri görür ve oy kullanır. Uygulama yalnızca plan oluşturmak için gerekir.',
  },
  {
    question: 'Rezervasyon kesinleşiyor mu?',
    answer:
      'Talebiniz işletmeye iletilir ve işletme onayladığında kesinleşir. Onay durumunu uygulamadan takip edebilir, bildirim alırsınız.',
  },
  {
    question: 'Kişi sayısı sonradan değişirse ne olur?',
    answer:
      'Fiyatlar ve paket listesi otomatik olarak yeniden hesaplanır. Kişi sayısı paketin kapasitesinin dışına çıkarsa o paket listeden çıkar ve bilgilendirilirsiniz.',
  },
  {
    question: 'Oylar gizli mi?',
    answer:
      'Hayır, oylar açıktır: kimin hangi paketi seçtiğini plandaki herkes görür. Bu, grubun daha hızlı karar vermesini sağlar.',
  },
  {
    question: 'İşletmem HazırGrup’ta nasıl yer alır?',
    answer:
      'İşletme başvuru formunu doldurmanız yeterli. Başvurunuz yönetici incelemesinden geçtikten sonra paketlerinizi yayınlayabilirsiniz.',
  },
];

export default function HowItWorksPage() {
  const breadcrumb = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Nasıl çalışır', path: ROUTES.howItWorks() },
  ];

  return (
    <div className="container">
      <JsonLd data={[breadcrumbJsonLd(env.siteUrl, breadcrumb), faqJsonLd(FAQ)]} />

      <Breadcrumb items={breadcrumb.map((b) => ({ name: b.name, href: b.path }))} />

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>HazırGrup nasıl çalışır?</h1>
        <p className={styles.pageLead}>
          Arkadaş grubunun mekân kararını dağınık mesajlaşmadan çıkarıp tek bir akışa
          taşıyoruz. Plandan rezervasyona kadar süreç şöyle işliyor.
        </p>
      </header>

      <section className={`${styles.section} ${styles.sectionFirst}`}>
        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <div key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionHeader
          title="Kimler için?"
          description="HazırGrup, birlikte karar vermesi gereken her grup için tasarlandı."
        />
        <div className={styles.grid}>
          {[
            {
              title: 'Arkadaş grupları',
              text: 'Hafta sonu buluşması, maç gecesi, doğum günü — kararı hızlıca netleştirin.',
            },
            {
              title: 'Halı saha ekipleri',
              text: 'Kim geliyor, hangi saha, kişi başı ne kadar? Hepsini tek ekranda görün.',
            },
            {
              title: 'Öğrenci toplulukları',
              text: 'Kalabalık gruplar için kapasiteye uygun paketleri karşılaştırın.',
            },
            {
              title: 'İş arkadaşları',
              text: 'Ekip yemeğini oylamaya açın, rezervasyonu tek kişi göndersin.',
            },
            {
              title: 'Aile grupları',
              text: 'Herkesin bütçesine uyan seçenekleri şeffaf biçimde görün.',
            },
            {
              title: 'İşletmeler',
              text: 'Hazır grup paketlerinizi yayınlayın, rezervasyon taleplerini panelden yönetin.',
            },
          ].map((item) => (
            <Card key={item.title}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionHeader title="Sık sorulan sorular" />
        <div>
          {FAQ.map((item) => (
            <div key={item.question} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{item.question}</h3>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Card raised>
          <SectionHeader
            title="Hazırsan ilk planını oluştur"
            description="Bir dakikada plan kur, bağlantıyı gruba at."
            action={<LinkButton href="/hesap/plan/yeni">Yeni plan oluştur</LinkButton>}
          />
        </Card>
      </section>
    </div>
  );
}
