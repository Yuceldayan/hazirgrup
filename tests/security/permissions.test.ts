import { beforeEach, describe, expect, it } from 'vitest';
import {
  AppError,
  buildGuestPlanView,
  castVote,
  closeVoting,
  createInvitation,
  createReservationRequest,
  type DemoRepository,
  FORBIDDEN_PUBLIC_FIELDS,
  InMemoryRateLimitStore,
  enforceRateLimit,
  joinAsGuest,
  RATE_LIMITS,
  requireOwnedPlan,
  requirePlanAccess,
  resolveInviteToken,
  respondToReservation,
  startVoting,
  type ServiceContext,
} from '@hazirgrup/core';
import { createTestContext, DEMO_CREDENTIALS } from '../integration/helpers';

/**
 * Güvenlik testleri (docs/TEST_STRATEGY.md §6).
 *
 * Bu testler uygulama katmanındaki yetki kontrollerini doğrular. Veritabanı
 * seviyesindeki RLS ayrıca `supabase/tests/rls.sql` ile test edilir.
 */

describe('plan erişim yetkileri', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('katılımcı olmayan kullanıcı plan detayına erişemez', async () => {
    // plan-active sahibi user-demo; user-friend-1 katılımcı; başka bir kullanıcı değil.
    await expect(requirePlanAccess(ctx, 'plan-active', 'user-owner-08')).rejects.toThrow(AppError);

    try {
      await requirePlanAccess(ctx, 'plan-active', 'user-owner-08');
    } catch (error) {
      expect((error as AppError).code).toBe('forbidden');
    }
  });

  it('katılımcı plan detayına erişebilir', async () => {
    await expect(requirePlanAccess(ctx, 'plan-active', 'user-friend-1')).resolves.toBeDefined();
  });

  it('sahip olmayan kullanıcı sahip işlemlerini yapamaz', async () => {
    await expect(requireOwnedPlan(ctx, 'plan-active', 'user-friend-1')).rejects.toThrow(AppError);
  });

  it('sahip olmayan kullanıcı davet bağlantısı üretemez', async () => {
    await expect(
      createInvitation(ctx, { planId: 'plan-active', userId: 'user-friend-1' }),
    ).rejects.toThrow(AppError);
  });

  it('sahip olmayan kullanıcı oylamayı bitiremez', async () => {
    await expect(
      closeVoting(ctx, { planId: 'plan-active', userId: 'user-friend-1' }),
    ).rejects.toThrow(AppError);
  });

  it('sahip olmayan kullanıcı rezervasyon talebi gönderemez', async () => {
    await expect(
      createReservationRequest(ctx, {
        planId: 'plan-reservation',
        userId: 'user-friend-1',
        packageId: 'pkg-15',
        contactName: 'Kerem',
        contactPhone: '05551112233',
        note: null,
      }),
    ).rejects.toThrow(AppError);
  });
});

describe('oylama güvenliği', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('plandaki katılımcı olmayan oy veremez', async () => {
    await expect(
      castVote(ctx, {
        planId: 'plan-active',
        participantId: 'baska-plandan-katilimci',
        packageId: 'pkg-02',
      }),
    ).rejects.toThrow(AppError);
  });

  it('katılmayacağını belirten kişi oy veremez', async () => {
    const participants = await ctx.repo.listParticipants('plan-active');
    const notGoing = participants.find((p) => p.status === 'not_going');
    expect(notGoing).toBeDefined();

    await expect(
      castVote(ctx, {
        planId: 'plan-active',
        participantId: notGoing!.id,
        packageId: 'pkg-02',
      }),
    ).rejects.toThrow(AppError);
  });

  it('oylama kapalıyken oy verilemez', async () => {
    const participants = await ctx.repo.listParticipants('plan-confirmed');
    const participant = participants[0]!;

    await expect(
      castVote(ctx, {
        planId: 'plan-confirmed',
        participantId: participant.id,
        packageId: 'pkg-03',
      }),
    ).rejects.toThrow(AppError);
  });

  it('aynı katılımcı ikinci kez oy ekleyemez, mevcut oy güncellenir', async () => {
    const participants = await ctx.repo.listParticipants('plan-active');
    const participant = participants.find((p) => p.status === 'going')!;

    await castVote(ctx, {
      planId: 'plan-active',
      participantId: participant.id,
      packageId: 'pkg-02',
    });
    await castVote(ctx, {
      planId: 'plan-active',
      participantId: participant.id,
      packageId: 'pkg-08',
    });

    const votes = await ctx.repo.listVotes('plan-active');
    const own = votes.filter((v) => v.participantId === participant.id);
    expect(own).toHaveLength(1);
    expect(own[0]!.packageId).toBe('pkg-08');
  });

  it('oylama eşleşme yokken başlatılamaz', async () => {
    await expect(
      startVoting(ctx, {
        planId: 'plan-invited',
        userId: 'user-friend-2',
        endsAt: null,
        matchCount: 0,
      }),
    ).rejects.toThrow(AppError);
  });
});

describe('işletme yetki sınırı', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('işletme A, işletme B nin rezervasyonuna yanıt veremez', async () => {
    // reservation-pending → biz-05 (Gol Krallığı). biz-01 sahibi yanıt veremez.
    await expect(
      respondToReservation(ctx, {
        reservationId: 'reservation-pending',
        actorId: 'user-owner-01',
        decision: 'confirm',
      }),
    ).rejects.toThrow(AppError);

    try {
      await respondToReservation(ctx, {
        reservationId: 'reservation-pending',
        actorId: 'user-owner-01',
        decision: 'confirm',
      });
    } catch (error) {
      expect((error as AppError).code).toBe('forbidden');
    }
  });

  it('doğru işletme yanıt verebilir', async () => {
    const result = await respondToReservation(ctx, {
      reservationId: 'reservation-pending',
      actorId: 'user-owner-05',
      decision: 'confirm',
    });
    expect(result.status).toBe('confirmed');
  });

  it('gerekçesiz ret reddedilir', async () => {
    await expect(
      respondToReservation(ctx, {
        reservationId: 'reservation-pending',
        actorId: 'user-owner-05',
        decision: 'reject',
        rejectionReason: null,
      }),
    ).rejects.toThrow(AppError);
  });

  it('sonuçlanmış rezervasyona ikinci kez yanıt verilemez', async () => {
    await respondToReservation(ctx, {
      reservationId: 'reservation-pending',
      actorId: 'user-owner-05',
      decision: 'confirm',
    });

    await expect(
      respondToReservation(ctx, {
        reservationId: 'reservation-pending',
        actorId: 'user-owner-05',
        decision: 'reject',
        rejectionReason: 'fully_booked',
      }),
    ).rejects.toThrow(AppError);
  });
});

describe('davet tokenı güvenliği', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('geçersiz token reddedilir', async () => {
    await expect(resolveInviteToken(ctx, 'uydurma-token')).rejects.toThrow(AppError);
  });

  it('token veritabanında düz metin saklanmaz', async () => {
    const invitation = await ctx.repo.getActiveInvitation('plan-active');
    expect(invitation).not.toBeNull();
    expect(invitation!.tokenHash).toMatch(/^[0-9a-f]{64}$/);

    const serialized = JSON.stringify(invitation);
    expect(serialized).not.toContain('demo-davet');
  });

  it('yeni token üretmek eskisini geçersiz kılar', async () => {
    const first = await createInvitation(ctx, { planId: 'plan-active', userId: 'user-demo' });
    await createInvitation(ctx, { planId: 'plan-active', userId: 'user-demo' });

    await expect(resolveInviteToken(ctx, first.token)).rejects.toThrow(AppError);
  });

  it('misafir sırrı veritabanında düz saklanmaz', async () => {
    const invitation = await createInvitation(ctx, { planId: 'plan-active', userId: 'user-demo' });
    const resolved = await resolveInviteToken(ctx, invitation.token);

    const guest = await joinAsGuest(ctx, {
      planId: 'plan-active',
      invitationId: resolved.invitation.id,
      displayName: 'Gizli Misafir',
      status: 'going',
      existingGuestSecret: null,
    });

    const participants = await ctx.repo.listParticipants('plan-active');
    const record = participants.find((p) => p.id === guest.participantId)!;

    expect(record.guestTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(record.guestTokenHash).not.toBe(guest.guestSecret);
    expect(JSON.stringify(record)).not.toContain(guest.guestSecret);
  });
});

describe('public projeksiyon — kişisel veri sızıntısı', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('public paket çıktısında yasaklı alan bulunmaz', async () => {
    const packages = await ctx.repo.listPublicPackages({});
    expect(packages.length).toBeGreaterThan(0);

    for (const pkg of packages) {
      const serialized = JSON.stringify(pkg);
      for (const field of FORBIDDEN_PUBLIC_FIELDS) {
        // `note` paket içeriğinde geçerli bir alan değil; diğerleri hiç olmamalı.
        expect(serialized, `${pkg.slug} içinde ${field}`).not.toContain(`"${field}":`);
      }
    }
  });

  it('public işletme çıktısında sahip kimliği ve vergi bilgisi bulunmaz', async () => {
    const businesses = await ctx.repo.listPublicBusinesses({});

    for (const business of businesses) {
      const serialized = JSON.stringify(business);
      expect(serialized).not.toContain('"ownerId":');
      expect(serialized).not.toContain('"taxInfo":');
      expect(serialized).not.toContain('"verifiedBy":');
      expect(serialized).not.toContain('@ornek.test');
    }
  });

  it('misafir plan görünümü bütçe, not ve telefon içermez', async () => {
    const view = await buildGuestPlanView(ctx, {
      planId: 'plan-active',
      viewerParticipantId: null,
    });
    const serialized = JSON.stringify(view);

    expect(serialized).not.toContain('budgetPerPerson');
    expect(serialized).not.toContain('budgetTotal');
    expect(serialized).not.toContain('contactPhone');
    expect(serialized).not.toContain('guestTokenHash');
    expect(serialized).not.toContain('Ayrı salon olursa süper olur');
  });

  it('misafir görünümü katılımcı kimliklerini sızdırmaz (yalnız ad ve durum)', async () => {
    const view = await buildGuestPlanView(ctx, {
      planId: 'plan-active',
      viewerParticipantId: null,
    });

    for (const participant of view.participants) {
      expect(Object.keys(participant).sort()).toEqual(['displayName', 'id', 'status']);
    }
  });
});

describe('hız sınırlama', () => {
  it('oy verme sınırı aşıldığında engellenir', async () => {
    const store = new InMemoryRateLimitStore();
    const now = 1_700_000_000_000;

    for (let i = 0; i < RATE_LIMITS.vote.limit; i += 1) {
      await enforceRateLimit(store, 'vote', 'participant-1', now);
    }

    await expect(enforceRateLimit(store, 'vote', 'participant-1', now)).rejects.toThrow(AppError);
  });

  it('misafir katılım sınırı uygulanır', async () => {
    const store = new InMemoryRateLimitStore();
    const now = 1_700_000_000_000;

    for (let i = 0; i < RATE_LIMITS.guestJoin.limit; i += 1) {
      await enforceRateLimit(store, 'guestJoin', '1.2.3.4', now);
    }

    await expect(enforceRateLimit(store, 'guestJoin', '1.2.3.4', now)).rejects.toThrow(AppError);
  });

  it('giriş denemesi sınırı e-posta+IP başına uygulanır', async () => {
    const store = new InMemoryRateLimitStore();
    const now = 1_700_000_000_000;

    for (let i = 0; i < RATE_LIMITS.signIn.limit; i += 1) {
      await enforceRateLimit(store, 'signIn', '1.2.3.4:kurban@ornek.test', now);
    }

    await expect(
      enforceRateLimit(store, 'signIn', '1.2.3.4:kurban@ornek.test', now),
    ).rejects.toThrow(AppError);

    // Başka kullanıcı etkilenmez
    await expect(
      enforceRateLimit(store, 'signIn', '1.2.3.4:baska@ornek.test', now),
    ).resolves.toBeUndefined();
  });
});

describe('kimlik doğrulama', () => {
  let ctx: ServiceContext & { repo: DemoRepository };

  beforeEach(() => {
    ctx = createTestContext();
  });

  it('yanlış şifre jenerik mesajla reddedilir (kullanıcı numaralandırma koruması)', async () => {
    let wrongPasswordMessage = '';
    let unknownUserMessage = '';

    try {
      await ctx.repo.signIn({ email: DEMO_CREDENTIALS.user.email, password: 'YanlisSifre1' });
    } catch (error) {
      wrongPasswordMessage = (error as AppError).userMessage;
    }

    try {
      await ctx.repo.signIn({ email: 'olmayan@ornek.test', password: 'Herhangi1' });
    } catch (error) {
      unknownUserMessage = (error as AppError).userMessage;
    }

    expect(wrongPasswordMessage).toBe(unknownUserMessage);
    expect(wrongPasswordMessage).toBe('E-posta veya şifre hatalı.');
  });

  it('askıya alınmış hesap giriş yapamaz', async () => {
    await ctx.repo.setUserSuspended('user-friend-1', true, 'user-admin');
    await expect(
      ctx.repo.signIn({ email: 'kerem@ornek.test', password: 'Demo1234' }),
    ).rejects.toThrow(AppError);
  });

  it('şifre sıfırlama, olmayan e-postada da başarılı görünür', async () => {
    const result = await ctx.repo.requestPasswordReset('olmayan@ornek.test');
    expect(result.resetToken).toBeNull();
  });

  it('hesap silme profil verisini anonimleştirir', async () => {
    await ctx.repo.deleteAccount('user-friend-1', new Date(ctx.nowMs).toISOString());
    const profile = await ctx.repo.getProfile('user-friend-1');

    expect(profile?.deletedAt).not.toBeNull();
    expect(profile?.displayName).toBe('Silinmiş kullanıcı');
    expect(profile?.phone).toBeNull();

    // Silinen hesapla giriş yapılamaz
    await expect(
      ctx.repo.signIn({ email: 'kerem@ornek.test', password: 'Demo1234' }),
    ).rejects.toThrow(AppError);
  });

  it('yönetici rolü seed verisinde doğru atanmıştır', async () => {
    const roles = await ctx.repo.getUserRoles('user-admin');
    expect(roles).toContain('admin');

    const userRoles = await ctx.repo.getUserRoles('user-demo');
    expect(userRoles).not.toContain('admin');
  });
});
