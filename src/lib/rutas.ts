/** Rutas que requieren sesión. */
export const RUTAS_PRIVADAS = ["/dashboard", "/perfil", "/actualizar-contrasena"] as const;

/** Rutas que no tienen sentido con la sesión iniciada. */
export const RUTAS_DE_AUTENTICACION = ["/login", "/registro", "/recuperar"] as const;

const coincide = (ruta: string, prefijos: readonly string[]) =>
  prefijos.some((p) => ruta === p || ruta.startsWith(`${p}/`));

export const esRutaPrivada = (ruta: string) => coincide(ruta, RUTAS_PRIVADAS);
export const esRutaDeAutenticacion = (ruta: string) => coincide(ruta, RUTAS_DE_AUTENTICACION);

/**
 * Sanea el parámetro `next` usado para volver a la página original después de iniciar sesión.
 * Solo acepta rutas relativas internas: bloquea "open redirects" como `?next=https://evil.com`,
 * `?next=//evil.com` o `?next=/\evil.com`, que se usarían en ataques de phishing.
 */
export function rutaSegura(next: unknown, porDefecto = "/dashboard"): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 200) return porDefecto;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return porDefecto;
  if (/[\u0000-\u001f]/.test(next)) return porDefecto;
  try {
    // Si al resolverla contra un origen ficticio cambia de origen, no es una ruta interna.
    const url = new URL(next, "http://interno.local");
    if (url.origin !== "http://interno.local") return porDefecto;
    return `${url.pathname}${url.search}`;
  } catch {
    return porDefecto;
  }
}
