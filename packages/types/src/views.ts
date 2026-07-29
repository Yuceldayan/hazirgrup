/**
 * Birleştirilmiş görünüm tipleri (UI'ın ihtiyaç duyduğu şekliyle veri).
 *
 * `Public*` ile başlayan tipler herkese açık sayfalarda kullanılır ve
 * **hiçbir kişisel veri içermez** (bkz. docs/SECURITY_MODEL.md T-5).
 */

import type {
  BranchHours,
  Business,
  BusinessBranch,
  Category,
  City,
  District,
  Id,
  MatchReason,
  PackageAvailability,
  PackageImage,
  PackageItem,
  Plan,
  PlanParticipant,
  Reservation,
  ReservationStatusEvent,
  VenuePackage,
  Vote,
  VotingResult,
} from './entities';
import type { ParticipationStatus, PlanStatus, PricingModel } from './enums';
import type { ClockTime, IsoDate, Kurus } from './primitives';

// ---------------------------------------------------------------------------
// Public projeksiyonlar — kişisel veri içermez
// ---------------------------------------------------------------------------

export interface PublicLocationRef {
  id: Id;
  name: string;
  slug: string;
}

export interface PublicBranch {
  id: Id;
  name: string;
  address: string;
  city: PublicLocationRef;
  district: PublicLocationRef;
  phone: string | null;
  whatsapp: string | null;
  lat: number | null;
  lng: number | null;
  hours: BranchHours[];
}

export interface PublicPackageSummary {
  id: Id;
  name: string;
  slug: string;
  categoryName: string;
  minPeople: number;
  maxPeople: number;
  pricingModel: PricingModel;
  /** Referans grup büyüklüğü için hesaplanmış kişi başı fiyat (kuruş). */
  perPersonFrom: Kurus;
  /** Minimum kişi sayısındaki toplam fiyat (kuruş). */
  totalFrom: Kurus;
  imageUrl: string | null;
  businessName: string;
  districtName: string;
}

export interface PublicBusiness {
  id: Id;
  name: string;
  slug: string;
  description: string;
  category: PublicLocationRef;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  isVerified: boolean;
  branches: PublicBranch[];
  packages: PublicPackageSummary[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  ogImageUrl: string | null;
  isIndexable: boolean;
  updatedAt: string;
}

export interface PublicPackage {
  id: Id;
  name: string;
  slug: string;
  description: string;
  minPeople: number;
  maxPeople: number;
  pricingModel: PricingModel;
  priceAmount: Kurus;
  perPersonFrom: Kurus;
  totalFrom: Kurus;
  durationMinutes: number | null;
  reservationTerms: string | null;
  cancellationTerms: string | null;
  isActive: boolean;
  items: PackageItem[];
  images: PackageImage[];
  availability: PackageAvailability[];
  category: PublicLocationRef;
  business: {
    id: Id;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    phone: string | null;
    whatsapp: string | null;
  };
  branch: PublicBranch;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  ogImageUrl: string | null;
  isIndexable: boolean;
  updatedAt: string;
}

export interface PublicCitySummary {
  city: City;
  districtCount: number;
  businessCount: number;
  packageCount: number;
  categories: Array<{ category: Category; packageCount: number }>;
}

export interface PublicDistrictSummary {
  district: District;
  city: City;
  businessCount: number;
  packageCount: number;
  categories: Array<{ category: Category; packageCount: number }>;
}

export interface PublicCategorySummary {
  category: Category;
  businessCount: number;
  packageCount: number;
  cities: Array<{ city: City; packageCount: number }>;
}

// ---------------------------------------------------------------------------
// Uygulama içi görünümler
// ---------------------------------------------------------------------------

export interface PackageWithContext {
  package: VenuePackage;
  business: Business;
  branch: BusinessBranch;
  category: Category;
  city: City;
  district: District;
}

/** Eşleştirme sonucunda dönen paket + skor + gerekçeler. */
export interface MatchedPackage {
  package: VenuePackage;
  business: Business;
  branch: BusinessBranch;
  category: Category;
  city: City;
  district: District;
  score: number;
  reasons: MatchReason[];
  /** Plandaki tahmini kişi sayısına göre hesaplanmış fiyatlar. */
  pricing: {
    peopleCount: number;
    totalPrice: Kurus;
    perPersonPrice: Kurus;
    /** Kişi başı bütçeye göre fark (pozitif = bütçeyi aşıyor). */
    perPersonDiff: Kurus;
    overBudgetPercent: number;
  };
}

export interface PlanSummary {
  plan: Plan;
  city: City;
  district: District | null;
  participantCount: number;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  pendingCount: number;
  matchCount: number;
  voteCount: number;
  /** Kullanıcının bu planda yapması gereken bir sonraki iş. */
  nextAction: PlanNextAction;
}

export interface PlanNextAction {
  key: string;
  label: string;
  description: string;
  href: string | null;
  /** Yalnızca plan sahibi yapabiliyorsa true. */
  ownerOnly: boolean;
}

export interface PlanDetail extends PlanSummary {
  participants: PlanParticipant[];
  categories: Category[];
  matches: MatchedPackage[];
  votes: Vote[];
  votingResult: VotingResult | null;
  winningPackage: PackageWithContext | null;
  reservation: ReservationDetail | null;
  invitation: {
    shortCode: string;
    inviteUrl: string;
    expiresAt: string | null;
    isRevoked: boolean;
  } | null;
  /** İsteği yapan kişinin bu plandaki katılımcı kaydı (varsa). */
  viewerParticipant: PlanParticipant | null;
  viewerIsOwner: boolean;
  viewerVote: Vote | null;
}

export interface ReservationDetail {
  reservation: Reservation;
  package: VenuePackage;
  business: Business;
  branch: BusinessBranch;
  city: City;
  district: District;
  history: ReservationStatusEvent[];
  plan: { id: Id; name: string; status: PlanStatus } | null;
}

/** Misafirin davet sayfasında gördüğü, gizlilik korumalı plan özeti. */
export interface GuestPlanView {
  planId: Id;
  planName: string;
  status: PlanStatus;
  eventDate: IsoDate;
  startTime: ClockTime | null;
  endTime: ClockTime | null;
  cityName: string;
  districtName: string | null;
  ownerDisplayName: string;
  participantCount: number;
  goingCount: number;
  /** Katılımcı adları — yalnızca katılan misafire gösterilir, OG kartına konmaz. */
  participants: Array<{ id: Id; displayName: string; status: ParticipationStatus }>;
  matches: MatchedPackage[];
  votingResult: VotingResult | null;
  votingEndsAt: string | null;
  winningPackageId: Id | null;
  viewerParticipantId: Id | null;
  viewerVotePackageId: Id | null;
  canVote: boolean;
}

// ---------------------------------------------------------------------------
// İşletme paneli görünümleri
// ---------------------------------------------------------------------------

export interface BusinessDashboardStats {
  totalPackages: number;
  activePackages: number;
  pendingReservations: number;
  confirmedReservations: number;
  upcomingReservations: number;
  totalGuestsThisMonth: number;
  averageResponseHours: number | null;
}

export interface BusinessReservationRow {
  reservation: Reservation;
  packageName: string;
  branchName: string;
  planName: string | null;
}

// ---------------------------------------------------------------------------
// Yönetici paneli görünümleri
// ---------------------------------------------------------------------------

export interface AdminOverviewStats {
  userCount: number;
  businessCount: number;
  pendingApplications: number;
  packageCount: number;
  planCount: number;
  reservationCount: number;
  openReports: number;
  openTickets: number;
  activeCities: number;
}
