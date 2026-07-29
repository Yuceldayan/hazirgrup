import type { Metadata } from 'next';
import type { PageMetadata } from '@hazirgrup/core';

/**
 * `packages/core` tarafından üretilen sayfa metadata'sını Next.js Metadata
 * nesnesine çevirir. Tek dönüşüm noktası olduğu için SEO kuralları her sayfada
 * aynı biçimde uygulanır.
 */
export function toNextMetadata(meta: PageMetadata): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    robots: {
      index: meta.robots.index,
      follow: meta.robots.follow,
      googleBot: { index: meta.robots.index, follow: meta.robots.follow },
    },
    openGraph: {
      title: meta.openGraph.title,
      description: meta.openGraph.description,
      url: meta.openGraph.url,
      siteName: meta.openGraph.siteName,
      locale: meta.openGraph.locale,
      type: meta.openGraph.type,
      images: meta.openGraph.images,
    },
    twitter: {
      card: meta.twitter.card,
      title: meta.twitter.title,
      description: meta.twitter.description,
      images: meta.openGraph.images.map((image) => image.url),
    },
  };
}
