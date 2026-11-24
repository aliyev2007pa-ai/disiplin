import { gunEkle, isoGunNumarasi } from "./dates";
import { planliMi } from "./stats";

/**
 * İstatistik sayfasının hesapları.
 *
 * Buradaki her şey saf fonksiyondur: girdisi görev aralıkları ve tiklenmiş
 * günler, çıktısı sayı. Veritabanına gitmez, "bugün"ü kendi kafasından
 * hesaplamaz — Bakü günü dışarıdan verilir (bkz. lib/dates.ts).
 *
 * Tek bir "günlük durum" dizisi üretip bütün grafikleri ondan türetiyoruz.
 * Böylece ekrandaki rakamlar birbiriyle çelişemez: hepsi aynı kaynaktan.
 */

/** Veri bozulsa bile döngüler sonsuza gitmesin. */
const EN_FAZLA_GUN = 400;

/** Isı haritasında gösterilen geçmiş: 18 hafta (yaklaşık dört ay). */
export const ISI_HAFTA_SAYISI = 18;

export type GorevAraligi = {
  baslangic: string;
  /** Bitiş HARİÇ: bu güne ait plan yoktur. */
  bitisHaric: string;
  gunler: number[] | null;
  yapilanGunler: Set<string>;
};

export type GunDurumu = {
  gun: string;
  /** O gün planlı olan görev sayısı. */
  planli: number;
  /** O gün tiklenen görev sayısı. */
  yapilan: number;
};

/**
 * `[baslangic, bugun]` aralığındaki her gün için planlı ve yapılan sayısı.
 * Bugün dahildir, çünkü bugünün tikleri de sayılır.
 */
export function gunlukDurumlar(
  gorevler: GorevAraligi[],
  baslangic: string,
  bugun: string,
): GunDurumu[] {
  const durumlar: GunDurumu[] = [];
  let gun = baslangic;

  for (let adim = 0; gun <= bugun && adim < EN_FAZLA_GUN; adim += 1) {
    let planli = 0;
    let yapilan = 0;

    for (const gorev of gorevler) {
      const aralikta = gun >= gorev.baslangic && gun < gorev.bitisHaric;
      if (!aralikta || !planliMi(gun, gorev.gunler)) continue;

      planli += 1;
      if (gorev.yapilanGunler.has(gun)) yapilan += 1;
    }

    durumlar.push({ gun, planli, yapilan });
    gun = gunEkle(gun, 1);
  }

  return durumlar;
}

/** Görevlerin en erken başlangıcı; hiç görev yoksa bugün. */
export function enErkenGun(gorevler: GorevAraligi[], bugun: string): string {
  let enErken = bugun;

  for (const gorev of gorevler) {
    if (gorev.baslangic < enErken) enErken = gorev.baslangic;
  }

  // Çok eskiye gitmeyelim; grafikte de okunmaz, hesapta da gereksiz.
  const sinir = gunEkle(bugun, -(EN_FAZLA_GUN - 1));

  return enErken < sinir ? sinir : enErken;
}

/** Planlı işi olan ve hepsi yapılmış gün. */
function kusursuzMu(durum: GunDurumu): boolean {
  return durum.planli > 0 && durum.yapilan === durum.planli;
}

export type Ozet = {
  toplamYapilan: number;
  toplamPlanli: number;
  /** 0–1 arası genel başarı. */
  oran: number;
  kusursuzGun: number;
  /** Bugünden geriye doğru kesintisiz kusursuz gün sayısı. */
  guncelSeri: number;
  /** Tüm zamanların en uzun kusursuz gün serisi. */
  enUzunSeri: number;
};

export function ozetCikar(durumlar: GunDurumu[], bugun: string): Ozet {
  let toplamYapilan = 0;
  let toplamPlanli = 0;
  let kusursuzGun = 0;
  let enUzunSeri = 0;
  let simdiki = 0;

  for (const durum of durumlar) {
    toplamYapilan += durum.yapilan;
    toplamPlanli += durum.planli;

    // Planlı işi olmayan gün seriyi ne bozar ne uzatır: o gün yapılacak
    // bir şey yoktu, kaçırılmış sayılmaz.
    if (durum.planli === 0) continue;

    if (kusursuzMu(durum)) {
      kusursuzGun += 1;
      simdiki += 1;
      if (simdiki > enUzunSeri) enUzunSeri = simdiki;
    } else {
      simdiki = 0;
    }
  }

  return {
    toplamYapilan,
    toplamPlanli,
    oran: toplamPlanli === 0 ? 0 : toplamYapilan / toplamPlanli,
    kusursuzGun,
    guncelSeri: guncelSeriHesapla(durumlar, bugun),
    enUzunSeri,
  };
}

/**
 * Güncel seri: bugünden geriye doğru kusursuz günleri say.
 *
 * Bugün henüz bitmediği için, bugün kusursuz değilse seriyi BOZMAZ — dünden
 * başlanır. Hedef kartlarındaki seri mantığıyla aynı (bkz. lib/stats.ts).
 */
function guncelSeriHesapla(durumlar: GunDurumu[], bugun: string): number {
  const haritalar = new Map(durumlar.map((d) => [d.gun, d]));
  let sayac = 0;
  let gun = bugun;

  const bugunku = haritalar.get(bugun);
  if (!bugunku || !kusursuzMu(bugunku)) gun = gunEkle(bugun, -1);

  for (let adim = 0; adim < EN_FAZLA_GUN; adim += 1) {
    const durum = haritalar.get(gun);
    if (!durum) break;

    if (durum.planli > 0) {
      if (!kusursuzMu(durum)) break;
      sayac += 1;
    }

    gun = gunEkle(gun, -1);
  }

  return sayac;
}

export type GunAdiDurumu = {
  /** ISO gün numarası: 1 = Pazartesi … 7 = Pazar. */
  iso: number;
  planli: number;
  yapilan: number;
  oran: number;
};

/** Haftanın hangi günü daha iyi olduğunu gösteren döküm. */
export function gunAdiDokumu(durumlar: GunDurumu[]): GunAdiDurumu[] {
  const toplam = new Map<number, { planli: number; yapilan: number }>();

  for (let iso = 1; iso <= 7; iso += 1) {
    toplam.set(iso, { planli: 0, yapilan: 0 });
  }

  for (const durum of durumlar) {
    const kayit = toplam.get(isoGunNumarasi(durum.gun))!;
    kayit.planli += durum.planli;
    kayit.yapilan += durum.yapilan;
  }

  return [1, 2, 3, 4, 5, 6, 7].map((iso) => {
    const kayit = toplam.get(iso)!;

    return {
      iso,
      planli: kayit.planli,
      yapilan: kayit.yapilan,
      oran: kayit.planli === 0 ? 0 : kayit.yapilan / kayit.planli,
    };
  });
}

/** Isı haritasındaki bir kare. `null` = aralığın dışında, çizilmez. */
export type IsiKaresi = GunDurumu | null;

/**
 * Isı haritası: her sütun bir hafta, her satır haftanın bir günü
 * (üst satır Pazartesi). Son sütun bu haftadır.
 *
 * Takvim Pazartesi'den başladığı için ilk sütunun başındaki ve son sütunun
 * sonundaki boş günler `null` olur.
 */
export function isiHaritasi(
  durumlar: GunDurumu[],
  bugun: string,
  haftaSayisi = ISI_HAFTA_SAYISI,
): IsiKaresi[][] {
  const haritalar = new Map(durumlar.map((d) => [d.gun, d]));

  // Bu haftanın pazartesisi, oradan geriye doğru haftaSayisi-1 hafta.
  const buPazartesi = gunEkle(bugun, -(isoGunNumarasi(bugun) - 1));
  const ilkGun = gunEkle(buPazartesi, -7 * (haftaSayisi - 1));

  const haftalar: IsiKaresi[][] = [];

  for (let hafta = 0; hafta < haftaSayisi; hafta += 1) {
    const sutun: IsiKaresi[] = [];

    for (let gunNo = 0; gunNo < 7; gunNo += 1) {
      const gun = gunEkle(ilkGun, hafta * 7 + gunNo);

      // Gelecek günler çizilmez. Geçmişte veri olmayan günler (uygulamayı
      // kullanmaya başlamadan önceki haftalar) boş kare olarak çizilir —
      // yoksa ızgaranın sol tarafı tırtıklı görünür.
      sutun.push(
        gun > bugun
          ? null
          : (haritalar.get(gun) ?? { gun, planli: 0, yapilan: 0 }),
      );
    }

    haftalar.push(sutun);
  }

  return haftalar;
}

/** Isı karesinin koyuluk basamağı: 0 (hiç) … 4 (kusursuz). */
export function isiBasamagi(kare: IsiKaresi): number {
  if (kare === null || kare.planli === 0) return 0;

  const oran = kare.yapilan / kare.planli;
  if (oran === 0) return 1;
  if (oran < 0.5) return 2;
  if (oran < 1) return 3;

  return 4;
}
