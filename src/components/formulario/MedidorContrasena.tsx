"use client";

import { REGLAS_CONTRASENA } from "@/lib/validacion";

/** Lista de requisitos de la contraseña que se marcan a medida que el usuario escribe. */
export function MedidorContrasena({ valor }: { valor: string }) {
  const cumplidas = REGLAS_CONTRASENA.filter((r) => r.prueba(valor)).length;
  const color = cumplidas <= 2 ? "bg-peligro" : cumplidas <= 4 ? "bg-aviso" : "bg-exito";

  // Barra segmentada con clases (sin atributo style): la CSP estricta bloquea estilos en línea.
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex h-1.5 w-full gap-1">
        {REGLAS_CONTRASENA.map((regla, i) => (
          <div key={regla.id} className={`h-full flex-1 rounded-full transition-colors ${i < cumplidas ? color : "bg-borde"}`} />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {REGLAS_CONTRASENA.map((regla) => {
          const ok = regla.prueba(valor);
          return (
            <li key={regla.id} className={ok ? "text-exito" : "text-suave"}>
              <span aria-hidden>{ok ? "✓" : "○"}</span> {regla.texto}
              <span className="sr-only">{ok ? " (cumplido)" : " (pendiente)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
