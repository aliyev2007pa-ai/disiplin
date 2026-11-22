"use client";

import { MotionConfig } from "framer-motion";

/**
 * Cihazda "hareketi azalt" açıksa Framer Motion animasyonlarını sadeleştirir.
 *
 * CSS'teki `prefers-reduced-motion` kuralı yalnızca CSS geçişlerini durdurur;
 * tik dolgusu, nefes ve panel kayması JavaScript ile sürüldüğü için onlara
 * işlemez. `reducedMotion="user"` bu animasyonları konum/ölçek yerine
 * opaklıkla oynatır — hareket duyarlılığı olan biri için fark eder.
 */
export default function HareketAyari({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
