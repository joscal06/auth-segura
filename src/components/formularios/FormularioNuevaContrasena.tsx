"use client";

import Link from "next/link";
import { actualizarContrasena } from "@/app/actions/auth";
import { esquemaNuevaContrasena } from "@/lib/validacion";
import { Alerta } from "@/components/ui";
import { BotonEnviar } from "@/components/formulario/BotonEnviar";
import { Campo } from "@/components/formulario/Campo";
import { MedidorContrasena } from "@/components/formulario/MedidorContrasena";
import { useFormulario } from "@/components/formulario/useFormulario";

export function FormularioNuevaContrasena() {
  const { estado, formAction, valores, campo, alEnviar } = useFormulario(esquemaNuevaContrasena, actualizarContrasena, {
    password: "",
    confirmacion: "",
  });

  if (estado.estado === "exito") {
    return (
      <div className="space-y-5">
        <Alerta tipo="exito">{estado.mensaje}</Alerta>
        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-lg bg-marca px-4 py-2.5 text-sm font-semibold text-white hover:bg-marca-fuerte dark:text-black"
        >
          Ir al panel
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={alEnviar} noValidate className="space-y-5">
      {estado.estado === "error" && estado.mensaje && <Alerta tipo="error">{estado.mensaje}</Alerta>}

      <div className="space-y-2">
        <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" maxLength={72} required {...campo("password")} />
        <MedidorContrasena valor={valores.password} />
      </div>
      <Campo etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" maxLength={72} required {...campo("confirmacion")} />

      <BotonEnviar textoCargando="Guardando…">Guardar contraseña</BotonEnviar>
    </form>
  );
}
