import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  buildPlanDetail,
  countParticipation,
  estimateAttendance,
  explainAttendance,
  formatCurrency,
  formatDate,
  formatTimeRange,
  formatTimeRemaining,
  PLAN_STATUS_DESCRIPTIONS,
  PLAN_STATUS_ICONS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_TONES,
  planProgress,
  RESERVATION_STATUS_ICONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  reservationTimelineSteps,
  resolveBudget,
  suggestRelaxations,
  computeMatches,
} from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getServiceContext } from '@/server/repository';
import { publishDraftAction } from '@/server/actions/plan';
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  LinkButton,
  Progress,
  SectionHeader,
  Timeline,
} from '@/components/ui';
import { MemberVoteList } from './MemberVoteList';
import {
  CancelPlanForm,
  CloseVotingForm,
  PublishDraftButton,
  StartVotingForm,
} from './PlanActions';
import { ParticipationControls } from './ParticipationControls';
import styles from '@/components/layout/layout.module.css';
import publicStyles from '@/components/public.module.css';

export const metadata: Metadata = {
  title: 'Plan detayı | HazırGrup',
  robots: { index: false, follow: false },
};

interface Params {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser(`/hesap/plan/${id}`);
  const ctx = await getServiceContext();

  const plan = await ctx.repo.getPlan(id);
  if (!plan) notFound();

  // Yetki: yalnızca sahip veya katılımcı görebilir.
  const participants = await ctx.repo.listParticipants(id);
  const isOwner = plan.ownerId === user.id;
  const viewerParticipant = participants.find((p) => p.userId === user.id) ?? null;
  if (!isOwner && !viewerParticipant) {
    return (
      <EmptyState
        icon="🔒"
        title="Bu planı görüntüleme yetkin yok"
        description="Yalnızca planı oluşturan kişi ve katılımcılar bu sayfayı görebilir."
        action={<LinkButton href="/hesap/planlar">Planlarıma dön</LinkButton>}
      />
    );
  }

  const detail = await buildPlanDetail(ctx, plan, user.id);
  const { outcome } = await computeMatches(ctx, plan);
  const relaxations = detail.matches.length === 0 ? suggestRelaxations(outcome) : [];

  const counts = countParticipation(participants.map((p) => p.status));
  const estimated = estimateAttendance({
    counts,
    planEstimatedPeople: plan.estimatedPeople,
    planMinPeople: plan.minPeople,
  });
  const budget = resolveBudget({
    mode: plan.budgetMode,
    perPerson: plan.budgetPerPerson,
    total: plan.budgetTotal,
    people: estimated,
  });

  const votingEndsIn = plan.votingEndsAt
    ? formatTimeRemaining(plan.votingEndsAt, ctx.nowMs)
    : null;

  const canVote =
    plan.status === 'voting' &&
    viewerParticipant !== null &&
    viewerParticipant.status !== 'not_going' &&
    (!plan.votingEndsAt || new Date(plan.votingEndsAt).getTime() > ctx.nowMs);

  const publish = publishDraftAction.bind(null, plan.id);

  return (
    <div>
      {/* --- Başlık ve durum --------------------------------------------- */}
      <header className={styles.panelHeader}>
        <Badge tone={PLAN_STATUS_TONES[plan.status]} icon={PLAN_STATUS_ICONS[plan.status]}>
          {PLAN_STATUS_LABELS[plan.status]}
        </Badge>
        <h1 className={styles.panelTitle} style={{ marginTop: 8 }}>
          {plan.name}
        </h1>
        <p className={styles.panelSubtitle}>{PLAN_STATUS_DESCRIPTIONS[plan.status]}</p>

        <div style={{ marginTop: 16 }}>
          <Progress
            value={planProgress(plan.status)}
            label="Plan ilerlemesi"
            hint={`${detail.matchCount} uygun paket`}
          />
        </div>
      </header>

      {/* --- Sıradaki adım ------------------------------------------------ */}
      {plan.status !== 'cancelled' && plan.status !== 'completed' ? (
        <Card raised>
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Sıradaki adım</p>
              <p style={{ fontSize: 17, fontWeight: 700 }}>{detail.nextAction.label}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {detail.nextAction.description}
              </p>
            </div>
            {(!detail.nextAction.ownerOnly || isOwner) && detail.nextAction.href ? (
              <LinkButton href={detail.nextAction.href}>{detail.nextAction.label}</LinkButton>
            ) : null}
          </div>
        </Card>
      ) : null}

      {plan.status === 'draft' && isOwner ? (
        <div style={{ marginTop: 16 }}>
          <Alert tone="info" title="Bu plan henüz taslak">
            Yayına aldığında davet bağlantısı oluşturulur ve arkadaşların katılabilir.
          </Alert>
          <div style={{ marginTop: 12 }}>
            <PublishDraftButton action={publish} />
          </div>
        </div>
      ) : null}

      {/* --- Plan bilgileri ------------------------------------------------ */}
      <section id="bilgiler" style={{ marginTop: 32 }}>
        <SectionHeader title="Plan bilgileri" />
        <Card>
          <div className={publicStyles.infoList}>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Tarih</span>
              <span className={publicStyles.infoValue}>{formatDate(plan.eventDate)}</span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Saat</span>
              <span className={publicStyles.infoValue}>
                {formatTimeRange(plan.startTime, plan.endTime)}
                {plan.isTimeFlexible ? ' (esnek)' : ''}
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Konum</span>
              <span className={publicStyles.infoValue}>
                {detail.district ? `${detail.district.name}, ` : ''}
                {detail.city.name}
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Kişi sayısı</span>
              <span className={publicStyles.infoValue}>
                {estimated} kişi ({plan.minPeople}–{plan.maxPeople})
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Bütçe</span>
              <span className={publicStyles.infoValue}>
                {formatCurrency(budget.perPerson)} kişi başı ·{' '}
                {formatCurrency(budget.total)} toplam
              </span>
            </div>
            <div className={publicStyles.infoRow}>
              <span className={publicStyles.infoLabel}>Aktivite</span>
              <span className={publicStyles.infoValue}>
                {detail.categories.map((c) => c.name).join(', ') || '—'}
              </span>
            </div>
            {plan.note ? (
              <div className={publicStyles.infoRow}>
                <span className={publicStyles.infoLabel}>Not</span>
                <span className={publicStyles.infoValue}>{plan.note}</span>
              </div>
            ) : null}
          </div>

          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 12 }}>
            {explainAttendance(counts, estimated)}
          </p>
        </Card>
      </section>

      {/* --- Katılımcılar ------------------------------------------------- */}
      <section id="katilimcilar" style={{ marginTop: 32 }}>
        <SectionHeader
          title={`Katılımcılar (${participants.length})`}
          description={`${counts.going} geliyor · ${counts.maybe} kararsız · ${counts.notGoing} gelmiyor · ${counts.pending} cevapsız`}
          action={
            isOwner ? (
              <LinkButton href={`/hesap/plan/${plan.id}/davet`} size="sm">
                Arkadaşlarını davet et
              </LinkButton>
            ) : undefined
          }
        />

        {participants.length <= 1 ? (
          <EmptyState
            icon="👥"
            title="Henüz kimse katılmadı"
            description="WhatsApp bağlantısını paylaşarak arkadaşlarını plana çağır."
            action={
              isOwner ? (
                <LinkButton href={`/hesap/plan/${plan.id}/davet`}>Bağlantıyı paylaş</LinkButton>
              ) : undefined
            }
          />
        ) : (
          <Card>
            <ParticipationControls
              planId={plan.id}
              participants={participants.map((p) => ({
                id: p.id,
                displayName: p.displayName,
                status: p.status,
                isOwner: p.isOwner,
                isViewer: p.id === viewerParticipant?.id,
              }))}
              viewerIsOwner={isOwner}
            />
          </Card>
        )}
      </section>

      {/* --- Paketler ve oylama -------------------------------------------- */}
      <section id="paketler" style={{ marginTop: 32 }}>
        <SectionHeader
          title={plan.status === 'voting' ? 'Oylama' : 'Uygun paketler'}
          description={
            plan.status === 'voting'
              ? votingEndsIn
                ? `Oylamanın bitmesine ${votingEndsIn} kaldı.`
                : 'Oylama devam ediyor. Oyunu istediğin kadar değiştirebilirsin.'
              : `${detail.matchCount} paket, ${estimated} kişilik grubuna göre hesaplandı.`
          }
        />

        {detail.matches.length === 0 ? (
          <div>
            <EmptyState
              icon="📦"
              title="Grubuna uygun paket bulunamadı"
              description="Bütçeyi, kişi sayısını veya saati değiştirerek daha fazla paket görebilirsin."
            />
            {relaxations.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Öneriler</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relaxations.map((suggestion) => (
                    <Card key={suggestion.key} flat>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{suggestion.label}</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {suggestion.description} ({suggestion.affectedCount} paket etkileniyor)
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            {plan.status === 'voting' && !canVote && viewerParticipant?.status === 'not_going' ? (
              <div style={{ marginBottom: 12 }}>
                <Alert tone="info">
                  Katılmayacağını belirttiğin için oy kullanamıyorsun. Katılım durumunu
                  yukarıdan değiştirebilirsin.
                </Alert>
              </div>
            ) : null}

            {detail.votingResult?.isTie && isOwner ? (
              <div style={{ marginBottom: 12 }}>
                <Alert tone="warning" title="Oylar eşit çıktı">
                  Eşit oy alan paketlerden birine dokunarak kazananı belirle.
                </Alert>
              </div>
            ) : null}

            <MemberVoteList
              planId={plan.id}
              matches={detail.matches}
              votingResult={detail.votingResult}
              selectedPackageId={detail.viewerVote?.packageId ?? null}
              canVote={canVote}
              isOwner={isOwner}
              winnerPackageId={plan.winningPackageId}
              isTie={detail.votingResult?.isTie ?? false}
              budgetPerPerson={budget.perPerson}
              live={plan.status === 'voting'}
            />
          </>
        )}

        {/* Oylama kontrolü — yalnızca plan sahibi */}
        {isOwner && detail.matches.length > 0 ? (
          <div id="oylama" style={{ marginTop: 20 }}>
            {plan.status === 'packages_ready' ? (
              <Card>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Oylamayı başlat</p>
                <StartVotingForm planId={plan.id} />
              </Card>
            ) : null}

            {plan.status === 'voting' ? (
              <Card>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Herkes oy verdi mi?</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  {detail.votingResult?.totalVotes ?? 0} /{' '}
                  {detail.votingResult?.participantCount ?? 0} oy kullanıldı. Oylamayı erken
                  bitirebilirsin.
                </p>
                <CloseVotingForm planId={plan.id} />
              </Card>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* --- Rezervasyon --------------------------------------------------- */}
      <section id="rezervasyon" style={{ marginTop: 32 }}>
        <SectionHeader title="Rezervasyon" />

        {detail.reservation ? (
          <Card>
            <Badge
              tone={RESERVATION_STATUS_TONES[detail.reservation.reservation.status]}
              icon={RESERVATION_STATUS_ICONS[detail.reservation.reservation.status]}
            >
              {RESERVATION_STATUS_LABELS[detail.reservation.reservation.status]}
            </Badge>

            <p style={{ fontWeight: 600, marginTop: 10 }}>
              {detail.reservation.business.name} · {detail.reservation.package.name}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {detail.reservation.reservation.peopleCount} kişi ·{' '}
              {formatCurrency(detail.reservation.reservation.totalPrice)} toplam · Kod:{' '}
              <code>{detail.reservation.reservation.code}</code>
            </p>

            <div style={{ marginTop: 16 }}>
              <Timeline
                items={reservationTimelineSteps(detail.reservation.reservation.status).map(
                  (step) => ({ label: step.label, state: step.state }),
                )}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <LinkButton
                href={`/hesap/rezervasyonlar/${detail.reservation.reservation.id}`}
                size="sm"
                variant="secondary"
              >
                Rezervasyon detayını gör
              </LinkButton>
            </div>
          </Card>
        ) : plan.status === 'voting_closed' && plan.winningPackageId && isOwner ? (
          <Card raised>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Kazanan paket belli</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Rezervasyon talebini göndererek mekândan onay isteyebilirsin.
            </p>
            <LinkButton href={`/hesap/plan/${plan.id}/rezervasyon`}>
              Rezervasyon talebi gönder
            </LinkButton>
          </Card>
        ) : (
          <EmptyState
            icon="📅"
            title="Henüz rezervasyon yok"
            description="Oylama tamamlandığında kazanan paket için rezervasyon talebi gönderebilirsin."
          />
        )}
      </section>

      {/* --- Plan ayarları -------------------------------------------------- */}
      {isOwner && plan.status !== 'cancelled' && plan.status !== 'completed' ? (
        <section id="ayarlar" style={{ marginTop: 32 }}>
          <SectionHeader title="Plan ayarları" />
          <Card>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Planı iptal edersen katılımcılara bildirim gider.
            </p>
            <CancelPlanForm planId={plan.id} />
          </Card>
        </section>
      ) : null}

      {plan.status === 'cancelled' ? (
        <div style={{ marginTop: 24 }}>
          <Alert tone="error" title="Bu plan iptal edildi">
            {plan.cancelledReason ?? 'Plan sahibi planı iptal etti.'}{' '}
            <Link href="/hesap/plan/yeni">Yeni plan oluşturabilirsin.</Link>
          </Alert>
        </div>
      ) : null}
    </div>
  );
}

