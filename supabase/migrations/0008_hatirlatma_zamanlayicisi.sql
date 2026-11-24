-- ===========================================================================
-- Disiplin — hatırlatma zamanlayıcısı
--
-- pg_cron beş dakikada bir `hatirlatmalari_gonder()` fonksiyonunu çağırır.
-- Fonksiyon kimin neyi hatırlaması gerektiğine karar verir, aynı anda
-- "gönderildi" diye işaretler ve pg_net ile uygulamanın uç noktasına
-- POST eder. Uygulama yalnızca imzalayıp push servisine iletir.
--
-- NEDEN BEŞ DAKİKA: hatırlatma saatinden en fazla beş dakika sonra gider.
-- Her dakika çalıştırmak da mümkündü ama boş tur maliyeti var; beş dakika
-- "saat 21:30'da hatırlat" için fazlasıyla yeterli.
-- ===========================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- pg_net'in sıkılaştırılması
-- ---------------------------------------------------------------------------
-- pg_net kurulduğunda `net` şemasındaki fonksiyonlara EXECUTE yetkisi
-- varsayılan olarak PUBLIC'e verilir. PostgREST yalnızca `public` şemasını
-- dışarı açtığı için bunlar API'den çağrılamaz, ama 0003'teki ilkeye sadık
-- kalıyoruz: bir rolün ihtiyacı yoksa yetkisi de olmasın. Aksi hâlde ileride
-- `net` şeması bir şekilde açılırsa, sunucu herkesin istediği adrese istek
-- attırabildiği bir aracıya dönüşürdü.
revoke all on schema net from public, anon, authenticated;
revoke all on all functions in schema net from public, anon, authenticated;
revoke all on all tables in schema net from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Zamanı gelmiş hatırlatmalar — yalnızca okur, hiçbir şeyi değiştirmez
-- ---------------------------------------------------------------------------
-- Ayrı bir fonksiyon, çünkü "kime ne gidecek" kararı işin kalbi ve tek
-- başına denenebilmesi gerekiyor. Gönderen fonksiyon da bunu çağırır, yani
-- test edilen mantıkla çalışan mantık aynı.
create or replace function public.hatirlatma_adaylari()
returns table (
  user_id uuid,
  anahtar text,
  tur     text,
  baslik  text,
  sayi    integer
)
language sql
security definer
set search_path = ''
as $$
  -- Her şey Bakü takvimine göre; uygulamanın geri kalanıyla aynı kural.
  with an as (
    select
      (now() at time zone 'Asia/Baku')::date as bugun,
      extract(hour from (now() at time zone 'Asia/Baku'))::int * 60
      + extract(minute from (now() at time zone 'Asia/Baku'))::int as dk
  )
  -- (a) Görevin/hedefin kendi alarmı
  select
    t.user_id,
    t.id::text    as anahtar,
    'gorev'::text as tur,
    t.title       as baslik,
    0             as sayi
  from public.tasks t, an
  where t.hatirlatma is not null
    and an.bugun >= t.start_date
    and an.bugun <  t.end_date
    and (t.weekdays is null
         or extract(isodow from an.bugun)::smallint = any (t.weekdays))
    -- Saati geçmiş ama bir saatten eski değil. Zamanlayıcı bir süre
    -- çalışmazsa, sabahki hatırlatma akşam karşına çıkmasın.
    and an.dk - (extract(hour from t.hatirlatma)::int * 60
               + extract(minute from t.hatirlatma)::int) between 0 and 60
    -- Zaten yaptıysan hatırlatmaya gerek yok.
    and not exists (
      select 1 from public.completions c
      where c.task_id = t.id and c.done_date = an.bugun
    )
    -- Bildirim açık cihazı olmayana kayıt atıp hatırlatmayı yakmayalım.
    and exists (
      select 1 from public.push_abonelikleri p where p.user_id = t.user_id
    )

  union all

  -- (b) Akşam toplu hatırlatması: "bugün şu kadar işin kaldı"
  select
    a.user_id,
    'aksam'::text,
    'aksam'::text,
    null,
    k.kalan
  from public.bildirim_ayarlari a, an
  cross join lateral (
    select count(*)::int as kalan
    from public.tasks t
    where t.user_id = a.user_id
      and an.bugun >= t.start_date
      and an.bugun <  t.end_date
      and (t.weekdays is null
           or extract(isodow from an.bugun)::smallint = any (t.weekdays))
      and not exists (
        select 1 from public.completions c
        where c.task_id = t.id and c.done_date = an.bugun
      )
  ) k
  where a.aksam_acik
    and an.dk - (extract(hour from a.aksam_saati)::int * 60
               + extract(minute from a.aksam_saati)::int) between 0 and 60
    and k.kalan > 0
    and exists (
      select 1 from public.push_abonelikleri p where p.user_id = a.user_id
    );
$$;

revoke all on function public.hatirlatma_adaylari() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Zamanı gelen hatırlatmaları işaretler ve uygulamaya yollar
-- ---------------------------------------------------------------------------
create or replace function public.hatirlatmalari_gonder()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bugun date := (now() at time zone 'Asia/Baku')::date;
  v_govde jsonb;
  v_sayi  integer;
  v_sir   text;
begin
  with adaylar as (
    select * from public.hatirlatma_adaylari()
  ),
  -- Kaydı ÖNCE atıyoruz. Gönderim başarısız olursa o hatırlatma kaçar; ama
  -- tersi olsaydı (önce gönder, sonra kaydet) bir hata durumunda aynı
  -- bildirim beş dakikada bir tekrar ederdi. İkisinden daha azı rahatsız
  -- edeni bu.
  yeni as (
    insert into public.hatirlatma_kayitlari (user_id, gun, anahtar)
    select user_id, v_bugun, anahtar from adaylar
    on conflict (user_id, gun, anahtar) do nothing
    returning user_id, anahtar
  ),
  gonderilecek as (
    select a.*
    from adaylar a
    join yeni y on y.user_id = a.user_id and y.anahtar = a.anahtar
  )
  select
    jsonb_build_object(
      'gonderimler',
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'tur', g.tur,
            'baslik', g.baslik,
            'sayi', g.sayi,
            'abonelikler', (
              select coalesce(
                jsonb_agg(jsonb_build_object(
                  'endpoint', p.endpoint,
                  'p256dh', p.p256dh,
                  'auth', p.auth
                )), '[]'::jsonb)
              from public.push_abonelikleri p
              where p.user_id = g.user_id
            )
          )
        ),
        '[]'::jsonb
      )
    ),
    count(*)::int
  into v_govde, v_sayi
  from gonderilecek g;

  if coalesce(v_sayi, 0) = 0 then
    return 0;
  end if;

  select decrypted_secret into v_sir
  from vault.decrypted_secrets
  where name = 'hatirlatma_sirri';

  perform net.http_post(
    url := 'https://disiplin-plum.vercel.app/api/hatirlatma',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_sir
    ),
    body := v_govde,
    timeout_milliseconds := 20000
  );

  return v_sayi;
end;
$$;

-- Bu fonksiyonu yalnızca zamanlayıcı çağırır; API'den erişilmemeli.
revoke all on function public.hatirlatmalari_gonder() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Beş dakikada bir
-- ---------------------------------------------------------------------------
select cron.unschedule('disiplin-hatirlatmalar')
where exists (select 1 from cron.job where jobname = 'disiplin-hatirlatmalar');

select cron.schedule(
  'disiplin-hatirlatmalar',
  '*/5 * * * *',
  $$select public.hatirlatmalari_gonder();$$
);
