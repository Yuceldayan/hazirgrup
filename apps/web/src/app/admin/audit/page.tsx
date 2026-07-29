import type { Metadata } from 'next';
import { formatRelativeTime } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Card, EmptyState } from '@/components/ui';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Audit log | Yönetici',
  robots: { index: false, follow: false },
};

export default async function AdminAuditPage() {
  await requireAdmin('/admin/audit');
  const repo = await getRepository();

  const logs = await repo.listAdminLogs(200);
  const now = Date.now();

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Audit log</h1>
        <p className={styles.panelSubtitle}>
          Yönetici ve işletme işlemlerinin denetim kaydı. Hassas veri kaydedilmez.
        </p>
      </header>

      {logs.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="Kayıt yok"
          description="Yönetici işlemleri gerçekleştikçe burada listelenir."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => (
            <Card key={log.id} flat>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14 }}>
                    <strong>{log.actorName}</strong> · <code>{log.action}</code>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {log.entityType} · <code>{log.entityId}</code>
                  </p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {formatRelativeTime(log.createdAt, now)}
                </span>
              </div>

              {log.before || log.after ? (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', fontSize: 12 }}>Değişikliği gör</summary>
                  <pre
                    style={{
                      marginTop: 6,
                      padding: 10,
                      background: 'var(--color-bg-subtle)',
                      borderRadius: 8,
                      fontSize: 11,
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify({ before: log.before, after: log.after }, null, 2)}
                  </pre>
                </details>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
