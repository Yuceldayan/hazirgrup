import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy (eski adıyla middleware) — route koruması ve SEO yönlendirmeleri.
 *
 * ÖNEMLİ: Bu katman yalnızca ilk savunmadır. Asıl yetkilendirme sunucu
 * bileşenlerindeki `requireUser()/requireRole()` ve veritabanı RLS'i ile yapılır
 * (docs/SECURITY_MODEL.md §3). Burada oturum içeriği DOĞRULANMAZ; yalnızca
 * cookie'nin varlığına bakılarak gereksiz sayfa render'ı önlenir.
 */

const PROTECTED_PREFIXES = ['/hesap', '/business', '/admin'];

/** Oturum gerektirmeyen istisnalar (giriş öncesi erişilebilir). */
const PUBLIC_EXCEPTIONS = ['/business/basvuru'];

const SESSION_COOKIE = 'hg_session';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isException = PUBLIC_EXCEPTIONS.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isException) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/giris';
      url.search = `?devam=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // Private alanlar arama motorlarına kapalıdır (ikinci güvence; sayfa
  // metadata'sı zaten noindex üretir).
  if (isProtected || pathname.startsWith('/davet')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Statik dosyalar ve görseller hariç tüm yollar.
     */
    '/((?!_next/static|_next/image|favicon.svg|logo.svg|og-default.svg|media/|sitemap.xml|robots.txt).*)',
  ],
};
