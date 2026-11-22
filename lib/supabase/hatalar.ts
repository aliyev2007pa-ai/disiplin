import { AuthError } from "@supabase/supabase-js";

/**
 * Supabase'in İngilizce hata mesajlarını anlaşılır Türkçeye çevirir.
 *
 * Bilinmeyen bir hatada ham mesajı göstermeyiz: kullanıcıya bir şey ifade
 * etmediği gibi sistem hakkında gereksiz bilgi de sızdırabilir.
 */
export function authHatasiniCevir(hata: unknown): string {
  if (!(hata instanceof AuthError)) {
    return "Beklenmeyen bir sorun oldu. Biraz sonra tekrar dene.";
  }

  switch (hata.code) {
    case "invalid_credentials":
      return "E-posta veya şifre hatalı.";

    case "email_not_confirmed":
      return "Önce e-postanı doğrulaman gerekiyor. Gelen kutunu ve spam klasörünü kontrol et.";

    case "user_already_exists":
    case "email_exists":
      return "Bu e-postayla zaten bir hesap var. Giriş yapmayı dene.";

    case "weak_password":
      return "Şifre çok zayıf. En az 8 karakter, tahmin edilmesi zor bir şey seç.";

    case "email_address_invalid":
      return "Bu e-posta adresi kabul edilmedi. Gerçek ve kullandığın bir adres yaz.";

    case "signup_disabled":
      return "Kayıt şu an kapalı.";

    case "over_email_send_rate_limit":
      return "Çok fazla e-posta gönderildi. Birkaç dakika bekleyip tekrar dene.";

    case "over_request_rate_limit":
      return "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.";

    case "validation_failed":
      return "Girdiğin bilgileri kontrol et.";

    default:
      return "İşlem tamamlanamadı. Biraz sonra tekrar dene.";
  }
}
