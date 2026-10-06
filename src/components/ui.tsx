import type { ReactNode } from "react";

/** Componentes visuales sin estado, usables desde Server y Client Components. */

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-borde bg-superficie p-6 shadow-sm sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

type TipoAlerta = "error" | "exito" | "info" | "aviso";

const estilosAlerta: Record<TipoAlerta, string> = {
  error: "border-peligro/30 bg-peligro-suave text-peligro",
  exito: "border-exito/30 bg-exito-suave text-exito",
  info: "border-marca/30 bg-marca-suave text-marca-fuerte",
  aviso: "border-aviso/30 bg-aviso-suave text-aviso",
};

export function Alerta({ tipo, children }: { tipo: TipoAlerta; children: ReactNode }) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-lg border px-4 py-3 text-sm ${estilosAlerta[tipo]}`}
    >
      {children}
    </div>
  );
}

export function Insignia({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-exito-suave text-exito" : "bg-aviso-suave text-aviso"
      }`}
    >
      <span aria-hidden>{ok ? "✓" : "!"}</span>
      {children}
    </span>
  );
}

export function IconoCandado({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
