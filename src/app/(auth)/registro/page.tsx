import type { Metadata } from "next";
import Link from "next/link";
import { Tarjeta } from "@/components/ui";
import { EncabezadoFormulario } from "@/components/EncabezadoFormulario";
import { FormularioRegistro } from "@/components/formularios/FormularioRegistro";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Cerrojo: autenticación con cookies httpOnly y verificación de correo.",
  alternates: { canonical: "/registro" },
};

export default function PaginaRegistro() {
  return (
    <Tarjeta>
      <EncabezadoFormulario titulo="Crear cuenta">Te enviaremos un enlace para verificar tu correo.</EncabezadoFormulario>
      <FormularioRegistro />
      <p className="mt-6 text-center text-sm text-suave">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-marca hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Tarjeta>
  );
}
