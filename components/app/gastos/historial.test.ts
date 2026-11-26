import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Expense } from "@/lib/app/api";
import {
  EXPENSES_LIMIT,
  LOCKED_PERIODS,
  appendUniqueById,
  buildQuery,
  createDebouncer,
  groupByDay,
  hasInstallmentChip,
  hasMore,
  isLocked,
  queryKeyOf,
  rangeParams,
  searchesAll,
} from "./historial";

// Fechas con el constructor local: el agrupado por día pasa en cualquier zona.
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString();
const exp = (id: string, amount: number, date: string, extra: Partial<Expense> = {}): Expense => ({
  id,
  amount,
  category: "food",
  date,
  hasInstallments: false,
  ...extra,
});

describe("periodo → parámetros", () => {
  const now = new Date(2026, 10, 26, 15, 4, 9);
  test("Hoy / Semana / Mes son los periodos móviles del servidor", () => {
    expect(rangeParams("day", now)).toEqual({ period: "today" });
    expect(rangeParams("week", now)).toEqual({ period: "7d" });
    expect(rangeParams("month", now)).toEqual({ period: "30d" });
  });
  test("Año: del 1 de enero a ahora, en hora de pared (sin «Z»)", () => {
    expect(rangeParams("year", now)).toEqual({ from: "2026-01-01T00:00:00", to: "2026-11-26T15:04:09" });
  });
});

describe("candados de Centavos+", () => {
  test("Año está bloqueado para una cuenta gratis y abierto con Centavos+", () => {
    expect(LOCKED_PERIODS).toEqual(["year"]);
    expect(isLocked("year", false)).toBe(true);
    expect(isLocked("year", true)).toBe(false);
    for (const p of ["day", "week", "month"] as const) expect(isLocked(p, false)).toBe(false);
  });
  test("solo Centavos+ busca en todo el historial, y solo si hay texto", () => {
    expect(searchesAll("uber", true)).toBe(true);
    expect(searchesAll("uber", false)).toBe(false);
    expect(searchesAll("   ", true)).toBe(false);
    expect(searchesAll("", true)).toBe(false);
  });
});

describe("consulta", () => {
  const now = new Date(2026, 10, 26, 12);
  const base = { period: "week", category: "all", search: "", isPremium: false } as const;
  test("sin filtros: el periodo, limit=100 y offset 0", () => {
    expect(buildQuery(base, 0, now)).toEqual({ period: "7d", limit: EXPENSES_LIMIT, offset: 0 });
  });
  test("categoría y nota (recortada)", () => {
    expect(buildQuery({ ...base, category: "food", search: "  uber " }, 100, now)).toEqual({
      period: "7d",
      category: "food",
      notes: "uber",
      limit: 100,
      offset: 100,
    });
  });
  test("gratis: la búsqueda se queda en el periodo en pantalla", () => {
    expect(buildQuery({ ...base, search: "uber" }, 0, now).period).toBe("7d");
  });
  test("Centavos+ buscando: sin periodo ni cotas", () => {
    const q = buildQuery({ ...base, period: "year", search: "uber", isPremium: true }, 0, now);
    expect(q.period).toBeUndefined();
    expect(q.from).toBeUndefined();
    expect(q.to).toBeUndefined();
    expect(q.notes).toBe("uber");
  });
  test("Centavos+ sin búsqueda: Año manda from/to", () => {
    const q = buildQuery({ ...base, period: "year", isPremium: true }, 0, now);
    expect(q.from).toBe("2026-01-01T00:00:00");
  });
  test("la clave ignora la paginación y distingue filtros", () => {
    const a = buildQuery(base, 0, now);
    expect(queryKeyOf(a)).toBe(queryKeyOf({ ...a, offset: 200 }));
    expect(queryKeyOf(a)).not.toBe(queryKeyOf(buildQuery({ ...base, category: "food" }, 0, now)));
    expect(queryKeyOf(a)).not.toBe(queryKeyOf(buildQuery({ ...base, period: "day" }, 0, now)));
  });
});

describe("agrupado por día", () => {
  test("el día más reciente primero, con el subtotal de cada uno", () => {
    const rows = [
      exp("a", 100, at(2026, 11, 26, 9)),
      exp("b", 50, at(2026, 11, 25, 23)),
      exp("c", 25.5, at(2026, 11, 26, 18)),
      exp("d", 10, at(2026, 11, 20, 8)),
    ];
    const groups = groupByDay(rows);
    expect(groups.map((g) => g.day)).toEqual(["2026-11-26", "2026-11-25", "2026-11-20"]);
    expect(groups[0].subtotal).toBe(125.5);
    expect(groups[0].rows.map((r) => r.id)).toEqual(["a", "c"]);
    expect(groups[1].subtotal).toBe(50);
  });
  test("sin gastos, sin grupos", () => expect(groupByDay([])).toEqual([]));
});

describe("paginación", () => {
  test("agrega sin repetir lo ya cargado", () => {
    const prev = [exp("a", 1, at(2026, 11, 2)), exp("b", 1, at(2026, 11, 1))];
    const next = [exp("b", 1, at(2026, 11, 1)), exp("c", 1, at(2026, 10, 31))];
    expect(appendUniqueById(prev, next).map((e) => e.id)).toEqual(["a", "b", "c"]);
    expect(appendUniqueById(prev, [])).toHaveLength(2);
  });
  test("se detiene al llegar al total", () => {
    expect(hasMore(100, 250)).toBe(true);
    expect(hasMore(250, 250)).toBe(false);
    expect(hasMore(0, 0)).toBe(false);
  });
});

describe("chip de pagos a meses", () => {
  test("solo con los cuatro datos", () => {
    const full = exp("a", 1, at(2026, 11, 2), {
      hasInstallments: true,
      currentInstallment: 3,
      totalInstallments: 12,
      installmentFrequency: "monthly",
    });
    expect(hasInstallmentChip(full)).toBe(true);
    expect(hasInstallmentChip({ ...full, installmentFrequency: undefined })).toBe(false);
    expect(hasInstallmentChip({ ...full, hasInstallments: false })).toBe(false);
    expect(hasInstallmentChip(exp("b", 1, at(2026, 11, 2)))).toBe(false);
  });
});

describe("debounce", () => {
  // Reloj falso: `advance` corre lo que ya venció.
  function fakeTimers() {
    let now = 0;
    let next = 1;
    const pending = new Map<number, { at: number; fn: () => void }>();
    return {
      timers: {
        set: (fn: () => void, ms: number) => {
          const id = next++;
          pending.set(id, { at: now + ms, fn });
          return id;
        },
        clear: (id: unknown) => void pending.delete(id as number),
      },
      advance(ms: number) {
        now += ms;
        for (const [id, p] of [...pending]) {
          if (p.at <= now) {
            pending.delete(id);
            p.fn();
          }
        }
      },
      pending: () => pending.size,
    };
  }

  test("escribir de corrido manda una sola vez, con lo último", () => {
    const clock = fakeTimers();
    const seen: string[] = [];
    const d = createDebouncer<string>((v) => seen.push(v), 300, clock.timers);
    d.push("u");
    clock.advance(100);
    d.push("ub");
    clock.advance(100);
    d.push("ube");
    clock.advance(299);
    expect(seen).toEqual([]);
    clock.advance(1);
    expect(seen).toEqual(["ube"]);
  });
  test("una pausa larga manda cada valor", () => {
    const clock = fakeTimers();
    const seen: string[] = [];
    const d = createDebouncer<string>((v) => seen.push(v), 300, clock.timers);
    d.push("a");
    clock.advance(300);
    d.push("ab");
    clock.advance(300);
    expect(seen).toEqual(["a", "ab"]);
  });
  test("cancel suelta lo pendiente", () => {
    const clock = fakeTimers();
    const seen: string[] = [];
    const d = createDebouncer<string>((v) => seen.push(v), 300, clock.timers);
    d.push("a");
    d.cancel();
    clock.advance(1000);
    expect(seen).toEqual([]);
    expect(clock.pending()).toBe(0);
  });
});

describe("GET /expenses con fetch simulado", () => {
  process.env.NEXT_PUBLIC_API_URL = "http://api.test/";
  const realFetch = globalThis.fetch;
  const urls: URL[] = [];
  beforeAll(() => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      urls.push(new URL(String(input)));
      return new Response(JSON.stringify({ expenses: [], totalSpent: 0, pagination: { total: 0, limit: 100, offset: 0 } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
  });
  afterAll(() => {
    globalThis.fetch = realFetch;
  });

  test("la petición lleva periodo, nota, límite, offset y la zona horaria", async () => {
    const { getExpenses, setAuthHandlers } = await import("@/lib/app/api");
    setAuthHandlers({ getAccessToken: () => "tok", refresh: async () => "tok", onAuthFailure: () => {} });
    const now = new Date(2026, 10, 26, 12);
    await getExpenses(buildQuery({ period: "month", category: "food", search: "uber", isPremium: false }, 100, now));
    const p = urls[0].searchParams;
    expect(urls[0].pathname).toBe("/api/expenses");
    expect(p.get("period")).toBe("30d");
    expect(p.get("category")).toBe("food");
    expect(p.get("notes")).toBe("uber");
    expect(p.get("limit")).toBe("100");
    expect(p.get("offset")).toBe("100");
    expect(p.get("timezone")).toBeTruthy();
    expect(p.has("from")).toBe(false);
  });
});
