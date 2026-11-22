/**
 * Ortam değişkenlerini tek yerden, doğrulayarak okur.
 *
 * Buradaki iki değer de tarayıcıya gönderilir ve gizli DEĞİLDİR.
 * Verileri koruyan şey anahtar değil, veritabanındaki RLS politikalarıdır.
 * "service_role" anahtarı bu projede hiç kullanılmaz.
 */

function zorunlu(ad: string, deger: string | undefined): string {
  if (!deger) {
    throw new Error(
      `Eksik ortam değişkeni: ${ad}. ".env.local.example" dosyasını ".env.local" olarak kopyalayıp doldur.`,
    );
  }
  return deger;
}

export const SUPABASE_URL = zorunlu(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_KEY = zorunlu(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
