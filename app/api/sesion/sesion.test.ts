import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

// Rutas `/api/sesion/*` (docs/app-web.md §6.3): se llaman sus `POST` con `Request`
// y el `fetch` hacia la API está simulado.

process.env.NEXT_PUBLIC_API_URL = "http://api.test";
process.env.NEXT_PUBLIC_SITE_URL = "https://centavos.mx";
const { POST: handover } = await import("./route");
const { POST: refresh } = await import("./refresh/route");
const { POST: logout } = await import("./logout/route");

const SITE = "https://centavos.mx";
const COOKIE = "__Secure-cv_rt";

type ApiCall = { path: string; body: { refreshToken?: string } };
let apiCalls: ApiCall[] = [];
let api: (call: ApiCall) => Response | Promise<Response> = () => {
  throw new TypeError("fetch failed");
};
const realFetch = globalThis.fetch;
const realEnv = { NODE_ENV: process.env.NODE_ENV, VERCEL_ENV: process.env.VERCEL_ENV };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const apiError = (status: number, code: string) => json(status, { error: { code } });

beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { path: new URL(String(input)).pathname, body: JSON.parse(String(init?.body ?? "{}")) };
    apiCalls.push(call);
    return api(call);
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
beforeEach(() => {
  apiCalls = [];
  api = () => {
    throw new TypeError("fetch failed");
  };
  process.env.NEXT_PUBLIC_SITE_URL = SITE;
  process.env.VERCEL_ENV = "production";
  (process.env as Record<string, string | undefined>).NODE_ENV = realEnv.NODE_ENV;
});

function req(
  path: string,
  { origin = SITE, type = "application/json", cookie, body = {}, url = SITE }: {
    origin?: string | null;
    type?: string | null;
    cookie?: string;
    body?: unknown;
    url?: string;
  } = {},
) {
  const headers = new Headers();
  if (origin !== null) headers.set("origin", origin);
  if (type !== null) headers.set("content-type", type);
  if (cookie) headers.set("cookie", cookie);
  return new Request(`${url}${path}`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const setCookie = (response: Response) => response.headers.get("set-cookie") ?? "";
const bodyOf = (response: Response) => response.json() as Promise<Record<string, unknown>>;

describe("POST /api/sesion (traspaso)", () => {
  test("rota el token en la API, guarda el NUEVO en la cookie y devuelve solo el access token", async () => {
    api = () => json(200, { accessToken: "access-2", refreshToken: "refresh-2" });
    const response = await handover(req("/api/sesion", { body: { refreshToken: "refresh-1" } }));

    expect(response.status).toBe(200);
    expect(apiCalls).toEqual([{ path: "/api/auth/refresh", body: { refreshToken: "refresh-1" } }]);
    expect(await bodyOf(response)).toEqual({ accessToken: "access-2" });
    expect(response.headers.get("cache-control")).toBe("no-store");

    const cookie = setCookie(response);
    expect(cookie).toContain(`${COOKIE}=refresh-2`);
    expect(cookie).not.toContain("refresh-1");
    for (const attribute of ["Path=/api/sesion", "HttpOnly", "Secure", "SameSite=Strict", "Max-Age=2592000"]) {
      expect(cookie).toContain(attribute);
    }
  });

  test("un 401 de la API (token ya usado) borra la cookie y responde 401 con el mismo code", async () => {
    api = () => apiError(401, "AUTH_REFRESH_TOKEN_REVOKED");
    const response = await handover(req("/api/sesion", { body: { refreshToken: "seen" }, cookie: `${COOKIE}=old` }));

    expect(response.status).toBe(401);
    expect(await bodyOf(response)).toEqual({ error: { code: "AUTH_REFRESH_TOKEN_REVOKED" } });
    expect(setCookie(response)).toContain(`${COOKIE}=;`);
    expect(setCookie(response)).toContain("Max-Age=0");
    expect(setCookie(response)).toContain("Path=/api/sesion");
  });

  test("cuerpo inválido: 400 sin llamar a la API", async () => {
    expect((await handover(req("/api/sesion", { body: "{no" }))).status).toBe(400);
    expect((await handover(req("/api/sesion", { body: { refreshToken: 5 } }))).status).toBe(400);
    expect(apiCalls).toHaveLength(0);
  });

  test("API caída o 5xx: 502 con el cookie intacta", async () => {
    const down = await handover(req("/api/sesion", { body: { refreshToken: "t" } }));
    expect(down.status).toBe(502);
    expect(setCookie(down)).toBe("");

    api = () => apiError(500, "INTERNAL");
    const failing = await handover(req("/api/sesion", { body: { refreshToken: "t" } }));
    expect(failing.status).toBe(502);
    expect(setCookie(failing)).toBe("");
  });

  test("un 429 pasa tal cual y no borra la cookie", async () => {
    api = () => apiError(429, "RATE_LIMIT");
    const response = await handover(req("/api/sesion", { body: { refreshToken: "t" } }));
    expect(response.status).toBe(429);
    expect(await bodyOf(response)).toEqual({ error: { code: "RATE_LIMIT" } });
    expect(setCookie(response)).toBe("");
  });
});

describe("POST /api/sesion/refresh", () => {
  test("lee la cookie, rota y reescribe la cookie con el token nuevo", async () => {
    api = () => json(200, { accessToken: "access-3", refreshToken: "refresh-3" });
    const response = await refresh(req("/api/sesion/refresh", { cookie: `other=1; ${COOKIE}=refresh-2; x=y` }));

    expect(response.status).toBe(200);
    expect(apiCalls).toEqual([{ path: "/api/auth/refresh", body: { refreshToken: "refresh-2" } }]);
    expect(await bodyOf(response)).toEqual({ accessToken: "access-3" });
    expect(setCookie(response)).toContain(`${COOKIE}=refresh-3`);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("sin cookie: 401 AUTH_REFRESH_TOKEN_NOT_FOUND y no llama a la API", async () => {
    const response = await refresh(req("/api/sesion/refresh"));
    expect(response.status).toBe(401);
    expect(await bodyOf(response)).toEqual({ error: { code: "AUTH_REFRESH_TOKEN_NOT_FOUND" } });
    expect(apiCalls).toHaveLength(0);
  });

  for (const code of ["AUTH_REFRESH_TOKEN_NOT_FOUND", "AUTH_REFRESH_TOKEN_REVOKED", "AUTH_REFRESH_TOKEN_EXPIRED"]) {
    test(`un 401 ${code} borra la cookie y devuelve el mismo code`, async () => {
      api = () => apiError(401, code);
      const response = await refresh(req("/api/sesion/refresh", { cookie: `${COOKIE}=stale` }));
      expect(response.status).toBe(401);
      expect(await bodyOf(response)).toEqual({ error: { code } });
      expect(setCookie(response)).toContain("Max-Age=0");
    });
  }

  test("sin red hacia la API: 502 y la cookie se conserva (la sesión no se pierde)", async () => {
    const response = await refresh(req("/api/sesion/refresh", { cookie: `${COOKIE}=keep` }));
    expect(response.status).toBe(502);
    expect(setCookie(response)).toBe("");
  });

  test("un token con caracteres especiales viaja codificado en la cookie y sin cambios a la API", async () => {
    api = () => json(200, { accessToken: "a", refreshToken: "t+/=; x" });
    const first = await refresh(req("/api/sesion/refresh", { cookie: `${COOKIE}=old` }));
    const cookie = setCookie(first).split(";")[0]!;
    expect(cookie).toBe(`${COOKIE}=${encodeURIComponent("t+/=; x")}`);

    await refresh(req("/api/sesion/refresh", { cookie }));
    expect(apiCalls[1]!.body.refreshToken).toBe("t+/=; x");
  });
});

describe("POST /api/sesion/logout", () => {
  test("revoca en la API, borra la cookie y responde 204", async () => {
    api = () => json(200, { message: "ok" });
    const response = await logout(req("/api/sesion/logout", { cookie: `${COOKIE}=refresh-9` }));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(apiCalls).toEqual([{ path: "/api/auth/logout", body: { refreshToken: "refresh-9" } }]);
    expect(setCookie(response)).toContain("Max-Age=0");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("borra la cookie aunque la API falle (red o 500)", async () => {
    const down = await logout(req("/api/sesion/logout", { cookie: `${COOKIE}=t` }));
    expect(down.status).toBe(204);
    expect(setCookie(down)).toContain("Max-Age=0");

    api = () => apiError(500, "INTERNAL");
    const failing = await logout(req("/api/sesion/logout", { cookie: `${COOKIE}=t` }));
    expect(failing.status).toBe(204);
    expect(setCookie(failing)).toContain("Max-Age=0");
  });

  test("sin cookie: 204 y no llama a la API", async () => {
    const response = await logout(req("/api/sesion/logout"));
    expect(response.status).toBe(204);
    expect(apiCalls).toHaveLength(0);
  });
});

describe("CSRF (§6.3)", () => {
  const routes = [
    ["/api/sesion", handover],
    ["/api/sesion/refresh", refresh],
    ["/api/sesion/logout", logout],
  ] as const;

  for (const [path, handler] of routes) {
    test(`${path}: Origin ajeno, ausente o Content-Type distinto dan 403 sin tocar la API ni la cookie`, async () => {
      const cookie = `${COOKIE}=t`;
      const bad = [
        req(path, { origin: "https://evil.example", cookie, body: { refreshToken: "t" } }),
        req(path, { origin: null, cookie, body: { refreshToken: "t" } }),
        req(path, { type: "text/plain", cookie, body: { refreshToken: "t" } }),
        req(path, { type: "application/x-www-form-urlencoded", cookie, body: "refreshToken=t" }),
        req(path, { type: null, cookie, body: { refreshToken: "t" } }),
        // Mismo host, otro esquema o puerto: no es el mismo origen.
        req(path, { origin: "http://centavos.mx", cookie, body: { refreshToken: "t" } }),
        req(path, { origin: "https://centavos.mx:8443", cookie, body: { refreshToken: "t" } }),
        // El origen de la propia petición NO vale en producción.
        req(path, { origin: "https://preview.vercel.app", url: "https://preview.vercel.app", cookie, body: { refreshToken: "t" } }),
      ];
      for (const request of bad) {
        const response = await handler(request);
        expect(response.status).toBe(403);
        expect(await bodyOf(response)).toEqual({ error: { code: "FORBIDDEN" } });
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(setCookie(response)).toBe("");
      }
      expect(apiCalls).toHaveLength(0);
    });
  }

  test("acepta `application/json; charset=utf-8`", async () => {
    api = () => json(200, { accessToken: "a", refreshToken: "r" });
    const response = await refresh(req("/api/sesion/refresh", { type: "application/json; charset=utf-8", cookie: `${COOKIE}=t` }));
    expect(response.status).toBe(200);
  });

  test("preview y local: vale el origen de la propia petición", async () => {
    process.env.VERCEL_ENV = "preview";
    api = () => json(200, { accessToken: "a", refreshToken: "r" });
    const preview = "https://centavos-git-x.vercel.app";
    const ok = await refresh(req("/api/sesion/refresh", { origin: preview, url: preview, cookie: `${COOKIE}=t` }));
    expect(ok.status).toBe(200);

    delete process.env.VERCEL_ENV;
    const local = "http://localhost:3002";
    const okLocal = await refresh(req("/api/sesion/refresh", { origin: local, url: local, cookie: `${COOKIE}=t` }));
    expect(okLocal.status).toBe(200);

    // Aun en preview, un origen ajeno sigue fuera.
    const evil = await refresh(req("/api/sesion/refresh", { origin: "https://evil.example", url: local, cookie: `${COOKIE}=t` }));
    expect(evil.status).toBe(403);
  });
});

describe("cookie en desarrollo local", () => {
  test("NODE_ENV=development: `cv_rt` sin Secure (Safari rechaza `Secure` en http); lo demás igual", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    delete process.env.VERCEL_ENV;
    const local = "http://localhost:3002";
    api = () => json(200, { accessToken: "a", refreshToken: "r2" });

    const response = await handover(req("/api/sesion", { origin: local, url: local, body: { refreshToken: "r1" } }));
    const cookie = setCookie(response);
    expect(cookie).toStartWith("cv_rt=r2;");
    expect(cookie).not.toContain("Secure");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/api/sesion");

    // Y la lee con ese nombre.
    const next = await refresh(req("/api/sesion/refresh", { origin: local, url: local, cookie: "cv_rt=r2" }));
    expect(next.status).toBe(200);
    expect(apiCalls[1]!.body.refreshToken).toBe("r2");
  });
});
