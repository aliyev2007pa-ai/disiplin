"use client";

import { useEffect } from "react";

/**
 * Servis çalışanını kaydeder.
 *
 * Yerelde de kaydedilir, çünkü bildirimler ancak servis çalışanı varken
 * denenebiliyor. Önbellek tehlikesi yok: çalışanın kendisi localhost'ta
 * hiçbir şeyi önbelleğe almıyor (bkz. public/sw.js, GELISTIRME).
 *
 * Çalışan sayfa HTML'lerini canlıda da bilerek önbelleğe almaz.
 */
export default function SwKaydi() {
  useEffect(() => {
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
