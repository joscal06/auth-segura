import type { CookieOptions } from "@supabase/ssr";

const esProduccion = process.env.NODE_ENV === "production";

/**
 * Opciones aplicadas a TODAS las cookies de sesión de Supabase.
 *
 * - httpOnly: el token no es legible desde JavaScript (document.cookie), así que un XSS
 *             no puede robarlo.
 * - secure:   solo viaja por HTTPS (en desarrollo se desactiva porque se usa http://localhost).
 * - sameSite: "lax". El navegador no adjunta la cookie a peticiones POST/fetch iniciadas desde
 *             otro sitio, lo que bloquea CSRF; sí la adjunta al navegar con un enlace (necesario
 *             para que funcionen los enlaces de verificación de correo).
 * - path "/": la sesión es válida en toda la app.
 */
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: esProduccion,
  sameSite: "lax",
  path: "/",
} satisfies CookieOptions;

/**
 * Combina las opciones que propone @supabase/ssr (maxAge, expires…) con nuestras banderas de
 * seguridad, que siempre ganan. Defensa en profundidad: aunque una versión futura de la librería
 * cambie sus valores por defecto, las cookies seguirán siendo httpOnly/secure/sameSite.
 */
export function conBanderasSeguras(options?: CookieOptions): CookieOptions {
  return { ...options, ...SECURE_COOKIE_OPTIONS };
}
