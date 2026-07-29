-- ============================================================================
-- 0001_extensions.sql — Uzantılar ve ortak yardımcılar
-- ROLLBACK: DROP FUNCTION public.set_updated_at(); DROP FUNCTION public.is_valid_slug(text);
--           (Uzantılar başka nesneler tarafından kullanıldığı için düşürülmez.)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";      -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- updated_at kolonunu otomatik güncelleyen trigger fonksiyonu
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Satır güncellendiğinde updated_at kolonunu now() yapar.';

-- ----------------------------------------------------------------------------
-- Slug biçim kontrolü — tüm public slug alanlarında kullanılır
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_valid_slug(value text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT value ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
$$;

COMMENT ON FUNCTION public.is_valid_slug(text) IS
  'Slug yalnızca küçük harf, rakam ve tek tire içerebilir (docs/SEO_STRATEGY.md §4).';
