-- ============================================================================
-- 0012_indexes.sql — Performans indeksleri
-- ROLLBACK: DROP INDEX ...
-- ============================================================================

-- --- Aktif konum sorguları ---------------------------------------------------
CREATE INDEX idx_cities_active
  ON public.cities (is_active, is_public, sort_order)
  WHERE is_active;

CREATE INDEX idx_districts_city_active
  ON public.districts (city_id, is_active, sort_order)
  WHERE is_active;

CREATE INDEX idx_categories_active
  ON public.categories (is_active, sort_order)
  WHERE is_active;

-- --- Public slug erişimi -----------------------------------------------------
-- (businesses.slug, packages.slug, categories.slug tablo tanımında UNIQUE)
CREATE INDEX idx_businesses_public
  ON public.businesses (status, is_public, is_indexable)
  WHERE status = 'verified' AND is_public;

CREATE INDEX idx_packages_public
  ON public.packages (is_active, is_public, is_indexable)
  WHERE is_active AND is_public;

-- --- Paket eşleştirme --------------------------------------------------------
CREATE INDEX idx_packages_matching
  ON public.packages (category_id, min_people, max_people, computed_per_person_min)
  WHERE is_active;

CREATE INDEX idx_packages_business
  ON public.packages (business_id, is_active);

CREATE INDEX idx_packages_branch
  ON public.packages (branch_id);

CREATE INDEX idx_branches_location
  ON public.business_branches (city_id, district_id, is_active)
  WHERE is_active;

CREATE INDEX idx_branches_business
  ON public.business_branches (business_id);

CREATE INDEX idx_pkg_availability
  ON public.package_availability (package_id, weekday);

CREATE INDEX idx_pkg_items
  ON public.package_items (package_id, sort_order);

CREATE INDEX idx_pkg_images
  ON public.package_images (package_id, sort_order);

CREATE INDEX idx_branch_hours
  ON public.branch_hours (branch_id, weekday);

-- --- Plan --------------------------------------------------------------------
CREATE INDEX idx_plans_owner
  ON public.plans (owner_id, status, event_date DESC);

CREATE INDEX idx_plans_status_date
  ON public.plans (status, event_date);

CREATE INDEX idx_participants_plan
  ON public.plan_participants (plan_id, status);

CREATE INDEX idx_participants_user
  ON public.plan_participants (user_id)
  WHERE user_id IS NOT NULL;

-- plan_invitations.token_hash ve short_code tablo tanımında UNIQUE
CREATE INDEX idx_invitations_plan_active
  ON public.plan_invitations (plan_id)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_plan_matches
  ON public.plan_package_matches (plan_id, score DESC);

-- --- Oylama ------------------------------------------------------------------
-- votes (plan_id, participant_id) tablo tanımında UNIQUE
CREATE INDEX idx_votes_package
  ON public.votes (plan_id, package_id);

-- --- Rezervasyon -------------------------------------------------------------
CREATE INDEX idx_reservations_business
  ON public.reservations (business_id, status, reserved_date DESC);

CREATE INDEX idx_reservations_plan
  ON public.reservations (plan_id);

CREATE INDEX idx_reservations_creator
  ON public.reservations (created_by, created_at DESC);

CREATE INDEX idx_reservation_history
  ON public.reservation_status_history (reservation_id, created_at);

-- --- Yardımcı tablolar -------------------------------------------------------
CREATE INDEX idx_notifications_user
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_unread
  ON public.notifications (user_id)
  WHERE read_at IS NULL;

CREATE INDEX idx_business_members_user
  ON public.business_members (user_id);

CREATE INDEX idx_applications_status
  ON public.business_applications (status, created_at DESC);

CREATE INDEX idx_admin_logs_created
  ON public.admin_logs (created_at DESC);

CREATE INDEX idx_admin_logs_entity
  ON public.admin_logs (entity_type, entity_id);

CREATE INDEX idx_seo_redirects_active
  ON public.seo_redirects (from_path)
  WHERE is_active;

CREATE INDEX idx_help_public
  ON public.help_articles (is_public, sort_order)
  WHERE is_public;

CREATE INDEX idx_reports_status
  ON public.reports (status, created_at DESC);

CREATE INDEX idx_tickets_status
  ON public.support_tickets (status, created_at DESC);
