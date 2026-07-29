import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  buildPlanDetail,
  castVote,
  closeVoting,
  computeMatches,
  countParticipation,
  estimateAttendance,
  explainAttendance,
  formatCurrency,
  formatDate,
  formatPeopleRange,
  formatTimeRange,
  PLAN_STATUS_DESCRIPTIONS,
  PLAN_STATUS_ICONS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_TONES,
  planProgress,
  resolveBudget,
  resolveTie,
  startVoting,
  suggestRelaxations,
  userMessageOf,
} from '@hazirgrup/core';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingCards,
  Progress,
  Txt,
} from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getServiceContext } from '@/data/repository';
import { useAuth } from '@/state/AuthContext';
import { planScreenCapabilities } from '@/screens/state';
import { useTheme } from '@/theme';

/** Plan detayı — durum, katılımcılar, paketler, oylama ve rezervasyon tek ekranda. */
export default function PlanDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, isLoading, reload } = useAsync(async () => {
    if (!user || !id) return null;

    const ctx = await getServiceContext();
    const plan = await ctx.repo.getPlan(id);
    if (!plan) return null;

    const participants = await ctx.repo.listParticipants(plan.id);
    const isOwner = plan.ownerId === user.id;
    const viewerParticipant = participants.find((p) => p.userId === user.id) ?? null;
    if (!isOwner && !viewerParticipant) return { forbidden: true as const };

    const detail = await buildPlanDetail(ctx, plan, user.id);
    const { outcome } = await computeMatches(ctx, plan);
    const counts = countParticipation(participants.map((p) => p.status));
    const estimated = estimateAttendance({
      counts,
      planEstimatedPeople: plan.estimatedPeople,
      planMinPeople: plan.minPeople,
    });

    return {
      forbidden: false as const,
      detail,
      plan,
      participants,
      isOwner,
      viewerParticipant,
      counts,
      estimated,
      relaxations: detail.matches.length === 0 ? suggestRelaxations(outcome) : [],
      budget: resolveBudget({
        mode: plan.budgetMode,
        perPerson: plan.budgetPerPerson,
        total: plan.budgetTotal,
        people: estimated,
      }),
      nowMs: ctx.nowMs,
    };
  }, [id, user?.id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null);
    setBusy(true);
    try {
      await action();
      reload();
    } catch (cause) {
      setActionError(userMessageOf(cause));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <EmptyState
          icon="🔍"
          title="Plan bulunamadı"
          description="Bu plan silinmiş veya bağlantı hatalı olabilir."
          action={<Button title="Planlarıma dön" onPress={() => router.replace('/(tabs)/planlar')} />}
        />
      </View>
    );
  }

  if (data.forbidden) {
    return (
      <View style={{ padding: theme.spacing.base }}>
        <EmptyState
          icon="🔒"
          title="Bu planı görüntüleme yetkin yok"
          description="Yalnızca planı oluşturan kişi ve katılımcılar görebilir."
          action={<Button title="Planlarıma dön" onPress={() => router.replace('/(tabs)/planlar')} />}
        />
      </View>
    );
  }

  const { detail, plan, participants, isOwner, viewerParticipant, counts, estimated, budget } =
    data;

  const caps = planScreenCapabilities({
    status: plan.status,
    isOwner,
    isParticipant: viewerParticipant !== null,
    participationStatus: viewerParticipant?.status ?? null,
    matchCount: detail.matches.length,
    votingResult: detail.votingResult,
    winningPackageId: plan.winningPackageId,
    votingEndsAt: plan.votingEndsAt,
    nowMs: data.nowMs,
  });

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.lg }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
    >
      {/* --- Durum -------------------------------------------------------- */}
      <View style={{ gap: 8 }}>
        <Badge
          tone={PLAN_STATUS_TONES[plan.status]}
          icon={PLAN_STATUS_ICONS[plan.status]}
          label={PLAN_STATUS_LABELS[plan.status]}
        />
        <Txt variant="h1">{plan.name}</Txt>
        <Txt variant="small" color="secondary">
          {PLAN_STATUS_DESCRIPTIONS[plan.status]}
        </Txt>
        <Progress value={planProgress(plan.status)} />
      </View>

      {actionError ? <Alert tone="error" message={actionError} /> : null}

      {/* --- Sıradaki adım ------------------------------------------------ */}
      {plan.status !== 'cancelled' && plan.status !== 'completed' ? (
        <Card>
          <Txt variant="caption" color="muted">
            Sıradaki adım
          </Txt>
          <Txt variant="h3">{detail.nextAction.label}</Txt>
          <Txt variant="small" color="secondary">
            {detail.nextAction.description}
          </Txt>

          {caps.canInvite ? (
            <Button
              title="Arkadaşlarını davet et"
              fullWidth
              onPress={() => router.push(`/plan/${plan.id}/davet`)}
            />
          ) : null}

          {caps.canStartVoting ? (
            <Button
              title="Oylamayı başlat"
              fullWidth
              loading={busy}
              onPress={() =>
                runAction(async () => {
                  const ctx = await getServiceContext();
                  await startVoting(ctx, {
                    planId: plan.id,
                    userId: user!.id,
                    endsAt: null,
                    matchCount: detail.matches.length,
                  });
                })
              }
            />
          ) : null}

          {caps.canCloseVoting ? (
            <Button
              title="Oylamayı bitir"
              variant="secondary"
              fullWidth
              loading={busy}
              onPress={() =>
                runAction(async () => {
                  const ctx = await getServiceContext();
                  await closeVoting(ctx, { planId: plan.id, userId: user!.id });
                })
              }
            />
          ) : null}

          {caps.canCreateReservation ? (
            <Button
              title="Rezervasyon talebi gönder"
              fullWidth
              onPress={() => router.push(`/plan/${plan.id}/rezervasyon`)}
            />
          ) : null}
        </Card>
      ) : null}

      {/* --- Plan bilgileri ------------------------------------------------ */}
      <Card>
        <Txt variant="h2">Plan bilgileri</Txt>
        {[
          ['Tarih', formatDate(plan.eventDate)],
          [
            'Saat',
            `${formatTimeRange(plan.startTime, plan.endTime)}${plan.isTimeFlexible ? ' (esnek)' : ''}`,
          ],
          ['Konum', `${detail.district ? `${detail.district.name}, ` : ''}${detail.city.name}`],
          ['Kişi sayısı', `${estimated} kişi (${plan.minPeople}–${plan.maxPeople})`],
          [
            'Bütçe',
            `${formatCurrency(budget.perPerson)} kişi başı · ${formatCurrency(budget.total)} toplam`,
          ],
          ['Aktivite', detail.categories.map((c) => c.name).join(', ') || '—'],
        ].map(([label, value]) => (
          <View
            key={label}
            style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
          >
            <Txt variant="small" color="secondary">
              {label}
            </Txt>
            <Txt variant="small" style={{ flex: 1, textAlign: 'right' }}>
              {value}
            </Txt>
          </View>
        ))}
        <Txt variant="caption" color="muted">
          {explainAttendance(counts, estimated)}
        </Txt>
      </Card>

      {/* --- Katılımcılar ------------------------------------------------- */}
      <Card>
        <Txt variant="h2">Katılımcılar ({participants.length})</Txt>
        <Txt variant="small" color="secondary">
          {counts.going} geliyor · {counts.maybe} kararsız · {counts.notGoing} gelmiyor ·{' '}
          {counts.pending} cevapsız
        </Txt>
        {participants.map((participant) => (
          <View key={participant.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Txt>
              {participant.status === 'going'
                ? '✅'
                : participant.status === 'maybe'
                  ? '🤔'
                  : participant.status === 'not_going'
                    ? '🚫'
                    : '⏳'}
            </Txt>
            <Txt variant="small">
              {participant.displayName}
              {participant.isOwner ? ' · plan sahibi' : ''}
              {participant.id === viewerParticipant?.id ? ' · sen' : ''}
            </Txt>
          </View>
        ))}
      </Card>

      {/* --- Paketler / oylama --------------------------------------------- */}
      <View style={{ gap: theme.spacing.sm }}>
        <Txt variant="h2">{plan.status === 'voting' ? 'Oylama' : 'Uygun paketler'}</Txt>

        {detail.matches.length === 0 ? (
          <>
            <EmptyState
              icon="📦"
              title="Grubuna uygun paket bulunamadı"
              description="Bütçeyi, kişi sayısını veya saati değiştirerek daha fazla paket görebilirsin."
            />
            {data.relaxations.map((suggestion) => (
              <Card key={suggestion.key} flat>
                <Txt variant="bodyStrong">{suggestion.label}</Txt>
                <Txt variant="small" color="secondary">
                  {suggestion.description}
                </Txt>
              </Card>
            ))}
          </>
        ) : (
          detail.matches.map((match) => {
            const tally = detail.votingResult?.tallies.find(
              (t) => t.packageId === match.package.id,
            );
            const isSelected = detail.viewerVote?.packageId === match.package.id;
            const isWinner = plan.winningPackageId === match.package.id;
            const isTieCandidate =
              caps.canBreakTie &&
              detail.votingResult?.leadingPackageIds.includes(match.package.id);

            const canPress = caps.canVote || isTieCandidate;

            return (
              <Pressable
                key={match.package.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                disabled={!canPress || busy}
                onPress={() =>
                  runAction(async () => {
                    const ctx = await getServiceContext();
                    if (isTieCandidate) {
                      await resolveTie(ctx, {
                        planId: plan.id,
                        userId: user!.id,
                        packageId: match.package.id,
                      });
                    } else {
                      await castVote(ctx, {
                        planId: plan.id,
                        participantId: viewerParticipant!.id,
                        packageId: match.package.id,
                      });
                    }
                  })
                }
              >
                <Card
                  style={{
                    borderWidth: 2,
                    borderColor: isWinner
                      ? theme.colors.successSolid
                      : isSelected
                        ? theme.colors.brandDefault
                        : theme.colors.borderDefault,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Txt variant="bodyStrong">
                        {isWinner ? '🏆 ' : ''}
                        {match.package.name}
                      </Txt>
                      <Txt variant="small" color="secondary">
                        {match.business.name} · {match.district.name} ·{' '}
                        {formatPeopleRange(match.package.minPeople, match.package.maxPeople)}
                      </Txt>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Txt variant="bodyStrong">
                        {formatCurrency(match.pricing.perPersonPrice)}
                      </Txt>
                      <Txt variant="caption" color="muted">
                        kişi başı
                      </Txt>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {match.reasons.slice(0, 3).map((reason) => (
                      <Badge
                        key={reason.key}
                        tone={
                          reason.tone === 'positive'
                            ? 'success'
                            : reason.tone === 'warning'
                              ? 'warning'
                              : 'neutral'
                        }
                        label={reason.label}
                      />
                    ))}
                  </View>

                  {caps.showVoteCounts && tally ? (
                    <View style={{ gap: 4 }}>
                      <Txt variant="small">{tally.count} oy</Txt>
                      {tally.voterNames.length > 0 ? (
                        <Txt variant="caption" color="muted">
                          {tally.voterNames.join(', ')}
                        </Txt>
                      ) : null}
                    </View>
                  ) : null}

                  {isSelected ? (
                    <Txt variant="caption" color="brand">
                      ✓ Senin oyun
                    </Txt>
                  ) : null}
                </Card>
              </Pressable>
            );
          })
        )}
      </View>

      {/* --- Rezervasyon ---------------------------------------------------- */}
      {detail.reservation ? (
        <Card>
          <Txt variant="h2">Rezervasyon</Txt>
          <Txt variant="bodyStrong">{detail.reservation.business.name}</Txt>
          <Txt variant="small" color="secondary">
            {detail.reservation.reservation.peopleCount} kişi ·{' '}
            {formatCurrency(detail.reservation.reservation.totalPrice)}
          </Txt>
          <Button
            title="Rezervasyon detayı"
            variant="secondary"
            onPress={() => router.push(`/rezervasyon/${detail.reservation!.reservation.id}`)}
          />
        </Card>
      ) : null}

      {plan.status === 'cancelled' ? (
        <Alert
          tone="error"
          title="Bu plan iptal edildi"
          message={plan.cancelledReason ?? 'Plan sahibi planı iptal etti.'}
        />
      ) : null}
    </ScrollView>
  );
}
