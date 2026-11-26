import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

// §5.8: las pantallas de acceso solo llaman `signIn`; `GET /me` y la redirección
// (cuenta nueva a /app/bienvenida, si no el `next` válido o /app/pulso) son del
// manager y de `AccessGuard`. Aquí se prueba esa cadena con lo que devuelve cada
// llamada de acceso.

process.env.NEXT_PUBLIC_API_URL = "http://api.test";
const { SessionManager, createMemorySessionStore, afterLoginTarget } = await import("@/lib/app/session");

let paths: string[] = [];
let meBody: Record<string, unknown> = {};
const realFetch = globalThis.fetch;

beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const path = new URL(String(input)).pathname;
    paths.push(path);
    if (path === "/api/me") return new Response(JSON.stringify(meBody), { status: 200, headers: { "content-type": "application/json" } });
    throw new TypeError("fetch failed");
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
beforeEach(() => {
  paths = [];
});

const tokens = { accessToken: "a", refreshToken: "r" };
const manager = () => new SessionManager({ store: createMemorySessionStore(), logoutTimeoutMs: 20 });
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("después de entrar", () => {
  test("login o verify de una cuenta nueva (onboarded: false) va a bienvenida, llevando el next", async () => {
    meBody = { id: "u1", onboarded: false };
    const m = manager();
    await m.signIn({ ...tokens, user: { id: "u1", name: "Ana", email: "a@b.mx", currency: "MXN", onboarded: false } });
    expect(m.getSnapshot().status).toBe("authenticated");
    expect(afterLoginTarget(m.getSnapshot().user, "?next=%2Fapp%2Fgastos")).toBe("/app/bienvenida?next=%2Fapp%2Fgastos");
    await settle();
    expect(paths).toContain("/api/me");
  });

  test("una cuenta ya configurada va al next válido o, si no, al Pulso; un next ajeno se ignora", async () => {
    meBody = { id: "u1", onboarded: true };
    const m = manager();
    await m.signIn({ ...tokens, user: { id: "u1", name: "Ana", email: "a@b.mx", currency: "MXN", onboarded: true } });
    const { user } = m.getSnapshot();
    expect(afterLoginTarget(user, "?next=%2Fapp%2Fpresupuestos")).toBe("/app/presupuestos");
    expect(afterLoginTarget(user, "")).toBe("/app/pulso");
    expect(afterLoginTarget(user, "?next=https%3A%2F%2Fevil.example")).toBe("/app/pulso");
    expect(afterLoginTarget(user, "?next=%2F%2Fevil.example")).toBe("/app/pulso");
  });

  test("reset-password no trae onboarded: se trata como configurada hasta que /me diga lo contrario", async () => {
    meBody = { id: "u1", name: "Ana", email: "a@b.mx", currency: "MXN", onboarded: false };
    const m = manager();
    await m.signIn({ ...tokens, user: { id: "u1", name: "Ana", email: "a@b.mx", currency: "MXN" } });
    expect(afterLoginTarget(m.getSnapshot().user, "")).toBe("/app/pulso");
    await settle();
    expect(m.getSnapshot().user?.onboarded).toBe(false);
    expect(afterLoginTarget(m.getSnapshot().user, "")).toBe("/app/bienvenida");
  });

  test("el correo prellenado se lee una sola vez", () => {
    const m = manager();
    m.setPrefillEmail("ana@correo.mx");
    expect(m.takePrefillEmail()).toBe("ana@correo.mx");
    expect(m.takePrefillEmail()).toBeNull();
  });
});
