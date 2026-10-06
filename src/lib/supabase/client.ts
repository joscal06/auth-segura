"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components.
 *
 * Como las cookies de sesión son httpOnly, este cliente NO puede leer el token del usuario:
 * `document.cookie` no las contiene y no se guarda nada en localStorage. Por eso:
 *  - Todas las operaciones de autenticación (login, registro, logout…) pasan por Server Actions.
 *  - Este cliente solo actúa con el rol anónimo (datos públicos protegidos por RLS).
 *
 * El adaptador de cookies es explícitamente vacío y la persistencia está desactivada para que la
 * librería nunca escriba una sesión accesible desde JavaScript.
 *
 * Las variables se leen directamente de process.env para que Next.js las incruste en el bundle.
 */
let cliente: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (cliente) return cliente;

  cliente = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return cliente;
}
