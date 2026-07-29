import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Dinamik Open Graph görseli (docs/DECISIONS.md D-010).
 *
 * Harici servis kullanılmaz; `next/og` ile yerel üretilir. Üretim başarısız
 * olursa sade bir yedek kart döner — akış hiçbir koşulda bozulmaz.
 *
 * Gizlilik: yalnızca sorgu ile gelen genel metinler kullanılır. Davet
 * sayfalarında kişisel veri gönderilmez (docs/SEO_STRATEGY.md §12).
 */

export const runtime = 'nodejs';
export const revalidate = 86400;

const MAX_TITLE_LENGTH = 110;
const MAX_SUBTITLE_LENGTH = 90;

function clean(value: string | null, maxLength: number): string {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = clean(params.get('baslik'), MAX_TITLE_LENGTH) || 'HazırGrup';
  const subtitle =
    clean(params.get('altbaslik'), MAX_SUBTITLE_LENGTH) ||
    'Grubunu oluştur, paketini seç, birlikte karar ver.';

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            background: 'linear-gradient(135deg, #4F46E5 0%, #312E81 100%)',
            color: '#FFFFFF',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              HG
            </div>
            <span style={{ fontSize: 28, fontWeight: 600 }}>HazırGrup</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.14 }}>{title}</span>
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.82)' }}>{subtitle}</span>
          </div>

          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.68)' }}>
            hazirgrup — arkadaş gruplarına uygun mekân paketleri
          </span>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch (error) {
    console.error('[hazirgrup] OG görseli üretilemedi, yedek görsele düşülüyor', {
      message: error instanceof Error ? error.message : 'bilinmeyen',
    });
    // Yedek: statik varsayılan görsel.
    return Response.redirect(new URL('/og-default.svg', request.nextUrl.origin), 302);
  }
}
