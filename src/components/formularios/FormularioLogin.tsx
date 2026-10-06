"use client";

import Link from "next/link";
import { iniciarSesion } from "@/app/actions/auth";
import { esquemaLogin } from "@/lib/validacion";
import { Alerta } from "@/components/ui";
import { BotonEnviar } from "@/components/formulario/BotonEnviar";
import { Campo } from "@/components/formulario/Campo";
import { CampoTrampa } from "@/components/formulario/CampoTrampa";
import { useFormulario } from "@/components/formulario/useFormulario";

export function FormularioLogin({ next }: { next?: string }) {
  const { estado, formAction, campo, alEnviar } = useFormulario(esquemaLogin, iniciarSesion, {
    email: "",
    password: "",
  });

  return (
    <form action={formAction} onSubmit={alEnviar} noValidate className="space-y-5">
      {estado.estado === "error" && estado.mensaje && <Alerta tipo="error">{estado.mensaje}</Alerta>}

      <input type="hidden" name="next" value={next ?? ""} />
      <CampoTrampa />

      <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" required {...campo("email")} />

      <div className="space-y-1.5">
        <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" required {...campo("password")} />
        <div className="text-right">
          <Link href="/recuperar" className="text-xs font-medium text-marca hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <BotonEnviar textoCargando="Verificando…">Iniciar sesión</BotonEnviar>
    </form>
  );
}
