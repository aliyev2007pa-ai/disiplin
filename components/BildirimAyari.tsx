"use client";

import { useEffect, useState } from "react";

import {
  type BildirimDurumu,
  abone,
  aboneliktenCik,
  durumuOku,
} from "@/lib/bildirim";
import { createClient } from "@/lib/supabase/client";

import Simge from "./Simge";

/**
 * Ayarlar'daki bildirim bölümü.
 *
 * İKİ AYRI ŞEY var, karıştırılmasın:
 *  - "Bu cihazda bildirim": CİHAZA aittir. Telefonda açıp bilgisayarda
 *    kapalı bırakabilirsin; her cihaz ayrı abone olur.
 *  - "Akşam hatırlatması": HESABA aittir, bütün cihazlara gider.
 */
export default function BildirimAyari({
  aksamAcik: ilkAksamAcik,
  aksamSaati: ilkAksamSaati,
}: {
  aksamAcik: boolean;
  aksamSaati: string;
}) {
  const [durum, setDurum] = useState<BildirimDurumu | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [aksamAcik, setAksamAcik] = useState(ilkAksamAcik);
  const [aksamSaati, setAksamSaati] = useState(ilkAksamSaati);

  // Tarayıcının izin ve abonelik durumu sunucuda bilinemez; ilk karede
  // bilinmiyor (null) kalır, sonra gerçek değer yerleşir.
  useEffect(() => {
    let iptal = false;

    void durumuOku().then((d) => {
      if (!iptal) setDurum(d);
    });

    return () => {
      iptal = true;
    };
  }, []);

  function uyar(metin: string | null) {
    setMesaj(metin);
    if (metin) window.setTimeout(() => setMesaj(null), 4000);
  }

  async function cihaziDegistir() {
    setBekliyor(true);

    const hata = durum === "acik" ? await aboneliktenCik() : await abone();

    uyar(hata);
    setDurum(await durumuOku());
    setBekliyor(false);
  }

  async function ayariKaydet(yeniAcik: boolean, yeniSaat: string) {
    const oncekiAcik = aksamAcik;
    const oncekiSaat = aksamSaati;

    setAksamAcik(yeniAcik);
    setAksamSaati(yeniSaat);

    const supabase = createClient();
    const { data: oturum } = await supabase.auth.getUser();
    if (!oturum.user) return;

    const { error } = await supabase.from("bildirim_ayarlari").upsert(
      {
        user_id: oturum.user.id,
        aksam_acik: yeniAcik,
        aksam_saati: yeniSaat,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      setAksamAcik(oncekiAcik);
      setAksamSaati(oncekiSaat);
      uyar("Ayar kaydedilemedi. Tekrar dene.");
    }
  }

  async function denemeGonder() {
    setBekliyor(true);

    try {
      const cevap = await fetch("/api/bildirim-deneme", { method: "POST" });
      const govde = (await cevap.json()) as { hata?: string };

      uyar(cevap.ok ? "Deneme bildirimi gönderildi." : (govde.hata ?? "Gönderilemedi."));
    } catch {
      uyar("Gönderilemedi. İnternetini kontrol et.");
    }

    setBekliyor(false);
  }

  const acik = durum === "acik";

  return (
    <section className="border-bordo-soft bg-surface mt-4 rounded-2xl border px-5 py-4">
      <h2 className="text-muted text-[12.5px] font-semibold tracking-wide uppercase">
        Bildirimler
      </h2>

      {durum === "desteklenmiyor" ? (
        <p className="text-muted mt-2 text-[13.5px] leading-snug">
          Bu tarayıcı bildirimleri desteklemiyor. iPhone&apos;da bildirim için
          uygulamanın ana ekrana eklenmiş olması gerekiyor.
        </p>
      ) : (
        <>
          <button
            type="button"
            role="switch"
            aria-checked={acik}
            disabled={bekliyor || durum === null}
            onClick={() => void cihaziDegistir()}
            className="mt-3 flex w-full items-center justify-between gap-4 text-left disabled:opacity-60"
          >
            <span className="min-w-0">
              <span className="text-ink block text-[15px] font-medium">
                Bu cihazda bildirim
              </span>
              <span className="text-muted mt-0.5 block text-[12.5px] leading-snug">
                {durum === "reddedildi"
                  ? "Tarayıcı engelledi. Site ayarlarından izin vermen gerekiyor."
                  : "Her cihaz için ayrı açılır."}
              </span>
            </span>

            <span
              aria-hidden
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                acik ? "bg-success" : "bg-bordo-soft"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  acik ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </button>

          {acik ? (
            <>
              <div className="border-bordo-soft mt-4 border-t pt-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={aksamAcik}
                  onClick={() => void ayariKaydet(!aksamAcik, aksamSaati)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="text-ink block text-[15px] font-medium">
                      Akşam hatırlatması
                    </span>
                    <span className="text-muted mt-0.5 block text-[12.5px] leading-snug">
                      Günün sonunda yapılmamış işin kaldıysa tek bildirim.
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      aksamAcik ? "bg-success" : "bg-bordo-soft"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        aksamAcik ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>

                {aksamAcik ? (
                  <label className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-muted text-[13.5px]">Saat</span>
                    <input
                      type="time"
                      value={aksamSaati}
                      step={300}
                      onChange={(e) =>
                        void ayariKaydet(aksamAcik, e.target.value)
                      }
                      className="border-bordo-soft bg-bg text-ink focus:border-bordo rounded-xl border px-3 py-2 text-[15px] tabular-nums outline-none transition-colors"
                    />
                  </label>
                ) : null}
              </div>

              <button
                type="button"
                disabled={bekliyor}
                onClick={() => void denemeGonder()}
                className="border-bordo-soft text-bordo hover:bg-bordo-soft mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[14.5px] font-semibold transition-colors disabled:opacity-60"
              >
                <Simge ad="alev" className="h-4 w-4" />
                Deneme bildirimi gönder
              </button>
            </>
          ) : null}
        </>
      )}

      {mesaj ? (
        <p role="alert" className="text-bordo-dark mt-3 text-[13px] leading-snug">
          {mesaj}
        </p>
      ) : null}
    </section>
  );
}
