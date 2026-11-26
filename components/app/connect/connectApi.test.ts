import { afterAll, beforeAll, describe, expect, test } from "bun:test";

// La URL de la API se lee al cargar el módulo: se fija antes de importarlo.
process.env.NEXT_PUBLIC_API_URL = "http://api.test/";
const api = await import("@/lib/app/api");
const { failureOf, codeView } = await import("./linkCode");

const realFetch = globalThis.fetch;
let next: Response;

beforeAll(() => {
  globalThis.fetch = (async () => next) as unknown as typeof fetch;
  api.setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "x", onAuthFailure: () => {} });
});
afterAll(() => {
  api.setAuthHandlers(null);
  globalThis.fetch = realFetch;
});

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("errores reales de la API, por código", () => {
  test("403 CONNECTOR_NOT_AVAILABLE → notAvailable", async () => {
    next = reply(403, { error: { code: "CONNECTOR_NOT_AVAILABLE", message: "Not on the list" } });
    const err = await api.createLinkCode().catch((e) => e);
    expect(failureOf(err)).toBe("notAvailable");
  });
  test("429 RATE_LIMIT → falló, sin mostrar el mensaje de la API", async () => {
    next = reply(429, { error: { code: "RATE_LIMIT", message: "Too many" } });
    const err = await api.createLinkCode().catch((e) => e);
    expect(failureOf(err)).toBe("failed");
  });
  test("404 CONNECTION_NOT_FOUND al desconectar → falló", async () => {
    next = reply(404, { error: { code: "CONNECTION_NOT_FOUND", message: "x" } });
    const err = await api.revokeConnection("c1").catch((e) => e);
    expect(failureOf(err)).toBe("failed");
  });
  test("un 201 con código lleva a una vista con minutos", async () => {
    const t0 = Date.now();
    next = reply(201, { code: "ABC123", expiresAt: new Date(t0 + 600_000).toISOString() });
    const link = await api.createLinkCode();
    expect(codeView(link, t0)).toEqual({ code: "ABC123", minutesLeft: 10 });
  });
});
