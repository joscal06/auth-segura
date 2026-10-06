import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Navegacion } from "@/components/Navegacion";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const descripcion =
  "Sistema de autenticación seguro con Next.js 16 y Supabase: cookies httpOnly, Server Actions, " +
  "protección contra XSS y CSRF, Content Security Policy y rutas protegidas por middleware.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Cerrojo — Autenticación segura con Next.js y Supabase", template: "%s · Cerrojo" },
  description: descripcion,
  applicationName: "Cerrojo",
  keywords: ["Next.js", "Supabase", "autenticación", "cookies httpOnly", "seguridad web", "CSRF", "XSS", "Server Actions"],
  authors: [{ name: "José Manuel Calderón González" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_SV",
    url: "/",
    siteName: "Cerrojo",
    title: "Cerrojo — Autenticación segura con Next.js y Supabase",
    description: descripcion,
  },
  twitter: { card: "summary_large_image", title: "Cerrojo", description: descripcion },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1014" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Leer las cabeceras fuerza el renderizado dinámico: cada respuesta lleva el nonce de la CSP
  // generado por el proxy (una página estática tendría scripts sin nonce y la CSP los bloquearía).
  await headers();

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2">
          Saltar al contenido
        </a>
        <Navegacion />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-borde py-6 text-center text-xs text-suave">
          Cerrojo · Next.js 16 + Supabase · Proyecto académico de seguridad web
        </footer>
      </body>
    </html>
  );
}
