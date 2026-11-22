"use client";

import { motion } from "framer-motion";

const CAP = 56;
const KALINLIK = 5;
const YARICAP = (CAP - KALINLIK) / 2;
const CEVRE = 2 * Math.PI * YARICAP;

export default function ProgressRing({
  yapilan,
  toplam,
}: {
  yapilan: number;
  toplam: number;
}) {
  const oran = toplam === 0 ? 0 : yapilan / toplam;
  const tamam = toplam > 0 && yapilan === toplam;

  return (
    <div
      className="relative shrink-0"
      style={{ width: CAP, height: CAP }}
      role="img"
      aria-label={`${toplam} görevden ${yapilan} tanesi yapıldı`}
    >
      <svg width={CAP} height={CAP} className="-rotate-90">
        <circle
          cx={CAP / 2}
          cy={CAP / 2}
          r={YARICAP}
          fill="none"
          strokeWidth={KALINLIK}
          className="stroke-bordo-soft"
        />
        <motion.circle
          cx={CAP / 2}
          cy={CAP / 2}
          r={YARICAP}
          fill="none"
          strokeWidth={KALINLIK}
          strokeLinecap="round"
          strokeDasharray={CEVRE}
          className={tamam ? "stroke-success" : "stroke-bordo"}
          initial={false}
          animate={{ strokeDashoffset: CEVRE * (1 - oran) }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </svg>

      <span
        className={`absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums transition-colors ${
          tamam ? "text-success" : "text-ink"
        }`}
      >
        {yapilan}/{toplam}
      </span>
    </div>
  );
}
