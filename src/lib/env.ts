/**
 * Variables de entorno validadas en un único lugar (solo servidor).
 *
 * Solo se usan variables NEXT_PUBLIC_* (URL y clave publishable), que son públicas por diseño:
 * la seguridad de los datos la garantizan RLS y las cookies httpOnly. Este proyecto no usa
 * ninguna clave secreta (service_role).
 */
function requerida(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa .env.local (ver .env.example).`);
  }
  return valor;
}

export const SUPABASE_URL = requerida(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_PUBLISHABLE_KEY = requerida(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/**
 * URL canónica del sitio (enlaces de los correos, sitemap, metadatos).
 * Nunca se deriva de la cabecera Host de la petición, para evitar ataques de
 * "host header injection" en los enlaces de recuperación de contraseña.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
