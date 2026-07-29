import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

/** Monorepo kökü — Next.js'in yanlış workspace kökü seçmesini engeller. */
const MONOREPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Next.js yapılandırması.
 *
 * Güvenlik başlıkları docs/SECURITY_MODEL.md §12 ile uyumludur.
 * Trailing slash politikası tutarlıdır: yok (docs/SEO_STRATEGY.md §4).
 */

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline'",
      /*
        `'unsafe-inline'` ZORUNLUDUR — tercih değil.

        App Router, RSC yükünü (`self.__next_f.push(...)`) satır içi <script>
        etiketleriyle aktarır. Bunlar engellenirse hydration HİÇ tamamlanmaz ve
        tüm istemci etkileşimi (sihirbaz, mobil menü, tema düğmesi) sessizce ölür.

        Nonce tabanlı katı CSP mümkündür ancak Next.js nonce kullanan her sayfayı
        dinamik render eder; bu da SEO için kritik olan statik/ISR üretimini
        (docs/DECISIONS.md D-020) tamamen ortadan kaldırırdı.

        Karar ve azaltıcı önlemler: docs/DECISIONS.md D-031,
        docs/KNOWN_LIMITATIONS.md L-15. `object-src`, `base-uri`, `form-action`
        ve `frame-ancestors` kilitli kalır.

        `'unsafe-eval'` yalnızca geliştirme modunda açıktır.
      */
      isProduction
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "object-src 'none'",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

if (isProduction) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  poweredByHeader: false,

  turbopack: { root: MONOREPO_ROOT },

  // Workspace paketleri TypeScript kaynağı olarak yayımlanır.
  transpilePackages: [
    '@hazirgrup/core',
    '@hazirgrup/types',
    '@hazirgrup/ui',
    '@hazirgrup/validation',
  ],

  images: {
    // Demo görselleri yereldir; harici kaynak eklendiğinde buraya tanımlanır.
    remotePatterns: [],
    formats: ['image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Davet bağlantısındaki tokenın referrer ile sızmasını engelle.
        source: '/davet/:path*',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
};

export default nextConfig;
