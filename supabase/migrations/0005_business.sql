-- ============================================================================
-- 0005_business.sql — İşletme, şube, çalışma saatleri, ekip, başvuru
-- ROLLBACK: DROP TABLE public.business_applications, public.business_members,
--           public.branch_hours, public.business_branches, public.businesses;
-- ============================================================================

CREATE TABLE public.businesses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  name            text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  slug            text NOT NULL UNIQUE CHECK (public.is_valid_slug(slug)),
  description     text NOT NULL DEFAULT '',
  category_id     uuid NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  status          public.business_status NOT NULL DEFAULT 'pending_review',
  is_public       boolean NOT NULL DEFAULT false,
  is_indexable    boolean NOT NULL DEFAULT true,
  logo_url        text,
  cover_url       text,
  phone           text,
  whatsapp        text,
  website         text,
  instagram       text,
  verified_at     timestamptz,
  verified_by     uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  seo_title       text,
  seo_description text,
  seo_canonical   text,
  og_image_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.businesses.status IS
  'Yalnızca ''verified'' işletmeler public sayfalarda görünür (docs/DECISIONS.md D-026).';

CREATE TRIGGER businesses_set_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------

CREATE TABLE public.business_branches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  slug        text NOT NULL CHECK (public.is_valid_slug(slug)),
  city_id     uuid NOT NULL REFERENCES public.cities (id) ON DELETE RESTRICT,
  district_id uuid NOT NULL REFERENCES public.districts (id) ON DELETE RESTRICT,
  address     text NOT NULL,
  lat         double precision,
  lng         double precision,
  phone       text,
  whatsapp    text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE TRIGGER business_branches_set_updated_at
  BEFORE UPDATE ON public.business_branches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------

CREATE TABLE public.branch_hours (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id  uuid NOT NULL REFERENCES public.business_branches (id) ON DELETE CASCADE,
  weekday    smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens_at   time,
  closes_at  time,
  is_closed  boolean NOT NULL DEFAULT false,
  UNIQUE (branch_id, weekday),
  CONSTRAINT branch_hours_times_present
    CHECK (is_closed OR (opens_at IS NOT NULL AND closes_at IS NOT NULL))
);

COMMENT ON CONSTRAINT branch_hours_times_present ON public.branch_hours IS
  'Kapalı olmayan günlerde açılış ve kapanış saati zorunludur. Gece yarısını aşan
   aralıklara izin verilir (closes_at < opens_at geçerlidir).';

-- ----------------------------------------------------------------------------

CREATE TABLE public.business_members (
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role        public.business_member_role NOT NULL DEFAULT 'staff',
  invited_by  uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, user_id)
);

-- ----------------------------------------------------------------------------

CREATE TABLE public.business_applications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id  uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  business_name text NOT NULL,
  contact_name  text NOT NULL,
  phone         text NOT NULL,
  email         text NOT NULL,
  address       text NOT NULL,
  city_id       uuid NOT NULL REFERENCES public.cities (id) ON DELETE RESTRICT,
  district_id   uuid NOT NULL REFERENCES public.districts (id) ON DELETE RESTRICT,
  category_id   uuid NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  tax_info      text,
  instagram     text,
  website       text,
  logo_url      text,
  status        public.application_status NOT NULL DEFAULT 'pending',
  review_note   text,
  reviewed_by   uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.business_applications.tax_info IS
  'Vergi/işletme kimlik bilgisi. RLS ile yalnızca yönetici ve başvuru sahibi erişir.';
