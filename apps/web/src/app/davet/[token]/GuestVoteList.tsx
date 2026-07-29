'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  formatCurrency,
  formatPeopleRange,
  REALTIME_POLL_INTERVAL_MS,
  type MatchedPackage,
  type VotingResult,
} from '@hazirgrup/core';
import { Alert, Badge } from '@/components/ui';
import { guestVoteAction } from '@/server/actions/invite';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from './invite.module.css';

/**
 * Misafir oylama listesi.
 *
 * Canlı güncelleme: Supabase Realtime kanalı kurulamadığında 5 saniyelik
 * yoklamaya düşülür (docs/DECISIONS.md D-027). Demo modda yoklama kullanılır.
 */
export function GuestVoteList({
  token,
  planId,
  matches,
  votingResult,
  selectedPackageId,
  canVote,
  winnerPackageId,
  live,
}: {
  token: string;
  planId: string;
  matches: MatchedPackage[];
  votingResult: VotingResult | null;
  selectedPackageId: string | null;
  canVote: boolean;
  winnerPackageId: string | null;
  live: boolean;
}) {
  const [state, formAction] = useActionState(guestVoteAction, EMPTY_ACTION_RESULT);
  const [optimisticId, setOptimisticId] = useState(selectedPackageId);
  const router = useRouter();

  // Sunucudan gelen seçim değişince yerel durumu eşitle.
  useEffect(() => {
    setOptimisticId(selectedPackageId);
  }, [selectedPackageId]);

  // Canlı sonuç: yoklama ile yenile.
  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(() => router.refresh(), REALTIME_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [live, router]);

  const totalVotes = votingResult?.totalVotes ?? 0;

  return (
    <div>
      {state.message && !state.ok ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone="error">{state.message}</Alert>
        </div>
      ) : null}

      <div className={styles.voteList}>
        {matches.map((match) => {
          const tally = votingResult?.tallies.find((t) => t.packageId === match.package.id);
          const count = tally?.count ?? 0;
          const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isSelected = optimisticId === match.package.id;
          const isWinner = winnerPackageId === match.package.id;

          const cardClass = [
            styles.voteCard,
            isSelected ? styles.voteCardSelected : '',
            isWinner ? styles.voteCardWinner : '',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <>
              <div className={styles.voteBody}>
                <p className={styles.voteName}>
                  {isWinner ? '🏆 ' : ''}
                  {match.package.name}
                </p>
                <p className={styles.voteMeta}>
                  {match.business.name} · {match.district.name} ·{' '}
                  {formatPeopleRange(match.package.minPeople, match.package.maxPeople)}
                </p>

                <div className={styles.voteReasons}>
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
                    >
                      {reason.label}
                    </Badge>
                  ))}
                </div>

                {votingResult ? (
                  <>
                    <div className={styles.voteTally}>
                      <span>{count} oy</span>
                      <span className={styles.voteBar}>
                        <span className={styles.voteBarFill} style={{ width: `${percent}%` }} />
                      </span>
                    </div>
                    {tally && tally.voterNames.length > 0 ? (
                      <p className={styles.voterNames}>{tally.voterNames.join(', ')}</p>
                    ) : null}
                  </>
                ) : null}
              </div>

              <div className={styles.votePrice}>
                <p className={styles.votePriceMain}>
                  {formatCurrency(match.pricing.perPersonPrice)}
                </p>
                <p className={styles.votePriceLabel}>kişi başı</p>
                <p className={styles.votePriceLabel}>
                  {formatCurrency(match.pricing.totalPrice)} toplam
                </p>
                {isSelected ? (
                  <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-brand-text)' }}>
                    ✓ Senin oyun
                  </p>
                ) : null}
              </div>
            </>
          );

          if (!canVote) {
            return (
              <div key={match.package.id} className={cardClass}>
                {content}
              </div>
            );
          }

          return (
            <form key={match.package.id} action={formAction}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="planId" value={planId} />
              <input type="hidden" name="packageId" value={match.package.id} />
              <button
                type="submit"
                className={cardClass}
                onClick={() => setOptimisticId(match.package.id)}
                aria-pressed={isSelected}
              >
                {content}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
