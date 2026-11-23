"use client";

import { motion, useAnimationControls } from "framer-motion";

import CheckButton from "./CheckButton";
import Simge from "./Simge";

/**
 * Tik animasyonu (PROJE-PLANI.md bölüm 7):
 *  1. Buton yaylanarak küçülüp büyür (CheckButton içinde).
 *  2. Yeşil, butonun olduğu noktadan başlayıp dairesel olarak kartı doldurur.
 *  3. Tik işareti çizilerek belirir (CheckButton içinde).
 *  4. Kart hafifçe "nefes alır".
 *  5-6. Titreşim ve ses (çağıran taraf tetikler).
 *  8. Geri alınınca aynı animasyon tersine ve daha hızlı oynar.
 *
 * Dış <li> listeye giriş/çıkışı ve yeniden dizilmeyi yönetir; içteki katman
 * yalnızca nefes animasyonunu taşır. İkisi ayrı tutulmazsa birbirini ezer.
 */
export default function TaskCard({
  baslik,
  simge,
  yapildi,
  bekliyor,
  onTikla,
  onSil,
}: {
  baslik: string;
  simge: string;
  yapildi: boolean;
  bekliyor?: boolean;
  onTikla: () => void;
  onSil: () => void;
}) {
  const nefes = useAnimationControls();

  function tikla() {
    // Yalnızca tiklerken nefes aldır; geri alırken sade kalsın.
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
        } bg-surface`}
      >
        {/* Butonun olduğu noktadan yayılan yeşil dolgu */}
        <motion.div
          aria-hidden
          className="bg-success-soft absolute inset-0"
          initial={false}
          animate={{
            clipPath: yapildi
              ? "circle(140% at 86% 50%)"
              : "circle(0% at 86% 50%)",
          }}
          transition={{ duration: yapildi ? 0.45 : 0.25, ease: "easeOut" }}
        />

        <div className="relative flex items-center gap-3 py-3 pr-3 pl-4">
          <Simge
            ad={simge}
            className={`h-6 w-6 shrink-0 transition-colors duration-300 ${
              yapildi ? "text-success" : "text-bordo"
            }`}
          />

          <p
            className={`flex-1 text-[15.5px] leading-snug font-medium transition-colors duration-300 ${
              yapildi ? "text-muted line-through" : "text-ink"
            }`}
          >
            {baslik}
          </p>

          <button
            type="button"
            onClick={onSil}
            aria-label={`${baslik} — seçenekler`}
            className="text-muted hover:bg-bordo-soft hover:text-ink flex h-9 w-7 shrink-0 items-center justify-center rounded-lg text-[19px] leading-none transition-colors"
          >
            ⋯
          </button>

          <CheckButton
            yapildi={yapildi}
            baslik={baslik}
            bekliyor={bekliyor}
            onTikla={tikla}
          />
        </div>
      </motion.div>
    </motion.li>
  );
}
