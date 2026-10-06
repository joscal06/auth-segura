import Link from "next/link";
import { obtenerUsuario } from "@/lib/dal";
import { SITE_URL } from "@/lib/env";

const CAPAS = [
  {
    titulo: "Cookies httpOnly",
    texto: "La sesión vive en cookies httpOnly, Secure y SameSite=Lax gestionadas por @supabase/ssr. JavaScript nunca ve el token.",
  },
  {
    titulo: "Server Actions",
    texto: "Registro, inicio y cierre de sesión se ejecutan en el servidor, con validación zod y mensajes de error que no filtran información.",
  },
  {
    titulo: "Proxy (middleware)",
    texto: "Refresca la sesión en cada petición, protege las rutas privadas y redirige según el estado de autenticación.",
  },
  {
    titulo: "Content Security Policy",
    texto: "CSP estricta con nonce por petición: un script inyectado no se ejecuta aunque llegue al HTML.",
  },
  {
    titulo: "Protección CSRF",
    texto: "Server Actions solo por POST con verificación de Origin, cookies SameSite y form-action 'self'.",
  },
  {
    titulo: "Row Level Security",
    texto: "Cada usuario solo puede leer y modificar su propio perfil, aunque la clave pública sea visible.",
  },
];

// Datos estructurados (JSON-LD) para buscadores. Se serializa escapando "<" para que ningún
// valor pueda cerrar la etiqueta <script> (prevención de XSS en datos embebidos).
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cerrojo",
  url: SITE_URL,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description: "Sistema de autenticación seguro con Next.js 16, Supabase y cookies httpOnly.",
  author: { "@type": "Person", name: "José Manuel Calderón González" },
}).replace(/</g, "\\u003c");

export default async function Inicio() {
  const usuario = await obtenerUsuario();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section className="max-w-3xl space-y-6">
        <p className="inline-flex rounded-full bg-marca-suave px-3 py-1 text-xs font-semibold text-marca-fuerte">
          Next.js 16 · Supabase · TypeScript
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Autenticación segura con cookies httpOnly
        </h1>
        <p className="text-lg text-suave">
          Cerrojo demuestra cómo construir un sistema de inicio de sesión profesional donde el token nunca está al
          alcance de JavaScript, las rutas privadas se protegen en el servidor y cada respuesta lleva capas de defensa
          contra XSS y CSRF.
        </p>
        <div className="flex flex-wrap gap-3">
          {usuario ? (
            <Link href="/dashboard" className="rounded-lg bg-marca px-5 py-3 text-sm font-semibold text-white hover:bg-marca-fuerte dark:text-black">
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link href="/registro" className="rounded-lg bg-marca px-5 py-3 text-sm font-semibold text-white hover:bg-marca-fuerte dark:text-black">
                Crear una cuenta
              </Link>
              <Link href="/login" className="rounded-lg border border-borde bg-superficie px-5 py-3 text-sm font-semibold hover:bg-fondo">
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="capas" className="mt-20">
        <h2 id="capas" className="text-2xl font-semibold tracking-tight">
          Capas de seguridad
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPAS.map((capa) => (
            <article key={capa.titulo} className="rounded-2xl border border-borde bg-superficie p-6">
              <h3 className="font-semibold">{capa.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-suave">{capa.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
