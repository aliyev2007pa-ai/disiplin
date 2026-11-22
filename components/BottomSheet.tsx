"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

/** Alttan kayan panel. Mobil öncelikli; masaüstünde ortada kalır. */
export default function BottomSheet({
  acik,
  baslik,
  onKapat,
  children,
}: {
  acik: boolean;
  baslik: string;
  onKapat: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!acik) return;

    function tusa(olay: KeyboardEvent) {
      if (olay.key === "Escape") onKapat();
    }

    document.addEventListener("keydown", tusa);
    const oncekiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", tusa);
      document.body.style.overflow = oncekiTasma;
    };
  }, [acik, onKapat]);

  return (
    <AnimatePresence>
      {acik ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onKapat}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={baslik}
            className="bg-bg relative w-full max-w-content rounded-t-3xl px-5 pt-5 pb-8 shadow-[0_-8px_32px_rgba(28,26,27,0.12)] sm:mb-6 sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          >
            <div
              aria-hidden
              className="bg-bordo-soft mx-auto mb-4 h-1 w-10 rounded-full"
            />

            <h2 className="font-serif text-ink mb-4 text-[19px] font-bold">
              {baslik}
            </h2>

            {children}

            <div className="pb-safe" />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
