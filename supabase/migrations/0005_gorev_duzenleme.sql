-- ===========================================================================
-- Disiplin — görev ve hedef düzenleme
--
-- 0001 ve 0003'te güncelleme bilerek kapalıydı: düzenleme yerine "sil +
-- yeniden ekle" denmişti. Artık düzenleme var, ama DAR bir kapı açıyoruz.
--
-- NEDEN SÜTUN BAZINDA YETKİ: `grant update on table` demek, kullanıcının
-- HER sütunu değiştirebilmesi demektir — `user_id`'yi başkasınınkiyle
-- değiştirip görevi ona yamamak, `start_date`/`end_date` oynatıp bitmiş bir
-- hedefi diriltmek, `kind` değiştirip günlük görevi hedefe çevirmek dahil.
-- Postgres sütun bazında yetki verebildiği için yalnızca gerçekten
-- düzenlenebilir olması gereken dört sütunu açıyoruz. Diğerlerine yazma
-- denemesi veritabanı seviyesinde reddedilir.
--
-- DEĞİŞTİRİLEMEYENLER ve nedenleri:
--   user_id, kind        → kimlik ve tür; değişmesi veri bütünlüğünü bozar
--   start_date, end_date → geçmiş istatistik bu aralığa göre hesaplanıyor
--   duration_label       → yukarıdaki aralığın yazılı hali; onunla tutarlı
--                          kalmalı, tek başına değişirse yalan söyler
-- Süresini değiştirmek isteyen yeni hedef açar; eskisi Tamamlananlar'da
-- geçmiş kaydı olarak kalır.
-- ===========================================================================

grant update (title, emoji, minutes, weekdays)
  on table public.tasks
  to authenticated;

-- RLS: yalnızca kendi satırını güncelleyebilir.
-- `using`  → hangi satırları görüp güncelleyebileceği
-- `with check` → güncelleme SONRASI satırın da kendisine ait kalması
--   (user_id sütununa yetki vermedik, yani bu zaten ikinci bir kilit)
drop policy if exists tasks_update_own on public.tasks;
create policy tasks_update_own on public.tasks
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
