import { describe, expect, test } from "bun:test";
import type { Subscription, SubscriptionsResponse } from "@/lib/app/api";
import { translate, type T } from "@/components/app/copy";
import {
  chargeWhen,
  daysUntilCharge,
  fetchAllSubscriptions,
  groupByDue,
  nextChargeDate,
} from "./subscriptions";

const es: T = (k, p) => translate("es", k, p);
const en: T = (k, p) => translate("en", k, p);

// Fechas locales a mediodía: el día de calendario no depende de la zona del equipo.
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const sub = (id: string, nextCharge: Date, over: Partial<Subscription> = {}): Subscription => ({
  id, name: id, emoji: "", amount: 100, frequency: "monthly", category: "entertainment",
  nextCharge: nextCharge.toISOString(), active: true, ...over,
});

const NOW = at(2026, 11, 26);

describe("nextChargeDate", () => {
  test("mensual: hoy cuenta; si ya pasó, el mes que viene", () => {
    expect(nextChargeDate(at(2026, 1, 26).toISOString(), NOW)).toEqual(new Date(2026, 10, 26));
    expect(nextChargeDate(at(2026, 1, 20).toISOString(), NOW)).toEqual(new Date(2026, 11, 20));
  });
  test("mensual: diciembre da la vuelta al año", () => {
    expect(nextChargeDate(at(2026, 1, 5).toISOString(), at(2026, 12, 10))).toEqual(new Date(2027, 0, 5));
  });
  test("mensual: el día 31 cae en el último día de un mes corto", () => {
    expect(nextChargeDate(at(2026, 1, 31).toISOString(), at(2026, 2, 10))).toEqual(new Date(2026, 1, 28));
    expect(nextChargeDate(at(2026, 1, 31).toISOString(), at(2028, 2, 10))).toEqual(new Date(2028, 1, 29));
  });
  test("anual: este año si falta, si no el que viene", () => {
    expect(nextChargeDate(at(2024, 12, 1).toISOString(), NOW, "yearly")).toEqual(new Date(2026, 11, 1));
    expect(nextChargeDate(at(2024, 3, 15).toISOString(), NOW, "yearly")).toEqual(new Date(2027, 2, 15));
  });
  test("anual: 29 de febrero cae en el 28 los años no bisiestos", () => {
    expect(nextChargeDate(at(2024, 2, 29).toISOString(), at(2026, 1, 10), "yearly")).toEqual(new Date(2026, 1, 28));
  });
});

describe("daysUntilCharge", () => {
  test("hoy es 0, mañana es 1, medido en días de calendario", () => {
    expect(daysUntilCharge(at(2026, 11, 26).toISOString(), NOW)).toBe(0);
    expect(daysUntilCharge(at(2026, 11, 27).toISOString(), at(2026, 11, 26))).toBe(1);
    expect(daysUntilCharge(at(2026, 11, 27).toISOString(), new Date(2026, 10, 26, 23, 59))).toBe(1);
  });
  test("el cambio de horario no corre el conteo", () => {
    expect(daysUntilCharge(at(2026, 4, 10).toISOString(), at(2026, 3, 30))).toBe(11);
  });
});

describe("groupByDue", () => {
  const subs = [
    sub("hoy", at(2026, 11, 26)),
    sub("sieteDias", at(2026, 12, 3)),
    sub("ochoDias", at(2026, 12, 4)),
    sub("treintaDias", at(2026, 12, 26), { frequency: "yearly" }),
    sub("treintayUno", at(2026, 12, 27), { frequency: "yearly" }),
    sub("cancelada", at(2026, 11, 27), { active: false }),
  ];
  const groups = groupByDue(subs, NOW);

  test("bordes: ≤7 semana, ≤30 mes, el resto más adelante; las canceladas no entran", () => {
    expect(groups.map((g) => [g.key, g.items.map((i) => i.sub.id)])).toEqual([
      ["week", ["hoy", "sieteDias"]],
      ["month", ["ochoDias", "treintaDias"]],
      ["later", ["treintayUno"]],
    ]);
  });
  test("cada grupo suma los montos reales", () => {
    expect(groups.map((g) => g.total)).toEqual([200, 200, 100]);
  });
  test("una anual lejana va a «más adelante» y una mensual vencida da la vuelta", () => {
    const g = groupByDue([sub("a", at(2025, 5, 1), { frequency: "yearly" }), sub("m", at(2026, 1, 20))], NOW);
    expect(g.map((x) => [x.key, x.items[0].sub.id])).toEqual([["month", "m"], ["later", "a"]]);
  });
  test("mismo día: por nombre; sin activas: sin grupos", () => {
    const g = groupByDue([sub("b", at(2026, 11, 28)), sub("a", at(2026, 11, 28))], NOW);
    expect(g[0].items.map((i) => i.sub.id)).toEqual(["a", "b"]);
    expect(groupByDue([sub("x", NOW, { active: false })], NOW)).toEqual([]);
  });
});

describe("chargeWhen", () => {
  const when = (days: number, t: T = es, lang: "es" | "en" = "es") => {
    const date = new Date(2026, 10, 26 + days);
    return chargeWhen({ days, date }, t, lang, NOW);
  };
  test("hoy, mañana y «En N días» con su plural", () => {
    expect(when(0)).toBe("Se cobra hoy");
    expect(when(1)).toBe("Se cobra mañana");
    expect(when(2)).toBe("En 2 días");
    expect(when(7)).toBe("En 7 días");
    expect(when(2, en, "en")).toBe("In 2 days");
    expect(when(0, en, "en")).toBe("Charged today");
  });
  test("pasada una semana, la fecha corta; con año si es de otro", () => {
    expect(when(8)).toMatch(/4/);
    expect(when(8)).not.toMatch(/2026/);
    expect(when(60)).toMatch(/2027/);
  });
});

describe("plurales de «activas»", () => {
  test("1 activa / 2 activas; 1 active / 2 active", () => {
    expect(es("subscriptions:activeCount", { count: 1 })).toBe("1 activa");
    expect(es("subscriptions:activeCount", { count: 3 })).toBe("3 activas");
    expect(en("subscriptions:activeCount", { count: 1 })).toBe("1 active");
  });
  test("canceladas", () => {
    expect(es("subscriptions:cancelledToggle", { count: 2 })).toBe("Canceladas (2)");
  });
});

describe("fetchAllSubscriptions", () => {
  const mk = (n: number, from = 0): Subscription[] => Array.from({ length: n }, (_, i) => sub(`s${from + i}`, NOW));
  const resp = (subs: Subscription[], total: number, offset: number): SubscriptionsResponse => ({
    subscriptions: subs, activeSubscriptions: total, projectedMonthlyCost: 1, projectedYearlyCost: 12,
    pagination: { total, limit: 200, offset },
  });

  test("una sola página: una sola petición", async () => {
    const calls: number[] = [];
    const r = await fetchAllSubscriptions(async (q) => { calls.push(q.offset); return resp(mk(3), 3, 0); });
    expect(calls).toEqual([0]);
    expect(r.subscriptions).toHaveLength(3);
  });
  test("sigue hasta el total y no repite", async () => {
    const calls: number[] = [];
    const r = await fetchAllSubscriptions(async (q) => {
      calls.push(q.offset);
      const rest = 450 - q.offset;
      return resp(mk(Math.min(200, rest), q.offset), 450, q.offset);
    });
    expect(calls).toEqual([0, 200, 400]);
    expect(r.subscriptions).toHaveLength(450);
    expect(new Set(r.subscriptions.map((s) => s.id)).size).toBe(450);
  });
  test("una página vacía antes de tiempo corta el ciclo", async () => {
    let n = 0;
    const r = await fetchAllSubscriptions(async (q) => {
      n++;
      return q.offset === 0 ? resp(mk(200), 500, 0) : resp([], 500, q.offset);
    });
    expect(n).toBe(2);
    expect(r.subscriptions).toHaveLength(200);
  });
  test("un error de una página se propaga", async () => {
    await expect(fetchAllSubscriptions(async (q) => {
      if (q.offset > 0) throw new Error("boom");
      return resp(mk(200), 300, 0);
    })).rejects.toThrow("boom");
  });
});
