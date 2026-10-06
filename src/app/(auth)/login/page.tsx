import type { Metadata } from "next";
import Link from "next/link";
import { Alerta, Tarjeta } from "@/components/ui";
import { EncabezadoFormulario } from "@/components/EncabezadoFormulario";
import { FormularioLogin } from "@/components/formularios/FormularioLogin";
import { rutaSegura } from "@/lib/rutas";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Cerrojo de forma segura.",
  alternates: { canonical: "/login" },
};

export default async function PaginaLogin({ searchParams }: PageProps<"/login">) {
  const { next, sesion } = await searchParams;
  // Se sanea aquí y otra vez en la Server Action (el campo oculto puede manipularse).
  const destino = typeof next === "string" ? rutaSegura(next) : undefined;

  return (
    <Tarjeta>
      <EncabezadoFormulario titulo="Iniciar sesión">Bienvenido de nuevo. Ingresa tus credenciales.</EncabezadoFormulario>

      <div className="mb-5 space-y-3 empty:hidden">
        {sesion === "cerrada" && <Alerta tipo="info">Cerraste sesión correctamente.</Alerta>}
        {destino && destino !== "/dashboard" && <Alerta tipo="aviso">Inicia sesión para continuar.</Alerta>}
      </div>

      <FormularioLogin next={destino} />

      <p className="mt-6 text-center text-sm text-suave">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-marca hover:underline">
          Regístrate
        </Link>
      </p>
    </Tarjeta>
  );
}
