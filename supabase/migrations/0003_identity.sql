-- ============================================================================
-- 0003_identity.sql — Profiller, roller ve kullanıcı oluşturma trigger'ı
-- ROLLBACK: DROP TRIGGER on_auth_user_created ON auth.users;
--           DROP FUNCTION public.handle_new_user();
--           DROP TABLE public.user_roles, public.roles, public.profiles;
-- ============================================================================

CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name  text        NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  email         text        NOT NULL,
  phone         text,
  avatar_url    text,
  city_id       uuid,
  district_id   uuid,
  theme         public.theme_preference NOT NULL DEFAULT 'system',
  locale        text        NOT NULL DEFAULT 'tr',
  is_suspended  boolean     NOT NULL DEFAULT false,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'auth.users kaydının uygulama tarafı uzantısı.';
COMMENT ON COLUMN public.profiles.deleted_at IS
  'Hesap silme talebi zamanı. 30 gün içinde geri alınabilir (docs/SECURITY_MODEL.md §9).';

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------

CREATE TABLE public.roles (
  key         public.app_role PRIMARY KEY,
  label       text NOT NULL,
  description text
);

INSERT INTO public.roles (key, label, description) VALUES
  ('user',           'Kullanıcı',      'Plan oluşturur, katılır, oy kullanır.'),
  ('business_staff', 'İşletme Çalışanı','Şube ve rezervasyonları yönetir.'),
  ('business_owner', 'İşletme Sahibi', 'İşletme bilgilerini ve ekibi yönetir.'),
  ('moderator',      'Moderatör',      'Şikâyet ve içerik denetimi yapar.'),
  ('admin',          'Yönetici',       'Tüm sistem yetkilerine sahiptir.');

-- ----------------------------------------------------------------------------

CREATE TABLE public.user_roles (
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role       public.app_role NOT NULL REFERENCES public.roles (key),
  granted_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- ----------------------------------------------------------------------------
-- Yeni auth kullanıcısı → profil + varsayılan rol
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
