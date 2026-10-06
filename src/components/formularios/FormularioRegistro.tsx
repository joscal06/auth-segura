"use client";

import { registrarse } from "@/app/actions/auth";
import { esquemaRegistro } from "@/lib/validacion";
import { Alerta } from "@/components/ui";
import { BotonEnviar } from "@/components/formulario/BotonEnviar";
import { Campo } from "@/components/formulario/Campo";
import { CampoTrampa } from "@/components/formulario/CampoTrampa";
import { MedidorContrasena } from "@/components/formulario/MedidorContrasena";
import { useFormulario } from "@/components/formulario/useFormulario";

export function FormularioRegistro() {
  const { estado, formAction, valores, campo, alEnviar } = useFormulario(esquemaRegistro, registrarse, {
    nombre: "",
    email: "",
    password: "",
    confirmacion: "",
  });

  return (
    <form action={formAction} onSubmit={alEnviar} noValidate className="space-y-5">
      {estado.estado === "error" && estado.mensaje && <Alerta tipo="error">{estado.mensaje}</Alerta>}

      <CampoTrampa />

      <Campo etiqueta="Nombre completo" autoComplete="name" placeholder="Ana Martínez" maxLength={80} required {...campo("nombre")} />
      <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" required {...campo("email")} />

      <div className="space-y-2">
        <Campo etiqueta="Contraseña" type="password" autoComplete="new-password" maxLength={72} required {...campo("password")} />
        <MedidorContrasena valor={valores.password} />
      </div>

      <Campo etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" maxLength={72} required {...campo("confirmacion")} />

      <BotonEnviar textoCargando="Creando cuenta…">Crear cuenta</BotonEnviar>
    </form>
  );
}
