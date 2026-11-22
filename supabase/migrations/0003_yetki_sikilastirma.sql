-- ===========================================================================
-- Disiplin — tablo yetkilerinin sıkılaştırılması (savunma derinliği)
--
-- SORUN: Supabase, public şemasındaki her tabloya `anon` ve `authenticated`
-- rolleri için otomatik olarak TAM yetki (select/insert/update/delete) verir.
-- Verileri koruyan tek şey RLS politikalarıdır. Bu tek katmanlıdır: ileride
-- bir migration'da yanlışlıkla `alter table ... disable row level security`
-- yazılsa ya da bir politika hatalı kurulsa, tablo anında herkese açılır.
--
-- ÇÖZÜM: Rollere yalnızca gerçekten ihtiyaç duydukları yetkiyi ver. Artık iki
-- bağımsız katman var — önce yetki, sonra RLS. Birinin kaybolması tek başına
-- veriyi açmaz.
--
-- NOT: `security definer` fonksiyonlar (toggle_completion, create_invite_code,
-- list_invite_codes, enforce_invite_on_signup) tablo sahibinin yetkisiyle
-- çalışır; buradaki kısıtlamalardan etkilenmezler.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- app_admins ve invite_codes: API üzerinden HİÇBİR erişim olmamalı.
-- Bunlara yalnızca security definer fonksiyonlar ve Supabase paneli dokunur.
-- ---------------------------------------------------------------------------
revoke all on table public.app_admins   from anon, authenticated;
revoke all on table public.invite_codes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- tasks: kullanıcı kendi görevlerini okur, ekler, siler.
-- GÜNCELLEME YETKİSİ YOKTUR: düzenleme yerine sil + yeniden ekle (0001'deki
-- politika kararıyla aynı; burada yetki seviyesinde de kapatılıyor).
-- ---------------------------------------------------------------------------
revoke all on table public.tasks from anon, authenticated;
grant select, insert, delete on table public.tasks to authenticated;

-- ---------------------------------------------------------------------------
-- completions: SADECE OKUMA.
-- Tik atmanın tek yolu toggle_completion fonksiyonudur; o da sahiplik ve
-- tarih kurallarını kendisi doğrular.
-- ---------------------------------------------------------------------------
revoke all on table public.completions from anon, authenticated;
grant select on table public.completions to authenticated;

-- ---------------------------------------------------------------------------
-- Dizilerin (sequence) de gereksiz yere açık kalmaması için:
-- bu şemada seri numaralı kolon yok, ama ileride eklenirse diye varsayılanı
-- daraltıyoruz.
-- ---------------------------------------------------------------------------
revoke all on all sequences in schema public from anon;

-- ---------------------------------------------------------------------------
-- is_invite_code_valid bilerek `anon` tarafından çağrılabilir kalır:
-- kayıt ekranı, kullanıcı daha giriş yapmadan "bu kod geçerli mi" diye
-- sorabilsin diye. Yalnızca true/false döner, kodu veya sahibini sızdırmaz.
-- Kod havuzu 32^12 (~1,2 x 10^18) olduğu için deneme yanılmayla bulunamaz.
-- Asıl engel zaten auth.users üzerindeki tetikleyicidir.
-- ---------------------------------------------------------------------------
