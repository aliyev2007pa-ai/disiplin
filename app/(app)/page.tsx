import DunOzeti, { type DunDurumu } from "@/components/DunOzeti";
import GunlukPanel, { type Gorev } from "@/components/GunlukPanel";
import { baslikTarihi, bugunBaku, gunEkle } from "@/lib/dates";
import { planliMi } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

/** `emoji` kolonu artık simge anahtarı tutar (bkz. components/Simge.tsx). */
type BugunSatiri = {
  id: string;
  title: string;
  emoji: string;
  sira: number;
  sabit: boolean;
  completions: { done_date: string }[];
};

type DunSatiri = {
  title: string;
  emoji: string;
  weekdays: number[] | null;
  completions: { done_date: string }[];
};

export default async function GunlukPage() {
  const bugun = bugunBaku();
  const dun = gunEkle(bugun, -1);
  const supabase = await createClient();

  const [bugunku, dunku] = await Promise.all([
    // Bugün aktif olan günlük görevler ve (varsa) bugünkü tikleri.
    // completions üzerindeki filtre gömülü satırları daraltır: dizi boşsa
    // görev bugün tiklenmemiştir.
    supabase
      .from("tasks")
      .select("id, title, emoji, sira, sabit, completions(done_date)")
      .eq("kind", "daily")
      .lte("start_date", bugun)
      .gt("end_date", bugun)
      .eq("completions.done_date", bugun)
      // Sabitlenenler üstte, sonra elle verilen sıra (bkz. 0006 migration).
      .order("sabit", { ascending: false })
      .order("sira", { ascending: true }),

    // Dün özeti için: dün aktif olan TÜM görevler (günlük + hedef).
    supabase
      .from("tasks")
      .select("title, emoji, weekdays, completions(done_date)")
      .lte("start_date", dun)
      .gt("end_date", dun)
      .eq("completions.done_date", dun)
      .order("created_at", { ascending: true }),
  ]);

  const gorevler: Gorev[] = ((bugunku.data ?? []) as BugunSatiri[]).map(
    (satir) => ({
      id: satir.id,
      baslik: satir.title,
      simge: satir.emoji,
      sira: satir.sira,
      sabit: satir.sabit,
      yapildi: satir.completions.length > 0,
    }),
  );

  // Dün planlı olmayan görevler özete girmez (kural 3).
  const dunPlanlilar = ((dunku.data ?? []) as DunSatiri[]).filter((satir) =>
    planliMi(dun, satir.weekdays),
  );

  const dunDurumu: DunDurumu | null =
    dunPlanlilar.length === 0
      ? null
      : {
          toplam: dunPlanlilar.length,
          yapilan: dunPlanlilar.filter((s) => s.completions.length > 0).length,
          yapilmayanlar: dunPlanlilar
            .filter((s) => s.completions.length === 0)
            .map((s) => ({ baslik: s.title, simge: s.emoji })),
        };

  return (
    <>
      {dunDurumu ? <DunOzeti bugun={bugun} durum={dunDurumu} /> : null}

      <GunlukPanel
        bugun={bugun}
        tarihBasligi={baslikTarihi(bugun)}
        baslangicGorevleri={gorevler}
      />
    </>
  );
}
