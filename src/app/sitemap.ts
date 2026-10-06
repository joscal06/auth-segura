import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicas = [
    { ruta: "", prioridad: 1 },
    { ruta: "/registro", prioridad: 0.8 },
    { ruta: "/login", prioridad: 0.8 },
    { ruta: "/recuperar", prioridad: 0.3 },
  ];
  return publicas.map(({ ruta, prioridad }) => ({
    url: `${SITE_URL}${ruta}`,
    changeFrequency: "monthly",
    priority: prioridad,
  }));
}
