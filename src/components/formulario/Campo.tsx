"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  etiqueta: string;
  name: string;
  error?: string;
  ayuda?: string;
  multilinea?: boolean;
};

/**
 * Campo de formulario accesible: etiqueta asociada, aria-invalid y aria-describedby para que
 * los lectores de pantalla anuncien el error. React escapa siempre el texto que se renderiza,
 * así que los mensajes y valores no pueden inyectar HTML (protección XSS por defecto).
 */
export function Campo({ etiqueta, name, error, ayuda, type = "text", multilinea, className, ...resto }: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const esContrasena = type === "password";
  const descripcion = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(" ") || undefined;

  const clases = `w-full rounded-lg border bg-superficie px-3.5 py-2.5 text-sm text-texto placeholder:text-suave/70 transition focus:outline-none focus:ring-2 ${
    error ? "border-peligro focus:ring-peligro/30" : "border-borde focus:border-marca focus:ring-marca/25"
  } ${esContrasena ? "pr-20" : ""} ${className ?? ""}`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-texto">
        {etiqueta}
      </label>
      <div className="relative">
        {multilinea ? (
          <textarea
            id={id}
            name={name}
            rows={3}
            aria-invalid={Boolean(error)}
            aria-describedby={descripcion}
            className={clases}
            {...(resto as InputHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={esContrasena && visible ? "text" : type}
            aria-invalid={Boolean(error)}
            aria-describedby={descripcion}
            className={clases}
            {...resto}
          />
        )}
        {esContrasena && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-suave hover:text-texto"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="text-xs text-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
