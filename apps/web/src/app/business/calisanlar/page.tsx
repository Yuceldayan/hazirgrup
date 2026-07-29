import type { Metadata } from 'next';
import { requireBusinessMember } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Alert, Badge, Card, SectionHeader } from '@/components/ui';
import { TeamManager } from './TeamManager';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Çalışanlar | İşletme paneli',
  robots: { index: false, follow: false },
};

export default async function BusinessTeamPage() {
  const { businessId, isOwner } = await requireBusinessMember();
  const repo = await getRepository();

  const members = await repo.listBusinessMembers(businessId);
  const profiles = await Promise.all(
    members.map(async (member) => ({
      member,
      profile: await repo.getProfile(member.userId),
    })),
  );

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Çalışanlar</h1>
        <p className={styles.panelSubtitle}>
          Ekip üyeleri rezervasyonları ve paketleri yönetebilir; işletme sahibi ayrıca ekibi
          düzenleyebilir.
        </p>
      </header>

      {!isOwner ? (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="info">
            Ekip yönetimi yalnızca işletme sahibine açıktır. Sen ekip üyesi olarak
            rezervasyonları ve paketleri yönetebilirsin.
          </Alert>
        </div>
      ) : null}

      <section style={{ marginBottom: 32 }}>
        <SectionHeader title={`Ekip (${members.length} kişi)`} />
        <Card>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profiles.map(({ member, profile }) => (
              <li
                key={member.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--color-border-default)',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>
                    {profile?.displayName ?? 'Kullanıcı'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {profile?.email ?? '—'}
                  </p>
                </div>

                <Badge tone={member.role === 'owner' ? 'brand' : 'neutral'}>
                  {member.role === 'owner' ? 'İşletme sahibi' : 'Çalışan'}
                </Badge>

                {isOwner && member.role !== 'owner' ? (
                  <TeamManager mode="remove" userId={member.userId} />
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {isOwner ? (
        <section>
          <SectionHeader
            title="Çalışan ekle"
            description="Eklenecek kişinin önce HazırGrup'ta hesabı olmalı."
          />
          <Card>
            <TeamManager mode="add" />
          </Card>
        </section>
      ) : null}
    </div>
  );
}
