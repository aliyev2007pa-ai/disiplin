"use client";

import { createClient } from "./supabase/client";

/**
 * Tarayıcı tarafındaki bildirim işleri: izin, abonelik, abonelikten çıkma.
 *
 * NASIL ÇALIŞIYOR: tarayıcı her cihaz için push servisinde bir "adres"
 * (endpoint) açar ve iki şifreleme anahtarı verir. Biz bunları veritabanına
 * yazarız. Sunucu bildirimi o adrese, o anahtarlarla şifreleyerek yollar.
 * Push servisi içeriği okuyamaz; yalnızca tarayıcı çözebilir.
 *
 * Abonelik CİHAZA aittir, hesaba değil: telefonda açıp bilgisayarda kapalı
 * bırakabilirsin. Bu yüzden ayar localStorage'da değil, veritabanında bir
 * satır olarak durur — sunucunun hangi cihazlara yollayacağını bilmesi
 * gerekiyor.
 */

export type BildirimDurumu =
  | "desteklenmiyor"
  | "izin-yok"
  | "reddedildi"
  | "acik";

/**
 * VAPID açık anahtarı base64url gelir; tarayıcı ham bayt ister.
 *
 * Diziyi açıkça bir ArrayBuffer üzerine kuruyoruz: `new Uint8Array(n)` ile
 * üretilen dizinin tampon türü TypeScript'e göre paylaşımlı da olabilir ve
 * `applicationServerKey` yalnızca normal tamponu kabul ediyor.
 */
function anahtariBaytaCevir(base64url: string): Uint8Array<ArrayBuffer> {
  const dolgu = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + dolgu).replace(/-/g, "+").replace(/_/g, "/");
  const ham = window.atob(base64);
  const baytlar = new Uint8Array(new ArrayBuffer(ham.length));

  for (let i = 0; i < ham.length; i += 1) {
    baytlar[i] = ham.charCodeAt(i);
  }

  return baytlar;
}

export function destekleniyorMu(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Bu cihazda şu an abonelik var mı? */
export async function mevcutAbonelik(): Promise<PushSubscription | null> {
  if (!destekleniyorMu()) return null;

  try {
    const kayit = await navigator.serviceWorker.ready;
    return await kayit.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function durumuOku(): Promise<BildirimDurumu> {
  if (!destekleniyorMu()) return "desteklenmiyor";
  if (Notification.permission === "denied") return "reddedildi";

  const abonelik = await mevcutAbonelik();
  if (abonelik) return "acik";

  return "izin-yok";
}

/** Kısa bir cihaz adı: "hangi cihazdı bu" sorusuna cevap olsun diye. */
function cihazNotu(): string {
  const ajan = navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(ajan)) return "iPhone / iPad";
  if (/Android/.test(ajan)) return "Android";
  if (/Macintosh/.test(ajan)) return "Mac";
  if (/Windows/.test(ajan)) return "Windows";

  return "Bilinmeyen cihaz";
}

/**
 * İzin ister, abone olur ve aboneliği veritabanına yazar.
 * Hata mesajı döner; her şey yolundaysa null.
 */
export async function abone(): Promise<string | null> {
  if (!destekleniyorMu()) {
    return "Bu tarayıcı bildirimleri desteklemiyor.";
  }

  const acikAnahtar = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!acikAnahtar) {
    return "Bildirim anahtarı tanımlı değil.";
  }

  const izin = await Notification.requestPermission();

  if (izin !== "granted") {
    return izin === "denied"
      ? "Bildirimlere izin verilmedi. Tarayıcı ayarlarından açman gerekiyor."
      : "Bildirim izni alınamadı.";
  }

  try {
    const kayit = await navigator.serviceWorker.ready;

    const abonelik =
      (await kayit.pushManager.getSubscription()) ??
      (await kayit.pushManager.subscribe({
        // Tarayıcı kuralı: her push için gözle görülür bir bildirim
        // göstereceğimize söz veriyoruz. Sessiz takip buna izin vermiyor.
        userVisibleOnly: true,
        applicationServerKey: anahtariBaytaCevir(acikAnahtar),
      }));

    const ham = abonelik.toJSON() as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    if (!ham.endpoint || !ham.keys?.p256dh || !ham.keys?.auth) {
      return "Abonelik bilgisi eksik geldi.";
    }

    const supabase = createClient();
    const { data: oturum } = await supabase.auth.getUser();

    if (!oturum.user) return "Oturum bulunamadı.";

    const { error } = await supabase.from("push_abonelikleri").upsert(
      {
        endpoint: ham.endpoint,
        user_id: oturum.user.id,
        p256dh: ham.keys.p256dh,
        auth: ham.keys.auth,
        cihaz_notu: cihazNotu(),
      },
      { onConflict: "endpoint" },
    );

    if (error) return "Abonelik kaydedilemedi. Tekrar dene.";

    return null;
  } catch {
    return "Abone olunamadı. Tekrar dene.";
  }
}

/** Abonelikten çıkar ve veritabanındaki satırı siler. */
export async function aboneliktenCik(): Promise<string | null> {
  try {
    const abonelik = await mevcutAbonelik();
    if (!abonelik) return null;

    const endpoint = abonelik.endpoint;
    await abonelik.unsubscribe();

    const supabase = createClient();
    const { error } = await supabase
      .from("push_abonelikleri")
      .delete()
      .eq("endpoint", endpoint);

    if (error) return "Kayıt silinemedi ama cihaz artık bildirim almayacak.";

    return null;
  } catch {
    return "Abonelik kapatılamadı. Tekrar dene.";
  }
}
