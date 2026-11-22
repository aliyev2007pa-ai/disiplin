"use client";

import { useSyncExternalStore } from "react";

/**
 * Cihaza özel küçük tercihleri (`localStorage`) hidrasyon güvenli okumak.
 *
 * Sunucu `localStorage`'ı göremez. Değeri doğrudan render sırasında okursak
 * sunucunun ürettiği HTML ile tarayıcınınki uyuşmaz ve React uyarı verir.
 * `useSyncExternalStore` tam bunun için vardır: ilk boyamada sunucu değerini
 * kullanır, hemen ardından gerçek değerle yeniden boyar. Böylece `useEffect`
 * içinde state kurmaya da gerek kalmaz.
 */

const dinleyiciler = new Set<() => void>();

function abone(geriCagir: () => void): () => void {
  dinleyiciler.add(geriCagir);
  // Başka bir sekmede değişirse bu sekme de haberdar olsun.
  window.addEventListener("storage", geriCagir);

  return () => {
    dinleyiciler.delete(geriCagir);
    window.removeEventListener("storage", geriCagir);
  };
}

function duyur(): void {
  for (const geriCagir of dinleyiciler) geriCagir();
}

/** Okunamıyorsa (gizli sekme, engelli site verisi) null döner. */
export function yerelOku(anahtar: string): string | null {
  try {
    return window.localStorage.getItem(anahtar);
  } catch {
    return null;
  }
}

/** Yazar ve aynı sekmedeki dinleyicileri uyandırır. */
export function yerelYaz(anahtar: string, deger: string): void {
  try {
    window.localStorage.setItem(anahtar, deger);
  } catch {
    // Yazılamıyorsa sessizce geç; uygulama çalışmaya devam eder.
  }

  duyur();
}

/**
 * `anahtar`ın güncel değeri. `sunucuDegeri`, sunucuda ve hidrasyonun ilk
 * karesinde dönen değerdir; "henüz bilmiyoruz" durumunu temsil eder.
 */
export function useYerelDeger(
  anahtar: string,
  sunucuDegeri: string | null,
): string | null {
  return useSyncExternalStore(
    abone,
    () => yerelOku(anahtar),
    () => sunucuDegeri,
  );
}
