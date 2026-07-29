-- ============================================================================
-- 0010_support.sql — Favori, bildirim, şikâyet, destek, audit, SEO, yardım,
--                    hız sınırı
-- ROLLBACK: DROP TABLE public.rate_limits, public.help_articles,
--           public.seo_redirects, public.admin_logs, public.support_tickets,
--           public.reports, public.push_tokens, public.notification_preferences,
--           public.notifications, public.favorites;
-- ============================================================================

CREATE TABLE public.favorites (
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, package_id)
);

-- ----------------------------------------------------------------------------

CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type       text NOT NULL,
  title      text NOT NULL,
  body       text NOT NULL,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_preferences (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type    text NOT NULL,
  channel public.notification_channel NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, type, channel)
);

CREATE TABLE public.push_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  token      text NOT NULL,
  platform   text NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

-- ----------------------------------------------------------------------------

CREATE TABLE public.reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject_type    public.report_subject_type NOT NULL,
  subject_id      uuid NOT NULL,
  reason          text NOT NULL,
  detail          text,
  status          public.report_status NOT NULL DEFAULT 'open',
  resolved_by     uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  resolution_note text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.support_tickets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject     text NOT NULL,
  body        text NOT NULL,
  status      public.ticket_status NOT NULL DEFAULT 'open',
  answer      text,
  answered_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------

CREATE TABLE public.admin_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_name  text NOT NULL DEFAULT 'Bilinmeyen',
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_logs IS
  'Denetim kaydı. Hassas veri yazılmaz (docs/SECURITY_MODEL.md §10-11).';

-- ----------------------------------------------------------------------------

CREATE TABLE public.seo_redirects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path   text NOT NULL UNIQUE,
  to_path     text NOT NULL DEFAULT '',
  status_code smallint NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 410)),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.seo_redirects IS
  'Slug değişiminde 301, kalıcı silmede 410 (docs/SEO_STRATEGY.md §9).';

-- ----------------------------------------------------------------------------

CREATE TABLE public.help_articles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE CHECK (public.is_valid_slug(slug)),
  title           text NOT NULL,
  summary         text NOT NULL DEFAULT '',
  body            text NOT NULL,
  category        text NOT NULL DEFAULT 'Genel',
  is_public       boolean NOT NULL DEFAULT true,
  is_indexable    boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  seo_title       text,
  seo_description text,
  seo_canonical   text,
  og_image_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER help_articles_set_updated_at
  BEFORE UPDATE ON public.help_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Hız sınırı sayacı (docs/SECURITY_MODEL.md §6)
-- ----------------------------------------------------------------------------

CREATE TABLE public.rate_limits (
  key          text NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_key text, p_window_start timestamptz)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO new_count;

  -- Eski pencereleri temizle (bakım maliyeti düşük tutulur)
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '2 days';

  RETURN new_count;
END;
$$;
