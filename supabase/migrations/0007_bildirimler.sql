-- ===========================================================================
-- Disiplin — hatırlatma bildirimleri
--
-- MİMARİ KARARI: zamanlayıcı neden Vercel'de değil?
-- Vercel'in ücretsiz (Hobby) planında cron GÜNDE YALNIZCA BİR KEZ çalışır ve
-- saati de şaşabilir ("1:00 için kurulan iş 1:00–1:59 arasında tetiklenir").
-- "Akşam 21:30'da hatırlat" bununla yapılamaz. pg_cron ise veritabanının
-- kendi zamanlayıcısıdır, beş dakikada bir çalışır ve plan sınırı yoktur.
--
-- GÖREV DAĞILIMI:
--   Postgres  → kimin, ne zaman, neyi hatırlatması gerektiğine karar verir
--   Next.js   → yalnızca bildirimi İMZALAR ve push servisine gönderir
-- Böylece uygulama sunucusunun veritabanına yönetici erişimi gerekmez.
-- Projede `service_role` anahtarı hâlâ hiç kullanılmıyor (bkz.
-- .env.local.example), ki o anahtar RLS'i tamamen devre dışı bırakırdı.
--
-- SIR NEREDE DURUYOR: uç noktayı internetten herkes çağırabilir, o yüzden
-- paylaşılan bir sır gerekiyor. Sır YALNIZCA Vault'ta; uygulama onu
-- bilmez, gelen jetonun doğruluğunu veritabanına sorar.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1) Hatırlatma saati — görevin ve hedefin kendi alarmı
-- ---------------------------------------------------------------------------
-- Boşsa o görevin kendi hatırlatması yoktur. Saat Bakü saatidir; gün ve
-- saat hesabı her yerde 'Asia/Baku' üzerinden yapılır (bkz. lib/dates.ts).
alter table public.tasks
  add column if not exists hatirlatma time;

grant update (hatirlatma) on table public.tasks to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Push abonelikleri — her cihaz için bir satır
-- ---------------------------------------------------------------------------
-- Bir kullanıcının birden çok cihazı olabilir (telefon + bilgisayar), hepsine
-- ayrı gönderilir. `endpoint` tarayıcının push servisindeki adrestir ve
-- benzersizdir; aynı cihaz tekrar abone olursa satır güncellenir.
create table if not exists public.push_abonelikleri (
  endpoint    text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  cihaz_notu  text,
  created_at  timestamptz not null default now()
);

create index if not exists push_abonelikleri_kullanici_idx
  on public.push_abonelikleri (user_id);

alter table public.push_abonelikleri enable row level security;

drop policy if exists push_select_own on public.push_abonelikleri;
create policy push_select_own on public.push_abonelikleri
  for select to authenticated using (user_id = auth.uid());

drop policy if exists push_insert_own on public.push_abonelikleri;
create policy push_insert_own on public.push_abonelikleri
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists push_update_own on public.push_abonelikleri;
create policy push_update_own on public.push_abonelikleri
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists push_delete_own on public.push_abonelikleri;
create policy push_delete_own on public.push_abonelikleri
  for delete to authenticated using (user_id = auth.uid());

revoke all on table public.push_abonelikleri from anon, authenticated;
grant select, insert, update, delete
  on table public.push_abonelikleri to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Kullanıcı ayarları — akşam hatırlatması
-- ---------------------------------------------------------------------------
-- Kullanıcı tek tek saat seçmese bile, akşama doğru "bugün şu kadar işin
-- kaldı" diye tek bir hatırlatma gider. Kapatılabilir.
create table if not exists public.bildirim_ayarlari (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  aksam_acik       boolean not null default true,
  aksam_saati      time not null default '20:00',
  updated_at       timestamptz not null default now()
);

alter table public.bildirim_ayarlari enable row level security;

drop policy if exists ayar_select_own on public.bildirim_ayarlari;
create policy ayar_select_own on public.bildirim_ayarlari
  for select to authenticated using (user_id = auth.uid());

drop policy if exists ayar_insert_own on public.bildirim_ayarlari;
create policy ayar_insert_own on public.bildirim_ayarlari
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists ayar_update_own on public.bildirim_ayarlari;
create policy ayar_update_own on public.bildirim_ayarlari
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on table public.bildirim_ayarlari from anon, authenticated;
grant select, insert, update
  on table public.bildirim_ayarlari to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Gönderim kaydı — aynı hatırlatmayı iki kez atmamak için
-- ---------------------------------------------------------------------------
-- Zamanlayıcı beş dakikada bir çalışıyor; bu tablo olmasaydı 21:30'daki
-- hatırlatma 21:30, 21:35, 21:40… diye akşam boyu tekrar ederdi.
-- `anahtar` ya görevin kimliğidir ya da 'aksam'.
create table if not exists public.hatirlatma_kayitlari (
  user_id    uuid not null references auth.users (id) on delete cascade,
  gun        date not null,
  anahtar    text not null,
  gonderildi timestamptz not null default now(),
  primary key (user_id, gun, anahtar)
);

alter table public.hatirlatma_kayitlari enable row level security;
revoke all on table public.hatirlatma_kayitlari from anon, authenticated;
-- Hiç politika yok: bu tabloya yalnızca `security definer` fonksiyonlar
-- dokunur. Kullanıcı ne okur ne yazar.

-- ---------------------------------------------------------------------------
-- 5) Paylaşılan sır — Vault içinde üretilir, dışarı çıkmaz
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'hatirlatma_sirri') then
    perform vault.create_secret(
      encode(gen_random_bytes(36), 'base64'),
      'hatirlatma_sirri',
      'Hatirlatma uc noktasinin paylasilan sirri'
    );
  end if;
end;
$$;

-- Uç nokta, gelen jetonun doğru olup olmadığını buradan sorar. Yalnızca
-- evet/hayır döner, sırrı sızdırmaz. Sır 288 bit rastgeledir, denenerek
-- bulunamaz.
create or replace function public.hatirlatma_sirri_gecerli(p_sir text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'hatirlatma_sirri'
      and decrypted_secret = p_sir
  );
$$;

revoke all on function public.hatirlatma_sirri_gecerli(text) from public;
grant execute on function public.hatirlatma_sirri_gecerli(text) to anon, authenticated;

-- Push servisi "bu adres artık yok" dediğinde (404/410) aboneliği siler.
-- Sırrı bilen çağırabilir; kullanıcı oturumu gerekmez çünkü bunu uygulama
-- sunucusu zamanlayıcı turunun ortasında yapar.
create or replace function public.olu_abonelik_sil(p_sir text, p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.hatirlatma_sirri_gecerli(p_sir) then
    return false;
  end if;

  delete from public.push_abonelikleri where endpoint = p_endpoint;
  return true;
end;
$$;

revoke all on function public.olu_abonelik_sil(text, text) from public;
grant execute on function public.olu_abonelik_sil(text, text) to anon, authenticated;
