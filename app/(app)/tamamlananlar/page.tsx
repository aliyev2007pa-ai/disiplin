import type { Metadata } from "next";

import EmptyState from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";
import TamamlananKart, {
  type TamamlananHedef,
} from "@/components/TamamlananKart";
import { bugunBaku } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tamamlananlar · Disiplin",
};

type SatirBicimi = {
  id: string;
  title: string;
  emoji: string;
  start_date: string;
  end_date: string;
  duration_label: string;
  weekdays: number[] | null;
  completions: { done_date: string }[];
};

export default async function TamamlananlarPage() {
  const bugun = bugunBaku();
  const supabase = await createClient();

  // Süresi dolmuş hedefler: end_date hariç olduğu için end_date <= bugün
  // demek "son tiklenebilir günü de geçti" demektir. En yeni en üstte.
  const { data } = await supabase
    .from("tasks")
    .select(
      "id, title, emoji, start_date, end_date, duration_label, weekdays, completions(done_date)",
    )
    .eq("kind", "goal")
    .lte("end_date", bugun)
    .order("end_date", { ascending: false });

  const hedefler: TamamlananHedef[] = ((data ?? []) as SatirBicimi[]).map(
    (satir) => ({
      id: satir.id,
      baslik: satir.title,
      emoji: satir.emoji,
      sureEtiketi: satir.duration_label,
      gunler: satir.weekdays,
      baslangic: satir.start_date,
      bitisHaric: satir.end_date,
      yapilanGunler: satir.completions.map((tik) => tik.done_date),
    }),
  );

  return (
    <>
      <PageHeading
        title="Tamamlananlar"
        subtitle={
          hedefler.length === 0
            ? "Süresi dolan hedeflerin özeti. En yeni en üstte."
            : `Tamamlanan hedef: ${hedefler.length}`
        }
      />

      {hedefler.length === 0 ? (
        <EmptyState
          emoji="🏅"
          title="Henüz tamamlanan hedef yok"
          hint="Bir hedefin süresi dolduğunda başarı özetiyle birlikte buraya taşınır."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {hedefler.map((hedef) => (
            <TamamlananKart key={hedef.id} hedef={hedef} />
          ))}
        </ul>
      )}
    </>
  );
}
