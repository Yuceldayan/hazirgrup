import type { MetadataRoute } from 'next';
import { absoluteUrl, NOINDEX_PREFIXES } from '@hazirgrup/core';
import { allowIndexing, env } from '@/lib/env';

/**
 * Dinamik robots.txt (docs/SEO_STRATEGY.md §6).
 *
 * Staging koruması: `NEXT_PUBLIC_ENVIRONMENT !== 'production'` olduğunda tüm
 * site taramaya kapatılır.
 */

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: NOINDEX_PREFIXES.map((prefix) => `${prefix}/`),
      },
    ],
    sitemap: absoluteUrl(env.siteUrl, '/sitemap.xml'),
    host: env.siteUrl,
  };
}
