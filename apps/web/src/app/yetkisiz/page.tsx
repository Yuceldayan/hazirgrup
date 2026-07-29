import type { Metadata } from 'next';
import { EmptyState, LinkButton } from '@/components/ui';

/**
 * Yetkisiz erişim ekranı.
 *
 * Yetki hatasında ham hata sınırı yerine anlaşılır bir sayfa gösterilir
 * (docs/DESIGN_SYSTEM.md §11). Güvenlik kararı sunucuda verilmiştir; bu sayfa
 * yalnızca sonucu iletir.
 */
export const metadata: Metadata = {
  title: 'Yetkin yok | HazırGrup',
  robots: { index: false, follow: false, nocache: true },
};

export default function UnauthorizedPage() {
  return (
    <div className="container" style={{ maxWidth: 640, paddingBlock: 48 }}>
      <EmptyState
        icon="🔒"
        title="Bu sayfayı görüntüleme yetkin yok"
        description="Bu alan yalnızca yetkili hesaplara açıktır. Yanlış hesapla giriş yapmış olabilirsin."
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <LinkButton href="/hesap">Hesabıma dön</LinkButton>
            <LinkButton href="/" variant="secondary">
              Ana sayfa
            </LinkButton>
          </div>
        }
      />
    </div>
  );
}
