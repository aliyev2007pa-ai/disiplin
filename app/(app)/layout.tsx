import { redirect } from "next/navigation";

import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { getUser } from "@/lib/supabase/server";

/**
 * Giriş gerektiren sayfaların ortak çatısı.
 *
 * Oturum kontrolü burada bir kez daha yapılır. Middleware zaten yönlendiriyor,
 * ama güvenlik tek bir katmana bırakılmaz: middleware atlatılsa bile bu
 * kontrol devreye girer. Asıl koruma ise veritabanındaki RLS politikalarıdır.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/giris");
  }

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
