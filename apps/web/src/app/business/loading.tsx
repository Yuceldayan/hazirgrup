import { Skeleton, SkeletonCard } from '@/components/ui';

/** Hesap alanı yükleme hali — skeleton'lar gerçek içerik yüksekliğinde (CLS koruması). */
export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <span className="sr-only" role="status">
        Yükleniyor
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton height={32} width="55%" />
        <Skeleton height={18} width="80%" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
