import GunlukPanel, { type Gorev } from "@/components/GunlukPanel";
import { baslikTarihi, bugunBaku } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

type SatirBicimi = {
  id: string;
  title: string;
  emoji: string;
  completions: { done_date: string }[];
};

export default async function GunlukPage() {
  const bugun = bugunBaku();
  const supabase = await createClient();

  // Bugün aktif olan günlük görevler ve (varsa) bugünkü tikleri.
  // completions üzerindeki filtre gömülü satırları daraltır: dizi boşsa
  // görev bugün tiklenmemiştir.
  const { data } = await supabase
    .from("tasks")
    .select("id, title, emoji, completions(done_date)")
    .eq("kind", "daily")
    .lte("start_date", bugun)
    .gt("end_date", bugun)
    .eq("completions.done_date", bugun)
    .order("created_at", { ascending: true });

  const gorevler: Gorev[] = ((data ?? []) as SatirBicimi[]).map((satir) => ({
    id: satir.id,
    baslik: satir.title,
    emoji: satir.emoji,
    yapildi: satir.completions.length > 0,
  }));

  return (
    <GunlukPanel
      bugun={bugun}
      tarihBasligi={baslikTarihi(bugun)}
      baslangicGorevleri={gorevler}
    />
  );
}
