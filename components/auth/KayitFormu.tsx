"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { sifreSizmisMi } from "@/lib/sizmisSifre";
import { createClient } from "@/lib/supabase/client";
import { authHatasiniCevir } from "@/lib/supabase/hatalar";

import Alan from "./Alan";
import GonderButonu from "./GonderButonu";
import Uyari from "./Uyari";

const EN_AZ_KARAKTER = 8;

const KOD_GECERSIZ =
  "Davet kodu geçersiz, kullanılmış veya süresi dolmuş. Seni davet eden kişiden yeni bir kod iste.";

/** "7k4m9qx2b3tv" → "7K4M-9QX2-B3TV". Eksik karakterde olduğu gibi bırakır. */
function kodBicimle(ham: string) {
  const harfler = ham
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);

  return harfler.replace(/(.{4})(?=.)/g, "$1-");
}

export default function KayitFormu() {
  const router = useRouter();
  const [eposta, setEposta] = useState("");
  const [davetKodu, setDavetKodu] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function gonder(olay: React.FormEvent<HTMLFormElement>) {
    olay.preventDefault();
    setHata(null);
    setBilgi(null);

    const temizEposta = eposta.trim().toLowerCase();
    const temizKod = kodBicimle(davetKodu);

    if (temizKod.length !== 14) {
      setHata("Davet kodu 12 karakter olmalı. Örnek: 7K4M-9QX2-B3TV");
      return;
    }

    if (sifre.length < EN_AZ_KARAKTER) {
      setHata(`Şifre en az ${EN_AZ_KARAKTER} karakter olmalı.`);
      return;
    }

    if (sifre !== sifreTekrar) {
      setHata("Şifreler birbirini tutmuyor.");
      return;
    }

    setBekliyor(true);

    try {
      // Şifre bilinen sızıntılarda geçiyor mu? Şifre cihazdan çıkmaz
      // (bkz. lib/sizmisSifre.ts). Servise ulaşılamazsa sessizce geçer.
      if (await sifreSizmisMi(sifre)) {
        setHata(
          "Bu şifre bilinen veri sızıntılarında geçiyor; saldırganların deneme listelerinde var. Lütfen başka bir şifre seç.",
        );
        return;
      }

      const supabase = createClient();

      // Önden kontrol: yalnızca anlaşılır bir hata mesajı gösterebilmek için.
      // Asıl engel veritabanındaki tetikleyicidir; bu adım atlansa bile
      // geçersiz kodla hesap açılamaz.
      const { data: gecerli, error: kontrolHatasi } = await supabase.rpc(
        "is_invite_code_valid",
        { p_code: temizKod },
      );

      if (kontrolHatasi) {
        setHata("Davet kodu kontrol edilemedi. Biraz sonra tekrar dene.");
        return;
      }

      if (!gecerli) {
        setHata(KOD_GECERSIZ);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: temizEposta,
        password: sifre,
        options: {
          // Tetikleyici kodu buradan okur ve aynı işlemde "kullanıldı" yapar.
          data: { davet_kodu: temizKod },
          emailRedirectTo: `${window.location.origin}/auth/onayla`,
        },
      });

      if (error) {
        // Tetikleyici reddettiyse Supabase genel bir sunucu hatası döner.
        setHata(
          error.code === "unexpected_failure"
            ? KOD_GECERSIZ
            : authHatasiniCevir(error),
        );
        return;
      }

      if (data.session) {
        // E-posta doğrulaması kapalı: kullanıcı doğrudan giriş yaptı.
        router.replace("/");
        router.refresh();
        return;
      }

      setBilgi(
        "Hesabın oluşturuldu. E-postana bir doğrulama bağlantısı gönderdik — gelen kutunu ve spam klasörünü kontrol et.",
      );
      setSifre("");
      setSifreTekrar("");
      setDavetKodu("");
    } catch {
      setHata("Bağlantı kurulamadı. İnternetini kontrol et.");
    } finally {
      setBekliyor(false);
    }
  }

  return (
    <form onSubmit={gonder} className="flex flex-col gap-4">
      {hata ? <Uyari tur="hata">{hata}</Uyari> : null}
      {bilgi ? <Uyari tur="bilgi">{bilgi}</Uyari> : null}

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
        etiket="Davet kodu"
        type="text"
        name="invite-code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        required
        disabled={bekliyor}
        value={davetKodu}
        onChange={(e) => setDavetKodu(kodBicimle(e.target.value))}
        placeholder="7K4M-9QX2-B3TV"
        ipucu="Seni davet eden kişinin gönderdiği kod."
      />

      <Alan
        etiket="Şifre"
        type="password"
        name="new-password"
        autoComplete="new-password"
        required
        minLength={EN_AZ_KARAKTER}
        disabled={bekliyor}
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
        placeholder="••••••••"
        ipucu={`En az ${EN_AZ_KARAKTER} karakter.`}
      />

      <Alan
        etiket="Şifre (tekrar)"
        type="password"
        name="confirm-password"
        autoComplete="new-password"
        required
        disabled={bekliyor}
        value={sifreTekrar}
        onChange={(e) => setSifreTekrar(e.target.value)}
        placeholder="••••••••"
      />

      <GonderButonu bekliyor={bekliyor}>Hesap oluştur</GonderButonu>
    </form>
  );
}
