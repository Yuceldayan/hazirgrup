import Link from 'next/link';
import type { PlanSummary } from '@hazirgrup/core';
import {
  formatDate,
  formatTimeRange,
  PLAN_STATUS_ICONS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_TONES,
  planProgress,
} from '@hazirgrup/core';
import { Badge, Card, LinkButton, Progress } from '@/components/ui';

/**
 * Plan kartı.
 *
 * Her kartta "bir sonraki yapılacak işlem" gösterilir — kullanıcı her zaman
 * ne yapması gerektiğini bilir (docs/INFORMATION_ARCHITECTURE.md §1.4).
 */
export function PlanCard({ summary, viewerId }: { summary: PlanSummary; viewerId: string }) {
  const { plan, nextAction } = summary;
  const isOwner = plan.ownerId === viewerId;
  const canShowAction = !nextAction.ownerOnly || isOwner;

  return (
    <Card>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Badge tone={PLAN_STATUS_TONES[plan.status]} icon={PLAN_STATUS_ICONS[plan.status]}>
            {PLAN_STATUS_LABELS[plan.status]}
          </Badge>

          <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
            <Link href={`/hesap/plan/${plan.id}`}>{plan.name}</Link>
          </h3>

          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {formatDate(plan.eventDate)}
            {plan.startTime || plan.endTime
              ? ` · ${formatTimeRange(plan.startTime, plan.endTime)}`
              : ''}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {summary.district ? `${summary.district.name}, ` : ''}
            {summary.city.name} · {summary.participantCount} katılımcı ({summary.goingCount}{' '}
            geliyor)
          </p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Progress
          value={planProgress(plan.status)}
          label="İlerleme"
          hint={`${summary.matchCount} uygun paket`}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Sıradaki adım</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{nextAction.label}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {nextAction.description}
          </p>
        </div>

        {canShowAction && nextAction.href ? (
          <LinkButton href={nextAction.href} size="sm">
            {nextAction.label}
          </LinkButton>
        ) : (
          <LinkButton href={`/hesap/plan/${plan.id}`} size="sm" variant="secondary">
            Planı aç
          </LinkButton>
        )}
      </div>
    </Card>
  );
}
