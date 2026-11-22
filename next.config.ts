import type { NextConfig } from "next";

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
