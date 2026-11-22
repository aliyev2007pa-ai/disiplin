import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import KayitFormu from "@/components/auth/KayitFormu";

export const metadata: Metadata = {
  title: "Hesap oluştur · Disiplin",
};

export default function KayitPage() {
  return (
    <AuthShell
      baslik="Hesap oluştur"
      altBaslik="Disiplin davetlidir. Hesap açmak için sana verilen davet kodu gerekir."
      altLinkMetni="Hesabın zaten var mı?"
      altLinkYazisi="Giriş yap"
      altLinkHref="/giris"
    >
      <KayitFormu />
    </AuthShell>
  );
}
