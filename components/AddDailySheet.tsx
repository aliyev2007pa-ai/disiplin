"use client";

import { useState } from "react";

import BottomSheet from "./BottomSheet";
import Simge, {
  SIMGE_LISTESI,
  VARSAYILAN_SIMGE,
  simgeEtiketi,
} from "./Simge";

const EN_UZUN_BASLIK = 120;

export default function AddDailySheet({
  acik,
  onKapat,
  onEkle,
}: {
  acik: boolean;
  onKapat: () => void;
  onEkle: (baslik: string, simge: string) => void;
}) {
  const [baslik, setBaslik] = useState("");
  const [simge, setSimge] = useState<string>(VARSAYILAN_SIMGE);

  function kapat() {
    setBaslik("");
    setSimge(VARSAYILAN_SIMGE);
    onKapat();
  }

  function gonder(olay: React.FormEvent<HTMLFormElement>) {
    olay.preventDefault();

    const temiz = baslik.trim();
    if (!temiz) return;

    onEkle(temiz, simge);
    kapat();
  }

  return (
    <BottomSheet acik={acik} baslik="Görev ekle" onKapat={kapat}>
      <form onSubmit={gonder} className="flex flex-col gap-5">
        <label className="block">
          <span className="text-ink block text-[13.5px] font-semibold">
            Ne yapacaksın?
          </span>
          <input
            type="text"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            maxLength={EN_UZUN_BASLIK}
            required
            autoFocus
            placeholder="Faturayı öde"
            className="border-bordo-soft bg-surface text-ink placeholder:text-muted focus:border-bordo mt-1.5 block w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors"
          />
        </label>

        <div>
          <span className="text-ink block text-[13.5px] font-semibold">
            Simge
          </span>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {SIMGE_LISTESI.map((secenek) => {
              const secili = secenek === simge;

              return (
                <button
                  key={secenek}
                  type="button"
                  onClick={() => setSimge(secenek)}
                  aria-pressed={secili}
                  aria-label={simgeEtiketi(secenek)}
                  title={simgeEtiketi(secenek)}
                  className={`flex aspect-square items-center justify-center rounded-xl border transition-colors ${
                    secili
                      ? "border-bordo bg-bordo-soft text-bordo"
                      : "border-transparent bg-surface text-muted hover:border-bordo-soft hover:text-ink"
                  }`}
                >
                  <Simge ad={secenek} className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={!baslik.trim()}
          className="bg-bordo hover:bg-bordo-dark w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>
    </BottomSheet>
  );
}
