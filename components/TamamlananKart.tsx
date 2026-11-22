import { gunEkle, kisaTarih } from "@/lib/dates";
import { enUzunSeri, planliGunSayisi } from "@/lib/stats";
import { gunlerEtiketi } from "@/lib/sureler";
import { basariCumlesi } from "@/lib/turkce";

export type TamamlananHedef = {
  id: string;
  baslik: string;
  emoji: string;
  sureEtiketi: string;
  gunler: number[] | null;
  baslangic: string;
  bitisHaric: string;
  yapilanGunler: string[];
};

/**
 * Süresi dolmuş bir hedefin özeti. Etkileşimi yok, bu yüzden sunucu bileşeni
 * olarak kalır: tarayıcıya hiç JavaScript inmez.
 */
export default function TamamlananKart({
  hedef,
}: {
  hedef: TamamlananHedef;
}) {
  const yapilanKume = new Set(hedef.yapilanGunler);
  const payda = planliGunSayisi(
    hedef.baslangic,
    hedef.bitisHaric,
    hedef.gunler,
  );
  const pay = yapilanKume.size;
  const yuzde = payda === 0 ? 0 : Math.round((pay / payda) * 100);
  const seri = enUzunSeri(
    hedef.baslangic,
    hedef.bitisHaric,
    hedef.gunler,
    yapilanKume,
  );

  // end_date hariç olduğu için son tiklenebilir gün bir öncesidir.
  const sonGun = gunEkle(hedef.bitisHaric, -1);
  const basarili = yuzde >= 80;

  return (
    <li
      className={`rounded-2xl border px-4 py-3.5 ${
        basarili
          ? "border-success/40 bg-success-soft"
          : "border-bordo-soft bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-[27px] leading-none" aria-hidden>
          {hedef.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-ink text-[15.5px] leading-snug font-semibold">
            {hedef.baslik}
          </p>
          <p className="text-muted mt-1 text-[12.5px]">
            {hedef.sureEtiketi}
            {hedef.gunler === null ? "" : ` · ${gunlerEtiketi(hedef.gunler)}`}
            {` · ${kisaTarih(hedef.baslangic)} – ${kisaTarih(sonGun)}`}
          </p>
        </div>

        <span
          className={`shrink-0 text-[19px] leading-none font-bold tabular-nums ${
            basarili ? "text-success" : "text-bordo"
          }`}
        >
          %{yuzde}
        </span>
      </div>

      <div className="mt-3">
        <div
          className="bg-bordo-soft h-1.5 w-full overflow-hidden rounded-full"
          role="img"
          aria-label={`Başarı yüzdesi ${yuzde}`}
        >
          <div
            className={`h-full rounded-full ${
              basarili ? "bg-success" : "bg-bordo"
            }`}
            style={{ width: `${yuzde}%` }}
          />
        </div>

        <div className="text-muted mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[12.5px]">
          <span>{basariCumlesi(pay, payda)}</span>
          {seri > 0 ? (
            <span className="tabular-nums">🔥 En uzun seri: {seri} gün</span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
