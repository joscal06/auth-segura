import type { ErroresCampo } from "./validacion";

/**
 * Estado que devuelven las Server Actions de formularios (consumido con useActionState).
 * `valores` devuelve lo que el usuario escribió (nunca contraseñas) para no vaciar el formulario.
 */
export type EstadoFormulario<T> = {
  estado: "inicial" | "error" | "exito";
  mensaje?: string;
  errores?: ErroresCampo<T>;
  valores?: Partial<Record<keyof T & string, string>>;
};

export const ESTADO_INICIAL = { estado: "inicial" } as const satisfies EstadoFormulario<never>;
