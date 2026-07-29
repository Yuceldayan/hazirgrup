import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Auth alanı hiçbir zaman indekslenmez (docs/SEO_STRATEGY.md §2). */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container" style={{ maxWidth: 460, paddingBlock: 24 }}>
      {children}
      <p
        style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--color-text-muted)',
        }}
      >
        Devam ederek <Link href="/legal/kullanim-kosullari">kullanım koşullarını</Link> ve{' '}
        <Link href="/legal/gizlilik-politikasi">gizlilik politikasını</Link> kabul etmiş olursun.
      </p>
    </div>
  );
}
