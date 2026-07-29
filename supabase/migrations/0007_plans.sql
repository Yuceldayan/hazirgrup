-- ============================================================================
-- 0007_plans.sql — Plan, kategori/tercih ilişkileri, katılımcı, davet, eşleşme
-- ROLLBACK: DROP TRIGGER plans_guard_status ON public.plans;
--           DROP FUNCTION public.guard_plan_status();
--           DROP TABLE public.plan_package_matches, public.plan_invitations,
--           public.plan_participants, public.plan_preferences,
--           public.plan_categories, public.plans;
-- ============================================================================

CREATE TABLE public.plans (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name               text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 80),
  status             public.plan_status NOT NULL DEFAULT 'draft',
  city_id            uuid NOT NULL REFERENCES public.cities (id) ON DELETE RESTRICT,
  district_id        uuid REFERENCES public.districts (id) ON DELETE SET NULL,
  event_date         date NOT NULL,
  start_time         time,
  end_time           time,
  is_time_flexible   boolean NOT NULL DEFAULT false,
  estimated_people   integer NOT NULL CHECK (estimated_people BETWEEN 1 AND 200),
  min_people         integer NOT NULL CHECK (min_people BETWEEN 1 AND 200),
  max_people         integer NOT NULL CHECK (max_people BETWEEN 1 AND 200),
  budget_mode        public.budget_mode NOT NULL DEFAULT 'per_person',
  budget_per_person  integer CHECK (budget_per_person IS NULL OR budget_per_person > 0),
  budget_total       integer CHECK (budget_total IS NULL OR budget_total > 0),
  note               text CHECK (note IS NULL OR char_length(note) <= 500),
  voting_starts_at   timestamptz,
  voting_ends_at     timestamptz,
  winning_package_id uuid REFERENCES public.packages (id) ON DELETE SET NULL,
  cancelled_reason   text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plans_people_range CHECK (min_people <= estimated_people AND estimated_people <= max_people),
  CONSTRAINT plans_budget_present
    CHECK (status = 'draft' OR budget_per_person IS NOT NULL OR budget_total IS NOT NULL)
);

CREATE TRIGGER plans_set_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Durum geçiş koruması — packages/core/src/status/plan.ts ile aynı kurallar
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_plan_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  allowed text[];
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE OLD.status
    WHEN 'draft'                    THEN ARRAY['awaiting_participants','cancelled']
    WHEN 'awaiting_participants'    THEN ARRAY['confirming_participation','packages_ready','cancelled']
    WHEN 'confirming_participation' THEN ARRAY['packages_ready','awaiting_participants','cancelled']
    WHEN 'packages_ready'           THEN ARRAY['voting','confirming_participation','cancelled']
    WHEN 'voting'                   THEN ARRAY['voting_closed','cancelled']
    WHEN 'voting_closed'            THEN ARRAY['reservation_pending','voting','cancelled']
    WHEN 'reservation_pending'      THEN ARRAY['reservation_confirmed','voting_closed','cancelled']
    WHEN 'reservation_confirmed'    THEN ARRAY['completed','cancelled']
    ELSE ARRAY[]::text[]
  END;

  IF NOT (NEW.status::text = ANY (allowed)) THEN
    RAISE EXCEPTION 'Gecersiz plan durum gecisi: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER plans_guard_status
  BEFORE UPDATE OF status ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.guard_plan_status();

-- ----------------------------------------------------------------------------

CREATE TABLE public.plan_categories (
  plan_id     uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories (id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, category_id)
);

CREATE TABLE public.plan_preferences (
  plan_id        uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  preference_key text NOT NULL REFERENCES public.preferences (key) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, preference_key)
);

-- ----------------------------------------------------------------------------

CREATE TABLE public.plan_participants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  user_id          uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  -- Misafir katılımcı: cookie'deki gizli değerin SHA-256 özeti (düz sır saklanmaz)
  guest_token_hash text,
  display_name     text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  status           public.participation_status NOT NULL DEFAULT 'pending',
  is_owner         boolean NOT NULL DEFAULT false,
  joined_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT participant_identity CHECK (user_id IS NOT NULL OR guest_token_hash IS NOT NULL),
  CONSTRAINT participant_user_unique UNIQUE (plan_id, user_id)
);

COMMENT ON COLUMN public.plan_participants.guest_token_hash IS
  'Misafir kimliği (docs/DECISIONS.md D-011). Düz sır yalnızca HttpOnly cookie''de.';

CREATE UNIQUE INDEX plan_participants_guest_unique
  ON public.plan_participants (plan_id, guest_token_hash)
  WHERE guest_token_hash IS NOT NULL;

-- ----------------------------------------------------------------------------

CREATE TABLE public.plan_invitations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  -- Düz token ASLA saklanmaz; yalnızca SHA-256 özeti (docs/SECURITY_MODEL.md §4)
  token_hash text NOT NULL UNIQUE,
  short_code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  expires_at timestamptz,
  revoked_at timestamptz,
  use_count  integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Kullanım sayacını atomik artıran fonksiyon
CREATE OR REPLACE FUNCTION public.increment_invitation_use(invitation_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.plan_invitations SET use_count = use_count + 1 WHERE id = invitation_id;
$$;

-- ----------------------------------------------------------------------------
-- Eşleşme önbelleği (gerçek kaynak hesaplamadır — docs/DECISIONS.md D-029)
-- ----------------------------------------------------------------------------
CREATE TABLE public.plan_package_matches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  package_id  uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  score       numeric(6,2) NOT NULL DEFAULT 0,
  reasons     jsonb NOT NULL DEFAULT '[]'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, package_id)
);
