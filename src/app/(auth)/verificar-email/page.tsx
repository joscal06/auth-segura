import type { Metadata } from "next";
import Link from "next/link";
import { reenviarVerificacion } from "@/app/actions/auth";
import { Tarjeta } from "@/components/ui";
import { EncabezadoFormulario } from "@/components/EncabezadoFormulario";
import { FormularioCorreo } from "@/components/formularios/FormularioCorreo";

export const metadata: Metadata = {
  title: "Verifica tu correo",
  robots: { index: false, follow: false },
};

export default function PaginaVerificarEmail() {
  return (
    <Tarjeta>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-marca-suave text-2xl" aria-hidden>
        ✉️
      </div>
      <EncabezadoFormulario titulo="Revisa tu correo">
        Si el correo no estaba registrado, te enviamos un enlace de verificación. Ábrelo en este mismo
        navegador para activar tu cuenta. El enlace caduca en 1 hora.
      </EncabezadoFormulario>

      <details className="group rounded-lg border border-borde p-4">
        <summary className="cursor-pointer text-sm font-medium text-texto">¿No llegó el correo?</summary>
        <div className="mt-4 space-y-3">
          <p className="text-xs text-suave">Revisa la carpeta de spam o solicita un nuevo enlace.</p>
          <FormularioCorreo accion={reenviarVerificacion} textoBoton="Reenviar enlace" />
        </div>
      </details>

      <p className="mt-6 text-center text-sm text-suave">
        <Link href="/login" className="font-medium text-marca hover:underline">
          Ir a iniciar sesión
        </Link>
      </p>
    </Tarjeta>
  );
}
