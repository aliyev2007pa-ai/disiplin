import type { GunAdiDurumu } from "@/lib/istatistik";
import { GUNLER } from "@/lib/sureler";

/**
 * Haftanın hangi gününde daha iyi olduğunu gösteren çubuklar.
 *
 * SVG değil, düpedüz kutular: yükseklik yüzdeyle veriliyor, genişliği flex
 * ayarlıyor. Uygulamanın ilerleme çubuklarıyla aynı görsel dil.
 */
export default function GunCubuklari({
  dokum,
}: {
  dokum: GunAdiDurumu[];
}) {
  const enIyi = Math.max(...dokum.map((g) => g.oran));

  return (
    <div className="border-bordo-soft bg-surface rounded-2xl border px-4 pt-4 pb-3">
      <div className="flex h-32 items-end gap-1.5">
        {dokum.map((gun) => {
          const yuzde = Math.round(gun.oran * 100);
          const planliVar = gun.planli > 0;
          // Birden çok gün aynı orandaysa hepsi vurgulanır; "en iyi"
          // rozeti gibi değil, sadece göze çarpsın diye.
          const enIyiMi = planliVar && gun.oran === enIyi && enIyi > 0;

          return (
            <div
              key={gun.iso}
              className="flex h-full flex-1 flex-col items-center gap-1"
            >
              <span className="text-muted text-[10.5px] leading-none tabular-nums">
                {planliVar ? `%${yuzde}` : "—"}
              </span>

              <div className="bg-bordo-soft flex w-full flex-1 items-end overflow-hidden rounded-md">
                <div
                  className={`w-full rounded-md ${
                    enIyiMi ? "bg-success" : "bg-bordo"
                  }`}
                  style={{ height: `${Math.max(gun.oran * 100, planliVar ? 3 : 0)}%` }}
                  role="img"
                  aria-label={`${GUNLER[gun.iso - 1].tam}: ${
                    planliVar
                      ? `${gun.yapilan} / ${gun.planli} iş, yüzde ${yuzde}`
                      : "planlı iş yok"
                  }`}
                />
              </div>

              <span className="text-muted text-[11px] leading-none">
                {GUNLER[gun.iso - 1].kisa}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
