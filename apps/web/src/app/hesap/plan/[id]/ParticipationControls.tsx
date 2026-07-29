'use client';

import { useActionState } from 'react';
import type { ParticipationStatus } from '@hazirgrup/core';
import { Alert } from '@/components/ui';
import { removeParticipantAction, updateParticipationAction } from '@/server/actions/plan';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/app/davet/[token]/invite.module.css';

const STATUS_META: Record<ParticipationStatus, { icon: string; label: string }> = {
  going: { icon: '✅', label: 'Geliyor' },
  maybe: { icon: '🤔', label: 'Kararsız' },
  not_going: { icon: '🚫', label: 'Gelmiyor' },
  pending: { icon: '⏳', label: 'Cevap bekleniyor' },
};

interface ParticipantRow {
  id: string;
  displayName: string;
  status: ParticipationStatus;
  isOwner: boolean;
  isViewer: boolean;
}

export function ParticipationControls({
  planId,
  participants,
  viewerIsOwner,
}: {
  planId: string;
  participants: ParticipantRow[];
  viewerIsOwner: boolean;
}) {
  const [updateState, updateAction] = useActionState(
    updateParticipationAction,
    EMPTY_ACTION_RESULT,
  );
  const [removeState, removeAction] = useActionState(
    removeParticipantAction,
    EMPTY_ACTION_RESULT,
  );

  const message = updateState.message ?? removeState.message;
  const messageOk = updateState.message ? updateState.ok : removeState.ok;

  return (
    <div>
      {message ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone={messageOk ? 'success' : 'error'}>{message}</Alert>
        </div>
      ) : null}

      <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {participants.map((participant) => (
          <li
            key={participant.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              paddingBottom: 10,
              borderBottom: '1px solid var(--color-border-default)',
            }}
          >
            <span style={{ fontSize: 18 }} aria-hidden="true">
              {STATUS_META[participant.status].icon}
            </span>

            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>
                {participant.displayName}
                {participant.isOwner ? (
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                    {' '}
                    · plan sahibi
                  </span>
                ) : null}
                {participant.isViewer ? (
                  <span style={{ color: 'var(--color-brand-text)', fontWeight: 400 }}> · sen</span>
                ) : null}
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {STATUS_META[participant.status].label}
              </p>
            </div>

            {participant.isViewer ? (
              <form action={updateAction} style={{ display: 'flex', gap: 6 }}>
                <input type="hidden" name="planId" value={planId} />
                <input type="hidden" name="participantId" value={participant.id} />
                {(['going', 'maybe', 'not_going'] as ParticipationStatus[]).map((status) => (
                  <button
                    key={status}
                    type="submit"
                    name="status"
                    value={status}
                    className={styles.participantChip}
                    style={{
                      minHeight: 36,
                      cursor: 'pointer',
                      ...(participant.status === status
                        ? {
                            borderColor: 'var(--color-brand-default)',
                            background: 'var(--color-brand-surface)',
                            color: 'var(--color-brand-text)',
                            fontWeight: 600,
                          }
                        : {}),
                    }}
                    aria-pressed={participant.status === status}
                  >
                    {STATUS_META[status].icon} {STATUS_META[status].label}
                  </button>
                ))}
              </form>
            ) : viewerIsOwner && !participant.isOwner ? (
              <form action={removeAction}>
                <input type="hidden" name="planId" value={planId} />
                <input type="hidden" name="participantId" value={participant.id} />
                <button
                  type="submit"
                  style={{
                    fontSize: 12,
                    color: 'var(--color-danger-text)',
                    minHeight: 36,
                    padding: '0 8px',
                  }}
                  aria-label={`${participant.displayName} kişisini plandan çıkar`}
                >
                  Çıkar
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
