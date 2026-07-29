# Veritabanı Şeması — HazırGrup

PostgreSQL (Supabase). Tüm hassas tablolarda Row Level Security açıktır.

## 1. Enum Tipleri

```sql
plan_status:          draft | awaiting_participants | confirming_participation |
                      packages_ready | voting | voting_closed | reservation_pending |
                      reservation_confirmed | completed | cancelled
participation_status: pending | going | maybe | not_going
reservation_status:   created | pending_business | confirmed | rejected |
                      cancelled_by_user | cancelled_by_business | completed | no_show
pricing_model:        per_person | total
app_role:             user | business_owner | business_staff | moderator | admin
business_status:      draft | pending_review | verified | rejected | suspended
application_status:   pending | approved | rejected
budget_mode:          per_person | total
report_status:        open | reviewing | resolved | dismissed
ticket_status:        open | answered | closed
notification_channel: in_app | push | email
```

## 2. Tablolar

### 2.1. Kimlik ve Roller

| Tablo | Alanlar (özet) |
| --- | --- |
| `profiles` | `id` (auth.users FK), `display_name`, `email`, `phone`, `avatar_url`, `city_id`, `district_id`, `theme`, `locale`, `is_suspended`, `deleted_at`, timestamps |
| `roles` | `key` (PK, `app_role`), `label`, `description` |
| `user_roles` | `user_id`, `role`, `granted_by`, `granted_at` — PK(`user_id`,`role`) |

### 2.2. Konum ve Sınıflandırma

| Tablo | Alanlar |
| --- | --- |
| `countries` | `id`, `code`, `name`, `slug`, `is_active` |
| `cities` | `id`, `country_id`, `name`, `slug`, `is_active`, `is_public`, `is_indexable`, `seo_title`, `seo_description`, `seo_canonical`, `og_image_url`, `intro`, `sort_order` |
| `districts` | `id`, `city_id`, `name`, `slug`, aynı aktiflik/SEO alanları |
| `categories` | `id`, `key`, `name`, `slug`, `icon`, `description`, `is_active`, `is_indexable`, SEO alanları, `sort_order` |

`cities.slug` ülke içinde, `districts.slug` şehir içinde benzersizdir.

### 2.3. İşletme

| Tablo | Alanlar |
| --- | --- |
| `businesses` | `id`, `owner_id`, `name`, `slug`, `description`, `category_id`, `status`, `is_public`, `is_indexable`, `logo_url`, `cover_url`, `phone`, `whatsapp`, `website`, `instagram`, SEO alanları, `verified_at`, `verified_by` |
| `business_branches` | `id`, `business_id`, `name`, `slug`, `city_id`, `district_id`, `address`, `lat`, `lng`, `phone`, `whatsapp`, `is_active` |
| `branch_hours` | `id`, `branch_id`, `weekday` (0–6), `opens_at`, `closes_at`, `is_closed` |
| `business_members` | `business_id`, `user_id`, `role` (`owner`/`staff`), `invited_by`, `created_at` |
| `business_applications` | `id`, `applicant_id`, `business_name`, `contact_name`, `phone`, `email`, `address`, `city_id`, `district_id`, `category_id`, `tax_info` (kısıtlı erişim), `social`, `logo_url`, `status`, `review_note`, `reviewed_by`, `reviewed_at` |

### 2.4. Paket

| Tablo | Alanlar |
| --- | --- |
| `packages` | `id`, `business_id`, `branch_id`, `category_id`, `name`, `slug`, `description`, `min_people`, `max_people`, `pricing_model`, `price_amount`, `computed_total_min`, `computed_per_person_min`, `duration_minutes`, `reservation_terms`, `cancellation_terms`, `is_active`, `is_public`, `is_indexable`, `popularity`, SEO alanları, timestamps |
| `package_items` | `id`, `package_id`, `label`, `detail`, `sort_order` |
| `package_images` | `id`, `package_id`, `url`, `alt`, `width`, `height`, `sort_order` |
| `package_availability` | `id`, `package_id`, `weekday`, `start_time`, `end_time` |
| `package_preferences` | `package_id`, `preference_key` — PK(`package_id`,`preference_key`) |
| `preferences` | `key` (PK), `label`, `category_key`, `sort_order` |

**Fiyat modeli:** `pricing_model = per_person` ise `price_amount` kişi başı; `total` ise
paketin sabit toplamıdır. Türetilmiş kolonlar (`computed_*`) eşleştirme sorgularının
indekslenebilmesi için trigger ile güncellenir.

### 2.5. Plan

| Tablo | Alanlar |
| --- | --- |
| `plans` | `id`, `owner_id`, `name`, `status`, `city_id`, `district_id`, `event_date`, `start_time`, `end_time`, `is_time_flexible`, `estimated_people`, `min_people`, `max_people`, `budget_mode`, `budget_per_person`, `budget_total`, `note`, `voting_starts_at`, `voting_ends_at`, `winning_package_id`, `cancelled_reason`, timestamps |
| `plan_categories` | `plan_id`, `category_id` |
| `plan_preferences` | `plan_id`, `preference_key` |
| `plan_participants` | `id`, `plan_id`, `user_id` (nullable), `guest_token_hash` (nullable), `display_name`, `status`, `is_owner`, `joined_at` |
| `plan_invitations` | `id`, `plan_id`, `token_hash`, `short_code`, `created_by`, `expires_at`, `revoked_at`, `use_count` |
| `plan_package_matches` | `id`, `plan_id`, `package_id`, `score`, `reasons` (jsonb), `computed_at` |

**Katılımcı kimliği:** kayıtlı kullanıcı için `user_id`, misafir için `guest_token_hash`.
`CHECK (user_id IS NOT NULL OR guest_token_hash IS NOT NULL)`.

### 2.6. Oylama

| Tablo | Alanlar |
| --- | --- |
| `votes` | `id`, `plan_id`, `participant_id`, `package_id`, `created_at`, `updated_at` |

`UNIQUE (plan_id, participant_id)` → bir katılımcı, bir aktif oy. Oy değiştirme `UPDATE`'tir.

### 2.7. Rezervasyon

| Tablo | Alanlar |
| --- | --- |
| `reservations` | `id`, `plan_id`, `package_id`, `branch_id`, `business_id`, `created_by`, `code`, `people_count`, `reserved_date`, `reserved_start_time`, `reserved_end_time`, `total_price`, `per_person_price`, `contact_name`, `contact_phone`, `note`, `status`, `rejection_reason`, timestamps |
| `reservation_status_history` | `id`, `reservation_id`, `from_status`, `to_status`, `changed_by`, `reason`, `created_at` |

`reservations.code` benzersiz, insan-okunur (örn. `HG-7QK4M2`).

### 2.8. Yardımcı Tablolar

| Tablo | Amaç |
| --- | --- |
| `favorites` | `user_id`, `package_id` — PK(ikisi) |
| `notifications` | `id`, `user_id`, `type`, `title`, `body`, `data` (jsonb), `read_at`, `created_at` |
| `notification_preferences` | `user_id`, `type`, `channel`, `enabled` |
| `push_tokens` | `id`, `user_id`, `token`, `platform`, `created_at` |
| `reports` | `id`, `reporter_id`, `subject_type`, `subject_id`, `reason`, `detail`, `status`, `resolved_by`, `resolution_note` |
| `support_tickets` | `id`, `user_id`, `subject`, `body`, `status`, `answer`, `answered_by` |
| `admin_logs` | `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `before` (jsonb), `after` (jsonb), `created_at` |
| `seo_redirects` | `id`, `from_path`, `to_path`, `status_code` (301/302/410), `is_active` |
| `help_articles` | `id`, `slug`, `title`, `body`, `category`, `is_public`, `is_indexable`, `sort_order` |
| `rate_limits` | `key`, `window_start`, `count` — PK(`key`,`window_start`) |

### 2.9. Gelir Modeli İçin Şema Yeri (Faz 1'de pasif)

`subscription_plans`, `business_subscriptions`, `payments`, `commissions`, `invoices`,
`promotions` tabloları oluşturulur ancak **hiçbir uygulama akışı bunlara yazmaz**.
Faz 1'de aktif ödeme akışı yoktur.

## 3. İndeksler

Eşleştirme ve public sorgular için:

```sql
-- Aktif konum sorguları
CREATE INDEX idx_cities_active        ON cities (is_active, is_public) WHERE is_active;
CREATE INDEX idx_districts_city_active ON districts (city_id, is_active) WHERE is_active;

-- Public slug erişimi (tekil, hızlı)
CREATE UNIQUE INDEX idx_businesses_slug ON businesses (slug);
CREATE UNIQUE INDEX idx_packages_slug   ON packages (slug);
CREATE UNIQUE INDEX idx_cities_slug     ON cities (country_id, slug);
CREATE UNIQUE INDEX idx_districts_slug  ON districts (city_id, slug);

-- Paket eşleştirme
CREATE INDEX idx_packages_matching ON packages
  (is_active, category_id, min_people, max_people, computed_per_person_min);
CREATE INDEX idx_branches_location ON business_branches (city_id, district_id, is_active);
CREATE INDEX idx_pkg_avail         ON package_availability (package_id, weekday);

-- Plan
CREATE INDEX idx_plans_owner   ON plans (owner_id, status);
CREATE INDEX idx_participants  ON plan_participants (plan_id);
CREATE UNIQUE INDEX idx_invitation_token ON plan_invitations (token_hash);
CREATE UNIQUE INDEX idx_invitation_code  ON plan_invitations (short_code);

-- Oy benzersizliği
CREATE UNIQUE INDEX idx_vote_unique ON votes (plan_id, participant_id);
CREATE INDEX idx_vote_package       ON votes (plan_id, package_id);

-- Rezervasyon
CREATE INDEX idx_res_business ON reservations (business_id, status, reserved_date);
CREATE INDEX idx_res_plan     ON reservations (plan_id);
CREATE UNIQUE INDEX idx_res_code ON reservations (code);
```

## 4. Kısıtlar (Constraints)

- `plans`: `CHECK (min_people <= estimated_people AND estimated_people <= max_people)`
- `plans`: `CHECK (budget_per_person > 0 OR budget_total > 0)`
- `packages`: `CHECK (min_people >= 1 AND max_people >= min_people)`
- `packages`: `CHECK (price_amount > 0)`
- `package_availability`: `CHECK (start_time < end_time)`
- `reservations`: `CHECK (people_count >= 1)`
- `plan_participants`: `CHECK (user_id IS NOT NULL OR guest_token_hash IS NOT NULL)`
- Tüm `slug` alanları: `CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`

## 5. RLS Politikaları (özet)

Ayrıntı: `docs/SECURITY_MODEL.md`.

| Tablo | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `cities`, `districts`, `categories` | herkes (`is_public`) | admin | admin | admin |
| `businesses` | herkes (`status='verified' AND is_public`) veya üye/admin | sahip | işletme üyesi / admin | admin |
| `packages` | herkes (`is_active AND is_public`) veya işletme üyesi / admin | işletme üyesi | işletme üyesi / admin | işletme üyesi |
| `plans` | sahip veya katılımcı veya admin | sahip | sahip | sahip |
| `plan_participants` | plan sahibi + katılımcılar | davet fonksiyonu | kendi kaydı | plan sahibi |
| `votes` | plan katılımcıları | katılımcı (kendi) | katılımcı (kendi) | katılımcı (kendi) |
| `reservations` | plan sahibi + hedef işletme üyeleri + admin | plan sahibi | işletme üyesi + plan sahibi (iptal) | — |
| `notifications` | kendi | sistem | kendi (okundu) | kendi |
| `admin_logs` | admin | sistem | — | — |

Yardımcı SQL fonksiyonları: `auth_has_role(role)`, `auth_is_business_member(business_id)`,
`auth_is_plan_participant(plan_id)`, `auth_is_plan_owner(plan_id)`. Hepsi
`SECURITY DEFINER` + `STABLE`, `search_path = public` sabitlenmiş.

## 6. Trigger'lar

| Trigger | Etki |
| --- | --- |
| `set_updated_at` | Tüm `updated_at` kolonlarını günceller |
| `packages_compute_prices` | `computed_total_min` / `computed_per_person_min` türetir |
| `reservations_log_status` | Durum değişimini `reservation_status_history` içine yazar |
| `handle_new_user` | `auth.users` insert → `profiles` + `user_roles('user')` |
| `plans_guard_status` | Geçersiz durum geçişlerini reddeder |

## 7. Migration Politikası

- Migration dosyaları `supabase/migrations/NNNN_<ad>.sql` biçiminde sıralıdır.
- Her migration **ileri** yönlüdür; geri dönüş adımları dosya başındaki yorum bloğunda
  `-- ROLLBACK:` etiketiyle belgelenir.
- Veri silen komut (`DROP TABLE`, `TRUNCATE`, koşulsuz `DELETE`) uygulanmaz.
- Kolon kaldırma iki aşamalıdır: önce kullanımdan çıkar, sonraki sürümde düşür.
