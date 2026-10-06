import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Las rutas privadas y de callback no deben indexarse.
      disallow: ["/dashboard", "/perfil", "/actualizar-contrasena", "/auth/", "/verificar-email"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
