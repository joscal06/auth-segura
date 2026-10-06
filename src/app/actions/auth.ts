"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/env";
import { obtenerUsuario } from "@/lib/dal";
import { mensajeSeguro } from "@/lib/errores-auth";
import { rutaSegura } from "@/lib/rutas";
import type { EstadoFormulario } from "@/lib/tipos";
import {
  erroresPorCampo,
  esquemaLogin,
  esquemaNuevaContrasena,
  esquemaRecuperar,
  esquemaRegistro,
  formDataAObjeto,
  type CamposLogin,
  type CamposNuevaContrasena,
  type CamposRecuperar,
  type CamposRegistro,
} from "@/lib/validacion";

/*
 * Server Actions de autenticación.
 *
 * Protección CSRF incluida por diseño:
 *  - Solo se pueden invocar con POST.
 *  - Next.js compara la cabecera Origin con Host y rechaza peticiones de otros sitios.
 *  - Las cookies de sesión son SameSite=Lax: un sitio externo no puede enviarlas por POST.
 *
 * Todas las entradas se validan aquí con zod, aunque el cliente ya las haya validado.
 */

/** Campo trampa invisible: los bots lo rellenan, las personas no. */
const esBot = (formData: FormData) => (formData.get("sitio_web")?.toString() ?? "") !== "";

// ─────────────────────────────── Inicio de sesión ───────────────────────────────

export async function iniciarSesion(
  _previo: EstadoFormulario<CamposLogin>,
  formData: FormData,
): Promise<EstadoFormulario<CamposLogin>> {
  const datos = formDataAObjeto(formData);
  const valores = { email: datos.email ?? "" };

  if (esBot(formData)) return { estado: "error", mensaje: "Correo o contraseña incorrectos.", valores };

  const resultado = esquemaLogin.safeParse(datos);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(resultado.data);
  if (error) return { estado: "error", mensaje: mensajeSeguro(error, "login"), valores };

  // Las cookies httpOnly ya fueron escritas por el cliente de servidor (cookies().set).
  revalidatePath("/", "layout");
  redirect(rutaSegura(datos.next));
}

// ─────────────────────────────── Registro ───────────────────────────────

export async function registrarse(
  _previo: EstadoFormulario<CamposRegistro>,
  formData: FormData,
): Promise<EstadoFormulario<CamposRegistro>> {
  const datos = formDataAObjeto(formData);
  const valores = { nombre: datos.nombre ?? "", email: datos.email ?? "" };

  if (esBot(formData)) redirect("/verificar-email");

  const resultado = esquemaRegistro.safeParse(datos);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  const { nombre, email, password } = resultado.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El enlace del correo vuelve a nuestro Route Handler, que verifica el token.
      emailRedirectTo: `${SITE_URL}/auth/confirm?next=/dashboard`,
      // Se guarda en raw_user_meta_data; el trigger de la BD crea el perfil con este nombre.
      data: { full_name: nombre },
    },
  });

  if (error) {
    // "El correo ya existe" se trata igual que un registro correcto: no revelamos qué
    // correos tienen cuenta (enumeración de usuarios).
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      redirect("/verificar-email");
    }
    return { estado: "error", mensaje: mensajeSeguro(error, "registro"), valores };
  }

  // Si el proyecto no exige confirmar el correo, Supabase ya devuelve una sesión.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  redirect("/verificar-email");
}

// ─────────────────────────────── Cierre de sesión ───────────────────────────────

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  // Revoca el refresh token en Supabase y borra las cookies (maxAge 0).
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/login?sesion=cerrada");
}

// ─────────────────────────────── Recuperar contraseña ───────────────────────────────

export async function solicitarRecuperacion(
  _previo: EstadoFormulario<CamposRecuperar>,
  formData: FormData,
): Promise<EstadoFormulario<CamposRecuperar>> {
  const datos = formDataAObjeto(formData);
  const valores = { email: datos.email ?? "" };
  const exito: EstadoFormulario<CamposRecuperar> = {
    estado: "exito",
    mensaje:
      "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña en unos minutos.",
  };

  if (esBot(formData)) return exito;

  const resultado = esquemaRecuperar.safeParse(datos);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(resultado.data.email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=/actualizar-contrasena`,
  });

  // Solo se informa el límite de envíos; cualquier otro resultado muestra el mismo mensaje,
  // exista o no la cuenta.
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { estado: "error", mensaje: mensajeSeguro(error, "recuperar"), valores };
  }
  if (error) mensajeSeguro(error, "recuperar");
  return exito;
}

// ─────────────────────────────── Nueva contraseña ───────────────────────────────

export async function actualizarContrasena(
  _previo: EstadoFormulario<CamposNuevaContrasena>,
  formData: FormData,
): Promise<EstadoFormulario<CamposNuevaContrasena>> {
  // Re-autorización dentro de la acción: no basta con que la página esté protegida.
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login?next=/actualizar-contrasena");

  const resultado = esquemaNuevaContrasena.safeParse(formDataAObjeto(formData));
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: resultado.data.password });
  if (error) return { estado: "error", mensaje: mensajeSeguro(error, "nueva-contrasena") };

  // Cierra las sesiones abiertas en otros dispositivos (un atacante con la contraseña anterior
  // pierde el acceso) y conserva la actual.
  await supabase.auth.signOut({ scope: "others" });

  return { estado: "exito", mensaje: "Tu contraseña se actualizó y se cerraron las sesiones en otros dispositivos." };
}

// ─────────────────────────────── Reenviar verificación ───────────────────────────────

export async function reenviarVerificacion(
  _previo: EstadoFormulario<CamposRecuperar>,
  formData: FormData,
): Promise<EstadoFormulario<CamposRecuperar>> {
  const datos = formDataAObjeto(formData);
  const valores = { email: datos.email ?? "" };
  const exito: EstadoFormulario<CamposRecuperar> = {
    estado: "exito",
    mensaje: "Si el correo tiene una cuenta pendiente de verificar, te enviamos un nuevo enlace.",
  };

  if (esBot(formData)) return exito;

  const resultado = esquemaRecuperar.safeParse(datos);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: resultado.data.email,
    options: { emailRedirectTo: `${SITE_URL}/auth/confirm?next=/dashboard` },
  });

  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { estado: "error", mensaje: mensajeSeguro(error, "reenviar"), valores };
  }
  if (error) mensajeSeguro(error, "reenviar");
  return exito;
}
