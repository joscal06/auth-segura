import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";
import { esRutaDeAutenticacion, esRutaPrivada } from "@/lib/rutas";
import { SECURE_COOKIE_OPTIONS, conBanderasSeguras } from "./cookies";

/**
 * Cliente de Supabase para el middleware (en Next.js 16 el archivo se llama `proxy.ts`).
 *
 * 1. Refresca la sesión: si el access token expiró, Supabase usa el refresh token y reescribe
 *    las cookies httpOnly en la petición (para los Server Components de esta misma petición)
 *    y en la respuesta (para el navegador).
 * 2. Protege las rutas privadas: sin sesión → /login?next=<ruta>.
 * 3. Con sesión, login/registro/recuperar → /dashboard.
 *
 * `requestHeaders` permite propagar cabeceras propias (el nonce de la CSP).
 */
export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: SECURE_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        // Las cookies de la petición viajan en la cabecera "cookie": hay que sincronizarla.
        requestHeaders.set("cookie", request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, conBanderasSeguras(options)),
        );
        // Cabeceras anti-caché que envía Supabase al rotar tokens: evitan que un CDN sirva a
        // otro usuario una respuesta con el Set-Cookie de esta sesión.
        Object.entries(headers ?? {}).forEach(([clave, valor]) => response.headers.set(clave, valor));
      },
    },
  });

  // IMPORTANTE: no ejecutar código entre createServerClient y getClaims().
  // getClaims() verifica la firma del JWT y refresca la sesión si hace falta.
  const { data } = await supabase.auth.getClaims();
  const autenticado = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;

  if (!autenticado && esRutaPrivada(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return redirigirConservandoCookies(url, response);
  }

  if (autenticado && esRutaDeAutenticacion(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirigirConservandoCookies(url, response);
  }

  return response;
}

/** Una redirección debe llevar las cookies refrescadas; si no, la sesión se perdería. */
function redirigirConservandoCookies(url: URL, origen: NextResponse) {
  const redireccion = NextResponse.redirect(url);
  origen.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
  const cacheControl = origen.headers.get("cache-control");
  if (cacheControl) redireccion.headers.set("cache-control", cacheControl);
  return redireccion;
}
