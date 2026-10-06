import type { Metadata } from "next";
import { requerirUsuario } from "@/lib/dal";

// Las páginas privadas no deben aparecer en buscadores.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LayoutPrivado({ children }: LayoutProps<"/">) {
  // Segunda línea de defensa: el proxy ya redirige, pero verificamos también aquí.
  await requerirUsuario();
  return <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">{children}</div>;
}
