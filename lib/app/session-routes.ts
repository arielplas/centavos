// Utilidades de las rutas `/api/sesion/*` (docs/app-web.md §6.3, opción B). Solo servidor.
//
// La cookie `__Secure-cv_rt` guarda el refresh token. JavaScript no la lee
// (`HttpOnly`) y solo viaja a `/api/sesion/*` (`Path`, `SameSite=Strict`).
// Estas rutas no mandan headers CORS: ningún sitio ajeno puede leer la respuesta.

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días, igual que el refresh token
const COOKIE_PATH = "/api/sesion";
const UPSTREAM_TIMEOUT_MS = 10_000;

/**
 * En `next dev` sobre `http` algunos navegadores (Safari) rechazan las cookies
 * `Secure`, y `__Secure-` las exige: solo ahí se usa `cv_rt` sin `Secure`.
 * En cualquier otro caso, el nombre y los atributos de §6.3.
 */
function insecureDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function cookieName(): string {
  return insecureDev() ? "cv_rt" : "__Secure-cv_rt";
}

function cookieString(value: string, maxAge: number): string {
  return [
    `${cookieName()}=${value}`,
    `Path=${COOKIE_PATH}`,
    "HttpOnly",
    ...(insecureDev() ? [] : ["Secure"]),
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

/** Lo que lleva la respuesta para poner (o borrar) la cookie. */
export const setCookieHeader = (refreshToken: string) => cookieString(encodeURIComponent(refreshToken), COOKIE_MAX_AGE);
export const clearCookieHeader = () => cookieString("", 0);

export function readRefreshCookie(request: Request): string | null {
  const name = cookieName();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index === -1 || part.slice(0, index).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(index + 1).trim()) || null;
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Respuestas ────────────────────────────────────────────────────────────

type ResponseOptions = { cookie?: string };

function build(status: number, body: unknown, { cookie }: ResponseOptions = {}): Response {
  const headers = new Headers({ "cache-control": "no-store" });
  if (cookie) headers.append("set-cookie", cookie);
  if (body === null) return new Response(null, { status, headers });
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { status, headers });
}

export const ok = (body: unknown, options?: ResponseOptions) => build(200, body, options);
export const noContent = (options?: ResponseOptions) => build(204, null, options);
/** Mismo contrato de error que la API: `{ error: { code } }`. */
export const fail = (status: number, code: string, options?: ResponseOptions) => build(status, { error: { code } }, options);

// ─── CSRF (§6.3) ───────────────────────────────────────────────────────────

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Exige `Content-Type: application/json` y un `Origin` igual a
 * `NEXT_PUBLIC_SITE_URL`. En preview y en local (todo lo que no es el
 * despliegue de producción de Vercel) también vale el origen de la propia
 * petición. Devuelve la respuesta 403, o `null` si pasa.
 */
export function rejectCrossSite(request: Request): Response | null {
  const type = (request.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
  if (type !== "application/json") return fail(403, "FORBIDDEN");

  const origin = request.headers.get("origin");
  if (!origin) return fail(403, "FORBIDDEN");

  const allowed = new Set<string>();
  const site = originOf(process.env.NEXT_PUBLIC_SITE_URL || "https://centavos.mx");
  if (site) allowed.add(site);
  if (process.env.VERCEL_ENV !== "production") {
    const own = originOf(request.url);
    if (own) allowed.add(own);
  }
  return allowed.has(origin) ? null : fail(403, "FORBIDDEN");
}

// ─── La API, desde el servidor ─────────────────────────────────────────────

export type Tokens = { accessToken: string; refreshToken: string };

export type Upstream =
  | { kind: "ok"; tokens: Tokens }
  | { kind: "error"; status: number; code: string }
  /** Sin respuesta, 5xx o un cuerpo que no es el contrato. */
  | { kind: "unavailable" };

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
}

async function callApi(path: string, refreshToken: string): Promise<Response | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    return await fetch(`${base}/api${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return null;
  }
}

/** `POST {API}/api/auth/refresh`: rota. El token que se mandó ya no sirve. */
export async function refreshUpstream(refreshToken: string): Promise<Upstream> {
  const response = await callApi("/auth/refresh", refreshToken);
  if (response === null) return { kind: "unavailable" };
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (response.ok) {
    return typeof body?.accessToken === "string" && typeof body.refreshToken === "string"
      ? { kind: "ok", tokens: { accessToken: body.accessToken, refreshToken: body.refreshToken } }
      : { kind: "unavailable" };
  }
  if (response.status >= 500) return { kind: "unavailable" };
  const code = (body?.error as { code?: unknown } | undefined)?.code;
  return { kind: "error", status: response.status, code: typeof code === "string" ? code : "UNKNOWN" };
}

/** `POST {API}/api/auth/logout`. Mejor esfuerzo: nunca lanza. */
export async function logoutUpstream(refreshToken: string): Promise<void> {
  await callApi("/auth/logout", refreshToken);
}

/**
 * Convierte lo que respondió la API en la respuesta de la ruta. Con un 401 la
 * sesión ya no sirve: se borra la cookie y se devuelve el mismo `code`. Otros
 * 4xx (429…) pasan tal cual y conservan la cookie; lo demás es un 502.
 */
export function respondToUpstream(result: Upstream): Response {
  if (result.kind === "ok") {
    return ok({ accessToken: result.tokens.accessToken }, { cookie: setCookieHeader(result.tokens.refreshToken) });
  }
  if (result.kind === "unavailable") return fail(502, "INTERNAL");
  if (result.status === 401) return fail(401, result.code, { cookie: clearCookieHeader() });
  return fail(result.status, result.code);
}
