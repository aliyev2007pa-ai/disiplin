// web-push bir CommonJS paketi; varsayilan disa aktarimi yok,
// adlandirilmis olanlari ithal ediyoruz.
import { sendNotification, setVapidDetails } from "web-push";

import { createClient } from "@/lib/supabase/server";

/**
 * "Deneme bildirimi gönder" düğmesinin ucu.
 *
 * Hatırlatma uç noktasından farkı: burada paylaşılan sır yok, kullanıcının
 * kendi oturumu var. RLS sayesinde yalnızca KENDİ cihazlarının aboneliğini
 * görebiliyor, dolayısıyla başkasına bildirim yollayamaz.
 *
 * Amacı, kurulumun gerçekten çalıştığını kullanıcının kendi gözüyle
 * görmesi: izin verildi mi, servis çalışanı ayakta mı, telefona düşüyor mu.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const acik = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const gizli = process.env.VAPID_PRIVATE_KEY;

  if (!acik || !gizli) {
    return Response.json(
      { hata: "Bildirim anahtarları sunucuda tanımlı değil." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ hata: "Oturum bulunamadı." }, { status: 401 });
  }

  // RLS: yalnızca bu kullanıcının satırları gelir.
  const { data: abonelikler, error } = await supabase
    .from("push_abonelikleri")
    .select("endpoint, p256dh, auth");

  if (error) {
    return Response.json(
      { hata: "Abonelikler okunamadı." },
      { status: 500 },
    );
  }

  if (!abonelikler || abonelikler.length === 0) {
    return Response.json(
      { hata: "Bu hesapta bildirim açık bir cihaz yok." },
      { status: 400 },
    );
  }

  setVapidDetails("https://disiplin-plum.vercel.app", acik, gizli);

  const yuk = JSON.stringify({
    baslik: "Disiplin",
    govde: "Deneme bildirimi — kurulum çalışıyor.",
    etiket: "deneme",
    yol: "/ayarlar",
  });

  let basarili = 0;

  for (const abonelik of abonelikler) {
    try {
      await sendNotification(
        {
          endpoint: abonelik.endpoint,
          keys: { p256dh: abonelik.p256dh, auth: abonelik.auth },
        },
        yuk,
      );
      basarili += 1;
    } catch {
      // Tek tek cihaz hatası denemeyi bozmasın; sayıya yansır.
    }
  }

  if (basarili === 0) {
    return Response.json(
      { hata: "Gönderilemedi. Bildirimi kapatıp tekrar açmayı dene." },
      { status: 502 },
    );
  }

  return Response.json({ basarili });
}
