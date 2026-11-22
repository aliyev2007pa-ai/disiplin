-- ===========================================================================
-- Disiplin — ilk şema
--
-- Tüm tarih alanları Asia/Baku takvim günüdür (saat yok).
-- Tüm kurallar veritabanı seviyesinde garanti edilir; istemciye güvenilmez.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid()
                   references auth.users (id) on delete cascade,

  -- 'daily' = Günlük sayfası (tek gün), 'goal' = Hedefler sayfası (süreli)
  kind           text not null check (kind in ('daily', 'goal')),

  title          text not null
                   check (char_length(btrim(title)) between 1 and 120),
  emoji          text not null default '⭐'
                   check (char_length(emoji) between 1 and 8),

  -- günlük süre (dakika), isteğe bağlı
  minutes        integer check (minutes is null or minutes between 1 and 1440),

  start_date     date not null,
  -- bitiş günü HARİÇTİR: tiklenebilir son gün end_date - 1
  end_date       date not null,
  duration_label text not null
                   check (char_length(btrim(duration_label)) between 1 and 40),

  -- null = her gün; aksi halde ISO gün numaraları (1=Pzt … 7=Paz)
  weekdays       smallint[]
                   check (
                     weekdays is null
                     or (
                       array_length(weekdays, 1) between 1 and 7
                       and weekdays <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]
                     )
                   ),

  created_at     timestamptz not null default now(),

  constraint tasks_end_after_start check (end_date > start_date)
);

create index if not exists tasks_user_window_idx
  on public.tasks (user_id, kind, start_date, end_date);

-- ---------------------------------------------------------------------------
-- completions
-- ---------------------------------------------------------------------------
create table if not exists public.completions (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks (id) on delete cascade,
  user_id    uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  done_date  date not null,
  created_at timestamptz not null default now(),

  -- bir görev bir günde yalnızca bir kez tiklenebilir
  constraint completions_task_day_unique unique (task_id, done_date)
);

create index if not exists completions_user_day_idx
  on public.completions (user_id, done_date);

-- ---------------------------------------------------------------------------
-- RLS — her satır yalnızca sahibine görünür
-- ---------------------------------------------------------------------------
alter table public.tasks       enable row level security;
alter table public.completions enable row level security;

-- tasks: kullanıcı kendi görevlerini okur, ekler, siler.
-- GÜNCELLEME POLİTİKASI YOKTUR: düzenleme yerine sil + yeniden ekle.
drop policy if exists tasks_select_own on public.tasks;
create policy tasks_select_own on public.tasks
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists tasks_insert_own on public.tasks;
create policy tasks_insert_own on public.tasks
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_delete_own on public.tasks
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- completions: SADECE OKUMA.
-- Tik atmak/geri almak yalnızca toggle_completion() üzerinden olur; böylece
-- "geçmiş güne tik" veya "planlı olmayan güne tik" istemciden yapılamaz.
drop policy if exists completions_select_own on public.completions;
create policy completions_select_own on public.completions
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- toggle_completion — tikin tek meşru yolu
--
-- SECURITY DEFINER'dır: completions tablosunda insert/delete politikası
-- bilerek verilmediği için fonksiyon RLS'i aşarak yazar, ama her çağrıda
-- sahiplik ve tarih kurallarını kendisi doğrular.
-- ---------------------------------------------------------------------------
create or replace function public.toggle_completion(p_task_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_today   date := (now() at time zone 'Asia/Baku')::date;
  v_task    public.tasks%rowtype;
  v_deleted integer;
begin
  if v_user_id is null then
    raise exception 'Oturum bulunamadı.' using errcode = '28000';
  end if;

  select * into v_task
    from public.tasks
   where id = p_task_id
     and user_id = v_user_id;

  if not found then
    raise exception 'Görev bulunamadı.' using errcode = 'P0002';
  end if;

  if v_today < v_task.start_date or v_today >= v_task.end_date then
    raise exception 'Bu görev bugün aktif değil.' using errcode = 'P0001';
  end if;

  if v_task.weekdays is not null
     and not (extract(isodow from v_today)::smallint = any (v_task.weekdays))
  then
    raise exception 'Bu görev bugün planlı değil.' using errcode = 'P0001';
  end if;

  delete from public.completions
   where task_id = p_task_id
     and user_id = v_user_id
     and done_date = v_today;

  get diagnostics v_deleted = row_count;

  if v_deleted > 0 then
    return false;
  end if;

  insert into public.completions (task_id, user_id, done_date)
  values (p_task_id, v_user_id, v_today);

  return true;
end;
$$;

revoke all on function public.toggle_completion(uuid) from public, anon;
grant execute on function public.toggle_completion(uuid) to authenticated;
