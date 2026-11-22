import type { Metadata } from "next";

import CikisButonu from "@/components/CikisButonu";
import DavetYonetimi, { type DavetKodu } from "@/components/DavetYonetimi";
import PageHeading from "@/components/PageHeading";
import { createClient, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ayarlar · Disiplin",
};

export default async function AyarlarPage() {
  const user = await getUser();
  const supabase = await createClient();

  // Davet bölümü yalnızca yöneticilere görünür. Görünürlük tek başına koruma
  // değildir: kod üretme ve listeleme fonksiyonları yetkiyi kendileri de
  // kontrol eder, yani bu bölüm gizlense bile başkası çağıramaz.
  const { data: yonetici } = await supabase.rpc("is_admin");

  const { data: kodlar } = yonetici
    ? await supabase.rpc("list_invite_codes")
    : { data: null };

  return (
    <>
      <PageHeading title="Ayarlar" subtitle="Uygulama tercihleri." />

      <section className="border-bordo-soft bg-surface rounded-2xl border px-5 py-4">
        <h2 className="text-muted text-[12.5px] font-semibold tracking-wide uppercase">
          Hesap
        </h2>
        <p className="text-ink mt-1.5 text-[15px] break-all">{user?.email}</p>
      </section>

      {yonetici ? (
        <DavetYonetimi baslangicKodlari={(kodlar ?? []) as DavetKodu[]} />
      ) : null}

      <section className="border-bordo-soft bg-surface mt-4 rounded-2xl border px-5 py-4">
        <h2 className="text-muted text-[12.5px] font-semibold tracking-wide uppercase">
          Tik sesi
        </h2>
        <p className="text-muted mt-1.5 text-[13.5px] leading-snug">
          Tik animasyonunun sesini açıp kapatma seçeneği Faz 5&apos;te buraya
          eklenecek.
        </p>
      </section>

      <div className="mt-6">
        <CikisButonu />
      </div>
    </>
  );
}
