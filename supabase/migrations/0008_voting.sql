-- ============================================================================
-- 0008_voting.sql — Oylama
-- ROLLBACK: DROP TABLE public.votes;
-- ============================================================================

CREATE TABLE public.votes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id        uuid NOT NULL REFERENCES public.plans (id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.plan_participants (id) ON DELETE CASCADE,
  package_id     uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  -- Bir katılımcı, bir aktif oy. Oy değiştirme UPDATE'tir (docs/PRODUCT_REQUIREMENTS.md FR-6).
  CONSTRAINT votes_one_per_participant UNIQUE (plan_id, participant_id)
);

CREATE TRIGGER votes_set_updated_at
  BEFORE UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON CONSTRAINT votes_one_per_participant ON public.votes IS
  'Duplicate oy engelleme — oy manipülasyonuna karşı veritabanı seviyesinde koruma.';

-- ----------------------------------------------------------------------------
-- Oylama kapandıktan sonra oy değişikliğini engelle
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_vote_window()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  plan_row public.plans%ROWTYPE;
BEGIN
  SELECT * INTO plan_row FROM public.plans WHERE id = NEW.plan_id;

  IF plan_row.status <> 'voting' THEN
    RAISE EXCEPTION 'Oylama acik degil (plan durumu: %)', plan_row.status
      USING ERRCODE = 'check_violation';
  END IF;

  IF plan_row.voting_ends_at IS NOT NULL AND plan_row.voting_ends_at < now() THEN
    RAISE EXCEPTION 'Oylama suresi doldu'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER votes_guard_window
  BEFORE INSERT OR UPDATE OF package_id ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.guard_vote_window();
