-- ============================================================================
-- 0004_location.sql — Ülke / il / ilçe / kategori / tercih
-- Hakkâri sabit kodlanmaz; yeni şehir yönetici panelinden eklenir.
-- ROLLBACK: DROP TABLE public.preferences, public.categories,
--           public.districts, public.cities, public.countries;
-- ============================================================================

CREATE TABLE public.countries (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code      text NOT NULL UNIQUE CHECK (char_length(code) = 2),
  name      text NOT NULL,
  slug      text NOT NULL UNIQUE CHECK (public.is_valid_slug(slug)),
  is_active boolean NOT NULL DEFAULT true
);

-- ----------------------------------------------------------------------------

CREATE TABLE public.cities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id      uuid NOT NULL REFERENCES public.countries (id) ON DELETE RESTRICT,
  name            text NOT NULL,
  slug            text NOT NULL CHECK (public.is_valid_slug(slug)),
  intro           text,
  is_active       boolean NOT NULL DEFAULT false,
  is_public       boolean NOT NULL DEFAULT false,
  is_indexable    boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  seo_title       text,
  seo_description text,
  seo_canonical   text,
  og_image_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_id, slug)
);

COMMENT ON COLUMN public.cities.is_active IS
  'Yönetici panelinden açılır; kod değişikliği gerektirmez.';
COMMENT ON COLUMN public.cities.is_indexable IS
  'İçerik eşiği ayrıca uygulanır (docs/SEO_STRATEGY.md §1).';

CREATE TRIGGER cities_set_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------

CREATE TABLE public.districts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         uuid NOT NULL REFERENCES public.cities (id) ON DELETE CASCADE,
  name            text NOT NULL,
  slug            text NOT NULL CHECK (public.is_valid_slug(slug)),
  intro           text,
  is_active       boolean NOT NULL DEFAULT true,
  is_public       boolean NOT NULL DEFAULT true,
  is_indexable    boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  seo_title       text,
  seo_description text,
  seo_canonical   text,
  og_image_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, slug)
);

CREATE TRIGGER districts_set_updated_at
  BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- profiles → konum yabancı anahtarları (tablolar oluştuktan sonra eklenir)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_city_fk
    FOREIGN KEY (city_id) REFERENCES public.cities (id) ON DELETE SET NULL,
  ADD CONSTRAINT profiles_district_fk
    FOREIGN KEY (district_id) REFERENCES public.districts (id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------

CREATE TABLE public.categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL UNIQUE,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE CHECK (public.is_valid_slug(slug)),
  icon            text NOT NULL DEFAULT 'tag',
  description     text,
  is_active       boolean NOT NULL DEFAULT true,
  is_indexable    boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  seo_title       text,
  seo_description text,
  seo_canonical   text,
  og_image_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------

CREATE TABLE public.preferences (
  key          text PRIMARY KEY,
  label        text NOT NULL,
  category_key text REFERENCES public.categories (key) ON DELETE SET NULL,
  sort_order   integer NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.preferences IS
  'Plan ve paketlerde ortak kullanılan tercih etiketleri (açık alan, duş, PS5 ...).';
