import type { Ozet } from "@/lib/istatistik";

import Simge from "../Simge";

function Kutu({
  simge,
  deger,
  etiket,
  vurgu,
}: {
  simge: string;
  deger: string;
  etiket: string;
  vurgu?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        vurgu ? "border-success/40 bg-success-soft" : "border-bordo-soft bg-surface"
      }`}
    >
      <Simge
        ad={simge}
        className={`h-5 w-5 ${vurgu ? "text-success" : "text-bordo"}`}
      />
      <p
        className={`mt-2 text-[22px] leading-none font-bold tabular-nums ${
          vurgu ? "text-success" : "text-ink"
        }`}
      >
        {deger}
      </p>
      <p className="text-muted mt-1 text-[12.5px] leading-snug">{etiket}</p>
    </div>
  );
}

export default function OzetKutulari({ ozet }: { ozet: Ozet }) {
  const yuzde = Math.round(ozet.oran * 100);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Kutu
        simge="madalya"
        deger={`%${yuzde}`}
        etiket={`${ozet.toplamYapilan} / ${ozet.toplamPlanli} planlı iş`}
        vurgu={yuzde >= 80}
      />
      <Kutu
        simge="alev"
        deger={`${ozet.guncelSeri}`}
        etiket="günlük güncel seri"
        vurgu={ozet.guncelSeri > 0}
      />
      <Kutu
        simge="yildiz"
        deger={`${ozet.kusursuzGun}`}
        etiket="kusursuz gün (hepsi yapıldı)"
      />
      <Kutu
        simge="yukselis"
        deger={`${ozet.enUzunSeri}`}
        etiket="en uzun kusursuz seri"
      />
    </div>
  );
}
