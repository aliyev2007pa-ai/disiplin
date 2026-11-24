"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { gunEkle } from "@/lib/dates";
import { tikSesi, titret } from "@/lib/feedback";
import { createClient } from "@/lib/supabase/client";
import { tikHatasiniCevir } from "@/lib/supabase/hatalar";

import AddDailySheet, { type GorevTaslagi } from "./AddDailySheet";
import ConfirmSheet from "./ConfirmSheet";
import EmptyState from "./EmptyState";
import ProgressRing from "./ProgressRing";
import SecenekSheet from "./SecenekSheet";
import Simge from "./Simge";
import TaskCard from "./TaskCard";

export type Gorev = {
  id: string;
  baslik: string;
  simge: string;
  yapildi: boolean;
};

export default function GunlukPanel({
  bugun,
  tarihBasligi,
  baslangicGorevleri,
}: {
  bugun: string;
  tarihBasligi: string;
  baslangicGorevleri: Gorev[];
}) {
  const [gorevler, setGorevler] = useState(baslangicGorevleri);
  const [bekleyen, setBekleyen] = useState<string[]>([]);
  // Form kapanırken `duzenlenen` korunur: panel aşağı kayarken içindeki
  // yazılar "Görev ekle"ye dönüp göz önünde değişmesin diye.
  const [form, setForm] = useState<{ acik: boolean; duzenlenen: Gorev | null }>(
    { acik: false, duzenlenen: null },
  );
  const [secenekler, setSecenekler] = useState<Gorev | null>(null);
  const [silinecek, setSilinecek] = useState<Gorev | null>(null);
  const [uyari, setUyari] = useState<string | null>(null);

  const yapilan = gorevler.filter((g) => g.yapildi).length;
  const toplam = gorevler.length;
  const hepsiBitti = toplam > 0 && yapilan === toplam;

  function uyarGecici(metin: string) {
    setUyari(metin);
    window.setTimeout(() => setUyari(null), 3200);
  }

  async function kutla() {
    const { default: confetti } = await import("canvas-confetti");

    confetti({
      particleCount: 70,
      spread: 70,
      startVelocity: 38,
      origin: { y: 0.35 },
      colors: ["#2E9E5B", "#7B1E3A", "#E8F6EE", "#F7ECEF"],
      disableForReducedMotion: true,
    });
  }

  async function tikla(id: string) {
    const gorev = gorevler.find((g) => g.id === id);
    if (!gorev || bekleyen.includes(id)) return;

    const yeniDurum = !gorev.yapildi;
    const sonrasi = gorevler.map((g) =>
      g.id === id ? { ...g, yapildi: yeniDurum } : g,
    );

    // İyimser güncelleme: animasyon hemen oynar, sunucu arkadan onaylar.
    setGorevler(sonrasi);
    setBekleyen((o) => [...o, id]);

    if (yeniDurum) {
      titret();
      tikSesi();

      if (sonrasi.every((g) => g.yapildi)) {
        void kutla();
      }
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("toggle_completion", {
      p_task_id: id,
    });

    setBekleyen((o) => o.filter((x) => x !== id));

    if (error) {
      // Geri al.
      setGorevler((o) =>
        o.map((g) => (g.id === id ? { ...g, yapildi: !yeniDurum } : g)),
      );
      uyarGecici(tikHatasiniCevir(error));
      return;
    }

    // Sunucunun söylediği gerçek durumla eşitle.
    setGorevler((o) =>
      o.map((g) => (g.id === id ? { ...g, yapildi: Boolean(data) } : g)),
    );
  }

  async function ekle({ baslik, simge }: GorevTaslagi) {
    const geciciId = `gecici-${crypto.randomUUID()}`;
    setGorevler((o) => [...o, { id: geciciId, baslik, simge, yapildi: false }]);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        kind: "daily",
        title: baslik,
        // Kolon adı tarihsel; içinde simge anahtarı tutulur (bkz. Simge.tsx).
        emoji: simge,
        start_date: bugun,
        end_date: gunEkle(bugun, 1),
        duration_label: "Günlük",
      })
      .select("id")
      .single();

    if (error || !data) {
      setGorevler((o) => o.filter((g) => g.id !== geciciId));
      uyarGecici("Görev eklenemedi. Tekrar dene.");
      return;
    }

    setGorevler((o) =>
      o.map((g) => (g.id === geciciId ? { ...g, id: data.id } : g)),
    );
  }

  async function guncelle(id: string, { baslik, simge }: GorevTaslagi) {
    const yedek = gorevler;
    setGorevler((o) =>
      o.map((g) => (g.id === id ? { ...g, baslik, simge } : g)),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ title: baslik, emoji: simge })
      .eq("id", id);

    if (error) {
      setGorevler(yedek);
      uyarGecici("Görev güncellenemedi. Tekrar dene.");
    }
  }

  async function sil(gorev: Gorev) {
    const yedek = gorevler;
    setGorevler((o) => o.filter((g) => g.id !== gorev.id));

    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", gorev.id);

    if (error) {
      setGorevler(yedek);
      uyarGecici("Görev silinemedi. Tekrar dene.");
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4 pt-3 pb-6">
        <div className="min-w-0">
          <h1 className="font-serif text-ink text-[26px] leading-tight font-bold tracking-tight">
            {tarihBasligi}
          </h1>
          <p className="text-muted mt-1 flex items-center gap-1 text-[13.5px]">
            {toplam === 0 ? (
              "Bugün için henüz görev yok."
            ) : hepsiBitti ? (
              <>
                <Simge ad="alev" className="text-success h-3.5 w-3.5 shrink-0" />
                <span className="text-success font-semibold">Bugün tamam</span>
              </>
            ) : (
              `${toplam - yapilan} görev kaldı.`
            )}
          </p>
        </div>

        <ProgressRing yapilan={yapilan} toplam={toplam} />
      </header>

      {toplam === 0 ? (
        <EmptyState
          simge="gunes"
          title="Henüz görev yok"
          hint="Bugün için küçük, tek seferlik işlerini buraya ekle."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {gorevler.map((gorev) => (
              <TaskCard
                key={gorev.id}
                baslik={gorev.baslik}
                simge={gorev.simge}
                yapildi={gorev.yapildi}
                bekliyor={bekleyen.includes(gorev.id)}
                onTikla={() => void tikla(gorev.id)}
                onSecenekler={() => setSecenekler(gorev)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <button
        type="button"
        onClick={() => setForm({ acik: true, duzenlenen: null })}
        className="bg-bordo hover:bg-bordo-dark mt-5 w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors"
      >
        + Görev ekle
      </button>

      <AddDailySheet
        acik={form.acik}
        duzenlenen={form.duzenlenen}
        onKapat={() => setForm((o) => ({ ...o, acik: false }))}
        onKaydet={(taslak) => {
          const hedef = form.duzenlenen;
          if (hedef) void guncelle(hedef.id, taslak);
          else void ekle(taslak);
        }}
      />

      <SecenekSheet
        acik={secenekler !== null}
        baslik={secenekler ? secenekler.baslik : ""}
        onDuzenle={() => {
          const gorev = secenekler;
          setSecenekler(null);
          if (gorev) setForm({ acik: true, duzenlenen: gorev });
        }}
        onSil={() => {
          const gorev = secenekler;
          setSecenekler(null);
          if (gorev) setSilinecek(gorev);
        }}
        onKapat={() => setSecenekler(null)}
      />

      <ConfirmSheet
        acik={silinecek !== null}
        baslik="Görevi sil"
        mesaj={
          silinecek
            ? `"${silinecek.baslik}" silinecek. Bu işlem geri alınamaz.`
            : ""
        }
        onOnayla={() => {
          if (silinecek) void sil(silinecek);
        }}
        onKapat={() => setSilinecek(null)}
      />

      <AnimatePresence>
        {uyari ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-ink fixed inset-x-5 bottom-28 z-40 mx-auto max-w-[22rem] rounded-xl px-4 py-3 text-center text-[13.5px] text-white shadow-lg"
          >
            {uyari}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </>
  );
}
