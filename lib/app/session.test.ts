import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

process.env.NEXT_PUBLIC_API_URL = "http://api.test";
const { ApiError } = await import("./api");
const { SessionManager, createMemorySessionStore, afterLoginTarget, welcomeHref } = await import("./session");
type SessionStore = import("./session").SessionStore;

type Call = { path: string; method: string; body: unknown; auth: string | null };
let calls: Call[] = [];
let handlers: Record<string, (call: Call) => Response | Promise<Response>> = {};
const realFetch = globalThis.fetch;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const call: Call = {
      path: url.pathname,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(init.body as string) : undefined,
      auth: headers.authorization ?? null,
    };
    calls.push(call);
    const handler = handlers[`${call.method} ${call.path}`];
    if (!handler) throw new TypeError("fetch failed");
    return handler(call);
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
beforeEach(() => {
  calls = [];
  handlers = {};
});

const login = (n = 1) => ({
  accessToken: `access-${n}`,
  refreshToken: `refresh-${n}`,
  user: { id: "u1", name: "Ana", email: "ana@centavos.mx", currency: "MXN", onboarded: true },
});
const me = { id: "u1", name: "Ana", email: "ana@centavos.mx", currency: "MXN", onboarded: true, language: "en", plan: "free" };
const manager = (store: SessionStore = createMemorySessionStore()) => new SessionManager({ store, logoutTimeoutMs: 20 });

describe("arranque", () => {
  test("empieza en restoring y la fase 0 termina en anonymous", async () => {
    const m = manager();
    expect(m.getSnapshot().status).toBe("restoring");
    await m.start();
    expect(m.getSnapshot()).toMatchObject({ status: "anonymous", user: null, endedReason: null, loggedOut: false });
  });

  test("start es idempotente: StrictMode no restaura dos veces", async () => {
    let restores = 0;
    const store: SessionStore = { ...createMemorySessionStore(), restore: async () => (restores++, null) };
    const m = manager(store);
    await Promise.all([m.start(), m.start()]);
    await m.start();
    expect(restores).toBe(1);
  });

  test("con un store que restaura, pide /me y queda authenticated", async () => {
    handlers["GET /api/me"] = (c) => (c.auth === "Bearer restored" ? json(200, me) : json(401, {}));
    const store: SessionStore = { ...createMemorySessionStore(), restore: async () => ({ accessToken: "restored" }) };
    const m = manager(store);
    await m.start();
    expect(m.getSnapshot().status).toBe("authenticated");
    expect(m.getSnapshot().user?.language).toBe("en");
  });

  test("si /me falla por red al restaurar, la sesión se conserva sin usuario", async () => {
    const store: SessionStore = { ...createMemorySessionStore(), restore: async () => ({ accessToken: "restored" }) };
    const m = manager(store);
    await m.start();
    expect(m.getSnapshot()).toMatchObject({ status: "authenticated", user: null });
  });

  test("un store que falla al restaurar deja la sesión anonymous", async () => {
    const store: SessionStore = {
      ...createMemorySessionStore(),
      restore: async () => {
        throw new Error("boom");
      },
    };
    const m = manager(store);
    await m.start();
    expect(m.getSnapshot().status).toBe("anonymous");
  });
});

describe("signIn", () => {
  test("abre la sesión con el usuario de la respuesta y lo completa con /me", async () => {
    handlers["GET /api/me"] = () => json(200, me);
    const m = manager();
    await m.start();
    await m.signIn(login());
    expect(m.getSnapshot().status).toBe("authenticated");
    expect(m.getSnapshot().user?.name).toBe("Ana");
    await m.refreshUser();
    expect(m.getSnapshot().user?.language).toBe("en");
    expect(m.getAccessToken()).toBe("access-1");
  });

  test("el access token y el refresh token no aparecen en el estado", async () => {
    const m = manager();
    await m.start();
    await m.signIn(login());
    const dump = JSON.stringify(m.getSnapshot());
    expect(dump).not.toContain("access-1");
    expect(dump).not.toContain("refresh-1");
  });

  test("avisa a quien se suscribe", async () => {
    const m = manager();
    let notified = 0;
    m.subscribe(() => notified++);
    await m.start();
    await m.signIn(login());
    expect(notified).toBeGreaterThanOrEqual(2);
  });

  test("un traspaso fallido (adopt) no abre la sesión y deja pasar el error", async () => {
    const store: SessionStore = {
      ...createMemorySessionStore(),
      adopt: async () => {
        throw new ApiError(401, "AUTH_REFRESH_TOKEN_REVOKED");
      },
    };
    const m = manager(store);
    await m.start();
    const error = await m.signIn(login()).catch((e) => e);
    expect(error.code).toBe("AUTH_REFRESH_TOKEN_REVOKED");
    expect(m.getSnapshot().status).toBe("anonymous");
  });

  test("la cuenta que ya no existe cierra la sesión (PROFILE_USER_NOT_FOUND)", async () => {
    handlers["GET /api/me"] = () => json(404, { error: { code: "PROFILE_USER_NOT_FOUND" } });
    handlers["POST /api/auth/logout"] = () => json(200, { message: "ok" });
    const m = manager();
    await m.start();
    await m.signIn(login());
    await m.refreshUser();
    expect(m.getSnapshot().status).toBe("anonymous");
  });
});

describe("refresh", () => {
  test("varias llamadas a la vez comparten UNA promesa y UNA petición", async () => {
    let refreshes = 0;
    handlers["POST /api/auth/refresh"] = async (c) => {
      refreshes++;
      await new Promise((r) => setTimeout(r, 10));
      expect(c.body).toEqual({ refreshToken: "refresh-1" });
      return json(200, { accessToken: "access-2", refreshToken: "refresh-2" });
    };
    const m = manager();
    await m.start();
    await m.signIn(login());
    const [a, b, c] = await Promise.all([m.refresh(), m.refresh(), m.refresh()]);
    expect([a, b, c]).toEqual(["access-2", "access-2", "access-2"]);
    expect(refreshes).toBe(1);
    expect(m.getAccessToken()).toBe("access-2");
  });

  test("el refresh token rota: el siguiente refresh usa el nuevo", async () => {
    const used: unknown[] = [];
    handlers["POST /api/auth/refresh"] = (c) => {
      used.push((c.body as { refreshToken: string }).refreshToken);
      return json(200, { accessToken: `access-${used.length + 1}`, refreshToken: `refresh-${used.length + 1}` });
    };
    const m = manager();
    await m.start();
    await m.signIn(login());
    await m.refresh();
    await m.refresh();
    expect(used).toEqual(["refresh-1", "refresh-2"]);
  });

  test("un refresh muerto termina la sesión y guarda el motivo", async () => {
    handlers["POST /api/auth/refresh"] = () => json(401, { error: { code: "AUTH_REFRESH_TOKEN_REVOKED" } });
    const m = manager();
    await m.start();
    await m.signIn(login());
    const error = await m.refresh().catch((e) => e);
    expect(error.code).toBe("AUTH_REFRESH_TOKEN_REVOKED");
    expect(m.getSnapshot()).toMatchObject({ status: "anonymous", user: null, endedReason: "AUTH_REFRESH_TOKEN_REVOKED", loggedOut: false });
    expect(m.getAccessToken()).toBeNull();
  });

  test("sin red el refresh falla pero la sesión sigue", async () => {
    const m = manager();
    await m.start();
    await m.signIn(login());
    const error = await m.refresh().catch((e) => e);
    expect(error.code).toBe("NETWORK");
    expect(m.getSnapshot().status).toBe("authenticated");
  });

  test("sin refresh token, la sesión termina con AUTH_REFRESH_TOKEN_NOT_FOUND", async () => {
    const m = manager();
    await m.start();
    const error = await m.refresh().catch((e) => e);
    expect(error.code).toBe("AUTH_REFRESH_TOKEN_NOT_FOUND");
  });

  test("de punta a punta: una llamada con el token vencido refresca y se repite", async () => {
    const { getBudgets } = await import("./api");
    handlers["GET /api/budgets"] = (c) =>
      c.auth === "Bearer access-2"
        ? json(200, { budgets: [], totalOfBudgets: 0, totalSpent: 0, totalRemaining: 0, pagination: { total: 0, limit: 50, offset: 0 } })
        : json(401, { error: { code: "AUTH_INVALID_ACCESS_TOKEN" } });
    handlers["POST /api/auth/refresh"] = () => json(200, { accessToken: "access-2", refreshToken: "refresh-2" });
    const m = manager();
    await m.start();
    await m.signIn(login());
    const result = await getBudgets();
    expect(result.budgets).toEqual([]);
    expect(calls.filter((c) => c.path === "/api/auth/refresh")).toHaveLength(1);
  });
});

describe("signOut y endSession", () => {
  test("revoca el refresh token, borra todo y queda loggedOut sin motivo", async () => {
    handlers["POST /api/auth/logout"] = () => json(200, { message: "ok" });
    const m = manager();
    await m.start();
    await m.signIn(login());
    m.setPrefillEmail("ana@centavos.mx");
    let cleared = 0;
    m.onSessionCleared(() => cleared++);
    await m.signOut();
    expect(calls.find((c) => c.path === "/api/auth/logout")?.body).toEqual({ refreshToken: "refresh-1" });
    expect(m.getSnapshot()).toMatchObject({ status: "anonymous", user: null, endedReason: null, loggedOut: true });
    expect(m.getAccessToken()).toBeNull();
    expect(m.takePrefillEmail()).toBeNull();
    expect(cleared).toBe(1);
  });

  test("no espera más que el tope si la API no responde", async () => {
    const store: SessionStore = { ...createMemorySessionStore(), logout: () => new Promise(() => {}) };
    const m = manager(store);
    await m.start();
    await m.signIn(login());
    const started = Date.now();
    await m.signOut();
    expect(Date.now() - started).toBeLessThan(500);
    expect(m.getSnapshot().status).toBe("anonymous");
  });

  test("signOut sin red igual cierra la sesión local", async () => {
    const m = manager();
    await m.start();
    await m.signIn(login());
    await m.signOut();
    expect(m.getSnapshot().status).toBe("anonymous");
  });

  test("volver a entrar limpia loggedOut y el motivo", async () => {
    const m = manager();
    await m.start();
    await m.signIn(login());
    await m.signOut();
    await m.signIn(login(2));
    expect(m.getSnapshot()).toMatchObject({ status: "authenticated", endedReason: null, loggedOut: false });
  });

  test("clearEndedReason borra el motivo", async () => {
    const m = manager();
    await m.start();
    await m.signIn(login());
    m.endSession("AUTH_REFRESH_TOKEN_EXPIRED");
    expect(m.getSnapshot().endedReason).toBe("AUTH_REFRESH_TOKEN_EXPIRED");
    m.clearEndedReason();
    expect(m.getSnapshot().endedReason).toBeNull();
  });
});

describe("prefillEmail (§4.5)", () => {
  test("se consume al leerlo", () => {
    const m = manager();
    m.setPrefillEmail("ana@centavos.mx");
    expect(m.takePrefillEmail()).toBe("ana@centavos.mx");
    expect(m.takePrefillEmail()).toBeNull();
  });
});

describe("adónde ir", () => {
  test("una cuenta nueva va a bienvenida, con el next si es válido", () => {
    expect(afterLoginTarget({ onboarded: false }, "?next=%2Fapp%2Fgastos")).toBe("/app/bienvenida?next=%2Fapp%2Fgastos");
    expect(afterLoginTarget({ onboarded: false }, "")).toBe("/app/bienvenida");
    expect(afterLoginTarget({ onboarded: false }, "?next=%2F%2Fevil.example")).toBe("/app/bienvenida");
  });

  test("solo onboarded === false cuenta: si falta, es una cuenta configurada", () => {
    expect(afterLoginTarget({}, "")).toBe("/app/pulso");
    expect(afterLoginTarget(null, "")).toBe("/app/pulso");
    expect(afterLoginTarget({ onboarded: true }, "?next=%2Fapp%2Fgastos")).toBe("/app/gastos");
    expect(afterLoginTarget({ onboarded: true }, "?next=https%3A%2F%2Fevil.example")).toBe("/app/pulso");
  });

  test("welcomeHref valida el next", () => {
    expect(welcomeHref("/app/perfil")).toBe("/app/bienvenida?next=%2Fapp%2Fperfil");
    expect(welcomeHref("/app/bienvenida")).toBe("/app/bienvenida");
    expect(welcomeHref("//evil.example")).toBe("/app/bienvenida");
  });
});
