import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildGuestPlanView,
  formatDate,
  formatTimeRange,
  formatTimeRemaining,
  inviteMetadata,
  PLAN_STATUS_DESCRIPTIONS,
  PLAN_STATUS_ICONS,
  PLAN_STATUS_LABELS,
  resolveInviteToken,
  toAppError,
} from '@hazirgrup/core';
import { getServiceContext } from '@/server/repository';
import { resolveViewerParticipantId } from '@/server/guest';
import { env } from '@/lib/env';
import { Alert, Badge, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { GuestJoinForm } from './GuestJoinForm';
import { GuestVoteList } from './GuestVoteList';
import styles from './invite.module.css';

/**
 * Misafir davet sayfası — `/davet/{token}`
 *
 * - `noindex, nofollow` (docs/SEO_STRATEGY.md §2)
 * - OG kartında YALNIZCA plan başlığı, tarih, ilçe ve katılım çağrısı bulunur;
 *   katılımcı ismi, bütçe veya özel not paylaşılmaz (§12).
 * - Uygulama indirmeye gerek yoktur.
 */

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;

  try {
    const ctx = await getServiceContext();
    const { planId } = await resolveInviteToken(ctx, token);
    const plan = await ctx.repo.getPlan(planId);
    if (!plan) throw new Error('plan yok');

    const districts = plan.districtId ? await ctx.repo.listDistricts(plan.cityId) : [];
    const districtName = plan.districtId
      ? (districts.find((d) => d.id === plan.districtId)?.name ?? null)
      : null;

    const content = inviteMetadata({
      planName: plan.name,
      dateLabel: formatDate(plan.eventDate),
      districtName,
    });

    const ogUrl = `${env.siteUrl}/og?baslik=${encodeURIComponent(plan.name)}&altbaslik=${encodeURIComponent(
      `${districtName ? `${districtName} · ` : ''}${formatDate(plan.eventDate)} — Sen de katıl`,
    )}`;

    return {
      title: content.title,
      description: content.description,
      // Davet sayfası ASLA indekslenmez.
      robots: { index: false, follow: false, nocache: true },
      openGraph: {
        title: content.title,
        description: content.description,
        type: 'website',
        locale: 'tr_TR',
        images: [{ url: ogUrl, width: 1200, height: 630, alt: plan.name }],
      },
      twitter: { card: 'summary_large_image', title: content.title, description: content.description },
    };
  } catch {
    return {
      title: 'Davet | HazırGrup',
      robots: { index: false, follow: false, nocache: true },
    };
  }
}

export default async function InvitePage({ params }: Params) {
  const { token } = await params;
  const ctx = await getServiceContext();

  let planId: string;
  try {
    const resolved = await resolveInviteToken(ctx, token);
    planId = resolved.planId;
  } catch (error) {
    const appError = toAppError(error);
    return (
      <div className={styles.wrapper}>
        <EmptyState
          icon="🔗"
          title="Bu davet bağlantısı geçerli değil"
          description={appError.userMessage}
          action={
            <LinkButton href="/" variant="secondary">
              HazırGrup&apos;a göz at
            </LinkButton>
          }
        />
      </div>
    );
  }

  const viewerParticipantId = await resolveViewerParticipantId(ctx, planId);
  const view = await buildGuestPlanView(ctx, { planId, viewerParticipantId });

  const viewer = view.participants.find((p) => p.id === viewerParticipantId) ?? null;
  const isCancelled = view.status === 'cancelled';
  const isCompleted = view.status === 'completed';
  const votingEndsIn = view.votingEndsAt
    ? formatTimeRemaining(view.votingEndsAt, ctx.nowMs)
    : null;

  const showVoting =
    view.matches.length > 0 &&
    (view.status === 'voting' ||
      view.status === 'voting_closed' ||
      view.status === 'reservation_pending' ||
      view.status === 'reservation_confirmed' ||
      view.status === 'completed');

  return (
    <div className={styles.wrapper}>
      {/* --- Plan özeti (kişisel veri içermez) ---------------------------- */}
      <div className={styles.planCard}>
        <p className={styles.planEyebrow}>{view.ownerDisplayName} seni davet etti</p>
        <h1 className={styles.planName}>{view.planName}</h1>

        <div className={styles.planMeta}>
          <span className={styles.planMetaItem}>
            <span aria-hidden="true">📅</span> {formatDate(view.eventDate)}
          </span>
          {view.startTime || view.endTime ? (
            <span className={styles.planMetaItem}>
              <span aria-hidden="true">🕒</span> {formatTimeRange(view.startTime, view.endTime)}
            </span>
          ) : null}
          <span className={styles.planMetaItem}>
            <span aria-hidden="true">📍</span>{' '}
            {view.districtName ? `${view.districtName}, ${view.cityName}` : view.cityName}
          </span>
          <span className={styles.planMetaItem}>
            <span aria-hidden="true">👥</span> {view.goingCount} kişi geliyor
          </span>
        </div>
      </div>

      {/* --- Durum ---------------------------------------------------------- */}
      <div style={{ marginBottom: 16 }}>
        <Alert
          tone={isCancelled ? 'error' : view.status === 'voting' ? 'info' : 'success'}
          title={`${PLAN_STATUS_ICONS[view.status]} ${PLAN_STATUS_LABELS[view.status]}`}
        >
          {PLAN_STATUS_DESCRIPTIONS[view.status]}
          {votingEndsIn && view.status === 'voting'
            ? ` Oylamanın bitmesine ${votingEndsIn} kaldı.`
            : ''}
        </Alert>
      </div>

      {isCancelled || isCompleted ? (
        <Card>
          <p>
            {isCancelled
              ? 'Bu plan iptal edildi. Planı oluşturan arkadaşınla iletişime geçebilirsin.'
              : 'Bu plan tamamlandı. Katıldığın için teşekkürler!'}
          </p>
        </Card>
      ) : (
        <>
          {/* --- Katılım formu ---------------------------------------------- */}
          <GuestJoinForm
            token={token}
            currentName={viewer?.displayName ?? null}
            currentStatus={viewer?.status ?? null}
          />

          {/* --- Katılımcılar ------------------------------------------------ */}
          {view.participants.length > 0 ? (
            <section style={{ marginTop: 24 }}>
              <SectionHeader
                title={`Katılımcılar (${view.participants.length})`}
                description={`${view.goingCount} kişi kesin geliyor.`}
              />
              <div className={styles.participantRow}>
                {view.participants.map((participant) => (
                  <span key={participant.id} className={styles.participantChip}>
                    <span aria-hidden="true">
                      {participant.status === 'going'
                        ? '✅'
                        : participant.status === 'maybe'
                          ? '🤔'
                          : participant.status === 'not_going'
                            ? '🚫'
                            : '⏳'}
                    </span>
                    {participant.displayName}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* --- Paketler / oylama ------------------------------------------- */}
          <section style={{ marginTop: 32 }}>
            <SectionHeader
              title={showVoting ? 'Paketleri oyla' : 'Uygun paketler'}
              description={
                view.canVote
                  ? 'Bir pakete dokunarak oy ver. Oylama bitene kadar değiştirebilirsin.'
                  : viewerParticipantId
                    ? 'Oylama henüz açık değil veya kapandı.'
                    : 'Oy kullanmak için önce adını girip katılım durumunu seç.'
              }
            />

            {view.matches.length === 0 ? (
              <EmptyState
                icon="📦"
                title="Henüz uygun paket yok"
                description="Plan sahibi kişi sayısı, bütçe veya saat bilgisini güncellediğinde paketler burada görünecek."
              />
            ) : (
              <GuestVoteList
                token={token}
                planId={view.planId}
                matches={view.matches}
                votingResult={view.votingResult}
                selectedPackageId={view.viewerVotePackageId}
                canVote={view.canVote}
                winnerPackageId={view.winningPackageId}
                live={view.status === 'voting'}
              />
            )}
          </section>

          {/* --- Kazanan ------------------------------------------------------ */}
          {view.winningPackageId && view.status !== 'voting' ? (
            <div style={{ marginTop: 20 }}>
              <Alert tone="success" title="Kazanan paket belirlendi">
                Plan sahibi rezervasyon talebini gönderdiğinde bilgilendirileceksin.
              </Alert>
            </div>
          ) : null}

          {view.votingResult?.isTie ? (
            <div style={{ marginTop: 20 }}>
              <Alert tone="warning" title="Oylar eşit">
                Son kararı planı oluşturan kişi verecek.
              </Alert>
            </div>
          ) : null}
        </>
      )}

      <p className={styles.footNote}>
        Bu plana katılmak için uygulama indirmene gerek yok.{' '}
        <Link href="/">HazırGrup nedir?</Link>
        <br />
        <Badge tone="neutral">Bu sayfa yalnızca bağlantıya sahip kişilerle paylaşılır</Badge>
      </p>
    </div>
  );
}
