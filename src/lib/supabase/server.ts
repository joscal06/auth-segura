import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";
import { SECURE_COOKIE_OPTIONS, conBanderasSeguras } from "./cookies";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Lee y escribe la sesión en cookies httpOnly a través de `next/headers`.
 * Se crea uno nuevo en cada petición (nunca en una variable global), porque está ligado
 * a las cookies de ese usuario.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: SECURE_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, conBanderasSeguras(options)),
          );
        } catch {
          // Los Server Components no pueden escribir cookies. Es seguro ignorarlo: el proxy
          // (src/proxy.ts) ya refresca la sesión en cada petición.
        }
      },
    },
  });
}
