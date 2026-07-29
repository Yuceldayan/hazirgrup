-- ============================================================================
-- 0002_enums.sql — Enum tipleri
-- ROLLBACK: DROP TYPE ... CASCADE (tabloları düşürdükten sonra)
-- ============================================================================

CREATE TYPE public.plan_status AS ENUM (
  'draft',
  'awaiting_participants',
  'confirming_participation',
  'packages_ready',
  'voting',
  'voting_closed',
  'reservation_pending',
  'reservation_confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE public.participation_status AS ENUM (
  'pending',
  'going',
  'maybe',
  'not_going'
);

CREATE TYPE public.reservation_status AS ENUM (
  'created',
  'pending_business',
  'confirmed',
  'rejected',
  'cancelled_by_user',
  'cancelled_by_business',
  'completed',
  'no_show'
);

CREATE TYPE public.rejection_reason AS ENUM (
  'fully_booked',
  'capacity_mismatch',
  'closed_that_day',
  'package_unavailable',
  'contact_failed',
  'other'
);

CREATE TYPE public.pricing_model AS ENUM ('per_person', 'total');

CREATE TYPE public.budget_mode AS ENUM ('per_person', 'total');

CREATE TYPE public.app_role AS ENUM (
  'user',
  'business_staff',
  'business_owner',
  'moderator',
  'admin'
);

CREATE TYPE public.business_status AS ENUM (
  'draft',
  'pending_review',
  'verified',
  'rejected',
  'suspended'
);

CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.business_member_role AS ENUM ('owner', 'staff');

CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

CREATE TYPE public.report_subject_type AS ENUM ('business', 'package', 'plan', 'user');

CREATE TYPE public.ticket_status AS ENUM ('open', 'answered', 'closed');

CREATE TYPE public.notification_channel AS ENUM ('in_app', 'push', 'email');

CREATE TYPE public.theme_preference AS ENUM ('system', 'light', 'dark');
