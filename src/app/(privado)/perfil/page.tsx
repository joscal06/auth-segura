import type { Metadata } from "next";
import Link from "next/link";
import { cerrarSesion } from "@/app/actions/auth";
import { obtenerPerfil, requerirUsuario } from "@/lib/dal";
import { fecha } from "@/lib/formato";
import { Tarjeta } from "@/components/ui";
import { BotonEnviar } from "@/components/formulario/BotonEnviar";
import { FormularioPerfil } from "@/components/formularios/FormularioPerfil";

export const metadata: Metadata = { title: "Perfil" };

export default async function PaginaPerfil() {
  const usuario = await requerirUsuario("/perfil");
  const perfil = await obtenerPerfil(usuario.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Tu perfil</h1>
        <p className="text-suave">
          Los datos se guardan en la tabla <code className="font-mono text-sm">profiles</code>, protegida con Row Level Security.
          {perfil && <> Última actualización: {fecha(perfil.updated_at)}.</>}
        </p>
      </div>

      <Tarjeta>
        <h2 className="mb-5 text-lg font-semibold">Información personal</h2>
        <FormularioPerfil nombre={perfil?.full_name ?? ""} bio={perfil?.bio ?? ""} />
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-lg font-semibold">Seguridad</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Contraseña</p>
            <p className="text-sm text-suave">Al cambiarla se cierran tus sesiones en otros dispositivos.</p>
          </div>
          <Link
            href="/actualizar-contrasena"
            className="inline-flex justify-center rounded-lg border border-borde px-4 py-2.5 text-sm font-semibold hover:bg-fondo"
          >
            Cambiar contraseña
          </Link>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-borde pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Cerrar sesión</p>
            <p className="text-sm text-suave">Revoca el token de este dispositivo y elimina las cookies.</p>
          </div>
          <form action={cerrarSesion} className="sm:w-44">
            <BotonEnviar variante="peligro" textoCargando="Saliendo…">
              Cerrar sesión
            </BotonEnviar>
          </form>
        </div>
      </Tarjeta>
    </div>
  );
}
