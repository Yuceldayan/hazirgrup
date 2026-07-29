'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  formatCurrency,
  formatPeopleRange,
  REALTIME_POLL_INTERVAL_MS,
  type MatchedPackage,
  type PackageSortOption,
  type VotingResult,
} from '@hazirgrup/core';
import { PACKAGE_SORT_LABELS, PACKAGE_SORT_OPTIONS, sortMatches } from '@hazirgrup/core';
import { Alert, Badge } from '@/components/ui';
import { castVoteAction, resolveTieAction } from '@/server/actions/plan';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/app/davet/[token]/invite.module.css';
import publicStyles from '@/components/public.module.css';

/**
 * Plan detayındaki paket listesi + oylama.
 *
 * Sıralama seçenekleri (docs/PRODUCT_REQUIREMENTS.md FR-4.3) ve eşleşme
 * gerekçeleri burada gösterilir. Oylama açıkken 5 sn'de bir sonuç yenilenir.
 */
export function MemberVoteList({
  planId,
  matches,
  votingResult,
  selectedPackageId,
  canVote,
  isOwner,
  winnerPackageId,
  isTie,
  budgetPerPerson,
  live,
}: {
  planId: string;
  matches: MatchedPackage[];
  votingResult: VotingResult | null;
  selectedPackageId: string | null;
  canVote: boolean;
  isOwner: boolean;
  winnerPackageId: string | null;
  isTie: boolean;
  budgetPerPerson: number | null;
  live: boolean;
}) {
  const [voteState, voteAction] = useActionState(castVoteAction, EMPTY_ACTION_RESULT);
  const [tieState, tieAction] = useActionState(resolveTieAction, EMPTY_ACTION_RESULT);
  const [sort, setSort] = useState<PackageSortOption>('best_match');
  const [optimisticId, setOptimisticId] = useState(selectedPackageId);
  const router = useRouter();

  useEffect(() => setOptimisticId(selectedPackageId), [selectedPackageId]);

  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(() => router.refresh(), REALTIME_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [live, router]);

  const sorted = sortMatches(matches, sort, budgetPerPerson);
  const totalVotes = votingResult?.totalVotes ?? 0;
  const message = voteState.message ?? tieState.message;
  const messageOk = voteState.message ? voteState.ok : tieState.ok;

  return (
    <div>
      <div className={publicStyles.chipRow} style={{ marginBottom: 16 }}>
        {PACKAGE_SORT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={publicStyles.chip}
            onClick={() => setSort(option)}
            aria-pressed={sort === option}
            style={
              sort === option
                ? {
                    borderColor: 'var(--color-brand-default)',
                    background: 'var(--color-brand-surface)',
                    color: 'var(--color-brand-text)',
                    fontWeight: 600,
                  }
                : undefined
            }
          >
            {PACKAGE_SORT_LABELS[option]}
          </button>
        ))}
      </div>

      {message ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone={messageOk ? 'success' : 'error'}>{message}</Alert>
        </div>
      ) : null}

      <div className={styles.voteList}>
        {sorted.map((match) => {
          const tally = votingResult?.tallies.find((t) => t.packageId === match.package.id);
          const count = tally?.count ?? 0;
          const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isSelected = optimisticId === match.package.id;
          const isWinner = winnerPackageId === match.package.id;
          const isTieCandidate =
            isTie && votingResult?.leadingPackageIds.includes(match.package.id);

          const cardClass = [
            styles.voteCard,
            isSelected ? styles.voteCardSelected : '',
            isWinner ? styles.voteCardWinner : '',
          ]
            .filter(Boolean)
            .join(' ');

          const body = (
            <>
              <div className={styles.voteBody}>
                <p className={styles.voteName}>
                  {isWinner ? '🏆 ' : ''}
                  {match.package.name}
                </p>
                <p className={styles.voteMeta}>
                  {match.business.name} · {match.branch.name} · {match.district.name} ·{' '}
                  {formatPeopleRange(match.package.minPeople, match.package.maxPeople)}
                </p>

                <div className={styles.voteReasons}>
                  {match.reasons.map((reason) => (
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
                {match.pricing.overBudgetPercent > 0 ? (
                  <p style={{ fontSize: 11, color: 'var(--color-warning-text)', marginTop: 4 }}>
                    +{formatCurrency(match.pricing.perPersonDiff)} bütçe üstü
                  </p>
                ) : null}
                {isSelected ? (
                  <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-brand-text)' }}>
                    ✓ Senin oyun
                  </p>
                ) : null}
              </div>
            </>
          );

          if (isTieCandidate && isOwner) {
            return (
              <form key={match.package.id} action={tieAction}>
                <input type="hidden" name="planId" value={planId} />
                <input type="hidden" name="packageId" value={match.package.id} />
                <button type="submit" className={cardClass}>
                  {body}
                  <span className="sr-only">Bu paketi kazanan olarak seç</span>
                </button>
              </form>
            );
          }

          if (!canVote) {
            return (
              <div key={match.package.id} className={cardClass}>
                {body}
              </div>
            );
          }

          return (
            <form key={match.package.id} action={voteAction}>
              <input type="hidden" name="planId" value={planId} />
              <input type="hidden" name="packageId" value={match.package.id} />
              <button
                type="submit"
                className={cardClass}
                onClick={() => setOptimisticId(match.package.id)}
                aria-pressed={isSelected}
              >
                {body}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
