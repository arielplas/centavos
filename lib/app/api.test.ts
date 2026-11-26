import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";

// La URL de la API se lee al cargar el módulo: se fija antes de importarlo.
process.env.NEXT_PUBLIC_API_URL = "http://api.test/";
const api = await import("./api");

type Call = { url: string; init: RequestInit };
let calls: Call[] = [];
let replies: Response[] = [];
const realFetch = globalThis.fetch;

function reply(status: number, body: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    const next = replies.shift();
    if (!next) throw new TypeError("fetch failed");
    return next;
  }) as typeof fetch;
});

beforeEach(() => {
  calls = [];
  replies = [];
  api.setAuthHandlers(null);
});

afterEach(() => api.setAuthHandlers(null));

describe("transporte", () => {
  test("base /api, sin cookies, sin Bearer en auth, content-type solo con cuerpo", async () => {
    replies.push(reply(200, { accessToken: "a", refreshToken: "r", user: { id: "1" } }));
    await api.login({ email: "a@b.mx", password: "secreta" });
    expect(calls[0].url).toBe("http://api.test/api/auth/login");
    expect(calls[0].init.credentials).toBe("omit");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.authorization).toBeUndefined();
    expect(headers["content-type"]).toBe("application/json");
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ email: "a@b.mx", password: "secreta" });

    replies.push(reply(200, { categories: [] }));
    await api.getCategories();
    expect((calls[1].init.headers as Record<string, string>)["content-type"]).toBeUndefined();
  });

  test("las llamadas de datos llevan timezone, el Bearer y credentials omit", async () => {
    api.setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "x", onAuthFailure: () => {} });
    replies.push(reply(200, { status: "green" }));
    await api.getPulse();
    const url = new URL(calls[0].url);
    expect(url.pathname).toBe("/api/pulse");
    expect(url.searchParams.get("timezone")).toBe(api.timezone());
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Bearer tok");
    expect(calls[0].init.credentials).toBe("omit");
  });

  test("todas las lecturas mandan timezone y omiten los parámetros sin valor", async () => {
    api.setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "x", onAuthFailure: () => {} });
    for (let i = 0; i < 4; i++) replies.push(reply(200, {}));
    await api.getExpenses({ period: "7d", category: undefined, limit: 100, offset: 0 });
    await api.getBudgets({ month: 11, year: 2026, shared: false });
    await api.getBudget("abc/def", { month: 11, year: 2026 });
    await api.getSubscriptions();
    const urls = calls.map((c) => new URL(c.url));
    expect(urls.every((u) => u.searchParams.get("timezone") === api.timezone())).toBe(true);
    expect(urls[0].searchParams.get("period")).toBe("7d");
    expect(urls[0].searchParams.has("category")).toBe(false);
    expect(urls[0].searchParams.get("offset")).toBe("0");
    expect(urls[1].searchParams.get("shared")).toBe("false");
    expect(urls[2].pathname).toBe("/api/budgets/abc%2Fdef");
  });

  test("sin respuesta es NETWORK con status 0", async () => {
    const error = await api.login({ email: "a@b.mx", password: "x" }).catch((e) => e);
    expect(error).toBeInstanceOf(api.ApiError);
    expect(error.code).toBe("NETWORK");
    expect(error.status).toBe(0);
  });

  test("un cuerpo que no es JSON o un 5xx sin código es UNKNOWN", async () => {
    replies.push(new Response("<html>502</html>", { status: 502 }));
    const a = await api.getCategories().catch((e) => e);
    expect(a.code).toBe("UNKNOWN");
    expect(a.status).toBe(502);

    replies.push(reply(200, "texto"));
    const b = await api.getCategories().catch((e) => e);
    expect(b.code).toBe("UNKNOWN");
  });
});

describe("ApiError", () => {
  test("lee el code, también en los 429, y no expone error.message", async () => {
    for (const code of ["RATE_LIMIT", "AUTH_CODE_LOCKED", "AUTH_RESET_CODE_LOCKED"]) {
      replies.push(reply(429, { error: { code, message: "Too many things, English text" } }));
      const error = await api.verifyEmail({ userId: "u", code: "123456" }).catch((e) => e);
      expect(error.status).toBe(429);
      expect(error.code).toBe(code);
      expect(error.message).toBe(code);
      expect(error.message).not.toContain("English");
    }
  });

  test("AUTH_EMAIL_UNVERIFIED trae userId y signupToken", async () => {
    replies.push(
      reply(403, { error: { code: "AUTH_EMAIL_UNVERIFIED", message: "x", userId: "u-1", signupToken: "tok" } }),
    );
    const error = await api.login({ email: "a@b.mx", password: "secreta" }).catch((e) => e);
    expect(error.code).toBe("AUTH_EMAIL_UNVERIFIED");
    expect(error.userId).toBe("u-1");
    expect(error.signupToken).toBe("tok");
  });

  test("una cuenta vieja puede no traer signupToken", async () => {
    replies.push(reply(403, { error: { code: "AUTH_EMAIL_UNVERIFIED", userId: "u-1" } }));
    const error = await api.login({ email: "a@b.mx", password: "secreta" }).catch((e) => e);
    expect(error.signupToken).toBeUndefined();
  });

  test("VALIDATION trae fields", async () => {
    replies.push(reply(400, { error: { code: "VALIDATION", fields: { email: "email must be a valid email address" } } }));
    const error = await api.signup({ name: "A", email: "x", password: "12345678" }).catch((e) => e);
    expect(error.code).toBe("VALIDATION");
    expect(error.fields).toEqual({ email: "email must be a valid email address" });
  });

  test("un código que la app web no conoce es UNKNOWN y conserva el original", async () => {
    replies.push(reply(409, { error: { code: "ALGO_NUEVO", message: "m" } }));
    const error = await api.getCategories().catch((e) => e);
    expect(error.code).toBe("UNKNOWN");
    expect(error.rawCode).toBe("ALGO_NUEVO");
  });

  test("los códigos de las conexiones se conservan (MCP_DISABLED, CONNECTOR_NOT_AVAILABLE)", async () => {
    api.setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "x", onAuthFailure: () => {} });
    replies.push(reply(503, { error: { code: "MCP_DISABLED" } }));
    expect((await api.getConnections().catch((e) => e)).code).toBe("MCP_DISABLED");
    replies.push(reply(403, { error: { code: "CONNECTOR_NOT_AVAILABLE" } }));
    expect((await api.createLinkCode().catch((e) => e)).code).toBe("CONNECTOR_NOT_AVAILABLE");
  });
});

describe("refresh y reintento", () => {
  const expired = () => reply(401, { error: { code: "AUTH_INVALID_ACCESS_TOKEN" } });

  test("ante un 401 de token vencido refresca y repite UNA vez con el token nuevo", async () => {
    let refreshes = 0;
    api.setAuthHandlers({
      getAccessToken: () => "viejo",
      refresh: async () => {
        refreshes++;
        return "nuevo";
      },
      onAuthFailure: () => {},
    });
    replies.push(expired(), reply(200, { id: "me" }));
    const me = await api.getMe();
    expect(me).toEqual({ id: "me" } as never);
    expect(refreshes).toBe(1);
    expect(calls).toHaveLength(2);
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Bearer viejo");
    expect((calls[1].init.headers as Record<string, string>).authorization).toBe("Bearer nuevo");
  });

  test("si el segundo intento también da 401 no vuelve a refrescar", async () => {
    let refreshes = 0;
    api.setAuthHandlers({
      getAccessToken: () => "viejo",
      refresh: async () => {
        refreshes++;
        return "nuevo";
      },
      onAuthFailure: () => {},
    });
    replies.push(expired(), reply(401, { error: { code: "AUTH_UNAUTHORIZED" } }));
    const error = await api.getMe().catch((e) => e);
    expect(error.code).toBe("AUTH_UNAUTHORIZED");
    expect(refreshes).toBe(1);
    expect(calls).toHaveLength(2);
  });

  test("si el refresh falla de verdad avisa a la sesión y lanza el error del refresh", async () => {
    const failures: string[] = [];
    api.setAuthHandlers({
      getAccessToken: () => "viejo",
      refresh: async () => {
        throw new api.ApiError(401, "AUTH_REFRESH_TOKEN_REVOKED");
      },
      onAuthFailure: (error) => failures.push(error.code),
    });
    replies.push(expired());
    const error = await api.getMe().catch((e) => e);
    expect(error.code).toBe("AUTH_REFRESH_TOKEN_REVOKED");
    expect(failures).toEqual(["AUTH_REFRESH_TOKEN_REVOKED"]);
  });

  test("sin red el refresh no cierra la sesión", async () => {
    const failures: string[] = [];
    api.setAuthHandlers({
      getAccessToken: () => "viejo",
      refresh: async () => {
        throw new api.ApiError(0, "NETWORK");
      },
      onAuthFailure: (error) => failures.push(error.code),
    });
    replies.push(expired());
    const error = await api.getMe().catch((e) => e);
    expect(error.code).toBe("NETWORK");
    expect(failures).toEqual([]);
  });

  test("otros 401 y los errores de auth no refrescan", async () => {
    let refreshes = 0;
    api.setAuthHandlers({
      getAccessToken: () => "tok",
      refresh: async () => {
        refreshes++;
        return "x";
      },
      onAuthFailure: () => {},
    });
    replies.push(reply(401, { error: { code: "AUTH_INVALID_CREDENTIALS" } }));
    expect((await api.login({ email: "a@b.mx", password: "x" }).catch((e) => e)).code).toBe("AUTH_INVALID_CREDENTIALS");
    replies.push(reply(404, { error: { code: "BUDGET_NOT_FOUND" } }));
    expect((await api.getBudget("x").catch((e) => e)).code).toBe("BUDGET_NOT_FOUND");
    expect(refreshes).toBe(0);
  });

  test("sin access token en memoria intenta refrescar antes de fallar", async () => {
    let token: string | null = null;
    api.setAuthHandlers({
      getAccessToken: () => token,
      refresh: async () => {
        token = "recien";
        return "recien";
      },
      onAuthFailure: () => {},
    });
    replies.push(reply(200, { id: "me" }));
    await api.getMe();
    expect(calls).toHaveLength(1);
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Bearer recien");
  });

  test("sin sesión registrada una llamada con Bearer falla con AUTH_UNAUTHORIZED, sin pegarle a la API", async () => {
    const error = await api.getMe().catch((e) => e);
    expect(error.code).toBe("AUTH_UNAUTHORIZED");
    expect(calls).toHaveLength(0);
  });
});

describe("endpoints", () => {
  test("verify y resend omiten signupToken si no lo hay", async () => {
    replies.push(reply(200, {}), reply(200, {}));
    await api.verifyEmail({ userId: "u", code: "123456" });
    await api.resendCode({ userId: "u" });
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ userId: "u", code: "123456" });
    expect(JSON.parse(calls[1].init.body as string)).toEqual({ userId: "u" });

    replies.push(reply(200, {}));
    await api.verifyEmail({ userId: "u", code: "123456", signupToken: "t" });
    expect(JSON.parse(calls[2].init.body as string)).toEqual({ userId: "u", code: "123456", signupToken: "t" });
  });

  test("apple manda el nonce crudo y el nombre solo si hay", async () => {
    replies.push(reply(200, {}), reply(200, {}));
    await api.loginWithApple({ idToken: "i", nonce: "n", name: "  " });
    await api.loginWithApple({ idToken: "i", nonce: "n", name: " Ana Pérez " });
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ idToken: "i", nonce: "n" });
    expect(JSON.parse(calls[1].init.body as string)).toEqual({ idToken: "i", nonce: "n", name: "Ana Pérez" });
  });

  test("onboarding/apply lleva Idempotency-Key; las conexiones usan sus rutas", async () => {
    api.setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "x", onAuthFailure: () => {} });
    for (let i = 0; i < 5; i++) replies.push(reply(200, {}));
    const key = api.newIdempotencyKey();
    await api.applyOnboarding({ currency: "MXN", language: "es", purpose: "personal", budgets: [], subscriptions: [] }, key);
    await api.skipOnboarding();
    await api.createLinkCode();
    await api.getConnections();
    await api.revokeConnection("a/b");
    expect((calls[0].init.headers as Record<string, string>)["idempotency-key"]).toBe(key);
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
    expect(calls.map((c) => `${c.init.method ?? "GET"} ${new URL(c.url).pathname}`)).toEqual([
      "POST /api/onboarding/apply",
      "POST /api/onboarding/skip",
      "POST /api/me/connections/link-code",
      "GET /api/me/connections",
      "DELETE /api/me/connections/a%2Fb",
    ]);
  });

  test("MCP_URL es el origen de la API + /mcp", () => {
    expect(api.MCP_URL).toBe("http://api.test/mcp");
  });
});

// Deja el fetch como estaba para otros archivos de prueba.
afterAll(() => {
  globalThis.fetch = realFetch;
});
