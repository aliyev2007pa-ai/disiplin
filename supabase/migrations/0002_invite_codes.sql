-- ===========================================================================
-- Disiplin — davet kodu ile kayıt
--
-- Kayıt sayfası herkese açıktır, ama hesap açmak için geçerli bir davet
-- kodu gerekir. Kodları yalnızca yöneticiler üretir; her kod TEK KULLANIMLIK
-- ve 7 gün geçerlidir.
--
-- Kural veritabanında zorlanır: kayıt ekranı atlatılsa, Supabase API'sine
-- doğrudan istek atılsa bile kodsuz hesap açılamaz.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Yöneticiler. RLS açık, bilerek politika yok: tablo API'den görünmez.
-- ---------------------------------------------------------------------------
create table if not exists public.app_admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

-- ---------------------------------------------------------------------------
-- Davet kodları. RLS açık, bilerek politika yok: kodlar API'den listelenemez,
-- yalnızca aşağıdaki security definer fonksiyonlar üzerinden görülür.
-- ---------------------------------------------------------------------------
create table if not exists public.invite_codes (
  code          text primary key,
  note          text check (note is null or char_length(btrim(note)) between 1 and 60),
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '7 days',
  used_at       timestamptz,
  used_by       uuid references auth.users (id) on delete set null,
  used_by_email text
);

alter table public.invite_codes enable row level security;

create index if not exists invite_codes_created_idx
  on public.invite_codes (created_at desc);

-- ---------------------------------------------------------------------------
-- Kod biçimi: XXXX-XXXX-XXXX
-- Alfabede 32 karakter var; karışan harfler (I, O, 0, 1) bilerek yok.
-- 32^12 yaklaşık 1,2 x 10^18 olasılık — deneyerek bulunamaz.
-- ---------------------------------------------------------------------------
create or replace function public.kodu_duzelt(p_kod text)
returns text
language sql
immutable
set search_path = ''
as $fn$
  select case when length(t.k) = 12
              then substr(t.k, 1, 4) || '-' || substr(t.k, 5, 4) || '-' || substr(t.k, 9, 4)
              else null
         end
    from (
      select regexp_replace(upper(coalesce(p_kod, '')), '[^A-Z0-9]', '', 'g') as k
    ) t;
$fn$;

create or replace function public.yeni_davet_kodu()
returns text
language plpgsql
volatile
set search_path = ''
as $fn$
declare
  alfabe constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  -- gen_random_uuid() kriptografik olarak güçlü bir kaynaktan gelir.
  -- 256 sayısı 32'ye tam bölündüğü için mod işlemi sapma yaratmaz.
  ham    bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  harf   text := '';
  i      integer;
begin
  for i in 0..11 loop
    harf := harf || substr(alfabe, 1 + (get_byte(ham, i) % 32), 1);
  end loop;

  return substr(harf, 1, 4) || '-' || substr(harf, 5, 4) || '-' || substr(harf, 9, 4);
end;
$fn$;

revoke all on function public.kodu_duzelt(text) from public, anon, authenticated;
revoke all on function public.yeni_davet_kodu() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Oturumdaki kullanıcı yönetici mi? (Ayarlar ekranı bunu sorar.)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $fn$
  select exists (
    select 1 from public.app_admins where user_id = auth.uid()
  );
$fn$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Yeni davet kodu üret. Yalnızca yöneticiler çağırabilir.
-- ---------------------------------------------------------------------------
create or replace function public.create_invite_code(p_note text default null)
returns table (
  code       text,
  note       text,
  created_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user   uuid := auth.uid();
  v_code   text;
  v_deneme integer := 0;
begin
  if v_user is null
     or not exists (select 1 from public.app_admins a where a.user_id = v_user)
  then
    raise exception 'Bu işlem için yetkin yok.' using errcode = '42501';
  end if;

  loop
    v_code := public.yeni_davet_kodu();
    exit when not exists (
      select 1 from public.invite_codes ic where ic.code = v_code
    );

    v_deneme := v_deneme + 1;
    if v_deneme > 5 then
      raise exception 'Kod üretilemedi, tekrar dene.' using errcode = 'P0001';
    end if;
  end loop;

  return query
    insert into public.invite_codes (code, note, created_by)
    values (v_code, nullif(btrim(p_note), ''), v_user)
    returning invite_codes.code,
              invite_codes.note,
              invite_codes.created_at,
              invite_codes.expires_at;
end;
$fn$;

revoke all on function public.create_invite_code(text) from public, anon;
grant execute on function public.create_invite_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Üretilmiş kodları listele. Yalnızca yöneticiler.
-- ---------------------------------------------------------------------------
create or replace function public.list_invite_codes()
returns table (
  code          text,
  note          text,
  created_at    timestamptz,
  expires_at    timestamptz,
  used_at       timestamptz,
  used_by_email text
)
language plpgsql
security definer
stable
set search_path = ''
as $fn$
begin
  if not exists (select 1 from public.app_admins a where a.user_id = auth.uid()) then
    raise exception 'Bu işlem için yetkin yok.' using errcode = '42501';
  end if;

  return query
    select ic.code, ic.note, ic.created_at, ic.expires_at, ic.used_at, ic.used_by_email
      from public.invite_codes ic
     order by ic.created_at desc
     limit 100;
end;
$fn$;

revoke all on function public.list_invite_codes() from public, anon;
grant execute on function public.list_invite_codes() to authenticated;

-- ---------------------------------------------------------------------------
-- Kayıt ekranının önden kontrolü: sadece evet/hayır döner, kodu sızdırmaz.
-- Amacı anlaşılır bir hata mesajı göstermek; asıl engel aşağıdaki tetikleyici.
-- ---------------------------------------------------------------------------
create or replace function public.is_invite_code_valid(p_code text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $fn$
  select exists (
    select 1
      from public.invite_codes
     where code = public.kodu_duzelt(p_code)
       and used_at is null
       and expires_at > now()
  );
$fn$;

revoke all on function public.is_invite_code_valid(text) from public;
grant execute on function public.is_invite_code_valid(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Kayıt kapısı.
--
-- Kodu tek bir UPDATE ile hem doğrular hem tüketir; bu yüzden iki kişi aynı
-- anda aynı kodu kullanamaz (ikincisi 0 satır günceller ve reddedilir).
-- Kayıt sonradan başarısız olursa işlem geri alınır ve kod yanmaz.
--
-- Tetikleyici BEFORE değil AFTER INSERT'tür: kodu kullanan kullanıcıyı
-- (`used_by`) yazarken auth.users satırının var olması gerekir, yoksa yabancı
-- anahtar kısıtı patlar. AFTER'da hata fırlatmak da bütün işlemi geri alır,
-- yani kapı aynı sıkılıkta kalır — kodsuz hesap yine açılamaz.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_invite_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_code  text := public.kodu_duzelt(new.raw_user_meta_data ->> 'davet_kodu');
  v_satir integer;
begin
  if new.email is null then
    raise exception 'E-posta gerekli.' using errcode = '42501';
  end if;

  if v_code is null then
    raise exception 'Davet kodu gerekli.' using errcode = '42501';
  end if;

  update public.invite_codes
     set used_at       = now(),
         used_by       = new.id,
         used_by_email = lower(btrim(new.email))
   where code = v_code
     and used_at is null
     and expires_at > now();

  get diagnostics v_satir = row_count;

  if v_satir = 0 then
    raise exception 'Davet kodu geçersiz, kullanılmış veya süresi dolmuş.'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

revoke all on function public.enforce_invite_on_signup() from public, anon, authenticated;

drop trigger if exists enforce_invite_before_user_insert on auth.users;
drop trigger if exists enforce_invite_after_user_insert on auth.users;
create trigger enforce_invite_after_user_insert
  after insert on auth.users
  for each row
  execute function public.enforce_invite_on_signup();

-- ---------------------------------------------------------------------------
-- Eski e-posta listesi yaklaşımı kaldırıldı (hiç kullanılmadı).
-- ---------------------------------------------------------------------------
drop function if exists public.is_email_allowed(text);
drop table if exists public.allowed_emails;
