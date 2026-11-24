/**
 * Sürükle-bırak sıralamasının hesabı.
 *
 * Fikir şu: her kartın ondalık bir `sira` değeri var ve liste bu değere göre
 * diziliyor. Bir kart iki kartın arasına bırakıldığında ona komşularının tam
 * ORTASINDAKİ değer veriliyor. Böylece diğer kartların numaraları değişmiyor
 * ve veritabanına tek bir satır yazılıyor.
 *
 *   [1]  [2]  [3]        →  kart 3'ü 1 ile 2 arasına taşı
 *   [1]  [1.5]  [2]      →  yalnızca taşınan kart güncellendi
 */

/**
 * İki komşu bu kadar yakınsa aralarına yeni bir değer sığdırılamaz.
 *
 * Her bölmede aralık yarıya iner, yani bu sınıra inmek için aynı iki kartın
 * arasına kırk küsur kez üst üste bırakmak gerekir. Pratikte olmaz, ama
 * olursa `yenidenNumarala` devreye girer.
 */
const EN_KUCUK_ARALIK = 1e-6;

/** Listelerin tek doğru sırası: önce sabitlenenler, sonra sıra numarası. */
export function listeyiSirala<T extends { sira: number; sabit: boolean }>(
  liste: T[],
): T[] {
  return [...liste].sort((a, b) => {
    if (a.sabit !== b.sabit) return a.sabit ? -1 : 1;

    return a.sira - b.sira;
  });
}

/**
 * Ekranda liste birkaç gruba bölünüyor (sabitlenenler, bugünküler…) ama
 * durum tek bir düz dizi. Bir grup sürüklenerek yeniden dizildiğinde o grubun
 * düz dizideki YERLERİ aynı kalır, yalnızca o yerlere gelen öğeler değişir.
 * Diğer grupların öğelerine dokunulmaz.
 */
export function altGrubuYerlestir<T extends { id: string }>(
  tumu: T[],
  yeniAltGrup: T[],
): T[] {
  const kimlikler = new Set(yeniAltGrup.map((oge) => oge.id));
  let sayac = 0;

  return tumu.map((oge) =>
    kimlikler.has(oge.id) ? yeniAltGrup[sayac++] : oge,
  );
}

/** Komşuların arasındaki yeni sıra değeri. Boş komşu = listenin ucu. */
export function araSira(
  oncekiSira: number | null,
  sonrakiSira: number | null,
): number {
  if (oncekiSira === null && sonrakiSira === null) return 0;
  if (oncekiSira === null) return sonrakiSira! - 1;
  if (sonrakiSira === null) return oncekiSira + 1;

  return (oncekiSira + sonrakiSira) / 2;
}

/** Araya değer sığmıyorsa grubun tamamı yeniden numaralandırılmalı. */
export function araSigmiyorMu(
  oncekiSira: number | null,
  sonrakiSira: number | null,
): boolean {
  if (oncekiSira === null || sonrakiSira === null) return false;

  return sonrakiSira - oncekiSira < EN_KUCUK_ARALIK;
}

/** Grubu 0, 1, 2… diye yeniden numaralandırır (nadir kaçış yolu). */
export function yenidenNumarala<T extends { id: string }>(
  grup: T[],
): { id: string; sira: number }[] {
  return grup.map((oge, indeks) => ({ id: oge.id, sira: indeks }));
}

/**
 * Sürükleme bittiğinde çağrılır. Kart zaten doğru yerdeyse `null` döner ve
 * gereksiz yazma yapılmaz.
 */
export function surukleSonucu<T extends { id: string; sira: number }>(
  grup: T[],
  kimlik: string,
):
  | { tur: "degismedi" }
  | { tur: "tek"; sira: number }
  | { tur: "yeniden"; siralar: { id: string; sira: number }[] } {
  const indeks = grup.findIndex((oge) => oge.id === kimlik);
  if (indeks < 0) return { tur: "degismedi" };

  const oncekiSira = indeks > 0 ? grup[indeks - 1].sira : null;
  const sonrakiSira =
    indeks < grup.length - 1 ? grup[indeks + 1].sira : null;
  const mevcut = grup[indeks].sira;

  // Komşuların arasında zaten doğru yerde mi?
  const yerinde =
    (oncekiSira === null || oncekiSira < mevcut) &&
    (sonrakiSira === null || mevcut < sonrakiSira);

  if (yerinde) return { tur: "degismedi" };

  if (araSigmiyorMu(oncekiSira, sonrakiSira)) {
    return { tur: "yeniden", siralar: yenidenNumarala(grup) };
  }

  return { tur: "tek", sira: araSira(oncekiSira, sonrakiSira) };
}
