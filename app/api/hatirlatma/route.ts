// web-push bir CommonJS paketi; varsayilan disa aktarimi yok,
// adlandirilmis olanlari ithal ediyoruz.
import { sendNotification, setVapidDetails } from "web-push";

import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Hatırlatma bildirimlerini gönderen uç nokta.
 *
 * KİM ÇAĞIRIR: Supabase'deki pg_cron, beş dakikada bir (bkz. migration
 * 0008). Kimin neyi hatırlaması gerektiğine veritabanı karar verir ve
 * gönderilecek her şeyi hazır hâlde buraya yollar. Buradaki iş yalnızca
 * mesajı VAPID anahtarıyla imzalayıp tarayıcının push servisine iletmek.
 *
 * NEDEN BÖYLE BÖLÜNDÜ: uygulamanın veritabanına yönetici erişimi olmasın
 * diye. Bu uç nokta kimin hangi görevi olduğunu sorgulamaz, yalnızca eline
 * verilen zarfı postaya verir. Projede `service_role` anahtarı hiç
 * kullanılmıyor (bkz. .env.local.example).
 *
 * KİMLİK DOĞRULAMA: uç nokta internete açık, o yüzden paylaşılan bir sır
 * gerekiyor. Sır burada DEĞİL, yalnızca Supabase Vault'ta duruyor; gelen
 * jetonun doğruluğu veritabanına sorulur. Böylece sunucuda saklanması
 * gereken tek gizli değer VAPID özel anahtarı oluyor.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Abonelik = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type Gonderim = {
  tur: "gorev" | "aksam";
  baslik: string | null;
  sayi: number;
  abonelikler: Abonelik[];
};

/** Push servisi "bu adres artık yok" derse abonelik silinir. */
const OLU_DURUMLAR = new Set([404, 410]);

function vapidKur(): boolean {
  const acik = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const gizli = process.env.VAPID_PRIVATE_KEY;

  if (!acik || !gizli) return false;

  // "subject" bir iletişim adresi olmalı. E-posta yerine sitenin kendi
  // adresini veriyoruz: depo herkese açık, kimsenin e-postası kodda durmasın.
  setVapidDetails("https://disiplin-plum.vercel.app", acik, gizli);

  return true;
}

/** Jetonun doğruluğunu veritabanına sorar. Yalnızca evet/hayır döner. */
async function sirGecerliMi(sir: string): Promise<boolean> {
  try {
    const cevap = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/hatirlatma_sirri_gecerli`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_sir: sir }),
        cache: "no-store",
      },
    );

    if (!cevap.ok) return false;

    return (await cevap.json()) === true;
  } catch {
    return false;
  }
}

async function oluAboneligiSil(sir: string, endpoint: string): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/olu_abonelik_sil`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_sir: sir, p_endpoint: endpoint }),
      cache: "no-store",
    });
  } catch {
    // Temizlik başarısızsa bir dahaki tura kalır; gönderimi etkilemez.
  }
}

/** Bildirimin ekranda görünecek hâli. */
function metinKur(gonderim: Gonderim): {
  baslik: string;
  govde: string;
  etiket: string;
} {
  if (gonderim.tur === "aksam") {
    return {
      baslik: "Günü kapatmadan önce",
      govde:
        gonderim.sayi === 1
          ? "Bugün 1 işin kaldı."
          : `Bugün ${gonderim.sayi} işin kaldı.`,
      etiket: "aksam",
    };
  }

  const ad = gonderim.baslik ?? "Hatırlatma";

  return {
    baslik: ad,
    govde: "Hatırlatma vakti geldi.",
    etiket: `gorev-${ad}`,
  };
}

export async function POST(istek: Request) {
  const basligi = istek.headers.get("authorization") ?? "";
  const sir = basligi.startsWith("Bearer ") ? basligi.slice(7) : "";

  if (!sir || !(await sirGecerliMi(sir))) {
    return Response.json({ hata: "yetkisiz" }, { status: 401 });
  }

  if (!vapidKur()) {
    return Response.json(
      { hata: "VAPID anahtarları tanımlı değil" },
      { status: 500 },
    );
  }

  let gonderimler: Gonderim[];

  try {
    const govde = (await istek.json()) as { gonderimler?: Gonderim[] };
    gonderimler = Array.isArray(govde.gonderimler) ? govde.gonderimler : [];
  } catch {
    return Response.json({ hata: "gövde okunamadı" }, { status: 400 });
  }

  let basarili = 0;
  let basarisiz = 0;
  let silinen = 0;

  for (const gonderim of gonderimler) {
    const metin = metinKur(gonderim);
    const yuk = JSON.stringify({ ...metin, yol: "/" });

    for (const abonelik of gonderim.abonelikler ?? []) {
      try {
        await sendNotification(
          {
            endpoint: abonelik.endpoint,
            keys: { p256dh: abonelik.p256dh, auth: abonelik.auth },
          },
          yuk,
        );
        basarili += 1;
      } catch (hata) {
        basarisiz += 1;

        const durum = (hata as { statusCode?: number }).statusCode;
        if (durum && OLU_DURUMLAR.has(durum)) {
          await oluAboneligiSil(sir, abonelik.endpoint);
          silinen += 1;
        }
      }
    }
  }

  return Response.json({ basarili, basarisiz, silinen });
}
