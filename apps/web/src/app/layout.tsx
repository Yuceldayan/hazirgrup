import type { Metadata, Viewport } from 'next';
import {
  organizationJsonLd,
  serializeJsonLd,
  SITE_NAME,
  SITE_TAGLINE,
  webSiteJsonLd,
} from '@hazirgrup/core';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { themeInitScript } from '@/components/layout/ThemeToggle';
import { allowIndexing, env } from '@/lib/env';
import styles from '@/components/layout/layout.module.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s`,
  },
  description:
    'Arkadaş grubunun kişi sayısına, bütçesine ve saatine uygun mekân paketlerini bul. Tek bağlantıyla davet et, birlikte oyla, rezervasyon talebi gönder.',
  applicationName: SITE_NAME,
  // Üretim dışı ortamlarda site tamamen kapalıdır (docs/SEO_STRATEGY.md §6).
  robots: allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: SITE_NAME,
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0D17' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = [organizationJsonLd(env.siteUrl), webSiteJsonLd(env.siteUrl)];

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema tercihini ilk boyamadan önce uygula (FOUC önleme) */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body>
        <a href="#icerik" className="skip-link">
          İçeriğe atla
        </a>
        <div className={styles.shell}>
          <SiteHeader />
          <main id="icerik" className={styles.main}>
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
