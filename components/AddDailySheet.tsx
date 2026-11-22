"use client";

import { useState } from "react";

import { EMOJILER, VARSAYILAN_EMOJI } from "@/lib/emojiler";

import BottomSheet from "./BottomSheet";

const EN_UZUN_BASLIK = 120;

export default function AddDailySheet({
  acik,
  onKapat,
  onEkle,
}: {
  acik: boolean;
  onKapat: () => void;
  onEkle: (baslik: string, emoji: string) => void;
}) {
  const [baslik, setBaslik] = useState("");
  const [emoji, setEmoji] = useState<string>(VARSAYILAN_EMOJI);

  function kapat() {
    setBaslik("");
    setEmoji(VARSAYILAN_EMOJI);
    onKapat();
  }

  function gonder(olay: React.FormEvent<HTMLFormElement>) {
    olay.preventDefault();

    const temiz = baslik.trim();
    if (!temiz) return;

    onEkle(temiz, emoji);
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
            {EMOJILER.map((secenek) => {
              const secili = secenek === emoji;

              return (
                <button
                  key={secenek}
                  type="button"
                  onClick={() => setEmoji(secenek)}
                  aria-pressed={secili}
                  aria-label={`Simge ${secenek}`}
                  className={`flex aspect-square items-center justify-center rounded-xl border text-[20px] transition-colors ${
                    secili
                      ? "border-bordo bg-bordo-soft"
                      : "border-transparent bg-surface hover:border-bordo-soft"
                  }`}
                >
                  {secenek}
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
