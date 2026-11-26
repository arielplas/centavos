// Enlaces entre las pantallas de acceso. Llevan el `next` válido, para no
// perder adónde iba la persona al pasar de entrar a crear cuenta o recuperar.
// El idioma no va en la URL: `?lang=` ya quedó en la cookie y la sigue (§9.1).

import { nextFromSearch } from "@/lib/app/next-param";

export type AccessPath = "/app/entrar" | "/app/crear-cuenta" | "/app/recuperar";

/** `path` con el `next` de `search` (un `location.search`), si es válido. */
export function accessHref(path: AccessPath, search: string): string {
  const next = nextFromSearch(search);
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

/** `location.search` en el cliente; vacío si se llama sin navegador. */
export function currentSearch(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}
