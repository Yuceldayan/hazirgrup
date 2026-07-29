-- ============================================================================
-- 0006_packages.sql — Paket, içerik, görsel, uygunluk, tercih
-- ROLLBACK: DROP TABLE public.package_preferences, public.package_availability,
--           public.package_images, public.package_items, public.packages;
--           DROP FUNCTION public.compute_package_prices();
-- ============================================================================

CREATE TABLE public.packages (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  branch_id               uuid NOT NULL REFERENCES public.business_branches (id) ON DELETE CASCADE,
  category_id             uuid NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  name                    text NOT NULL CHECK (char_length(name) BETWEEN 5 AND 120),
  slug                    text NOT NULL UNIQUE CHECK (public.is_valid_slug(slug)),
  description             text NOT NULL DEFAULT '',
  min_people              integer NOT NULL CHECK (min_people >= 1),
  max_people              integer NOT NULL,
  pricing_model           public.pricing_model NOT NULL,
  -- Kuruş cinsinden tam sayı (docs/DECISIONS.md D-014)
  price_amount            integer NOT NULL CHECK (price_amount > 0),
  -- Eşleştirme sorgularının indekslenebilmesi için türetilen kolonlar
  computed_total_min      integer NOT NULL DEFAULT 0,
  computed_per_person_min integer NOT NULL DEFAULT 0,
  duration_minutes        integer CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 15 AND 720),
  reservation_terms       text,
  cancellation_terms      text,
  is_active               boolean NOT NULL DEFAULT true,
  is_public               boolean NOT NULL DEFAULT true,
  is_indexable            boolean NOT NULL DEFAULT true,
  popularity              integer NOT NULL DEFAULT 0 CHECK (popularity BETWEEN 0 AND 100),
  seo_title               text,
  seo_description         text,
  seo_canonical           text,
  og_image_url            text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT packages_capacity_valid CHECK (max_people >= min_people)
);

COMMENT ON COLUMN public.packages.price_amount IS
  'pricing_model=per_person ise kişi başı, total ise sabit toplam (kuruş).';

CREATE TRIGGER packages_set_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Türetilmiş fiyat kolonları
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_package_prices()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.pricing_model = 'per_person' THEN
    NEW.computed_per_person_min := NEW.price_amount;
    NEW.computed_total_min      := NEW.price_amount * NEW.min_people;
  ELSE
    -- Sabit toplamda kişi başı en düşük değer, maksimum kişi sayısında oluşur.
    NEW.computed_per_person_min := ceil(NEW.price_amount::numeric / NEW.max_people)::integer;
    NEW.computed_total_min      := NEW.price_amount;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER packages_compute_prices
  BEFORE INSERT OR UPDATE OF price_amount, pricing_model, min_people, max_people
  ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.compute_package_prices();

-- ----------------------------------------------------------------------------

CREATE TABLE public.package_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  label      text NOT NULL CHECK (char_length(label) BETWEEN 2 AND 120),
  detail     text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.package_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  url        text NOT NULL,
  alt        text NOT NULL DEFAULT '',
  width      integer NOT NULL DEFAULT 1200,
  height     integer NOT NULL DEFAULT 800,
  sort_order integer NOT NULL DEFAULT 0
);

COMMENT ON COLUMN public.package_images.width IS
  'CLS önlemek için genişlik/yükseklik zorunlu (docs/SEO_STRATEGY.md §13).';

CREATE TABLE public.package_availability (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  weekday    smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time   time NOT NULL,
  UNIQUE (package_id, weekday, start_time)
);

COMMENT ON TABLE public.package_availability IS
  'Paketin geçerli olduğu gün ve saat aralıkları. end_time < start_time ise
   aralık gece yarısını aşar (22:00–01:00).';

CREATE TABLE public.package_preferences (
  package_id     uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  preference_key text NOT NULL REFERENCES public.preferences (key) ON DELETE CASCADE,
  PRIMARY KEY (package_id, preference_key)
);
