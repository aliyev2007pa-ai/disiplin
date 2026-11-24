"use client";

import Simge from "./Simge";

/**
 * Görev ve hedef formlarındaki "Hatırlatma" alanı. İki formda da aynı
 * göründüğü için tek yerde duruyor.
 *
 * `step={300}`: saat seçici beş dakikalık adımlarla gelsin. Zamanlayıcı da
 * beş dakikada bir çalıştığı için bundan ince bir ayar zaten tutmazdı
 * (bkz. migration 0008).
 */
export default function HatirlatmaAlani({
  deger,
  onDegistir,
  ipucu,
}: {
  /** "21:30" ya da boş dizgi. */
  deger: string;
  onDegistir: (yeni: string) => void;
  ipucu: string;
}) {
  return (
    <div>
      <span className="text-ink block text-[13.5px] font-semibold">
        Hatırlatma <span className="text-muted font-normal">(isteğe bağlı)</span>
      </span>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-bordo flex items-center">
          <Simge ad="saat" className="h-5 w-5" />
        </span>

        <input
          type="time"
          value={deger}
          step={300}
          aria-label="Hatırlatma saati"
          onChange={(e) => onDegistir(e.target.value)}
          className="border-bordo-soft bg-surface text-ink focus:border-bordo rounded-xl border px-3 py-2.5 text-[15px] tabular-nums outline-none transition-colors"
        />

        {deger ? (
          <button
            type="button"
            onClick={() => onDegistir("")}
            className="text-muted hover:bg-surface hover:text-ink rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors"
          >
            Kaldır
          </button>
        ) : null}
      </div>

      <p className="text-muted mt-1.5 text-[12.5px] leading-snug">{ipucu}</p>
    </div>
  );
}
