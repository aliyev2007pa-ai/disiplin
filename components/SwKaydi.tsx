"use client";

import { useEffect } from "react";

/**
 * Servis çalışanını kaydeder (yalnızca canlı sürümde).
 *
 * Geliştirmede kayıt yapılmaz: önbelleğe alınan eski paketler "değişikliğim
 * neden görünmüyor" diye saatler yakar. Çalışanın kendisi `public/sw.js`
 * içindedir ve sayfa HTML'lerini bilerek önbelleğe almaz.
 */
export default function SwKaydi() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const kaydet = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Kayıt başarısızsa uygulama normal çalışmaya devam eder.
      });
    };

    if (document.readyState === "complete") {
      kaydet();
      return;
    }

    window.addEventListener("load", kaydet);
    return () => window.removeEventListener("load", kaydet);
  }, []);

  return null;
}
