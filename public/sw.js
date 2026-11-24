/*
 * Disiplin — basit servis çalışanı.
 *
 * GÜVENLİK KARARI: sayfa HTML'leri ASLA önbelleğe alınmaz.
 * Her sayfa oturuma bağlıdır ve kullanıcının verisini içerir; bunları diske
 * yazmak, aynı cihazı kullanan başka birinin (ya da çıkış yapıldıktan
 * sonranın) eski içeriği görmesine yol açardı. Veri her zaman canlı çekilir.
 *
 * Önbelleğe alınan tek şey uygulama kabuğudur: /_next/static altındaki
 * içerik-hash'li dosyalar, ikonlar ve yazı tipleri. Bunlar herkese açıktır
 * ve adları değiştiği için bayatlamaz.
 *
 * Supabase istekleri (başka bir origin) hiç ellenmez.
 *
 * Bildirimler: "push" olayı uygulama kapalıyken de çalışır, çünkü bu dosya
 * sayfadan bağımsız yaşar. Gelen veriden yalnızca başlık ve metin okunur.
 */

const SURUM = "disiplin-kabuk-v2";
const CEVRIMDISI = "/cevrimdisi.html";

/**
 * Geliştirme makinesinde HİÇBİR ŞEY önbelleğe alınmaz.
 *
 * Canlıda `/_next/static` altındaki dosyaların adında içerik özeti vardır,
 * yani değişince adı da değişir ve bayat kopya kalmaz. Geliştirmede ise
 * adlar sabittir: önbellekleseydik "kodu değiştirdim ama ekranda eskisi
 * duruyor" diye saatler yanardı. Buna rağmen çalışanı yerelde de
 * kaydediyoruz, çünkü bildirimleri ancak böyle deneyebiliyoruz.
 */
const GELISTIRME =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

self.addEventListener("install", (olay) => {
  olay.waitUntil(
    (GELISTIRME
      ? Promise.resolve()
      : caches
          .open(SURUM)
          .then((onbellek) => onbellek.addAll([CEVRIMDISI, "/ikon-192.png"]))
    ).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (olay) => {
  olay.waitUntil(
    caches
      .keys()
      .then((adlar) =>
        Promise.all(
          adlar.filter((ad) => ad !== SURUM).map((ad) => caches.delete(ad)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function onbelleklenebilirMi(yol) {
  return (
    yol.startsWith("/_next/static/") ||
    /\.(?:png|svg|ico|webp|woff2?)$/.test(yol)
  );
}

self.addEventListener("fetch", (olay) => {
  if (GELISTIRME) return;

  const istek = olay.request;
  if (istek.method !== "GET") return;

  let url;
  try {
    url = new URL(istek.url);
  } catch {
    return;
  }

  // Başka origin'ler (Supabase) doğrudan ağa gider.
  if (url.origin !== self.location.origin) return;

  // Sayfa gezinmeleri: her zaman ağ. Ağ yoksa çevrimdışı sayfası.
  if (istek.mode === "navigate") {
    olay.respondWith(
      fetch(istek).catch(() =>
        caches
          .match(CEVRIMDISI)
          .then(
            (cevap) =>
              cevap ?? new Response("Çevrimdışısın.", { status: 503 }),
          ),
      ),
    );
    return;
  }

  if (!onbelleklenebilirMi(url.pathname)) return;

  olay.respondWith(
    caches.match(istek).then((bulunan) => {
      if (bulunan) return bulunan;

      return fetch(istek).then((cevap) => {
        if (cevap.ok && cevap.type === "basic") {
          const kopya = cevap.clone();
          void caches.open(SURUM).then((onbellek) => onbellek.put(istek, kopya));
        }

        return cevap;
      });
    }),
  );
});

/* -------------------------------------------------------------------------
 * Bildirimler
 * ---------------------------------------------------------------------- */

/**
 * Push mesajı geldi.
 *
 * Tarayıcı kuralı: abone olurken "userVisibleOnly" dediğimiz için her push
 * için MUTLAKA bir bildirim göstermek zorundayız. Veri okunamazsa bile
 * genel bir bildirim gösteriyoruz; aksi hâlde tarayıcı aboneliği iptal eder.
 */
self.addEventListener("push", (olay) => {
  let veri = {};

  try {
    veri = olay.data ? olay.data.json() : {};
  } catch {
    veri = {};
  }

  const baslik = veri.baslik || "Disiplin";
  const secenekler = {
    body: veri.govde || "Hatırlatma vakti.",
    icon: "/ikon-192.png",
    badge: "/ikon-192.png",
    lang: "tr",
    // Aynı etikete sahip bildirim üst üste yığılmaz, yenisi eskisinin
    // yerini alır. Telefon ekranı aynı hatırlatmayla dolmasın.
    tag: veri.etiket || "disiplin",
    renotify: true,
    data: { yol: veri.yol || "/" },
  };

  olay.waitUntil(self.registration.showNotification(baslik, secenekler));
});

/** Bildirime dokunulunca: açık sekme varsa ona dön, yoksa uygulamayı aç. */
self.addEventListener("notificationclick", (olay) => {
  olay.notification.close();

  const yol = (olay.notification.data && olay.notification.data.yol) || "/";
  const hedef = new URL(yol, self.location.origin).href;

  olay.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((pencereler) => {
        for (const pencere of pencereler) {
          if (pencere.url === hedef && "focus" in pencere) {
            return pencere.focus();
          }
        }

        if (pencereler.length > 0 && "navigate" in pencereler[0]) {
          return pencereler[0].navigate(hedef).then((p) => p && p.focus());
        }

        return self.clients.openWindow(hedef);
      }),
  );
});
