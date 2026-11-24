-- ===========================================================================
-- Disiplin — elle sıralama ve sabitleme
--
-- Şimdiye kadar listeler `created_at`e göre diziliyordu: eklediğin sırayla.
-- Artık kullanıcı kartları sürükleyerek sıralayabiliyor ve önemli olanları
-- en üste sabitleyebiliyor.
--
-- `sira` NEDEN ONDALIK (double precision)?
-- Tam sayı olsaydı, bir kartı iki kartın arasına taşımak altındaki bütün
-- satırların numarasını kaydırmayı gerektirirdi — tek sürüklemede onlarca
-- güncelleme. Ondalıkta ise iki komşunun ORTASI alınır (3 ile 4 arasına
-- 3.5) ve YALNIZCA sürüklenen satır güncellenir. Tek istek, tek yazma.
-- Ondalık hassasiyeti bu ölçekte tükenmez; yine de kod aralık daralırsa
-- grubu yeniden numaralandırıyor (bkz. lib/siralama.ts).
--
-- Varsayılan epoch saniyesi: yeni eklenen satır her zaman listenin sonuna
-- düşer, çünkü değer sürekli artar. Uygulamanın ekleme kodunda ayrıca bir
-- şey hesaplamasına gerek kalmıyor.
--
-- `now()` DEĞİL `clock_timestamp()`: now() bir işlemin başlangıç anını
-- döndürür ve işlem boyunca DEĞİŞMEZ. Tek bir INSERT ile birden çok satır
-- eklenirse hepsi aynı sıra numarasını alır ve aralarındaki sıra rastgele
-- kalır. clock_timestamp() gerçek saati okur, her satıra farklı değer verir.
-- ===========================================================================

alter table public.tasks
  add column if not exists sira double precision,
  add column if not exists sabit boolean not null default false;

-- Mevcut satırlar eklenme sırasını korusun.
update public.tasks
  set sira = extract(epoch from created_at)
  where sira is null;

alter table public.tasks
  alter column sira set default extract(epoch from clock_timestamp()),
  alter column sira set not null;

-- Listeler hep bu sırayla okunuyor: önce sabitlenenler, sonra sıra numarası.
create index if not exists tasks_kullanici_sira_idx
  on public.tasks (user_id, sabit desc, sira);

-- 0005'teki sütun bazında yetkiye iki sütun daha eklenir. Tarih, tür ve
-- sahiplik sütunları hâlâ kapalı.
grant update (sira, sabit)
  on table public.tasks
  to authenticated;
