"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Botón de envío con estado de carga. Se deshabilita mientras la Server Action se ejecuta,
 * lo que evita envíos dobles (p. ej. dos registros con el mismo correo).
 */
export function BotonEnviar({
  children,
  textoCargando = "Procesando…",
  variante = "primario",
}: {
  children: ReactNode;
  textoCargando?: string;
  variante?: "primario" | "secundario" | "peligro";
}) {
  const { pending } = useFormStatus();

  const estilos = {
    primario: "bg-marca text-white hover:bg-marca-fuerte dark:text-black",
    secundario: "border border-borde bg-superficie text-texto hover:bg-fondo",
    peligro: "border border-peligro/40 bg-superficie text-peligro hover:bg-peligro-suave",
  }[variante];

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${estilos}`}
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {pending ? textoCargando : children}
    </button>
  );
}
