import { ayEkle, gunEkle, yilEkle } from "./dates";

/** Hedef süresinin birimi. */
export type Birim = "gun" | "hafta" | "ay" | "yil";

export type SureSecenegi = {
  kimlik: string;
  etiket: string;
  sayi: number;
  birim: Birim;
};

/** Hedef formundaki hazır süre seçenekleri (Bölüm 3). */
export const SURE_SECENEKLERI: readonly SureSecenegi[] = [
  { kimlik: "1-hafta", etiket: "1 hafta", sayi: 1, birim: "hafta" },
  { kimlik: "10-gun", etiket: "10 gün", sayi: 10, birim: "gun" },
  { kimlik: "15-gun", etiket: "15 gün", sayi: 15, birim: "gun" },
  { kimlik: "1-ay", etiket: "1 ay", sayi: 1, birim: "ay" },
  { kimlik: "2-ay", etiket: "2 ay", sayi: 2, birim: "ay" },
  { kimlik: "3-ay", etiket: "3 ay", sayi: 3, birim: "ay" },
  { kimlik: "6-ay", etiket: "6 ay", sayi: 6, birim: "ay" },
  { kimlik: "1-yil", etiket: "1 yıl", sayi: 1, birim: "yil" },
];

/** Özel süre seçilince kullanılan birim adları. */
export const BIRIM_ADLARI: Record<Birim, string> = {
  gun: "gün",
  hafta: "hafta",
  ay: "ay",
  yil: "yıl",
};

/**
 * Özel sürede birim başına üst sınır. Amaç saçma uzun hedefleri (ve bitiş
 * tarihi hesabında taşmayı) engellemek; hepsi en çok ~5 yıla denk gelir.
 */
export const BIRIM_UST_SINIR: Record<Birim, number> = {
  gun: 365,
  hafta: 52,
  ay: 24,
  yil: 5,
};

/**
 * Bitiş tarihi (HARİÇ) — Bölüm 6 kural 4.
 *
 * Gün ve hafta gün sayısıyla eklenir (1 hafta = 7 gün); ay ve yıl takvimden
 * eklenir. Cuma eklenen 1 haftalık hedefin bitişi bir sonraki Cuma'dır, yani
 * tiklenebilir günler Cuma…Perşembe olur.
 */
export function bitisTarihi(
  baslangic: string,
  sayi: number,
  birim: Birim,
): string {
  switch (birim) {
    case "gun":
      return gunEkle(baslangic, sayi);
    case "hafta":
      return gunEkle(baslangic, sayi * 7);
    case "ay":
      return ayEkle(baslangic, sayi);
    case "yil":
      return yilEkle(baslangic, sayi);
  }
}

const TEKIL_ETIKET: Record<Birim, string> = {
  gun: "Günlük",
  hafta: "Haftalık",
  ay: "Aylık",
  yil: "Yıllık",
};

/**
 * Kartta görünen süre rozeti: `1 ay` → "Aylık", `3 ay` → "3 Aylık",
 * `45 gün` → "45 Günlük".
 */
export function sureEtiketi(sayi: number, birim: Birim): string {
  const temel = TEKIL_ETIKET[birim];
  return sayi === 1 ? temel : `${sayi} ${temel}`;
}

export type Gun = {
  iso: number;
  kisa: string;
  tam: string;
};

/** Haftanın günleri, ISO sırasıyla (1 = Pazartesi … 7 = Pazar). */
export const GUNLER: readonly Gun[] = [
  { iso: 1, kisa: "Pzt", tam: "Pazartesi" },
  { iso: 2, kisa: "Sal", tam: "Salı" },
  { iso: 3, kisa: "Çar", tam: "Çarşamba" },
  { iso: 4, kisa: "Per", tam: "Perşembe" },
  { iso: 5, kisa: "Cum", tam: "Cuma" },
  { iso: 6, kisa: "Cmt", tam: "Cumartesi" },
  { iso: 7, kisa: "Paz", tam: "Pazar" },
];

/** `[3, 1, 7, 5]` → `"Pzt·Çar·Cum·Paz"` */
export function gunlerEtiketi(gunler: number[]): string {
  return [...gunler]
    .sort((a, b) => a - b)
    .map((iso) => GUNLER[iso - 1]?.kisa)
    .filter(Boolean)
    .join("·");
}
