import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";

/**
 * Giriş gerektiren sayfaların ortak çatısı:
 * üstte başlık çubuğu, ortada içerik, altta sabit sekme çubuğu.
 * (Oturum kontrolü Faz 2'de middleware ile eklenecek.)
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-content flex-1 px-5 pb-32">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
