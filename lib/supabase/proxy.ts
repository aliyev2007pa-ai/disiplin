import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/**
 * Oturum açmadan görülebilen yollar.
 *
 * `/api` burada: hatırlatma uç noktasını zamanlayıcı çağırıyor, onun
 * oturumu yok. O uç nokta kimliği kendisi doğruluyor (paylaşılan sır).
 * Oturum gerektiren API yolları da yetkiyi kendi kontrol eder.
 */
const ACIK_YOLLAR = ["/giris", "/kayit", "/auth", "/api"];

function acikYolMu(pathname: string) {
  return ACIK_YOLLAR.some(
    (yol) => pathname === yol || pathname.startsWith(`${yol}/`),
  );
}

/**
 * Her istekte oturumu tazeler ve yönlendirmeyi yapar.
 *
 * Bu, güvenliğin TEK katmanı değildir: asıl koruma veritabanındaki RLS
 * politikalarıdır. Middleware sadece kullanıcıyı doğru sayfaya götürür.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() jetonu Supabase'e doğrulatır; getSession() çereze güvenir.
  // Bu çağrı aynı zamanda süresi dolmak üzere olan oturumu tazeler.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Girişsiz kullanıcı korumalı bir sayfaya gidiyorsa giriş sayfasına al.
  if (!user && !acikYolMu(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Girişli kullanıcı giriş/kayıt sayfasına gidiyorsa panele al.
  if (user && (pathname === "/giris" || pathname === "/kayit")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
