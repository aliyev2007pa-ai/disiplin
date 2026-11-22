import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Sunucu tarafı Supabase istemcisi (Server Component, Route Handler). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component içinden çağrıldığında çerez yazılamaz.
          // Sorun değil: oturumu middleware zaten her istekte tazeliyor.
        }
      },
    },
  });
}

/**
 * Oturumdaki kullanıcıyı döner, yoksa null.
 *
 * Her zaman getUser() kullanılır, getSession() değil: getUser() çerezdeki
 * jetonu Supabase'e doğrulatır. getSession() çerezin içeriğine güvenir ve
 * çerez kurcalanmışsa yanlış sonuç verebilir.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
