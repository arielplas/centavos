import type { MetadataRoute } from "next";
import { langAlternates } from "@/lib/lang";
import { SITE } from "@/lib/seo";

/** Absolute URLs for the hreflang alternates of a bilingual page. */
function absoluteAlternates(path: string) {
  return Object.fromEntries(
    Object.entries(langAlternates(path)).map(([hreflang, href]) => [hreflang, `${SITE.url}${href}`]),
  );
}

// Fixed dates per page: if `lastModified` changes on every build without the
// content changing, Google learns to ignore it. Update them when you edit the
// page.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.url}/`,
      lastModified: new Date("2026-11-12"),
      changeFrequency: "monthly",
      priority: 1.0,
      alternates: { languages: absoluteAlternates("/") },
    },
    {
      url: `${SITE.url}/?lang=en`,
      lastModified: new Date("2026-11-11"),
      changeFrequency: "monthly",
      priority: 1.0,
      alternates: { languages: absoluteAlternates("/") },
    },
    { url: `${SITE.url}/meses-sin-intereses`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/aguinaldo`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/finiquito`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/vacaciones`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/ptu`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/cetes`, lastModified: new Date("2026-09-11"), changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITE.url}/gastos-hormiga`,
      lastModified: new Date("2026-11-12"),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: absoluteAlternates("/gastos-hormiga") },
    },
    {
      url: `${SITE.url}/gastos-hormiga?lang=en`,
      lastModified: new Date("2026-11-12"),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: absoluteAlternates("/gastos-hormiga") },
    },
    { url: `${SITE.url}/app/soporte`,         lastModified: new Date("2026-09-07"), changeFrequency: "yearly",  priority: 0.5 },
    {
      url: `${SITE.url}/app/privacidad`,
      lastModified: new Date("2026-11-10"),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: { languages: absoluteAlternates("/app/privacidad") },
    },
    {
      url: `${SITE.url}/app/privacidad?lang=en`,
      lastModified: new Date("2026-11-10"),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: { languages: absoluteAlternates("/app/privacidad") },
    },
    {
      url: `${SITE.url}/app/terminos`,
      lastModified: new Date("2026-11-10"),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: { languages: absoluteAlternates("/app/terminos") },
    },
    {
      url: `${SITE.url}/app/terminos?lang=en`,
      lastModified: new Date("2026-11-10"),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: { languages: absoluteAlternates("/app/terminos") },
    },
    { url: `${SITE.url}/app/eliminar-cuenta`, lastModified: new Date("2026-06-12"), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
