import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPlanSummary, groupPlansByTab } from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getRepository, getServiceContext, todayDate } from '@/server/repository';
import { EmptyState, LinkButton } from '@/components/ui';
import { PlanCard } from '@/components/PlanCard';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Planlarım | HazırGrup',
  robots: { index: false, follow: false },
};

const TABS = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'yaklasan', label: 'Yaklaşan' },
  { key: 'gecmis', label: 'Geçmiş' },
  { key: 'taslak', label: 'Taslaklar' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ sekme?: string }>;
}) {
  const user = await requireUser('/hesap/planlar');
  const { sekme } = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === sekme) ? (sekme as TabKey) : 'aktif';

  const ctx = await getServiceContext();
  const repo = await getRepository();
  const today = todayDate();

  const plans = await repo.listPlansForUser(user.id);
  const summaries = await Promise.all(plans.map((plan) => buildPlanSummary(ctx, plan, user.id)));
  const grouped = groupPlansByTab(summaries, today);

  const lists = {
    aktif: grouped.active,
    yaklasan: grouped.upcoming,
    gecmis: grouped.past,
    taslak: grouped.drafts,
  } as const;

  const current = lists[activeTab];

  const emptyContent: Record<TabKey, { title: string; description: string }> = {
    aktif: {
      title: 'Aktif planın yok',
      description: 'İlk planını oluştur ve arkadaşlarını tek bağlantıyla davet et.',
    },
    yaklasan: {
      title: 'Yaklaşan planın yok',
      description: 'Rezervasyonu onaylanan planların burada görünür.',
    },
    gecmis: {
      title: 'Geçmiş planın yok',
      description: 'Tamamlanan ve iptal edilen planların burada listelenir.',
    },
    taslak: {
      title: 'Yarım kalan planın yok',
      description: 'Sihirbazı yarıda bıraktığın planlar burada birikir.',
    },
  };

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Planlarım</h1>
        <p className={styles.panelSubtitle}>
          Oluşturduğun ve katıldığın tüm planlar. Her kartta sıradaki adımı görürsün.
        </p>
      </header>

      <nav className={publicStyles.chipRow} style={{ marginBottom: 20 }} aria-label="Plan sekmeleri">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/hesap/planlar?sekme=${tab.key}`}
            className={publicStyles.chip}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            style={
              activeTab === tab.key
                ? {
                    borderColor: 'var(--color-brand-default)',
                    background: 'var(--color-brand-surface)',
                    color: 'var(--color-brand-text)',
                    fontWeight: 600,
                  }
                : undefined
            }
          >
            {tab.label}
            <span className={publicStyles.chipCount}>{lists[tab.key].length}</span>
          </Link>
        ))}
      </nav>

      {current.length === 0 ? (
        <EmptyState
          icon="📋"
          title={emptyContent[activeTab].title}
          description={emptyContent[activeTab].description}
          action={<LinkButton href="/hesap/plan/yeni">Yeni plan oluştur</LinkButton>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {current.map((summary) => (
            <PlanCard key={summary.plan.id} summary={summary} viewerId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
