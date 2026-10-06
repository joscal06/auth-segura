import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { obtenerPerfil, requerirUsuario } from "@/lib/dal";
import { SECURE_COOKIE_OPTIONS } from "@/lib/supabase/cookies";
import { fecha } from "@/lib/formato";
import { Insignia, Tarjeta } from "@/components/ui";
import { PruebaSeguridad } from "@/components/PruebaSeguridad";

export const metadata: Metadata = { title: "Panel" };

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-suave">{etiqueta}</dt>
      <dd className="break-all text-sm font-medium sm:text-right">{children}</dd>
    </div>
  );
}

export default async function PaginaDashboard() {
  const usuario = await requerirUsuario("/dashboard");
  const perfil = await obtenerPerfil(usuario.id);

  // Claims del JWT verificado (expiración, rol, nivel de autenticación).
  const supabase = await createClient();
  const { data: datosClaims } = await supabase.auth.getClaims();
  const claims = datosClaims?.claims;

  // Vista del SERVIDOR: el navegador envía las cookies, pero JavaScript no puede leerlas.
  const cookiesSesion = (await cookies())
    .getAll()
    .filter((c) => c.name.startsWith("sb-"))
    .map((c) => ({ nombre: c.name, tamano: c.value.length }));

  const nombre = perfil?.full_name ?? usuario.user_metadata?.full_name ?? usuario.email;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-marca">Ruta privada · protegida por el proxy</p>
        <h1 className="text-3xl font-semibold tracking-tight">Hola, {nombre}</h1>
        <p className="text-suave">Esta página solo se renderiza en el servidor después de validar tu sesión.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tu cuenta</h2>
            <Link href="/perfil" className="text-sm font-medium text-marca hover:underline">
              Editar perfil
            </Link>
          </div>
          <dl className="divide-y divide-borde">
            <Dato etiqueta="Correo">{usuario.email}</Dato>
            <Dato etiqueta="Verificación">
              <Insignia ok={Boolean(usuario.email_confirmed_at)}>
                {usuario.email_confirmed_at ? "Correo verificado" : "Sin verificar"}
              </Insignia>
            </Dato>
            <Dato etiqueta="ID de usuario">
              <span className="font-mono text-xs">{usuario.id}</span>
            </Dato>
            <Dato etiqueta="Proveedor">{usuario.app_metadata?.provider ?? "email"}</Dato>
            <Dato etiqueta="Cuenta creada">{fecha(usuario.created_at)}</Dato>
            <Dato etiqueta="Último inicio de sesión">{fecha(usuario.last_sign_in_at)}</Dato>
            {perfil?.bio ? <Dato etiqueta="Biografía">{perfil.bio}</Dato> : null}
          </dl>
        </Tarjeta>

        <Tarjeta>
          <h2 className="mb-3 text-lg font-semibold">Sesión actual</h2>
          <dl className="divide-y divide-borde">
            <Dato etiqueta="Rol (JWT)">{String(claims?.role ?? "—")}</Dato>
            <Dato etiqueta="Nivel de autenticación">{String(claims?.aal ?? "—").toUpperCase()}</Dato>
            <Dato etiqueta="Token emitido">{fecha(claims?.iat)}</Dato>
            <Dato etiqueta="Token expira">{fecha(claims?.exp)}</Dato>
            <Dato etiqueta="Renovación">El proxy refresca el token automáticamente</Dato>
          </dl>
        </Tarjeta>
      </div>

      <Tarjeta>
        <h2 className="text-lg font-semibold">Cookies de sesión</h2>
        <p className="mb-4 text-sm text-suave">
          Lo que el servidor recibe en cada petición. Todas se emiten con las banderas de seguridad indicadas.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <Insignia ok={SECURE_COOKIE_OPTIONS.httpOnly}>HttpOnly</Insignia>
          <Insignia ok={SECURE_COOKIE_OPTIONS.secure}>
            {SECURE_COOKIE_OPTIONS.secure ? "Secure" : "Secure (solo en producción)"}
          </Insignia>
          <Insignia ok>SameSite={SECURE_COOKIE_OPTIONS.sameSite}</Insignia>
          <Insignia ok>Path=/</Insignia>
        </div>
        <ul className="space-y-2">
          {cookiesSesion.map((c) => (
            <li key={c.nombre} className="flex items-center justify-between rounded-lg bg-fondo px-3 py-2 font-mono text-xs">
              <span className="break-all">{c.nombre}</span>
              <span className="shrink-0 pl-3 text-suave">{c.tamano} bytes · valor oculto</span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-lg font-semibold">Prueba en vivo: ¿puede JavaScript robar tu sesión?</h2>
        <p className="mb-2 text-sm text-suave">
          Este bloque es un Client Component que usa el cliente de Supabase del navegador e intenta leer el token,
          igual que haría un script malicioso inyectado por XSS.
        </p>
        <PruebaSeguridad />
      </Tarjeta>
    </div>
  );
}
