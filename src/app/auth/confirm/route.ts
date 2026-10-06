import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/rutas";

const TIPOS_VALIDOS: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Route Handler que reciben los enlaces de los correos de Supabase
 * (verificación de cuenta y recuperación de contraseña).
 *
 * Soporta los dos formatos de enlace:
 *  - `?token_hash=…&type=…` → verifyOtp (plantillas de correo personalizadas; funciona en
 *    cualquier dispositivo).
 *  - `?code=…` → exchangeCodeForSession (flujo PKCE con las plantillas por defecto; el
 *    code_verifier vive en una cookie httpOnly de este navegador).
 *
 * En ambos casos el cliente de servidor escribe la sesión en cookies httpOnly y luego
 * redirige a `next`, que se sanea para impedir redirecciones abiertas.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const destino = rutaSegura(searchParams.get("next"));
  const error = (codigo: string) =>
    NextResponse.redirect(new URL(`/auth/error?motivo=${codigo}`, request.url));

  // Supabase añade estos parámetros cuando el enlace ya expiró o fue usado.
  if (searchParams.get("error")) {
    return error(searchParams.get("error_code") === "otp_expired" ? "expirado" : "invalido");
  }

  const supabase = await createClient();
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  if (tokenHash && tipo && TIPOS_VALIDOS.includes(tipo)) {
    const { error: fallo } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (fallo) {
      console.error("[auth:confirm]", fallo.code, fallo.message);
      return error("expirado");
    }
    // Un enlace de recuperación siempre termina en el formulario de nueva contraseña.
    return NextResponse.redirect(
      new URL(tipo === "recovery" ? "/actualizar-contrasena" : destino, request.url),
    );
  }

  if (code) {
    const { error: fallo } = await supabase.auth.exchangeCodeForSession(code);
    if (fallo) {
      console.error("[auth:confirm]", fallo.code, fallo.message);
      return error(fallo.code === "bad_code_verifier" ? "otro-navegador" : "expirado");
    }
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return error("invalido");
}
