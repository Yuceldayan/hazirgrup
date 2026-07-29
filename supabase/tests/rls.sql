-- ============================================================================
-- rls.sql — Row Level Security politika testleri
--
-- Çalıştırma:  npm run test:rls   (Supabase CLI gerektirir)
-- veya:        psql "$DATABASE_URL" -f supabase/tests/rls.sql
--
-- Her test bir DO bloğudur; beklenti karşılanmazsa EXCEPTION fırlatır ve
-- script hata koduyla biter.
-- ============================================================================

\set ON_ERROR_STOP on

BEGIN;

-- ----------------------------------------------------------------------------
-- Yardımcı: belirli bir kullanıcı gibi davran
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.act_as(user_email text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  target uuid;
BEGIN
  SELECT id INTO target FROM auth.users WHERE email = user_email;
  IF target IS NULL THEN
    RAISE EXCEPTION 'Test kullanicisi bulunamadi: %', user_email;
  END IF;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', target, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.act_as_anon()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '', true);
  PERFORM set_config('role', 'anon', true);
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.expect(condition boolean, label text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT condition THEN
    RAISE EXCEPTION 'RLS TEST BASARISIZ: %', label;
  ELSE
    RAISE NOTICE 'ok — %', label;
  END IF;
END;
$$;

-- ============================================================================
-- 1. Public okuma: anonim kullanıcı doğrulanmış işletmeleri görür
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as_anon();
  SELECT count(*) INTO visible FROM public.businesses;
  PERFORM pg_temp.expect(visible > 0, 'anonim kullanici dogrulanmis isletmeleri gorur');
END;
$$;

-- ============================================================================
-- 2. Anonim kullanıcı planları göremez
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as_anon();
  SELECT count(*) INTO visible FROM public.plans;
  PERFORM pg_temp.expect(visible = 0, 'anonim kullanici plan goremez');
END;
$$;

-- ============================================================================
-- 3. Anonim kullanıcı profilleri göremez (kisisel veri)
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as_anon();
  SELECT count(*) INTO visible FROM public.profiles;
  PERFORM pg_temp.expect(visible = 0, 'anonim kullanici profil goremez');
END;
$$;

-- ============================================================================
-- 4. Kullanıcı yalnızca kendi profilini görür
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as('elif@ornek.test');
  SELECT count(*) INTO visible FROM public.profiles;
  PERFORM pg_temp.expect(visible = 1, 'kullanici yalnizca kendi profilini gorur');
END;
$$;

-- ============================================================================
-- 5. Kullanıcı katılımcı olmadığı planı göremez
-- ============================================================================
DO $$
DECLARE
  total integer;
  own   integer;
BEGIN
  PERFORM pg_temp.act_as('mert@ornek.test');
  SELECT count(*) INTO total FROM public.plans;

  SELECT count(*) INTO own
  FROM public.plans p
  WHERE p.owner_id = (SELECT id FROM auth.users WHERE email = 'mert@ornek.test')
     OR EXISTS (
       SELECT 1 FROM public.plan_participants pp
       WHERE pp.plan_id = p.id
         AND pp.user_id = (SELECT id FROM auth.users WHERE email = 'mert@ornek.test')
     );

  PERFORM pg_temp.expect(total = own, 'kullanici yalnizca katildigi planlari gorur');
END;
$$;

-- ============================================================================
-- 6. İşletme A, işletme B'nin rezervasyonlarını göremez
-- ============================================================================
DO $$
DECLARE
  foreign_visible integer;
BEGIN
  PERFORM pg_temp.act_as('isletme05@ornek.test');

  SELECT count(*) INTO foreign_visible
  FROM public.reservations r
  WHERE r.business_id <> (
    SELECT bm.business_id FROM public.business_members bm
    WHERE bm.user_id = (SELECT id FROM auth.users WHERE email = 'isletme05@ornek.test')
    LIMIT 1
  )
  AND r.created_by <> (SELECT id FROM auth.users WHERE email = 'isletme05@ornek.test');

  PERFORM pg_temp.expect(foreign_visible = 0, 'isletme baska isletmenin rezervasyonunu goremez');
END;
$$;

-- ============================================================================
-- 7. İşletme başka işletmenin paketini güncelleyemez
-- ============================================================================
DO $$
DECLARE
  affected integer;
  target   uuid;
BEGIN
  PERFORM pg_temp.act_as('isletme05@ornek.test');

  SELECT p.id INTO target
  FROM public.packages p
  JOIN public.businesses b ON b.id = p.business_id
  WHERE b.slug = 'kuzey-isigi-kahve-evi'
  LIMIT 1;

  UPDATE public.packages SET price_amount = 1 WHERE id = target;
  GET DIAGNOSTICS affected = ROW_COUNT;

  PERFORM pg_temp.expect(affected = 0, 'isletme baska isletmenin paketini guncelleyemez');
END;
$$;

-- ============================================================================
-- 8. Kullanıcı başkasının profilini güncelleyemez
-- ============================================================================
DO $$
DECLARE
  affected integer;
BEGIN
  PERFORM pg_temp.act_as('elif@ornek.test');

  UPDATE public.profiles SET display_name = 'Ele Gecirildi'
  WHERE email = 'kerem@ornek.test';
  GET DIAGNOSTICS affected = ROW_COUNT;

  PERFORM pg_temp.expect(affected = 0, 'kullanici baskasinin profilini guncelleyemez');
END;
$$;

-- ============================================================================
-- 9. Kullanıcı audit log okuyamaz
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as('elif@ornek.test');
  SELECT count(*) INTO visible FROM public.admin_logs;
  PERFORM pg_temp.expect(visible = 0, 'normal kullanici audit log okuyamaz');
END;
$$;

-- ============================================================================
-- 10. Yönetici audit log okuyabilir
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as('admin@ornek.test');
  SELECT count(*) INTO visible FROM public.admin_logs;
  PERFORM pg_temp.expect(visible > 0, 'yonetici audit log okuyabilir');
END;
$$;

-- ============================================================================
-- 11. Kullanıcı başvurudaki vergi bilgisini göremez
-- ============================================================================
DO $$
DECLARE
  visible integer;
BEGIN
  PERFORM pg_temp.act_as('elif@ornek.test');
  SELECT count(*) INTO visible FROM public.business_applications;
  PERFORM pg_temp.expect(visible = 0, 'kullanici baskasinin basvurusunu (vergi bilgisi) goremez');
END;
$$;

-- ============================================================================
-- 12. Duplicate oy veritabanı seviyesinde engellenir
-- ============================================================================
DO $$
DECLARE
  existing_vote public.votes%ROWTYPE;
  failed boolean := false;
BEGIN
  PERFORM set_config('role', 'postgres', true);
  SELECT * INTO existing_vote FROM public.votes LIMIT 1;

  BEGIN
    INSERT INTO public.votes (plan_id, participant_id, package_id)
    VALUES (existing_vote.plan_id, existing_vote.participant_id, existing_vote.package_id);
  EXCEPTION WHEN unique_violation THEN
    failed := true;
  WHEN OTHERS THEN
    failed := true;
  END;

  PERFORM pg_temp.expect(failed, 'ayni katilimci ikinci oy ekleyemez');
END;
$$;

-- ============================================================================
-- 13. Geçersiz plan durum geçişi reddedilir
-- ============================================================================
DO $$
DECLARE
  target uuid;
  failed boolean := false;
BEGIN
  PERFORM set_config('role', 'postgres', true);
  SELECT id INTO target FROM public.plans WHERE status = 'draft' LIMIT 1;

  IF target IS NOT NULL THEN
    BEGIN
      UPDATE public.plans SET status = 'completed' WHERE id = target;
    EXCEPTION WHEN OTHERS THEN
      failed := true;
    END;
    PERFORM pg_temp.expect(failed, 'gecersiz plan durum gecisi reddedilir');
  ELSE
    RAISE NOTICE 'atlandi — taslak plan bulunamadi';
  END IF;
END;
$$;

-- ============================================================================
-- 14. Gerekçesiz ret reddedilir
-- ============================================================================
DO $$
DECLARE
  target uuid;
  failed boolean := false;
BEGIN
  PERFORM set_config('role', 'postgres', true);
  SELECT id INTO target FROM public.reservations WHERE status = 'pending_business' LIMIT 1;

  IF target IS NOT NULL THEN
    BEGIN
      UPDATE public.reservations SET status = 'rejected', rejection_reason = NULL WHERE id = target;
    EXCEPTION WHEN OTHERS THEN
      failed := true;
    END;
    PERFORM pg_temp.expect(failed, 'gerekcesiz ret reddedilir');
  ELSE
    RAISE NOTICE 'atlandi — bekleyen rezervasyon bulunamadi';
  END IF;
END;
$$;

ROLLBACK;

\echo '✓ Tüm RLS testleri geçti.'
