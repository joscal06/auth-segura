import Link from "next/link";
import { cerrarSesion } from "@/app/actions/auth";
import { obtenerUsuario } from "@/lib/dal";
import { IconoCandado } from "@/components/ui";

/**
 * Navegación condicional (Server Component): el estado de autenticación se decide en el
 * servidor a partir de la cookie httpOnly, así que no hay parpadeo ni JavaScript que lea tokens.
 */
export async function Navegacion() {
  const usuario = await obtenerUsuario();

  return (
    <header className="sticky top-0 z-10 border-b border-borde bg-superficie/90 backdrop-blur">
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-texto">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-marca text-white dark:text-black">
            <IconoCandado className="h-4.5 w-4.5" />
          </span>
          Cerrojo
        </Link>

        {usuario ? (
          <div className="flex items-center gap-1 text-sm sm:gap-2">
            <Link href="/dashboard" className="rounded-lg px-3 py-2 font-medium text-suave hover:bg-fondo hover:text-texto">
              Panel
            </Link>
            <Link href="/perfil" className="rounded-lg px-3 py-2 font-medium text-suave hover:bg-fondo hover:text-texto">
              Perfil
            </Link>
            <span className="hidden max-w-48 truncate px-2 text-xs text-suave md:inline" title={usuario.email}>
              {usuario.email}
            </span>
            {/* Cierre de sesión por POST (Server Action), nunca con un enlace GET: un sitio externo
                no puede cerrar tu sesión con una simple etiqueta <img> o un enlace. */}
            <form action={cerrarSesion}>
              <button type="submit" className="rounded-lg border border-borde px-3 py-2 font-medium text-texto hover:bg-fondo">
                Salir
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-suave hover:bg-fondo hover:text-texto">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="rounded-lg bg-marca px-3 py-2 font-semibold text-white hover:bg-marca-fuerte dark:text-black">
              Crear cuenta
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
