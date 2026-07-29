-- ============================================================================
-- 0009_reservations.sql — Rezervasyon ve durum geçmişi
-- ROLLBACK: DROP TRIGGER reservations_log_status ON public.reservations;
--           DROP FUNCTION public.log_reservation_status();
--           DROP FUNCTION public.guard_reservation_status();
--           DROP TABLE public.reservation_status_history, public.reservations;
-- ============================================================================

CREATE TABLE public.reservations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id             uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  package_id          uuid NOT NULL REFERENCES public.packages (id) ON DELETE RESTRICT,
  branch_id           uuid NOT NULL REFERENCES public.business_branches (id) ON DELETE RESTRICT,
  business_id         uuid NOT NULL REFERENCES public.businesses (id) ON DELETE RESTRICT,
  created_by          uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  code                text NOT NULL UNIQUE,
  people_count        integer NOT NULL CHECK (people_count >= 1),
  reserved_date       date NOT NULL,
  reserved_start_time time,
  reserved_end_time   time,
  total_price         integer NOT NULL CHECK (total_price >= 0),
  per_person_price    integer NOT NULL CHECK (per_person_price >= 0),
  contact_name        text NOT NULL,
  contact_phone       text NOT NULL,
  note                text CHECK (note IS NULL OR char_length(note) <= 500),
  status              public.reservation_status NOT NULL DEFAULT 'created',
  rejection_reason    public.rejection_reason,
  rejection_note      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservations_rejection_reason_required
    CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL)
);

COMMENT ON COLUMN public.reservations.code IS
  'İnsan-okunur rezervasyon kodu: HG-XXXXXX (docs/DECISIONS.md D-018).';
COMMENT ON CONSTRAINT reservations_rejection_reason_required ON public.reservations IS
  'İşletme reddederken gerekçe seçmek zorundadır.';

CREATE TRIGGER reservations_set_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------

CREATE TABLE public.reservation_status_history (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations (id) ON DELETE CASCADE,
  from_status    public.reservation_status,
  to_status      public.reservation_status NOT NULL,
  changed_by     uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  reason         text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Durum geçiş koruması — packages/core/src/status/reservation.ts ile aynı kurallar
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_reservation_status()
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
    WHEN 'created'          THEN ARRAY['pending_business','cancelled_by_user']
    WHEN 'pending_business' THEN ARRAY['confirmed','rejected','cancelled_by_user','cancelled_by_business']
    WHEN 'confirmed'        THEN ARRAY['completed','no_show','cancelled_by_user','cancelled_by_business']
    ELSE ARRAY[]::text[]
  END;

  IF NOT (NEW.status::text = ANY (allowed)) THEN
    RAISE EXCEPTION 'Gecersiz rezervasyon durum gecisi: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER reservations_guard_status
  BEFORE UPDATE OF status ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.guard_reservation_status();

-- ----------------------------------------------------------------------------
-- Durum değişimini otomatik geçmişe yaz
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_reservation_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.reservation_status_history (reservation_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, 'created', NEW.created_by);

    IF NEW.status <> 'created' THEN
      INSERT INTO public.reservation_status_history (reservation_id, from_status, to_status, changed_by)
      VALUES (NEW.id, 'created', NEW.status, NEW.created_by);
    END IF;

  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.reservation_status_history (reservation_id, from_status, to_status, reason)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.rejection_note);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER reservations_log_status
  AFTER INSERT OR UPDATE OF status ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_status();
