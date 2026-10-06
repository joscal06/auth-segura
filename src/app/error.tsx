"use client";

import { useEffect } from "react";
import { Tarjeta } from "@/components/ui";

/**
 * Límite de error global. Nunca muestra `error.message`: en producción Next.js ya lo oculta,
 * y aquí solo se enseña el identificador (digest) para poder buscarlo en los logs del servidor.
 */
export default function ErrorGlobal({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Tarjeta>
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-sm text-suave">Ocurrió un error inesperado. Inténtalo de nuevo.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-suave">Referencia: {error.digest}</p>}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded-lg bg-marca px-4 py-2.5 text-sm font-semibold text-white hover:bg-marca-fuerte dark:text-black"
        >
          Reintentar
        </button>
      </Tarjeta>
    </div>
  );
}
