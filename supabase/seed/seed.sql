-- ==========================================================================
-- HazırGrup — Demo seed verisi
--
-- BU DOSYA ÜRETİLMİŞTİR. Elle düzenlemeyin.
-- Kaynak: packages/core/src/seed/*.ts   ·   Üretim: npm run seed:sql
--
-- TÜM VERİLER KURGUSALDIR. Gerçek işletme, kişi veya iletişim bilgisi içermez.
-- E-posta adresleri test için ayrılmış ".test" alan adını kullanır.
-- Referans tarih: 2026-03-02
-- ==========================================================================

BEGIN;


-- ==========================================================================
-- 1. Kullanıcılar
-- ==========================================================================

-- Supabase Auth kullanıcıları. Şifreler pgcrypto ile hash'lenir.
-- Demo şifreleri docs/SETUP.md içinde belgelenmiştir.

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '362776d3-9839-4100-8203-423551604483', 'authenticated', 'authenticated',
  'elif@ornek.test', crypt('Demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Elif Demir"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '729f9b2e-9179-488f-8e7a-ea73df0658c4', 'authenticated', 'authenticated',
  'kerem@ornek.test', crypt('Demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Kerem Aslan"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', 'authenticated', 'authenticated',
  'zeynep@ornek.test', crypt('Demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Zeynep Kaya"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'a61f805a-027c-493e-84ae-0413ecf16807', 'authenticated', 'authenticated',
  'mert@ornek.test', crypt('Demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Mert Şahin"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', 'authenticated', 'authenticated',
  'admin@ornek.test', crypt('Admin1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Sistem Yöneticisi"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '1d7f466f-5b7b-4716-835b-ecfffeb0df8a', 'authenticated', 'authenticated',
  'personel@ornek.test', crypt('Demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Kuzey Işığı Personeli"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '687874aa-10d7-4b7f-8f1e-eb83eb5bbbd3', 'authenticated', 'authenticated',
  'basvuru@ornek.test', crypt('Demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Aday İşletmeci"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'a1c74d64-9253-4d1a-8590-214283bf4113', 'authenticated', 'authenticated',
  'isletme01@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Serkan Aydın"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '1731c550-d1d2-4c8b-8749-56f5eb2bea55', 'authenticated', 'authenticated',
  'isletme02@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Nazlı Ergün"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '101f52ff-89fd-4050-8204-d7bba8e1c870', 'authenticated', 'authenticated',
  'isletme03@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Hakan Toprak"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'c07bfb96-2c3e-4142-8e3b-90928339909e', 'authenticated', 'authenticated',
  'isletme04@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Sevil Barış"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'cac03dd9-5e29-406b-86c5-2b0b648d4d71', 'authenticated', 'authenticated',
  'isletme05@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Onur Çetin"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '54f8b6fc-70a3-4656-87ae-98592f5cde1a', 'authenticated', 'authenticated',
  'isletme06@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Derya Kılıç"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '192e7846-82cd-4795-8045-67af51f65511', 'authenticated', 'authenticated',
  'isletme07@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Volkan Tunç"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', '65ba3855-424e-4494-81a3-4a2c69658a4a', 'authenticated', 'authenticated',
  'isletme08@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Ceren Aksoy"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'b491da4c-16b3-4eed-822a-795c5f6b308a', 'authenticated', 'authenticated',
  'isletme09@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Burak Yalçın"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'cde5c727-02fa-4367-8a8a-6f858423d78a', 'authenticated', 'authenticated',
  'isletme10@ornek.test', crypt('Isletme1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Melis Duran"}'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;

-- handle_new_user trigger profilleri oluşturur; alanları tamamlıyoruz.
UPDATE public.profiles SET
  display_name = 'Elif Demir',
  phone = '05001234567',
  theme = 'system',
  locale = 'tr'
WHERE id = '362776d3-9839-4100-8203-423551604483';
UPDATE public.profiles SET
  display_name = 'Kerem Aslan',
  phone = NULL,
  theme = 'system',
  locale = 'tr'
WHERE id = '729f9b2e-9179-488f-8e7a-ea73df0658c4';
UPDATE public.profiles SET
  display_name = 'Zeynep Kaya',
  phone = NULL,
  theme = 'system',
  locale = 'tr'
WHERE id = 'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b';
UPDATE public.profiles SET
  display_name = 'Mert Şahin',
  phone = NULL,
  theme = 'system',
  locale = 'tr'
WHERE id = 'a61f805a-027c-493e-84ae-0413ecf16807';
UPDATE public.profiles SET
  display_name = 'Sistem Yöneticisi',
  phone = NULL,
  theme = 'system',
  locale = 'tr'
WHERE id = 'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60';
UPDATE public.profiles SET
  display_name = 'Kuzey Işığı Personeli',
  phone = NULL,
  theme = 'system',
  locale = 'tr'
WHERE id = '1d7f466f-5b7b-4716-835b-ecfffeb0df8a';
UPDATE public.profiles SET
  display_name = 'Aday İşletmeci',
  phone = NULL,
  theme = 'system',
  locale = 'tr'
WHERE id = '687874aa-10d7-4b7f-8f1e-eb83eb5bbbd3';
UPDATE public.profiles SET
  display_name = 'Serkan Aydın',
  phone = '05001110001',
  theme = 'system',
  locale = 'tr'
WHERE id = 'a1c74d64-9253-4d1a-8590-214283bf4113';
UPDATE public.profiles SET
  display_name = 'Nazlı Ergün',
  phone = '05001110002',
  theme = 'system',
  locale = 'tr'
WHERE id = '1731c550-d1d2-4c8b-8749-56f5eb2bea55';
UPDATE public.profiles SET
  display_name = 'Hakan Toprak',
  phone = '05001110003',
  theme = 'system',
  locale = 'tr'
WHERE id = '101f52ff-89fd-4050-8204-d7bba8e1c870';
UPDATE public.profiles SET
  display_name = 'Sevil Barış',
  phone = '05001110004',
  theme = 'system',
  locale = 'tr'
WHERE id = 'c07bfb96-2c3e-4142-8e3b-90928339909e';
UPDATE public.profiles SET
  display_name = 'Onur Çetin',
  phone = '05001110005',
  theme = 'system',
  locale = 'tr'
WHERE id = 'cac03dd9-5e29-406b-86c5-2b0b648d4d71';
UPDATE public.profiles SET
  display_name = 'Derya Kılıç',
  phone = '05001110006',
  theme = 'system',
  locale = 'tr'
WHERE id = '54f8b6fc-70a3-4656-87ae-98592f5cde1a';
UPDATE public.profiles SET
  display_name = 'Volkan Tunç',
  phone = '05001110007',
  theme = 'system',
  locale = 'tr'
WHERE id = '192e7846-82cd-4795-8045-67af51f65511';
UPDATE public.profiles SET
  display_name = 'Ceren Aksoy',
  phone = '05001110008',
  theme = 'system',
  locale = 'tr'
WHERE id = '65ba3855-424e-4494-81a3-4a2c69658a4a';
UPDATE public.profiles SET
  display_name = 'Burak Yalçın',
  phone = '05001110009',
  theme = 'system',
  locale = 'tr'
WHERE id = 'b491da4c-16b3-4eed-822a-795c5f6b308a';
UPDATE public.profiles SET
  display_name = 'Melis Duran',
  phone = '05001110010',
  theme = 'system',
  locale = 'tr'
WHERE id = 'cde5c727-02fa-4367-8a8a-6f858423d78a';

-- Roller
INSERT INTO public.user_roles (user_id, role) VALUES ('362776d3-9839-4100-8203-423551604483', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('729f9b2e-9179-488f-8e7a-ea73df0658c4', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('a61f805a-027c-493e-84ae-0413ecf16807', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('1d7f466f-5b7b-4716-835b-ecfffeb0df8a', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('1d7f466f-5b7b-4716-835b-ecfffeb0df8a', 'business_staff') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('687874aa-10d7-4b7f-8f1e-eb83eb5bbbd3', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('a1c74d64-9253-4d1a-8590-214283bf4113', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('a1c74d64-9253-4d1a-8590-214283bf4113', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('1731c550-d1d2-4c8b-8749-56f5eb2bea55', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('1731c550-d1d2-4c8b-8749-56f5eb2bea55', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('101f52ff-89fd-4050-8204-d7bba8e1c870', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('101f52ff-89fd-4050-8204-d7bba8e1c870', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('c07bfb96-2c3e-4142-8e3b-90928339909e', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('c07bfb96-2c3e-4142-8e3b-90928339909e', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('cac03dd9-5e29-406b-86c5-2b0b648d4d71', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('cac03dd9-5e29-406b-86c5-2b0b648d4d71', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('54f8b6fc-70a3-4656-87ae-98592f5cde1a', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('54f8b6fc-70a3-4656-87ae-98592f5cde1a', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('192e7846-82cd-4795-8045-67af51f65511', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('192e7846-82cd-4795-8045-67af51f65511', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('65ba3855-424e-4494-81a3-4a2c69658a4a', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('65ba3855-424e-4494-81a3-4a2c69658a4a', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('b491da4c-16b3-4eed-822a-795c5f6b308a', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('b491da4c-16b3-4eed-822a-795c5f6b308a', 'business_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('cde5c727-02fa-4367-8a8a-6f858423d78a', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('cde5c727-02fa-4367-8a8a-6f858423d78a', 'business_owner') ON CONFLICT DO NOTHING;

-- ==========================================================================
-- 2. Ülke, şehir, ilçe, kategori, tercih
-- ==========================================================================

INSERT INTO public.countries (id, code, name, slug, is_active) VALUES ('d24252c3-12c3-4894-801c-24815912468a', 'TR', 'Türkiye', 'turkiye', true);
INSERT INTO public.cities (
  id, country_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', 'd24252c3-12c3-4894-801c-24815912468a', 'Hakkâri', 'hakkari', 'Hakkâri’de arkadaş grubunuzla buluşmak için kafe, halı saha ve oyun salonu paketlerini tek yerden karşılaştırın. Kişi sayınızı ve bütçenizi girin, uygun paketleri görün, arkadaşlarınızı davet edip birlikte oylayın.',
  true, true, true, 1,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.cities (
  id, country_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '44c60af9-5060-407b-805b-f220d656e2f6', 'd24252c3-12c3-4894-801c-24815912468a', 'Van', 'van', NULL,
  false, false, false, 2,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.districts (
  id, city_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '83873d94-3a2b-4a6f-8408-bbc98c8b266a', '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', 'Merkez', 'merkez', 'Hakkâri Merkez’de kalabalık arkadaş grupları için en çok tercih edilen kafe ve oyun salonu paketleri burada.',
  true, true, true, 1,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.districts (
  id, city_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '44d5292d-0f6d-4b03-877b-3886924d44b6', '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', 'Yüksekova', 'yuksekova', 'Yüksekova’da halı saha ve grup yemeği paketlerini kişi sayınıza göre filtreleyin.',
  true, true, true, 2,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.districts (
  id, city_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '44ffdb8d-e2e2-4300-86d2-55c167a71d47', '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', 'Şemdinli', 'semdinli', 'Şemdinli’de arkadaş buluşmaları için uygun bütçeli mekân paketleri.',
  true, true, true, 3,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.districts (
  id, city_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '405ff733-f134-470d-8c19-ace5e2f8450b', '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', 'Çukurca', 'cukurca', NULL,
  true, true, true, 4,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.districts (
  id, city_id, name, slug, intro, is_active, is_public, is_indexable, sort_order,
  seo_title, seo_description, seo_canonical, og_image_url
) VALUES (
  '98d43bc0-f191-4df1-8e55-d99c0fd361d0', '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', 'Derecik', 'derecik', NULL,
  true, true, true, 5,
  NULL, NULL, NULL, NULL
);
INSERT INTO public.categories (
  id, key, name, slug, icon, description, is_active, is_indexable, sort_order
) VALUES (
  '40d9edd1-96ab-49c6-81ba-acd1307af37f', 'cafe_restaurant', 'Kafe & Restoran', 'kafe-restoran', 'coffee',
  'Kahve, tatlı, kahvaltı ve akşam yemeği paketleri. Grup masası ayırtın, kişi başı fiyatı önceden görün.', true, true, 1
);
INSERT INTO public.categories (
  id, key, name, slug, icon, description, is_active, is_indexable, sort_order
) VALUES (
  'f479618a-dedf-4dd3-85a8-ff2ae024fa85', 'football_pitch', 'Halı Saha', 'hali-saha', 'football',
  'Saatlik halı saha kiralama paketleri. Takım sayınıza göre uygun saatleri ve ek hizmetleri karşılaştırın.', true, true, 2
);
INSERT INTO public.categories (
  id, key, name, slug, icon, description, is_active, is_indexable, sort_order
) VALUES (
  'c3af3857-8ca1-41cb-8d13-8550a8d53d37', 'game_lounge', 'PlayStation & Oyun Salonu', 'oyun-salonu', 'gamepad',
  'PlayStation, bilardo ve turnuva paketleri. Grup halinde saatlik kiralama seçeneklerini görün.', true, true, 3
);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('outdoor', 'Açık alan / bahçe', 'cafe_restaurant', 1);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('quiet', 'Sakin ortam', 'cafe_restaurant', 2);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('live_music', 'Canlı müzik', 'cafe_restaurant', 3);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('projector', 'Projeksiyon / maç yayını', 'cafe_restaurant', 4);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('birthday_setup', 'Doğum günü süslemesi', 'cafe_restaurant', 5);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('vegetarian', 'Vejetaryen seçenek', 'cafe_restaurant', 6);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('private_room', 'Ayrı salon', 'cafe_restaurant', 7);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('indoor_pitch', 'Kapalı saha', 'football_pitch', 1);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('shower', 'Duş ve soyunma odası', 'football_pitch', 2);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('equipment', 'Forma / top dahil', 'football_pitch', 3);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('night_lighting', 'Gece aydınlatması', 'football_pitch', 4);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('ps5', 'PlayStation 5', 'game_lounge', 1);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('tournament', 'Turnuva düzeni', 'game_lounge', 2);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('billiards', 'Bilardo', 'game_lounge', 3);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('parking', 'Otopark', NULL, 20);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('wifi', 'Wi-Fi', NULL, 21);
INSERT INTO public.preferences (key, label, category_key, sort_order) VALUES ('accessible', 'Engelli erişimi', NULL, 22);

-- Kullanıcıların şehir/ilçe tercihleri
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '362776d3-9839-4100-8203-423551604483';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '729f9b2e-9179-488f-8e7a-ea73df0658c4';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '44d5292d-0f6d-4b03-877b-3886924d44b6' WHERE id = 'a61f805a-027c-493e-84ae-0413ecf16807';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '1d7f466f-5b7b-4716-835b-ecfffeb0df8a';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '687874aa-10d7-4b7f-8f1e-eb83eb5bbbd3';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'a1c74d64-9253-4d1a-8590-214283bf4113';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '1731c550-d1d2-4c8b-8749-56f5eb2bea55';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '101f52ff-89fd-4050-8204-d7bba8e1c870';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'c07bfb96-2c3e-4142-8e3b-90928339909e';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'cac03dd9-5e29-406b-86c5-2b0b648d4d71';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '54f8b6fc-70a3-4656-87ae-98592f5cde1a';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '192e7846-82cd-4795-8045-67af51f65511';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = '65ba3855-424e-4494-81a3-4a2c69658a4a';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'b491da4c-16b3-4eed-822a-795c5f6b308a';
UPDATE public.profiles SET city_id = '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', district_id = '83873d94-3a2b-4a6f-8408-bbc98c8b266a' WHERE id = 'cde5c727-02fa-4367-8a8a-6f858423d78a';

-- ==========================================================================
-- 3. İşletmeler, şubeler, çalışma saatleri, ekip
-- ==========================================================================

INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  '36d85939-646e-4c9b-87aa-1b6224254f25', 'a1c74d64-9253-4d1a-8590-214283bf4113', 'Kuzey Işığı Kahve Evi', 'kuzey-isigi-kahve-evi',
  'Merkez’de kalabalık arkadaş grupları için ayrı salonu ve geniş bahçesi olan kurgusal bir kahve evi. Kahvaltı, tatlı ve akşam yemeği paketleri sunar.', '40d9edd1-96ab-49c6-81ba-acd1307af37f', 'verified', true, true,
  '/media/cafe-1.svg', '/media/cafe-1.svg', '05001110001', '05001110001',
  NULL, 'kuzeyisigi_demo', '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  'ab2e1f07-5560-4ee4-8ed3-7baf9cbd72d7', '1731c550-d1d2-4c8b-8749-56f5eb2bea55', 'Semaver Bahçe', 'semaver-bahce',
  'Geleneksel çay ve kahvaltı sunan, açık bahçesiyle yaz aylarında grup buluşmalarına uygun kurgusal işletme.', '40d9edd1-96ab-49c6-81ba-acd1307af37f', 'verified', true, true,
  '/media/cafe-2.svg', '/media/cafe-2.svg', '05001110002', '05001110002',
  NULL, 'semaverbahce_demo', '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  'd362f068-0865-48d3-8e07-bfae8a5e7925', '101f52ff-89fd-4050-8204-d7bba8e1c870', 'Zirve Sofrası', 'zirve-sofrasi',
  'Yöresel tatlar sunan kurgusal restoran. 20 kişiye kadar grup masası ayırma imkânı sağlar.', '40d9edd1-96ab-49c6-81ba-acd1307af37f', 'verified', true, true,
  '/media/cafe-3.svg', '/media/cafe-3.svg', '05001110003', '05001110003',
  NULL, NULL, '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  '5409a85e-7b5d-4f34-8060-913c35088cc3', 'c07bfb96-2c3e-4142-8e3b-90928339909e', 'Meydan Kahvaltı Salonu', 'meydan-kahvalti-salonu',
  'Serpme kahvaltı ve grup brunch paketleri sunan kurgusal salon. Hafta sonu erken saatlerde yoğun çalışır.', '40d9edd1-96ab-49c6-81ba-acd1307af37f', 'verified', true, true,
  '/media/cafe-4.svg', '/media/cafe-4.svg', '05001110004', '05001110004',
  NULL, 'meydankahvalti_demo', '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  '747440e5-1895-427b-886b-ea554067897b', 'cac03dd9-5e29-406b-86c5-2b0b648d4d71', 'Gol Krallığı Halı Saha', 'gol-kralligi-hali-saha',
  'İki kapalı, bir açık sahası bulunan kurgusal halı saha tesisi. Duş, soyunma odası ve forma kiralama hizmeti verir.', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85', 'verified', true, true,
  '/media/pitch-1.svg', '/media/pitch-1.svg', '05001110005', '05001110005',
  NULL, NULL, '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  '6f0cceda-9b42-411f-82ae-bd2ccfd603f0', '54f8b6fc-70a3-4656-87ae-98592f5cde1a', 'Yayla Spor Tesisleri', 'yayla-spor-tesisleri',
  'Halı saha ve basketbol sahası bulunan kurgusal spor tesisi. Turnuva organizasyonlarına uygundur.', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85', 'verified', true, true,
  '/media/pitch-2.svg', '/media/pitch-2.svg', '05001110006', '05001110006',
  NULL, 'yaylaspor_demo', '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  'c4bebe93-f835-4702-879b-e4bfc3d198cb', '192e7846-82cd-4795-8045-67af51f65511', 'Çınaraltı Saha', 'cinaralti-saha',
  'Tek sahalı, uygun fiyatlı kurgusal halı saha işletmesi.', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85', 'verified', true, true,
  '/media/pitch-3.svg', '/media/pitch-3.svg', '05001110007', '05001110007',
  NULL, NULL, '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', '65ba3855-424e-4494-81a3-4a2c69658a4a', 'Pixel Arena Oyun Salonu', 'pixel-arena-oyun-salonu',
  'PlayStation 5 istasyonları, turnuva ekranı ve bilardo masaları bulunan kurgusal oyun salonu.', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37', 'verified', true, true,
  '/media/game-1.svg', '/media/game-1.svg', '05001110008', '05001110008',
  NULL, 'pixelarena_demo', '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  '76edc326-6e18-4c72-8617-752d55af6684', 'b491da4c-16b3-4eed-822a-795c5f6b308a', 'Konsol Kulübü', 'konsol-kulubu',
  'Grup turnuvalarına özel salon ayıran kurgusal oyun merkezi.', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37', 'verified', true, true,
  '/media/game-2.svg', '/media/game-2.svg', '05001110009', '05001110009',
  NULL, NULL, '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.businesses (
  id, owner_id, name, slug, description, category_id, status, is_public, is_indexable,
  logo_url, cover_url, phone, whatsapp, website, instagram, verified_at, verified_by
) VALUES (
  'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', 'cde5c727-02fa-4367-8a8a-6f858423d78a', 'Şelale Teras Kafe', 'selale-teras-kafe',
  'Teras katında projeksiyonlu maç yayını yapan, doğum günü organizasyonlarına uygun kurgusal kafe.', '40d9edd1-96ab-49c6-81ba-acd1307af37f', 'verified', true, true,
  '/media/cafe-5.svg', '/media/cafe-5.svg', '05001110010', '05001110010',
  NULL, 'selaleteras_demo', '2026-01-15T09:00:00.000Z'::timestamptz,
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60'
);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'de486b9b-63a4-4116-8bdf-1517c8691b59', '36d85939-646e-4c9b-87aa-1b6224254f25', 'Merkez Şube', 'merkez-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Cumhuriyet Mahallesi, Örnek Caddesi No:12, Merkez',
  37.5744, 43.7408, '05001110001', '05001110001', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 0, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 1, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 2, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 3, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 4, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 5, '10:00', '01:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('de486b9b-63a4-4116-8bdf-1517c8691b59', 6, '10:00', '01:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '502d5e17-578f-4354-8a2a-ab9459ba441b', '36d85939-646e-4c9b-87aa-1b6224254f25', 'Yüksekova Şube', 'yuksekova-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44d5292d-0f6d-4b03-877b-3886924d44b6', 'Esentepe Mahallesi, Demo Bulvarı No:44, Yüksekova',
  37.5744, 44.2836, '05001110001', '05001110001', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 0, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 1, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 2, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 3, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 4, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 5, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('502d5e17-578f-4354-8a2a-ab9459ba441b', 6, '10:00', '23:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'f754a54d-6a42-40d2-8330-c44570e8e92b', 'ab2e1f07-5560-4ee4-8ed3-7baf9cbd72d7', 'Bahçe Şube', 'bahce-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Bulak Mahallesi, Örnek Sokak No:3, Merkez',
  37.5751, 43.7395, '05001110002', '05001110002', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 0, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 1, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 2, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 3, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 4, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 5, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('f754a54d-6a42-40d2-8330-c44570e8e92b', 6, '10:00', '23:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'b87d989a-ca2b-4db4-880d-a7281b897d09', 'd362f068-0865-48d3-8e07-bfae8a5e7925', 'Merkez Restoran', 'merkez-restoran',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Pehlivan Mahallesi, Demo Caddesi No:87, Merkez',
  37.5732, 43.7421, '05001110003', '05001110003', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 0, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 1, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 2, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 3, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 4, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 5, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('b87d989a-ca2b-4db4-880d-a7281b897d09', 6, '10:00', '23:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '12d08d92-fb5e-43d3-8e8a-a14461e5275c', 'd362f068-0865-48d3-8e07-bfae8a5e7925', 'Şemdinli Şube', 'semdinli-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44ffdb8d-e2e2-4300-86d2-55c167a71d47', 'Yeni Mahalle, Örnek Caddesi No:9, Şemdinli',
  37.3, 44.5667, '05001110003', '05001110003', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 0, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 1, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 2, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 3, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 4, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 5, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('12d08d92-fb5e-43d3-8e8a-a14461e5275c', 6, '10:00', '23:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '76e1d7b2-4d1a-401b-87a1-81547f11397c', '5409a85e-7b5d-4f34-8060-913c35088cc3', 'Meydan Şube', 'meydan-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Dağgöl Mahallesi, Demo Sokak No:21, Merkez',
  37.5769, 43.74, '05001110004', '05001110004', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 0, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 1, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 2, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 3, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 4, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 5, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('76e1d7b2-4d1a-401b-87a1-81547f11397c', 6, '07:00', '18:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'dda61033-cc97-4417-8482-a9226df7217b', '5409a85e-7b5d-4f34-8060-913c35088cc3', 'Yüksekova Meydan', 'yuksekova-meydan',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44d5292d-0f6d-4b03-877b-3886924d44b6', 'Cumhuriyet Mahallesi, Örnek Caddesi No:5, Yüksekova',
  37.5721, 44.2811, '05001110004', '05001110004', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 0, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 1, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 2, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 3, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 4, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 5, '07:00', '18:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('dda61033-cc97-4417-8482-a9226df7217b', 6, '07:00', '18:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '26f0ebf4-3add-4752-84f7-d57d00461e89', '747440e5-1895-427b-886b-ea554067897b', 'Merkez Tesis', 'merkez-tesis',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Kıran Mahallesi, Spor Caddesi No:2, Merkez',
  37.5701, 43.7445, '05001110005', '05001110005', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 0, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 1, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 2, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 3, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 4, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 5, '09:00', '01:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('26f0ebf4-3add-4752-84f7-d57d00461e89', 6, '09:00', '01:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'd5cdcb47-675a-43d4-85a1-bb15c85ceff2', '747440e5-1895-427b-886b-ea554067897b', 'Yüksekova Tesis', 'yuksekova-tesis',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44d5292d-0f6d-4b03-877b-3886924d44b6', 'Güngör Mahallesi, Demo Caddesi No:60, Yüksekova',
  37.5688, 44.2902, '05001110005', '05001110005', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 0, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 1, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 2, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 3, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 4, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 5, '09:00', '01:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('d5cdcb47-675a-43d4-85a1-bb15c85ceff2', 6, '09:00', '01:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'afde6b76-1c54-4938-8e4b-7ca0a86219fe', '6f0cceda-9b42-411f-82ae-bd2ccfd603f0', 'Yayla Tesisi', 'yayla-tesisi',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44d5292d-0f6d-4b03-877b-3886924d44b6', 'Orman Mahallesi, Örnek Yolu No:14, Yüksekova',
  37.5812, 44.2755, '05001110006', '05001110006', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 0, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 1, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 2, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 3, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 4, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 5, '09:00', '01:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('afde6b76-1c54-4938-8e4b-7ca0a86219fe', 6, '09:00', '01:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  'c32b5e4d-b3d2-4082-8ccb-9d440da23294', 'c4bebe93-f835-4702-879b-e4bfc3d198cb', 'Çınaraltı Saha', 'cinaralti-saha-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '405ff733-f134-470d-8c19-ace5e2f8450b', 'Merkez Mahallesi, Demo Caddesi No:1, Çukurca',
  37.2464, 43.6122, '05001110007', '05001110007', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 0, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 1, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 2, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 3, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 4, '09:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 5, '09:00', '01:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('c32b5e4d-b3d2-4082-8ccb-9d440da23294', 6, '09:00', '01:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '6fc02644-da1a-4a73-8a99-abde0d37befb', 'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', 'Pixel Merkez', 'pixel-merkez',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Medrese Mahallesi, Örnek Sokak No:7, Merkez',
  37.5758, 43.7382, '05001110008', '05001110008', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 0, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 1, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 2, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 3, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 4, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 5, '12:00', '02:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6fc02644-da1a-4a73-8a99-abde0d37befb', 6, '12:00', '02:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '6cd61139-dba7-4d56-82ce-4780a0512bff', 'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', 'Pixel Yüksekova', 'pixel-yuksekova',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44d5292d-0f6d-4b03-877b-3886924d44b6', 'Yeni Mahalle, Demo Bulvarı No:18, Yüksekova',
  37.5734, 44.2848, '05001110008', '05001110008', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 0, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 1, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 2, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 3, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 4, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 5, '12:00', '02:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('6cd61139-dba7-4d56-82ce-4780a0512bff', 6, '12:00', '02:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '4b86fd22-4477-4364-8521-d63d9144fc53', '76edc326-6e18-4c72-8617-752d55af6684', 'Konsol Merkez', 'konsol-merkez',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Biçer Mahallesi, Örnek Caddesi No:33, Merkez',
  37.5715, 43.7369, '05001110009', '05001110009', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 0, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 1, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 2, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 3, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 4, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 5, '12:00', '02:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('4b86fd22-4477-4364-8521-d63d9144fc53', 6, '12:00', '02:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '0db56baf-b171-4859-864a-b1cc8953509a', '76edc326-6e18-4c72-8617-752d55af6684', 'Derecik Şube', 'derecik-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '98d43bc0-f191-4df1-8e55-d99c0fd361d0', 'Merkez Mahallesi, Demo Sokak No:4, Derecik',
  37.2833, 44.35, '05001110009', '05001110009', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 0, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 1, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 2, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 3, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 4, '12:00', '00:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 5, '12:00', '02:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('0db56baf-b171-4859-864a-b1cc8953509a', 6, '12:00', '02:00', false);
INSERT INTO public.business_branches (
  id, business_id, name, slug, city_id, district_id, address, lat, lng, phone, whatsapp, is_active
) VALUES (
  '325f1686-8207-455c-8390-0c904977e957', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', 'Teras Şube', 'teras-sube',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', 'Berçelan Mahallesi, Örnek Caddesi No:56, Merkez',
  37.5779, 43.7433, '05001110010', '05001110010', true
);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 0, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 1, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 2, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 3, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 4, '10:00', '23:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 5, '10:00', '01:00', false);
INSERT INTO public.branch_hours (branch_id, weekday, opens_at, closes_at, is_closed) VALUES ('325f1686-8207-455c-8390-0c904977e957', 6, '10:00', '01:00', false);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('36d85939-646e-4c9b-87aa-1b6224254f25', 'a1c74d64-9253-4d1a-8590-214283bf4113', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('ab2e1f07-5560-4ee4-8ed3-7baf9cbd72d7', '1731c550-d1d2-4c8b-8749-56f5eb2bea55', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('d362f068-0865-48d3-8e07-bfae8a5e7925', '101f52ff-89fd-4050-8204-d7bba8e1c870', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('5409a85e-7b5d-4f34-8060-913c35088cc3', 'c07bfb96-2c3e-4142-8e3b-90928339909e', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('747440e5-1895-427b-886b-ea554067897b', 'cac03dd9-5e29-406b-86c5-2b0b648d4d71', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('6f0cceda-9b42-411f-82ae-bd2ccfd603f0', '54f8b6fc-70a3-4656-87ae-98592f5cde1a', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('c4bebe93-f835-4702-879b-e4bfc3d198cb', '192e7846-82cd-4795-8045-67af51f65511', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', '65ba3855-424e-4494-81a3-4a2c69658a4a', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('76edc326-6e18-4c72-8617-752d55af6684', 'b491da4c-16b3-4eed-822a-795c5f6b308a', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', 'cde5c727-02fa-4367-8a8a-6f858423d78a', 'owner', NULL);
INSERT INTO public.business_members (business_id, user_id, role, invited_by) VALUES ('36d85939-646e-4c9b-87aa-1b6224254f25', '1d7f466f-5b7b-4716-835b-ecfffeb0df8a', 'staff', 'a1c74d64-9253-4d1a-8590-214283bf4113');
INSERT INTO public.business_applications (
  id, applicant_id, business_name, contact_name, phone, email, address,
  city_id, district_id, category_id, tax_info, instagram, website, logo_url,
  status, review_note, reviewed_by, reviewed_at, created_at
) VALUES (
  'e00fe69b-436f-47ef-8964-5941841ce2a5', '687874aa-10d7-4b7f-8f1e-eb83eb5bbbd3', 'Vadi Kahve Atölyesi',
  'Aday İşletmeci', '05001119999', 'basvuru@ornek.test', 'Yeni Mahalle, Örnek Caddesi No:2, Yüksekova',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '44d5292d-0f6d-4b03-877b-3886924d44b6', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  'DEMO-VKN-0000000000', 'vadikahve_demo', NULL, NULL,
  'pending', NULL,
  NULL, NULL, '2026-02-27T11:20:00.000Z'::timestamptz
);
INSERT INTO public.business_applications (
  id, applicant_id, business_name, contact_name, phone, email, address,
  city_id, district_id, category_id, tax_info, instagram, website, logo_url,
  status, review_note, reviewed_by, reviewed_at, created_at
) VALUES (
  'e2efc514-ded9-45c1-8a64-7cfad24436f0', 'a1c74d64-9253-4d1a-8590-214283bf4113', 'Kuzey Işığı Kahve Evi',
  'Serkan Aydın', '05001110001', 'isletme01@ornek.test', 'Cumhuriyet Mahallesi, Örnek Caddesi No:12, Merkez',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  'DEMO-VKN-1111111111', 'kuzeyisigi_demo', NULL, '/media/cafe-1.svg',
  'approved', 'Belgeler eksiksiz.',
  'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', '2026-01-15T09:00:00.000Z'::timestamptz, '2026-01-12T09:00:00.000Z'::timestamptz
);

-- ==========================================================================
-- 4. Paketler
-- ==========================================================================

INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '5951cdfb-ea1b-45ac-8957-56a20a30632d', '36d85939-646e-4c9b-87aa-1b6224254f25', 'de486b9b-63a4-4116-8bdf-1517c8691b59', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '4–6 Kişilik Kahve ve Tatlı Paketi', 'kuzey-isigi-kahve-evi-4-6-kisilik-kahve-ve-tatli-paketi', 'Arkadaş grubun için sıcak içecek ve tatlı tabağı. Ayrı masa ayrılır.',
  4, 6, 'per_person', 18000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 78
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'Kişi başı 2 sıcak içecek', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'Paylaşımlık tatlı tabağı', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'Sınırsız su', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'Ayrı masa', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', '/media/cafe-1.svg', '4–6 Kişilik Kahve ve Tatlı Paketi — Kuzey Işığı Kahve Evi (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 0, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 1, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 2, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 3, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 4, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 5, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 6, '12:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'quiet');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'wifi');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('5951cdfb-ea1b-45ac-8957-56a20a30632d', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '59f0488c-3f41-4e2d-8401-bd10cd8f2507', '36d85939-646e-4c9b-87aa-1b6224254f25', 'de486b9b-63a4-4116-8bdf-1517c8691b59', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '6–10 Kişilik Akşam Yemeği Paketi', 'kuzey-isigi-kahve-evi-6-10-kisilik-aksam-yemegi-paketi', 'Ana yemek, meze ve tatlıdan oluşan grup menüsü. Ayrı salonda servis edilir.',
  6, 10, 'per_person', 32000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 92
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'Kişi başı ana yemek', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'Ortaya 4 çeşit meze', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'Salata', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'Tatlı', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'İçecek', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', '/media/cafe-1.svg', '6–10 Kişilik Akşam Yemeği Paketi — Kuzey Işığı Kahve Evi (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 0, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 1, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 2, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 3, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 4, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 5, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 6, '18:00', '23:30');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'quiet');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'vegetarian');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'parking');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('59f0488c-3f41-4e2d-8401-bd10cd8f2507', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '3caad383-4ead-4b15-87ff-97c7531cc069', '36d85939-646e-4c9b-87aa-1b6224254f25', 'de486b9b-63a4-4116-8bdf-1517c8691b59', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '8–14 Kişilik Doğum Günü Paketi', 'kuzey-isigi-kahve-evi-8-14-kisilik-dogum-gunu-paketi', 'Süsleme, pasta ve grup menüsü dahil doğum günü organizasyonu.',
  8, 14, 'total', 380000, 180,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 85
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'Masa süslemesi', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', '3 kg pasta', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'Kişi başı içecek', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'Atıştırmalık tabağı', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'Müzik sistemi', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', '/media/cafe-1.svg', '8–14 Kişilik Doğum Günü Paketi — Kuzey Işığı Kahve Evi (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 4, '17:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 5, '17:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 6, '17:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 0, '17:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'birthday_setup');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'live_music');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('3caad383-4ead-4b15-87ff-97c7531cc069', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'f2edeb38-d170-41ed-8942-6c666f63f43a', '36d85939-646e-4c9b-87aa-1b6224254f25', '502d5e17-578f-4354-8a2a-ab9459ba441b', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '4–8 Kişilik Kahvaltı Paketi', 'kuzey-isigi-kahve-evi-4-8-kisilik-kahvalti-paketi', 'Serpme kahvaltı, sınırsız çay. Hafta içi ve hafta sonu geçerli.',
  4, 8, 'per_person', 22000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 71
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 'Serpme kahvaltı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 'Sınırsız çay', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 'Taze sıkılmış portakal suyu', NULL, 3);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', '/media/cafe-1.svg', '4–8 Kişilik Kahvaltı Paketi — Kuzey Işığı Kahve Evi (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 0, '08:00', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 1, '08:00', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 2, '08:00', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 3, '08:00', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 4, '08:00', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 5, '08:00', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 6, '08:00', '13:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 'outdoor');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 'wifi');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f2edeb38-d170-41ed-8942-6c666f63f43a', 'vegetarian');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'ab2e1f07-5560-4ee4-8ed3-7baf9cbd72d7', 'f754a54d-6a42-40d2-8330-c44570e8e92b', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '5–9 Kişilik Bahçe Çay Keyfi', 'semaver-bahce-5-9-kisilik-bahce-cay-keyfi', 'Bahçe masasında semaver çay, kuru pasta ve meyve tabağı.',
  5, 9, 'per_person', 12000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 64
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'Semaver çay (sınırsız)', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'Kuru pasta tabağı', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'Mevsim meyve tabağı', NULL, 3);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', '/media/cafe-2.svg', '5–9 Kişilik Bahçe Çay Keyfi — Semaver Bahçe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 0, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 1, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 2, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 3, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 4, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 5, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 6, '11:00', '22:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'outdoor');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'quiet');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('513eeda4-7de2-41d8-87e7-fd8cd7cecb29', 'accessible');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '9646674d-ef74-454d-8d79-50dccc1bc78e', 'ab2e1f07-5560-4ee4-8ed3-7baf9cbd72d7', 'f754a54d-6a42-40d2-8330-c44570e8e92b', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '10–16 Kişilik Bahçe Grup Menüsü', 'semaver-bahce-10-16-kisilik-bahce-grup-menusu', 'Kalabalık gruplar için bahçede uzun masa, ortak menü.',
  10, 16, 'per_person', 26000, 180,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 74
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'Ortaya mezeler', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'Izgara çeşitleri', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'Salata', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'Tatlı', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'Sınırsız çay', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', '/media/cafe-2.svg', '10–16 Kişilik Bahçe Grup Menüsü — Semaver Bahçe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 4, '17:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 5, '17:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 6, '17:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 0, '17:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'outdoor');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'vegetarian');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9646674d-ef74-454d-8d79-50dccc1bc78e', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '1affeb68-80f7-4092-8322-e5b73750c0b3', 'ab2e1f07-5560-4ee4-8ed3-7baf9cbd72d7', 'f754a54d-6a42-40d2-8330-c44570e8e92b', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '2–4 Kişilik Kahve Molası', 'semaver-bahce-2-4-kisilik-kahve-molasi', 'Küçük gruplar için hızlı ve uygun fiyatlı kahve molası.',
  2, 4, 'per_person', 9000, 60,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 55
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 'Kişi başı 1 sıcak içecek', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 'Kurabiye', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', '/media/cafe-2.svg', '2–4 Kişilik Kahve Molası — Semaver Bahçe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 0, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 1, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 2, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 3, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 4, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 5, '11:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 6, '11:00', '22:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 'quiet');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('1affeb68-80f7-4092-8322-e5b73750c0b3', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'd362f068-0865-48d3-8e07-bfae8a5e7925', 'b87d989a-ca2b-4db4-880d-a7281b897d09', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '6–12 Kişilik Yöresel Sofra', 'zirve-sofrasi-6-12-kisilik-yoresel-sofra', 'Yöresel tatlardan oluşan paylaşımlı sofra. Uzun masa ayrılır.',
  6, 12, 'per_person', 29000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 88
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', '4 çeşit yöresel meze', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'Ana yemek', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'Pilav', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'Tatlı', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'Ayran', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', '/media/cafe-3.svg', '6–12 Kişilik Yöresel Sofra — Zirve Sofrası (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 0, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 1, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 2, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 3, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 4, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 5, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 6, '12:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'parking');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', 'accessible');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'd362f068-0865-48d3-8e07-bfae8a5e7925', 'b87d989a-ca2b-4db4-880d-a7281b897d09', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '12–20 Kişilik Kutlama Menüsü', 'zirve-sofrasi-12-20-kisilik-kutlama-menusu', 'Büyük gruplar için sabit fiyatlı kutlama menüsü.',
  12, 20, 'total', 620000, 210,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 69
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'Ortaya mezeler', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'Karışık ızgara', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'Tatlı', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'İçecek', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'Ayrı salon', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', '/media/cafe-3.svg', '12–20 Kişilik Kutlama Menüsü — Zirve Sofrası (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 5, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 6, '18:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 0, '18:00', '23:30');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'birthday_setup');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('516b8cb8-c2f8-45f4-804a-48c4da1cc260', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '9164fdd2-87b4-4810-8ad2-dd284f249b24', 'd362f068-0865-48d3-8e07-bfae8a5e7925', '12d08d92-fb5e-43d3-8e8a-a14461e5275c', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '4–8 Kişilik Öğle Menüsü', 'zirve-sofrasi-4-8-kisilik-ogle-menusu', 'Öğle saatlerinde uygun fiyatlı grup menüsü.',
  4, 8, 'per_person', 17000, 90,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 48
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 'Çorba', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 'Ana yemek', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 'Pilav', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 'İçecek', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', '/media/cafe-3.svg', '4–8 Kişilik Öğle Menüsü — Zirve Sofrası (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 0, '11:30', '15:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 1, '11:30', '15:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 2, '11:30', '15:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 3, '11:30', '15:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 4, '11:30', '15:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 5, '11:30', '15:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 6, '11:30', '15:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 'parking');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9164fdd2-87b4-4810-8ad2-dd284f249b24', 'accessible');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'e638cf80-5d94-4064-8585-b847b4fb259b', 'd362f068-0865-48d3-8e07-bfae8a5e7925', '12d08d92-fb5e-43d3-8e8a-a14461e5275c', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '8–14 Kişilik Akşam Sofrası', 'zirve-sofrasi-8-14-kisilik-aksam-sofrasi', 'Şemdinli şubesinde akşam grup sofrası.',
  8, 14, 'per_person', 25000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 52
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 'Mezeler', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 'Ana yemek', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 'Tatlı', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 'İçecek', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', '/media/cafe-3.svg', '8–14 Kişilik Akşam Sofrası — Zirve Sofrası (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 3, '18:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 4, '18:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 5, '18:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 6, '18:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('e638cf80-5d94-4064-8585-b847b4fb259b', 'quiet');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'd7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', '5409a85e-7b5d-4f34-8060-913c35088cc3', '76e1d7b2-4d1a-401b-87a1-81547f11397c', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '4–7 Kişilik Serpme Kahvaltı', 'meydan-kahvalti-salonu-4-7-kisilik-serpme-kahvalti', 'Klasik serpme kahvaltı, sınırsız çay ile.',
  4, 7, 'per_person', 20000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 81
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 'Serpme kahvaltı (18 çeşit)', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 'Sınırsız çay', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 'Sıcak ekmek', NULL, 3);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', '/media/cafe-4.svg', '4–7 Kişilik Serpme Kahvaltı — Meydan Kahvaltı Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 0, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 1, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 2, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 3, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 4, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 5, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 6, '07:30', '13:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 'vegetarian');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 'wifi');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d7fe1fe3-03fb-4076-864b-7cfcc3dc04f5', 'accessible');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', '5409a85e-7b5d-4f34-8060-913c35088cc3', '76e1d7b2-4d1a-401b-87a1-81547f11397c', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '8–15 Kişilik Grup Brunch', 'meydan-kahvalti-salonu-8-15-kisilik-grup-brunch', 'Kalabalık gruplar için hafta sonu brunch düzeni.',
  8, 15, 'per_person', 27000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 76
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'Serpme kahvaltı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'Sıcak menemen', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'Sınırsız çay', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'Tatlı tabağı', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'Uzun masa', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', '/media/cafe-4.svg', '8–15 Kişilik Grup Brunch — Meydan Kahvaltı Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 6, '08:00', '13:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 0, '08:00', '13:30');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'vegetarian');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('9db6c885-0dde-4d50-8ef6-1e0ffc6955f9', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'ef85834d-07ff-4586-8274-a3e5f29115c4', '5409a85e-7b5d-4f34-8060-913c35088cc3', 'dda61033-cc97-4417-8482-a9226df7217b', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '5–10 Kişilik Yüksekova Kahvaltı', 'meydan-kahvalti-salonu-5-10-kisilik-yuksekova-kahvalti', 'Yüksekova şubesinde grup kahvaltısı.',
  5, 10, 'per_person', 19000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 58
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 'Serpme kahvaltı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 'Sınırsız çay', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', '/media/cafe-4.svg', '5–10 Kişilik Yüksekova Kahvaltı — Meydan Kahvaltı Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 0, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 1, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 2, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 3, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 4, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 5, '07:30', '13:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 6, '07:30', '13:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 'vegetarian');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('ef85834d-07ff-4586-8274-a3e5f29115c4', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '6397e648-87b0-4148-85b6-cc4f9223481b', '747440e5-1895-427b-886b-ea554067897b', '26f0ebf4-3add-4752-84f7-d57d00461e89', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '10–14 Kişilik Halı Saha (1 Saat)', 'gol-kralligi-hali-saha-10-14-kisilik-hali-saha-1-saat', 'Kapalı sahada 1 saatlik kiralama. Duş ve soyunma odası dahil.',
  10, 14, 'total', 90000, 60,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 95
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', '1 saat kapalı saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'Soyunma odası', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'Duş', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'Su', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', '/media/pitch-1.svg', '10–14 Kişilik Halı Saha (1 Saat) — Gol Krallığı Halı Saha (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 0, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 1, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 2, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 3, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 4, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 5, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 6, '09:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'indoor_pitch');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'shower');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'night_lighting');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6397e648-87b0-4148-85b6-cc4f9223481b', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'd123019d-f3d2-4511-86da-77398b09d266', '747440e5-1895-427b-886b-ea554067897b', '26f0ebf4-3add-4752-84f7-d57d00461e89', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '10–14 Kişilik Halı Saha + Forma (1.5 Saat)', 'gol-kralligi-hali-saha-10-14-kisilik-hali-saha-forma-1-5-saat', 'Forma, top ve hakem dahil uzun süreli maç paketi.',
  10, 14, 'total', 160000, 90,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 87
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', '1,5 saat kapalı saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'Forma kiralama', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'Maç topu', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'Hakem', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'Duş', NULL, 5);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'Su', NULL, 6);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', '/media/pitch-1.svg', '10–14 Kişilik Halı Saha + Forma (1.5 Saat) — Gol Krallığı Halı Saha (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 0, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 1, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 2, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 3, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 4, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 5, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 6, '09:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'indoor_pitch');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'shower');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'equipment');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('d123019d-f3d2-4511-86da-77398b09d266', 'night_lighting');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', '747440e5-1895-427b-886b-ea554067897b', '26f0ebf4-3add-4752-84f7-d57d00461e89', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '16–22 Kişilik Turnuva Paketi', 'gol-kralligi-hali-saha-16-22-kisilik-turnuva-paketi', 'İki takımdan fazla grup için 3 saatlik turnuva düzeni.',
  16, 22, 'total', 420000, 180,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 62
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', '3 saat saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'Fikstür düzeni', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'Hakem', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'Forma', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'Su ve meyve', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', '/media/pitch-1.svg', '16–22 Kişilik Turnuva Paketi — Gol Krallığı Halı Saha (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 6, '10:00', '20:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 0, '10:00', '20:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'indoor_pitch');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'shower');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('a6c0e386-8d02-4a6f-8049-fafaa9a70b1e', 'equipment');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'ed42de2b-385b-4046-8f61-13c0272c681f', '747440e5-1895-427b-886b-ea554067897b', 'd5cdcb47-675a-43d4-85a1-bb15c85ceff2', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '10–14 Kişilik Yüksekova Saha (1 Saat)', 'gol-kralligi-hali-saha-10-14-kisilik-yuksekova-saha-1-saat', 'Yüksekova tesisinde açık sahada 1 saatlik kiralama.',
  10, 14, 'total', 75000, 60,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 73
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', '1 saat açık saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 'Soyunma odası', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 'Su', NULL, 3);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', '/media/pitch-1.svg', '10–14 Kişilik Yüksekova Saha (1 Saat) — Gol Krallığı Halı Saha (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 0, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 1, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 2, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 3, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 4, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 5, '09:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 6, '09:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 'shower');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 'night_lighting');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('ed42de2b-385b-4046-8f61-13c0272c681f', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'a53cd7f3-3d92-42f4-838d-4b34f0e537f7', '6f0cceda-9b42-411f-82ae-bd2ccfd603f0', 'afde6b76-1c54-4938-8e4b-7ca0a86219fe', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '12–16 Kişilik Akşam Maçı', 'yayla-spor-tesisleri-12-16-kisilik-aksam-maci', 'Akşam saatlerinde aydınlatmalı sahada maç paketi.',
  12, 16, 'total', 110000, 90,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 80
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', '1,5 saat saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 'Gece aydınlatması', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 'Soyunma odası', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 'Su', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', '/media/pitch-2.svg', '12–16 Kişilik Akşam Maçı — Yayla Spor Tesisleri (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 0, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 1, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 2, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 3, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 4, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 5, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 6, '17:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 'night_lighting');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 'shower');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('a53cd7f3-3d92-42f4-838d-4b34f0e537f7', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '4064594c-f83b-4c5b-8305-6f7c615d351c', '6f0cceda-9b42-411f-82ae-bd2ccfd603f0', 'afde6b76-1c54-4938-8e4b-7ca0a86219fe', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '8–12 Kişilik Hafta İçi Saha', 'yayla-spor-tesisleri-8-12-kisilik-hafta-i-ci-saha', 'Hafta içi gündüz saatlerinde indirimli saha kiralama.',
  8, 12, 'total', 60000, 60,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 45
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', '1 saat saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 'Soyunma odası', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', '/media/pitch-2.svg', '8–12 Kişilik Hafta İçi Saha — Yayla Spor Tesisleri (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 1, '09:00', '17:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 2, '09:00', '17:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 3, '09:00', '17:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 4, '09:00', '17:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 5, '09:00', '17:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 'shower');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('4064594c-f83b-4c5b-8305-6f7c615d351c', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'f98318a9-bf18-4386-8582-5f636d07c379', 'c4bebe93-f835-4702-879b-e4bfc3d198cb', 'c32b5e4d-b3d2-4082-8ccb-9d440da23294', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '10–14 Kişilik Çukurca Saha', 'cinaralti-saha-10-14-kisilik-cukurca-saha', 'Çukurca’da tek sahalı tesiste 1 saatlik kiralama.',
  10, 14, 'total', 65000, 60,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 41
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', '1 saat saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 'Soyunma odası', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 'Su', NULL, 3);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', '/media/pitch-3.svg', '10–14 Kişilik Çukurca Saha — Çınaraltı Saha (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 0, '10:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 1, '10:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 2, '10:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 3, '10:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 4, '10:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 5, '10:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 6, '10:00', '22:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 'night_lighting');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f98318a9-bf18-4386-8582-5f636d07c379', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 'c4bebe93-f835-4702-879b-e4bfc3d198cb', 'c32b5e4d-b3d2-4082-8ccb-9d440da23294', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85',
  '10–14 Kişilik Saha + Çay Molası', 'cinaralti-saha-10-14-kisilik-saha-cay-molasi', 'Maç sonrası çay ve simit ikramı dahil paket.',
  10, 14, 'total', 88000, 90,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 50
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', '1 saat saha', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 'Maç sonrası çay', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 'Simit ikramı', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 'Soyunma odası', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', '/media/pitch-3.svg', '10–14 Kişilik Saha + Çay Molası — Çınaraltı Saha (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 5, '14:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 6, '14:00', '22:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 0, '14:00', '22:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 'night_lighting');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('e885c334-ccdb-495f-80cf-3a7ddc1c93fe', 'parking');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', '6fc02644-da1a-4a73-8a99-abde0d37befb', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '4–8 Kişilik PlayStation Turnuvası', 'pixel-arena-oyun-salonu-4-8-kisilik-playstation-turnuvasi', 'PS5 istasyonlarında 3 saatlik turnuva düzeni.',
  4, 8, 'per_person', 15000, 180,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 90
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', '3 saat PS5 kullanımı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'Turnuva fikstürü', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'Kişi başı içecek', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'Cips ikramı', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', '/media/game-1.svg', '4–8 Kişilik PlayStation Turnuvası — Pixel Arena Oyun Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 0, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 1, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 2, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 3, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 4, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 5, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 6, '12:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'ps5');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'tournament');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f64a0a7e-dcc3-4522-8622-6cea2da519aa', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '53ad4131-f499-4ca3-8286-ed056d508216', 'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', '6fc02644-da1a-4a73-8a99-abde0d37befb', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '2–4 Kişilik Oyun Saati', 'pixel-arena-oyun-salonu-2-4-kisilik-oyun-saati', 'Küçük gruplar için 2 saatlik konsol kiralama.',
  2, 4, 'per_person', 9000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 66
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', '2 saat PS5 kullanımı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 'Kişi başı içecek', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', '/media/game-1.svg', '2–4 Kişilik Oyun Saati — Pixel Arena Oyun Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 0, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 1, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 2, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 3, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 4, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 5, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 6, '12:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 'ps5');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('53ad4131-f499-4ca3-8286-ed056d508216', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', '6fc02644-da1a-4a73-8a99-abde0d37befb', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '6–12 Kişilik Bilardo & Konsol Paketi', 'pixel-arena-oyun-salonu-6-12-kisilik-bilardo-konsol-paketi', 'Bilardo masası ve konsol istasyonlarının birlikte kullanımı.',
  6, 12, 'total', 240000, 180,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 79
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', '3 saat bilardo masası', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', '3 saat konsol', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 'Sınırsız çay', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 'Atıştırmalık', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', '/media/game-1.svg', '6–12 Kişilik Bilardo & Konsol Paketi — Pixel Arena Oyun Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 4, '14:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 5, '14:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 6, '14:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 0, '14:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 'ps5');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 'billiards');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('6981c1fa-1ec7-4d82-87ba-9543ba16dc42', 'tournament');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'f37082c4-dc9d-408f-8abb-701171d33133', 'b6ae3a6c-090a-4d30-8bea-9d7c29d0691b', '6cd61139-dba7-4d56-82ce-4780a0512bff', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '4–8 Kişilik Yüksekova Oyun Paketi', 'pixel-arena-oyun-salonu-4-8-kisilik-yuksekova-oyun-paketi', 'Yüksekova şubesinde grup konsol paketi.',
  4, 8, 'per_person', 13000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 57
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', '2,5 saat PS5 kullanımı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 'Kişi başı içecek', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', '/media/game-1.svg', '4–8 Kişilik Yüksekova Oyun Paketi — Pixel Arena Oyun Salonu (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 0, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 1, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 2, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 3, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 4, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 5, '12:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 6, '12:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 'ps5');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('f37082c4-dc9d-408f-8abb-701171d33133', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'be08dd64-209c-4fbe-8950-d089e6d52761', '76edc326-6e18-4c72-8617-752d55af6684', '4b86fd22-4477-4364-8521-d63d9144fc53', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '8–16 Kişilik Özel Salon Turnuvası', 'konsol-kulubu-8-16-kisilik-ozel-salon-turnuvasi', 'Gruba özel salonda 4 saatlik turnuva.',
  8, 16, 'total', 480000, 240,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 72
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'Özel salon', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', '4 saat konsol kullanımı', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'Projeksiyon', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'İçecek', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'Atıştırmalık', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', '/media/game-2.svg', '8–16 Kişilik Özel Salon Turnuvası — Konsol Kulübü (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 5, '13:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 6, '13:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 0, '13:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'ps5');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'tournament');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('be08dd64-209c-4fbe-8950-d089e6d52761', 'private_room');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '584aee77-6d00-4f30-8f9f-8cc834f248bf', '76edc326-6e18-4c72-8617-752d55af6684', '4b86fd22-4477-4364-8521-d63d9144fc53', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '4–6 Kişilik Hafta İçi Konsol', 'konsol-kulubu-4-6-kisilik-hafta-i-ci-konsol', 'Hafta içi indirimli konsol paketi.',
  4, 6, 'per_person', 10000, 120,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 44
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', '2 saat konsol kullanımı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 'Çay ikramı', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', '/media/game-2.svg', '4–6 Kişilik Hafta İçi Konsol — Konsol Kulübü (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 1, '12:00', '20:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 2, '12:00', '20:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 3, '12:00', '20:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 4, '12:00', '20:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 'ps5');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('584aee77-6d00-4f30-8f9f-8cc834f248bf', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '916e0952-d758-43f1-81db-40fd479b32cb', '76edc326-6e18-4c72-8617-752d55af6684', '0db56baf-b171-4859-864a-b1cc8953509a', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37',
  '4–10 Kişilik Derecik Oyun Paketi', 'konsol-kulubu-4-10-kisilik-derecik-oyun-paketi', 'Derecik şubesinde grup oyun paketi.',
  4, 10, 'per_person', 11000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 38
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', '2,5 saat konsol kullanımı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 'İçecek', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', '/media/game-2.svg', '4–10 Kişilik Derecik Oyun Paketi — Konsol Kulübü (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 0, '13:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 1, '13:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 2, '13:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 3, '13:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 4, '13:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 5, '13:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 6, '13:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('916e0952-d758-43f1-81db-40fd479b32cb', 'ps5');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '366b0bd2-ac3c-4571-80db-7b84c2194053', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', '325f1686-8207-455c-8390-0c904977e957', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '6–12 Kişilik Maç Yayını Paketi', 'selale-teras-kafe-6-12-kisilik-mac-yayini-paketi', 'Terasta projeksiyonla maç izleme, atıştırmalık ve içecek dahil.',
  6, 12, 'per_person', 16000, 150,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 84
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'Projeksiyonla maç yayını', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'Kişi başı içecek', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'Ortaya atıştırmalık', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'Teras masası', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', '/media/cafe-5.svg', '6–12 Kişilik Maç Yayını Paketi — Şelale Teras Kafe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 0, '16:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 1, '16:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 2, '16:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 3, '16:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 4, '16:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 5, '16:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 6, '16:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'projector');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'outdoor');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'live_music');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('366b0bd2-ac3c-4571-80db-7b84c2194053', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '78d83523-0452-4b6f-8abc-6eee7c663ff7', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', '325f1686-8207-455c-8390-0c904977e957', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '10–18 Kişilik Teras Doğum Günü', 'selale-teras-kafe-10-18-kisilik-teras-dogum-gunu', 'Teras katında süsleme ve pasta dahil doğum günü paketi.',
  10, 18, 'total', 520000, 180,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 77
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'Teras katı özel kullanım', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'Süsleme', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', '4 kg pasta', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'İçecek', NULL, 4);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'Müzik sistemi', NULL, 5);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', '/media/cafe-5.svg', '10–18 Kişilik Teras Doğum Günü — Şelale Teras Kafe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 4, '16:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 5, '16:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 6, '16:00', '23:30');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 0, '16:00', '23:30');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'birthday_setup');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'outdoor');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'live_music');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('78d83523-0452-4b6f-8abc-6eee7c663ff7', 'private_room');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  '0ec8b193-8237-4686-8d1a-0335f85dc910', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', '325f1686-8207-455c-8390-0c904977e957', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '4–8 Kişilik Teras Kahve', 'selale-teras-kafe-4-8-kisilik-teras-kahve', 'Manzaralı terasta kahve ve tatlı.',
  4, 8, 'per_person', 14000, 90,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', true, true, true, 68
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 'Kişi başı sıcak içecek', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 'Paylaşımlık tatlı', NULL, 2);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', '/media/cafe-5.svg', '4–8 Kişilik Teras Kahve — Şelale Teras Kafe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 0, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 1, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 2, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 3, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 4, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 5, '12:00', '23:00');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 6, '12:00', '23:00');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 'outdoor');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 'quiet');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('0ec8b193-8237-4686-8d1a-0335f85dc910', 'wifi');
INSERT INTO public.packages (
  id, business_id, branch_id, category_id, name, slug, description,
  min_people, max_people, pricing_model, price_amount, duration_minutes,
  reservation_terms, cancellation_terms, is_active, is_public, is_indexable, popularity
) VALUES (
  'b72bac39-db04-40c3-82f1-07aea007d5da', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', '325f1686-8207-455c-8390-0c904977e957', '40d9edd1-96ab-49c6-81ba-acd1307af37f',
  '20–30 Kişilik Kapalı Grup Etkinliği', 'selale-teras-kafe-20-30-kisilik-kapali-grup-etkinligi', 'Tüm mekânın gruba özel kullanımı. Şu anda rezervasyona kapalı.',
  20, 30, 'total', 950000, 240,
  'Rezervasyon talebi işletme onayından sonra kesinleşir. Onay genellikle birkaç saat içinde verilir.', 'Rezervasyon saatinden 3 saat öncesine kadar ücretsiz iptal edilebilir.', false, true, true, 30
);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'Mekânın tamamı', NULL, 1);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'Süsleme', NULL, 2);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'Menü', NULL, 3);
INSERT INTO public.package_items (package_id, label, detail, sort_order) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'Müzik sistemi', NULL, 4);
INSERT INTO public.package_images (package_id, url, alt, width, height, sort_order) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', '/media/cafe-5.svg', '20–30 Kişilik Kapalı Grup Etkinliği — Şelale Teras Kafe (temsilî görsel)', 1200, 800, 1);
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 5, '17:00', '23:59');
INSERT INTO public.package_availability (package_id, weekday, start_time, end_time) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 6, '17:00', '23:59');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'private_room');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'birthday_setup');
INSERT INTO public.package_preferences (package_id, preference_key) VALUES ('b72bac39-db04-40c3-82f1-07aea007d5da', 'live_music');

-- ==========================================================================
-- 5. Planlar, katılımcılar, davetler, oylar
-- ==========================================================================

INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  '82bfd11c-8abf-4609-8464-381b396ec71c', '362776d3-9839-4100-8203-423551604483', 'Cuma Akşamı Buluşması', 'voting',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a',
  '2026-03-07', '20:00', '23:00',
  true, 8, 6, 10,
  'per_person', 30000, 240000, 'Ayrı salon olursa süper olur.',
  '2026-02-28T09:00:00.000Z'::timestamptz, '2026-03-04T21:00:00.000Z'::timestamptz,
  NULL,
  NULL, '2026-02-28T09:00:00.000Z'::timestamptz, '2026-02-28T09:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('82bfd11c-8abf-4609-8464-381b396ec71c', '40d9edd1-96ab-49c6-81ba-acd1307af37f');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('82bfd11c-8abf-4609-8464-381b396ec71c', 'private_room');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('82bfd11c-8abf-4609-8464-381b396ec71c', 'quiet');
INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '362776d3-9839-4100-8203-423551604483', 'Halı Saha Maçı', 'reservation_pending',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a',
  '2026-03-10', '21:00', '22:00',
  false, 12, 10, 14,
  'total', 8500, 100000, NULL,
  '2026-02-24T14:30:00.000Z'::timestamptz, '2026-02-27T20:00:00.000Z'::timestamptz,
  '6397e648-87b0-4148-85b6-cc4f9223481b',
  NULL, '2026-02-24T14:30:00.000Z'::timestamptz, '2026-03-01T10:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', 'f479618a-dedf-4dd3-85a8-ff2ae024fa85');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', 'indoor_pitch');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', 'shower');
INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  '183981f7-8f80-4909-86fe-cc0ca9949e4e', '729f9b2e-9179-488f-8e7a-ea73df0658c4', 'Doğum Günü Sürprizi', 'reservation_confirmed',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a',
  '2026-03-14', '19:00', '22:00',
  false, 12, 10, 14,
  'total', 33000, 400000, 'Pasta sürpriz olacak, sessiz kalalım.',
  '2026-02-22T12:00:00.000Z'::timestamptz, '2026-02-25T12:00:00.000Z'::timestamptz,
  '3caad383-4ead-4b15-87ff-97c7531cc069',
  NULL, '2026-02-20T12:00:00.000Z'::timestamptz, '2026-02-26T16:20:00.000Z'::timestamptz
);
INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('183981f7-8f80-4909-86fe-cc0ca9949e4e', '40d9edd1-96ab-49c6-81ba-acd1307af37f');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('183981f7-8f80-4909-86fe-cc0ca9949e4e', 'birthday_setup');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('183981f7-8f80-4909-86fe-cc0ca9949e4e', 'private_room');
INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  '114496ef-f94e-4bc5-82f1-42ae80ff5a39', 'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', 'Oyun Gecesi', 'awaiting_participants',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a',
  '2026-03-05', '19:00', '22:00',
  true, 6, 4, 8,
  'per_person', 16000, 96000, NULL,
  NULL, NULL,
  NULL,
  NULL, '2026-03-01T18:45:00.000Z'::timestamptz, '2026-03-01T18:45:00.000Z'::timestamptz
);
INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('114496ef-f94e-4bc5-82f1-42ae80ff5a39', 'c3af3857-8ca1-41cb-8d13-8550a8d53d37');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('114496ef-f94e-4bc5-82f1-42ae80ff5a39', 'ps5');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('114496ef-f94e-4bc5-82f1-42ae80ff5a39', 'tournament');
INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  'f568a35c-8556-406b-8881-ad06b7f66044', '362776d3-9839-4100-8203-423551604483', 'Hafta Sonu Kahvaltısı', 'draft',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a',
  '2026-03-11', '10:00', '12:30',
  true, 6, 4, 8,
  'per_person', 22000, 132000, NULL,
  NULL, NULL,
  NULL,
  NULL, '2026-03-01T22:10:00.000Z'::timestamptz, '2026-03-01T22:10:00.000Z'::timestamptz
);
INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('f568a35c-8556-406b-8881-ad06b7f66044', '40d9edd1-96ab-49c6-81ba-acd1307af37f');
INSERT INTO public.plans (
  id, owner_id, name, status, city_id, district_id, event_date, start_time, end_time,
  is_time_flexible, estimated_people, min_people, max_people, budget_mode,
  budget_per_person, budget_total, note, voting_starts_at, voting_ends_at,
  winning_package_id, cancelled_reason, created_at, updated_at
) VALUES (
  '0664b051-988c-488b-8a47-0d7d7e172410', '362776d3-9839-4100-8203-423551604483', 'Geçen Ayki Maç Gecesi', 'completed',
  '5b9d5bdf-57a9-49c0-896d-7fc077f1f126', '83873d94-3a2b-4a6f-8408-bbc98c8b266a',
  '2026-02-10', '21:00', '23:30',
  false, 9, 6, 12,
  'per_person', 18000, 162000, NULL,
  '2026-02-05T12:00:00.000Z'::timestamptz, '2026-02-08T12:00:00.000Z'::timestamptz,
  '366b0bd2-ac3c-4571-80db-7b84c2194053',
  NULL, '2026-02-02T12:00:00.000Z'::timestamptz, '2026-02-11T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_categories (plan_id, category_id) VALUES ('0664b051-988c-488b-8a47-0d7d7e172410', '40d9edd1-96ab-49c6-81ba-acd1307af37f');
INSERT INTO public.plan_preferences (plan_id, preference_key) VALUES ('0664b051-988c-488b-8a47-0d7d7e172410', 'projector');
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '2b655ee8-776d-4a74-8750-0e15fe791153', '82bfd11c-8abf-4609-8464-381b396ec71c',
  '362776d3-9839-4100-8203-423551604483', NULL,
  'Elif Demir', 'going', true, '2026-02-28T09:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'db7e480c-23a5-4c51-8c88-da4b61a8d445', '82bfd11c-8abf-4609-8464-381b396ec71c',
  '729f9b2e-9179-488f-8e7a-ea73df0658c4', NULL,
  'Kerem Aslan', 'going', false, '2026-02-28T10:15:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '8f8ff069-1151-49cd-8b5a-3b009f864b32', '82bfd11c-8abf-4609-8464-381b396ec71c',
  'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', NULL,
  'Zeynep Kaya', 'going', false, '2026-02-28T11:02:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '40a62940-dad0-4c62-83ab-b7de5cdba624', '82bfd11c-8abf-4609-8464-381b396ec71c',
  'a61f805a-027c-493e-84ae-0413ecf16807', NULL,
  'Mert Şahin', 'maybe', false, '2026-03-01T09:30:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'cb447b9f-b52d-4be8-86f7-6aa71bf8f6ae', '82bfd11c-8abf-4609-8464-381b396ec71c',
  NULL, '9d9129b7e9963472f05463b3c05b2fdd2f7615860b135f6cd4215307d9f954a5',
  'Burak', 'going', false, '2026-03-01T13:44:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'f41fd3aa-5749-49a1-8324-1a8b2dde98ce', '82bfd11c-8abf-4609-8464-381b396ec71c',
  NULL, '4705a79509567ae0ed908d7ac9a74620c947ddda93f8d9b5a03088774c2b6e2b',
  'Selin', 'maybe', false, '2026-03-01T15:10:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '796923ef-345a-4557-8cfa-3200ed5b2cd3', '82bfd11c-8abf-4609-8464-381b396ec71c',
  NULL, 'acbab38d964f3169b36a54dbe6e2f07f944499c6b539c82896ad44f50858300a',
  'Can', 'not_going', false, '2026-03-01T17:22:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '4877245c-835f-4b44-8201-124f0fa05bd6', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  '362776d3-9839-4100-8203-423551604483', NULL,
  'Elif Demir', 'going', true, '2026-02-24T14:30:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '7e4b8977-2ac1-41b4-886f-9543f6c65950', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  '729f9b2e-9179-488f-8e7a-ea73df0658c4', NULL,
  'Kerem Aslan', 'going', false, '2026-02-24T15:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '28ae9444-f198-49f9-855b-e1467ce4f5db', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  'a61f805a-027c-493e-84ae-0413ecf16807', NULL,
  'Mert Şahin', 'going', false, '2026-02-24T16:20:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '1f291c89-74ef-44e9-8755-b5d70c79a9fa', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '7b6e7a8e62f45f7f5bf4ae76b8386f6c9bcd6444ef678cd5f1c467e4f05529b9',
  'Takım Arkadaşı 1', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '78d0cefc-2d56-412e-8694-35b985cd67c3', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '2cfeb942ad253d448032741808239444f6751f1863282fbdb3d974f6368cbd84',
  'Takım Arkadaşı 2', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '200e5e5b-a9e4-4dc6-89bc-2b5c54787812', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, 'ace7c1cbe707f44bdcd8509d6d3f6d30859718a32b17526ed5816cbafd2a036b',
  'Takım Arkadaşı 3', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'e145eb72-2305-41e1-85cc-52659ea18db4', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '812ffab2c0da270dda475958c73a436059a06e99b345e2749ddb25ccca533009',
  'Takım Arkadaşı 4', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '2ed5d580-07dc-4292-88fb-f4be21479a08', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, 'a8a68cb6e52bb17de9a172738a0ecd9251520758aec5f6a0749a77e330d5aee0',
  'Takım Arkadaşı 5', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '540b5356-6347-4f8b-8e7f-1fc0a1fc8d3e', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '0f9546eb6aa28cf1b56584fc0505c8ed854fcd9b1c08cc83c384931833e784ff',
  'Takım Arkadaşı 6', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '0a71e68d-3abe-4927-870c-689487d91a85', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '0e46f39ebfd0e7df6221a79a94b561382e453bf65f9ddef6e8ebaa7fe61ba73d',
  'Takım Arkadaşı 7', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'f8975754-6fa5-47c8-849c-01768d5bd5fb', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '0ff6708a3f8cd704f93baa12e63556aa5c28b5b297a91b4a69d4ca1df5e951d4',
  'Takım Arkadaşı 8', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'bb4dc4d7-1722-4e65-8455-c58a757ae8d2', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08',
  NULL, '150ddc2d2da471dec4326b4c75f9baf7be804bfc9a27cce56efdc0c31e948486',
  'Takım Arkadaşı 9', 'going', false, '2026-02-25T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'd8a3845c-6bd3-4f32-8b96-78ae65705737', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  '729f9b2e-9179-488f-8e7a-ea73df0658c4', NULL,
  'Kerem Aslan', 'going', true, '2026-02-20T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '405d691a-4a1e-4495-8a92-6c004f11f1ae', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  '362776d3-9839-4100-8203-423551604483', NULL,
  'Elif Demir', 'going', false, '2026-02-21T19:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '5a489432-7250-435b-8a09-aa060f14acc1', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', NULL,
  'Zeynep Kaya', 'going', false, '2026-02-21T20:10:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '45a765ec-f84d-4e09-8640-70e80ba47f77', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, 'aa6cd2563ade8b13cab3224f9b7c88faa38ac0dafe42a0fc359b0fdc653a8015',
  'Davetli 1', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'aa34ddc4-dce2-4dce-87c0-b88ca0760a83', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, '47304cfd5a813d62ebf60d0310ea937a9026244049372779e58bfc2180b06b10',
  'Davetli 2', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '90f9b28d-4436-41ef-815d-151d9d5943fa', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, 'e440740d71aa983588e35bbf8fc22dbd4e60f39895e4ce37b9ae2e78df21d14d',
  'Davetli 3', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '29c8f8ad-c6bd-443d-810e-db949e8cac10', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, 'd90a9438128b4edc527231136c4f62943ab7130d483567cdfa18a5df8a76ba11',
  'Davetli 4', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '05c7bf6c-051e-42d4-8e97-453e390c2ce1', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, '0d221af78a7ccf398c7809729cd6b75ffddc65a9567160fa93ee53c82bdb1840',
  'Davetli 5', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '45002cc4-0963-47b1-839c-123ef94297f4', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, '55aef7475a1b4c7ef6d825526581df41cd803b03d8256197f6af9abf2174e48b',
  'Davetli 6', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'b471413d-6fb6-4fac-8ec3-99934b20ee53', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, '44c6e623573b021c59e873230d40c22eda8d2f9c70330668f1120d28010826f2',
  'Davetli 7', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'f4f03dce-1d8e-4332-8124-0bf9878e2694', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, '888d6ff7ce0a29eeec8ca979f36436280247fad9a2e5cb2040d713579a251e1a',
  'Davetli 8', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'b4d3dc87-be7f-4cd4-8e6c-174a6b5b6a45', '183981f7-8f80-4909-86fe-cc0ca9949e4e',
  NULL, '052f1d206b8692a6ee2ce450286c10c528f00e47522fd27778ad9c09ca790606',
  'Davetli 9', 'going', false, '2026-02-22T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'c8f6c3b3-1470-4a9c-81a3-c91b3b2e9526', '114496ef-f94e-4bc5-82f1-42ae80ff5a39',
  'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', NULL,
  'Zeynep Kaya', 'going', true, '2026-03-01T18:45:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '8d98c534-fe49-4f6b-884f-16a30cd08078', '114496ef-f94e-4bc5-82f1-42ae80ff5a39',
  '362776d3-9839-4100-8203-423551604483', NULL,
  'Elif Demir', 'pending', false, '2026-03-01T19:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '72b31934-b096-450d-83e4-fd25b7cba7e5', '114496ef-f94e-4bc5-82f1-42ae80ff5a39',
  'a61f805a-027c-493e-84ae-0413ecf16807', NULL,
  'Mert Şahin', 'going', false, '2026-03-01T19:30:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '907d2c26-12c7-468e-8a64-7a8341685e2f', 'f568a35c-8556-406b-8881-ad06b7f66044',
  '362776d3-9839-4100-8203-423551604483', NULL,
  'Elif Demir', 'going', true, '2026-03-01T22:10:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '03306a1e-0173-429e-803c-1ea2a9513033', '0664b051-988c-488b-8a47-0d7d7e172410',
  '362776d3-9839-4100-8203-423551604483', NULL,
  'Elif Demir', 'going', true, '2026-02-02T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  'e44e2860-b2f6-4956-8038-eb13bc4922d2', '0664b051-988c-488b-8a47-0d7d7e172410',
  '729f9b2e-9179-488f-8e7a-ea73df0658c4', NULL,
  'Kerem Aslan', 'going', false, '2026-02-03T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '857eb7d7-ab12-41ce-8843-b60c3bebf0c3', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, 'f893fa2e7855558f470cd7b6de73e2e67788f6affed2a483f1b9d87fcbf1c48b',
  'Katılımcı 1', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '60b449d3-859b-4801-817b-719498a80ba1', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, '07ab15de4c341899ad4fc43a5babcfc245f002d6fd8ce4f86a71bd1c9ab0b223',
  'Katılımcı 2', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '4c1be040-e289-4ac7-8968-06f2c88521e6', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, '705709aa2906ea52895adc39236cfbf60757aca85e5d61158f04e393d58eada7',
  'Katılımcı 3', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '8b7ea82b-58fc-4c70-84f3-ba508b4f6090', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, '5b33581b4d48377e58bf4010dfbfd934aace2eb507d401e581bf97cb961beed8',
  'Katılımcı 4', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '2d7130e3-9296-4a23-82ff-52b5829ebdea', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, 'bbadc292913b08bff84e1901d9eb70197f54ea64785da58cad879457c42fa456',
  'Katılımcı 5', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '4d284bf4-235d-480b-849e-84c903dda435', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, 'c8e834bd748201bb9d12b66fe0895bd1e399dc97d49d57514ed6882c62339526',
  'Katılımcı 6', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_participants (
  id, plan_id, user_id, guest_token_hash, display_name, status, is_owner, joined_at
) VALUES (
  '8ee080bc-3cdb-48df-872f-4682f2d78093', '0664b051-988c-488b-8a47-0d7d7e172410',
  NULL, '1a6153fa913c7d259efeeaa488ea2f05eec1f617c61a6864b4b81be4a0e668a8',
  'Katılımcı 7', 'going', false, '2026-02-04T12:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_invitations (
  id, plan_id, token_hash, short_code, created_by, expires_at, revoked_at, use_count, created_at
) VALUES (
  '21b53376-2836-44ca-80a1-5b461bd8113c', '82bfd11c-8abf-4609-8464-381b396ec71c', '67b90234c4fdf109724f89e278d2336570341e3cda5210c2bfc74bc6b3c9ab86', 'H4K2M9V3',
  '362776d3-9839-4100-8203-423551604483', '2026-03-08T23:59:00.000Z'::timestamptz, NULL,
  6, '2026-02-28T09:00:00.000Z'::timestamptz
);
INSERT INTO public.plan_invitations (
  id, plan_id, token_hash, short_code, created_by, expires_at, revoked_at, use_count, created_at
) VALUES (
  'c41d52bc-f272-4674-8840-524a58bf30d0', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '4ca3eced4ca37143f9a19120b2698bf3f33fb26d2aeadc7b56c12b0375d33cd7', 'S7B3N2K8',
  '362776d3-9839-4100-8203-423551604483', '2026-03-11T23:59:00.000Z'::timestamptz, NULL,
  11, '2026-02-24T14:30:00.000Z'::timestamptz
);
INSERT INTO public.plan_invitations (
  id, plan_id, token_hash, short_code, created_by, expires_at, revoked_at, use_count, created_at
) VALUES (
  '15401201-1a9f-4a5b-8374-206fa6605cbb', '114496ef-f94e-4bc5-82f1-42ae80ff5a39', '9de70d863f28b2c22c7eff8bc45ead5884e48b736f572e756dacb5309d689e69', 'G9P4T6X2',
  'fb4e4ef6-ab9b-4622-8b9e-69928b2e256b', '2026-03-06T23:59:00.000Z'::timestamptz, NULL,
  2, '2026-03-01T18:45:00.000Z'::timestamptz
);

-- Oy trigger'ı yalnızca 'voting' durumundaki planlarda oy kabul eder.
-- Seed verisi geçmiş oylamaları da içerdiği için trigger geçici olarak kapatılır.
ALTER TABLE public.votes DISABLE TRIGGER votes_guard_window;
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('bf4b2c05-8feb-43ed-886d-529e08364f3f', '82bfd11c-8abf-4609-8464-381b396ec71c', '2b655ee8-776d-4a74-8750-0e15fe791153', '59f0488c-3f41-4e2d-8401-bd10cd8f2507', '2026-03-01T12:00:00.000Z'::timestamptz, '2026-03-01T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('f681c694-bc86-4b45-8b36-7c1a0065aa19', '82bfd11c-8abf-4609-8464-381b396ec71c', 'db7e480c-23a5-4c51-8c88-da4b61a8d445', '59f0488c-3f41-4e2d-8401-bd10cd8f2507', '2026-03-01T12:00:00.000Z'::timestamptz, '2026-03-01T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('ff939cf2-b8f0-4c99-874d-4944731d3ddd', '82bfd11c-8abf-4609-8464-381b396ec71c', '8f8ff069-1151-49cd-8b5a-3b009f864b32', '9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', '2026-03-01T12:00:00.000Z'::timestamptz, '2026-03-01T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('55adc4db-a53f-4faa-8eef-fa7a5384e6ec', '82bfd11c-8abf-4609-8464-381b396ec71c', '40a62940-dad0-4c62-83ab-b7de5cdba624', '59f0488c-3f41-4e2d-8401-bd10cd8f2507', '2026-03-01T12:00:00.000Z'::timestamptz, '2026-03-01T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('5e4549cf-baaf-46e2-8cb5-8bf4bb74b0cb', '82bfd11c-8abf-4609-8464-381b396ec71c', 'cb447b9f-b52d-4be8-86f7-6aa71bf8f6ae', '9da44c2c-c1e9-4857-8b5f-a0dae5f605f7', '2026-03-01T12:00:00.000Z'::timestamptz, '2026-03-01T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('75354efb-dfe9-499f-886e-41a2d0be8d14', '82bfd11c-8abf-4609-8464-381b396ec71c', 'f41fd3aa-5749-49a1-8324-1a8b2dde98ce', '3caad383-4ead-4b15-87ff-97c7531cc069', '2026-03-01T12:00:00.000Z'::timestamptz, '2026-03-01T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('c94677fb-972f-46c7-8d73-9c09478f5f15', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '4877245c-835f-4b44-8201-124f0fa05bd6', '6397e648-87b0-4148-85b6-cc4f9223481b', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('1aa2dfcc-9542-4000-87b6-a5b151f2a177', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '7e4b8977-2ac1-41b4-886f-9543f6c65950', '6397e648-87b0-4148-85b6-cc4f9223481b', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('0e3cf74c-d65e-43e9-8091-a12b8d209796', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '28ae9444-f198-49f9-855b-e1467ce4f5db', '6397e648-87b0-4148-85b6-cc4f9223481b', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('0999a5bb-856b-440e-81de-17beacde02a0', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '1f291c89-74ef-44e9-8755-b5d70c79a9fa', '6397e648-87b0-4148-85b6-cc4f9223481b', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('5f72b3ca-6a9a-4330-8c93-0643d00760cf', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '78d0cefc-2d56-412e-8694-35b985cd67c3', '6397e648-87b0-4148-85b6-cc4f9223481b', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('5d201235-fd35-4fd6-8d13-bc64769c1465', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '200e5e5b-a9e4-4dc6-89bc-2b5c54787812', '6397e648-87b0-4148-85b6-cc4f9223481b', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('b88a90ef-a18b-4926-87fd-a4e436d3e4e9', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', 'e145eb72-2305-41e1-85cc-52659ea18db4', 'd123019d-f3d2-4511-86da-77398b09d266', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
INSERT INTO public.votes (id, plan_id, participant_id, package_id, created_at, updated_at) VALUES ('227f3931-66d3-4b0b-8373-6d24bf2289c7', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '2ed5d580-07dc-4292-88fb-f4be21479a08', 'd123019d-f3d2-4511-86da-77398b09d266', '2026-02-26T12:00:00.000Z'::timestamptz, '2026-02-26T12:00:00.000Z'::timestamptz);
ALTER TABLE public.votes ENABLE TRIGGER votes_guard_window;

-- ==========================================================================
-- 6. Rezervasyonlar
-- ==========================================================================

-- Durum geçmişi trigger ile otomatik yazılır; seed geçmişi ayrıca eklenmez.
ALTER TABLE public.reservations DISABLE TRIGGER reservations_guard_status;
INSERT INTO public.reservations (
  id, plan_id, package_id, branch_id, business_id, created_by, code, people_count,
  reserved_date, reserved_start_time, reserved_end_time, total_price, per_person_price,
  contact_name, contact_phone, note, status, rejection_reason, rejection_note,
  created_at, updated_at
) VALUES (
  'cd14116b-3ef4-4618-82c3-80c576bce62b', '2dbfc3e9-16e4-4e5a-89a8-7d7df8ddfb08', '6397e648-87b0-4148-85b6-cc4f9223481b',
  '26f0ebf4-3add-4752-84f7-d57d00461e89', '747440e5-1895-427b-886b-ea554067897b', '362776d3-9839-4100-8203-423551604483',
  'HG-4T7K2M', 12, '2026-03-10',
  '21:00',
  '22:00',
  90000, 7500,
  'Elif Demir', '05001234567', 'Duş kullanacağız, havlu getirmemize gerek var mı?',
  'pending_business', NULL, NULL,
  '2026-03-01T10:00:00.000Z'::timestamptz, '2026-03-01T10:00:00.000Z'::timestamptz
);
INSERT INTO public.reservations (
  id, plan_id, package_id, branch_id, business_id, created_by, code, people_count,
  reserved_date, reserved_start_time, reserved_end_time, total_price, per_person_price,
  contact_name, contact_phone, note, status, rejection_reason, rejection_note,
  created_at, updated_at
) VALUES (
  'cf0b2fde-0333-44ec-88e7-7e3013c82e3c', '183981f7-8f80-4909-86fe-cc0ca9949e4e', '3caad383-4ead-4b15-87ff-97c7531cc069',
  'de486b9b-63a4-4116-8bdf-1517c8691b59', '36d85939-646e-4c9b-87aa-1b6224254f25', '729f9b2e-9179-488f-8e7a-ea73df0658c4',
  'HG-9NX3QB', 12, '2026-03-14',
  '19:00',
  '22:00',
  380000, 31667,
  'Kerem Aslan', '05009876543', 'Pasta sürpriz, salona geç getirebilir misiniz?',
  'confirmed', NULL, NULL,
  '2026-02-25T11:00:00.000Z'::timestamptz, '2026-02-26T16:20:00.000Z'::timestamptz
);
INSERT INTO public.reservations (
  id, plan_id, package_id, branch_id, business_id, created_by, code, people_count,
  reserved_date, reserved_start_time, reserved_end_time, total_price, per_person_price,
  contact_name, contact_phone, note, status, rejection_reason, rejection_note,
  created_at, updated_at
) VALUES (
  'bbb3944e-4ae4-48d0-8026-31425246017c', '0664b051-988c-488b-8a47-0d7d7e172410', '366b0bd2-ac3c-4571-80db-7b84c2194053',
  '325f1686-8207-455c-8390-0c904977e957', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', '362776d3-9839-4100-8203-423551604483',
  'HG-2VB8ZK', 9, '2026-02-10',
  '21:00',
  '23:30',
  144000, 16000,
  'Elif Demir', '05001234567', NULL,
  'completed', NULL, NULL,
  '2026-02-08T10:00:00.000Z'::timestamptz, '2026-02-11T23:59:00.000Z'::timestamptz
);
INSERT INTO public.reservations (
  id, plan_id, package_id, branch_id, business_id, created_by, code, people_count,
  reserved_date, reserved_start_time, reserved_end_time, total_price, per_person_price,
  contact_name, contact_phone, note, status, rejection_reason, rejection_note,
  created_at, updated_at
) VALUES (
  'efa07f23-3317-4f58-88f6-154acbf0538e', '0664b051-988c-488b-8a47-0d7d7e172410', '78d83523-0452-4b6f-8abc-6eee7c663ff7',
  '325f1686-8207-455c-8390-0c904977e957', 'c7e5a0b4-e57b-4096-88d5-f65c7d00ff4a', '362776d3-9839-4100-8203-423551604483',
  'HG-6QW1RT', 9, '2026-02-10',
  '21:00',
  '23:30',
  520000, 57778,
  'Elif Demir', '05001234567', NULL,
  'rejected', 'capacity_mismatch', 'Bu paket en az 10 kişi içindir, 9 kişiyle açamıyoruz.',
  '2026-02-06T09:00:00.000Z'::timestamptz, '2026-02-06T13:00:00.000Z'::timestamptz
);
ALTER TABLE public.reservations ENABLE TRIGGER reservations_guard_status;

-- ==========================================================================
-- 7. Bildirimler, favoriler, yardım içerikleri, SEO
-- ==========================================================================

INSERT INTO public.notifications (id, user_id, type, title, body, data, read_at, created_at) VALUES (
  'a0d5c32c-94e6-403b-8a09-94d91fb969c7', '362776d3-9839-4100-8203-423551604483', 'participant_joined',
  'Burak plana katıldı', '“Cuma Akşamı Buluşması” planına Burak katıldı.', '{"planId":"plan-active"}'::jsonb,
  NULL, '2026-03-01T13:44:00.000Z'::timestamptz
);
INSERT INTO public.notifications (id, user_id, type, title, body, data, read_at, created_at) VALUES (
  'cf96dcf9-46f5-43d3-8b86-bc6e486a009b', '362776d3-9839-4100-8203-423551604483', 'vote_cast',
  'Yeni oy kullanıldı', '“Cuma Akşamı Buluşması” planında 6 oy kullanıldı.', '{"planId":"plan-active"}'::jsonb,
  NULL, '2026-03-01T15:20:00.000Z'::timestamptz
);
INSERT INTO public.notifications (id, user_id, type, title, body, data, read_at, created_at) VALUES (
  '389a0c8d-2002-4b96-8af7-c24d0245cd8b', '362776d3-9839-4100-8203-423551604483', 'reservation_submitted',
  'Rezervasyon talebin gönderildi', '“Halı Saha Maçı” için Gol Krallığı Halı Saha’ya talebin iletildi.', '{"planId":"plan-reservation","reservationId":"reservation-pending"}'::jsonb,
  '2026-03-01T10:05:00.000Z'::timestamptz, '2026-03-01T10:00:00.000Z'::timestamptz
);
INSERT INTO public.notifications (id, user_id, type, title, body, data, read_at, created_at) VALUES (
  '7a6f1fc1-9a32-4402-877a-21ea4448f31e', 'cac03dd9-5e29-406b-86c5-2b0b648d4d71', 'new_reservation_request',
  'Yeni rezervasyon talebi', '12 kişilik grup için 1 saatlik halı saha talebi geldi.', '{"reservationId":"reservation-pending"}'::jsonb,
  NULL, '2026-03-01T10:00:00.000Z'::timestamptz
);
INSERT INTO public.notifications (id, user_id, type, title, body, data, read_at, created_at) VALUES (
  'e3f16e35-22b7-439c-8601-47b14c81e51f', '729f9b2e-9179-488f-8e7a-ea73df0658c4', 'reservation_confirmed',
  'Rezervasyonun onaylandı', 'Kuzey Işığı Kahve Evi rezervasyonunu onayladı. Kod: HG-9NX3QB', '{"reservationId":"reservation-confirmed"}'::jsonb,
  NULL, '2026-02-26T16:20:00.000Z'::timestamptz
);
INSERT INTO public.favorites (user_id, package_id, created_at) VALUES ('362776d3-9839-4100-8203-423551604483', '59f0488c-3f41-4e2d-8401-bd10cd8f2507', '2026-02-27T20:00:00.000Z'::timestamptz);
INSERT INTO public.favorites (user_id, package_id, created_at) VALUES ('362776d3-9839-4100-8203-423551604483', 'f64a0a7e-dcc3-4522-8622-6cea2da519aa', '2026-02-23T19:15:00.000Z'::timestamptz);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  'cb9218c4-cde0-4d8f-88cb-2510a11a216f', 'plan-nasil-olusturulur', 'Plan nasıl oluşturulur?', 'Yeni plan sihirbazının 7 adımını ve taslak kaydını anlatır.',
  'Ana sayfadaki **Yeni plan oluştur** butonuna dokunarak başlarsın. Sihirbaz 7 adımdan oluşur:

1. **Ne zaman?** — Bu akşam, yarın, hafta sonu gibi hızlı seçeneklerden birini seçebilir veya takvimden tarih belirleyebilirsin.
2. **Nerede?** — İl ve ilçe seçersin. İlçe için "Farketmez" diyebilirsin; o zaman şehirdeki tüm paketler listelenir.
3. **Kaç kişisiniz?** — 2–4, 5–8, 9–14, 15+ hazır aralıklarından seçebilir veya kendi sayını girebilirsin.
4. **Bütçeniz ne?** — Kişi başı veya toplam bütçe girersin; diğeri otomatik hesaplanır.
5. **Ne yapmak istiyorsunuz?** — Kafe, halı saha, oyun salonu gibi kategorilerden bir veya birkaçını seçersin.
6. **Tercihleriniz** — Açık alan, ayrı salon, projeksiyon gibi tercihleri işaretlersin. Bunlar zorunlu değildir; eşleşmeyi iyileştirir.
7. **Plan özeti** — Her şeyi kontrol edip planı oluşturursun.

Her adımda yaptığın seçim **otomatik olarak taslağa kaydedilir**. Uygulamayı kapatsan bile Planlarım → Taslaklar altından kaldığın yerden devam edebilirsin.', 'Başlangıç', true, true, 1
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '97671b33-af94-4b22-8749-6f4e7fd88cf6', 'arkadaslar-nasil-davet-edilir', 'Arkadaşlar nasıl davet edilir?', 'Davet bağlantısı, WhatsApp paylaşımı ve davet kodu kullanımı.',
  'Planını oluşturduktan sonra plan detayında **Arkadaşlarını davet et** butonunu göreceksin.

- **WhatsApp''ta paylaş**: Hazır bir mesajla bağlantıyı doğrudan grubuna gönderir.
- **Bağlantıyı kopyala**: Bağlantıyı istediğin yere yapıştırabilirsin.
- **Davet kodu**: Sözlü olarak paylaşabileceğin 8 karakterlik bir kod.

Arkadaşların bağlantıya dokunduğunda **uygulama indirmeden**, tarayıcıda plana katılabilir; adını yazar, katılım durumunu seçer ve paketleri oylayabilir.

Bağlantıyı yanlış kişiye gönderdiysen **Bağlantıyı yenile** diyebilirsin; eski bağlantı anında geçersiz olur.', 'Davet', true, true, 2
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '0287dbb6-a978-4dcb-8e07-5df05b22b30f', 'oy-nasil-degistirilir', 'Oy nasıl değiştirilir?', 'Oylama süresince oyunu istediğin kadar değiştirebilirsin.',
  'Oylama devam ettiği sürece oyunu istediğin kadar değiştirebilirsin. Oylama ekranında seçtiğin paketin üzerinde bir onay işareti görürsün; başka bir pakete dokunduğunda oyun otomatik olarak oraya taşınır.

Oylama kapandıktan sonra oy değiştirilemez; ekranda oy yerine **sonuç** gösterilir.

Oylar açıktır: kimin hangi paketi seçtiğini plandaki herkes görebilir. Bu, grubun daha hızlı karar vermesini sağlar.', 'Oylama', true, true, 3
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '5e8eef36-9a83-46ab-827f-ec1bdb299333', 'kisi-sayisi-degisirse', 'Kişi sayısı değişirse ne olur?', 'Katılımcı sayısı değiştiğinde fiyatlar ve paket listesi yeniden hesaplanır.',
  'Bir arkadaşın katılım durumunu değiştirdiğinde HazırGrup fiyatları ve paket listesini otomatik olarak yeniden hesaplar.

Tahmini katılımcı sayısı şöyle bulunur: **kesin gelenler + kararsızların yarısı** (yukarı yuvarlanır). Örneğin 6 kişi "Katılıyorum", 3 kişi "Kararsızım" dediyse hesap 6 + 2 = 8 kişi üzerinden yapılır.

- Kişi başı fiyatlı paketlerde toplam tutar değişir.
- Sabit toplam fiyatlı paketlerde (örneğin halı saha kiralama) toplam aynı kalır, kişi başı düşen tutar değişir.
- Kişi sayısı paketin kapasitesinin dışına çıkarsa o paket listeden çıkar ve sana bildirilir.', 'Fiyat', true, true, 4
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '81078007-a38b-4467-8274-f6de09cb628f', 'fiyat-neden-degisti', 'Fiyat neden değişti?', 'Fiyat değişiminin üç olası nedeni.',
  'Gördüğün fiyat üç nedenle değişebilir:

1. **Katılımcı sayısı değişti.** Sabit toplam fiyatlı paketlerde kişi başına düşen tutar, gelen kişi sayısına göre hesaplanır.
2. **İşletme paket fiyatını güncelledi.** Bu durumda planında bir bilgilendirme görürsün.
3. **Farklı bir paket seçildi.** Oylama sonucunda kazanan paket değiştiyse fiyat da değişir.

Rezervasyon talebi gönderdiğinde tutar **sabitlenir**; işletme onayladıktan sonra fiyat değişmez.', 'Fiyat', true, true, 5
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  'ae2652b3-dcd0-4452-8bf9-b67c753e8c72', 'rezervasyon-nasil-calisir', 'Rezervasyon nasıl çalışır?', 'Talep gönderme, işletme onayı ve rezervasyon kodu.',
  'Oylama bittikten sonra plan sahibi **Rezervasyon talebi gönder** diyebilir. Talep şu bilgileri içerir: seçilen paket, şube, tarih ve saat, kesin kişi sayısı, iletişim bilgisi ve varsa notun.

Talep gönderildikten sonra:

1. Durum **İşletme onayı bekleniyor** olur.
2. İşletme talebi onaylar veya gerekçesiyle reddeder.
3. Onaylanırsa sana bir **rezervasyon kodu** verilir (örneğin HG-7QK4M2). Mekâna gittiğinde bu kodu söylemen yeterlidir.

HazırGrup üzerinden **ödeme alınmaz**. Ödeme mekânda yapılır.', 'Rezervasyon', true, true, 6
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '99b4df27-b98c-4529-8229-792e132ca26d', 'isletme-reddederse', 'İşletme rezervasyonu reddederse ne olur?', 'Ret durumunda alternatif paketlere yönlendirilirsin.',
  'İşletme talebi reddederse sana bildirim gelir ve **ret gerekçesi** gösterilir (örneğin "O saat için yerimiz dolu").

Bu durumda plan iptal olmaz. Sana aynı planın diğer uygun paketleri gösterilir ve tek dokunuşla yeni bir talep gönderebilirsin. Dilersen oylamayı yeniden açabilir veya doğrudan başka bir paket seçebilirsin.', 'Rezervasyon', true, true, 7
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  '9957c8a8-3188-4727-8434-081647bcbace', 'davet-baglantim-calismiyor', 'Davet bağlantım çalışmıyor', 'Geçersiz, süresi dolmuş veya iptal edilmiş bağlantılar.',
  'Davet bağlantısı üç nedenle çalışmayabilir:

- **İptal edilmiş**: Plan sahibi bağlantıyı yenilemiştir. Ondan güncel bağlantıyı iste.
- **Süresi dolmuş**: Bağlantılar plan tarihinden bir gün sonra otomatik olarak geçersiz olur.
- **Plan iptal edilmiş**: Plan sahibi planı iptal etmiştir.

Her üç durumda da ekranda ne yapman gerektiğini anlatan bir açıklama görürsün.', 'Davet', true, true, 8
);
INSERT INTO public.help_articles (
  id, slug, title, summary, body, category, is_public, is_indexable, sort_order
) VALUES (
  'f83ff5a4-d4af-43c0-8bba-9da2cb1b9d9a', 'hesabimi-nasil-silerim', 'Hesabımı nasıl silerim?', 'Hesap silme adımları ve verilerine ne olduğu.',
  'Profil → Ayarlar → **Hesabı sil** adımlarını izle. Silme talebi anında işleme alınır ve **30 gün içinde** geri alınabilir.

Verilerine ne olduğu:

- Profil bilgilerin, e-postan ve telefonun 30 gün sonra kalıcı olarak silinir.
- Oluşturduğun planlar anonimleştirilir; arkadaşlarının akışı bozulmaz.
- Oylar anonimleştirilir, sayım bütünlüğü korunur.
- Rezervasyonlar ticari kayıt olarak saklanır ancak kişisel alanların maskelenir.
- Bildirimler, favoriler ve cihaz kayıtların anında silinir.

Ayrıntılar için KVKK aydınlatma metnine bakabilirsin.', 'Hesap', true, true, 9
);
INSERT INTO public.seo_redirects (id, from_path, to_path, status_code, is_active, created_at) VALUES ('aa24a2b6-2ee0-4012-8965-7670e68395c1', '/mekanlar/kuzey-isigi', '/mekanlar/kuzey-isigi-kahve-evi', 301, true, '2026-01-20T10:00:00.000Z'::timestamptz);
INSERT INTO public.admin_logs (id, actor_id, actor_name, action, entity_type, entity_id, before, after, created_at) VALUES (
  'dc6dfde0-1f4e-4b16-82d6-867bd8cb5b39', 'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', 'Sistem Yöneticisi', 'business.verify',
  'business', '36d85939-646e-4c9b-87aa-1b6224254f25', '{"status":"pending_review"}'::jsonb, '{"status":"verified"}'::jsonb, '2026-01-15T09:00:00.000Z'::timestamptz
);
INSERT INTO public.admin_logs (id, actor_id, actor_name, action, entity_type, entity_id, before, after, created_at) VALUES (
  '45d1cddb-072d-4568-8d7f-ce97e4e2a87f', 'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', 'Sistem Yöneticisi', 'city.create',
  'city', '44c60af9-5060-407b-805b-f220d656e2f6', NULL, '{"name":"Van","isActive":false}'::jsonb, '2026-01-16T10:30:00.000Z'::timestamptz
);
INSERT INTO public.admin_logs (id, actor_id, actor_name, action, entity_type, entity_id, before, after, created_at) VALUES (
  '7a582409-e599-46df-80c4-2ec027c1ba6d', 'a47db4ad-d8a0-45b5-8e0b-6f9f78a20b60', 'Sistem Yöneticisi', 'package.deactivate',
  'package', 'b72bac39-db04-40c3-82f1-07aea007d5da', '{"isActive":true}'::jsonb, '{"isActive":false}'::jsonb, '2026-02-21T14:00:00.000Z'::timestamptz
);

-- ==========================================================================
-- Özet
-- ==========================================================================

-- Kullanıcı: 17
-- İşletme: 10
-- Şube: 16
-- Paket: 33
-- Plan: 6
-- Katılımcı: 44
-- Oy: 14
-- Rezervasyon: 4
-- Yardım makalesi: 9
-- Rehber sayfası (uygulama kodunda): 4

COMMIT;
