import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Fechas fijas por página: si `lastModified` cambia en cada build sin que cambie
// el contenido, Google aprende a ignorarlo. Actualízalas cuando edites la página.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`,                    lastModified: new Date("2026-09-07"), changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE.url}/meses-sin-intereses`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/app/soporte`,         lastModified: new Date("2026-09-07"), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE.url}/app/privacidad`,      lastModified: new Date("2026-06-11"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE.url}/app/terminos`,        lastModified: new Date("2026-06-11"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE.url}/app/eliminar-cuenta`, lastModified: new Date("2026-06-12"), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
