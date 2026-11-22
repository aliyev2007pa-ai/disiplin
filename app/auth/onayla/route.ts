import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * E-posta doğrulama bağlantısının indiği yer.
 *
 * Supabase'in e-posta şablonuna göre iki biçim gelebilir:
 *  - ?code=...                 (PKCE akışı — varsayılan)
 *  - ?token_hash=...&type=...  (TokenHash şablonu)
 * İkisi de desteklenir.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/", origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL("/", origin));
    }
  }

  // Bağlantı geçersiz veya süresi dolmuş.
  return NextResponse.redirect(new URL("/giris?durum=onay-basarisiz", origin));
}
