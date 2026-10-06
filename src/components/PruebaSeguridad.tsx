"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Insignia } from "@/components/ui";

type Resultado = { prueba: string; detalle: string; seguro: boolean };

/**
 * Comprobación en vivo, ejecutada en el navegador, de que JavaScript NO puede acceder a la sesión.
 * Es exactamente lo que intentaría un script inyectado mediante XSS.
 */
export function PruebaSeguridad() {
  const [resultados, setResultados] = useState<Resultado[] | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const cookiesVisibles = document.cookie
        .split(";")
        .map((c) => c.trim().split("=")[0])
        .filter((n) => n.startsWith("sb-"));

      const clavesStorage = [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter(
        (k) => k.startsWith("sb-") || k.includes("supabase") || k.includes("auth-token"),
      );

      // El cliente de navegador de Supabase intenta recuperar la sesión: no encuentra ninguna.
      const { data } = await createClient().auth.getSession();

      if (cancelado) return;
      setResultados([
        {
          prueba: "document.cookie",
          detalle: cookiesVisibles.length ? `Visibles: ${cookiesVisibles.join(", ")}` : "Ninguna cookie sb-* visible",
          seguro: cookiesVisibles.length === 0,
        },
        {
          prueba: "localStorage / sessionStorage",
          detalle: clavesStorage.length ? `Claves: ${clavesStorage.join(", ")}` : "Sin tokens almacenados",
          seguro: clavesStorage.length === 0,
        },
        {
          prueba: "supabase.auth.getSession() en el navegador",
          detalle: data.session ? "El cliente obtuvo un token" : "session = null (el token no es accesible)",
          seguro: !data.session,
        },
      ]);
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <ul className="divide-y divide-borde">
      {resultados === null ? (
        <li className="py-3 text-sm text-suave">Ejecutando comprobaciones en tu navegador…</li>
      ) : (
        resultados.map((r) => (
          <li key={r.prueba} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-sm">{r.prueba}</p>
              <p className="text-xs text-suave">{r.detalle}</p>
            </div>
            <Insignia ok={r.seguro}>{r.seguro ? "Protegido" : "Expuesto"}</Insignia>
          </li>
        ))
      )}
    </ul>
  );
}
