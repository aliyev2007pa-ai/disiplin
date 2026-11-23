import type { NextConfig } from "next";

/**
 * Supabase origin'i — CSP'nin connect-src'ine eklenir.
 *
 * Derleme sırasında okunur. Ortam değişkeni yoksa uygulama zaten
 * lib/supabase/env.ts içinde hata veriyor; burada sessizce boş geçiyoruz ki
 * `next build` hata mesajı o anlaşılır yerden gelsin.
 */
function supabaseOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
}

const supabase = supabaseOrigin();
const websocket = supabase.replace(/^https:/, "wss:");

/**
 * İçerik Güvenliği Politikası.
 *
 * script-src'de 'unsafe-inline' var: Next.js sayfayı canlandıran kısa
 * betikleri satır içi yazar ve bunları nonce'suz başka türlü çalıştıramaz.
 * Nonce kurulumu her isteğe ek iş çıkarır ve sessiz kırılma riski taşır;
 * bu uygulamada kullanıcı girdisi HTML olarak basılmadığı (hiçbir yerde
 * dangerouslySetInnerHTML yok) için kazancı sınırlı olurdu.
 *
 * Asıl değer şu üç satırda:
 *   - frame-ancestors 'none'  → site başka bir sayfaya iframe ile gömülemez,
 *     yani "görünmez buton" tuzağıyla (clickjacking) sildirilemez.
 *   - connect-src             → sayfa yalnızca kendisine ve Supabase'e istek
 *     atabilir; bir şekilde kod enjekte edilse bile veri başka bir sunucuya
 *     gönderilemez.
 *   - form-action / base-uri  → formlar ve göreli bağlantılar dışarı
 *     yönlendirilemez.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // api.pwnedpasswords.com: kayıt ekranındaki sızmış şifre kontrolü.
  // Oraya yalnızca şifre özetinin ilk 5 karakteri gider (lib/sizmisSifre.ts).
  `connect-src 'self' ${supabase} ${websocket} https://api.pwnedpasswords.com`.trim(),
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // "upgrade-insecure-requests" BİLEREK yok: canlı sürüm zaten tamamen
  // https ve Vercel HSTS gönderiyor, yani eklediği bir koruma olmuyor.
  // Buna karşılık yerelde http://localhost testini bozuyordu (tarayıcı
  // isteği https'e çevirip SSL hatası alıyordu).
].join("; ");

const guvenlikBasliklari = [
  { key: "Content-Security-Policy", value: csp },
  // CSP'yi anlamayan eski tarayıcılar için clickjacking koruması.
  { key: "X-Frame-Options", value: "DENY" },
  // Tarayıcı dosya türünü "tahmin etmesin"; sunucunun dediği neyse o.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Dışarıya giderken tam adres sızmasın.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Uygulamanın ihtiyacı olmayan cihaz izinleri baştan kapalı.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  /**
   * Cache Components (ve ona bağlı partial prefetching) bilerek KAPALI.
   *
   * Bu uygulamanın bütün sayfaları oturuma ve "bugün"e bağlı; önbelleğe
   * alınabilecek statik bir kabuk neredeyse yok. Cache Components açıkken
   * `cookies()` okuyan her sayfa bir <Suspense> sınırı içinde olmak zorunda,
   * aksi halde derleme hata veriyor. Kazancı olmayan bir karmaşa olacağı için
   * standart davranışta kalıyoruz.
   */

  // "X-Powered-By: Next.js" başlığını gönderme: saldırgana hangi teknolojiyi
  // kullandığımızı bedavadan söylemenin faydası yok.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: guvenlikBasliklari }];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
