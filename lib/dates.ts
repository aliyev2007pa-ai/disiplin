import { addDays, addMonths, addYears, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Uygulamadaki "bugün" her zaman Bakü takvim günüdür.
 *
 * Telefonun saat dilimi başka olsa bile değişmez: kullanıcı Almanya'ya gitse
 * de günü Bakü'ye göre yaşar. Veritabanı tarafında da aynı kural geçerlidir
 * (toggle_completion fonksiyonu `now() at time zone 'Asia/Baku'` kullanır).
 */
export const ZAMAN_DILIMI = "Asia/Baku";

/** Bakü'ye göre bugün, `yyyy-MM-dd` biçiminde. */
export function bugunBaku(): string {
  return formatInTimeZone(new Date(), ZAMAN_DILIMI, "yyyy-MM-dd");
}

/** `yyyy-MM-dd` değerine gün ekler, yine `yyyy-MM-dd` döner. */
export function gunEkle(isoGun: string, gunSayisi: number): string {
  return format(addDays(parseISO(isoGun), gunSayisi), "yyyy-MM-dd");
}

/**
 * `2026-11-22` → `Cumartesi, 22 Kasım`
 *
 * date-fns Türkçe yerelinde gün adları küçük harfle başlar ("cumartesi"),
 * başlıkta büyük harf istediğimiz için ilk harfi yükseltiyoruz.
 */
export function baslikTarihi(isoGun: string): string {
  const metin = format(parseISO(isoGun), "EEEE, d MMMM", { locale: tr });
  return metin.charAt(0).toLocaleUpperCase("tr-TR") + metin.slice(1);
}

/** ISO gün numarası: 1 = Pazartesi … 7 = Pazar. */
export function isoGunNumarasi(isoGun: string): number {
  const gun = parseISO(isoGun).getDay();
  return gun === 0 ? 7 : gun;
}

/**
 * `yyyy-MM-dd` değerine takvim ayı ekler.
 *
 * Bölüm 6 kural 4: ay ve yıl süreleri gün sayısına çevrilmez, takvimden
 * eklenir. 31 Ocak + 1 ay = 28/29 Şubat olur (date-fns ayın son gününe kırpar).
 */
export function ayEkle(isoGun: string, aySayisi: number): string {
  return format(addMonths(parseISO(isoGun), aySayisi), "yyyy-MM-dd");
}

/** `yyyy-MM-dd` değerine takvim yılı ekler. */
export function yilEkle(isoGun: string, yilSayisi: number): string {
  return format(addYears(parseISO(isoGun), yilSayisi), "yyyy-MM-dd");
}

/** `2026-11-25` → `Çarşamba` */
export function gunAdi(isoGun: string): string {
  const metin = format(parseISO(isoGun), "EEEE", { locale: tr });
  return metin.charAt(0).toLocaleUpperCase("tr-TR") + metin.slice(1);
}
