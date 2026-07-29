import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  formatDate,
  formatTimeRange,
  PLAN_STATUS_ICONS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_TONES,
  planProgress,
  type PlanSummary,
} from '@hazirgrup/core';
import { Badge, Card, Progress, Txt } from '@/components/ui';
import { useTheme } from '@/theme';

/** Plan kartı — sıradaki adımı her zaman gösterir. */
export function PlanListItem({
  summary,
  viewerId,
}: {
  summary: PlanSummary;
  viewerId: string;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { plan, nextAction } = summary;
  const canShowAction = !nextAction.ownerOnly || plan.ownerId === viewerId;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${plan.name} planını aç`}
      onPress={() => router.push(`/plan/${plan.id}`)}
    >
      <Card>
        <Badge
          tone={PLAN_STATUS_TONES[plan.status]}
          icon={PLAN_STATUS_ICONS[plan.status]}
          label={PLAN_STATUS_LABELS[plan.status]}
        />

        <Txt variant="h3">{plan.name}</Txt>

        <Txt variant="small" color="secondary">
          {formatDate(plan.eventDate)}
          {plan.startTime ? ` · ${formatTimeRange(plan.startTime, plan.endTime)}` : ''}
        </Txt>
        <Txt variant="small" color="secondary">
          {summary.district ? `${summary.district.name}, ` : ''}
          {summary.city.name} · {summary.participantCount} katılımcı ({summary.goingCount}{' '}
          geliyor)
        </Txt>

        <Progress value={planProgress(plan.status)} />

        <View
          style={{
            marginTop: theme.spacing.xs,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderDefault,
          }}
        >
          <Txt variant="caption" color="muted">
            Sıradaki adım
          </Txt>
          <Txt variant="bodyStrong">
            {canShowAction ? nextAction.label : 'Plan sahibinin işlemi bekleniyor'}
          </Txt>
          <Txt variant="small" color="secondary">
            {nextAction.description}
          </Txt>
        </View>
      </Card>
    </Pressable>
  );
}
