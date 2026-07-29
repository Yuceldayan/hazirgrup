/**
 * supabase/seed/seed.sql üretici.
 *
 * Demo verisi ile SQL seed AYNI TypeScript kaynağından üretilir (D-005), böylece
 * bellek içi demo modu ile Supabase ortamı arasında veri sapması oluşmaz.
 *
 * Çalıştırma:  npm run seed:sql
 */

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDataset, SEED_REFERENCE_DATE } from '../packages/core/src/seed/dataset';
import { GUIDE_PAGES } from '../packages/core/src/seed/content';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, '../supabase/seed/seed.sql');

/**
 * Okunabilir anahtarları deterministik UUID'ye çevirir.
 * Aynı anahtar her zaman aynı UUID'yi üretir; böylece seed tekrar
 * çalıştırıldığında ilişkiler bozulmaz.
 */
function uuidFor(key: string): string {
  const hex = createHash('sha256').update(`hazirgrup:${key}`).digest('hex').slice(0, 32);
  const bytes = hex.split('');
  // UUID v4 biçim işaretleri
  bytes[12] = '4';
  bytes[16] = '8';
  const s = bytes.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}

const q = (value: string | null | undefined): string =>
  value === null || value === undefined ? 'NULL' : `'${value.replace(/'/g, "''")}'`;

const n = (value: number | null | undefined): string =>
  value === null || value === undefined ? 'NULL' : String(value);

const b = (value: boolean): string => (value ? 'true' : 'false');

const ts = (value: string | null | undefined): string => (value ? `'${value}'::timestamptz` : 'NULL');

const jsonb = (value: unknown): string =>
  value === null || value === undefined
    ? 'NULL'
    : `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;

function section(title: string): string {
  return `\n-- ${'='.repeat(74)}\n-- ${title}\n-- ${'='.repeat(74)}\n`;
}

function main(): void {
  const data = buildDataset(SEED_REFERENCE_DATE);
  const out: string[] = [];

  out.push(`-- ${'='.repeat(74)}
-- HazırGrup — Demo seed verisi
--
-- BU DOSYA ÜRETİLMİŞTİR. Elle düzenlemeyin.
-- Kaynak: packages/core/src/seed/*.ts   ·   Üretim: npm run seed:sql
--
-- TÜM VERİLER KURGUSALDIR. Gerçek işletme, kişi veya iletişim bilgisi içermez.
-- E-posta adresleri test için ayrılmış ".test" alan adını kullanır.
-- Referans tarih: ${data.referenceDate}
-- ${'='.repeat(74)}

BEGIN;
`);

  // --- Kullanıcılar (auth.users + profiles) ---------------------------------
  out.push(section('1. Kullanıcılar'));
  out.push(`-- Supabase Auth kullanıcıları. Şifreler pgcrypto ile hash'lenir.
-- Demo şifreleri docs/SETUP.md içinde belgelenmiştir.
`);

  for (const user of data.users) {
    const id = uuidFor(user.profile.id);
    out.push(`INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated',
  ${q(user.profile.email)}, crypt(${q(user.password)}, gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  ${jsonb({ display_name: user.profile.displayName })},
  false
) ON CONFLICT (id) DO NOTHING;`);
  }

  out.push('\n-- handle_new_user trigger profilleri oluşturur; alanları tamamlıyoruz.');
  for (const user of data.users) {
    const id = uuidFor(user.profile.id);
    out.push(`UPDATE public.profiles SET
  display_name = ${q(user.profile.displayName)},
  phone = ${q(user.profile.phone)},
  theme = ${q(user.profile.theme)},
  locale = ${q(user.profile.locale)}
WHERE id = '${id}';`);
  }

  out.push('\n-- Roller');
  for (const user of data.users) {
    for (const role of user.roles) {
      out.push(
        `INSERT INTO public.user_roles (user_id, role) VALUES ('${uuidFor(user.profile.id)}', '${role}') ON CONFLICT DO NOTHING;`,
      );
    }
  }

  // --- Konum ----------------------------------------------------------------
  out.push(section('2. Ülke, şehir, ilçe, kategori, tercih'));

  for (const country of data.countries) {
    out.push(
      `INSERT INTO public.countries (id, code, name, slug, is_active) VALUES ('${uuidFor(country.id)}', ${q(country.code)}, ${q(country.name)}, ${q(country.slug)}, ${b(country.isActive)});`,
    );
  }

  for (const city of data.cities) {
    out.push(`INSERT INTO public.cities (
  id, country_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '${uuidFor(city.id)}', '${uuidFor(city.countryId)}', ${q(city.name)}, ${q(city.slug)}, ${q(city.intro)},
  ${b(city.isActive)}, ${b(city.isPublic)}, ${b(city.isIndexable)}, ${n(city.sortOrder)},
  ${q(city.seoTitle)}, ${q(city.seoDescription)}, ${q(city.seoCanonical)}, ${q(city.ogImageUrl)}
);`);
  }

  for (const district of data.districts) {
    out.push(`INSERT INTO public.districts (
  id, city_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '${uuidFor(district.id)}', '${uuidFor(district.cityId)}', ${q(district.name)}, ${q(district.slug)}, ${q(district.intro)},
  ${b(district.isActive)}, ${b(district.isPublic)}, ${b(district.isIndexable)}, ${n(district.sortOrder)},
  ${q(district.seoTitle)}, ${q(district.seoDescription)}, ${q(district.seoCanonical)}, ${q(district.ogImageUrl)}
);`);
  }

  for (const category of data.categories) {
    out.push(`INSERT INTO public.categories (
  id, key, name, slug, icon, description, is_active, is_indexable, sort_order
) VALUES (
  '${uuidFor(category.id)}', ${q(category.key)}, ${q(category.name)}, ${q(category.slug)}, ${q(category.icon)},
  ${q(category.description)}, ${b(category.isActive)}, ${b(category.isIndexable)}, ${n(category.sortOrder)}
);`);
  }

  for (const preference of data.preferences) {
    out.push(
      `INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES (${q(preference.key)}, ${q(preference.label)}, ${q(preference.categoryKey)}, ${n(preference.sortOrder)});`,
    );
  }

  // --- Kullanıcı konum tercihleri -------------------------------------------
  out.push('\n-- Kullanıcıların şehir/ilçe tercihleri');
  for (const user of data.users) {
    if (!user.profile.cityId) continue;
    out.push(
      `UPDATE public.profiles SET city_id = '${uuidFor(user.profile.cityId)}', district_id = ${user.profile.districtId ? `'${uuidFor(user.profile.districtId)}'` : 'NULL'} WHERE id = '${uuidFor(user.profile.id)}';`,
    );
  }

  // --- İşletmeler -----------------------------------------------------------
  out.push(section('3. İşletmeler, şubeler, çalışma saatleri, ekip'));

  for (const business of data.businesses) {
    out.push(`INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  '${uuidFor(business.id)}', ${business.ownerId ? `'${uuidFor(business.ownerId)}'` : 'NULL'}, ${q(business.name)}, ${q(business.slug)},
  ${q(business.description)}, '${uuidFor(business.categoryId)}', ${q(business.status)}, ${b(business.isPublic)}, ${b(business.isIndexable)},
  ${q(business.logoUrl)}, ${q(business.coverUrl)}, ${q(business.phone)}, ${q(business.whatsapp)},
  ${q(business.website)}, ${q(business.instagram)}, ${ts(business.verifiedAt)},
  ${business.verifiedBy ? `'${uuidFor(business.verifiedBy)}'` : 'NULL'}
);`);
  }

  for (const branch of data.branches) {
    out.push(`INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '${uuidFor(branch.id)}', '${uuidFor(branch.businessId)}', ${q(branch.name)}, ${q(branch.slug)},
  '${uuidFor(branch.cityId)}', '${uuidFor(branch.districtId)}', ${q(branch.address)},
  ${n(branch.lat)}, ${n(branch.lng)}, ${q(branch.phone)}, ${q(branch.whatsapp)}, ${b(branch.isActive)}
);`);

    for (const hours of branch.hours) {
      out.push(
        `INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('${uuidFor(branch.id)}', ${n(hours.weekday)}, ${hours.opensAt ? `'${hours.opensAt}'` : 'NULL'}, ${hours.closesAt ? `'${hours.closesAt}'` : 'NULL'}, ${b(hours.isClosed)});`,
      );
    }
  }

  for (const member of data.businessMembers) {
    out.push(
      `INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('${uuidFor(member.businessId)}', '${uuidFor(member.userId)}', ${q(member.role)}, ${member.invitedBy ? `'${uuidFor(member.invitedBy)}'` : 'NULL'});`,
    );
  }

  for (const application of data.businessApplications) {
    out.push(`INSERT INTO public.business_applications (
  id, applicant_id, business_name, contact_name, phone, email, address,
  city_id, district_id, category_id, tax_info, instagram, website, logo_url,
  status, review_note, reviewed_by, reviewed_at, created_at
) VALUES (
  '${uuidFor(application.id)}', '${uuidFor(application.applicantId)}', ${q(application.businessName)},
  ${q(application.contactName)}, ${q(application.phone)}, ${q(application.email)}, ${q(application.address)},
  '${uuidFor(application.cityId)}', '${uuidFor(application.districtId)}', '${uuidFor(application.categoryId)}',
  ${q(application.taxInfo)}, ${q(application.instagram)}, ${q(application.website)}, ${q(application.logoUrl)},
  ${q(application.status)}, ${q(application.reviewNote)},
  ${application.reviewedBy ? `'${uuidFor(application.reviewedBy)}'` : 'NULL'}, ${ts(application.reviewedAt)}, ${ts(application.createdAt)}
);`);
  }

  // --- Paketler -------------------------------------------------------------
  out.push(section('4. Paketler'));

  for (const pkg of data.packages) {
    out.push(`INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '${uuidFor(pkg.id)}', '${uuidFor(pkg.businessId)}', '${uuidFor(pkg.branchId)}', '${uuidFor(pkg.categoryId)}',
  ${q(pkg.name)}, ${q(pkg.slug)}, ${q(pkg.description)},
  ${n(pkg.minPeople)}, ${n(pkg.maxPeople)}, ${q(pkg.pricingModel)}, ${n(pkg.priceAmount)}, ${n(pkg.durationMinutes)},
  ${q(pkg.reservationTerms)}, ${q(pkg.cancellationTerms)}, ${b(pkg.isActive)}, ${b(pkg.isPublic)}, ${b(pkg.isIndexable)}, ${n(pkg.popularity)}
);`);

    for (const item of pkg.items) {
      out.push(
        `INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('${uuidFor(pkg.id)}', ${q(item.label)}, ${q(item.detail)}, ${n(item.sortOrder)});`,
      );
    }
    for (const image of pkg.images) {
      out.push(
        `INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('${uuidFor(pkg.id)}', ${q(image.url)}, ${q(image.alt)}, ${n(image.width)}, ${n(image.height)}, ${n(image.sortOrder)});`,
      );
    }
    for (const slot of pkg.availability) {
      out.push(
        `INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('${uuidFor(pkg.id)}', ${n(slot.weekday)}, '${slot.startTime}', '${slot.endTime}');`,
      );
    }
    for (const key of pkg.preferenceKeys) {
      out.push(
        `INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('${uuidFor(pkg.id)}', ${q(key)});`,
      );
    }
  }

  // --- Planlar --------------------------------------------------------------
  out.push(section('5. Planlar, katılımcılar, davetler, oylar'));

  for (const plan of data.plans) {
    out.push(`INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  '${uuidFor(plan.id)}', '${uuidFor(plan.ownerId)}', ${q(plan.name)}, ${q(plan.status)},
  '${uuidFor(plan.cityId)}', ${plan.districtId ? `'${uuidFor(plan.districtId)}'` : 'NULL'},
  '${plan.eventDate}', ${plan.startTime ? `'${plan.startTime}'` : 'NULL'}, ${plan.endTime ? `'${plan.endTime}'` : 'NULL'},
  ${b(plan.isTimeFlexible)}, ${n(plan.estimatedPeople)}, ${n(plan.minPeople)}, ${n(plan.maxPeople)},
  ${q(plan.budgetMode)}, ${n(plan.budgetPerPerson)}, ${n(plan.budgetTotal)}, ${q(plan.note)},
  ${ts(plan.votingStartsAt)}, ${ts(plan.votingEndsAt)},
  ${plan.winningPackageId ? `'${uuidFor(plan.winningPackageId)}'` : 'NULL'},
  ${q(plan.cancelledReason)}, ${ts(plan.createdAt)}, ${ts(plan.updatedAt)}
);`);

    for (const categoryId of plan.categoryIds) {
      out.push(
        `INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('${uuidFor(plan.id)}', '${uuidFor(categoryId)}');`,
      );
    }
    for (const key of plan.preferenceKeys) {
      out.push(
        `INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('${uuidFor(plan.id)}', ${q(key)});`,
      );
    }
  }

  for (const participant of data.participants) {
    out.push(`INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '${uuidFor(participant.id)}', '${uuidFor(participant.planId)}',
  ${participant.userId ? `'${uuidFor(participant.userId)}'` : 'NULL'}, ${q(participant.guestTokenHash)},
  ${q(participant.displayName)}, ${q(participant.status)}, ${b(participant.isOwner)}, ${ts(participant.joinedAt)}
);`);
  }

  for (const invitation of data.invitations) {
    out.push(`INSERT INTO public.plan_invitations (
  id, plan_id, token_hash, short_code, created_by, expires_at, revoked_at, use_count, created_at
) VALUES (
  '${uuidFor(invitation.id)}', '${uuidFor(invitation.planId)}', ${q(invitation.tokenHash)}, ${q(invitation.shortCode)},
  '${uuidFor(invitation.createdBy)}', ${ts(invitation.expiresAt)}, ${ts(invitation.revokedAt)},
  ${n(invitation.useCount)}, ${ts(invitation.createdAt)}
);`);
  }

  out.push(`
-- Oy trigger'ı yalnızca 'voting' durumundaki planlarda oy kabul eder.
-- Seed verisi geçmiş oylamaları da içerdiği için trigger geçici olarak kapatılır.
ALTER TABLE public.votes DISABLE TRIGGER votes_guard_window;`);

  for (const vote of data.votes) {
    out.push(
      `INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('${uuidFor(vote.id)}', '${uuidFor(vote.planId)}', '${uuidFor(vote.participantId)}', '${uuidFor(vote.packageId)}', ${ts(vote.createdAt)}, ${ts(vote.updatedAt)});`,
    );
  }

  out.push('ALTER TABLE public.votes ENABLE TRIGGER votes_guard_window;');

  // --- Rezervasyonlar -------------------------------------------------------
  out.push(section('6. Rezervasyonlar'));

  out.push(`-- Durum geçmişi trigger ile otomatik yazılır; seed geçmişi ayrıca eklenmez.
ALTER TABLE public.reservations DISABLE TRIGGER reservations_guard_status;`);

  for (const reservation of data.reservations) {
    out.push(`INSERT INTO public.reservations (
  id, plan_id, package_id, branch_id, business_id, created_by, code, people_count,
  reserved_date, reserved_start_time, reserved_end_time, total_price, per_person_price,
  contact_name, contact_phone, note, status, rejection_reason, rejection_note,
  created_at, updated_at
) VALUES (
  '${uuidFor(reservation.id)}', '${uuidFor(reservation.planId)}', '${uuidFor(reservation.packageId)}',
  '${uuidFor(reservation.branchId)}', '${uuidFor(reservation.businessId)}', '${uuidFor(reservation.createdBy)}',
  ${q(reservation.code)}, ${n(reservation.peopleCount)}, '${reservation.reservedDate}',
  ${reservation.reservedStartTime ? `'${reservation.reservedStartTime}'` : 'NULL'},
  ${reservation.reservedEndTime ? `'${reservation.reservedEndTime}'` : 'NULL'},
  ${n(reservation.totalPrice)}, ${n(reservation.perPersonPrice)},
  ${q(reservation.contactName)}, ${q(reservation.contactPhone)}, ${q(reservation.note)},
  ${q(reservation.status)}, ${q(reservation.rejectionReason)}, ${q(reservation.rejectionNote)},
  ${ts(reservation.createdAt)}, ${ts(reservation.updatedAt)}
);`);
  }

  out.push('ALTER TABLE public.reservations ENABLE TRIGGER reservations_guard_status;');

  // --- Yardımcı içerik ------------------------------------------------------
  out.push(section('7. Bildirimler, favoriler, yardım içerikleri, SEO'));

  for (const notification of data.notifications) {
    out.push(`INSERT INTO public.notifications (id, user_id, type, title, body, data, read_at, created_at) VALUES (
  '${uuidFor(notification.id)}', '${uuidFor(notification.userId)}', ${q(notification.type)},
  ${q(notification.title)}, ${q(notification.body)}, ${jsonb(notification.data)},
  ${ts(notification.readAt)}, ${ts(notification.createdAt)}
);`);
  }

  for (const favorite of data.favorites) {
    out.push(
      `INSERT INTO public.favorites (user_id, package_id, created_at) VALUES ('${uuidFor(favorite.userId)}', '${uuidFor(favorite.packageId)}', ${ts(favorite.createdAt)});`,
    );
  }

  for (const article of data.helpArticles) {
    out.push(`INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '${uuidFor(article.id)}', ${q(article.slug)}, ${q(article.title)}, ${q(article.summary)},
  ${q(article.body)}, ${q(article.category)}, ${b(article.isPublic)}, ${b(article.isIndexable)}, ${n(article.sortOrder)}
);`);
  }

  for (const redirect of data.seoRedirects) {
    out.push(
      `INSERT INTO public.seo_redirects (id, from_path, to_path, status_code, is_active, created_at) VALUES ('${uuidFor(redirect.id)}', ${q(redirect.fromPath)}, ${q(redirect.toPath)}, ${n(redirect.statusCode)}, ${b(redirect.isActive)}, ${ts(redirect.createdAt)});`,
    );
  }

  for (const log of data.adminLogs) {
    out.push(`INSERT INTO public.admin_logs (id, actor_id, actor_name, action, entity_type, entity_id, before, after, created_at) VALUES (
  '${uuidFor(log.id)}', '${uuidFor(log.actorId)}', ${q(log.actorName)}, ${q(log.action)},
  ${q(log.entityType)}, '${uuidFor(log.entityId)}', ${jsonb(log.before)}, ${jsonb(log.after)}, ${ts(log.createdAt)}
);`);
  }

  // --- Özet -----------------------------------------------------------------
  out.push(section('Özet'));
  out.push(`-- Kullanıcı: ${data.users.length}
-- İşletme: ${data.businesses.length}
-- Şube: ${data.branches.length}
-- Paket: ${data.packages.length}
-- Plan: ${data.plans.length}
-- Katılımcı: ${data.participants.length}
-- Oy: ${data.votes.length}
-- Rezervasyon: ${data.reservations.length}
-- Yardım makalesi: ${data.helpArticles.length}
-- Rehber sayfası (uygulama kodunda): ${GUIDE_PAGES.length}

COMMIT;
`);

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, out.join('\n'), 'utf8');

  console.log(`✓ seed.sql üretildi: ${OUTPUT}`);
  console.log(
    `  ${data.users.length} kullanıcı · ${data.businesses.length} işletme · ${data.branches.length} şube · ${data.packages.length} paket · ${data.plans.length} plan · ${data.reservations.length} rezervasyon`,
  );
}

main();
