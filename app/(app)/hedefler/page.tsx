import type { Metadata } from "next";

import EmptyState from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = {
  title: "Hedefler · Disiplin",
};

export default function HedeflerPage() {
  return (
    <>
      <PageHeading
        title="Hedefler"
        subtitle="Süreli ve tekrarlayan görevler. Süresi bitene kadar panelde kalır."
      />
      <EmptyState
        emoji="⭐"
        title="Henüz hedef yok"
        hint="İngilizce, spor, okuma gibi süreli hedeflerin burada listelenecek."
      />
    </>
  );
}
