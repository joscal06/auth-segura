import Link from "next/link";
import { Tarjeta } from "@/components/ui";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Tarjeta>
        <p className="font-mono text-sm text-marca">404</p>
        <h1 className="mt-1 text-xl font-semibold">Página no encontrada</h1>
        <p className="mt-2 text-sm text-suave">La dirección no existe o fue movida.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-marca hover:underline">
          Volver al inicio
        </Link>
      </Tarjeta>
    </div>
  );
}
