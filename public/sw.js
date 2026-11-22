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
 */

const SURUM = "disiplin-kabuk-v1";
const CEVRIMDISI = "/cevrimdisi.html";

self.addEventListener("install", (olay) => {
  olay.waitUntil(
    caches
      .open(SURUM)
      .then((onbellek) => onbellek.addAll([CEVRIMDISI, "/ikon-192.png"]))
      .then(() => self.skipWaiting()),
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
