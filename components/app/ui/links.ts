// Enlaces que comparten las pantallas.

import { navHref, type SiteLang } from "@/lib/lang";

/**
 * A donde lleva el botón de un estado vacío («Anótalo desde la app»): la sección
 * de descarga de la landing, en el idioma activo. En la web no se anota ni se edita.
 */
export function appDownloadHref(lang: SiteLang): string {
  return `${navHref("/", lang)}#descargar`;
}
