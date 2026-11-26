import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

// El SessionStore de la opción B (docs/app-web.md §5.6, §5.7, §6.3), con un
// navegador simulado: `fetch` a las rutas, Web Locks, BroadcastChannel y localStorage.

process.env.NEXT_PUBLIC_API_URL = "http://api.test";
const { ApiError } = await import("./api");
const { createCookieSessionStore } = await import("./session-cookie-store");
const { SessionManager } = await import("./session");
type CookieStoreEnv = import("./session-cookie-store").CookieStoreEnv;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const err = (status: number, code: string) => json(status, { error: { code } });

type Call = { url: string; body: Record<string, unknown>; keepalive?: boolean };

/** Un «navegador»: las pestañas comparten cookie (el servidor), localStorage y el bus. */
function makeBrowser() {
  const calls: Call[] = [];
  const server: { handler: (call: Call) => Response | Promise<Response> } = { handler: () => err(401, "AUTH_REFRESH_TOKEN_NOT_FOUND") };
  const storage = new Map<string, string>();
  const listeners = new Set<{ owner: object; fn: (event: MessageEvent) => void }>();
  let lockTail: Promise<unknown> = Promise.resolve();
  let lockHolders = 0;
  let maxHolders = 0;

  const tab = (overrides: Partial<CookieStoreEnv> = {}): CookieStoreEnv => {
    const owner = {};
    return {
      fetch: async (url, init) => {
        const call: Call = { url, body: JSON.parse(String(init?.body ?? "{}")), keepalive: init?.keepalive };
        calls.push(call);
        return server.handler(call);
      },
      locks: {
        request: ((_name: string, task: () => Promise<unknown>) => {
          const run = lockTail.then(async () => {
            lockHolders++;
            maxHolders = Math.max(maxHolders, lockHolders);
            try {
              return await task();
            } finally {
              lockHolders--;
            }
          });
          lockTail = run.catch(() => {});
          return run;
        }) as LockManager["request"],
      },
      channel: () => ({
        postMessage: (data: unknown) => {
          for (const l of listeners) if (l.owner !== owner) queueMicrotask(() => l.fn({ data } as MessageEvent));
        },
        addEventListener: (_type: string, fn: EventListenerOrEventListenerObject) => {
          listeners.add({ owner, fn: fn as (event: MessageEvent) => void });
        },
        removeEventListener: (_type: string, fn: EventListenerOrEventListenerObject) => {
          for (const l of listeners) if (l.fn === fn) listeners.delete(l);
        },
      }),
      storage: {
        getItem: (k) => storage.get(k) ?? null,
        setItem: (k, v) => void storage.set(k, v),
        removeItem: (k) => void storage.delete(k),
      },
      warn: () => {},
      ...overrides,
    };
  };

  return { calls, server, storage, tab, maxHolders: () => maxHolders };
}

// Las llamadas directas a la API (modo memoria) pasan por el `fetch` global.
const apiCalls: Call[] = [];
let apiHandler: (call: Call) => Response = () => err(401, "AUTH_REFRESH_TOKEN_NOT_FOUND");
const realFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call: Call = { url: String(input), body: JSON.parse(String(init?.body ?? "{}")) };
    apiCalls.push(call);
    return apiHandler(call);
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
beforeEach(() => {
  apiCalls.length = 0;
  apiHandler = () => err(401, "AUTH_REFRESH_TOKEN_NOT_FOUND");
});

const tokens = { accessToken: "access-1", refreshToken: "refresh-1" };

describe("adopt (traspaso)", () => {
  test("manda el refresh token a /api/sesion y devuelve el access token ROTADO", async () => {
    const b = makeBrowser();
    b.server.handler = () => json(200, { accessToken: "access-2" });
    const store = createCookieSessionStore(b.tab());
    expect(await store.adopt(tokens)).toEqual({ accessToken: "access-2" });
    expect(b.calls).toEqual([{ url: "/api/sesion", body: { refreshToken: "refresh-1" }, keepalive: undefined }]);
  });

  test("401: lanza ApiError y no reintenta ni cae a memoria", async () => {
    const b = makeBrowser();
    b.server.handler = () => err(401, "AUTH_REFRESH_TOKEN_REVOKED");
    const store = createCookieSessionStore(b.tab());
    const error = await store.adopt(tokens).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("AUTH_REFRESH_TOKEN_REVOKED");
    expect(b.calls).toHaveLength(1);
    // Sin memoria de respaldo: un refresh después no tiene con qué.
    expect((await store.refresh().catch((e) => e)).status).toBe(401);
  });

  test("red o 5xx: reintenta una vez y, si vuelve a fallar, sigue SOLO en memoria sin error", async () => {
    const b = makeBrowser();
    let failures = 0;
    b.server.handler = (call) => {
      if (call.url === "/api/sesion") {
        failures++;
        return err(502, "INTERNAL");
      }
      return err(401, "AUTH_REFRESH_TOKEN_NOT_FOUND");
    };
    const store = createCookieSessionStore(b.tab());
    expect(await store.adopt(tokens)).toEqual({ accessToken: "access-1" });
    expect(failures).toBe(2);

    // El refresh va directo a la API con el token en memoria y lo rota.
    apiHandler = () => json(200, { accessToken: "access-9", refreshToken: "refresh-9" });
    expect(await store.refresh()).toEqual({ accessToken: "access-9" });
    expect(apiCalls[0]).toMatchObject({ url: "http://api.test/api/auth/refresh", body: { refreshToken: "refresh-1" } });
    await store.refresh();
    expect(apiCalls[1]!.body.refreshToken).toBe("refresh-9");
    expect(b.calls.filter((c) => c.url === "/api/sesion/refresh")).toHaveLength(0);
  });

  test("si el segundo intento del traspaso funciona, queda en cookie", async () => {
    const b = makeBrowser();
    let n = 0;
    b.server.handler = () => (++n === 1 ? err(503, "INTERNAL") : json(200, { accessToken: "access-2" }));
    const store = createCookieSessionStore(b.tab());
    expect(await store.adopt(tokens)).toEqual({ accessToken: "access-2" });
    expect(n).toBe(2);
  });
});

describe("restore y refresh", () => {
  test("restore: la cookie vale, devuelve el access token", async () => {
    const b = makeBrowser();
    b.server.handler = () => json(200, { accessToken: "access-5" });
    expect(await createCookieSessionStore(b.tab()).restore()).toEqual({ accessToken: "access-5" });
    expect(b.calls[0]!.url).toBe("/api/sesion/refresh");
  });

  test("restore: un 401 (sin cookie, vencida o revocada) es «no hay sesión», no un error", async () => {
    const b = makeBrowser();
    for (const code of ["AUTH_REFRESH_TOKEN_NOT_FOUND", "AUTH_REFRESH_TOKEN_EXPIRED"]) {
      b.server.handler = () => err(401, code);
      expect(await createCookieSessionStore(b.tab()).restore()).toBeNull();
    }
  });

  test("restore: sin red lanza (el manager decide), no confunde con «sin sesión»", async () => {
    const b = makeBrowser();
    b.server.handler = () => {
      throw new TypeError("fetch failed");
    };
    const error = await createCookieSessionStore(b.tab()).restore().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("NETWORK");
  });

  test("refresh: llamadas simultáneas comparten una sola petición", async () => {
    const b = makeBrowser();
    b.server.handler = async () => {
      await new Promise((r) => setTimeout(r, 5));
      return json(200, { accessToken: "access-7" });
    };
    const store = createCookieSessionStore(b.tab());
    const results = await Promise.all([store.refresh(), store.refresh(), store.restore()]);
    expect(results.map((r) => r?.accessToken)).toEqual(["access-7", "access-7", "access-7"]);
    expect(b.calls).toHaveLength(1);
    // Terminada, la siguiente vuelve a pedir.
    await store.refresh();
    expect(b.calls).toHaveLength(2);
  });

  test("REVOKED: otra pestaña ya rotó la cookie, se reintenta UNA vez y funciona", async () => {
    const b = makeBrowser();
    let n = 0;
    b.server.handler = () => (++n === 1 ? err(401, "AUTH_REFRESH_TOKEN_REVOKED") : json(200, { accessToken: "access-8" }));
    expect(await createCookieSessionStore(b.tab()).refresh()).toEqual({ accessToken: "access-8" });
    expect(n).toBe(2);
  });

  test("REVOKED dos veces: falla con REVOKED (el manager cierra la sesión); solo hubo un reintento", async () => {
    const b = makeBrowser();
    b.server.handler = () => err(401, "AUTH_REFRESH_TOKEN_REVOKED");
    const error = await createCookieSessionStore(b.tab()).refresh().catch((e) => e);
    expect(error.code).toBe("AUTH_REFRESH_TOKEN_REVOKED");
    expect(b.calls).toHaveLength(2);
  });

  test("NOT_FOUND y EXPIRED no se reintentan", async () => {
    for (const code of ["AUTH_REFRESH_TOKEN_NOT_FOUND", "AUTH_REFRESH_TOKEN_EXPIRED"]) {
      const b = makeBrowser();
      b.server.handler = () => err(401, code);
      const error = await createCookieSessionStore(b.tab()).refresh().catch((e) => e);
      expect(error.code).toBe(code);
      expect(b.calls).toHaveLength(1);
    }
  });

  test("Web Locks: dos pestañas refrescan una a la vez, y ninguna cierra sesión", async () => {
    const b = makeBrowser();
    // El servidor rota de verdad: un token se usa una sola vez.
    let current = "t0";
    let seq = 0;
    let active = 0;
    let overlapped = false;
    b.server.handler = async () => {
      active++;
      if (active > 1) overlapped = true;
      await new Promise((r) => setTimeout(r, 5));
      active--;
      const next = `t${++seq}`;
      current = next;
      return json(200, { accessToken: `access-${next}` });
    };
    const a = createCookieSessionStore(b.tab());
    const c = createCookieSessionStore(b.tab());
    const [ra, rc] = await Promise.all([a.refresh(), c.refresh()]);
    expect(overlapped).toBe(false);
    expect(b.maxHolders()).toBe(1);
    expect(new Set([ra.accessToken, rc.accessToken]).size).toBe(2);
    expect(current).toBe("t2");
  });

  test("sin Web Locks sigue funcionando (y el REVOKED se cubre con el reintento)", async () => {
    const b = makeBrowser();
    b.server.handler = () => json(200, { accessToken: "access-1" });
    const store = createCookieSessionStore(b.tab({ locks: null }));
    expect(await store.refresh()).toEqual({ accessToken: "access-1" });
  });
});

describe("logout", () => {
  test("espera a /api/sesion/logout con keepalive y avisa a las otras pestañas", async () => {
    const b = makeBrowser();
    b.server.handler = () => new Response(null, { status: 204 });
    const a = createCookieSessionStore(b.tab());
    const other = createCookieSessionStore(b.tab());
    const events: string[] = [];
    other.subscribe!((e) => events.push(e));

    await a.logout();
    await Promise.resolve();
    expect(b.calls).toEqual([{ url: "/api/sesion/logout", body: {}, keepalive: true }]);
    expect(events).toEqual(["signed-out"]);
    expect(b.storage.has("centavos.logoutPending")).toBe(false);
  });

  test("la petición no llega (sin red): guarda la marca y NO lanza", async () => {
    const b = makeBrowser();
    b.server.handler = () => {
      throw new TypeError("fetch failed");
    };
    await createCookieSessionStore(b.tab()).logout();
    expect(b.storage.get("centavos.logoutPending")).toBe("1");
  });

  test("una respuesta de error (la ruta ya borró la cookie) no deja marca", async () => {
    const b = makeBrowser();
    b.server.handler = () => err(500, "INTERNAL");
    await createCookieSessionStore(b.tab()).logout();
    expect(b.storage.has("centavos.logoutPending")).toBe(false);
  });

  test("con la marca puesta, restore cierra primero, la borra y NO revive la sesión", async () => {
    const b = makeBrowser();
    b.storage.set("centavos.logoutPending", "1");
    b.server.handler = (call) =>
      call.url === "/api/sesion/logout" ? new Response(null, { status: 204 }) : json(200, { accessToken: "revived" });
    expect(await createCookieSessionStore(b.tab()).restore()).toBeNull();
    expect(b.calls.map((c) => c.url)).toEqual(["/api/sesion/logout"]);
    expect(b.storage.has("centavos.logoutPending")).toBe(false);
  });

  test("con la marca y sin red, la marca se queda para la próxima carga", async () => {
    const b = makeBrowser();
    b.storage.set("centavos.logoutPending", "1");
    b.server.handler = () => {
      throw new TypeError("fetch failed");
    };
    expect(await createCookieSessionStore(b.tab()).restore()).toBeNull();
    expect(b.storage.get("centavos.logoutPending")).toBe("1");
  });

  test("un inicio de sesión nuevo borra la marca", async () => {
    const b = makeBrowser();
    b.storage.set("centavos.logoutPending", "1");
    b.server.handler = () => json(200, { accessToken: "a2" });
    await createCookieSessionStore(b.tab()).adopt(tokens);
    expect(b.storage.has("centavos.logoutPending")).toBe(false);
  });

  test("en modo memoria también revoca el token que tenía la pestaña, en la API", async () => {
    const b = makeBrowser();
    b.server.handler = (call) => (call.url === "/api/sesion" ? err(502, "INTERNAL") : new Response(null, { status: 204 }));
    apiHandler = () => json(200, { message: "ok" });
    const store = createCookieSessionStore(b.tab());
    await store.adopt(tokens);
    await store.logout();
    expect(apiCalls.map((c) => [c.url, c.body.refreshToken])).toEqual([["http://api.test/api/auth/logout", "refresh-1"]]);
  });
});

describe("BroadcastChannel entre pestañas", () => {
  test("un inicio de sesión se avisa a las otras pestañas y no a la propia", async () => {
    const b = makeBrowser();
    b.server.handler = () => json(200, { accessToken: "a2" });
    const a = createCookieSessionStore(b.tab());
    const other = createCookieSessionStore(b.tab());
    const own: string[] = [];
    const remote: string[] = [];
    a.subscribe!((e) => own.push(e));
    const stop = other.subscribe!((e) => remote.push(e));

    await a.adopt(tokens);
    await Promise.resolve();
    expect(remote).toEqual(["signed-in"]);
    expect(own).toEqual([]);

    stop();
    await a.adopt(tokens);
    await Promise.resolve();
    expect(remote).toEqual(["signed-in"]);
  });
});

describe("SessionManager con el store de cookie, dos pestañas", () => {
  const me = { id: "u1", name: "Ana", email: "ana@centavos.mx", currency: "MXN", onboarded: true };

  test("cerrar sesión en una pestaña cierra la otra, sin motivo de error (S-5)", async () => {
    const b = makeBrowser();
    b.server.handler = (call) => {
      if (call.url === "/api/sesion/refresh") return json(200, { accessToken: "access-x" });
      return new Response(null, { status: 204 });
    };
    apiHandler = (call) => (call.url.endsWith("/me") ? json(200, me) : json(200, { message: "ok" }));
    const one = new SessionManager({ store: createCookieSessionStore(b.tab()), logoutTimeoutMs: 100 });
    const two = new SessionManager({ store: createCookieSessionStore(b.tab()), logoutTimeoutMs: 100 });
    await Promise.all([one.start(), two.start()]);
    expect(one.getSnapshot().status).toBe("authenticated");
    expect(two.getSnapshot().status).toBe("authenticated");

    await one.signOut();
    await new Promise((r) => setTimeout(r, 0));
    expect(two.getSnapshot()).toMatchObject({ status: "anonymous", user: null, endedReason: null });
    expect(two.getAccessToken()).toBeNull();
  });

  test("entrar en una pestaña anónima actualiza a la otra", async () => {
    const b = makeBrowser();
    let signedIn = false;
    b.server.handler = (call) => {
      if (call.url === "/api/sesion") {
        signedIn = true;
        return json(200, { accessToken: "access-n" });
      }
      return signedIn ? json(200, { accessToken: "access-r" }) : err(401, "AUTH_REFRESH_TOKEN_NOT_FOUND");
    };
    apiHandler = () => json(200, me);
    const one = new SessionManager({ store: createCookieSessionStore(b.tab()) });
    const two = new SessionManager({ store: createCookieSessionStore(b.tab()) });
    await Promise.all([one.start(), two.start()]);
    expect(two.getSnapshot().status).toBe("anonymous");

    await one.signIn({ ...tokens, user: me } as never);
    await new Promise((r) => setTimeout(r, 10));
    expect(one.getSnapshot().status).toBe("authenticated");
    expect(two.getSnapshot().status).toBe("authenticated");
    expect(two.getAccessToken()).toBe("access-r");
  });
});
