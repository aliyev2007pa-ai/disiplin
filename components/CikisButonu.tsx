"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function CikisButonu() {
  const router = useRouter();
  const [bekliyor, setBekliyor] = useState(false);

  async function cik() {
    setBekliyor(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/giris");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cik}
      disabled={bekliyor}
      className="border-bordo-soft text-bordo hover:bg-bordo-soft w-full rounded-xl border px-4 py-3.5 text-[15px] font-semibold transition-colors disabled:opacity-60"
    >
      {bekliyor ? "Çıkış yapılıyor…" : "Çıkış yap"}
    </button>
  );
}
