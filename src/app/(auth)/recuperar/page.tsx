import type { Metadata } from "next";
import Link from "next/link";
import { solicitarRecuperacion } from "@/app/actions/auth";
import { Tarjeta } from "@/components/ui";
import { EncabezadoFormulario } from "@/components/EncabezadoFormulario";
import { FormularioCorreo } from "@/components/formularios/FormularioCorreo";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Restablece la contraseña de tu cuenta de Cerrojo.",
  alternates: { canonical: "/recuperar" },
};

export default function PaginaRecuperar() {
  return (
    <Tarjeta>
      <EncabezadoFormulario titulo="Recuperar contraseña">
        Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
      </EncabezadoFormulario>
      <FormularioCorreo accion={solicitarRecuperacion} textoBoton="Enviar enlace" />
      <p className="mt-6 text-center text-sm text-suave">
        <Link href="/login" className="font-medium text-marca hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </Tarjeta>
  );
}
