import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  alternativePackagesFor,
  buildPackageContext,
  canCreateReservation,
  countParticipation,
  estimateAttendance,
  formatCurrency,
} from '@hazirgrup/core';
import { requireUser } from '@/server/auth';
import { getServiceContext } from '@/server/repository';
import { Alert, Breadcrumb, Card, EmptyState, LinkButton, SectionHeader } from '@/components/ui';
import { ReservationForm } from './ReservationForm';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Rezervasyon talebi | HazırGrup',
  robots: { index: false, follow: false },
};

interface Params {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paket?: string }>;
}

export default async function ReservationRequestPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { paket } = await searchParams;

  const user = await requireUser(`/hesap/plan/${id}/rezervasyon`);
  const ctx = await getServiceContext();

  const plan = await ctx.repo.getPlan(id);
  if (!plan) notFound();

  if (plan.ownerId !== user.id) {
    return (
      <EmptyState
        icon="🔒"
        title="Rezervasyon talebini yalnızca plan sahibi gönderebilir"
        description="Planı oluşturan kişi talebi iletebilir."
        action={<LinkButton href={`/hesap/plan/${id}`}>Plana dön</LinkButton>}
      />
    );
  }

  const packageId = paket ?? plan.winningPackageId;

  // Mevcut rezervasyon varsa doğrudan detayına yönlendir.
  const existing = await ctx.repo.listReservationsForPlan(plan.id);
  const active = existing.find(
    (r) => r.status === 'pending_business' || r.status === 'confirmed' || r.status === 'completed',
  );

  if (active) {
    return (
      <div>
        <Alert tone="info" title="Bu plan için zaten bir rezervasyon var">
          Rezervasyonun durumunu detay sayfasından takip edebilirsin.
        </Alert>
        <div style={{ marginTop: 16 }}>
          <LinkButton href={`/hesap/rezervasyonlar/${active.id}`}>
            Rezervasyonu gör
          </LinkButton>
        </div>
      </div>
    );
  }

  if (!packageId || !canCreateReservation(plan.status, packageId)) {
    const alternatives = packageId
      ? await alternativePackagesFor(ctx, { planId: plan.id, excludePackageId: packageId })
      : [];

    return (
      <div>
        <EmptyState
          icon="🗳️"
          title="Önce oylamanın tamamlanması gerekiyor"
          description="Rezervasyon talebi ancak oylama bittikten ve kazanan paket belirlendikten sonra gönderilebilir."
          action={<LinkButton href={`/hesap/plan/${plan.id}`}>Plana dön</LinkButton>}
        />
        {alternatives.length > 0 ? (
          <section style={{ marginTop: 24 }}>
            <SectionHeader title="Alternatif paketler" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alternatives.map((match) => (
                <Card key={match.package.id}>
                  <p style={{ fontWeight: 600 }}>{match.package.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {match.business.name} · {formatCurrency(match.pricing.perPersonPrice)} kişi başı
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  const context = await buildPackageContext(ctx, packageId);
  if (!context) notFound();

  const participants = await ctx.repo.listParticipants(plan.id);
  const counts = countParticipation(participants.map((p) => p.status));
  const estimated = estimateAttendance({
    counts,
    planEstimatedPeople: plan.estimatedPeople,
    planMinPeople: plan.minPeople,
  });

  const profile = await ctx.repo.getProfile(user.id);

  return (
    <div>
      <Breadcrumb
        items={[
          { name: 'Planlarım', href: '/hesap/planlar' },
          { name: plan.name, href: `/hesap/plan/${plan.id}` },
          { name: 'Rezervasyon' },
        ]}
      />

      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Rezervasyon talebi gönder</h1>
        <p className={styles.panelSubtitle}>
          Bilgileri kontrol et ve talebini {context.business.name} işletmesine ilet.
        </p>
      </header>

      <div style={{ maxWidth: 560 }}>
        <ReservationForm
          planId={plan.id}
          packageId={context.package.id}
          packageName={context.package.name}
          businessName={context.business.name}
          branchName={context.branch.name}
          pricingModel={context.package.pricingModel}
          priceAmount={context.package.priceAmount}
          minPeople={context.package.minPeople}
          maxPeople={context.package.maxPeople}
          defaultPeopleCount={Math.min(
            Math.max(estimated, context.package.minPeople),
            context.package.maxPeople,
          )}
          defaultContactName={user.displayName}
          defaultContactPhone={profile?.phone ?? ''}
          reservationTerms={context.package.reservationTerms}
          cancellationTerms={context.package.cancellationTerms}
        />
      </div>
    </div>
  );
}
