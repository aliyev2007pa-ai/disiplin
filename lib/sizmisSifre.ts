/**
 * Şifrenin bilinen veri sızıntılarında geçip geçmediğini kontrol eder.
 *
 * NEDEN BURADA: Supabase'in aynı kontrolü (HaveIBeenPwned entegrasyonu)
 * yalnızca ücretli planda çalışıyor. Servisin kendisi ücretsiz olduğu için
 * kontrolü kendimiz yapıyoruz.
 *
 * ŞİFRE CİHAZDAN ÇIKMAZ — "k-anonimlik" yöntemi:
 *   1. Şifrenin SHA-1 özeti alınır (40 karakter).
 *   2. Sunucuya yalnızca özetin İLK 5 KARAKTERİ gönderilir.
 *   3. Sunucu o 5 karakterle başlayan binlerce özetin geri kalanını döner.
 *   4. Karşılaştırma tarayıcının içinde yapılır.
 * Sunucu ne şifreyi ne de tam özeti görür; hangi şifrenin sorulduğunu
 * bilemez. "Add-Padding" başlığı cevaba sahte satırlar ekletir, böylece
 * cevabın boyutundan bile çıkarım yapılamaz.
 *
 * SHA-1 burada şifre saklamak için değil, HaveIBeenPwned'in veri biçimi
 * öyle olduğu için kullanılıyor. Şifreler Supabase tarafında bcrypt ile
 * saklanır; bu fonksiyonun onunla ilgisi yoktur.
 *
 * HATA DURUMUNDA "sızmamış" döner (fail-open): servis çökerse kimse hesap
 * açamaz duruma düşmesin. Zaten asıl koruma RLS ve davet kodudur.
 */

const UC_NOKTA = "https://api.pwnedpasswords.com/range/";
const ZAMAN_ASIMI_MS = 3500;

async function sha1Ozeti(metin: string): Promise<string> {
  const veri = new TextEncoder().encode(metin);
  const ozet = await crypto.subtle.digest("SHA-1", veri);

  return Array.from(new Uint8Array(ozet))
    .map((bayt) => bayt.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function sifreSizmisMi(sifre: string): Promise<boolean> {
  // crypto.subtle yalnızca güvenli bağlamda (https veya localhost) vardır.
  if (typeof crypto === "undefined" || !crypto.subtle) return false;

  const kontrol = new AbortController();
  const zamanlayici = window.setTimeout(
    () => kontrol.abort(),
    ZAMAN_ASIMI_MS,
  );

  try {
    const ozet = await sha1Ozeti(sifre);
    const onEk = ozet.slice(0, 5);
    const sonEk = ozet.slice(5);

    const cevap = await fetch(`${UC_NOKTA}${onEk}`, {
      signal: kontrol.signal,
      headers: { "Add-Padding": "true" },
    });

    if (!cevap.ok) return false;

    const govde = await cevap.text();

    for (const satir of govde.split("\n")) {
      const [ek, sayi] = satir.trim().split(":");

      // Dolgu satırlarının sayacı 0'dır; onları saymıyoruz.
      if (ek === sonEk) return Number(sayi) > 0;
    }

    return false;
  } catch {
    return false;
  } finally {
    window.clearTimeout(zamanlayici);
  }
}
