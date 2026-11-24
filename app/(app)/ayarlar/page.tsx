import type { Metadata } from "next";

import BildirimAyari from "@/components/BildirimAyari";
import CikisButonu from "@/components/CikisButonu";
import DavetYonetimi, { type DavetKodu } from "@/components/DavetYonetimi";
import PageHeading from "@/components/PageHeading";
import SesAnahtari from "@/components/SesAnahtari";
import { createClient, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ayarlar · Disiplin",
};

export default async function AyarlarPage() {
  const user = await getUser();
  const supabase = await createClient();

  // Tek sorgu: list_invite_codes yetkisi olmayana zaten hata döndürüyor,
  // bu yüzden ayrıca is_admin çağırmaya gerek yok (bir ağ turu daha az).
  //
  // Görünürlük tek başına koruma değildir: kod üretme ve listeleme
  // fonksiyonları yetkiyi kendileri de kontrol eder, yani bu bölüm gizlense
  // bile başkası çağıramaz.
  const { data: kodlar, error: kodHatasi } =
    await supabase.rpc("list_invite_codes");

  const yonetici = !kodHatasi;

  // Henüz hiç kaydetmediyse satır yoktur; varsayılan değerler gösterilir.
  const { data: bildirimAyari } = await supabase
    .from("bildirim_ayarlari")
    .select("aksam_acik, aksam_saati")
    .maybeSingle();

  return (
    <>
      <PageHeading title="Ayarlar" subtitle="Uygulama tercihleri." />

      <section className="border-bordo-soft bg-surface rounded-2xl border px-5 py-4">
        <h2 className="text-muted text-[12.5px] font-semibold tracking-wide uppercase">
          Hesap
        </h2>
        <p className="text-ink mt-1.5 text-[15px] break-all">{user?.email}</p>
      </section>

      <BildirimAyari
        aksamAcik={bildirimAyari?.aksam_acik ?? true}
        // Postgres "20:00:00" döner, <input type="time"> "20:00" ister.
        aksamSaati={(bildirimAyari?.aksam_saati ?? "20:00").slice(0, 5)}
      />

      {yonetici ? (
        <DavetYonetimi baslangicKodlari={(kodlar ?? []) as DavetKodu[]} />
      ) : null}

      <section className="border-bordo-soft bg-surface mt-4 rounded-2xl border px-5 py-4">
        <h2 className="text-muted text-[12.5px] font-semibold tracking-wide uppercase">
          Geri bildirim
        </h2>
        <div className="mt-3">
          <SesAnahtari />
        </div>
      </section>

      <div className="mt-6">
        <CikisButonu />
      </div>
    </>
  );
}
