"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useMemo } from "react";

import { gunAdi } from "@/lib/dates";
import { hedefIstatistikleri, sonrakiPlanliGun } from "@/lib/stats";
import { gunlerEtiketi } from "@/lib/sureler";

import CheckButton from "./CheckButton";
import Simge from "./Simge";

export type Hedef = {
  id: string;
  baslik: string;
  simge: string;
  dakika: number | null;
  sureEtiketi: string;
  gunler: number[] | null;
  baslangic: string;
  bitisHaric: string;
  /** Bu hedefin tiklendiği tüm günler (`yyyy-MM-dd`). */
  yapilanGunler: string[];
};

function Rozet({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-bordo-soft text-bordo rounded-full px-2.5 py-1 text-[11.5px] font-semibold">
      {children}
    </span>
  );
}

/**
 * Hedef kartı. Tik animasyonu Günlük'teki ile aynıdır (Bölüm 7): yeşil dolgu
 * butonun olduğu noktadan dairesel yayılır, kart hafifçe nefes alır.
 *
 * Bugün planlı olmayan hedef soluk görünür ve tiklenemez; onun yerine sıradaki
 * planlı günü yazar.
 */
export default function GoalCard({
  hedef,
  bugun,
  bekliyor,
  onTikla,
  onSecenekler,
}: {
  hedef: Hedef;
  bugun: string;
  bekliyor?: boolean;
  onTikla: () => void;
  onSecenekler: () => void;
}) {
  const nefes = useAnimationControls();

  const yapilanKume = useMemo(
    () => new Set(hedef.yapilanGunler),
    [hedef.yapilanGunler],
  );

  const ist = useMemo(
    () =>
      hedefIstatistikleri({
        bugun,
        baslangic: hedef.baslangic,
        bitisHaric: hedef.bitisHaric,
        gunler: hedef.gunler,
        yapilanGunler: yapilanKume,
      }),
    [bugun, hedef.baslangic, hedef.bitisHaric, hedef.gunler, yapilanKume],
  );

  const sonraki = useMemo(
    () =>
      ist.bugunPlanli
        ? null
        : sonrakiPlanliGun(bugun, hedef.bitisHaric, hedef.gunler),
    [ist.bugunPlanli, bugun, hedef.bitisHaric, hedef.gunler],
  );

  const yapildi = ist.bugunYapildi;

  function tikla() {
    if (!yapildi) {
      void nefes.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.45, ease: "easeOut" },
      });
    }

    onTikla();
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.div
        animate={nefes}
        className={`relative overflow-hidden rounded-2xl border transition-colors duration-300 ${
          yapildi ? "border-success" : "border-bordo-soft"
        } bg-surface ${ist.bugunPlanli ? "" : "opacity-65"}`}
      >
        {/* Butonun olduğu noktadan yayılan yeşil dolgu */}
        <motion.div
          aria-hidden
          className="bg-success-soft absolute inset-0"
          initial={false}
          animate={{
            clipPath: yapildi
              ? "circle(150% at 86% 24%)"
              : "circle(0% at 86% 24%)",
          }}
          transition={{ duration: yapildi ? 0.45 : 0.25, ease: "easeOut" }}
        />

        <div className="relative px-4 py-3.5">
          <div className="flex items-start gap-3">
            <Simge
              ad={hedef.simge}
              className={`mt-0.5 h-7 w-7 shrink-0 transition-colors duration-300 ${
                yapildi ? "text-success" : "text-bordo"
              }`}
            />

            <div className="min-w-0 flex-1">
              <p
                className={`text-[15.5px] leading-snug font-semibold transition-colors duration-300 ${
                  yapildi ? "text-muted line-through" : "text-ink"
                }`}
              >
                {hedef.baslik}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Rozet>{hedef.sureEtiketi}</Rozet>
                {hedef.dakika === null ? null : (
                  <Rozet>{hedef.dakika} dk</Rozet>
                )}
                {hedef.gunler === null ? null : (
                  <Rozet>{gunlerEtiketi(hedef.gunler)}</Rozet>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onSecenekler}
              aria-label={`${hedef.baslik} — seçenekler`}
              className="text-muted hover:bg-bordo-soft hover:text-ink flex h-9 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            >
              <Simge ad="ucNokta" className="h-5 w-5" />
            </button>

            {ist.bugunPlanli ? (
              <CheckButton
                yapildi={yapildi}
                baslik={hedef.baslik}
                bekliyor={bekliyor}
                onTikla={tikla}
              />
            ) : (
              <span
                aria-hidden
                className="border-bordo-soft text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed text-[15px]"
              >
                —
              </span>
            )}
          </div>

          <div className="mt-3">
            {ist.seri > 0 ? (
              <p className="text-ink mb-1.5 flex items-center gap-1 text-[13px] font-semibold">
                <Simge
                  ad="alev"
                  className={`h-3.5 w-3.5 shrink-0 ${
                    yapildi ? "text-success" : "text-bordo"
                  }`}
                />
                {ist.seri} gün seri
              </p>
            ) : null}

            <div
              className="bg-bordo-soft h-1.5 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`${ist.payda} günden ${ist.pay} günü yapıldı`}
            >
              <motion.div
                className={`h-full rounded-full ${
                  yapildi ? "bg-success" : "bg-bordo"
                }`}
                initial={false}
                animate={{ width: `${ist.oran * 100}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>

            <div className="text-muted mt-1.5 flex items-center justify-between text-[12.5px]">
              <span className="font-medium tabular-nums">
                {ist.pay} / {ist.payda} gün
              </span>

              <span className="tabular-nums">
                {sonraki === null
                  ? `Kalan: ${ist.kalan} gün`
                  : `Sonraki: ${gunAdi(sonraki)}`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
}
