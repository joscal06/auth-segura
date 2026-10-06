"use client";

import { esquemaRecuperar, type CamposRecuperar } from "@/lib/validacion";
import type { EstadoFormulario } from "@/lib/tipos";
import { Alerta } from "@/components/ui";
import { BotonEnviar } from "@/components/formulario/BotonEnviar";
import { Campo } from "@/components/formulario/Campo";
import { CampoTrampa } from "@/components/formulario/CampoTrampa";
import { useFormulario } from "@/components/formulario/useFormulario";

type Props = {
  accion: (previo: EstadoFormulario<CamposRecuperar>, formData: FormData) => Promise<EstadoFormulario<CamposRecuperar>>;
  textoBoton: string;
  textoCargando?: string;
};

/** Formulario de un solo campo (correo): recuperar contraseña y reenviar verificación. */
export function FormularioCorreo({ accion, textoBoton, textoCargando = "Enviando…" }: Props) {
  const { estado, formAction, campo, alEnviar } = useFormulario(esquemaRecuperar, accion, { email: "" });

  return (
    <form action={formAction} onSubmit={alEnviar} noValidate className="space-y-5">
      {estado.estado === "error" && estado.mensaje && <Alerta tipo="error">{estado.mensaje}</Alerta>}
      {estado.estado === "exito" && estado.mensaje && <Alerta tipo="exito">{estado.mensaje}</Alerta>}

      <CampoTrampa />
      <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" required {...campo("email")} />
      <BotonEnviar textoCargando={textoCargando}>{textoBoton}</BotonEnviar>
    </form>
  );
}
