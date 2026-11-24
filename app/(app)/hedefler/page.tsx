import type { Metadata } from "next";

import HedeflerPanel from "@/components/HedeflerPanel";
import type { Hedef } from "@/components/GoalCard";
import { bugunBaku } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Hedefler · Disiplin",
};

type SatirBicimi = {
  id: string;
  title: string;
  emoji: string;
  minutes: number | null;
  start_date: string;
  end_date: string;
  duration_label: string;
  weekdays: number[] | null;
  sira: number;
  sabit: boolean;
  completions: { done_date: string }[];
};

export default async function HedeflerPage() {
  const bugun = bugunBaku();
  const supabase = await createClient();

  // Bugün aktif olan hedefler. Tikler filtresiz çekilir: seri ve "35 / 90"
  // hesabı için hedefin bütün geçmişi gerekir.
  const { data } = await supabase
    .from("tasks")
    .select(
      "id, title, emoji, minutes, start_date, end_date, duration_label, weekdays, sira, sabit, completions(done_date)",
    )
    .eq("kind", "goal")
    .lte("start_date", bugun)
    .gt("end_date", bugun)
    // Sabitlenenler üstte, sonra elle verilen sıra (bkz. 0006 migration).
    .order("sabit", { ascending: false })
    .order("sira", { ascending: true });

  const hedefler: Hedef[] = ((data ?? []) as SatirBicimi[]).map((satir) => ({
    id: satir.id,
    baslik: satir.title,
    simge: satir.emoji,
    dakika: satir.minutes,
    sureEtiketi: satir.duration_label,
    gunler: satir.weekdays,
    baslangic: satir.start_date,
    bitisHaric: satir.end_date,
    sira: satir.sira,
    sabit: satir.sabit,
    yapilanGunler: satir.completions.map((tik) => tik.done_date),
  }));

  return <HedeflerPanel bugun={bugun} baslangicHedefleri={hedefler} />;
}
