"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useYerelDeger, yerelYaz } from "@/lib/yerel";

import Simge from "./Simge";

const ANAHTAR = "disiplin:dun-ozeti";

export type DunDurumu = {
  toplam: number;
  yapilan: number;
  yapilmayanlar: { baslik: string; simge: string }[];
};

/**
 * Günün ilk açılışında bir kez görünen dün özeti (Bölüm 6 kural 7).
 *
 * "Bir kez" cihaz bazındadır: en son gösterildiği gün localStorage'da tutulur,
 * yani telefonda ve bilgisayarda ayrı ayrı bir kez çıkabilir. Sunucuda bu
 * bilgi olmadığı için ilk karede gizli başlar, ardından yerel değere göre
 * açılır — böylece sayfa yenilenince "yanıp sönme" olmaz.
 */
export default function DunOzeti({
  bugun,
  durum,
}: {
  bugun: string;
  durum: DunDurumu;
}) {
  const sonGosterim = useYerelDeger(ANAHTAR, bugun);
  const gorunur = sonGosterim !== bugun;

  const kusursuz = durum.yapilan === durum.toplam;

  return (
    <AnimatePresence>
      {gorunur ? (
        <motion.div
          initial={{ opacity: 0, y: -14, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -14, height: 0 }}
          transition={{ duration: 0.34, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <section
            aria-label="Dün özeti"
            className={`mt-3 rounded-2xl border px-4 py-3.5 ${
              kusursuz
                ? "border-success/40 bg-success-soft"
                : "border-bordo-soft bg-surface"
            }`}
          >
            <p
              className={`font-serif flex items-center gap-1.5 text-[17px] font-bold ${
                kusursuz ? "text-success" : "text-ink"
              }`}
            >
              {kusursuz ? (
                <>
                  <Simge ad="alev" className="h-4 w-4 shrink-0" />
                  {`Dün ${durum.yapilan}/${durum.toplam} — kusursuz gün`}
                </>
              ) : (
                `Dün ${durum.yapilan}/${durum.toplam}`
              )}
            </p>

            {kusursuz ? null : (
              <>
                <p className="text-muted mt-2 text-[12.5px] font-semibold tracking-wide uppercase">
                  Yapılmayanlar
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {durum.yapilmayanlar.map((is, sira) => (
                    <li
                      key={`${is.baslik}-${sira}`}
                      className="text-ink flex items-center gap-2 text-[14px]"
                    >
                      <Simge
                        ad={is.simge}
                        className="text-bordo h-4 w-4 shrink-0"
                      />
                      <span className="min-w-0 flex-1">{is.baslik}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <button
              type="button"
              onClick={() => yerelYaz(ANAHTAR, bugun)}
              className={`mt-3.5 w-full rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white transition-colors ${
                kusursuz
                  ? "bg-success hover:brightness-95"
                  : "bg-bordo hover:bg-bordo-dark"
              }`}
            >
              Tamam
            </button>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
