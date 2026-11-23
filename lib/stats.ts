import { gunEkle, isoGunNumarasi } from "./dates";

/**
 * Hedef istatistikleri — PROJE-PLANI.md bölüm 6, kural 3, 5 ve 6.
 *
 * Buradaki her şey saf fonksiyondur: girdisi tarih dizgileri ve tiklenmiş
 * günler kümesi, çıktısı sayı. Veritabanına gitmez, bugünü kendi kafasından
 * hesaplamaz; "bugün" her zaman dışarıdan (Bakü takvim günü olarak) verilir.
 */

/** Döngülerin veri bozulsa bile sonsuza gitmemesi için emniyet kemeri. */
const EN_FAZLA_GUN = 4000;

/** Kural 3: `weekdays` null ise her gün planlıdır. */
export function planliMi(isoGun: string, gunler: number[] | null): boolean {
  if (gunler === null || gunler.length === 0) return true;
  return gunler.includes(isoGunNumarasi(isoGun));
}

/**
 * `[baslangic, bitisHaric)` aralığındaki planlı gün sayısı.
 *
 * `yyyy-MM-dd` dizgileri sözlük sırasında takvim sırasıyla aynı olduğu için
 * karşılaştırmalar doğrudan dizgi üzerinden yapılabilir.
 */
export function planliGunSayisi(
  baslangic: string,
  bitisHaric: string,
  gunler: number[] | null,
): number {
  let sayac = 0;
  let gun = baslangic;

  for (let adim = 0; gun < bitisHaric && adim < EN_FAZLA_GUN; adim += 1) {
    if (planliMi(gun, gunler)) sayac += 1;
    gun = gunEkle(gun, 1);
  }

  return sayac;
}

/**
 * Kural 6 — seri: bugünden geriye doğru planlı günleri say, tiklenmemiş ilk
 * planlı günde dur. Bugün planlı ama henüz tiklenmediyse seriyi bozmaz:
 * bugün atlanır, dünden başlanır. Kaçırılan gün seriyi sıfırlar.
 */
export function seriUzunlugu(
  bugun: string,
  baslangic: string,
  gunler: number[] | null,
  yapilanGunler: Set<string>,
): number {
  let sayac = 0;
  let gun = bugun;

  if (planliMi(gun, gunler) && !yapilanGunler.has(gun)) {
    gun = gunEkle(gun, -1);
  }

  for (let adim = 0; gun >= baslangic && adim < EN_FAZLA_GUN; adim += 1) {
    if (planliMi(gun, gunler)) {
      if (!yapilanGunler.has(gun)) break;
      sayac += 1;
    }

    gun = gunEkle(gun, -1);
  }

  return sayac;
}

/**
 * Yarından itibaren ilk planlı gün. Dinlenme günündeki kartta
 * "Sonraki: Çarşamba" yazmak için.
 *
 * Gün seçimi haftalık tekrar ettiği için yedi gün yeter; bu aralıkta planlı
 * gün yoksa hedefin süresi doluyor demektir ve null döner.
 */
export function sonrakiPlanliGun(
  bugun: string,
  bitisHaric: string,
  gunler: number[] | null,
): string | null {
  for (let adim = 1; adim <= 7; adim += 1) {
    const gun = gunEkle(bugun, adim);
    if (gun >= bitisHaric) return null;
    if (planliMi(gun, gunler)) return gun;
  }

  return null;
}

export type HedefIstatistik = {
  /** Toplam tik sayısı (kural 5'teki pay). */
  pay: number;
  /** Hedef boyunca planlı gün sayısı (kural 5'teki payda). */
  payda: number;
  /** 0–1 arası ilerleme oranı. */
  oran: number;
  /** Güncel seri. */
  seri: number;
  /** Bugün dahil, yapılmayı bekleyen planlı gün sayısı. */
  kalan: number;
  /** Bugün bu hedef planlı mı? */
  bugunPlanli: boolean;
  /** Bugün tiklenmiş mi? */
  bugunYapildi: boolean;
};

export function hedefIstatistikleri({
  bugun,
  baslangic,
  bitisHaric,
  gunler,
  yapilanGunler,
}: {
  bugun: string;
  baslangic: string;
  bitisHaric: string;
  gunler: number[] | null;
  yapilanGunler: Set<string>;
}): HedefIstatistik {
  const pay = yapilanGunler.size;
  const payda = planliGunSayisi(baslangic, bitisHaric, gunler);
  const bugunYapildi = yapilanGunler.has(bugun);

  // "Kalan": bugünden sonuna kadar planlı günler, bugün zaten tiklendiyse
  // bugün sayılmaz. Böylece "35 / 90" ile hiçbir zaman çelişmez.
  const kalan = Math.max(
    0,
    planliGunSayisi(bugun, bitisHaric, gunler) - (bugunYapildi ? 1 : 0),
  );

  return {
    pay,
    payda,
    oran: payda === 0 ? 0 : Math.min(1, pay / payda),
    seri: seriUzunlugu(bugun, baslangic, gunler, yapilanGunler),
    kalan,
    bugunPlanli: planliMi(bugun, gunler),
    bugunYapildi,
  };
}

/**
 * Hedef boyunca ulaşılan en uzun kesintisiz seri.
 *
 * Tamamlananlar sayfasında "en uzun seri" olarak gösterilir; güncel seriden
 * farklıdır, çünkü geçmişte kalmış bir seriyi de sayar.
 */
export function enUzunSeri(
  baslangic: string,
  bitisHaric: string,
  gunler: number[] | null,
  yapilanGunler: Set<string>,
): number {
  let enIyi = 0;
  let simdiki = 0;
  let gun = baslangic;

  for (let adim = 0; gun < bitisHaric && adim < EN_FAZLA_GUN; adim += 1) {
    if (planliMi(gun, gunler)) {
      if (yapilanGunler.has(gun)) {
        simdiki += 1;
        if (simdiki > enIyi) enIyi = simdiki;
      } else {
        simdiki = 0;
      }
    }

    gun = gunEkle(gun, 1);
  }

  return enIyi;
}
