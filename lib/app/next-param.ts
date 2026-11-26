// El parámetro `next` de /app/entrar (docs/app-web.md §4.3): adónde volver
// después de entrar. Viene de la URL, así que NO es de fiar: un valor mal
// validado abre una redirección abierta (`next=//evil.example`).
//
// Válido = empieza con `/app/`, sigue siendo una ruta de este sitio y de la web
// bajo `/app/` DESPUÉS de normalizarla (`/app/../x` no vale), y no apunta a otra
// ruta de acceso (sería un ciclo). Lo que se devuelve es la ruta ya normalizada,
// no el texto crudo: se navega a lo mismo que se validó.

/** Rutas para quien aún no tiene sesión. Un `next` que apunte a una no sirve. */
export const ACCESS_PATHS: readonly string[] = ["/app/entrar", "/app/crear-cuenta", "/app/recuperar"];

/** `next` aparece en la URL; no hay motivo para aceptar más. */
const MAX_LENGTH = 2048;

/** Un origen que no existe: si tras resolver el valor el origen cambia, apuntaba afuera. */
const BASE = "https://next-param.invalid";

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function trimTrailingSlashes(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function isAccessPath(pathname: string): boolean {
  return ACCESS_PATHS.includes(trimTrailingSlashes(pathname));
}

/**
 * La ruta (con su query) a la que se puede navegar, o `null` si `raw` no es
 * válido y hay que ignorarlo.
 */
export function safeNext(raw: string | null | undefined): string | null {
  if (typeof raw !== "string" || raw === "" || raw.length > MAX_LENGTH) return null;
  if (!raw.startsWith("/app/")) return null;
  // `//` y `/\` son rutas «sin esquema» que el navegador toma por otro sitio;
  // la barra invertida se trata como `/`, y los saltos de línea se descartan al
  // analizar la URL: ninguno tiene sentido en una ruta de la app.
  if (raw.startsWith("//") || raw.includes("\\") || CONTROL_CHARS.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE) return null;

  // Ya normalizada (`..`, `%2e%2e`, `//`): tiene que seguir bajo /app/ y ser
  // más que el /app/ a secas, que redirige a la home (next.config.ts).
  if (!url.pathname.startsWith("/app/") || url.pathname.startsWith("//") || trimTrailingSlashes(url.pathname) === "/app") {
    return null;
  }
  // Lo que Next entiende por esa ruta es la decodificada (`/app/%65ntrar` es
  // `/app/entrar`): se vuelve a revisar ya decodificada.
  let decoded: string;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\\") || CONTROL_CHARS.test(decoded) || decoded.split("/").includes("..")) return null;
  if (isAccessPath(url.pathname) || isAccessPath(decoded)) return null;

  return url.pathname + url.search;
}

/** `?next=` de un `location.search` (con o sin `?`), ya validado. */
export function nextFromSearch(search: string): string | null {
  return safeNext(new URLSearchParams(search).get("next"));
}

/**
 * `/app/entrar?next=<ruta actual>` para mandar a entrar sin perder dónde se
 * estaba. Si la ruta actual no es válida como `next` (por ejemplo, ya es una
 * ruta de acceso), va a `/app/entrar` a secas.
 */
export function entrarHref(current: string | null | undefined): string {
  const next = safeNext(current);
  return next ? `/app/entrar?next=${encodeURIComponent(next)}` : "/app/entrar";
}

/** Adónde mandar a quien ya tiene sesión en una ruta de acceso: el `next` válido o el Pulso. */
export const DEFAULT_AFTER_LOGIN = "/app/pulso";

export function afterLoginHref(search: string): string {
  return nextFromSearch(search) ?? DEFAULT_AFTER_LOGIN;
}
