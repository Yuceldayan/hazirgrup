import type { Metadata } from 'next';
import { formatDateWithYear } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, EmptyState } from '@/components/ui';
import { SuspendUserButton } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Kullanıcılar | Yönetici',
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin('/admin/kullanicilar');
  const repo = await getRepository();

  const users = await repo.listUsers();
  const rows = await Promise.all(
    users.map(async (profile) => ({
      profile,
      roles: await repo.getUserRoles(profile.id),
    })),
  );

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Kullanıcılar</h1>
        <p className={styles.panelSubtitle}>
          Kural ihlali durumunda hesabı askıya alabilirsin. İşlem audit log&apos;a yazılır.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState icon="👤" title="Kullanıcı yok" description="Kayıtlar burada listelenir." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(({ profile, roles }) => (
            <Card key={profile.id} flat>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {profile.isSuspended ? (
                      <Badge tone="danger" icon="⛔">
                        Askıda
                      </Badge>
                    ) : (
                      <Badge tone="success" icon="✓">
                        Aktif
                      </Badge>
                    )}
                    {roles.map((role) => (
                      <Badge key={role} tone={role === 'admin' ? 'brand' : 'neutral'}>
                        {role}
                      </Badge>
                    ))}
                  </div>

                  <p style={{ fontWeight: 600, marginTop: 8 }}>
                    {profile.displayName}
                    {profile.id === admin.id ? (
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                        {' '}
                        · sen
                      </span>
                    ) : null}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {profile.email} · Kayıt: {formatDateWithYear(profile.createdAt.slice(0, 10))}
                  </p>
                </div>

                {profile.id !== admin.id ? (
                  <SuspendUserButton userId={profile.id} suspended={profile.isSuspended} />
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
