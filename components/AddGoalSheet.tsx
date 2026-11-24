"use client";

import { useState } from "react";

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
import HatirlatmaAlani from "./HatirlatmaAlani";
import Simge, {
  SIMGE_LISTESI,
  VARSAYILAN_SIMGE,
  simgeEtiketi,
} from "./Simge";

const EN_UZUN_BASLIK = 120;
const EN_UZUN_DAKIKA = 1440;
const OZEL = "ozel";

/** Bir hedefin düzenlenebilir alanları. */
export type HedefAlanlari = {
  baslik: string;
  simge: string;
  dakika: number | null;
  gunler: number[] | null;
  /** "07:30" ya da null. Yalnızca hedefin planlı olduğu günlerde çalar. */
  hatirlatma: string | null;
};

/** Yeni hedefte bunlara ek olarak süre de belirlenir. */
export type YeniHedef = HedefAlanlari & {
  bitisHaric: string;
  sureEtiketi: string;
};

export type DuzenlenenHedef = HedefAlanlari & {
  /** Salt okunur gösterim: "Haftalık · 9 Kas 2026 – 15 Kas 2026". */
  sureBilgisi: string;
};

/**
 * Form, BottomSheet'in çocuğu olduğu için panel her açıldığında sıfırdan
 * kurulur ve başlangıç değerlerini o anki `duzenlenen`den alır.
 *
 * DÜZENLEMEDE SÜRE YOKTUR: başlangıç/bitiş tarihi ve süre etiketi geçmiş
 * istatistiğin paydasıdır ("90 günün 84'ünde yaptın"). Sonradan değişirse
 * geçmiş rakamlar anlamını yitirir. Süresi farklı olsun isteyen yeni hedef
 * açar; eskisi Tamamlananlar'da kalır. (Veritabanında da bu sütunlara
 * güncelleme yetkisi verilmedi — bkz. 0005 migration.)
 */
function HedefFormu({
  bugun,
  duzenlenen,
  onKaydet,
  onKapat,
}: {
  bugun: string;
  duzenlenen: DuzenlenenHedef | null;
  onKaydet: (alanlar: HedefAlanlari, yeniSure: YeniHedef | null) => void;
  onKapat: () => void;
}) {
  const [baslik, setBaslik] = useState(duzenlenen?.baslik ?? "");
  const [simge, setSimge] = useState(duzenlenen?.simge ?? VARSAYILAN_SIMGE);
  const [dakika, setDakika] = useState(
    duzenlenen?.dakika == null ? "" : String(duzenlenen.dakika),
  );
  const [sureKimligi, setSureKimligi] = useState<string>(
    SURE_SECENEKLERI[0].kimlik,
  );
  const [ozelSayi, setOzelSayi] = useState("30");
  const [ozelBirim, setOzelBirim] = useState<Birim>("gun");
  const [herGun, setHerGun] = useState(
    duzenlenen ? duzenlenen.gunler === null : true,
  );
  const [secilenGunler, setSecilenGunler] = useState<number[]>(
    duzenlenen?.gunler ?? [],
  );
  const [hatirlatma, setHatirlatma] = useState(duzenlenen?.hatirlatma ?? "");

  const ozelMi = sureKimligi === OZEL;
  const ozelSayisi = Number.parseInt(ozelSayi, 10);
  const ozelGecerli =
    Number.isInteger(ozelSayisi) &&
    ozelSayisi >= 1 &&
    ozelSayisi <= BIRIM_UST_SINIR[ozelBirim];

  const gonderilebilir =
    baslik.trim().length > 0 &&
    (duzenlenen !== null || !ozelMi || ozelGecerli) &&
    (herGun || secilenGunler.length > 0);

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

    const girilenDakika = Number.parseInt(dakika, 10);

    const alanlar: HedefAlanlari = {
      baslik: baslik.trim(),
      simge,
      dakika:
        Number.isInteger(girilenDakika) &&
        girilenDakika >= 1 &&
        girilenDakika <= EN_UZUN_DAKIKA
          ? girilenDakika
          : null,
      gunler: herGun ? null : [...secilenGunler].sort((a, b) => a - b),
      hatirlatma: hatirlatma || null,
    };

    if (duzenlenen) {
      onKaydet(alanlar, null);
      onKapat();
      return;
    }

    const secilen = SURE_SECENEKLERI.find((s) => s.kimlik === sureKimligi);
    const sayi = ozelMi ? ozelSayisi : (secilen?.sayi ?? 1);
    const birim = ozelMi ? ozelBirim : (secilen?.birim ?? "hafta");

    onKaydet(alanlar, {
      ...alanlar,
      bitisHaric: bitisTarihi(bugun, sayi, birim),
      sureEtiketi: sureEtiketi(sayi, birim),
    });

    onKapat();
  }

  return (
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

      {duzenlenen ? (
        <div>
          <span className="text-ink block text-[13.5px] font-semibold">
            Süre
          </span>
          <p className="border-bordo-soft bg-surface text-muted mt-1.5 rounded-xl border border-dashed px-4 py-3 text-[13.5px] leading-snug">
            {duzenlenen.sureBilgisi}
            <br />
            <span className="text-[12.5px]">
              Süre sonradan değiştirilemez; geçmiş istatistik buna göre
              hesaplanıyor. Farklı süre için yeni hedef aç.
            </span>
          </p>
        </div>
      ) : (
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
      )}

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
              <p className="text-bordo mt-2 text-[13px]">En az bir gün seç.</p>
            ) : null}
          </>
        )}

        {duzenlenen ? (
          <p className="text-muted mt-2 text-[12.5px] leading-snug">
            Günleri değiştirirsen ilerleme sayacı yeni plana göre yeniden
            hesaplanır.
          </p>
        ) : null}
      </div>

      <HatirlatmaAlani
        deger={hatirlatma}
        onDegistir={setHatirlatma}
        ipucu="Yalnızca hedefin planlı olduğu günlerde çalar. Örneğin Pzt-Çar-Cum seçtiysen sadece o günlerin sabahında."
      />

      <button
        type="submit"
        disabled={!gonderilebilir}
        className="bg-bordo hover:bg-bordo-dark w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-50"
      >
        {duzenlenen ? "Değişiklikleri kaydet" : "Kaydet"}
      </button>
    </form>
  );
}

export default function AddGoalSheet({
  acik,
  bugun,
  duzenlenen,
  onKapat,
  onKaydet,
}: {
  acik: boolean;
  bugun: string;
  /** Null ise yeni hedef, doluysa düzenleme. */
  duzenlenen: DuzenlenenHedef | null;
  onKapat: () => void;
  onKaydet: (alanlar: HedefAlanlari, yeniSure: YeniHedef | null) => void;
}) {
  return (
    <BottomSheet
      acik={acik}
      baslik={duzenlenen ? "Hedefi düzenle" : "Hedef ekle"}
      onKapat={onKapat}
    >
      <HedefFormu
        bugun={bugun}
        duzenlenen={duzenlenen}
        onKaydet={onKaydet}
        onKapat={onKapat}
      />
    </BottomSheet>
  );
}
