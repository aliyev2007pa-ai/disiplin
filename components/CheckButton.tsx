"use client";

import { motion } from "framer-motion";

export default function CheckButton({
  yapildi,
  baslik,
  bekliyor,
  onTikla,
}: {
  yapildi: boolean;
  baslik: string;
  bekliyor?: boolean;
  onTikla: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onTikla}
      disabled={bekliyor}
      aria-pressed={yapildi}
      aria-label={
        yapildi ? `${baslik} — tiki geri al` : `${baslik} — yapıldı olarak işaretle`
      }
      whileTap={{ scale: 0.86 }}
      transition={{ type: "spring", stiffness: 520, damping: 17 }}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-70"
    >
      <span
        className={`absolute inset-0.5 rounded-full border-2 transition-colors duration-300 ${
          yapildi
            ? "border-success bg-success"
            : "border-bordo-soft bg-bg hover:border-bordo"
        }`}
      />

      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative h-[22px] w-[22px]"
        aria-hidden
      >
        <motion.path
          d="M5.5 12.4 L10 16.8 L18.5 7.2"
          stroke="white"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: yapildi ? 1 : 0, opacity: yapildi ? 1 : 0 }}
          transition={{
            pathLength: { duration: yapildi ? 0.3 : 0.15, ease: "easeOut" },
            opacity: { duration: 0.1 },
          }}
        />
      </svg>
    </motion.button>
  );
}
