import { ayNumarasi, kisaAy, kisaTarih } from "@/lib/dates";
import { type IsiKaresi, isiBasamagi } from "@/lib/istatistik";

/**
 * Isı haritası: her sütun bir hafta, her satır haftanın bir günü.
 *
 * SVG, çünkü viewBox sayesinde ekran ne kadar darsa o kadar küçülüyor —
 * telefonda da masaüstünde de 18 hafta tek bakışta sığıyor. Piksel hesabı
 * yapmaya, taşmayı elle kontrol etmeye gerek kalmıyor.
 */

const KARE = 10;
const BOSLUK = 2.8;
const ADIM = KARE + BOSLUK;
const SOL_ETIKET = 17;
const UST_ETIKET = 11;

/** Basamağa göre renk. 0 = o gün planlı iş yoktu. */
const RENKLER = [
  { renk: "var(--color-ink)", saydamlik: 0.07 },
  { renk: "var(--color-bordo)", saydamlik: 0.16 },
  { renk: "var(--color-bordo)", saydamlik: 0.4 },
  { renk: "var(--color-bordo)", saydamlik: 0.68 },
  { renk: "var(--color-bordo)", saydamlik: 1 },
];

/** Satır etiketleri; hepsi yazılırsa okunmaz, biri atlanarak gösteriliyor. */
const GUN_ETIKETLERI: Record<number, string> = {
  0: "Pzt",
  2: "Çar",
  4: "Cum",
};

/**
 * Hangi sütunun üstüne hangi ay adı yazılacak; yazılmayacaklar için `null`.
 *
 * İki kural var:
 *  - Etiket, ayın değiştiği sütuna yazılır.
 *  - Ay sınırı komşu haftalara denk gelirse etiketler üst üste binerdi
 *    ("TemAğu"), o yüzden aralarında en az üç sütun olmalı. İlk sütun da
 *    atlanır: orası neredeyse hep önceki ayın son günleridir.
 *
 * JSX'in içinde değil, önceden hesaplanıyor: çizim sırasında değişken
 * değiştirmek render'ın tekrarında tutarsız sonuç verir.
 */
function ayEtiketleriniHesapla(haftalar: IsiKaresi[][]): (string | null)[] {
  const EN_AZ_ARALIK = 3;
  const etiketler: (string | null)[] = [];

  let oncekiAy = "";
  let sonYazilan = -EN_AZ_ARALIK;

  haftalar.forEach((sutun, haftaNo) => {
    const ilkGun = sutun.find((kare) => kare !== null);
    const ay = ilkGun ? ayNumarasi(ilkGun.gun) : "";
    const ayDegisti = ay !== "" && ay !== oncekiAy;

    if (ayDegisti) oncekiAy = ay;

    if (
      ayDegisti &&
      ilkGun &&
      haftaNo > 0 &&
      haftaNo - sonYazilan >= EN_AZ_ARALIK
    ) {
      sonYazilan = haftaNo;
      etiketler.push(kisaAy(ilkGun.gun));
      return;
    }

    etiketler.push(null);
  });

  return etiketler;
}

export default function IsiHaritasi({
  haftalar,
}: {
  haftalar: IsiKaresi[][];
}) {
  const genislik = SOL_ETIKET + haftalar.length * ADIM;
  const yukseklik = UST_ETIKET + 7 * ADIM;

  const ayEtiketleri = ayEtiketleriniHesapla(haftalar);

  return (
    <div className="border-bordo-soft bg-surface rounded-2xl border px-4 py-4">
      <svg
        viewBox={`0 0 ${genislik} ${yukseklik}`}
        className="w-full"
        role="img"
        aria-label="Son 18 haftanın günlük başarı ısı haritası"
      >
        {Object.entries(GUN_ETIKETLERI).map(([satir, etiket]) => (
          <text
            key={satir}
            x={0}
            y={UST_ETIKET + Number(satir) * ADIM + KARE - 1.5}
            fontSize="6.4"
            fill="var(--color-muted)"
          >
            {etiket}
          </text>
        ))}

        {haftalar.map((sutun, haftaNo) => {
          const ayEtiketi = ayEtiketleri[haftaNo];

          return (
            <g key={haftaNo}>
              {ayEtiketi ? (
                <text
                  x={SOL_ETIKET + haftaNo * ADIM}
                  y={6.4}
                  fontSize="6.4"
                  fill="var(--color-muted)"
                >
                  {ayEtiketi}
                </text>
              ) : null}

              {sutun.map((kare, gunNo) => {
                if (kare === null) return null;

                const basamak = isiBasamagi(kare);
                const { renk, saydamlik } = RENKLER[basamak];

                return (
                  <rect
                    key={kare.gun}
                    x={SOL_ETIKET + haftaNo * ADIM}
                    y={UST_ETIKET + gunNo * ADIM}
                    width={KARE}
                    height={KARE}
                    rx={2.2}
                    fill={renk}
                    fillOpacity={saydamlik}
                  >
                    <title>
                      {kare.planli === 0
                        ? `${kisaTarih(kare.gun)} — planlı iş yoktu`
                        : `${kisaTarih(kare.gun)} — ${kare.yapilan}/${kare.planli}`}
                    </title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="text-muted mt-3 flex items-center justify-end gap-1.5 text-[11.5px]">
        <span>Az</span>
        {RENKLER.map(({ renk, saydamlik }, basamak) => (
          <span
            key={basamak}
            aria-hidden
            className="h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: renk, opacity: saydamlik }}
          />
        ))}
        <span>Çok</span>
      </div>
    </div>
  );
}
