import type { Metadata } from 'next';
import { requireUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { EmptyState, LinkButton } from '@/components/ui';
import { PackageCard } from '@/components/PackageCard';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Favorilerim | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const user = await requireUser('/hesap/favoriler');
  const repo = await getRepository();

  const favorites = await repo.listFavorites(user.id);
  const packages = await Promise.all(
    favorites.map(async (favorite) => {
      const pkg = await repo.getPackage(favorite.packageId);
      return pkg ? repo.getPublicPackage(pkg.slug) : null;
    }),
  );
  const visible = packages.filter((pkg): pkg is NonNullable<typeof pkg> => pkg !== null);

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Favorilerim</h1>
        <p className={styles.panelSubtitle}>
          Beğendiğin paketleri kaydet, plan oluştururken hızlıca bul.
        </p>
      </header>

      {visible.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Henüz favori paketin yok"
          description="Beğendiğin paketleri kaydederek burada topla."
          action={<LinkButton href="/kategoriler">Paketlere göz at</LinkButton>}
        />
      ) : (
        <div className={publicStyles.grid}>
          {visible.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
