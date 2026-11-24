"use client";

import { useState } from "react";

import BottomSheet from "./BottomSheet";
import Simge, {
  SIMGE_LISTESI,
  VARSAYILAN_SIMGE,
  simgeEtiketi,
} from "./Simge";

const EN_UZUN_BASLIK = 120;

/** Düzenlenen görevin değiştirilebilir alanları. */
export type GorevTaslagi = {
  baslik: string;
  simge: string;
};

/**
 * Formun kendisi ayrı bir bileşen, çünkü BottomSheet kapalıyken çocuklarını
 * DOM'dan kaldırıyor. Böylece panel her açıldığında form sıfırdan kurulur ve
 * başlangıç değerlerini o anki `duzenlenen`den alır — elle "sıfırla" çağırmaya
 * ya da prop değişimini efektle yakalamaya gerek kalmaz.
 */
function GorevFormu({
  duzenlenen,
  onKaydet,
  onKapat,
}: {
  duzenlenen: GorevTaslagi | null;
  onKaydet: (taslak: GorevTaslagi) => void;
  onKapat: () => void;
}) {
  const [baslik, setBaslik] = useState(duzenlenen?.baslik ?? "");
  const [simge, setSimge] = useState(duzenlenen?.simge ?? VARSAYILAN_SIMGE);

  function gonder(olay: React.FormEvent<HTMLFormElement>) {
    olay.preventDefault();

    const temiz = baslik.trim();
    if (!temiz) return;

    onKaydet({ baslik: temiz, simge });
    onKapat();
  }

  return (
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
        {duzenlenen ? "Değişiklikleri kaydet" : "Kaydet"}
      </button>
    </form>
  );
}

export default function AddDailySheet({
  acik,
  duzenlenen,
  onKapat,
  onKaydet,
}: {
  acik: boolean;
  /** Null ise yeni görev, doluysa düzenleme. */
  duzenlenen: GorevTaslagi | null;
  onKapat: () => void;
  onKaydet: (taslak: GorevTaslagi) => void;
}) {
  return (
    <BottomSheet
      acik={acik}
      baslik={duzenlenen ? "Görevi düzenle" : "Görev ekle"}
      onKapat={onKapat}
    >
      <GorevFormu
        duzenlenen={duzenlenen}
        onKaydet={onKaydet}
        onKapat={onKapat}
      />
    </BottomSheet>
  );
}
