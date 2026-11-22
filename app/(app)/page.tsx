import EmptyState from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";

export default function GunlukPage() {
  return (
    <>
      <PageHeading
        title="Günlük"
        subtitle="Bugüne ait tek seferlik işler. Gece yarısı listeden kalkar."
      />
      <EmptyState
        emoji="🌤️"
        title="Henüz görev yok"
        hint="Bugün için eklediğin küçük işler burada görünecek."
      />
    </>
  );
}
