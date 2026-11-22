import type { Metadata } from "next";

import EmptyState from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = {
  title: "Ayarlar · Disiplin",
};

export default function AyarlarPage() {
  return (
    <>
      <PageHeading title="Ayarlar" subtitle="Uygulama tercihleri." />
      <EmptyState
        emoji="⚙️"
        title="Ayar yok"
        hint="Tik sesi anahtarı ve çıkış yap seçeneği sonraki fazlarda buraya eklenecek."
      />
    </>
  );
}
