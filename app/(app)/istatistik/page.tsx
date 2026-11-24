import type { Metadata } from "next";

import EmptyState from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";
import GunCubuklari from "@/components/istatistik/GunCubuklari";
import IsiHaritasi from "@/components/istatistik/IsiHaritasi";
import OzetKutulari from "@/components/istatistik/OzetKutulari";
import { bugunBaku } from "@/lib/dates";
import {
  type GorevAraligi,
  enErkenGun,
  gunAdiDokumu,
  gunlukDurumlar,
  isiHaritasi,
  ozetCikar,
} from "@/lib/istatistik";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "İstatistik · Disiplin",
};

type SatirBicimi = {
  start_date: string;
  end_date: string;
  weekdays: number[] | null;
  completions: { done_date: string }[];
};

export default async function IstatistikPage() {
  const bugun = bugunBaku();
  const supabase = await createClient();

  // Günlük görevler ve hedefler birlikte: istatistik "bugün ne yapman
  // gerekiyordu, ne kadarını yaptın" sorusunun cevabı, tür ayrımı yok.
  // Tarih filtresi yok, çünkü geçmiş de sayılıyor; RLS zaten kendi
  // satırlarından başkasını döndürmüyor.
  const { data } = await supabase
    .from("tasks")
    .select("start_date, end_date, weekdays, completions(done_date)");

  const gorevler: GorevAraligi[] = ((data ?? []) as SatirBicimi[]).map(
    (satir) => ({
      baslangic: satir.start_date,
      bitisHaric: satir.end_date,
      gunler: satir.weekdays,
      yapilanGunler: new Set(satir.completions.map((tik) => tik.done_date)),
    }),
  );

  const durumlar = gunlukDurumlar(gorevler, enErkenGun(gorevler, bugun), bugun);
  const ozet = ozetCikar(durumlar, bugun);

  return (
    <>
      <PageHeading
        title="İstatistik"
        subtitle={
          ozet.toplamPlanli === 0
            ? "Görev ekledikçe buraya geçmişin birikir."
            : "Bugüne kadarki bütün günlük görevlerin ve hedeflerin."
        }
      />

      {ozet.toplamPlanli === 0 ? (
        <EmptyState
          simge="grafik"
          title="Henüz veri yok"
          hint="İlk görevini ekleyip tikledikten sonra burada geçmişini, serini ve ısı haritanı göreceksin."
        />
      ) : (
        <div className="flex flex-col gap-7">
          <OzetKutulari ozet={ozet} />

          <section>
            <h2 className="text-muted mb-2.5 text-[12.5px] font-semibold tracking-wide uppercase">
              Son 18 hafta
            </h2>
            <IsiHaritasi haftalar={isiHaritasi(durumlar, bugun)} />
          </section>

          <section>
            <h2 className="text-muted mb-2.5 text-[12.5px] font-semibold tracking-wide uppercase">
              Haftanın günleri
            </h2>
            <GunCubuklari dokum={gunAdiDokumu(durumlar)} />
            <p className="text-muted mt-2 text-[12.5px] leading-snug">
              Her günün kendi geçmişindeki başarı oranı. En yüksek olan yeşil.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
