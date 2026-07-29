import type { Metadata } from 'next';
import { ROUTES } from '@hazirgrup/core';
import { EmptyState, LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı | HazırGrup',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container" style={{ maxWidth: 640, paddingBlock: 48 }}>
      <EmptyState
        icon="🧭"
        title="Bu sayfayı bulamadık"
        description="Aradığın sayfa taşınmış veya kaldırılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsin."
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <LinkButton href="/">Ana sayfaya dön</LinkButton>
            <LinkButton href={ROUTES.cities()} variant="secondary">
              Şehirlere göz at
            </LinkButton>
            <LinkButton href={ROUTES.faq()} variant="ghost">
              Yardım
            </LinkButton>
          </div>
        }
      />
    </div>
  );
}
