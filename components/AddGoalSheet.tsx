"use client";

import { useState } from "react";

import { EMOJILER, VARSAYILAN_EMOJI } from "@/lib/emojiler";
import {
  BIRIM_ADLARI,
  BIRIM_UST_SINIR,
  type Birim,
  GUNLER,
  SURE_SECENEKLERI,
  bitisTarihi,
  sureEtiketi,
} from "@/lib/sureler";

import BottomSheet from "./BottomSheet";

const EN_UZUN_BASLIK = 120;
const EN_UZUN_DAKIKA = 1440;

export type YeniHedef = {
  baslik: string;
  emoji: string;
  dakika: number | null;
  bitisHaric: string;
  sureEtiketi: string;
  gunler: number[] | null;
};

const OZEL = "ozel";

export default function AddGoalSheet({
  acik,
  bugun,
  onKapat,
  onEkle,
}: {
  acik: boolean;
  bugun: string;
  onKapat: () => void;
  onEkle: (hedef: YeniHedef) => void;
}) {
  const [baslik, setBaslik] = useState("");
  const [emoji, setEmoji] = useState<string>(VARSAYILAN_EMOJI);
  const [dakika, setDakika] = useState("");
  const [sureKimligi, setSureKimligi] = useState<string>(
    SURE_SECENEKLERI[0].kimlik,
  );
  const [ozelSayi, setOzelSayi] = useState("30");
  const [ozelBirim, setOzelBirim] = useState<Birim>("gun");
  const [herGun, setHerGun] = useState(true);
  const [secilenGunler, setSecilenGunler] = useState<number[]>([]);

  const ozelMi = sureKimligi === OZEL;
  const ozelSayisi = Number.parseInt(ozelSayi, 10);
  const ozelGecerli =
    Number.isInteger(ozelSayisi) &&
    ozelSayisi >= 1 &&
    ozelSayisi <= BIRIM_UST_SINIR[ozelBirim];

  const gonderilebilir =
    baslik.trim().length > 0 &&
    (!ozelMi || ozelGecerli) &&
    (herGun || secilenGunler.length > 0);

  function sifirla() {
    setBaslik("");
    setEmoji(VARSAYILAN_EMOJI);
    setDakika("");
    setSureKimligi(SURE_SECENEKLERI[0].kimlik);
    setOzelSayi("30");
    setOzelBirim("gun");
    setHerGun(true);
    setSecilenGunler([]);
  }

  function kapat() {
    sifirla();
    onKapat();
  }

  function gunuDegistir(iso: number) {
    setSecilenGunler((oncekiler) =>
      oncekiler.includes(iso)
        ? oncekiler.filter((g) => g !== iso)
        : [...oncekiler, iso],
    );
  }

  function gonder(olay: React.FormEvent<HTMLFormElement>) {
    olay.preventDefault();
    if (!gonderilebilir) return;

    const sayi = ozelMi
      ? ozelSayisi
      : (SURE_SECENEKLERI.find((s) => s.kimlik === sureKimligi)?.sayi ?? 1);
    const birim = ozelMi
      ? ozelBirim
      : (SURE_SECENEKLERI.find((s) => s.kimlik === sureKimligi)?.birim ??
        "hafta");

    const girilenDakika = Number.parseInt(dakika, 10);

    onEkle({
      baslik: baslik.trim(),
      emoji,
      dakika:
        Number.isInteger(girilenDakika) &&
        girilenDakika >= 1 &&
        girilenDakika <= EN_UZUN_DAKIKA
          ? girilenDakika
          : null,
      bitisHaric: bitisTarihi(bugun, sayi, birim),
      sureEtiketi: sureEtiketi(sayi, birim),
      gunler: herGun ? null : [...secilenGunler].sort((a, b) => a - b),
    });

    kapat();
  }

  return (
    <BottomSheet acik={acik} baslik="Hedef ekle" onKapat={kapat}>
      <form onSubmit={gonder} className="flex flex-col gap-5">
        <label className="block">
          <span className="text-ink block text-[13.5px] font-semibold">
            Hedefin ne?
          </span>
          <input
            type="text"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            maxLength={EN_UZUN_BASLIK}
            required
            autoFocus
            placeholder="İngilizce"
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

        <label className="block">
          <span className="text-ink block text-[13.5px] font-semibold">
            Günlük süre{" "}
            <span className="text-muted font-normal">(isteğe bağlı)</span>
          </span>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={dakika}
              onChange={(e) => setDakika(e.target.value)}
              min={1}
              max={EN_UZUN_DAKIKA}
              placeholder="30"
              className="border-bordo-soft bg-surface text-ink placeholder:text-muted focus:border-bordo w-24 rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors"
            />
            <span className="text-muted text-[14px]">dakika</span>
          </div>
        </label>

        <div>
          <span className="text-ink block text-[13.5px] font-semibold">
            Süre
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...SURE_SECENEKLERI, { kimlik: OZEL, etiket: "Özel" }].map(
              (secenek) => {
                const secili = secenek.kimlik === sureKimligi;

                return (
                  <button
                    key={secenek.kimlik}
                    type="button"
                    onClick={() => setSureKimligi(secenek.kimlik)}
                    aria-pressed={secili}
                    className={`rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
                      secili
                        ? "border-bordo bg-bordo-soft text-bordo"
                        : "border-bordo-soft bg-surface text-muted hover:border-bordo"
                    }`}
                  >
                    {secenek.etiket}
                  </button>
                );
              },
            )}
          </div>

          {ozelMi ? (
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={ozelSayi}
                onChange={(e) => setOzelSayi(e.target.value)}
                min={1}
                max={BIRIM_UST_SINIR[ozelBirim]}
                aria-label="Özel süre sayısı"
                className="border-bordo-soft bg-surface text-ink focus:border-bordo w-24 rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors"
              />
              <select
                value={ozelBirim}
                onChange={(e) => setOzelBirim(e.target.value as Birim)}
                aria-label="Özel süre birimi"
                className="border-bordo-soft bg-surface text-ink focus:border-bordo flex-1 rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors"
              >
                {(Object.keys(BIRIM_ADLARI) as Birim[]).map((birim) => (
                  <option key={birim} value={birim}>
                    {BIRIM_ADLARI[birim]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {ozelMi && !ozelGecerli ? (
            <p className="text-bordo mt-2 text-[13px]">
              1 ile {BIRIM_UST_SINIR[ozelBirim]} arasında bir sayı yaz.
            </p>
          ) : null}
        </div>

        <div>
          <span className="text-ink block text-[13.5px] font-semibold">
            Hangi günler
          </span>

          <div className="mt-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => setHerGun(true)}
              aria-pressed={herGun}
              className={`flex-1 rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
                herGun
                  ? "border-bordo bg-bordo-soft text-bordo"
                  : "border-bordo-soft bg-surface text-muted hover:border-bordo"
              }`}
            >
              Her gün
            </button>
            <button
              type="button"
              onClick={() => setHerGun(false)}
              aria-pressed={!herGun}
              className={`flex-1 rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
                !herGun
                  ? "border-bordo bg-bordo-soft text-bordo"
                  : "border-bordo-soft bg-surface text-muted hover:border-bordo"
              }`}
            >
              Gün seç
            </button>
          </div>

          {herGun ? null : (
            <>
              <div className="mt-2.5 grid grid-cols-7 gap-1.5">
                {GUNLER.map((gun) => {
                  const secili = secilenGunler.includes(gun.iso);

                  return (
                    <button
                      key={gun.iso}
                      type="button"
                      onClick={() => gunuDegistir(gun.iso)}
                      aria-pressed={secili}
                      aria-label={gun.tam}
                      className={`rounded-xl border py-2.5 text-[12.5px] font-semibold transition-colors ${
                        secili
                          ? "border-bordo bg-bordo-soft text-bordo"
                          : "border-bordo-soft bg-surface text-muted hover:border-bordo"
                      }`}
                    >
                      {gun.kisa}
                    </button>
                  );
                })}
              </div>

              {secilenGunler.length === 0 ? (
                <p className="text-bordo mt-2 text-[13px]">
                  En az bir gün seç.
                </p>
              ) : null}
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={!gonderilebilir}
          className="bg-bordo hover:bg-bordo-dark w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>
    </BottomSheet>
  );
}
