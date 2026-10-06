import type { Metadata } from "next";
import Link from "next/link";
import { Alerta, Tarjeta } from "@/components/ui";
import { EncabezadoFormulario } from "@/components/EncabezadoFormulario";

export const metadata: Metadata = { title: "Enlace no válido", robots: { index: false, follow: false } };

/** Mensajes fijos: el parámetro `motivo` solo selecciona uno, nunca se imprime tal cual. */
const MENSAJES: Record<string, string> = {
  expirado: "El enlace expiró o ya fue utilizado. Solicita uno nuevo.",
  "otro-navegador": "Abre el enlace en el mismo navegador donde iniciaste el proceso, o solicita uno nuevo.",
  invalido: "El enlace no es válido.",
};

export default async function PaginaErrorAuth({ searchParams }: PageProps<"/auth/error">) {
  const { motivo } = await searchParams;
  const mensaje = MENSAJES[typeof motivo === "string" ? motivo : ""] ?? MENSAJES.invalido;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Tarjeta>
        <EncabezadoFormulario titulo="No pudimos verificar el enlace" />
        <Alerta tipo="error">{mensaje}</Alerta>
        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <Link href="/recuperar" className="font-medium text-marca hover:underline">
            Solicitar un nuevo enlace de recuperación
          </Link>
          <Link href="/verificar-email" className="font-medium text-marca hover:underline">
            Reenviar el correo de verificación
          </Link>
          <Link href="/login" className="text-suave hover:underline">
            Volver a iniciar sesión
          </Link>
        </div>
      </Tarjeta>
    </div>
  );
}
