"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type DavetKodu = {
  code: string;
  note: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by_email: string | null;
};

type Durum = {
  tur: "kullanildi" | "suresi-doldu" | "bekliyor";
  metin: string;
};

function durumBul(kod: DavetKodu): Durum {
  if (kod.used_at) {
    return {
      tur: "kullanildi",
      metin: kod.used_by_email
        ? `Kullanıldı · ${kod.used_by_email}`
        : "Kullanıldı",
    };
  }

  const kalanMs = new Date(kod.expires_at).getTime() - Date.now();

  if (kalanMs <= 0) {
    return { tur: "suresi-doldu", metin: "Süresi doldu" };
  }

  // Yuvarlama (ceil değil): cihaz saati sunucudan birkaç saat sapsa bile
  // 7 günlük bir kod "8 gün" diye görünmesin.
  const kalanGun = Math.max(1, Math.round(kalanMs / 86_400_000));

  return {
    tur: "bekliyor",
    metin: kalanGun > 1 ? `${kalanGun} gün geçerli` : "Bugün son gün",
  };
}

export default function DavetYonetimi({
  baslangicKodlari,
}: {
  baslangicKodlari: DavetKodu[];
}) {
  const [kodlar, setKodlar] = useState(baslangicKodlari);
  const [not, setNot] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [uretiliyor, setUretiliyor] = useState(false);
  const [kopyalanan, setKopyalanan] = useState<string | null>(null);

  async function uret() {
    setHata(null);
    setUretiliyor(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_invite_code", {
        p_note: not.trim() || null,
      });

      const yeni = (data as DavetKodu[] | null)?.[0];

      if (error || !yeni) {
        setHata("Kod üretilemedi. Biraz sonra tekrar dene.");
        return;
      }

      setKodlar((oncekiler) => [
        { ...yeni, used_at: null, used_by_email: null },
        ...oncekiler,
      ]);
      setNot("");
    } finally {
      setUretiliyor(false);
    }
  }

  async function kopyala(kod: string) {
    const metin = `Disiplin'e davetlisin.\n\n${window.location.origin}/kayit\n\nDavet kodun: ${kod}\n\nKod tek kullanımlıktır ve 7 gün geçerlidir.`;

    try {
      await navigator.clipboard.writeText(metin);
      setKopyalanan(kod);
      window.setTimeout(() => setKopyalanan(null), 2000);
    } catch {
      setHata("Kopyalanamadı. Kodu elle seçip kopyalayabilirsin.");
    }
  }

  return (
    <section className="border-bordo-soft bg-surface mt-4 rounded-2xl border px-5 py-4">
      <h2 className="text-muted text-[12.5px] font-semibold tracking-wide uppercase">
        Davetler
      </h2>
      <p className="text-muted mt-1.5 text-[13.5px] leading-snug">
        Her kod tek kullanımlıktır ve 7 gün geçerlidir. Kodu olmayan kimse hesap
        açamaz.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <input
          type="text"
          value={not}
          onChange={(e) => setNot(e.target.value)}
          maxLength={60}
          disabled={uretiliyor}
          placeholder="Kimin için? (isteğe bağlı)"
          aria-label="Davet notu"
          className="border-bordo-soft bg-bg text-ink placeholder:text-muted focus:border-bordo w-full rounded-xl border px-4 py-2.5 text-[14px] outline-none transition-colors disabled:opacity-60"
        />
        <button
          type="button"
          onClick={uret}
          disabled={uretiliyor}
          className="bg-bordo hover:bg-bordo-dark w-full rounded-xl px-4 py-3 text-[14.5px] font-semibold text-white transition-colors disabled:opacity-60"
        >
          {uretiliyor ? "Üretiliyor…" : "Yeni davet kodu oluştur"}
        </button>
      </div>

      {hata ? (
        <p role="alert" className="text-bordo-dark mt-3 text-[13px]">
          {hata}
        </p>
      ) : null}

      <div className="mt-4">
        {kodlar.length === 0 ? (
          <p className="text-muted text-[13px]">Henüz davet kodu üretmedin.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {kodlar.map((kod) => {
              const durum = durumBul(kod);
              const kullanilabilir = durum.tur === "bekliyor";

              return (
                <li
                  key={kod.code}
                  className="border-bordo-soft bg-bg flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p
                      className={`font-mono text-[14px] tracking-tight ${
                        kullanilabilir ? "text-ink" : "text-muted line-through"
                      }`}
                    >
                      {kod.code}
                    </p>
                    <p className="text-muted mt-0.5 truncate text-[12px]">
                      {kod.note ? `${kod.note} · ` : ""}
                      {durum.metin}
                    </p>
                  </div>

                  {kullanilabilir ? (
                    <button
                      type="button"
                      onClick={() => kopyala(kod.code)}
                      className="text-bordo hover:bg-bordo-soft shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors"
                    >
                      {kopyalanan === kod.code ? "Kopyalandı" : "Daveti kopyala"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
