import type { NextRequest } from "next/server";
import { SUPABASE_URL } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy (antes llamado "middleware" — Next.js 16 renombró `middleware.ts` a `proxy.ts`;
 * la funcionalidad es la misma). Se ejecuta en el servidor antes de cada petición y:
 *
 *  1. Genera un nonce único y una Content-Security-Policy estricta (protección contra XSS).
 *  2. Refresca la sesión de Supabase y protege las rutas (ver lib/supabase/middleware.ts).
 */
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = construirCSP(nonce);

  // Next.js lee la CSP de la petición para aplicar el nonce a sus propios <script>.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = await updateSession(request, requestHeaders);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

function construirCSP(nonce: string) {
  const esDesarrollo = process.env.NODE_ENV === "development";
  const supabase = new URL(SUPABASE_URL);

  return [
    `default-src 'self'`,
    // Solo se ejecutan scripts con el nonce de esta petición: un <script> inyectado no corre.
    // 'unsafe-eval' solo en desarrollo (React lo usa para reconstruir trazas de error).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
    // En desarrollo el HMR inyecta estilos en línea sin nonce.
    `style-src 'self' ${esDesarrollo ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    // El cliente de navegador solo puede hablar con nuestro proyecto de Supabase.
    `connect-src 'self' ${supabase.origin} wss://${supabase.host}${esDesarrollo ? " ws:" : ""}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    // Los formularios solo pueden enviarse a nuestro propio origen.
    `form-action 'self'`,
    // Nadie puede embeber la app en un iframe (clickjacking).
    `frame-ancestors 'none'`,
    ...(esDesarrollo ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export const config = {
  matcher: [
    // Todo excepto archivos estáticos, optimización de imágenes y archivos de metadatos.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
