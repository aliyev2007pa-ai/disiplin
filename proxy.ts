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
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
