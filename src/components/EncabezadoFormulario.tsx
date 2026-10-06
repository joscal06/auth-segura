import type { ReactNode } from "react";

export function EncabezadoFormulario({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="mb-6 space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
      {children && <p className="text-sm text-suave">{children}</p>}
    </div>
  );
}
