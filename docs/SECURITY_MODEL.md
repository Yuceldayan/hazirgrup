# Güvenlik Modeli — HazırGrup

## 1. Tehdit Modeli

| # | Tehdit | Etki | Önlem |
| --- | --- | --- | --- |
| T-1 | Davet tokenının tahmin edilmesi | Yabancı plana erişir, oy manipüle eder | 256-bit kriptografik token, DB'de yalnızca SHA-256 özeti, iptal/yenileme |
| T-2 | Misafirin tekrar tekrar oy vermesi | Oylama sonucu çarpıtılır | Katılımcı başına `UNIQUE(plan_id, participant_id)`, imzalı guest cookie, IP+token rate limit |
| T-3 | İşletmenin başka işletmenin verisini görmesi | Ticari veri sızıntısı | RLS `auth_is_business_member()`, ayrıca server-side `requireBusinessMember()` |
| T-4 | Yetkisiz admin paneli erişimi | Tam sistem ele geçirme | Middleware route koruması + server action'da `requireRole('admin')` + RLS |
| T-5 | Kişisel verinin public sayfada görünmesi | KVKK ihlali | Public projeksiyonlar yalnızca beyaz listedeki alanları döner (`toPublic*` fonksiyonları) |
| T-6 | Davet OG kartında gizli bilgi paylaşımı | Gizlilik ihlali | OG kartı yalnızca plan başlığı, tarih, ilçe, katılım çağrısı içerir |
| T-7 | Kimlik doğrulama brute force | Hesap ele geçirme | Giriş ve sıfırlamada rate limit, jenerik hata mesajı |
| T-8 | Zararlı dosya yükleme | XSS / depolama suistimali | MIME + uzantı beyaz listesi, boyut sınırı, Storage politikaları, EXIF temizleme |
| T-9 | Hassas verinin loglanması | Sızıntı | Log redaksiyon listesi (şifre, token, telefon, e-posta, vergi bilgisi) |
| T-10 | İstemci kontrolüne güvenme | Yetki atlatma | Tüm yazma yolları sunucuda yeniden doğrulanır |
| T-11 | Durum makinesi atlatma | Tutarsız veri | Geçişler `packages/core` içinde doğrulanır + DB trigger ile zorlanır |
| T-12 | Plan sahibinin oylamayı manipüle etmesi | Güven kaybı | Oylama bittikten sonra sonuç sabitlenir; eşitlik dışında sahip müdahale edemez, tüm değişiklikler `admin_logs`/geçmişe yazılır |

## 2. Kimlik Doğrulama

- E-posta + şifre. Şifre kuralı: **en az 8 karakter, en az bir harf ve bir rakam**.
- Şifreler Supabase Auth tarafından yönetilir (bcrypt); uygulama şifre saklamaz.
- Oturum: HttpOnly + `SameSite=Lax` + `Secure` (production) cookie.
- Web'de erişim tokenı `localStorage`'a **yazılmaz** (XSS yüzeyi).
- Mobilde token `expo-secure-store` içinde tutulur.
- Şifre sıfırlama: tek kullanımlık bağlantı, 60 dakika geçerli.
- Giriş hatası jeneriktir: "E-posta veya şifre hatalı." (kullanıcı numaralandırması engellenir)
- Google girişi opsiyonel adaptördür; kimlik bilgisi yoksa UI'da gösterilmez.

## 3. Yetkilendirme Katmanları

```
İstek
 ├─ 1. Middleware        → route grubu koruması (/admin, /business, /hesap)
 ├─ 2. Server action     → requireUser() / requireRole() / requireBusinessMember()
 └─ 3. Veritabanı        → Row Level Security  ← tek gerçek kaynak
```

İstemci tarafı gizleme (buton göstermeme) **güvenlik sınırı değildir**, yalnızca UX'tir.

### Roller

| Rol | Kapsam |
| --- | --- |
| `user` | Kendi planları, katıldığı planlar, kendi rezervasyonları |
| `business_staff` | Üyesi olduğu işletmenin şube/paket/rezervasyonları |
| `business_owner` | + çalışan yetkilendirme, işletme bilgileri |
| `moderator` | Şikâyet, destek, içerik pasifleştirme |
| `admin` | Tümü + şehir/kategori/SEO/audit |

## 4. Davet Tokenı Tasarımı

```
token      = base64url(random 32 byte)          → yalnızca bağlantıda görünür
token_hash = sha256(token)                      → veritabanında saklanan
short_code = 8 karakter Crockford Base32        → sözlü paylaşım için, ayrıca hash'li
```

- Token veritabanında **düz metin saklanmaz**.
- `plan_invitations.revoked_at` ile iptal edilebilir; yeni token üretmek eskisini geçersiz kılar.
- `expires_at` varsayılan: plan tarihinden 1 gün sonrası.
- `use_count` izlenir; anormal artış yönetici raporunda görünür.
- Davet sayfası `noindex, nofollow`; `Referrer-Policy: no-referrer` ile token sızıntısı azaltılır.

## 5. Misafir Kimliği

Misafir katılımcı hesap açmaz. Katılım anında:

```
guest_secret  = random 32 byte  → HttpOnly cookie: hg_guest_{planId}
guest_hash    = sha256(guest_secret)  → plan_participants.guest_token_hash
```

Aynı tarayıcı geri geldiğinde cookie ile aynı katılımcıya bağlanır; oyunu değiştirebilir.
Cookie silinirse yeni katılımcı olur — bu kabul edilmiş bir sınırdır
(`docs/KNOWN_LIMITATIONS.md` L-03) ve rate limit ile kötüye kullanımı sınırlanır.

## 6. Rate Limiting

| Uç nokta | Limit |
| --- | --- |
| Giriş | 10 / 15 dk / IP+e-posta |
| Kayıt | 5 / saat / IP |
| Şifre sıfırlama | 5 / saat / e-posta |
| Davet ile katılma | 20 / saat / IP |
| Oy verme/değiştirme | 30 / saat / katılımcı |
| Rezervasyon oluşturma | 10 / gün / kullanıcı |
| Public arama | 120 / dk / IP |

Uygulama: `rate_limits` tablosu üzerinde atomik sayaç (demo modda bellek içi).
Limit aşımı → `AppError('rate_limited')` → "Çok fazla deneme yaptın, biraz sonra tekrar dene."

## 7. Girdi Doğrulama

- Tüm dış girdiler Zod ile doğrulanır (`packages/validation`), **sunucu tarafında da**.
- Aynı şema hem istemci hem sunucuda kullanılır; istemci doğrulaması atlanabilir varsayılır.
- Metin alanlarında uzunluk sınırı ve kontrol karakteri temizliği.
- Kullanıcı içeriği HTML olarak render edilmez (React varsayılan escaping; `dangerouslySetInnerHTML` yalnızca JSON-LD için ve `JSON.stringify` çıktısıyla).

## 8. Dosya Yükleme

| Kural | Değer |
| --- | --- |
| İzinli tip | `image/jpeg`, `image/png`, `image/webp` |
| Maksimum boyut | 5 MB |
| Maksimum çözünürlük | 2560 px (uzun kenar), sunucuda yeniden boyutlandırılır |
| Depolama | Supabase Storage, işletme başına klasör |
| Erişim | Public bucket yalnızca yayınlanmış görseller; taslaklar imzalı URL |

Dosya adı sunucuda yeniden üretilir (UUID); istemci adı kullanılmaz.

## 9. Gizlilik ve KVKK

- Public sayfalarda **hiçbir** kullanıcı adı, telefonu, e-postası, plan bütçesi görünmez.
- Plan katılımcı isimleri yalnızca plan katılımcılarına gösterilir.
- İşletme telefonu public'tir (işletmenin kendi beyanı, ticari veri).
- Açık rıza gerektiren alanlar (pazarlama e-postası, konum hatırlama) ayrı onay kutularıdır
  ve varsayılan **kapalıdır**.
- KVKK aydınlatma metni, gizlilik politikası ve kullanım koşulları `/legal/*` altında.

### Hesap Silme Politikası

| Veri | Davranış |
| --- | --- |
| Profil, e-posta, telefon, avatar | 30 gün içinde kalıcı silinir |
| Kullanıcının oluşturduğu planlar | Anonimleştirilir (`Silinmiş kullanıcı`), katılımcılar için akış bozulmaz |
| Oylar | Anonimleştirilir, sayı bütünlüğü korunur |
| Rezervasyonlar | Ticari kayıt olarak 10 yıl saklanır, kişisel alanlar maskelenir |
| Bildirimler, favoriler, push tokenlar | Anında silinir |
| `admin_logs` | Aktör kimliği korunur (denetim yükümlülüğü) |

Silme talebi `profiles.deleted_at` ile işaretlenir; kullanıcı 30 gün içinde geri alabilir.

## 10. Loglama

**Asla loglanmaz:** şifre, oturum tokenı, davet tokenı, guest secret, telefon, e-posta,
vergi/işletme kimlik bilgisi, tam adres.

`AppError` loglanırken `code`, `entity`, `entityId` ve korelasyon kimliği yazılır;
`userMessage` dışındaki serbest metin redaksiyon listesinden geçirilir.

## 11. Audit Log

Şu işlemler `admin_logs` içine yazılır: işletme doğrulama/ret, kullanıcı askıya alma,
paket pasifleştirme, şehir/ilçe/kategori değişiklikleri, SEO index değişikliği,
rol atama/kaldırma, plan/rezervasyon yönetici müdahalesi.

Kayıt: aktör, işlem, varlık tipi/kimliği, önce/sonra JSON'u, zaman damgası.

## 12. Güvenlik Başlıkları

```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'
Referrer-Policy: strict-origin-when-cross-origin  (/davet için: no-referrer)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=63072000; includeSubDomains   (production)
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

## 13. Güvenlik Testleri

`apps/web/src/**/__tests__/` ve `tests/security/` altında:

- Yetkisiz kullanıcı `/admin` ve `/business` route'larına erişemez.
- İşletme A, işletme B'nin rezervasyonunu okuyamaz/güncelleyemez.
- Katılımcı olmayan kullanıcı plan detayını okuyamaz.
- Aynı katılımcı ikinci oyu ekleyemez (unique constraint).
- Geçersiz/iptal edilmiş davet tokenı reddedilir.
- Rate limit aşımı `rate_limited` döner.
- Public projeksiyonlar kişisel alan içermez (alan beyaz listesi testi).
- Geçersiz durum geçişleri reddedilir.
