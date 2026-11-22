import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16'da bu dosya "middleware.ts" değil "proxy.ts" olarak adlandırılır
 * ve dışa aktarılan fonksiyonun adı "proxy"dir.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Statik dosyalar ve ikonlar dışındaki her yolda çalışır.
     * Böylece oturum her gezinmede tazelenir ve çerez süresi dolmaz.
     *
     * PWA dosyaları (manifest, servis çalışanı, çevrimdışı sayfası) oturum
     * kontrolünün DIŞINDA kalmalıdır: giriş yapılmamışken bunlar da
     * /giris'e yönlendirilirse tarayıcı servis çalışanını kaydedemez ve
     * çevrimdışı sayfası hiç açılmaz. İçlerinde kişisel veri yoktur.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|cevrimdisi\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
