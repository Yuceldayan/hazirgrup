# Edge Functions

**Faz 1'de Edge Function yazılmamıştır** (bkz. `docs/DECISIONS.md` → D-030).

Gereken tüm sunucu mantığı şu yollarla karşılanıyor:

| İhtiyaç | Çözüm |
| --- | --- |
| Hız sınırlama | `public.increment_rate_limit()` SQL fonksiyonu (`0010_support.sql`) |
| Davet kullanım sayacı | `public.increment_invitation_use()` SQL fonksiyonu |
| Oy tekilliği | `votes` tablosunda `UNIQUE (plan_id, participant_id)` |
| Oylama penceresi kontrolü | `votes_guard_window` trigger'ı |
| Durum geçiş doğrulaması | `plans_guard_status` / `reservations_guard_status` trigger'ları |
| Rezervasyon durum geçmişi | `reservations_log_status` trigger'ı |
| Fiyat türetme | `packages_compute_prices` trigger'ı |
| Yeni kullanıcı profili | `handle_new_user` trigger'ı |
| Sunucu tarafı iş mantığı | Next.js Server Actions (`apps/web/src/server/`) |

Ek bir dağıtım birimi eklemek Faz 1 için gereksiz karmaşa yaratırdı.

## İleride Edge Function gerekebilecek durumlar

- Zamanlanmış görevler (oylama süresi dolunca otomatik kapatma, rezervasyon hatırlatması)
- Push bildirimi gönderimi (FCM/APNs çağrıları)
- Webhook alıcıları (ödeme sağlayıcı — Faz 2+)

Bu ihtiyaçlar ortaya çıktığında fonksiyonlar bu klasöre eklenir ve
`supabase/config.toml` içinde `[edge_runtime] enabled = true` yapılır.
