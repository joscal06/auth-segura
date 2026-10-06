import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Capa de acceso a datos (DAL). Toda lectura del usuario/perfil pasa por aquí.
 *
 * `getUser()` consulta al servidor de Supabase Auth, así que detecta sesiones revocadas
 * (p. ej. después de cerrar sesión en otro dispositivo). `cache()` evita repetir la llamada
 * si el layout y la página la necesitan en la misma petición.
 */
export const obtenerUsuario = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

/**
 * Verificación de autenticación en el propio componente/acción, además del proxy.
 * Defensa en profundidad: si el matcher del proxy cambiara por error, las páginas privadas
 * seguirían protegidas.
 */
export async function requerirUsuario(rutaActual = "/dashboard") {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect(`/login?next=${encodeURIComponent(rutaActual)}`);
  return usuario;
}

export type Perfil = {
  id: string;
  full_name: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export const obtenerPerfil = cache(async (idUsuario: string): Promise<Perfil | null> => {
  const supabase = await createClient();
  // RLS garantiza que solo se pueda leer el propio perfil; el filtro por id es explícito igualmente.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, bio, created_at, updated_at")
    .eq("id", idUsuario)
    .maybeSingle<Perfil>();
  if (error) {
    console.error("[dal:perfil]", error.code, error.message);
    return null;
  }
  return data;
});
