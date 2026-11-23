-- ===========================================================================
-- Disiplin — emoji yerine kendi ikon setimiz
--
-- Arayüzdeki emojiler yerini uygulamanın kendi çizdiği ikonlara bıraktı
-- (components/Simge.tsx). `tasks.emoji` kolonu tarihsel olarak bu adı
-- koruyor ama içinde artık emoji karakteri değil bir simge ANAHTARI var:
-- 'yildiz', 'kitap', 'bilgisayar' gibi.
--
-- NEDEN GEREKLİ: eski kısıt `char_length(emoji) between 1 and 8` idi; bir
-- emoji en fazla 8 karakterdi. 'bilgisayar' (10) ve 'alisveris' (9) gibi
-- anahtarlar bu kısıttan geçemez, yani kolonu genişletmeden yeni görev
-- eklenemez.
--
-- ESKİ SATIRLAR OLDUĞU GİBİ KALIR: içinde '⭐' yazan satırlara dokunulmuyor.
-- Simge.tsx içindeki ESKI_KARSILIKLAR tablosu onları doğru ikona çevirir.
-- Böylece bu migration ile kod dağıtımının sırası birbirine bağlı değil;
-- hangisi önce olursa olsun uygulama çalışmaya devam eder.
-- ===========================================================================

-- Uzunluk kısıtını genişlet. Kısıt adı Postgres'in verdiği varsayılan addır
-- (tablo_kolon_check); yoksa sessizce geçer.
alter table public.tasks drop constraint if exists tasks_emoji_check;

alter table public.tasks
  add constraint tasks_emoji_check
  check (char_length(emoji) between 1 and 32);

-- Yeni satırların varsayılanı da artık anahtar olsun. (Uygulama simgeyi her
-- zaman açıkça gönderiyor; bu yalnızca panelden elle eklenen satırlar için.)
alter table public.tasks alter column emoji set default 'yildiz';
