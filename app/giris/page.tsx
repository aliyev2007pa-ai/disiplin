import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import GirisFormu from "@/components/auth/GirisFormu";
import Uyari from "@/components/auth/Uyari";

export const metadata: Metadata = {
  title: "Giriş · Disiplin",
};

export default async function GirisPage({ searchParams }: PageProps<"/giris">) {
  const { durum } = await searchParams;

  return (
    <AuthShell
      baslik="Disiplin"
      altBaslik="Devam etmek için giriş yap."
      altLinkMetni="Davetin var ama hesabın yok mu?"
      altLinkYazisi="Hesap oluştur"
      altLinkHref="/kayit"
    >
      {durum === "onay-basarisiz" ? (
        <div className="mb-4">
          <Uyari tur="hata">
            Doğrulama bağlantısı geçersiz veya süresi dolmuş. Giriş yapmayı
            dene; olmazsa yeniden kayıt ol.
          </Uyari>
        </div>
      ) : null}

      <GirisFormu />
    </AuthShell>
  );
}
