-- ============================================================================
-- 0011_revenue_schema.sql — Gelir modeli için şema yeri
--
-- ÖNEMLİ: Faz 1'de bu tablolara HİÇBİR uygulama akışı yazmaz.
-- Aktif ödeme akışı yoktur (docs/DECISIONS.md D-019). Tablolar yalnızca
-- ileride ilişkilerin doğru kurulabilmesi için baştan tanımlanmıştır.
--
-- ROLLBACK: DROP TABLE public.promotions, public.invoices, public.commissions,
--           public.payments, public.business_subscriptions, public.subscription_plans;
-- ============================================================================

CREATE TABLE public.subscription_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  -- Kuruş cinsinden aylık ücret
  monthly_price integer NOT NULL DEFAULT 0 CHECK (monthly_price >= 0),
  features      jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.business_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  plan_id      uuid NOT NULL REFERENCES public.subscription_plans (id) ON DELETE RESTRICT,
  status       text NOT NULL DEFAULT 'inactive'
                 CHECK (status IN ('inactive', 'trialing', 'active', 'past_due', 'cancelled')),
  started_at   timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    uuid REFERENCES public.businesses (id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES public.reservations (id) ON DELETE SET NULL,
  amount         integer NOT NULL CHECK (amount >= 0),
  currency       text NOT NULL DEFAULT 'TRY',
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  provider       text,
  provider_ref   text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS
  'Faz 1''de KULLANILMAZ. Uygulama içi ödeme yoktur; kart bilgisi hiçbir zaman saklanmaz.';

CREATE TABLE public.commissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations (id) ON DELETE CASCADE,
  business_id    uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  rate           numeric(5,4) NOT NULL DEFAULT 0 CHECK (rate >= 0 AND rate <= 1),
  amount         integer NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'invoiced', 'paid', 'waived')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  number      text NOT NULL UNIQUE,
  period_start date NOT NULL,
  period_end   date NOT NULL,
  total        integer NOT NULL DEFAULT 0 CHECK (total >= 0),
  status      text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'issued', 'paid', 'void')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.promotions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid REFERENCES public.businesses (id) ON DELETE CASCADE,
  package_id    uuid REFERENCES public.packages (id) ON DELETE CASCADE,
  code          text UNIQUE,
  kind          text NOT NULL DEFAULT 'sponsored'
                  CHECK (kind IN ('sponsored', 'discount', 'featured')),
  starts_at     timestamptz,
  ends_at       timestamptz,
  is_active     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.promotions IS
  'Sponsorlu sıralama altyapısı. Faz 1''de aktif değildir; etkinleştirildiğinde
   listelerde açıkça "Sponsorlu" etiketiyle gösterilmelidir.';
