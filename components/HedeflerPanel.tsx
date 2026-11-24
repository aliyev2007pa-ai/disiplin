"use client";

import { AnimatePresence, Reorder, motion } from "framer-motion";
import { useState } from "react";

import { gunEkle, kisaTarih } from "@/lib/dates";
import { tikSesi, titret } from "@/lib/feedback";
import {
  altGrubuYerlestir,
  listeyiSirala,
  surukleSonucu,
} from "@/lib/siralama";
import { planliMi } from "@/lib/stats";
import { createClient } from "@/lib/supabase/client";
import { tikHatasiniCevir } from "@/lib/supabase/hatalar";

import AddGoalSheet, {
  type HedefAlanlari,
  type YeniHedef,
} from "./AddGoalSheet";
import ConfirmSheet from "./ConfirmSheet";
import EmptyState from "./EmptyState";
import GoalCard, { type Hedef } from "./GoalCard";
import ProgressRing from "./ProgressRing";
import SecenekSheet from "./SecenekSheet";
import Simge from "./Simge";

/** Bir hedefin bugünkü tikini ekler ya da kaldırır. */
function bugunuAyarla(hedef: Hedef, bugun: string, yapildi: boolean): Hedef {
  const halihazirda = hedef.yapilanGunler.includes(bugun);
  if (halihazirda === yapildi) return hedef;

  return {
    ...hedef,
    yapilanGunler: yapildi
      ? [...hedef.yapilanGunler, bugun]
      : hedef.yapilanGunler.filter((gun) => gun !== bugun),
  };
}

export default function HedeflerPanel({
  bugun,
  baslangicHedefleri,
}: {
  bugun: string;
  baslangicHedefleri: Hedef[];
}) {
  const [hedefler, setHedefler] = useState(baslangicHedefleri);
  const [bekleyen, setBekleyen] = useState<string[]>([]);
  // Form kapanırken `duzenlenen` korunur ki panel aşağı kayarken içindeki
  // yazılar göz önünde "Hedef ekle"ye dönüşmesin.
  const [form, setForm] = useState<{ acik: boolean; duzenlenen: Hedef | null }>(
    { acik: false, duzenlenen: null },
  );
  const [secenekler, setSecenekler] = useState<Hedef | null>(null);
  const [silinecek, setSilinecek] = useState<Hedef | null>(null);
  const [uyari, setUyari] = useState<string | null>(null);

  // Sayaç ve halka SABİTLEMEDEN bağımsız: bugün planlı olan her hedefi sayar.
  const bugunPlanlilar = hedefler.filter((h) => planliMi(bugun, h.gunler));

  // Ekrandaki üç grup. Sabitlenenler, bugün planlı olsun olmasın en üstte
  // kendi bölümünde durur; sürükleme yalnızca kendi grubu içinde çalışır.
  const sabitler = hedefler.filter((h) => h.sabit);
  const bugunkuler = hedefler.filter(
    (h) => !h.sabit && planliMi(bugun, h.gunler),
  );
  const dinlenenler = hedefler.filter(
    (h) => !h.sabit && !planliMi(bugun, h.gunler),
  );

  const yapilan = bugunPlanlilar.filter((h) =>
    h.yapilanGunler.includes(bugun),
  ).length;
  const toplam = bugunPlanlilar.length;
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
    const hedef = hedefler.find((h) => h.id === id);
    if (!hedef || bekleyen.includes(id)) return;

    const yeniDurum = !hedef.yapilanGunler.includes(bugun);
    const sonrasi = hedefler.map((h) =>
      h.id === id ? bugunuAyarla(h, bugun, yeniDurum) : h,
    );

    // İyimser güncelleme: animasyon hemen oynar, sunucu arkadan onaylar.
    setHedefler(sonrasi);
    setBekleyen((o) => [...o, id]);

    if (yeniDurum) {
      titret();
      tikSesi();

      const bugunPlanlilar = sonrasi.filter((h) => planliMi(bugun, h.gunler));
      if (bugunPlanlilar.every((h) => h.yapilanGunler.includes(bugun))) {
        void kutla();
      }
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("toggle_completion", {
      p_task_id: id,
    });

    setBekleyen((o) => o.filter((x) => x !== id));

    if (error) {
      setHedefler((o) =>
        o.map((h) => (h.id === id ? bugunuAyarla(h, bugun, !yeniDurum) : h)),
      );
      uyarGecici(tikHatasiniCevir(error));
      return;
    }

    // Sunucunun söylediği gerçek durumla eşitle.
    setHedefler((o) =>
      o.map((h) => (h.id === id ? bugunuAyarla(h, bugun, Boolean(data)) : h)),
    );
  }

  async function ekle(yeni: YeniHedef) {
    const geciciId = `gecici-${crypto.randomUUID()}`;

    const iyimser: Hedef = {
      id: geciciId,
      baslik: yeni.baslik,
      simge: yeni.simge,
      dakika: yeni.dakika,
      sureEtiketi: yeni.sureEtiketi,
      gunler: yeni.gunler,
      baslangic: bugun,
      bitisHaric: yeni.bitisHaric,
      // Veritabanı varsayılanı da epoch saniyesi; kart iyimser olarak
      // listenin sonuna düşsün diye aynısını tahmin ediyoruz.
      sira: Date.now() / 1000,
      sabit: false,
      hatirlatma: yeni.hatirlatma,
      yapilanGunler: [],
    };

    setHedefler((o) => [...o, iyimser]);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        kind: "goal",
        title: yeni.baslik,
        // Kolon adı tarihsel; içinde simge anahtarı tutulur (bkz. Simge.tsx).
        emoji: yeni.simge,
        minutes: yeni.dakika,
        hatirlatma: yeni.hatirlatma,
        start_date: bugun,
        end_date: yeni.bitisHaric,
        duration_label: yeni.sureEtiketi,
        weekdays: yeni.gunler,
      })
      .select("id, sira")
      .single();

    if (error || !data) {
      setHedefler((o) => o.filter((h) => h.id !== geciciId));
      uyarGecici("Hedef eklenemedi. Tekrar dene.");
      return;
    }

    setHedefler((o) =>
      o.map((h) =>
        h.id === geciciId ? { ...h, id: data.id, sira: data.sira } : h,
      ),
    );
  }

  async function guncelle(id: string, alanlar: HedefAlanlari) {
    const yedek = hedefler;
    setHedefler((o) =>
      o.map((h) =>
        h.id === id
          ? {
              ...h,
              baslik: alanlar.baslik,
              simge: alanlar.simge,
              dakika: alanlar.dakika,
              gunler: alanlar.gunler,
              hatirlatma: alanlar.hatirlatma,
            }
          : h,
      ),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        title: alanlar.baslik,
        emoji: alanlar.simge,
        minutes: alanlar.dakika,
        weekdays: alanlar.gunler,
        hatirlatma: alanlar.hatirlatma,
      })
      .eq("id", id);

    if (error) {
      setHedefler(yedek);
      uyarGecici("Hedef güncellenemedi. Tekrar dene.");
    }
  }

  async function siraKaydet(grup: Hedef[], kimlik: string) {
    const sonuc = surukleSonucu(grup, kimlik);
    if (sonuc.tur === "degismedi") return;

    const yedek = hedefler;
    const supabase = createClient();

    if (sonuc.tur === "tek") {
      setHedefler((o) =>
        o.map((h) => (h.id === kimlik ? { ...h, sira: sonuc.sira } : h)),
      );

      const { error } = await supabase
        .from("tasks")
        .update({ sira: sonuc.sira })
        .eq("id", kimlik);

      if (error) {
        setHedefler(yedek);
        uyarGecici("Sıralama kaydedilemedi. Tekrar dene.");
      }

      return;
    }

    // Nadir yol: komşular arasına değer sığmadı, grup yeniden numaralandı.
    const harita = new Map(sonuc.siralar.map((s) => [s.id, s.sira]));
    setHedefler((o) =>
      o.map((h) => (harita.has(h.id) ? { ...h, sira: harita.get(h.id)! } : h)),
    );

    for (const { id, sira } of sonuc.siralar) {
      const { error } = await supabase
        .from("tasks")
        .update({ sira })
        .eq("id", id);

      if (error) {
        setHedefler(yedek);
        uyarGecici("Sıralama kaydedilemedi. Tekrar dene.");
        return;
      }
    }
  }

  async function sabitDegistir(hedef: Hedef) {
    const yeni = !hedef.sabit;
    const yedek = hedefler;

    setHedefler((o) =>
      listeyiSirala(
        o.map((h) => (h.id === hedef.id ? { ...h, sabit: yeni } : h)),
      ),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ sabit: yeni })
      .eq("id", hedef.id);

    if (error) {
      setHedefler(yedek);
      uyarGecici("Sabitleme kaydedilemedi. Tekrar dene.");
    }
  }

  async function sil(hedef: Hedef) {
    const yedek = hedefler;
    setHedefler((o) => o.filter((h) => h.id !== hedef.id));

    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", hedef.id);

    if (error) {
      setHedefler(yedek);
      uyarGecici("Hedef silinemedi. Tekrar dene.");
    }
  }

  /**
   * Tek bir sürüklenebilir grup. Bileşen değil, sadece JSX üreten bir
   * yardımcı: bileşen yapılsaydı her render'da yeni bir tür sayılır ve React
   * kartları söküp yeniden kurardı (animasyonlar sıfırlanırdı).
   *
   * `tiklenebilir` false ise kart dinlenme günündedir; tik yerine kesik
   * çizgili boş halka gösterilir (GoalCard kendi karar veriyor).
   */
  function hedefListesi(grup: Hedef[]) {
    return (
      <Reorder.Group
        as="ul"
        axis="y"
        values={grup}
        onReorder={(yeni) =>
          setHedefler((o) => altGrubuYerlestir(o, yeni as Hedef[]))
        }
        className="flex flex-col gap-2.5"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {grup.map((hedef) => (
            <GoalCard
              key={hedef.id}
              hedef={hedef}
              bugun={bugun}
              bekliyor={bekleyen.includes(hedef.id)}
              suruklenebilir={grup.length > 1}
              onTikla={() => void tikla(hedef.id)}
              onSecenekler={() => setSecenekler(hedef)}
              onSurukleBitti={() => void siraKaydet(grup, hedef.id)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4 pt-3 pb-6">
        <div className="min-w-0">
          <h1 className="font-serif text-ink text-[29px] leading-tight font-bold tracking-tight">
            Hedefler
          </h1>
          <p className="text-muted mt-1.5 flex items-center gap-1 text-[13.5px]">
            {hedefler.length === 0 ? (
              "Süreli ve tekrarlayan görevler."
            ) : toplam === 0 ? (
              "Bugün hepsi dinlenme gününde."
            ) : hepsiBitti ? (
              <>
                <Simge ad="alev" className="text-success h-3.5 w-3.5 shrink-0" />
                <span className="text-success font-semibold">Bugün tamam</span>
              </>
            ) : (
              `Bugün ${toplam - yapilan} hedef kaldı.`
            )}
          </p>
        </div>

        <ProgressRing yapilan={yapilan} toplam={toplam} />
      </header>

      {hedefler.length === 0 ? (
        <EmptyState
          simge="yildiz"
          title="Henüz hedef yok"
          hint="İngilizce, spor, okuma gibi süreli hedeflerin burada listelenecek."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {sabitler.length > 0 ? (
            <section>
              <h2 className="text-muted mb-2.5 text-[12.5px] font-semibold tracking-wide uppercase">
                Sabitlenenler
              </h2>
              {hedefListesi(sabitler)}
            </section>
          ) : null}

          {bugunkuler.length > 0 ? (
            <section>
              <h2 className="text-muted mb-2.5 text-[12.5px] font-semibold tracking-wide uppercase">
                Bugün yapılacaklar
              </h2>
              {hedefListesi(bugunkuler)}
            </section>
          ) : null}

          {dinlenenler.length > 0 ? (
            <section>
              <h2 className="text-muted mb-2.5 text-[12.5px] font-semibold tracking-wide uppercase">
                Bugün dinlenme günü
              </h2>
              {hedefListesi(dinlenenler)}
            </section>
          ) : null}
        </div>
      )}

      <button
        type="button"
        onClick={() => setForm({ acik: true, duzenlenen: null })}
        className="bg-bordo hover:bg-bordo-dark mt-5 w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors"
      >
        + Hedef ekle
      </button>

      <AddGoalSheet
        acik={form.acik}
        bugun={bugun}
        duzenlenen={
          form.duzenlenen
            ? {
                baslik: form.duzenlenen.baslik,
                simge: form.duzenlenen.simge,
                dakika: form.duzenlenen.dakika,
                gunler: form.duzenlenen.gunler,
                hatirlatma: form.duzenlenen.hatirlatma,
                sureBilgisi: `${form.duzenlenen.sureEtiketi} · ${kisaTarih(
                  form.duzenlenen.baslangic,
                )} – ${kisaTarih(gunEkle(form.duzenlenen.bitisHaric, -1))}`,
              }
            : null
        }
        onKapat={() => setForm((o) => ({ ...o, acik: false }))}
        onKaydet={(alanlar, yeniSure) => {
          const hedef = form.duzenlenen;
          if (hedef) void guncelle(hedef.id, alanlar);
          else if (yeniSure) void ekle(yeniSure);
        }}
      />

      <SecenekSheet
        acik={secenekler !== null}
        baslik={secenekler ? secenekler.baslik : ""}
        sabit={secenekler ? secenekler.sabit : false}
        onSabitle={() => {
          const hedef = secenekler;
          setSecenekler(null);
          if (hedef) void sabitDegistir(hedef);
        }}
        onDuzenle={() => {
          const hedef = secenekler;
          setSecenekler(null);
          if (hedef) setForm({ acik: true, duzenlenen: hedef });
        }}
        onSil={() => {
          const hedef = secenekler;
          setSecenekler(null);
          if (hedef) setSilinecek(hedef);
        }}
        onKapat={() => setSecenekler(null)}
      />

      <ConfirmSheet
        acik={silinecek !== null}
        baslik="Hedefi sil"
        mesaj={
          silinecek
            ? `"${silinecek.baslik}" hedefi ve tüm geçmişi silinecek. Bu işlem geri alınamaz.`
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
