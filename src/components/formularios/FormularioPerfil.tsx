"use client";

import { actualizarPerfil } from "@/app/actions/perfil";
import { esquemaPerfil } from "@/lib/validacion";
import { Alerta } from "@/components/ui";
import { BotonEnviar } from "@/components/formulario/BotonEnviar";
import { Campo } from "@/components/formulario/Campo";
import { useFormulario } from "@/components/formulario/useFormulario";

export function FormularioPerfil({ nombre, bio }: { nombre: string; bio: string }) {
  const { estado, formAction, valores, campo, alEnviar } = useFormulario(esquemaPerfil, actualizarPerfil, { nombre, bio });

  return (
    <form action={formAction} onSubmit={alEnviar} noValidate className="space-y-5">
      {estado.estado === "error" && estado.mensaje && <Alerta tipo="error">{estado.mensaje}</Alerta>}
      {estado.estado === "exito" && estado.mensaje && <Alerta tipo="exito">{estado.mensaje}</Alerta>}

      <Campo etiqueta="Nombre completo" autoComplete="name" maxLength={80} required {...campo("nombre")} />
      <Campo
        etiqueta="Biografía"
        multilinea
        maxLength={280}
        placeholder="Cuéntanos algo sobre ti (puedes probar a escribir <script>alert(1)</script>: se mostrará como texto)."
        ayuda={`${(valores.bio ?? "").length}/280 caracteres`}
        {...campo("bio")}
      />

      <div className="sm:w-48">
        <BotonEnviar textoCargando="Guardando…">Guardar cambios</BotonEnviar>
      </div>
    </form>
  );
}
