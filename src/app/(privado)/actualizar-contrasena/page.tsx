import type { Metadata } from "next";
import { Tarjeta } from "@/components/ui";
import { EncabezadoFormulario } from "@/components/EncabezadoFormulario";
import { FormularioNuevaContrasena } from "@/components/formularios/FormularioNuevaContrasena";
import { requerirUsuario } from "@/lib/dal";

export const metadata: Metadata = { title: "Nueva contraseña" };

/**
 * Se llega aquí desde el enlace de recuperación (el Route Handler /auth/confirm crea la
 * sesión) o desde el perfil. En ambos casos requiere una sesión válida.
 */
export default async function PaginaActualizarContrasena() {
  const usuario = await requerirUsuario("/actualizar-contrasena");

  return (
    <div className="mx-auto max-w-md">
      <Tarjeta>
        <EncabezadoFormulario titulo="Crea una nueva contraseña">
          Para la cuenta <strong className="text-texto">{usuario.email}</strong>.
        </EncabezadoFormulario>
        <FormularioNuevaContrasena />
      </Tarjeta>
    </div>
  );
}
