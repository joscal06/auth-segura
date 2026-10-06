"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuario } from "@/lib/dal";
import type { EstadoFormulario } from "@/lib/tipos";
import { erroresPorCampo, esquemaPerfil, formDataAObjeto, type CamposPerfil } from "@/lib/validacion";

export async function actualizarPerfil(
  _previo: EstadoFormulario<CamposPerfil>,
  formData: FormData,
): Promise<EstadoFormulario<CamposPerfil>> {
  // Autenticación + autorización dentro de la acción: el id sale de la sesión verificada,
  // nunca del formulario (el cliente no puede editar el perfil de otra persona).
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login?next=/perfil");

  const datos = formDataAObjeto(formData);
  const valores = { nombre: datos.nombre ?? "", bio: datos.bio ?? "" };

  const resultado = esquemaPerfil.safeParse(datos);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  const supabase = await createClient();
  // RLS (policy "profiles_update_own") impide además modificar filas ajenas.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: resultado.data.nombre, bio: resultado.data.bio })
    .eq("id", usuario.id);

  if (error) {
    console.error("[perfil:actualizar]", error.code, error.message);
    return { estado: "error", mensaje: "No pudimos guardar tu perfil. Inténtalo de nuevo.", valores };
  }

  revalidatePath("/", "layout");
  return { estado: "exito", mensaje: "Perfil actualizado.", valores };
}
