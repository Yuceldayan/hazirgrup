'use client';

import { useActionState, useState } from 'react';
import { Alert, Button, Card } from '@/components/ui';
import { SubmitButton } from '@/components/ui/form';
import { createInvitationAction } from '@/server/actions/plan';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/public.module.css';

/**
 * Davet paneli.
 *
 * Davet tokenı veritabanında düz metin saklanmadığı için (docs/SECURITY_MODEL.md §4)
 * bağlantı yalnızca üretildiği anda gösterilebilir. Sayfa yeniden yüklendiğinde
 * kullanıcı "Yeni bağlantı oluştur" ile taze bir bağlantı üretir; eski bağlantı
 * o anda geçersiz olur.
 */
export function InvitePanel({
  planId,
  hasActiveInvitation,
  shortCode,
}: {
  planId: string;
  hasActiveInvitation: boolean;
  shortCode: string | null;
}) {
  const [state, formAction] = useActionState(createInvitationAction, EMPTY_ACTION_RESULT);
  const [copied, setCopied] = useState<string | null>(null);

  const inviteUrl = state.values?.inviteUrl;
  const shareMessage = state.values?.shareMessage;
  const whatsappUrl = state.values?.whatsappUrl;
  const code = state.values?.shortCode ?? shortCode;

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied('hata');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {state.message ? (
        <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
      ) : null}

      {inviteUrl ? (
        <Card raised>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Davet bağlantın hazır</p>

          <div
            style={{
              padding: 12,
              background: 'var(--color-bg-subtle)',
              borderRadius: 10,
              wordBreak: 'break-all',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              marginBottom: 12,
            }}
          >
            {inviteUrl}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chip}
                style={{
                  background: 'var(--color-success-bg)',
                  borderColor: 'var(--color-success-border)',
                  color: 'var(--color-success-text)',
                  fontWeight: 600,
                }}
              >
                💬 WhatsApp&apos;ta paylaş
              </a>
            ) : null}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => copy(inviteUrl, 'bağlantı')}
            >
              {copied === 'bağlantı' ? '✓ Kopyalandı' : 'Bağlantıyı kopyala'}
            </Button>

            {shareMessage ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copy(shareMessage, 'mesaj')}
              >
                {copied === 'mesaj' ? '✓ Kopyalandı' : 'Hazır mesajı kopyala'}
              </Button>
            ) : null}
          </div>

          {copied === 'hata' ? (
            <p style={{ fontSize: 12, color: 'var(--color-danger-text)', marginTop: 8 }}>
              Kopyalanamadı. Bağlantıyı elle seçip kopyalayabilirsin.
            </p>
          ) : null}

          {shareMessage ? (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13 }}>Paylaşım metnini gör</summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 8,
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                }}
              >
                {shareMessage}
              </pre>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                Bu metinde bütçe, katılımcı isimleri veya özel notun paylaşılmaz.
              </p>
            </details>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          {hasActiveInvitation ? 'Yeni bağlantı oluştur' : 'Davet bağlantısı oluştur'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          {hasActiveInvitation
            ? 'Güvenlik gereği mevcut bağlantı burada tekrar gösterilemez. Yeni bir bağlantı oluşturduğunda eski bağlantı anında geçersiz olur.'
            : 'Bağlantıyı oluşturup WhatsApp’tan paylaş. Arkadaşların uygulama indirmeden katılabilir.'}
        </p>

        {code ? (
          <p style={{ fontSize: 13, marginBottom: 12 }}>
            Sözlü paylaşım için davet kodu:{' '}
            <code style={{ fontSize: 14, fontWeight: 700 }}>{code}</code>
          </p>
        ) : null}

        <form action={formAction}>
          <input type="hidden" name="planId" value={planId} />
          <SubmitButton pendingLabel="Oluşturuluyor…">
            {hasActiveInvitation ? 'Yeni bağlantı oluştur' : 'Davet bağlantısı oluştur'}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
