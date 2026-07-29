import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDate, formatTimeRange } from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getServiceContext } from '@/server/repository';
import { Alert, Breadcrumb, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { InvitePanel } from './InvitePanel';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Arkadaşlarını davet et | HazırGrup',
  robots: { index: false, follow: false },
};

interface Params {
  params: Promise<{ id: string }>;
}

export default async function InviteManagementPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser(`/hesap/plan/${id}/davet`);
  const ctx = await getServiceContext();

  const plan = await ctx.repo.getPlan(id);
  if (!plan) notFound();

  if (plan.ownerId !== user.id) {
    return (
      <EmptyState
        icon="🔒"
        title="Bu sayfayı yalnızca plan sahibi görebilir"
        description="Davet bağlantısını planı oluşturan kişi üretebilir."
        action={<LinkButton href={`/hesap/plan/${id}`}>Plana dön</LinkButton>}
      />
    );
  }

  const invitation = await ctx.repo.getActiveInvitation(plan.id);
  const participants = await ctx.repo.listParticipants(plan.id);

  return (
    <div>
      <Breadcrumb
        items={[
          { name: 'Planlarım', href: '/hesap/planlar' },
          { name: plan.name, href: `/hesap/plan/${plan.id}` },
          { name: 'Davet' },
        ]}
      />

      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Arkadaşlarını davet et</h1>
        <p className={styles.panelSubtitle}>
          {plan.name} · {formatDate(plan.eventDate)}
          {plan.startTime ? ` · ${formatTimeRange(plan.startTime, plan.endTime)}` : ''}
        </p>
      </header>

      {plan.status === 'draft' ? (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="warning" title="Plan henüz taslak">
            Davet bağlantısı oluşturabilirsin ancak planı yayına almadan arkadaşların paketleri
            göremez.
          </Alert>
        </div>
      ) : null}

      <InvitePanel
        planId={plan.id}
        hasActiveInvitation={invitation !== null}
        shortCode={invitation?.shortCode ?? null}
      />

      <section style={{ marginTop: 32 }}>
        <SectionHeader
          title="Davet nasıl çalışır?"
          description="Arkadaşlarının hesap açmasına gerek yok."
        />
        <Card flat>
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 14,
              color: 'var(--color-text-secondary)',
            }}
          >
            <li>1. Bağlantıyı WhatsApp grubuna gönder.</li>
            <li>2. Arkadaşların bağlantıya dokunup adını yazar.</li>
            <li>3. &ldquo;Katılıyorum / Kararsızım / Katılmıyorum&rdquo; seçer.</li>
            <li>4. Uygun paketleri görüp oy verir.</li>
            <li>5. Sen oylamayı bitirip rezervasyon talebini gönderirsin.</li>
          </ol>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 12 }}>
            Paylaşım kartında yalnızca plan adı, tarih ve ilçe görünür; bütçe, katılımcı
            isimleri ve özel notun paylaşılmaz.
          </p>
        </Card>
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader title={`Şu ana kadar katılanlar (${participants.length})`} />
        {participants.length <= 1 ? (
          <EmptyState
            icon="👥"
            title="Henüz kimse katılmadı"
            description="WhatsApp bağlantısını paylaşarak arkadaşlarını plana çağır."
          />
        ) : (
          <Card>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {participants.map((participant) => (
                <li key={participant.id} style={{ fontSize: 14 }}>
                  {participant.status === 'going'
                    ? '✅'
                    : participant.status === 'maybe'
                      ? '🤔'
                      : participant.status === 'not_going'
                        ? '🚫'
                        : '⏳'}{' '}
                  {participant.displayName}
                  {participant.isOwner ? ' (sen)' : ''}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <div style={{ marginTop: 24 }}>
        <LinkButton href={`/hesap/plan/${plan.id}`} variant="secondary">
          ← Plan detayına dön
        </LinkButton>
      </div>
    </div>
  );
}
