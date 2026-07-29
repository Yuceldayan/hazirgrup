'use client';

import { useEffect } from 'react';
import { Button, EmptyState, LinkButton } from '@/components/ui';

/**
 * Genel hata sınırı.
 *
 * Kullanıcıya teknik ayrıntı gösterilmez (docs/DESIGN_SYSTEM.md §11);
 * yalnızca anlaşılır Türkçe mesaj ve "Tekrar dene" aksiyonu sunulur.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hassas veri loglanmaz; yalnızca korelasyon kimliği ve mesaj.
    console.error('[hazirgrup] beklenmedik hata', { digest: error.digest });
  }, [error]);

  return (
    <div className="container" style={{ maxWidth: 640, paddingBlock: 48 }}>
      <EmptyState
        icon="⚠️"
        title="Bir şeyler ters gitti"
        description="Beklenmedik bir sorun oluştu. Tekrar denemek çoğu zaman işe yarar."
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button onClick={reset}>Tekrar dene</Button>
            <LinkButton href="/" variant="secondary">
              Ana sayfaya dön
            </LinkButton>
          </div>
        }
      />
      {error.digest ? (
        <p
          style={{
            textAlign: 'center',
            marginTop: 12,
            fontSize: 12,
            color: 'var(--color-text-muted)',
          }}
        >
          Destek kodu: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
