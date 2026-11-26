import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

// La URL de la API se lee al cargar `lib/app/api`: se fija antes de importar.
process.env.NEXT_PUBLIC_API_URL = "http://api.test/";
const logic = await import("./logic");
const api = await import("@/lib/app/api");

type Call = { url: string; init: RequestInit };
let calls: Call[] = [];
let replies: Response[] = [];
const realFetch = globalThis.fetch;

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    const next = replies.shift();
    if (!next) throw new TypeError("fetch failed");
    return next;
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
beforeEach(() => {
  calls = [];
  replies = [];
  // Con token en memoria no hace falta restaurar la sesión: se fuerza un handler.
  api.setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "tok", onAuthFailure: () => {} } as never);
});

describe("montos", () => {
  test("sanitizeAmount deja dígitos y un punto", () => {
    expect(logic.sanitizeAmount("1,2a3.4.5")).toBe("123.45");
    expect(logic.sanitizeAmount("abc")).toBe("");
  });
  test("parseAmount e isValidAmount", () => {
    expect(logic.parseAmount("1,200.50")).toBe(1200.5);
    expect(logic.parseAmount("")).toBeNaN();
    expect(logic.parseAmount(".")).toBeNaN();
    expect(logic.isValidAmount("0")).toBe(false);
    expect(logic.isValidAmount("")).toBe(false);
    expect(logic.isValidAmount("0.5")).toBe(true);
  });
  test("editedAmount solo devuelve lo que cambió", () => {
    expect(logic.editedAmount("3960", 3960)).toBeUndefined();
    expect(logic.editedAmount("4000", 3960)).toBe(4000);
    expect(logic.editedAmount("", 3960)).toBeUndefined();
    expect(logic.editedAmount("0", 3960)).toBeUndefined();
  });
});

const budgets = [
  { key: "groceries", name: "Despensa", category: "food", emoji: "🛒", defaultMonthly: 4000 },
  { key: "pets", name: "Mascotas", category: "pets", emoji: "🐾", defaultMonthly: 1000 },
];
const subs = [
  { key: "netflix", name: "Netflix", category: "entertainment", emoji: "🎬", defaultAmount: 219, frequency: "monthly" as const },
  { key: "spotify", name: "Spotify", category: "entertainment", emoji: "🎵", defaultAmount: 129, frequency: "monthly" as const },
];

describe("elecciones", () => {
  test("solo van los elegidos; el monto, solo si cambió", () => {
    const picks = { sel: { groceries: true, pets: true }, amt: { pets: "1200" } };
    expect(logic.budgetPicks(budgets, picks)).toEqual([{ key: "groceries" }, { key: "pets", monthly: 1200 }]);
    expect(logic.budgetPicks(budgets, logic.NO_PICKS)).toEqual([]);
    expect(logic.subscriptionPicks(subs, { sel: { spotify: true }, amt: { spotify: "139" } })).toEqual([{ key: "spotify", amount: 139 }]);
  });
  test("un elegido con monto vacío o cero se manda sin monto: la API usa el del catálogo, como en la app", () => {
    expect(logic.budgetPicks(budgets, { sel: { pets: true }, amt: { pets: "" } })).toEqual([{ key: "pets" }]);
    expect(logic.budgetPicks(budgets, { sel: { pets: true }, amt: { pets: "0" } })).toEqual([{ key: "pets" }]);
    expect(logic.subscriptionPicks(subs, { sel: { netflix: true }, amt: { netflix: "" } })).toEqual([{ key: "netflix" }]);
  });
});

describe("invitados", () => {
  test("agrega, sin mayúsculas ni duplicados, ni el propio, con tope", () => {
    expect(logic.addInvite([], " ana@correo.com ", "yo@correo.com")).toEqual({ emails: ["ana@correo.com"] });
    expect(logic.addInvite([], "no-es-correo")).toEqual({ error: "invalidEmail" });
    expect(logic.addInvite([], "YO@correo.com", "yo@correo.com")).toEqual({ error: "ownEmail" });
    expect(logic.addInvite(["Ana@correo.com"], "ana@correo.com")).toEqual({ error: "duplicate" });
    const full = Array.from({ length: logic.MAX_INVITES }, (_, i) => `a${i}@x.mx`);
    expect(logic.addInvite(full, "otro@x.mx")).toEqual({ error: "max" });
  });
  test("nombre del viaje: 1 a 100 sin contar espacios de las puntas", () => {
    expect(logic.isValidTripName("  ")).toBe(false);
    expect(logic.isValidTripName(" Cancún ")).toBe(true);
    expect(logic.isValidTripName("x".repeat(101))).toBe(false);
  });
});

describe("cuerpo y llave", () => {
  test("cuerpos de apply", () => {
    expect(logic.personalBody({ currency: "MXN", language: "es", budgets: [{ key: "pets" }], subscriptions: [] })).toEqual({
      currency: "MXN", language: "es", purpose: "personal", budgets: [{ key: "pets" }], subscriptions: [],
    });
    expect(logic.tripBody({ currency: "USD", language: "en", tripName: " Cancún ", invites: ["a@b.mx"] })).toEqual({
      currency: "USD", language: "en", purpose: "trip", tripName: "Cancún", invites: ["a@b.mx"],
    });
  });
  test("la llave se reusa con el mismo cuerpo y cambia con otro", () => {
    let n = 0;
    const keyFor = logic.createKeyHolder(() => `k${++n}`);
    const a = logic.tripBody({ currency: "MXN", language: "es", tripName: "A", invites: [] });
    const b = logic.tripBody({ currency: "MXN", language: "es", tripName: "B", invites: [] });
    expect(keyFor(a)).toBe("k1");
    expect(keyFor(a)).toBe("k1");
    expect(keyFor(b)).toBe("k2");
    expect(keyFor(a)).toBe("k3");
  });
});

describe("terminar", () => {
  test("apply: manda el cuerpo con Idempotency-Key y devuelve la respuesta", async () => {
    const response = { onboarded: true, purpose: "trip", currency: "MXN", language: "es", created: { budgets: [], subscriptions: [] }, invites: [{ email: "a@b.mx", status: "invited" }] };
    replies.push(reply(201, response));
    const body = logic.tripBody({ currency: "MXN", language: "es", tripName: "Cancún", invites: ["a@b.mx"] });
    const out = await logic.submitApply(body, "key-1");
    expect(out).toEqual({ kind: "done", response: response as never });
    expect(calls[0].url).toBe("http://api.test/api/onboarding/apply");
    expect(calls[0].init.method).toBe("POST");
    expect((calls[0].init.headers as Record<string, string>)["idempotency-key"]).toBe("key-1");
    expect(JSON.parse(calls[0].init.body as string)).toEqual(body);
  });
  test("apply: 409 ONBOARDING_ALREADY_DONE se toma como hecho", async () => {
    replies.push(reply(409, { error: { code: "ONBOARDING_ALREADY_DONE", message: "x" } }));
    const out = await logic.submitApply(logic.personalBody({ currency: "MXN", language: "es", budgets: [], subscriptions: [] }), "k");
    expect(out).toEqual({ kind: "already" });
  });
  test("apply: otros errores se propagan", async () => {
    replies.push(reply(403, { error: { code: "PREMIUM_REQUIRED", message: "x" } }));
    const body = logic.tripBody({ currency: "MXN", language: "es", tripName: "A", invites: ["a@b.mx"] });
    await expect(logic.submitApply(body, "k")).rejects.toMatchObject({ code: "PREMIUM_REQUIRED" });
  });
  test("skip: ok y 409 no fallan; otro error sí", async () => {
    replies.push(reply(200, { onboarded: true, onboardingChoice: "skipped" }));
    await logic.submitSkip();
    expect(calls[0].url).toBe("http://api.test/api/onboarding/skip");
    replies.push(reply(409, { error: { code: "ONBOARDING_ALREADY_DONE", message: "x" } }));
    await logic.submitSkip();
    replies.push(reply(500, { error: { code: "INTERNAL", message: "x" } }));
    await expect(logic.submitSkip()).rejects.toBeInstanceOf(api.ApiError);
  });
  test("el catálogo se pide con moneda e idioma", async () => {
    replies.push(reply(200, { currency: "USD", language: "en", budgets: [], subscriptions: [] }));
    await api.getOnboardingCatalog({ currency: "USD", language: "en" });
    expect(calls[0].url).toBe("http://api.test/api/onboarding/catalog?currency=USD&language=en");
  });
});

describe("monedas", () => {
  test("156 códigos, sin repetir, MXN primero", () => {
    expect(logic.CURRENCY_CODES.length).toBe(156);
    expect(new Set(logic.CURRENCY_CODES).size).toBe(156);
    expect(logic.CURRENCY_CODES[0]).toBe("MXN");
  });
  test("busca por código o nombre, sin acentos", () => {
    const options = [
      { code: "MXN", name: "Peso mexicano" },
      { code: "COP", name: "Peso colombiano" },
      { code: "EUR", name: "Euro" },
    ];
    expect(logic.filterCurrencies(options, "peso").map((o) => o.code)).toEqual(["MXN", "COP"]);
    expect(logic.filterCurrencies(options, "eur").map((o) => o.code)).toEqual(["EUR"]);
    expect(logic.filterCurrencies(options, "  ")).toHaveLength(3);
    expect(logic.filterCurrencies(options, "zzz")).toEqual([]);
  });
  test("moneda inicial: la de la cuenta si es válida", () => {
    expect(logic.initialCurrency("USD")).toBe("USD");
    expect(logic.initialCurrency("XXX")).toBe("MXN");
    expect(logic.initialCurrency(undefined)).toBe("MXN");
  });
});
