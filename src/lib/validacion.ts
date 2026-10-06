import { z } from "zod";

/**
 * Esquemas de validación compartidos por el cliente (feedback inmediato) y el servidor
 * (la validación que realmente cuenta: el cliente se puede saltar con curl o DevTools).
 */

const correo = z
  .string({ error: "Ingresa tu correo." })
  .trim()
  .toLowerCase()
  .min(1, "Ingresa tu correo.")
  .max(254, "El correo es demasiado largo.")
  .pipe(z.email("Ingresa un correo válido."));

/** Política de contraseñas. 72 es el límite real de bcrypt, que usa Supabase Auth. */
export const REGLAS_CONTRASENA = [
  { id: "longitud", texto: "Al menos 8 caracteres", prueba: (v: string) => v.length >= 8 },
  { id: "minuscula", texto: "Una letra minúscula", prueba: (v: string) => /[a-z]/.test(v) },
  { id: "mayuscula", texto: "Una letra mayúscula", prueba: (v: string) => /[A-Z]/.test(v) },
  { id: "numero", texto: "Un número", prueba: (v: string) => /\d/.test(v) },
  { id: "simbolo", texto: "Un símbolo (!@#$…)", prueba: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

const contrasenaNueva = z
  .string({ error: "Ingresa una contraseña." })
  .max(72, "La contraseña no puede superar 72 caracteres.")
  .superRefine((valor, ctx) => {
    for (const regla of REGLAS_CONTRASENA) {
      if (!regla.prueba(valor)) {
        ctx.addIssue({ code: "custom", message: `La contraseña necesita: ${regla.texto.toLowerCase()}.` });
        return;
      }
    }
  });

const nombre = z
  .string({ error: "Ingresa tu nombre." })
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(80, "El nombre no puede superar 80 caracteres.")
  // Letras (con acentos), espacios, apóstrofo, punto y guion. Rechaza < > { } etc.
  .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "El nombre solo puede contener letras, espacios, apóstrofos y guiones.");

export const esquemaLogin = z.object({
  email: correo,
  password: z
    .string({ error: "Ingresa tu contraseña." })
    .min(1, "Ingresa tu contraseña.")
    .max(72, "Correo o contraseña incorrectos."),
});

export const esquemaRegistro = z
  .object({
    nombre,
    email: correo,
    password: contrasenaNueva,
    confirmacion: z.string({ error: "Confirma tu contraseña." }),
  })
  .refine((d) => d.password === d.confirmacion, {
    path: ["confirmacion"],
    message: "Las contraseñas no coinciden.",
  });

export const esquemaRecuperar = z.object({ email: correo });

export const esquemaNuevaContrasena = z
  .object({
    password: contrasenaNueva,
    confirmacion: z.string({ error: "Confirma tu contraseña." }),
  })
  .refine((d) => d.password === d.confirmacion, {
    path: ["confirmacion"],
    message: "Las contraseñas no coinciden.",
  });

export const esquemaPerfil = z.object({
  nombre,
  bio: z
    .string()
    .trim()
    .max(280, "La biografía no puede superar 280 caracteres.")
    .optional()
    .default(""),
});

export type CamposLogin = z.input<typeof esquemaLogin>;
export type CamposRegistro = z.input<typeof esquemaRegistro>;
export type CamposRecuperar = z.input<typeof esquemaRecuperar>;
export type CamposNuevaContrasena = z.input<typeof esquemaNuevaContrasena>;
export type CamposPerfil = z.input<typeof esquemaPerfil>;

/** Errores por campo: { email: "…", password: "…" } (solo el primer mensaje de cada campo). */
export type ErroresCampo<T> = Partial<Record<keyof T & string, string>>;

export function erroresPorCampo<T>(error: z.ZodError<T>): ErroresCampo<T> {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "");
    if (campo && !errores[campo]) errores[campo] = issue.message;
  }
  return errores as ErroresCampo<T>;
}

/** Convierte un FormData en un objeto plano (ignorando archivos y campos internos de Next). */
export function formDataAObjeto(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((valor, clave) => {
    if (typeof valor === "string" && !clave.startsWith("$ACTION")) obj[clave] = valor;
  });
  return obj;
}
