-- ============================================================================
-- 0013_rls.sql — Row Level Security politikaları
--
-- Veritabanı, yetkilendirmenin TEK GERÇEK KAYNAĞIDIR. Sunucu tarafı kontroller
-- (requireRole vb.) ek katmandır; istemci kontrolleri güvenlik sınırı değildir.
-- (docs/SECURITY_MODEL.md §3)
--
-- ROLLBACK: ALTER TABLE ... DISABLE ROW LEVEL SECURITY; DROP POLICY ...;
--           DROP FUNCTION public.auth_has_role, auth_is_business_member,
--           auth_is_plan_owner, auth_is_plan_participant;
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Yardımcı fonksiyonlar
-- SECURITY DEFINER + sabit search_path → RLS içinde özyineleme oluşmaz.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auth_has_role(required public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_business_member(target_business uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_business AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_business_owner(target_business uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_business AND user_id = auth.uid() AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_plan_owner(target_plan uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.plans WHERE id = target_plan AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_plan_participant(target_plan uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.plan_participants
    WHERE plan_id = target_plan AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.plans WHERE id = target_plan AND owner_id = auth.uid()
  );
$$;

-- ============================================================================
-- RLS'i tüm hassas tablolarda aç
-- ============================================================================

ALTER TABLE public.profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_branches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_hours               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_images             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_availability       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_preferences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_preferences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_participants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_invitations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_package_matches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_redirects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions                 ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Referans veriler — herkes okur, yalnızca yönetici yazar
-- ============================================================================

CREATE POLICY roles_read ON public.roles FOR SELECT USING (true);
CREATE POLICY countries_read ON public.countries FOR SELECT USING (is_active);
CREATE POLICY preferences_read ON public.preferences FOR SELECT USING (true);

CREATE POLICY cities_public_read ON public.cities
  FOR SELECT USING (is_public OR public.auth_is_admin());
CREATE POLICY cities_admin_write ON public.cities
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

CREATE POLICY districts_public_read ON public.districts
  FOR SELECT USING (is_public OR public.auth_is_admin());
CREATE POLICY districts_admin_write ON public.districts
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

CREATE POLICY categories_public_read ON public.categories
  FOR SELECT USING (is_active OR public.auth_is_admin());
CREATE POLICY categories_admin_write ON public.categories
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

CREATE POLICY help_public_read ON public.help_articles
  FOR SELECT USING (is_public OR public.auth_is_admin());
CREATE POLICY help_admin_write ON public.help_articles
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

CREATE POLICY redirects_read ON public.seo_redirects
  FOR SELECT USING (is_active OR public.auth_is_admin());
CREATE POLICY redirects_admin_write ON public.seo_redirects
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

-- ============================================================================
-- Profil ve roller
-- ============================================================================

CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.auth_is_admin());

CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE USING (public.auth_has_role('admin'));

CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.auth_is_admin());

CREATE POLICY user_roles_admin_write ON public.user_roles
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

-- ============================================================================
-- İşletme
-- ============================================================================

CREATE POLICY businesses_public_read ON public.businesses
  FOR SELECT USING (
    (status = 'verified' AND is_public)
    OR public.auth_is_business_member(id)
    OR public.auth_is_admin()
  );

CREATE POLICY businesses_member_update ON public.businesses
  FOR UPDATE USING (public.auth_is_business_member(id))
  WITH CHECK (public.auth_is_business_member(id));

CREATE POLICY businesses_admin_all ON public.businesses
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

-- Şube: yayımlanmış işletmenin aktif şubeleri herkese açık
CREATE POLICY branches_public_read ON public.business_branches
  FOR SELECT USING (
    (is_active AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.status = 'verified' AND b.is_public
    ))
    OR public.auth_is_business_member(business_id)
    OR public.auth_is_admin()
  );

CREATE POLICY branches_member_write ON public.business_branches
  FOR ALL USING (public.auth_is_business_member(business_id))
  WITH CHECK (public.auth_is_business_member(business_id));

CREATE POLICY branch_hours_read ON public.branch_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.business_branches br
      JOIN public.businesses b ON b.id = br.business_id
      WHERE br.id = branch_id
        AND ((br.is_active AND b.status = 'verified' AND b.is_public)
             OR public.auth_is_business_member(b.id)
             OR public.auth_is_admin())
    )
  );

CREATE POLICY branch_hours_member_write ON public.branch_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.business_branches br
      WHERE br.id = branch_id AND public.auth_is_business_member(br.business_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_branches br
      WHERE br.id = branch_id AND public.auth_is_business_member(br.business_id)
    )
  );

-- Ekip
CREATE POLICY members_read ON public.business_members
  FOR SELECT USING (
    user_id = auth.uid() OR public.auth_is_business_member(business_id) OR public.auth_is_admin()
  );

CREATE POLICY members_owner_write ON public.business_members
  FOR ALL USING (public.auth_is_business_owner(business_id) OR public.auth_has_role('admin'))
  WITH CHECK (public.auth_is_business_owner(business_id) OR public.auth_has_role('admin'));

-- Başvuru: sahibi ve yönetici görebilir (tax_info gizliliği için kritik)
CREATE POLICY applications_own_read ON public.business_applications
  FOR SELECT USING (applicant_id = auth.uid() OR public.auth_is_admin());

CREATE POLICY applications_insert ON public.business_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY applications_admin_update ON public.business_applications
  FOR UPDATE USING (public.auth_has_role('admin'));

-- ============================================================================
-- Paket
-- ============================================================================

CREATE POLICY packages_public_read ON public.packages
  FOR SELECT USING (
    (is_active AND is_public AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.status = 'verified' AND b.is_public
    ))
    OR public.auth_is_business_member(business_id)
    OR public.auth_is_admin()
  );

CREATE POLICY packages_member_write ON public.packages
  FOR ALL USING (public.auth_is_business_member(business_id))
  WITH CHECK (public.auth_is_business_member(business_id));

CREATE POLICY packages_admin_all ON public.packages
  FOR ALL USING (public.auth_has_role('admin')) WITH CHECK (public.auth_has_role('admin'));

-- Paket alt tabloları: paketin görünürlüğünü izler
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['package_items', 'package_images', 'package_availability', 'package_preferences']
  LOOP
    EXECUTE format($f$
      CREATE POLICY %1$s_read ON public.%1$s
        FOR SELECT USING (
          EXISTS (SELECT 1 FROM public.packages p WHERE p.id = package_id)
        );
      CREATE POLICY %1$s_write ON public.%1$s
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.packages p
            WHERE p.id = package_id AND public.auth_is_business_member(p.business_id)
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.packages p
            WHERE p.id = package_id AND public.auth_is_business_member(p.business_id)
          )
        );
    $f$, t);
  END LOOP;
END;
$$;

-- ============================================================================
-- Plan
-- ============================================================================

CREATE POLICY plans_access_read ON public.plans
  FOR SELECT USING (owner_id = auth.uid() OR public.auth_is_plan_participant(id) OR public.auth_is_admin());

CREATE POLICY plans_owner_insert ON public.plans
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY plans_owner_update ON public.plans
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY plans_owner_delete ON public.plans
  FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY plan_categories_access ON public.plan_categories
  FOR ALL USING (public.auth_is_plan_participant(plan_id))
  WITH CHECK (public.auth_is_plan_owner(plan_id));

CREATE POLICY plan_preferences_access ON public.plan_preferences
  FOR ALL USING (public.auth_is_plan_participant(plan_id))
  WITH CHECK (public.auth_is_plan_owner(plan_id));

-- Katılımcılar: plandaki herkes görebilir; kişi kendi kaydını güncelleyebilir
CREATE POLICY participants_read ON public.plan_participants
  FOR SELECT USING (public.auth_is_plan_participant(plan_id) OR public.auth_is_admin());

CREATE POLICY participants_self_update ON public.plan_participants
  FOR UPDATE USING (user_id = auth.uid() OR public.auth_is_plan_owner(plan_id))
  WITH CHECK (user_id = auth.uid() OR public.auth_is_plan_owner(plan_id));

CREATE POLICY participants_owner_delete ON public.plan_participants
  FOR DELETE USING (public.auth_is_plan_owner(plan_id));

-- Misafir katılımı sunucu tarafında service-role ile eklenir (anon INSERT yok).

-- Davet: yalnızca plan sahibi yönetir. Token doğrulaması sunucuda service-role ile.
CREATE POLICY invitations_owner_all ON public.plan_invitations
  FOR ALL USING (public.auth_is_plan_owner(plan_id))
  WITH CHECK (public.auth_is_plan_owner(plan_id));

CREATE POLICY matches_read ON public.plan_package_matches
  FOR SELECT USING (public.auth_is_plan_participant(plan_id));

CREATE POLICY matches_owner_write ON public.plan_package_matches
  FOR ALL USING (public.auth_is_plan_owner(plan_id))
  WITH CHECK (public.auth_is_plan_owner(plan_id));

-- ============================================================================
-- Oylama — oylar açıktır (D-007), plandaki herkes görebilir
-- ============================================================================

CREATE POLICY votes_read ON public.votes
  FOR SELECT USING (public.auth_is_plan_participant(plan_id) OR public.auth_is_admin());

CREATE POLICY votes_own_write ON public.votes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.plan_participants p
      WHERE p.id = participant_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plan_participants p
      WHERE p.id = participant_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Rezervasyon
-- ============================================================================

CREATE POLICY reservations_read ON public.reservations
  FOR SELECT USING (
    created_by = auth.uid()
    OR public.auth_is_plan_participant(plan_id)
    OR public.auth_is_business_member(business_id)
    OR public.auth_is_admin()
  );

CREATE POLICY reservations_owner_insert ON public.reservations
  FOR INSERT WITH CHECK (created_by = auth.uid() AND public.auth_is_plan_owner(plan_id));

CREATE POLICY reservations_update ON public.reservations
  FOR UPDATE USING (
    public.auth_is_business_member(business_id) OR created_by = auth.uid() OR public.auth_is_admin()
  )
  WITH CHECK (
    public.auth_is_business_member(business_id) OR created_by = auth.uid() OR public.auth_is_admin()
  );

CREATE POLICY reservation_history_read ON public.reservation_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_id
        AND (r.created_by = auth.uid()
             OR public.auth_is_plan_participant(r.plan_id)
             OR public.auth_is_business_member(r.business_id)
             OR public.auth_is_admin())
    )
  );

-- ============================================================================
-- Kişisel veriler
-- ============================================================================

CREATE POLICY favorites_own ON public.favorites
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_own_read ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_own_update ON public.notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_prefs_own ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY push_tokens_own ON public.push_tokens
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY reports_own_read ON public.reports
  FOR SELECT USING (reporter_id = auth.uid() OR public.auth_is_admin());

CREATE POLICY reports_insert ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY reports_admin_update ON public.reports
  FOR UPDATE USING (public.auth_is_admin());

CREATE POLICY tickets_own_read ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid() OR public.auth_is_admin());

CREATE POLICY tickets_insert ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY tickets_admin_update ON public.support_tickets
  FOR UPDATE USING (public.auth_is_admin());

-- ============================================================================
-- Yönetim ve altyapı — yalnızca yönetici / service-role
-- ============================================================================

CREATE POLICY admin_logs_read ON public.admin_logs
  FOR SELECT USING (public.auth_is_admin());

-- rate_limits'e yalnızca SECURITY DEFINER fonksiyonu ve service-role erişir:
-- hiçbir SELECT/INSERT politikası tanımlanmaz (varsayılan: erişim yok).

-- Gelir modeli tabloları Faz 1'de kullanılmaz; yalnızca yönetici okuyabilir.
CREATE POLICY subscription_plans_read ON public.subscription_plans
  FOR SELECT USING (is_active OR public.auth_is_admin());
CREATE POLICY business_subscriptions_read ON public.business_subscriptions
  FOR SELECT USING (public.auth_is_business_member(business_id) OR public.auth_is_admin());
CREATE POLICY payments_read ON public.payments
  FOR SELECT USING (public.auth_is_admin());
CREATE POLICY commissions_read ON public.commissions
  FOR SELECT USING (public.auth_is_business_member(business_id) OR public.auth_is_admin());
CREATE POLICY invoices_read ON public.invoices
  FOR SELECT USING (public.auth_is_business_member(business_id) OR public.auth_is_admin());
CREATE POLICY promotions_read ON public.promotions
  FOR SELECT USING (is_active OR public.auth_is_admin());
