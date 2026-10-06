import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad estáticas aplicadas a todas las rutas.
 * La Content-Security-Policy se genera por petición en `src/proxy.ts`
 * porque necesita un nonce único.
 */
const securityHeaders = [
  // Fuerza HTTPS durante 2 años (incluye subdominios).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Evita que el navegador "adivine" tipos MIME (mitiga XSS por contenido mal servido).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Protección contra clickjacking (refuerza frame-ancestors de la CSP).
  { key: "X-Frame-Options", value: "DENY" },
  // No filtra rutas internas a sitios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva APIs del navegador que la app no usa.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Aísla la ventana de otros orígenes (mitiga ataques tipo Spectre / tabnabbing).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // No anunciar la tecnología del servidor.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Los formularios de autenticación son pequeños: limitar el cuerpo reduce superficie de abuso.
      bodySizeLimit: "100kb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
