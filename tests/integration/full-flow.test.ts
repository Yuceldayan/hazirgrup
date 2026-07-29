import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildGuestPlanView,
  buildPlanDetail,
  cancelPlan,
  castVote,
  closeVoting,
  computeMatches,
  createInvitation,
  createPlan,
  createReservationRequest,
  joinAsGuest,
  resolveInviteToken,
  respondToReservation,
  startVoting,
  type ServiceContext,
} from '@hazirgrup/core';
import type { DemoRepository } from '@hazirgrup/core';
import { createTestContext, DEMO_CREDENTIALS } from './helpers';

/**
 * Kabul akışı (docs/TEST_STRATEGY.md §4):
 * kayıt → plan → davet → misafir katılımı → paketler → oy → oylamayı bitir
 * → rezervasyon → işletme onayı → kullanıcı görüntüler.
 */

describe('uçtan uca akış', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('10 adımlı kabul akışını baştan sona tamamlar', async () => {
    // --- 1. Kullanıcı kayıt olur -------------------------------------------
    const { user } = await ctx.repo.signUp({
      displayName: 'Test Kullanıcı',
      email: 'test@ornek.test',
      password: 'Test1234',
    });
    expect(user.id).toBeTruthy();
    expect(user.roles).toContain('user');

    // --- 2. Plan oluşturur --------------------------------------------------
    const cities = await ctx.repo.listCities({ onlyActive: true });
    const city = cities[0]!;
    const districts = await ctx.repo.listDistricts(city.id, { onlyActive: true });
    const district = districts.find((d) => d.slug === 'merkez')!;
    const categories = await ctx.repo.listCategories({ onlyActive: true });
    const cafeCategory = categories.find((c) => c.slug === 'kafe-restoran')!;

    const plan = await createPlan(ctx, {
      ownerId: user.id,
      ownerDisplayName: user.displayName,
      name: 'Test Buluşması',
      cityId: city.id,
      districtId: district.id,
      // 2026-03-06 → Cuma
      eventDate: '2026-03-06',
      startTime: '20:00',
      endTime: '23:00',
      isTimeFlexible: true,
      estimatedPeople: 6,
      minPeople: 4,
      maxPeople: 8,
      budgetMode: 'per_person',
      budgetPerPerson: 35000,
      budgetTotal: null,
      note: null,
      categoryIds: [cafeCategory.id],
      preferenceKeys: [],
    });

    expect(plan.status).toBe('awaiting_participants');

    // Sahip otomatik olarak katılımcı listesine eklenir
    const initialParticipants = await ctx.repo.listParticipants(plan.id);
    expect(initialParticipants).toHaveLength(1);
    expect(initialParticipants[0]!.isOwner).toBe(true);
    expect(initialParticipants[0]!.status).toBe('going');

    // --- 3. Davet bağlantısını paylaşır -------------------------------------
    const invitation = await createInvitation(ctx, { planId: plan.id, userId: user.id });
    expect(invitation.token).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(invitation.inviteUrl).toContain('/davet/');
    expect(invitation.whatsappUrl).toContain('wa.me');
    // Gizlilik: paylaşım metninde bütçe yok
    expect(invitation.shareMessage).not.toMatch(/₺/);

    // --- 4. Misafir web üzerinden katılır (hesap açmadan) -------------------
    const resolved = await resolveInviteToken(ctx, invitation.token);
    expect(resolved.planId).toBe(plan.id);

    const guest1 = await joinAsGuest(ctx, {
      planId: plan.id,
      invitationId: resolved.invitation.id,
      displayName: 'Misafir Ali',
      status: 'going',
      existingGuestSecret: null,
    });
    expect(guest1.isNew).toBe(true);

    const guest2 = await joinAsGuest(ctx, {
      planId: plan.id,
      invitationId: resolved.invitation.id,
      displayName: 'Misafir Ayşe',
      status: 'going',
      existingGuestSecret: null,
    });

    const guest3 = await joinAsGuest(ctx, {
      planId: plan.id,
      invitationId: resolved.invitation.id,
      displayName: 'Misafir Can',
      status: 'maybe',
      existingGuestSecret: null,
    });

    const participants = await ctx.repo.listParticipants(plan.id);
    expect(participants).toHaveLength(4);

    // --- 5. Paketler görüntülenir ------------------------------------------
    const { matches, peopleCount } = await computeMatches(ctx, plan);
    // 3 kesin + ceil(1 * 0.5) = 4 kişi
    expect(peopleCount).toBe(4);
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match.package.minPeople).toBeLessThanOrEqual(peopleCount);
      expect(match.package.maxPeople).toBeGreaterThanOrEqual(peopleCount);
      expect(match.reasons.length).toBeGreaterThan(0);
    }

    // Plan otomatik olarak "paketler hazır" aşamasına geçmeli
    const afterJoin = await ctx.repo.getPlan(plan.id);
    expect(afterJoin!.status).toBe('packages_ready');

    // --- 6. Oy kullanılır ---------------------------------------------------
    await startVoting(ctx, {
      planId: plan.id,
      userId: user.id,
      endsAt: null,
      matchCount: matches.length,
    });

    const votingPlan = await ctx.repo.getPlan(plan.id);
    expect(votingPlan!.status).toBe('voting');

    const [firstPackage, secondPackage] = matches;
    const ownerParticipant = participants.find((p) => p.isOwner)!;

    await castVote(ctx, {
      planId: plan.id,
      participantId: ownerParticipant.id,
      packageId: firstPackage!.package.id,
    });
    await castVote(ctx, {
      planId: plan.id,
      participantId: guest1.participantId,
      packageId: firstPackage!.package.id,
    });
    await castVote(ctx, {
      planId: plan.id,
      participantId: guest2.participantId,
      packageId: secondPackage!.package.id,
    });
    await castVote(ctx, {
      planId: plan.id,
      participantId: guest3.participantId,
      packageId: firstPackage!.package.id,
    });

    // Oy değiştirme: guest2 fikrini değiştirir
    await castVote(ctx, {
      planId: plan.id,
      participantId: guest2.participantId,
      packageId: firstPackage!.package.id,
    });

    const votes = await ctx.repo.listVotes(plan.id);
    // 4 katılımcı → 4 oy (duplicate yok)
    expect(votes).toHaveLength(4);
    expect(votes.filter((v) => v.packageId === firstPackage!.package.id)).toHaveLength(4);

    // --- 7. Plan sahibi oylamayı bitirir ------------------------------------
    const { result } = await closeVoting(ctx, { planId: plan.id, userId: user.id });
    expect(result.isTie).toBe(false);
    expect(result.winnerPackageId).toBe(firstPackage!.package.id);

    const closedPlan = await ctx.repo.getPlan(plan.id);
    expect(closedPlan!.status).toBe('voting_closed');
    expect(closedPlan!.winningPackageId).toBe(firstPackage!.package.id);

    // --- 8. Rezervasyon talebi gönderilir -----------------------------------
    const reservation = await createReservationRequest(ctx, {
      planId: plan.id,
      userId: user.id,
      packageId: firstPackage!.package.id,
      contactName: 'Test Kullanıcı',
      contactPhone: '05551112233',
      note: 'Ayrı masa olabilir mi?',
    });

    expect(reservation.status).toBe('pending_business');
    expect(reservation.code).toMatch(/^HG-[0-9A-Z]{6}$/);
    expect(reservation.peopleCount).toBe(4);
    expect(reservation.totalPrice).toBeGreaterThan(0);

    const pendingPlan = await ctx.repo.getPlan(plan.id);
    expect(pendingPlan!.status).toBe('reservation_pending');

    // --- 9. İşletme onaylar --------------------------------------------------
    const members = await ctx.repo.listBusinessMembers(reservation.businessId);
    const owner = members.find((m) => m.role === 'owner')!;

    const confirmed = await respondToReservation(ctx, {
      reservationId: reservation.id,
      actorId: owner.userId,
      decision: 'confirm',
    });
    expect(confirmed.status).toBe('confirmed');

    // --- 10. Kullanıcı rezervasyon durumunu görür ---------------------------
    const detail = await buildPlanDetail(ctx, (await ctx.repo.getPlan(plan.id))!, user.id);
    expect(detail.plan.status).toBe('reservation_confirmed');
    expect(detail.reservation).not.toBeNull();
    expect(detail.reservation!.reservation.code).toBe(reservation.code);
    expect(detail.reservation!.history.length).toBeGreaterThanOrEqual(3);
    expect(detail.reservation!.history.map((h) => h.toStatus)).toContain('confirmed');
    expect(detail.winningPackage).not.toBeNull();

    // Kullanıcıya bildirim gitmiş olmalı
    const notifications = await ctx.repo.listNotifications(user.id);
    expect(notifications.some((n) => n.type === 'reservation_confirmed')).toBe(true);
  });

  it('misafir aynı cookie ile geri döndüğünde ikinci kez oy veremez', async () => {
    const { user } = await ctx.repo.signIn(DEMO_CREDENTIALS.user);
    const plan = (await ctx.repo.getPlan('plan-active'))!;
    const invitation = await createInvitation(ctx, { planId: plan.id, userId: user.id });
    const resolved = await resolveInviteToken(ctx, invitation.token);

    const first = await joinAsGuest(ctx, {
      planId: plan.id,
      invitationId: resolved.invitation.id,
      displayName: 'Tekrar Gelen',
      status: 'going',
      existingGuestSecret: null,
    });

    const second = await joinAsGuest(ctx, {
      planId: plan.id,
      invitationId: resolved.invitation.id,
      displayName: 'Tekrar Gelen',
      status: 'maybe',
      existingGuestSecret: first.guestSecret,
    });

    expect(second.isNew).toBe(false);
    expect(second.participantId).toBe(first.participantId);

    const { matches } = await computeMatches(ctx, plan);
    await castVote(ctx, {
      planId: plan.id,
      participantId: first.participantId,
      packageId: matches[0]!.package.id,
    });
    await castVote(ctx, {
      planId: plan.id,
      participantId: second.participantId,
      packageId: matches[1]?.package.id ?? matches[0]!.package.id,
    });

    const votes = await ctx.repo.listVotes(plan.id);
    const byThisGuest = votes.filter((v) => v.participantId === first.participantId);
    expect(byThisGuest).toHaveLength(1);
  });

  it('iptal edilmiş davet bağlantısı reddedilir ve yol gösterir', async () => {
    const { user } = await ctx.repo.signIn(DEMO_CREDENTIALS.user);
    const first = await createInvitation(ctx, { planId: 'plan-active', userId: user.id });

    // Yeni bağlantı üretmek eskisini geçersiz kılar
    await createInvitation(ctx, { planId: 'plan-active', userId: user.id });

    await expect(resolveInviteToken(ctx, first.token)).rejects.toThrow();

    try {
      await resolveInviteToken(ctx, first.token);
    } catch (error) {
      expect((error as { userMessage: string }).userMessage).toContain('Planı oluşturan');
    }
  });

  it('misafir görünümü bütçe ve özel not içermez', async () => {
    const view = await buildGuestPlanView(ctx, {
      planId: 'plan-active',
      viewerParticipantId: null,
    });

    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('budgetPerPerson');
    expect(serialized).not.toContain('budgetTotal');
    expect(serialized).not.toContain('Ayrı salon olursa süper olur');
    expect(view.planName).toBe('Cuma Akşamı Buluşması');
    expect(view.participants.length).toBeGreaterThan(0);
  });

  it('reddedilen rezervasyondan sonra plan alternatif seçime döner', async () => {
    const { user } = await ctx.repo.signIn(DEMO_CREDENTIALS.user);
    const businessOwner = await ctx.repo.signIn(DEMO_CREDENTIALS.businessOwner);

    const reservation = (await ctx.repo.getReservation('reservation-pending'))!;
    expect(reservation.status).toBe('pending_business');

    const rejected = await respondToReservation(ctx, {
      reservationId: reservation.id,
      actorId: businessOwner.user.id,
      decision: 'reject',
      rejectionReason: 'fully_booked',
      note: 'O saat için yerimiz dolu.',
    });

    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('fully_booked');

    const plan = await ctx.repo.getPlan(reservation.planId);
    expect(plan!.status).toBe('voting_closed');

    const notifications = await ctx.repo.listNotifications(user.id);
    expect(notifications.some((n) => n.type === 'reservation_rejected')).toBe(true);
  });

  it('plan iptal edilince katılımcılara bildirim gider', async () => {
    const { user } = await ctx.repo.signIn(DEMO_CREDENTIALS.user);
    await cancelPlan(ctx, 'plan-active', user.id, 'Grup uygun değil');

    const plan = await ctx.repo.getPlan('plan-active');
    expect(plan!.status).toBe('cancelled');
    expect(plan!.cancelledReason).toBe('Grup uygun değil');

    const friendNotifications = await ctx.repo.listNotifications('user-friend-1');
    expect(friendNotifications.some((n) => n.type === 'plan_cancelled')).toBe(true);
  });
});
