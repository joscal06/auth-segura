import type { AuthError } from "@supabase/supabase-js";

/**
 * Traduce los errores de Supabase Auth a mensajes informativos pero seguros:
 *  - Nunca revelan si un correo está registrado (evita la enumeración de usuarios).
 *  - Nunca muestran detalles internos (stack traces, SQL, nombres de tablas).
 * El error original se registra solo en los logs del servidor.
 */
export function mensajeSeguro(error: AuthError | Error, contexto: string): string {
  const codigo = "code" in error ? (error.code as string | undefined) : undefined;
  console.error(`[auth:${contexto}]`, codigo ?? "", error.message);

  switch (codigo) {
    case "invalid_credentials":
    case "user_not_found":
      return "Correo o contraseña incorrectos.";
    case "email_not_confirmed":
      return "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
    case "too_many_requests":
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    case "weak_password":
      return "La contraseña es demasiado débil o aparece en filtraciones conocidas. Elige otra.";
    case "same_password":
      return "La nueva contraseña debe ser diferente de la actual.";
    case "email_address_invalid":
      return "Ese correo no es válido.";
    case "signup_disabled":
      return "El registro está deshabilitado temporalmente.";
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
      return "El enlace expiró o ya fue utilizado. Solicita uno nuevo.";
    case "session_not_found":
    case "session_expired":
    case "refresh_token_not_found":
    case "reauthentication_needed":
      return "Tu sesión expiró. Inicia sesión de nuevo.";
    default:
      return "No pudimos completar la operación. Inténtalo de nuevo más tarde.";
  }
}
