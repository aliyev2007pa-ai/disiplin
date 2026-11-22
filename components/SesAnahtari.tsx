"use client";

import { SES_ANAHTARI, sesiAyarla, tikSesi } from "@/lib/feedback";
import { useYerelDeger } from "@/lib/yerel";

/** Sunucunun localStorage'ı göremediği ilk kareyi temsil eder. */
const BILINMIYOR = "?";

/**
 * Tik sesi aç/kapa. Tercih cihaza kaydedilir (localStorage), hesaba değil:
 * telefonda sessiz, bilgisayarda açık olabilir.
 *
 * Sunucu bu tercihi bilemez, bu yüzden ilk kare varsayılanı (açık) gösterir
 * ve tarayıcı gerçek değeri okuyunca düzelir. Sesi kapatmış bir kullanıcıda
 * bu düzeltme animasyonlu olsaydı anahtar gözle görülür biçimde "açıktan
 * kapalıya" kayardı; bu yüzden geçiş efektleri yalnızca değer bilindikten
 * sonra devreye girer.
 */
export default function SesAnahtari() {
  const deger = useYerelDeger(SES_ANAHTARI, BILINMIYOR);
  const biliniyor = deger !== BILINMIYOR;
  const acik = biliniyor ? deger !== "0" : true;

  function degistir() {
    const yeni = !acik;
    sesiAyarla(yeni);

    // Açarken sesi bir kez duyur ki kullanıcı neyi açtığını bilsin.
    if (yeni) tikSesi();
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={acik}
      onClick={degistir}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <span className="min-w-0">
        <span className="text-ink block text-[15px] font-medium">Tik sesi</span>
        <span className="text-muted mt-0.5 block text-[13px] leading-snug">
          {acik
            ? "Görev tiklenince kısa bir ses çalar."
            : "Ses kapalı. Titreşim çalışmaya devam eder."}
        </span>
      </span>

      <span
        aria-hidden
        className={`flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 ${
          biliniyor ? "transition-colors duration-200" : ""
        } ${acik ? "bg-success" : "bg-bordo-soft"}`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow-sm ${
            biliniyor ? "transition-transform duration-200" : ""
          } ${acik ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}
