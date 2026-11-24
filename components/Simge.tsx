import type { ReactNode } from "react";

/**
 * Uygulamanın kendi ikon seti.
 *
 * NEDEN EMOJİ DEĞİL: emoji her işletim sisteminde başka türlü çizilir
 * (iPhone'da parlak, Android'de yassı, Windows'ta bambaşka), boyutları
 * birbirini tutmaz ve bordo-beyaz temanın içinde yabancı durur. Buradaki
 * ikonlar tek bir çizim diliyle yazıldı: 24x24 kutu, 1.6 kalınlıkta çizgi,
 * yuvarlatılmış uçlar, renk olarak `currentColor` — yani bulundukları
 * yazının rengini alırlar.
 *
 * VERİTABANI: `tasks.emoji` kolonu tarihsel olarak bu adı taşıyor ama artık
 * emoji karakteri değil, aşağıdaki anahtarlardan birini ("yildiz", "kitap"…)
 * tutar. Emoji dönemine ait eski satırlar da çalışmaya devam eder:
 * ESKI_KARSILIKLAR tablosu onları anahtara çevirir (bkz. simgeAdiCoz).
 */

type Tanim = {
  /** Seçim ekranında ve ekran okuyucuda görünen ad. */
  etiket: string;
  cizim: ReactNode;
};

/** Dil ikonları: yuvarlatılmış kutu içinde iki harf. */
function Monogram({ harfler }: { harfler: string }) {
  return (
    <>
      <rect x="3" y="5.2" width="18" height="13.6" rx="3.4" />
      <text
        x="12"
        y="14.9"
        textAnchor="middle"
        fontSize="7.4"
        fontWeight="700"
        letterSpacing="-0.3"
        fill="currentColor"
        stroke="none"
      >
        {harfler}
      </text>
    </>
  );
}

const TANIMLAR: Record<string, Tanim> = {
  yildiz: {
    etiket: "Yıldız",
    cizim: (
      <path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.9l-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z" />
    ),
  },

  ingilizce: { etiket: "İngilizce", cizim: <Monogram harfler="EN" /> },
  rusca: { etiket: "Rusça", cizim: <Monogram harfler="RU" /> },
  almanca: { etiket: "Almanca", cizim: <Monogram harfler="DE" /> },

  kitap: {
    etiket: "Okuma",
    cizim: (
      <>
        <path d="M12 7.3C10.4 6 8.3 5.4 5.4 5.4c-.5 0-.9.4-.9.9v10.3c0 .5.4.9.9.9 2.9 0 5 .6 6.6 1.9 1.6-1.3 3.7-1.9 6.6-1.9.5 0 .9-.4.9-.9V6.3c0-.5-.4-.9-.9-.9-2.9 0-5 .6-6.6 1.9z" />
        <path d="M12 7.3v12.1" />
      </>
    ),
  },

  kalem: {
    etiket: "Yazma",
    cizim: (
      <>
        <path d="M16.6 4.4a2.1 2.1 0 013 3L8.7 18.3l-4.2 1.2 1.2-4.1z" />
        <path d="M14.5 6.5l3 3" />
      </>
    ),
  },

  zihin: {
    etiket: "Öğrenme",
    cizim: (
      <>
        <path d="M12 3.6a5.8 5.8 0 00-3.4 10.5c.5.4.8 1 .8 1.6v.3h5.2v-.3c0-.6.3-1.2.8-1.6A5.8 5.8 0 0012 3.6z" />
        <path d="M9.9 19.1h4.2" />
        <path d="M10.7 21h2.6" />
      </>
    ),
  },

  halter: {
    etiket: "Spor",
    cizim: (
      <>
        <path d="M7.3 7.4v9.2M4 9.6v4.8M16.7 7.4v9.2M20 9.6v4.8" />
        <path d="M7.3 12h9.4" />
      </>
    ),
  },

  kosu: {
    etiket: "Koşu",
    cizim: (
      <>
        <circle cx="14.9" cy="4.8" r="2.2" />
        <path d="M13.2 8.6 9.3 11l2 3.8-2.8 4.8" />
        <path d="M11.3 14.8 15.2 16.2l1.2 3.4" />
        <path d="M12.3 9.9 7.2 8.6" />
      </>
    ),
  },

  yoga: {
    etiket: "Meditasyon",
    cizim: (
      <>
        <circle cx="12" cy="5.4" r="2.4" />
        <path d="M12 9.4c-3.3 0-6.1 3.5-7.3 8.2a.9.9 0 00.9 1.1h12.8a.9.9 0 00.9-1.1C18.1 12.9 15.3 9.4 12 9.4z" />
      </>
    ),
  },

  su: {
    etiket: "Su",
    cizim: (
      <path d="M12 3.7c3.2 3.6 5.3 6.4 5.3 9.1a5.3 5.3 0 11-10.6 0c0-2.7 2.1-5.5 5.3-9.1z" />
    ),
  },

  uyku: {
    etiket: "Uyku",
    cizim: <path d="M19.4 14.7A8 8 0 019.3 4.6a8 8 0 1010.1 10.1z" />,
  },

  beslenme: {
    etiket: "Beslenme",
    cizim: (
      <>
        <path d="M12 8.4c-1-1-2.2-1.5-3.4-1.3-2.3.4-3.9 2.9-3.4 6 .5 3 2.6 5.8 4.6 5.8.8 0 1.4-.4 2.2-.4s1.4.4 2.2.4c2 0 4.1-2.8 4.6-5.8.5-3.1-1.1-5.6-3.4-6-1.2-.2-2.4.3-3.4 1.3z" />
        <path d="M12 8.4V6.3a2.9 2.9 0 012.9-2.9" />
      </>
    ),
  },

  para: {
    etiket: "Para",
    cizim: (
      <>
        <rect x="3.4" y="6.4" width="17.2" height="11.2" rx="2.4" />
        <path d="M3.4 10.3h17.2" />
        <circle cx="16.7" cy="14.1" r="1.1" />
      </>
    ),
  },

  namaz: {
    etiket: "Namaz",
    cizim: (
      <>
        <path d="M12 3.4v2" />
        <path d="M7.4 12c0-2.7 2.1-4.4 4.6-6.3 2.5 1.9 4.6 3.6 4.6 6.3" />
        <path d="M5.8 19.8V12h12.4v7.8" />
        <path d="M3.6 19.8v-8.6M20.4 19.8v-8.6" />
        <path d="M10.4 19.8v-2.5a1.6 1.6 0 013.2 0v2.5" />
        <path d="M2.7 19.8h18.6" />
      </>
    ),
  },

  temizlik: {
    etiket: "Temizlik",
    cizim: (
      <>
        <path d="M12 3.6v7.3" />
        <path d="M8.5 10.9h7l1.5 5.3a1.4 1.4 0 01-1.3 1.8H8.3A1.4 1.4 0 017 16.2z" />
        <path d="M10.2 13.3v4.7M13.8 13.3v4.7" />
      </>
    ),
  },

  alisveris: {
    etiket: "Alışveriş",
    cizim: (
      <>
        <path d="M3.6 9.2h16.8l-1.6 8.4a2 2 0 01-2 1.6H7.2a2 2 0 01-2-1.6z" />
        <path d="M8.2 9.2a3.8 3.8 0 017.6 0" />
        <path d="M9.9 12.6v3.4M14.1 12.6v3.4" />
      </>
    ),
  },

  telefon: {
    etiket: "Telefon",
    cizim: (
      <path d="M20.4 16.9v2.5a1.7 1.7 0 01-1.9 1.7 16.6 16.6 0 01-7.2-2.6 16.3 16.3 0 01-5-5 16.6 16.6 0 01-2.6-7.3A1.7 1.7 0 015.4 4.3H8a1.7 1.7 0 011.7 1.5c.1.8.3 1.6.6 2.3a1.7 1.7 0 01-.4 1.8L8.8 11a13.4 13.4 0 005 5l1.1-1.1a1.7 1.7 0 011.8-.4c.7.3 1.5.5 2.3.6a1.7 1.7 0 011.4 1.8z" />
    ),
  },

  muzik: {
    etiket: "Müzik",
    cizim: (
      <>
        <circle cx="7.4" cy="17.4" r="2.6" />
        <circle cx="17.6" cy="15.4" r="2.6" />
        <path d="M10 17.4V6.3l10.2-2.1v11.2" />
      </>
    ),
  },

  bilgisayar: {
    etiket: "Bilgisayar",
    cizim: (
      <>
        <rect x="2.8" y="4.6" width="18.4" height="11.8" rx="2.2" />
        <path d="M12 16.4v3.2M8.6 19.6h6.8" />
      </>
    ),
  },

  // --- Seçim listesinde görünmeyen, arayüzün kendi ikonları ---

  alev: {
    etiket: "Seri",
    cizim: (
      <path d="M12 3.2c.6 2.6 2 3.9 3.4 5.3 1.5 1.5 2.4 3 2.4 5a5.8 5.8 0 11-11.6 0c0-1.7.5-2.7 1.4-3.7.2 1 .9 1.7 1.8 1.9-.4-3.4 1-6.4 2.6-8.5z" />
    ),
  },

  gunes: {
    etiket: "Yeni gün",
    cizim: (
      <>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.8v2.3M12 18.9v2.3M4.5 4.5l1.6 1.6M17.9 17.9l1.6 1.6M2.8 12h2.3M18.9 12h2.3M4.5 19.5l1.6-1.6M17.9 6.1l1.6-1.6" />
      </>
    ),
  },

  cop: {
    etiket: "Sil",
    cizim: (
      <>
        <path d="M4 6.8h16" />
        <path d="M9.4 6.8V5.3a1.7 1.7 0 011.7-1.7h1.8a1.7 1.7 0 011.7 1.7v1.5" />
        <path d="M6.5 6.8l.9 12a1.8 1.8 0 001.8 1.7h5.6a1.8 1.8 0 001.8-1.7l.9-12" />
        <path d="M10.4 10.6v6.2M13.6 10.6v6.2" />
      </>
    ),
  },

  ucNokta: {
    etiket: "Seçenekler",
    cizim: (
      <g fill="currentColor" stroke="none">
        <circle cx="5.6" cy="12" r="1.45" />
        <circle cx="12" cy="12" r="1.45" />
        <circle cx="18.4" cy="12" r="1.45" />
      </g>
    ),
  },

  madalya: {
    etiket: "Başarı",
    cizim: (
      <>
        <path d="M8.4 3.2 10.9 9M15.6 3.2 13.1 9" />
        <circle cx="12" cy="14.8" r="5.4" />
        <circle cx="12" cy="14.8" r="2" />
      </>
    ),
  },
};

/** Görev ve hedef formlarında seçilebilen simgeler (sıra ekrandaki sıradır). */
export const SIMGE_LISTESI = [
  "yildiz",
  "ingilizce",
  "rusca",
  "almanca",
  "kitap",
  "kalem",
  "zihin",
  "halter",
  "kosu",
  "yoga",
  "su",
  "uyku",
  "beslenme",
  "para",
  "namaz",
  "temizlik",
  "alisveris",
  "telefon",
  "muzik",
  "bilgisayar",
] as const;

export const VARSAYILAN_SIMGE = "yildiz";

/**
 * Emoji döneminde kaydedilmiş satırlar için karşılık tablosu.
 * Veritabanındaki eski değerler olduğu gibi bırakıldı; burada çevriliyor.
 * (Bazı emojiler hem varyasyon seçicili hem seçicisiz gelebilir.)
 */
const ESKI_KARSILIKLAR: Record<string, string> = {
  "⭐": "yildiz",
  "🇬🇧": "ingilizce",
  "🇷🇺": "rusca",
  "🇩🇪": "almanca",
  "📚": "kitap",
  "✍️": "kalem",
  "✍": "kalem",
  "🧠": "zihin",
  "💪": "halter",
  "🏃": "kosu",
  "🧘": "yoga",
  "💧": "su",
  "😴": "uyku",
  "🥗": "beslenme",
  "💰": "para",
  "🕌": "namaz",
  "🧹": "temizlik",
  "🛒": "alisveris",
  "📞": "telefon",
  "🎸": "muzik",
  "🖥️": "bilgisayar",
  "🖥": "bilgisayar",
};

/** Kaydedilmiş değeri çizilebilir bir simge adına çevirir. */
export function simgeAdiCoz(deger: string): string {
  if (deger in TANIMLAR) return deger;

  return ESKI_KARSILIKLAR[deger] ?? VARSAYILAN_SIMGE;
}

/** Seçim ekranında ve ekran okuyucuda kullanılan ad. */
export function simgeEtiketi(ad: string): string {
  return TANIMLAR[simgeAdiCoz(ad)].etiket;
}

/**
 * Tek bir ikon. Boyut ve renk `className` ile verilir:
 *   <Simge ad="kitap" className="text-bordo h-6 w-6" />
 *
 * Etkileşimi ve durumu olmadığı için sunucu bileşenlerinde de kullanılabilir.
 */
export default function Simge({
  ad,
  className,
}: {
  ad: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {TANIMLAR[simgeAdiCoz(ad)].cizim}
    </svg>
  );
}
