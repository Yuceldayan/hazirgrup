import type { Kurus } from '@hazirgrup/types';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../config/constants';
import { formatCurrency, formatPeopleRange, joinTurkish, truncateAtWord } from '../format/index';
import { absoluteUrl } from './routes';

/**
 * SEO metadata üretimi — tek kaynak.
 *
 * Başlıklar doğal Türkçedir; anahtar kelime doldurma yapılmaz.
 * Uzunluk sınırları aşılırsa kelime sınırında kısaltılır.
 */

export const SITE_NAME = 'HazırGrup';
export const SITE_TAGLINE = 'Grubunu Oluştur, Paketini Seç, Birlikte Karar Ver';
export const SITE_LOCALE = 'tr_TR';

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: 'website' | 'article';
    images: Array<{ url: string; width: number; height: number; alt: string }>;
  };
  twitter: { card: 'summary_large_image'; title: string; description: string };
}

export interface MetadataContext {
  siteUrl: string;
  /** Üretim dışı ortamlarda tüm sayfalar noindex olur. */
  isProduction: boolean;
}

export interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  shouldIndex?: boolean;
  follow?: boolean;
  ogImagePath?: string | null;
  canonicalOverride?: string | null;
  type?: 'website' | 'article';
  imageAlt?: string;
}

export function buildMetadata(ctx: MetadataContext, input: BuildMetadataInput): PageMetadata {
  const title = truncateAtWord(input.title, SEO_TITLE_MAX_LENGTH);
  const description = truncateAtWord(input.description, SEO_DESCRIPTION_MAX_LENGTH);
  const canonical = input.canonicalOverride ?? absoluteUrl(ctx.siteUrl, input.path);

  const ogImage = input.ogImagePath
    ? input.ogImagePath.startsWith('http')
      ? input.ogImagePath
      : absoluteUrl(ctx.siteUrl, input.ogImagePath)
    : absoluteUrl(ctx.siteUrl, `/og?baslik=${encodeURIComponent(input.title)}`);

  const index = ctx.isProduction && (input.shouldIndex ?? true);

  return {
    title,
    description,
    canonical,
    robots: { index, follow: input.follow ?? true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: input.type ?? 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: input.imageAlt ?? input.title,
        },
      ],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ---------------------------------------------------------------------------
// Sayfa bazlı başlık ve açıklama üreticileri
// ---------------------------------------------------------------------------

function withSuffix(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

export function homeMetadataInput(activeCityNames: string[]): {
  title: string;
  description: string;
} {
  const cities = activeCityNames.length > 0 ? joinTurkish(activeCityNames.slice(0, 3)) : 'şehrinde';
  return {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: `Arkadaş grubunun kişi sayısına, bütçesine ve saatine uygun mekân paketlerini ${cities} bul. Tek bağlantıyla davet et, birlikte oyla, rezervasyon talebi gönder.`,
  };
}

export interface CityMetadataInput {
  cityName: string;
  districtNames: string[];
  packageCount: number;
  categoryNames: string[];
  minPerPerson: Kurus | null;
}

export function cityMetadata(input: CityMetadataInput): { title: string; description: string } {
  const title = withSuffix(`${input.cityName}'de Arkadaş Grubuna Uygun Mekân Paketleri`);

  const priceText = input.minPerPerson
    ? `Kişi başı ${formatCurrency(input.minPerPerson)}'den başlayan`
    : 'Grubuna uygun';
  const categoryText =
    input.categoryNames.length > 0 ? joinTurkish(input.categoryNames.slice(0, 3)) : 'mekân';

  const description = `${input.cityName} genelinde ${input.packageCount} grup paketi. ${priceText} ${categoryText} seçeneklerini karşılaştır, arkadaşlarınla oylayarak seç.`;

  return { title, description };
}

export interface DistrictMetadataInput {
  districtName: string;
  cityName: string;
  packageCount: number;
  categoryNames: string[];
  minPerPerson: Kurus | null;
}

export function districtMetadata(input: DistrictMetadataInput): {
  title: string;
  description: string;
} {
  const title = withSuffix(`${input.districtName}, ${input.cityName} Grup Mekân Paketleri`);

  const priceText = input.minPerPerson
    ? `kişi başı ${formatCurrency(input.minPerPerson)}'den başlıyor`
    : 'grubuna göre değişiyor';
  const categoryText =
    input.categoryNames.length > 0 ? joinTurkish(input.categoryNames.slice(0, 3)) : 'mekân';

  const description = `${input.districtName} ilçesinde ${input.packageCount} grup paketi: ${categoryText}. Fiyatlar ${priceText}. Arkadaşlarını davet et, birlikte karar ver.`;

  return { title, description };
}

export interface CategoryMetadataInput {
  categoryName: string;
  cityName: string | null;
  packageCount: number;
  minPerPerson: Kurus | null;
}

export function categoryMetadata(input: CategoryMetadataInput): {
  title: string;
  description: string;
} {
  const title = withSuffix(
    input.cityName
      ? `${input.cityName} ${input.categoryName} Paketleri`
      : `${input.categoryName} Grup Paketleri`,
  );

  const scope = input.cityName ? `${input.cityName}'de` : 'Türkiye genelinde';
  const priceText = input.minPerPerson
    ? ` Kişi başı ${formatCurrency(input.minPerPerson)}'den başlıyor.`
    : '';

  return {
    title,
    description: `${scope} arkadaş grupları için ${input.packageCount} ${input.categoryName.toLocaleLowerCase('tr-TR')} paketi.${priceText} Kişi sayına ve bütçene göre filtrele, birlikte oylayarak seç.`,
  };
}

export interface BusinessMetadataInput {
  businessName: string;
  districtName: string;
  cityName: string;
  categoryName: string;
  packageCount: number;
  minPerPerson: Kurus | null;
  description: string;
}

export function businessMetadata(input: BusinessMetadataInput): {
  title: string;
  description: string;
} {
  const title = withSuffix(`${input.businessName} — ${input.districtName}, ${input.cityName}`);

  const priceText = input.minPerPerson
    ? ` Kişi başı ${formatCurrency(input.minPerPerson)}'den başlayan fiyatlar.`
    : '';
  const own = input.description.trim();
  const base = own.length > 40 ? own : `${input.districtName}, ${input.cityName} konumunda ${input.categoryName.toLocaleLowerCase('tr-TR')}.`;

  return {
    title,
    description: `${base} ${input.packageCount} grup paketi.${priceText}`.trim(),
  };
}

export interface PackageMetadataInput {
  packageName: string;
  businessName: string;
  districtName: string;
  cityName: string;
  minPeople: number;
  maxPeople: number;
  perPersonFrom: Kurus;
  totalFrom: Kurus;
  itemLabels: string[];
}

export function packageMetadata(input: PackageMetadataInput): {
  title: string;
  description: string;
} {
  const title = withSuffix(
    `${input.packageName} — ${input.businessName}, ${input.districtName}`,
  );

  const items =
    input.itemLabels.length > 0 ? ` İçerik: ${joinTurkish(input.itemLabels.slice(0, 4))}.` : '';

  const description = `${input.businessName} (${input.districtName}, ${input.cityName}) — ${formatPeopleRange(input.minPeople, input.maxPeople)} için kişi başı ${formatCurrency(input.perPersonFrom)}, toplam ${formatCurrency(input.totalFrom)}.${items}`;

  return { title, description };
}

export function guideMetadata(input: {
  title: string;
  summary: string;
}): { title: string; description: string } {
  return { title: withSuffix(input.title), description: input.summary };
}

export function helpMetadata(input: {
  title: string;
  summary: string;
}): { title: string; description: string } {
  return { title: withSuffix(input.title), description: input.summary };
}

/**
 * Davet sayfası metadata'sı.
 *
 * Gizlilik (docs/SEO_STRATEGY.md §12): kart yalnızca plan başlığı, tarih, ilçe ve
 * katılım çağrısı içerir. Katılımcı ismi, telefon, bütçe veya özel not **yer almaz**.
 */
export function inviteMetadata(input: {
  planName: string;
  dateLabel: string;
  districtName: string | null;
}): { title: string; description: string } {
  const location = input.districtName ? `${input.districtName} · ` : '';
  return {
    title: `${input.planName} — Sen de katıl | ${SITE_NAME}`,
    description: `${location}${input.dateLabel}. Uygun mekân paketlerini birlikte oylayalım. Katılmak için uygulama indirmene gerek yok.`,
  };
}

// ---------------------------------------------------------------------------
// Doğrulama yardımcıları (testlerde ve admin panelinde kullanılır)
// ---------------------------------------------------------------------------

export interface SeoTextIssue {
  field: 'title' | 'description';
  severity: 'error' | 'warning';
  message: string;
}

export function validateSeoText(title: string, description: string): SeoTextIssue[] {
  const issues: SeoTextIssue[] = [];

  if (title.trim().length === 0) {
    issues.push({ field: 'title', severity: 'error', message: 'Başlık boş olamaz.' });
  } else if (title.length > SEO_TITLE_MAX_LENGTH) {
    issues.push({
      field: 'title',
      severity: 'warning',
      message: `Başlık ${SEO_TITLE_MAX_LENGTH} karakteri aşıyor (${title.length}).`,
    });
  } else if (title.length < 15) {
    issues.push({ field: 'title', severity: 'warning', message: 'Başlık çok kısa.' });
  }

  if (description.trim().length === 0) {
    issues.push({ field: 'description', severity: 'error', message: 'Açıklama boş olamaz.' });
  } else if (description.length > SEO_DESCRIPTION_MAX_LENGTH) {
    issues.push({
      field: 'description',
      severity: 'warning',
      message: `Açıklama ${SEO_DESCRIPTION_MAX_LENGTH} karakteri aşıyor (${description.length}).`,
    });
  } else if (description.length < 50) {
    issues.push({ field: 'description', severity: 'warning', message: 'Açıklama çok kısa.' });
  }

  return issues;
}
