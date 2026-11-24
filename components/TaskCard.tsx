"use client";

import { Reorder, motion, useAnimationControls, useDragControls } from "framer-motion";

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
 * Dış <Reorder.Item> (bir <li>) listeye giriş/çıkışı, yeniden dizilmeyi ve
 * sürüklemeyi yönetir; içteki katman yalnızca nefes animasyonunu taşır.
 * İkisi ayrı tutulmazsa birbirini ezer.
 *
 * SÜRÜKLEME YALNIZCA TUTAMAKTAN başlar (`dragListener={false}`). Kartın
 * tamamı sürüklenebilir olsaydı telefonda listeyi parmakla kaydırmak
 * imkânsızlaşırdı: her kaydırma denemesi kartı tutup kaldırırdı.
 */
export default function TaskCard<T>({
  deger,
  baslik,
  simge,
  sabit,
  hatirlatma,
  yapildi,
  bekliyor,
  suruklenebilir,
  onTikla,
  onSecenekler,
  onSurukleBitti,
}: {
  /** Reorder.Group'un `values` dizisindeki karşılığı. */
  deger: T;
  baslik: string;
  simge: string;
  sabit: boolean;
  /** "21:30" ya da null; doluysa kartta küçük bir saat görünür. */
  hatirlatma: string | null;
  yapildi: boolean;
  bekliyor?: boolean;
  /** Grupta tek kart varsa tutamak gösterilmez. */
  suruklenebilir: boolean;
  onTikla: () => void;
  onSecenekler: () => void;
  onSurukleBitti: () => void;
}) {
  const nefes = useAnimationControls();
  const suruklemeKontrolu = useDragControls();

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
    <Reorder.Item
      value={deger}
      dragListener={false}
      dragControls={suruklemeKontrolu}
      onDragEnd={onSurukleBitti}
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
            className={`flex min-w-0 flex-1 items-center gap-1.5 text-[15.5px] leading-snug font-medium transition-colors duration-300 ${
              yapildi ? "text-muted line-through" : "text-ink"
            }`}
          >
            {sabit ? (
              <Simge
                ad="raptiye"
                className="text-bordo h-3.5 w-3.5 shrink-0"
              />
            ) : null}
            <span className="min-w-0 flex-1">{baslik}</span>
          </p>

          {hatirlatma ? (
            <span
              className="text-muted flex shrink-0 items-center gap-1 text-[12px] tabular-nums"
              title={`Hatırlatma: ${hatirlatma}`}
            >
              <Simge ad="saat" className="h-3.5 w-3.5" />
              {hatirlatma}
            </span>
          ) : null}

          {suruklenebilir ? (
            <button
              type="button"
              onPointerDown={(olay) => suruklemeKontrolu.start(olay)}
              aria-label={`${baslik} — sürükleyerek sırala`}
              style={{ touchAction: "none" }}
              className="text-muted hover:bg-bordo-soft hover:text-ink flex h-9 w-6 shrink-0 cursor-grab items-center justify-center rounded-lg transition-colors active:cursor-grabbing"
            >
              <Simge ad="tutamak" className="h-5 w-5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onSecenekler}
            aria-label={`${baslik} — seçenekler`}
            className="text-muted hover:bg-bordo-soft hover:text-ink flex h-9 w-6 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <Simge ad="ucNokta" className="h-5 w-5" />
          </button>

          <CheckButton
            yapildi={yapildi}
            baslik={baslik}
            bekliyor={bekliyor}
            onTikla={tikla}
          />
        </div>
      </motion.div>
    </Reorder.Item>
  );
}
