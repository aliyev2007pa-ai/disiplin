"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { authHatasiniCevir } from "@/lib/supabase/hatalar";

import Alan from "./Alan";
import GonderButonu from "./GonderButonu";
import Uyari from "./Uyari";

export default function GirisFormu() {
  const router = useRouter();
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function gonder(olay: React.FormEvent<HTMLFormElement>) {
    olay.preventDefault();
    setHata(null);
    setBekliyor(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: eposta.trim().toLowerCase(),
        password: sifre,
      });

      if (error) {
        setHata(authHatasiniCevir(error));
        return;
      }

      // Sunucu bileşenleri yeni oturumu görsün diye refresh şart.
      router.replace("/");
      router.refresh();
    } catch {
      setHata("Bağlantı kurulamadı. İnternetini kontrol et.");
    } finally {
      setBekliyor(false);
    }
  }

  return (
    <form onSubmit={gonder} className="flex flex-col gap-4">
      {hata ? <Uyari tur="hata">{hata}</Uyari> : null}

      <Alan
        etiket="E-posta"
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        disabled={bekliyor}
        value={eposta}
        onChange={(e) => setEposta(e.target.value)}
        placeholder="ornek@eposta.com"
      />

      <Alan
        etiket="Şifre"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        disabled={bekliyor}
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
        placeholder="••••••••"
      />

      <GonderButonu bekliyor={bekliyor}>Giriş yap</GonderButonu>
    </form>
  );
}
