import type { MetadataRoute } from "next";

/**
 * Telefonun ana ekranına eklendiğinde uygulamayı tarayıcı çubuğu olmadan,
 * kendi ikonuyla açar.
 *
 * `display: standalone` adres çubuğunu gizler; `theme_color` Android'de
 * durum çubuğunu bordoya boyar. Simgeler `public/` altındadır ve tek bir
 * kaynak görselden üretilmiştir.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Disiplin",
    short_name: "Disiplin",
    description: "Kişisel görev ve alışkanlık paneli.",
    lang: "tr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#7B1E3A",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: "/ikon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ikon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Android ikonu kendi şekline (daire, kare, damla) keser. Bu sürümde
      // tasarım güvenli alanın içindedir, kesilen yer yalnızca bordo zemindir.
      {
        src: "/ikon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
