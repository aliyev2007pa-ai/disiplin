/**
 * Türkçe sayı ekleri.
 *
 * "90 günün 84'ünde yaptın" cümlesindeki ek, sayının OKUNUŞUNA göre değişir:
 * 84 "dördünde", 82 "ikisinde", 90 "doksanında" olur. Kural son basamağa
 * bakar; son basamak sıfırsa onlar basamağına, o da sıfırsa yüzler/binlere.
 *
 * Bu küçük tablo olmadan uygulama "84'inde" gibi kulak tırmalayan metinler
 * üretirdi.
 */

/** Son basamağı sıfır olmayan sayılar: 1 → "birinde", 2 → "ikisinde" … */
const BIRLER: Record<string, string> = {
  "1": "inde",
  "2": "sinde",
  "3": "ünde",
  "4": "ünde",
  "5": "inde",
  "6": "sında",
  "7": "sinde",
  "8": "inde",
  "9": "unda",
};

/** Onluklar: 10 → "onunda", 20 → "yirmisinde", 90 → "doksanında" … */
const ONLAR: Record<string, string> = {
  "1": "unda",
  "2": "sinde",
  "3": "unda",
  "4": "ında",
  "5": "sinde",
  "6": "ında",
  "7": "inde",
  "8": "inde",
  "9": "ında",
};

/** `84` → `84'ünde` — "N tanesinde" anlamındaki ek. */
export function kacindaEki(sayi: number): string {
  const metin = String(Math.max(0, Math.trunc(sayi)));

  const birler = metin.at(-1) ?? "0";
  if (birler !== "0") return `${metin}'${BIRLER[birler]}`;

  const onlar = metin.at(-2);
  if (onlar && onlar !== "0") return `${metin}'${ONLAR[onlar]}`;

  const yuzler = metin.at(-3);
  if (yuzler && yuzler !== "0") return `${metin}'ünde`; // yüzünde

  if (metin.length >= 4) return `${metin}'inde`; // bininde

  return `${metin}'ında`; // sıfırında
}

/**
 * "90 günün 84'ünde yaptın" — uç durumlarda daha doğal cümleler kurar.
 */
export function basariCumlesi(pay: number, payda: number): string {
  if (payda === 0) return "Planlı gün yoktu.";
  if (pay === 0) return `${payda} günün hiçbirinde yapılmadı.`;
  if (pay >= payda) return `${payda} günün hepsinde yaptın 🔥`;

  return `${payda} günün ${kacindaEki(pay)} yaptın`;
}
