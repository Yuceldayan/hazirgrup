import type {
  AdminLogEntry,
  AppNotification,
  BusinessApplication,
  Country,
  Category,
  City,
  District,
  Favorite,
  HelpArticle,
  IsoDate,
  LegalDocument,
  Plan,
  PlanInvitation,
  PlanParticipant,
  Preference,
  Reservation,
  ReservationStatusEvent,
  SeoRedirect,
  Vote,
} from '@hazirgrup/types';
import { hashToken } from '../invite/token';
import { addDays, toIsoDate } from '../format/datetime';
import { CATEGORIES, CITIES, COUNTRIES, DISTRICTS, PREFERENCES } from './catalog';
import { BRANCHES, BUSINESSES, PACKAGES } from './businesses';
import { BUSINESS_MEMBERS, DEMO_USERS, type DemoUser } from './people';
import { GUIDE_PAGES, HELP_ARTICLES, LEGAL_DOCUMENTS, type GuidePage } from './content';
import type { BusinessBranch, BusinessMember, Business, VenuePackage } from '@hazirgrup/types';

/**
 * Demo veri kümesi.
 *
 * Referans tarihe göre üretilir; böylece demo planlar her zaman "yakın gelecekte"
 * görünür ve veri bayatlamaz. Aynı fonksiyon `scripts/generate-seed-sql.ts`
 * tarafından `supabase/seed/seed.sql` üretmek için de kullanılır (D-005).
 *
 * TÜM VERİLER KURGUSALDIR.
 */

export interface DemoDataset {
  referenceDate: IsoDate;
  countries: Country[];
  cities: City[];
  districts: District[];
  categories: Category[];
  preferences: Preference[];
  users: DemoUser[];
  businesses: Business[];
  branches: BusinessBranch[];
  businessMembers: BusinessMember[];
  businessApplications: BusinessApplication[];
  packages: VenuePackage[];
  plans: Plan[];
  participants: PlanParticipant[];
  invitations: PlanInvitation[];
  /** Davet tokenlarının düz metni — YALNIZCA demo modda, dokümantasyon içindir. */
  inviteTokens: Record<string, string>;
  votes: Vote[];
  reservations: Reservation[];
  reservationHistory: ReservationStatusEvent[];
  notifications: AppNotification[];
  favorites: Favorite[];
  adminLogs: AdminLogEntry[];
  seoRedirects: SeoRedirect[];
  helpArticles: HelpArticle[];
  guides: GuidePage[];
  legalDocuments: LegalDocument[];
}

/** Demo davet tokenları — tahmin edilebilir olmaları yalnızca demo modda kabul edilebilir. */
export const DEMO_INVITE_TOKENS = {
  'plan-active': 'demo-davet-oylama-planinin-tokeni-2f4a8c',
  'plan-reservation': 'demo-davet-rezervasyon-planinin-tokeni-9b3d',
  'plan-invited': 'demo-davet-katilim-bekleyen-plan-tokeni-71ce',
} as const;

function isoAt(date: IsoDate, time: string): string {
  return `${date}T${time}:00.000Z`;
}

export function buildDataset(referenceDate: IsoDate): DemoDataset {
  const today = referenceDate;

  // Plan tarihleri referans tarihe göre türetilir.
  const dateActive = addDays(today, 5);
  const dateReservation = addDays(today, 8);
  const dateConfirmed = addDays(today, 12);
  const dateInvited = addDays(today, 3);
  const dateDraft = addDays(today, 9);
  const datePast = addDays(today, -20);

  const createdRecently = isoAt(addDays(today, -2), '09:00');
  const createdEarlier = isoAt(addDays(today, -6), '14:30');

  // -------------------------------------------------------------------------
  // Planlar
  // -------------------------------------------------------------------------

  const plans: Plan[] = [
    {
      id: 'plan-active',
      ownerId: 'user-demo',
      name: 'Cuma Akşamı Buluşması',
      status: 'voting',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      eventDate: dateActive,
      startTime: '20:00',
      endTime: '23:00',
      isTimeFlexible: true,
      estimatedPeople: 8,
      minPeople: 6,
      maxPeople: 10,
      budgetMode: 'per_person',
      budgetPerPerson: 30000,
      budgetTotal: 240000,
      note: 'Ayrı salon olursa süper olur.',
      categoryIds: ['cat-cafe'],
      preferenceKeys: ['private_room', 'quiet'],
      votingStartsAt: createdRecently,
      votingEndsAt: isoAt(addDays(today, 2), '21:00'),
      winningPackageId: null,
      cancelledReason: null,
      createdAt: createdRecently,
      updatedAt: createdRecently,
    },
    {
      id: 'plan-reservation',
      ownerId: 'user-demo',
      name: 'Halı Saha Maçı',
      status: 'reservation_pending',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      eventDate: dateReservation,
      startTime: '21:00',
      endTime: '22:00',
      isTimeFlexible: false,
      estimatedPeople: 12,
      minPeople: 10,
      maxPeople: 14,
      budgetMode: 'total',
      budgetPerPerson: 8500,
      budgetTotal: 100000,
      note: null,
      categoryIds: ['cat-pitch'],
      preferenceKeys: ['indoor_pitch', 'shower'],
      votingStartsAt: createdEarlier,
      votingEndsAt: isoAt(addDays(today, -3), '20:00'),
      winningPackageId: 'pkg-15',
      cancelledReason: null,
      createdAt: createdEarlier,
      updatedAt: isoAt(addDays(today, -1), '10:00'),
    },
    {
      id: 'plan-confirmed',
      ownerId: 'user-friend-1',
      name: 'Doğum Günü Sürprizi',
      status: 'reservation_confirmed',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      eventDate: dateConfirmed,
      startTime: '19:00',
      endTime: '22:00',
      isTimeFlexible: false,
      estimatedPeople: 12,
      minPeople: 10,
      maxPeople: 14,
      budgetMode: 'total',
      budgetPerPerson: 33000,
      budgetTotal: 400000,
      note: 'Pasta sürpriz olacak, sessiz kalalım.',
      categoryIds: ['cat-cafe'],
      preferenceKeys: ['birthday_setup', 'private_room'],
      votingStartsAt: isoAt(addDays(today, -8), '12:00'),
      votingEndsAt: isoAt(addDays(today, -5), '12:00'),
      winningPackageId: 'pkg-03',
      cancelledReason: null,
      createdAt: isoAt(addDays(today, -10), '12:00'),
      updatedAt: isoAt(addDays(today, -4), '16:20'),
    },
    {
      id: 'plan-invited',
      ownerId: 'user-friend-2',
      name: 'Oyun Gecesi',
      status: 'awaiting_participants',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      eventDate: dateInvited,
      startTime: '19:00',
      endTime: '22:00',
      isTimeFlexible: true,
      estimatedPeople: 6,
      minPeople: 4,
      maxPeople: 8,
      budgetMode: 'per_person',
      budgetPerPerson: 16000,
      budgetTotal: 96000,
      note: null,
      categoryIds: ['cat-game'],
      preferenceKeys: ['ps5', 'tournament'],
      votingStartsAt: null,
      votingEndsAt: null,
      winningPackageId: null,
      cancelledReason: null,
      createdAt: isoAt(addDays(today, -1), '18:45'),
      updatedAt: isoAt(addDays(today, -1), '18:45'),
    },
    {
      id: 'plan-draft',
      ownerId: 'user-demo',
      name: 'Hafta Sonu Kahvaltısı',
      status: 'draft',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      eventDate: dateDraft,
      startTime: '10:00',
      endTime: '12:30',
      isTimeFlexible: true,
      estimatedPeople: 6,
      minPeople: 4,
      maxPeople: 8,
      budgetMode: 'per_person',
      budgetPerPerson: 22000,
      budgetTotal: 132000,
      note: null,
      categoryIds: ['cat-cafe'],
      preferenceKeys: [],
      votingStartsAt: null,
      votingEndsAt: null,
      winningPackageId: null,
      cancelledReason: null,
      createdAt: isoAt(addDays(today, -1), '22:10'),
      updatedAt: isoAt(addDays(today, -1), '22:10'),
    },
    {
      id: 'plan-past',
      ownerId: 'user-demo',
      name: 'Geçen Ayki Maç Gecesi',
      status: 'completed',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      eventDate: datePast,
      startTime: '21:00',
      endTime: '23:30',
      isTimeFlexible: false,
      estimatedPeople: 9,
      minPeople: 6,
      maxPeople: 12,
      budgetMode: 'per_person',
      budgetPerPerson: 18000,
      budgetTotal: 162000,
      note: null,
      categoryIds: ['cat-cafe'],
      preferenceKeys: ['projector'],
      votingStartsAt: isoAt(addDays(today, -25), '12:00'),
      votingEndsAt: isoAt(addDays(today, -22), '12:00'),
      winningPackageId: 'pkg-30',
      cancelledReason: null,
      createdAt: isoAt(addDays(today, -28), '12:00'),
      updatedAt: isoAt(addDays(today, -19), '12:00'),
    },
  ];

  // -------------------------------------------------------------------------
  // Katılımcılar
  // -------------------------------------------------------------------------

  let participantSeq = 0;
  const participant = (
    planId: string,
    displayName: string,
    status: PlanParticipant['status'],
    options: { userId?: string; guestTokenHash?: string; isOwner?: boolean; joinedAt: string },
  ): PlanParticipant => {
    participantSeq += 1;
    return {
      id: `participant-${String(participantSeq).padStart(3, '0')}`,
      planId,
      userId: options.userId ?? null,
      guestTokenHash: options.guestTokenHash ?? null,
      displayName,
      status,
      isOwner: options.isOwner ?? false,
      joinedAt: options.joinedAt,
    };
  };

  const participants: PlanParticipant[] = [
    // plan-active — oylama devam ediyor, karışık katılım
    participant('plan-active', 'Elif Demir', 'going', {
      userId: 'user-demo',
      isOwner: true,
      joinedAt: createdRecently,
    }),
    participant('plan-active', 'Kerem Aslan', 'going', {
      userId: 'user-friend-1',
      joinedAt: isoAt(addDays(today, -2), '10:15'),
    }),
    participant('plan-active', 'Zeynep Kaya', 'going', {
      userId: 'user-friend-2',
      joinedAt: isoAt(addDays(today, -2), '11:02'),
    }),
    participant('plan-active', 'Mert Şahin', 'maybe', {
      userId: 'user-friend-3',
      joinedAt: isoAt(addDays(today, -1), '09:30'),
    }),
    participant('plan-active', 'Burak', 'going', {
      guestTokenHash: hashToken('demo-misafir-burak'),
      joinedAt: isoAt(addDays(today, -1), '13:44'),
    }),
    participant('plan-active', 'Selin', 'maybe', {
      guestTokenHash: hashToken('demo-misafir-selin'),
      joinedAt: isoAt(addDays(today, -1), '15:10'),
    }),
    participant('plan-active', 'Can', 'not_going', {
      guestTokenHash: hashToken('demo-misafir-can'),
      joinedAt: isoAt(addDays(today, -1), '17:22'),
    }),

    // plan-reservation
    participant('plan-reservation', 'Elif Demir', 'going', {
      userId: 'user-demo',
      isOwner: true,
      joinedAt: createdEarlier,
    }),
    participant('plan-reservation', 'Kerem Aslan', 'going', {
      userId: 'user-friend-1',
      joinedAt: isoAt(addDays(today, -6), '15:00'),
    }),
    participant('plan-reservation', 'Mert Şahin', 'going', {
      userId: 'user-friend-3',
      joinedAt: isoAt(addDays(today, -6), '16:20'),
    }),
    ...Array.from({ length: 9 }, (_, index) =>
      participant('plan-reservation', `Takım Arkadaşı ${index + 1}`, 'going', {
        guestTokenHash: hashToken(`demo-misafir-saha-${index + 1}`),
        joinedAt: isoAt(addDays(today, -5), '12:00'),
      }),
    ),

    // plan-confirmed (sahibi user-friend-1, user-demo katılımcı)
    participant('plan-confirmed', 'Kerem Aslan', 'going', {
      userId: 'user-friend-1',
      isOwner: true,
      joinedAt: isoAt(addDays(today, -10), '12:00'),
    }),
    participant('plan-confirmed', 'Elif Demir', 'going', {
      userId: 'user-demo',
      joinedAt: isoAt(addDays(today, -9), '19:00'),
    }),
    participant('plan-confirmed', 'Zeynep Kaya', 'going', {
      userId: 'user-friend-2',
      joinedAt: isoAt(addDays(today, -9), '20:10'),
    }),
    ...Array.from({ length: 9 }, (_, index) =>
      participant('plan-confirmed', `Davetli ${index + 1}`, 'going', {
        guestTokenHash: hashToken(`demo-misafir-dg-${index + 1}`),
        joinedAt: isoAt(addDays(today, -8), '12:00'),
      }),
    ),

    // plan-invited — user-demo henüz cevaplamadı (ana sayfada "davetler" kartı için)
    participant('plan-invited', 'Zeynep Kaya', 'going', {
      userId: 'user-friend-2',
      isOwner: true,
      joinedAt: isoAt(addDays(today, -1), '18:45'),
    }),
    participant('plan-invited', 'Elif Demir', 'pending', {
      userId: 'user-demo',
      joinedAt: isoAt(addDays(today, -1), '19:00'),
    }),
    participant('plan-invited', 'Mert Şahin', 'going', {
      userId: 'user-friend-3',
      joinedAt: isoAt(addDays(today, -1), '19:30'),
    }),

    // plan-draft — yalnızca sahip
    participant('plan-draft', 'Elif Demir', 'going', {
      userId: 'user-demo',
      isOwner: true,
      joinedAt: isoAt(addDays(today, -1), '22:10'),
    }),

    // plan-past
    participant('plan-past', 'Elif Demir', 'going', {
      userId: 'user-demo',
      isOwner: true,
      joinedAt: isoAt(addDays(today, -28), '12:00'),
    }),
    participant('plan-past', 'Kerem Aslan', 'going', {
      userId: 'user-friend-1',
      joinedAt: isoAt(addDays(today, -27), '12:00'),
    }),
    ...Array.from({ length: 7 }, (_, index) =>
      participant('plan-past', `Katılımcı ${index + 1}`, 'going', {
        guestTokenHash: hashToken(`demo-misafir-gecmis-${index + 1}`),
        joinedAt: isoAt(addDays(today, -26), '12:00'),
      }),
    ),
  ];

  // -------------------------------------------------------------------------
  // Davetler
  // -------------------------------------------------------------------------

  const invitations: PlanInvitation[] = [
    {
      id: 'invitation-active',
      planId: 'plan-active',
      tokenHash: hashToken(DEMO_INVITE_TOKENS['plan-active']),
      shortCode: 'H4K2M9V3',
      createdBy: 'user-demo',
      expiresAt: isoAt(addDays(dateActive, 1), '23:59'),
      revokedAt: null,
      useCount: 6,
      createdAt: createdRecently,
    },
    {
      id: 'invitation-reservation',
      planId: 'plan-reservation',
      tokenHash: hashToken(DEMO_INVITE_TOKENS['plan-reservation']),
      shortCode: 'S7B3N2K8',
      createdBy: 'user-demo',
      expiresAt: isoAt(addDays(dateReservation, 1), '23:59'),
      revokedAt: null,
      useCount: 11,
      createdAt: createdEarlier,
    },
    {
      id: 'invitation-invited',
      planId: 'plan-invited',
      tokenHash: hashToken(DEMO_INVITE_TOKENS['plan-invited']),
      shortCode: 'G9P4T6X2',
      createdBy: 'user-friend-2',
      expiresAt: isoAt(addDays(dateInvited, 1), '23:59'),
      revokedAt: null,
      useCount: 2,
      createdAt: isoAt(addDays(today, -1), '18:45'),
    },
  ];

  // -------------------------------------------------------------------------
  // Oylar (plan-active: canlı oylama; diğerleri kapanmış)
  // -------------------------------------------------------------------------

  const votes: Vote[] = [
    // pkg-02 önde (3 oy), pkg-08 (2 oy), pkg-03 (1 oy)
    ['participant-001', 'pkg-02'],
    ['participant-002', 'pkg-02'],
    ['participant-003', 'pkg-08'],
    ['participant-004', 'pkg-02'],
    ['participant-005', 'pkg-08'],
    ['participant-006', 'pkg-03'],
  ].map(([participantId, packageId], index) => ({
    id: `vote-${String(index + 1).padStart(3, '0')}`,
    planId: 'plan-active',
    participantId: participantId as string,
    packageId: packageId as string,
    createdAt: isoAt(addDays(today, -1), '12:00'),
    updatedAt: isoAt(addDays(today, -1), '12:00'),
  }));

  // plan-reservation oylaması (kazanan pkg-15)
  const reservationParticipants = participants.filter((p) => p.planId === 'plan-reservation');
  reservationParticipants.slice(0, 8).forEach((p, index) => {
    votes.push({
      id: `vote-res-${String(index + 1).padStart(3, '0')}`,
      planId: 'plan-reservation',
      participantId: p.id,
      packageId: index < 6 ? 'pkg-15' : 'pkg-16',
      createdAt: isoAt(addDays(today, -4), '12:00'),
      updatedAt: isoAt(addDays(today, -4), '12:00'),
    });
  });

  // -------------------------------------------------------------------------
  // Rezervasyonlar
  // -------------------------------------------------------------------------

  const reservations: Reservation[] = [
    {
      id: 'reservation-pending',
      planId: 'plan-reservation',
      packageId: 'pkg-15',
      branchId: 'branch-08',
      businessId: 'biz-05',
      createdBy: 'user-demo',
      code: 'HG-4T7K2M',
      peopleCount: 12,
      reservedDate: dateReservation,
      reservedStartTime: '21:00',
      reservedEndTime: '22:00',
      totalPrice: 90000,
      perPersonPrice: 7500,
      contactName: 'Elif Demir',
      contactPhone: '05001234567',
      note: 'Duş kullanacağız, havlu getirmemize gerek var mı?',
      status: 'pending_business',
      rejectionReason: null,
      rejectionNote: null,
      createdAt: isoAt(addDays(today, -1), '10:00'),
      updatedAt: isoAt(addDays(today, -1), '10:00'),
    },
    {
      id: 'reservation-confirmed',
      planId: 'plan-confirmed',
      packageId: 'pkg-03',
      branchId: 'branch-01',
      businessId: 'biz-01',
      createdBy: 'user-friend-1',
      code: 'HG-9NX3QB',
      peopleCount: 12,
      reservedDate: dateConfirmed,
      reservedStartTime: '19:00',
      reservedEndTime: '22:00',
      totalPrice: 380000,
      perPersonPrice: 31667,
      contactName: 'Kerem Aslan',
      contactPhone: '05009876543',
      note: 'Pasta sürpriz, salona geç getirebilir misiniz?',
      status: 'confirmed',
      rejectionReason: null,
      rejectionNote: null,
      createdAt: isoAt(addDays(today, -5), '11:00'),
      updatedAt: isoAt(addDays(today, -4), '16:20'),
    },
    {
      id: 'reservation-completed',
      planId: 'plan-past',
      packageId: 'pkg-30',
      branchId: 'branch-16',
      businessId: 'biz-10',
      createdBy: 'user-demo',
      code: 'HG-2VB8ZK',
      peopleCount: 9,
      reservedDate: datePast,
      reservedStartTime: '21:00',
      reservedEndTime: '23:30',
      totalPrice: 144000,
      perPersonPrice: 16000,
      contactName: 'Elif Demir',
      contactPhone: '05001234567',
      note: null,
      status: 'completed',
      rejectionReason: null,
      rejectionNote: null,
      createdAt: isoAt(addDays(today, -22), '10:00'),
      updatedAt: isoAt(addDays(today, -19), '23:59'),
    },
    {
      id: 'reservation-rejected',
      planId: 'plan-past',
      packageId: 'pkg-31',
      branchId: 'branch-16',
      businessId: 'biz-10',
      createdBy: 'user-demo',
      code: 'HG-6QW1RT',
      peopleCount: 9,
      reservedDate: datePast,
      reservedStartTime: '21:00',
      reservedEndTime: '23:30',
      totalPrice: 520000,
      perPersonPrice: 57778,
      contactName: 'Elif Demir',
      contactPhone: '05001234567',
      note: null,
      status: 'rejected',
      rejectionReason: 'capacity_mismatch',
      rejectionNote: 'Bu paket en az 10 kişi içindir, 9 kişiyle açamıyoruz.',
      createdAt: isoAt(addDays(today, -24), '09:00'),
      updatedAt: isoAt(addDays(today, -24), '13:00'),
    },
  ];

  let historySeq = 0;
  const historyEvent = (
    reservationId: string,
    fromStatus: Reservation['status'] | null,
    toStatus: Reservation['status'],
    changedBy: string | null,
    createdAt: string,
    reason: string | null = null,
  ): ReservationStatusEvent => {
    historySeq += 1;
    return {
      id: `res-event-${String(historySeq).padStart(3, '0')}`,
      reservationId,
      fromStatus,
      toStatus,
      changedBy,
      reason,
      createdAt,
    };
  };

  const reservationHistory: ReservationStatusEvent[] = [
    historyEvent('reservation-pending', null, 'created', 'user-demo', isoAt(addDays(today, -1), '10:00')),
    historyEvent('reservation-pending', 'created', 'pending_business', 'user-demo', isoAt(addDays(today, -1), '10:00')),

    historyEvent('reservation-confirmed', null, 'created', 'user-friend-1', isoAt(addDays(today, -5), '11:00')),
    historyEvent('reservation-confirmed', 'created', 'pending_business', 'user-friend-1', isoAt(addDays(today, -5), '11:00')),
    historyEvent('reservation-confirmed', 'pending_business', 'confirmed', 'user-owner-01', isoAt(addDays(today, -4), '16:20')),

    historyEvent('reservation-completed', null, 'created', 'user-demo', isoAt(addDays(today, -22), '10:00')),
    historyEvent('reservation-completed', 'created', 'pending_business', 'user-demo', isoAt(addDays(today, -22), '10:00')),
    historyEvent('reservation-completed', 'pending_business', 'confirmed', 'user-owner-10', isoAt(addDays(today, -21), '09:15')),
    historyEvent('reservation-completed', 'confirmed', 'completed', 'user-owner-10', isoAt(addDays(today, -19), '23:59')),

    historyEvent('reservation-rejected', null, 'created', 'user-demo', isoAt(addDays(today, -24), '09:00')),
    historyEvent('reservation-rejected', 'created', 'pending_business', 'user-demo', isoAt(addDays(today, -24), '09:00')),
    historyEvent(
      'reservation-rejected',
      'pending_business',
      'rejected',
      'user-owner-10',
      isoAt(addDays(today, -24), '13:00'),
      'Bu paket en az 10 kişi içindir, 9 kişiyle açamıyoruz.',
    ),
  ];

  // -------------------------------------------------------------------------
  // İşletme başvuruları
  // -------------------------------------------------------------------------

  const businessApplications: BusinessApplication[] = [
    {
      id: 'application-pending',
      applicantId: 'user-applicant',
      businessName: 'Vadi Kahve Atölyesi',
      contactName: 'Aday İşletmeci',
      phone: '05001119999',
      email: 'basvuru@ornek.test',
      address: 'Yeni Mahalle, Örnek Caddesi No:2, Yüksekova',
      cityId: 'city-hakkari',
      districtId: 'district-yuksekova',
      categoryId: 'cat-cafe',
      taxInfo: 'DEMO-VKN-0000000000',
      instagram: 'vadikahve_demo',
      website: null,
      logoUrl: null,
      status: 'pending',
      reviewNote: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: isoAt(addDays(today, -3), '11:20'),
    },
    {
      id: 'application-approved',
      applicantId: 'user-owner-01',
      businessName: 'Kuzey Işığı Kahve Evi',
      contactName: 'Serkan Aydın',
      phone: '05001110001',
      email: 'isletme01@ornek.test',
      address: 'Cumhuriyet Mahallesi, Örnek Caddesi No:12, Merkez',
      cityId: 'city-hakkari',
      districtId: 'district-merkez',
      categoryId: 'cat-cafe',
      taxInfo: 'DEMO-VKN-1111111111',
      instagram: 'kuzeyisigi_demo',
      website: null,
      logoUrl: '/media/cafe-1.svg',
      status: 'approved',
      reviewNote: 'Belgeler eksiksiz.',
      reviewedBy: 'user-admin',
      reviewedAt: '2026-01-15T09:00:00.000Z',
      createdAt: '2026-01-12T09:00:00.000Z',
    },
  ];

  // -------------------------------------------------------------------------
  // Bildirimler ve favoriler
  // -------------------------------------------------------------------------

  const notifications: AppNotification[] = [
    {
      id: 'notif-001',
      userId: 'user-demo',
      type: 'participant_joined',
      title: 'Burak plana katıldı',
      body: '“Cuma Akşamı Buluşması” planına Burak katıldı.',
      data: { planId: 'plan-active' },
      readAt: null,
      createdAt: isoAt(addDays(today, -1), '13:44'),
    },
    {
      id: 'notif-002',
      userId: 'user-demo',
      type: 'vote_cast',
      title: 'Yeni oy kullanıldı',
      body: '“Cuma Akşamı Buluşması” planında 6 oy kullanıldı.',
      data: { planId: 'plan-active' },
      readAt: null,
      createdAt: isoAt(addDays(today, -1), '15:20'),
    },
    {
      id: 'notif-003',
      userId: 'user-demo',
      type: 'reservation_submitted',
      title: 'Rezervasyon talebin gönderildi',
      body: '“Halı Saha Maçı” için Gol Krallığı Halı Saha’ya talebin iletildi.',
      data: { planId: 'plan-reservation', reservationId: 'reservation-pending' },
      readAt: isoAt(addDays(today, -1), '10:05'),
      createdAt: isoAt(addDays(today, -1), '10:00'),
    },
    {
      id: 'notif-004',
      userId: 'user-owner-05',
      type: 'new_reservation_request',
      title: 'Yeni rezervasyon talebi',
      body: '12 kişilik grup için 1 saatlik halı saha talebi geldi.',
      data: { reservationId: 'reservation-pending' },
      readAt: null,
      createdAt: isoAt(addDays(today, -1), '10:00'),
    },
    {
      id: 'notif-005',
      userId: 'user-friend-1',
      type: 'reservation_confirmed',
      title: 'Rezervasyonun onaylandı',
      body: 'Kuzey Işığı Kahve Evi rezervasyonunu onayladı. Kod: HG-9NX3QB',
      data: { reservationId: 'reservation-confirmed' },
      readAt: null,
      createdAt: isoAt(addDays(today, -4), '16:20'),
    },
  ];

  const favorites: Favorite[] = [
    { userId: 'user-demo', packageId: 'pkg-02', createdAt: isoAt(addDays(today, -3), '20:00') },
    { userId: 'user-demo', packageId: 'pkg-23', createdAt: isoAt(addDays(today, -7), '19:15') },
  ];

  const adminLogs: AdminLogEntry[] = [
    {
      id: 'log-001',
      actorId: 'user-admin',
      actorName: 'Sistem Yöneticisi',
      action: 'business.verify',
      entityType: 'business',
      entityId: 'biz-01',
      before: { status: 'pending_review' },
      after: { status: 'verified' },
      createdAt: '2026-01-15T09:00:00.000Z',
    },
    {
      id: 'log-002',
      actorId: 'user-admin',
      actorName: 'Sistem Yöneticisi',
      action: 'city.create',
      entityType: 'city',
      entityId: 'city-van',
      before: null,
      after: { name: 'Van', isActive: false },
      createdAt: '2026-01-16T10:30:00.000Z',
    },
    {
      id: 'log-003',
      actorId: 'user-admin',
      actorName: 'Sistem Yöneticisi',
      action: 'package.deactivate',
      entityType: 'package',
      entityId: 'pkg-33',
      before: { isActive: true },
      after: { isActive: false },
      createdAt: isoAt(addDays(today, -9), '14:00'),
    },
  ];

  const seoRedirects: SeoRedirect[] = [
    {
      id: 'redirect-001',
      fromPath: '/mekanlar/kuzey-isigi',
      toPath: '/mekanlar/kuzey-isigi-kahve-evi',
      statusCode: 301,
      isActive: true,
      createdAt: '2026-01-20T10:00:00.000Z',
    },
  ];

  return {
    referenceDate: today,
    countries: COUNTRIES,
    cities: CITIES,
    districts: DISTRICTS,
    categories: CATEGORIES,
    preferences: PREFERENCES,
    users: DEMO_USERS,
    businesses: BUSINESSES,
    branches: BRANCHES,
    businessMembers: BUSINESS_MEMBERS,
    businessApplications,
    packages: PACKAGES,
    plans,
    participants,
    invitations,
    inviteTokens: { ...DEMO_INVITE_TOKENS },
    votes,
    reservations,
    reservationHistory,
    notifications,
    favorites,
    adminLogs,
    seoRedirects,
    helpArticles: HELP_ARTICLES,
    guides: GUIDE_PAGES,
    legalDocuments: LEGAL_DOCUMENTS,
  };
}

/** SQL seed üretimi için sabit referans tarihi (deterministik çıktı). */
export const SEED_REFERENCE_DATE: IsoDate = '2026-03-02';

export function todayIso(nowMs: number): IsoDate {
  return toIsoDate(new Date(nowMs));
}

export { GUIDE_PAGES, HELP_ARTICLES, LEGAL_DOCUMENTS };
export type { GuidePage, DemoUser };
