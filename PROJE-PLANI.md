# Disiplin

> Bu dosya projenin tam tarifidir. Bu dosyayı okuyan Claude Code,
> başka hiçbir bilgiye ihtiyaç duymadan projeyi fazlardaki sırayla
> kurabilir. Fazları sırayla uygula; bir fazı bitirmeden sonrakine geçme.
> Her faz sonunda kullanıcıya ne yapıldığını ve nasıl test edeceğini söyle.

## 1. Proje nedir

**Disiplin**, tek bir kişinin (sahibinin) kullandığı kişisel bir görev ve
alışkanlık panelidir. Kullanıcı görevlerini kendisi yazar, her gün
yaptıklarına yeşil tik atar. Tik atmak tatmin edici bir animasyonla
ödüllendirilir; seri (streak) ve "35 / 90 gün" gibi sayaçlar kullanıcıyı
görevi bırakmamaya motive eder. Uygulama Vercel'de 7/24 yayında durur,
telefonun ana ekranına uygulama gibi eklenebilir (PWA). Arayüz tamamen
**Türkçe**dir.

Uygulama **davetlidir:** sahibi uygulamanın içinden tek kullanımlık davet
kodları üretir, yalnızca geçerli bir kodu olan hesap açabilir. Böylece sahibi uygulamayı ailesine ve yakınlarına
açabilir, ama internetteki herkese açılmaz. Her kullanıcı yalnızca kendi
görevlerini görür; bu ayrım arayüzde değil veritabanındaki RLS politikalarıyla
garanti edilir. İleride abonelikle satılması düşünülüyor, o yüzden her tabloda
`user_id` vardır.

## 2. Kullanıcılar ve yapabilecekleri

Davet kodu ile kaydolmuş kullanıcılar. Herkes kendi hesabıyla girer ve
yalnızca kendi verisini görür. Kod üretme yetkisi yalnızca yöneticilerdedir.

- E-posta + şifre ile giriş yapar; oturum açık kalır (her seferinde giriş yok).
- **Günlük sayfası:** sadece bugüne ait küçük/tek seferlik işler ekler
  ("faturayı öde", "markete git"). Bunlar gece 00:00'da (Bakü saati)
  listeden kalkar.
- **Hedefler sayfası:** süreli görevler ekler ("🇬🇧 İngilizce, 30 dk,
  3 ay, her gün" veya "💪 Spor, 2 ay, Pzt-Çar-Cum-Paz"). Görev süresi
  bitene kadar panelde kalır; her planlı günde bir kere tiklenir.
- Herhangi bir görevi siler (onay sorusuyla).
- Tik atar / yanlışlıkla atılan tiki geri alır (sadece **bugün** için).
- Süresi biten hedefleri **Tamamlananlar** sayfasında özetiyle görür.
- Günün ilk açılışında dünün özetini görür ("Dün 4/5 — 🇩🇪 Almanca yapılmadı").
- Ayarlardan tik sesini açıp kapatır, çıkış yapar.

## 3. Ekranlar / sayfalar

Altta sabit bir **sekme çubuğu** (mobil öncelikli): Günlük · Hedefler · Tamamlananlar.
Sağ üstte küçük bir ayarlar ikonu.

| Sayfa | URL | İçerik |
|---|---|---|
| Giriş | `/giris` | Logo "Disiplin", e-posta, şifre, "Giriş yap" butonu. Altta "Hesap oluştur" bağlantısı. |
| Kayıt | `/kayit` | E-posta, davet kodu, şifre, şifre tekrar. Geçersiz kod reddedilir. |
| Günlük | `/` | Üstte tarih ("Cumartesi, 21 Kasım") ve günün ilerleme halkası ("3/5"). Altında bugünkü tek günlük görevler. En altta bordo "+ Görev ekle" butonu → kısa form (başlık + emoji). |
| Hedefler | `/hedefler` | Üstte bugünün hedef ilerleme halkası. "Bugün yapılacaklar" bölümü (bugün planlı olanlar), altında "Bugün dinlenme günü" bölümü (soluk kartlar, "Sonraki: Çarşamba"). "+ Hedef ekle" butonu → hedef formu. |
| Tamamlananlar | `/tamamlananlar` | Süresi bitmiş hedefler, en yeni üstte. Her kartta: emoji, başlık, tarih aralığı, "90 günün 84'ünde yaptın", başarı yüzdesi, en uzun seri. Üstte toplam: "Tamamlanan hedef: 3". |
| Ayarlar | `/ayarlar` | Tik sesi aç/kapa, çıkış yap. |

**Hedef ekleme formu (bottom sheet / modal):**
- Başlık (zorunlu) — örn. "İngilizce", "Atomik Alışkanlıklar – 10 sayfa"
- Emoji (hazır listeden seçim: 🇬🇧 🇷🇺 🇩🇪 📚 💪 🏃 🧠 💰 🕌 ✍️ 💧 😴 ve birkaç tane daha; varsayılan ⭐)
- Günlük süre (isteğe bağlı, dakika) — kartta "30 dk" rozeti olarak görünür
- **Süre:** 1 hafta · 10 gün · 15 gün · 1 ay · 2 ay · 3 ay · 6 ay · 1 yıl · Özel
  - Özel seçilirse: sayı + birim (gün / hafta / ay / yıl)
- **Hangi günler:** "Her gün" (varsayılan) veya gün seçimi (Pzt Sal Çar Per Cum Cmt Paz çipleri)
- "Kaydet" butonu

**Hedef kartı:**
- Sol: emoji (büyük), başlık, altında rozetler: süre etiketi ("3 Aylık", "Haftalık", "45 Günlük"), dakika ("30 dk"), gün seçimi varsa ("Pzt·Çar·Cum·Paz")
- "🔥 12 gün seri" ve "35 / 90 gün" + ince ilerleme çubuğu + "Kalan: 55 gün"
- Sağ: büyük yuvarlak tik butonu
- Uzun basma veya "⋯" menüsü → Sil

## 4. Teknoloji seçimleri

| Katman | Seçim | Neden |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Vercel ile doğal uyum, frontend + backend tek projede |
| Stil | Tailwind CSS | Hızlı, tutarlı tasarım |
| Animasyon | Framer Motion + `canvas-confetti` | Tik animasyonu ve "hepsi bitti" kutlaması |
| Veritabanı | Supabase (Postgres) | Veriler telefon ve bilgisayarda ortak; ücretsiz plan yeter |
| Auth | Supabase Auth, e-posta + şifre, **davet kodu ile kayıt** | Kayıt sayfası herkese açık, ama geçerli kodu olmayan hesap açamaz |
| Supabase istemcisi | `@supabase/ssr` + `proxy.ts` | Oturum çerezde tutulur, giriş kalıcı olur (Next 16'da `middleware.ts` yerine `proxy.ts`) |
| Tarih | `date-fns` + `date-fns-tz` | Ay ekleme, Bakü saat dilimi hesapları |
| Hosting | Vercel | 7/24 yayın, GitHub'a push edince otomatik deploy |
| PWA | `app/manifest.ts` + ikonlar + basit service worker | Telefona ikonla eklenebilsin |

Ortam değişkenleri (`.env.local` ve Vercel'de):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

İkisi de tarayıcıya gönderilir ve gizli değildir; verileri koruyan şey anahtar
değil RLS'tir. `service_role` anahtarı bu projede **hiç kullanılmaz**.

## 5. Veri modeli

Tüm tarih alanları **Asia/Baku** takvim günüdür (`date` tipi, saat yok).

### `tasks`
| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | `auth.users(id)`, varsayılan `auth.uid()` |
| `kind` | text | `'daily'` (Günlük sayfası, tek gün) veya `'goal'` (Hedefler) — check constraint |
| `title` | text | zorunlu, max 120 karakter |
| `emoji` | text | varsayılan `'⭐'` |
| `minutes` | int null | günlük süre (dk), isteğe bağlı |
| `start_date` | date | görevin eklendiği gün (Bakü) |
| `end_date` | date | **hariç** bitiş günü. `daily` için `start_date + 1`. Örn. Cuma eklenen 1 haftalık hedef → bir sonraki Cuma; tiklenebilir günler Cuma…Perşembe. |
| `duration_label` | text | kartta görünen etiket: "Haftalık", "3 Aylık", "45 Günlük" vb. |
| `weekdays` | int[] null | null = her gün; aksi halde ISO gün numaraları (1=Pzt … 7=Paz) |
| `created_at` | timestamptz | `now()` |

### `completions`
| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | |
| `task_id` | uuid | `tasks(id) on delete cascade` |
| `user_id` | uuid | varsayılan `auth.uid()` |
| `done_date` | date | tiklenen gün (Bakü) |
| `created_at` | timestamptz | |
| | | **unique (`task_id`, `done_date`)** |

### `invite_codes`
| Kolon | Tip | Not |
|---|---|---|
| `code` | text PK | `XXXX-XXXX-XXXX`, 32 harflik alfabe (I/O/0/1 yok) |
| `note` | text null | "amcamın oğlu" gibi kısa not |
| `created_by` | uuid null | kodu üreten yönetici |
| `created_at` | timestamptz | `now()` |
| `expires_at` | timestamptz | `now() + 7 gün` |
| `used_at` | timestamptz null | doluysa kod tükenmiştir |
| `used_by` | uuid null | kodu kullanan hesap |
| `used_by_email` | text null | kodu kullanan e-posta |

### `app_admins`
| Kolon | Tip | Not |
|---|---|---|
| `user_id` | uuid PK | `auth.users(id)` |
| `added_at` | timestamptz | `now()` |

Her iki tabloda da RLS açıktır ve **bilerek hiç politika yoktur:** API
üzerinden ne okunur ne yazılır. Yalnızca `security definer` fonksiyonlar ve
Supabase paneli erişir.

Bir görevin durumu tarihlerden **hesaplanır**, ayrıca saklanmaz:
- Aktif: `start_date <= bugün < end_date`
- Tamamlandı (Tamamlananlar'da): `kind='goal'` ve `end_date <= bugün`
- Süresi geçmiş `daily` görevler hiçbir sayfada listelenmez (sadece dün özetinde kullanılır).

**RLS:** iki tabloda da açık; her işlem için `user_id = auth.uid()` politikası.

## 6. İş kuralları

Kurallar arayüzde değil **veritabanında** garanti edilir (Supabase migration içinde):

1. **"Bugün" her zaman Bakü saatine göredir.** SQL'de `(now() at time zone 'Asia/Baku')::date`, istemcide `date-fns-tz` ile `Asia/Baku`. Telefonun saat dilimi farklı olsa bile değişmez.
2. **Tik sadece bugün için atılır/geri alınır.** Bunun için `toggle_completion(p_task_id uuid)` Postgres fonksiyonu yaz (RPC ile çağrılır, `security definer` + `set search_path = ''`; `completions` tablosunda insert/delete politikası bilerek verilmediği için fonksiyon RLS'i aşar ama sahiplik ve tarih kurallarını kendisi doğrular): bugünü Bakü saatine göre hesaplar; görev kullanıcıya ait, bugün aktif ve bugün planlı değilse hata verir; bugün için kayıt varsa siler, yoksa ekler; yeni durumu (`true/false`) döner. İstemci `completions` tablosuna doğrudan insert/delete **yapmaz** (insert/delete politikası verme, sadece select ver).
3. **Planlı gün:** `weekdays` null ise her gün; değilse günün ISO numarası listede olmalı.
4. **Hedef bitiş tarihi:** gün/hafta için gün ekle; ay/yıl için takvim ayı ekle (`addMonths`, `addYears`). 1 hafta = 7 gün.
5. **İlerleme "35 / 90":** pay = toplam tik sayısı; payda = `start_date`…`end_date-1` arasındaki planlı gün sayısı.
6. **Seri (streak):** bugünden geriye doğru planlı günleri say; bugün henüz tiklenmediyse bugünü atlayıp dünden başla; tiklenmemiş ilk planlı günde dur. Kaçırılan gün seriyi sıfırlar ama "35 / 90" toplamını **etkilemez**.
7. **Dün özeti:** günün ilk açılışında (son gösterim tarihi `localStorage`'da) dün planlı olan tüm görevler (daily + goal) için "Dün X/Y" ve yapılmayanların listesi gösterilir. Dün planlı görev yoksa gösterilmez. Tamamen başarılı günse olumlu mesaj: "Dün 5/5 — kusursuz gün 🔥".
8. **Silme:** onay sorulur ("Bu hedef ve tüm geçmişi silinecek"). Silinen görevin tikleri de silinir (cascade).
9. **Davet kodu ile kayıt:** Kayıt sayfası herkese açıktır. Kod, `signUp`
   sırasında `raw_user_meta_data.davet_kodu` alanında gelir; `auth.users`
   üzerindeki **`after insert`** tetikleyicisi kodu tek bir `update` ile hem
   doğrular hem "kullanıldı" yapar. Tek `update` olduğu için iki kişi aynı
   kodu aynı anda kullanamaz; kayıt sonradan başarısız olursa işlem geri
   alınır ve kod yanmaz. Tetikleyici `before` değil `after`tır, çünkü
   `used_by` yazılırken `auth.users` satırının var olması gerekir. Kural
   veritabanındadır: istemci atlatılsa, API'ye doğrudan istek atılsa bile
   kodsuz hesap açılamaz. Kayıt sayfası ayrıca `is_invite_code_valid(text)`
   ile önden kontrol yapar — bu sadece anlaşılır bir hata mesajı göstermek
   içindir, asıl engel tetikleyicidir.
10. **Kod üretme yetkisi:** `create_invite_code` ve `list_invite_codes`
   yalnızca `app_admins` tablosundaki kullanıcılar için çalışır. Ayarlar'daki
   Davetler bölümünün gizlenmesi görsel bir ayrıntıdır; yetki kontrolü
   fonksiyonların kendi içindedir.

## 7. Tasarım

**Hava:** sade, ferah, asil. Beyaz zemin, bordo vurgular, bol boşluk, yumuşak gölgeler, yuvarlak köşeler (kartlar `rounded-2xl`).

| Ad | Hex | Kullanım |
|---|---|---|
| `bordo` | `#7B1E3A` | butonlar, aktif sekme, ilerleme çubuğu, rozet zemini |
| `bordo-dark` | `#5E1229` | hover/basılı durum |
| `bordo-soft` | `#F7ECEF` | rozet/çip arka planı, seçili gün çipi zemini |
| `bg` | `#FFFFFF` | sayfa zemini |
| `surface` | `#FAF8F7` | kart zemini (çok hafif sıcak beyaz) |
| `ink` | `#1C1A1B` | ana metin |
| `muted` | `#8A8285` | ikincil metin |
| `success` | `#2E9E5B` | tik ve tamamlanmış kart |
| `success-soft` | `#E8F6EE` | tamamlanmış kart zemini |

**Font:** başlıklar `Playfair Display` (serif, asil), metinler `Inter`. İkisi de `next/font/google` ile.

**Tik animasyonu (uygulamanın kalbi — özenle yap):**
1. Tik butonuna basılınca buton hafifçe küçülüp büyür (spring).
2. Yeşil renk, butonun olduğu noktadan başlayıp **dairesel olarak bütün kartı doldurur** (`clip-path: circle()` animasyonu, ~450 ms, ease-out). Kart zemini `success-soft`, kenarı `success` olur.
3. Butonun içindeki tik işareti **çizilerek** belirir (SVG path `pathLength` 0→1, ~300 ms).
4. Kart hafifçe "nefes alır" (scale 1 → 1.02 → 1).
5. Telefonda kısa titreşim: `navigator.vibrate?.(25)`.
6. Hafif, yumuşak bir "tık/ding" sesi — Web Audio API ile üretilir (ses dosyası gerekmez); ayarlardan kapatılabilir (`localStorage`).
7. Sayfadaki son görev de tiklenince: ilerleme halkası tamamen yeşile döner, `canvas-confetti` ile yeşil-bordo kısa bir konfeti patlar, "Bugün tamam 🔥" yazısı belirir.
8. Tik geri alınınca animasyon tersine ve daha hızlı oynar (ses/titreşim yok).

Tik **iyimser (optimistic)** güncellenir: animasyon hemen oynar, RPC hata verirse geri alınır ve küçük bir uyarı (toast) çıkar.

**Mobil:** öncelik telefon (375 px genişlikte kusursuz). Masaüstünde içerik ortada, max ~560 px genişlik. Sekme çubuğu altta sabit, iPhone güvenli alanına (`env(safe-area-inset-bottom)`) uyumlu.

**Logo/ikon:** bordo zemin üzerinde beyaz serif "D" harfi. PWA ikonları (192, 512, maskable) bundan üretilir.

## 8. Klasör yapısı

```
disiplin/
├─ app/
│  ├─ layout.tsx              # fontlar, tema, sekme çubuğu
│  ├─ manifest.ts             # PWA manifest
│  ├─ giris/page.tsx
│  ├─ kayit/page.tsx
│  ├─ auth/onayla/route.ts   # e-posta doğrulama bağlantısı
│  ├─ (app)/                  # giriş gerektiren sayfalar
│  │  ├─ layout.tsx           # TabBar + DünÖzeti
│  │  ├─ page.tsx             # Günlük
│  │  ├─ hedefler/page.tsx
│  │  ├─ tamamlananlar/page.tsx
│  │  └─ ayarlar/page.tsx
├─ components/
│  ├─ TaskCard.tsx            # tik animasyonu burada
│  ├─ CheckButton.tsx
│  ├─ ProgressRing.tsx
│  ├─ AddDailySheet.tsx
│  ├─ AddGoalSheet.tsx
│  ├─ YesterdaySummary.tsx
│  └─ TabBar.tsx
├─ lib/
│  ├─ supabase/client.ts
│  ├─ supabase/server.ts
│  ├─ dates.ts                # Bakü "bugün", bitiş tarihi, planlı gün hesapları
│  ├─ stats.ts                # seri, "35/90", dün özeti
│  └─ feedback.ts             # ses + titreşim
├─ proxy.ts                   # oturum yoksa /giris'e yönlendir (Next 16)
├─ supabase/migrations/0001_init.sql
├─ supabase/migrations/0002_invite_codes.sql
├─ public/icons/
└─ .env.local.example
```

## 9. Fazlar

### Faz 1 — İskelet ve canlı yayın
**Hedef:** Boş ama tasarımı belli olan Disiplin, Vercel'de bir URL'de açılıyor.
**Yapılacaklar:**
1. Next.js + TypeScript + Tailwind projesini kur; renkleri ve fontları Tailwind temasına ekle.
2. `(app)` layout'u, alt sekme çubuğu ve üç boş sayfa (Günlük, Hedefler, Tamamlananlar) + Ayarlar.
3. Her sayfaya başlık ve "Henüz görev yok" boş durumu koy.
4. Projeyi GitHub'a yükle, Vercel'e bağla, deploy et. (Kullanıcıya GitHub/Vercel adımlarını tek tek anlat.)
**Bitti sayılır:** Telefonda Vercel URL'si açılıyor, beyaz-bordo tasarım ve alttaki sekmeler arası geçiş çalışıyor.

### Faz 2 — Supabase ve giriş
**Hedef:** Uygulamaya sadece geçerli davet kodu olanlar hesap açıp girebiliyor.
**Yapılacaklar:**
1. Kullanıcıya Supabase'de proje oluşturmayı, URL ve anon key'i `.env.local` ve Vercel'e eklemeyi adım adım anlat.
2. `0001_init.sql` migration: `tasks`, `completions`, RLS politikaları, `toggle_completion` fonksiyonu (Bölüm 5–6).
3. `0002_invite_codes.sql` migration: `invite_codes` ve `app_admins`
   tabloları, `auth.users` üzerinde davet tetikleyicisi, `create_invite_code`,
   `list_invite_codes`, `is_admin`, `is_invite_code_valid` fonksiyonları.
   Ayarlar'a yöneticiye görünen "Davetler" bölümü.
4. `/giris` ve `/kayit` sayfaları, `@supabase/ssr` ile oturum, `proxy.ts`
   yönlendirmesi, e-posta doğrulama rotası, Ayarlar'da "Çıkış yap".
**Bitti sayılır:** Giriş yapmadan `/` açılınca `/giris`'e gidiyor; kodsuz ya
da kullanılmış kodla kayıt reddediliyor; geçerli kodla kayıt olup giriş
yapılabiliyor; kod ikinci kez işe yaramıyor; yönetici Ayarlar'dan yeni kod
üretebiliyor, yönetici olmayan üretemiyor; tarayıcı kapatılıp açılınca hâlâ
girişli.

### Faz 3 — Günlük sayfası ve tik animasyonu
**Hedef:** Günlük görev ekle, tikle, yeşile boyanmasını gör, sil.
**Yapılacaklar:**
1. `lib/dates.ts`: Bakü saatine göre bugün.
2. "+ Görev ekle" sheet'i (başlık + emoji); `kind='daily'`, `start_date=bugün`, `end_date=bugün+1`.
3. Bugünün daily görevlerini listele; tik → `toggle_completion` RPC.
4. `TaskCard` + `CheckButton` ile Bölüm 7'deki tik animasyonunun tamamı (dolgu, çizilen tik, ses, titreşim, geri alma).
5. Üstte `ProgressRing`; hepsi bitince konfeti + "Bugün tamam 🔥".
6. Silme (onaylı).
**Bitti sayılır:** Telefonda görev eklenip tiklendiğinde kart yeşile doluyor, titreşim ve ses geliyor; sayfa yenilenince tik duruyor; ertesi gün liste boş.

### Faz 4 — Hedefler
**Hedef:** Süreli ve gün seçimli hedefler ekleniyor, seri ve "35 / 90" görünüyor.
**Yapılacaklar:**
1. `AddGoalSheet`: başlık, emoji, dakika, süre (hazır seçenekler + Özel), gün seçimi. Bitiş tarihi ve `duration_label` Bölüm 6 kural 4'e göre hesaplanır.
2. Hedefler sayfası: "Bugün yapılacaklar" ve "Bugün dinlenme günü" bölümleri.
3. `lib/stats.ts`: seri, ilerleme (pay/payda), kalan gün.
4. Hedef kartı: rozetler, 🔥 seri, "35 / 90 gün", ilerleme çubuğu, kalan gün; aynı tik animasyonu.
5. Silme (onaylı).
**Bitti sayılır:** "3 ay, her gün" ve "2 ay, Pzt-Çar-Cum-Paz" hedefleri eklenebiliyor; planlı olmayan günde kart soluk ve tiklenemiyor; tiklenince seri ve sayaç artıyor.

### Faz 5 — Tamamlananlar, dün özeti, ayarlar
**Hedef:** Motivasyon katmanı tamam.
**Yapılacaklar:**
1. Tamamlananlar sayfası: süresi biten hedefler, "90 günün 84'ünde yaptın", yüzde, en uzun seri, toplam sayaç.
2. `YesterdaySummary`: günün ilk açılışında üstten kayan şık bir kart (Bölüm 6 kural 7); "Tamam" ile kapanır.
3. Ayarlar: ses aç/kapa.
**Bitti sayılır:** Süresi geçmiş bir test hedefi (tarihi geriye alınarak) Tamamlananlar'da özetiyle görünüyor; ertesi gün ilk açılışta dün özeti çıkıyor, ikinci açılışta çıkmıyor.

### Faz 6 — PWA ve son cilalama
**Hedef:** Telefonun ana ekranına eklenince gerçek uygulama gibi açılıyor.
**Yapılacaklar:**
1. `app/manifest.ts` (ad "Disiplin", `theme_color #7B1E3A`, `background_color #FFFFFF`, `display: standalone`), "D" ikonları, iOS `apple-touch-icon`.
2. Basit service worker (uygulama kabuğunu önbelleğe alır; veri her zaman canlı çekilir).
3. Yükleme durumları (iskelet kartlar), hata toast'ları, boş durum metinleri.
4. 375 px ve masaüstünde son görsel kontrol; erişilebilirlik (buton etiketleri, `prefers-reduced-motion`'da animasyonu sadeleştir).
**Bitti sayılır:** iPhone/Android'de "Ana ekrana ekle" ile bordo "D" ikonu çıkıyor, tarayıcı çubuğu olmadan açılıyor; tüm akış telefonda sorunsuz.

## 10. Şimdilik yapılmayacak

Bunları kendi inisiyatifinle **ekleme**:
- Telefona push bildirim / hatırlatma mesajı (kullanıcı istiyor, sonraki sürüm)
- Abonelik, ödeme, davetsiz (herkese açık) kayıt
- Kullanıcı silme / yönetici atama ekranı (şimdilik SQL ile yapılır)
- Görev düzenleme (şimdilik sil + yeniden ekle), sürükle-bırak sıralama
- Geçmiş gün için tik atma
- İstatistik grafikleri, takvim/ısı haritası
- Yapay zekâ ile görev metni üretme
- Karanlık mod, çoklu dil (arayüz yalnızca Türkçe)

## 11. Varsayımlar

Kullanıcının "sen karar ver" dediği veya hiç değinmediği noktalarda alınan kararlar:
- **Günlük ↔ Hedefler ayrımı:** "Günlük" sayfası sadece o güne ait küçük/tek seferlik işler içindir ve 00:00'da kalkar. "Her gün 10 sayfa oku" gibi **süreli** tekrarlayan işler Hedefler sayfasında "Her gün" seçeneğiyle eklenir. Haftalık, aylık, yıllık ve özel süreli hedefler aynı sayfada, kartlarındaki rozetle ayrılır.
- Yapılmayan günlük görev ertesi güne taşınmaz; sadece dün özetinde "yapılmadı" olarak görünür.
- Saat dilimi sabit **Asia/Baku**.
- Renk tonları, fontlar ve animasyon detayları (Bölüm 7) kullanıcının onayıyla Claude tarafından seçildi.
- Dün özetinin günde bir kez gösterilmesi cihaz bazında `localStorage` ile takip edilir (telefonda ve bilgisayarda ayrı ayrı bir kez görünebilir).
- Supabase ücretsiz planı, bir hafta hiç kullanılmayan projeyi duraklatır; kullanıcı her gün kullanacağı için sorun değil. Duraklarsa Supabase panelinden tek tıkla açılır.
- Faz 5'teki test için geçici olarak geçmiş tarihli bir hedef SQL ile eklenebilir; test sonrası silinir.
- **Davetli çoklu kullanıcı** kararı Faz 2 başlarken alındı. Herkese açık kayıt
  yerine davet kodu seçildi çünkü: bot ve çöp hesap oluşmaz, Supabase'in
  ücretsiz planındaki düşük e-posta kotası yanmaz, kimlik taklidi riski düşer.
  Veri modeli değişmedi; `user_id` zaten her tablodaydı.
- Önce e-posta listesi tasarlandı, sonra kullanıcının isteğiyle **davet kodu**
  modeline geçildi: sahibi davet edeceği kişinin e-postasını önceden bilmek
  zorunda kalmıyor. Hiç kullanıcı oluşmadan değiştirildiği için veri taşınmadı.
- `is_invite_code_valid` bir kodun geçerli olup olmadığını söyler, yani teorik
  olarak kod denenebilir. Kod havuzu 32^12 (yaklaşık 1,2 x 10^18) olduğu ve kod
  tek başına hesap açmaya yetmediği (e-posta + şifre gerekir) için bu kabul
  edilebilir bir ödünç sayıldı.
- İlk yönetici SQL ile işaretlenir (tavuk-yumurta sorunu): kod üretmek için
  yönetici olmak, yönetici olmak için hesap açmak gerekir.
- Next.js 16'nın Cache Components özelliği kapatıldı: her sayfa oturuma bağlı
  olduğu için önbelleğe alınacak statik kabuk yok, açık bırakmak yalnızca
  `cookies()` okuyan her sayfaya Suspense sınırı zorunluluğu getiriyordu.
