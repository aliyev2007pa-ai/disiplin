# Disiplin

Kişisel görev ve alışkanlık paneli. Kullanıcı günlük işlerini ve süreli
hedeflerini yazar, her gün yaptıklarına tik atar; seri (streak) ve
"35 / 90 gün" sayaçları görevi bırakmamak için motivasyon sağlar.

Arayüz tamamen **Türkçe**, mobil önceliklidir ve telefonun ana ekranına
uygulama gibi eklenebilir (PWA).

Uygulama **davetlidir:** kayıt sayfası herkese açıktır, ama hesap açmak için
tek kullanımlık bir davet kodu gerekir. Kodları yöneticiler uygulamanın
içinden üretir. Her kullanıcı yalnızca kendi verisini görür.

**Canlı:** https://disiplin-plum.vercel.app

> **Durum:** Faz 3 tamamlandı — günlük görevler, tik animasyonu ve ilerleme halkası hazır.
> Fazların tam dökümü için [`PROJE-PLANI.md`](./PROJE-PLANI.md).

## Ekranlar

| Sayfa | Yol | İçerik |
|---|---|---|
| Giriş | `/giris` | E-posta + şifre |
| Kayıt | `/kayit` | E-posta + davet kodu ile hesap açılır |
| Günlük | `/` | Sadece bugüne ait tek seferlik işler; gece yarısı listeden kalkar |
| Hedefler | `/hedefler` | Süreli, tekrarlayan hedefler; seri ve ilerleme sayaçları |
| Tamamlananlar | `/tamamlananlar` | Süresi dolan hedeflerin başarı özeti |
| Ayarlar | `/ayarlar` | Tik sesi, çıkış |

## Teknolojiler

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** — tema `app/globals.css` içinde `@theme` ile tanımlı
- **Supabase** (Postgres + Auth) — satır düzeyi güvenlik (RLS) ile
- **Framer Motion** + `canvas-confetti` — tik animasyonu
- **date-fns / date-fns-tz** — tüm gün hesapları `Asia/Baku` takvim gününe göre
- **Vercel** — barındırma ve otomatik dağıtım

## Tasarım

Sade, ferah, asil: beyaz zemin, bordo vurgular, bol boşluk, yuvarlak köşeler.
Başlıklar *Playfair Display*, metinler *Inter*. Tek temalıdır (karanlık mod yok).

| Renk | Kod |
|---|---|
| Bordo | `#7B1E3A` |
| Bordo (koyu) | `#5E1229` |
| Bordo (açık) | `#F7ECEF` |
| Zemin | `#FFFFFF` |
| Kart | `#FAF8F7` |
| Metin | `#1C1A1B` |
| İkincil metin | `#8A8285` |
| Başarı | `#2E9E5B` |

## Güvenlik

Bu depo herkese açıktır, bu yüzden gizli hiçbir değer depoya girmez:

- Tüm `.env` dosyaları `.gitignore` ile engellenir; depoda yalnızca gerçek
  değer içermeyen [`.env.local.example`](./.env.local.example) bulunur.
- Anahtar, sertifika ve kimlik dosyaları (`*.pem`, `*.key`, `service-account*.json` …)
  ve Vercel/Supabase yerel durum dosyaları da engellenir.
- Supabase **`service_role` anahtarı bu projede hiç kullanılmaz.** Yalnızca
  tarayıcıya açılmak üzere tasarlanmış `publishable` anahtarı kullanılır.
- Verileri koruyan şey anahtarın gizliliği değil, veritabanındaki **RLS
  politikalarıdır**: her satır `user_id = auth.uid()` koşuluyla filtrelenir.
- Tik atma işlemi istemciden doğrudan yazma ile değil, sunucu tarafındaki
  `toggle_completion` fonksiyonu üzerinden yapılır; istemciye `completions`
  tablosunda yalnızca okuma yetkisi verilir.
- **Davet kodu ile kayıt:** `auth.users` üzerindeki `after insert`
  tetikleyicisi, kodu tek bir `update` ile hem doğrular hem tüketir. Kural
  veritabanındadır — istemci atlatılsa, API'ye doğrudan istek atılsa bile
  kodsuz hesap açılamaz. Tek `update` olduğu için iki kişi aynı kodu aynı anda
  kullanamaz; kayıt başarısız olursa işlem geri alınır ve kod yanmaz.
- Kodlar 32 harflik bir alfabeden 12 karakterdir (yaklaşık 1,2 x 10^18
  olasılık) ve `gen_random_uuid()` ile üretilir; karışan harfler (I, O, 0, 1)
  alfabede yoktur.
- `invite_codes` ve `app_admins` tablolarında RLS açıktır ve **bilerek hiç
  politika yoktur:** API üzerinden ne okunabilir ne yazılabilir.
- Kod üretme ve listeleme fonksiyonları yetkiyi kendi içlerinde kontrol eder;
  Ayarlar'daki bölümün gizlenmesi yalnızca görsel bir ayrıntıdır.
- Oturum her zaman `getUser()` ile doğrulanır (`getSession()` değil): jeton
  Supabase'e sorulur, çerezin içeriğine güvenilmez.
- Oturum kontrolü iki katmanlıdır: `proxy.ts` yönlendirir, `(app)` layout'u
  sunucuda tekrar kontrol eder. Asıl koruma yine de RLS'tir.

## Kurulum

```bash
git clone https://github.com/aliyev2007pa-ai/disiplin.git
cd disiplin
npm install
cp .env.local.example .env.local   # değerleri kendi Supabase projenden doldur
# supabase/migrations/ içindeki SQL dosyalarını sırayla çalıştır
npm run dev
```

`http://localhost:3000` adresini aç.

### Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm start` | Derlenmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint |

## Yol haritası

- [x] **Faz 1** — İskelet, tasarım sistemi, sekme çubuğu, canlı yayın
- [x] **Faz 2** — Supabase şeması, RLS, davetle kayıt, e-posta + şifre ile giriş
- [x] **Faz 3** — Günlük görevler ve tik animasyonu
- [ ] **Faz 4** — Süreli hedefler, seri ve ilerleme sayaçları
- [ ] **Faz 5** — Tamamlananlar, dün özeti, ayarlar
- [ ] **Faz 6** — PWA ve son cilalama
