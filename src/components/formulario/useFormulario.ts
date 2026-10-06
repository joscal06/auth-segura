"use client";

import { useActionState, useState, type FormEvent } from "react";
import type { ZodType } from "zod";
import { erroresPorCampo, type ErroresCampo } from "@/lib/validacion";
import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/tipos";

type Accion<T> = (previo: EstadoFormulario<T>, formData: FormData) => Promise<EstadoFormulario<T>>;

/**
 * Une la validación en el cliente (zod, feedback inmediato) con la Server Action
 * (validación definitiva en el servidor) mediante useActionState.
 *
 * - Los valores son controlados para que no se borren si el servidor devuelve un error.
 * - Si la validación del cliente falla, se cancela el envío y no se llama al servidor.
 * - Los errores de un campo se limpian en cuanto el usuario lo corrige.
 */
export function useFormulario<T extends Record<string, string>>(
  esquema: ZodType,
  accion: Accion<T>,
  valoresIniciales: T,
) {
  const [estado, formAction, pendiente] = useActionState(accion, ESTADO_INICIAL as EstadoFormulario<T>);
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [erroresCliente, setErroresCliente] = useState<ErroresCampo<T>>({});
  // Errores del servidor que el usuario ya corrigió al volver a escribir.
  const [descartados, setDescartados] = useState<Set<string>>(new Set());
  const [estadoVisto, setEstadoVisto] = useState(estado);

  // Patrón de React para "reiniciar estado cuando cambia una prop": cada respuesta nueva del
  // servidor vuelve a mostrar todos sus errores.
  if (estado !== estadoVisto) {
    setEstadoVisto(estado);
    setDescartados(new Set());
  }

  const validar = (datos: T): ErroresCampo<T> => {
    const r = esquema.safeParse(datos);
    return r.success ? {} : (erroresPorCampo(r.error) as ErroresCampo<T>);
  };

  const cambiar = (campo: keyof T & string, valor: string) => {
    const siguientes = { ...valores, [campo]: valor };
    setValores(siguientes);
    setDescartados((d) => new Set(d).add(campo));
    // Solo se re-valida un campo que ya mostraba error (no molestar mientras se escribe).
    if (erroresCliente[campo]) {
      setErroresCliente((e) => ({ ...e, [campo]: validar(siguientes)[campo] }));
    }
  };

  const alSalir = (campo: keyof T & string) => {
    if (!valores[campo]) return;
    setErroresCliente((e) => ({ ...e, [campo]: validar(valores)[campo] }));
  };

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => {
    const errores = validar(valores);
    setErroresCliente(errores);
    if (Object.keys(errores).length > 0) {
      evento.preventDefault();
      const primero = evento.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      primero?.focus();
    }
  };

  const error = (campo: keyof T & string): string | undefined =>
    erroresCliente[campo] ?? (descartados.has(campo) ? undefined : estado.errores?.[campo]);

  /** Props listas para un <Campo>. */
  const campo = (nombre: keyof T & string) => ({
    name: nombre,
    value: valores[nombre],
    onChange: (e: { target: { value: string } }) => cambiar(nombre, e.target.value),
    onBlur: () => alSalir(nombre),
    error: error(nombre),
  });

  return { estado, formAction, pendiente, valores, campo, alEnviar };
}
