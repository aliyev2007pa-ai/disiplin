import type { Metadata } from "next";

import EmptyState from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = {
  title: "Tamamlananlar · Disiplin",
};

export default function TamamlananlarPage() {
  return (
    <>
      <PageHeading
        title="Tamamlananlar"
        subtitle="Süresi dolan hedeflerin özeti. En yeni en üstte."
      />
      <EmptyState
        emoji="🏅"
        title="Henüz tamamlanan hedef yok"
        hint="Bir hedefin süresi dolduğunda başarı özetiyle birlikte buraya taşınır."
      />
    </>
  );
}
