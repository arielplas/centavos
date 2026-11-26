import { describe, expect, test } from "bun:test";
import { translate, type T } from "@/components/app/copy";
import { currencySymbol } from "./currency";
import { formatDate, formatMoney, formatMoneyParts, initialsFrom, installmentLabel, localDayKey, wholeAmount } from "./format";
import { CATEGORY_KEYS, categoryGlyph, categoryTint, getCategory } from "./categories";
import { monthClock, shortMoney, sortByUse, toneOf, topBudgets } from "./budget";
import { FREE_MONTHS, isMonthLocked, openableMonths, recentMonths } from "./months";
import { monthPace, paceState, progressParts, ringColor, ringGeometry } from "./ring";

const es: T = (k, p) => translate("es", k, p);
const en: T = (k, p) => translate("en", k, p);

describe("dinero", () => {
  test("monto con dos decimales y el código aparte", () => {
    expect(formatMoneyParts(1234, "MXN", "es")).toEqual({ amount: "$1,234.00", currency: "MXN" });
    expect(formatMoney(1234.5, "USD", "en")).toBe("$1,234.50 USD");
  });
  test("compacto desde 1,000: «$5k» si es entero, un decimal si no («$5.0k» para 5,040)", () => {
    expect(formatMoneyParts(5000, "MXN", "es", { compact: true }).amount).toBe("$5k");
    expect(formatMoneyParts(1500, "MXN", "es", { compact: true }).amount).toBe("$1.5k");
    expect(formatMoneyParts(5040, "MXN", "es", { compact: true }).amount).toBe("$5.0k");
    expect(formatMoneyParts(999, "MXN", "es", { compact: true }).amount).toBe("$999.00");
    expect(formatMoneyParts(2_400_000, "MXN", "es", { compact: true }).amount).toBe("$2.4M");
  });
  test("siempre el absoluto; sign pone «+» a los positivos", () => {
    expect(formatMoneyParts(-50, "MXN", "es").amount).toBe("$50.00");
    expect(formatMoneyParts(50, "MXN", "es", { sign: true }).amount).toBe("+$50.00");
    expect(formatMoneyParts(-50, "MXN", "es", { sign: true }).amount).toBe("$50.00");
  });
  test("símbolo: desconocido → «$», sin símbolo propio → solo el código", () => {
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("ZZZ")).toBe("$");
    expect(currencySymbol("AED")).toBe("");
    expect(formatMoney(10, "AED", "es")).toBe("10.00 AED");
  });
  test("wholeAmount y shortMoney", () => {
    expect(wholeAmount("$520.00")).toBe("$520");
    expect(wholeAmount("$520.50")).toBe("$520.50");
    expect(shortMoney(2649.4, "MXN", "es")).toBe("$2,649");
    expect(shortMoney(150_000, "MXN", "es")).toBe("$150k");
  });
});

describe("fechas", () => {
  const now = new Date(2026, 10, 26, 10, 0); // 26 nov 2026, hora local
  const at = (d: number, h = 23) => new Date(2026, 10, d, h, 30).toISOString();
  test("relativas: Hoy, Ayer, Hace N días, después la corta", () => {
    expect(formatDate(at(26), "relative", "es", es, now)).toBe("Hoy");
    expect(formatDate(at(25), "relative", "es", es, now)).toBe("Ayer");
    expect(formatDate(at(23), "relative", "es", es, now)).toBe("Hace 3 días");
    expect(formatDate(at(26), "relative", "en", en, now)).toBe("Today");
    expect(formatDate(at(19), "relative", "es", es, now)).toBe(formatDate(at(19), "short", "es", es, now));
  });
  test("la hora no mueve el día: un gasto de las 23:30 de ayer no es «Hoy»", () => {
    expect(formatDate(at(25, 23), "relative", "es", es, new Date(2026, 10, 26, 1, 0))).toBe("Ayer");
  });
  test("larga con año", () => {
    expect(formatDate(at(26), "long", "en", en, now)).toBe("November 26, 2026");
  });
  test("localDayKey e initialsFrom", () => {
    expect(localDayKey(new Date(2026, 0, 5, 12).toISOString())).toBe("2026-01-05");
    expect(initialsFrom("Ana López")).toBe("AL");
    expect(initialsFrom("ana")).toBe("AN");
    expect(initialsFrom("  ")).toBe("?");
  });
  test("etiqueta de pagos a meses", () => {
    expect(installmentLabel(3, 12, "monthly", es)).toBe("3/12 mensual");
    expect(installmentLabel(1, 4, "weekly", en)).toBe("1/4 weekly");
  });
});

describe("categorías", () => {
  test("las 14 tienen glifo propio y tinte", () => {
    expect(CATEGORY_KEYS).toHaveLength(14);
    for (const k of CATEGORY_KEYS) {
      expect(categoryGlyph(k) as string).toBe(`category-${k.replace(/_/g, "-")}`);
      expect(categoryTint(k)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
  test("una clave desconocida o nula cae a «otros», sin emoji ni error", () => {
    expect(categoryGlyph("crypto")).toBe("category-other");
    expect(getCategory("crypto", es)).toMatchObject({ key: "crypto", label: "crypto", icon: "category-other" });
    expect(getCategory(undefined, es)).toMatchObject({ key: "other", label: "Otros" });
    expect(getCategory("personal_care", en).label).toBe("Personal care");
  });
});

describe("meses y el candado de Centavos+", () => {
  test("recentMonths cruza el año: enero 2026 → enero, diciembre y noviembre de 2025", () => {
    const m = recentMonths(3, "es", new Date(2026, 0, 15));
    expect(m.map((x) => x.key)).toEqual(["2026-1", "2025-12", "2025-11"]);
    expect(m.map((x) => x.label)).toEqual(["Enero", "Diciembre", "Noviembre"]);
    expect(m[1]).toMatchObject({ month: 12, year: 2025 });
  });
  test("31 de marzo no se salta febrero", () => {
    expect(recentMonths(3, "en", new Date(2026, 2, 31)).map((x) => x.label)).toEqual(["March", "February", "January"]);
  });
  test("lista 12 meses", () => {
    const m = recentMonths(12, "es", new Date(2026, 10, 26));
    expect(m).toHaveLength(12);
    expect(m[11].key).toBe("2025-12");
  });
  test("gratis abre este mes y los dos anteriores; el cuarto está bloqueado", () => {
    expect(FREE_MONTHS).toBe(3);
    expect([0, 1, 2, 3, 11].map((i) => isMonthLocked(i, false, 12))).toEqual([false, false, false, true, true]);
  });
  test("Centavos+ abre los 12", () => {
    expect(Array.from({ length: 12 }, (_, i) => isMonthLocked(i, true, 12)).some(Boolean)).toBe(false);
    expect(openableMonths(true, 12)).toBe(12);
    expect(openableMonths(false, 2)).toBe(2);
  });
});

describe("anillo y barra", () => {
  test("semáforo: verde < 80 %, amarillo desde 80 %, rojo desde 100 %", () => {
    expect(ringColor(0)).toBe("var(--color-green)");
    expect(ringColor(0.7999)).toBe("var(--color-green)");
    expect(ringColor(0.8)).toBe("var(--color-yellow)");
    expect(ringColor(0.9999)).toBe("var(--color-yellow)");
    expect(ringColor(1)).toBe("var(--color-red)");
    expect(ringColor(3)).toBe("var(--color-red)");
  });
  test("monthPace: solo el mes actual", () => {
    const now = new Date(2026, 10, 15); // noviembre tiene 30 días
    expect(monthPace(11, 2026, now)).toBe(0.5);
    expect(monthPace(10, 2026, now)).toBeNull();
    expect(monthPace(11, 2025, now)).toBeNull();
  });
  test("paceState con banda muerta de 5 puntos", () => {
    expect(paceState(0.6, 0.5)).toBe("ahead");
    expect(paceState(0.54, 0.5)).toBe("onTrack");
    expect(paceState(0.46, 0.5)).toBe("onTrack");
    expect(paceState(0.3, 0.5)).toBe("under");
  });
  test("geometría: el arco se topa en 1 y no hay arco en 0", () => {
    const g = ringGeometry(48, 4, 0.5, 0.25);
    expect(g.r).toBe(22);
    expect(g.c).toBe(24);
    expect(g.dash).toBe(`${(Math.PI * 22).toFixed(2)} ${(2 * Math.PI * 22).toFixed(2)}`);
    expect(g.paceDegrees).toBe(90);
    expect(ringGeometry(48, 4, 7, null).shown).toBe(1);
    expect(ringGeometry(48, 4, 0, null).dash).toBeNull();
    expect(ringGeometry(48, 4, NaN, null).dash).toBeNull();
    expect(ringGeometry(48, 4, -1, null).dash).toBeNull();
  });
  test("barra: relleno hasta 100 % y el sobrante aparte", () => {
    expect(progressParts(50, 100)).toEqual({ pct: 0.5, fill: 0.5, overflow: 0 });
    expect(progressParts(130, 100)).toMatchObject({ fill: 1, overflow: expect.closeTo(0.3, 5) });
    expect(progressParts(500, 100).overflow).toBe(1);
    expect(progressParts(10, 0)).toEqual({ pct: 0, fill: 0, overflow: 0 });
  });
});

describe("presupuestos", () => {
  const b = (id: string, monthly: number | null, spent: number) => ({
    id, name: id, monthly, spent, currency: "MXN",
  });
  test("toneOf: umbrales 80 % y 100 %, sin límite aparte", () => {
    expect(toneOf(b("a", 100, 79))).toEqual({ tone: "fine", share: 0.79 });
    expect(toneOf(b("a", 100, 80)).tone).toBe("near");
    expect(toneOf(b("a", 100, 100)).tone).toBe("over");
    expect(toneOf(b("a", null, 900))).toEqual({ tone: "limitless", share: 0 });
    expect(toneOf(b("a", 0, 10))).toEqual({ tone: "fine", share: 0 });
  });
  test("los 3 de arriba: por uso, los sin límite al final", () => {
    const all = [b("sin", null, 999), b("poco", 100, 10), b("mucho", 100, 95), b("pasado", 100, 150), b("medio", 100, 50)];
    expect(topBudgets(all).map((x) => x.id)).toEqual(["pasado", "mucho", "medio"]);
    expect(sortByUse(all).map((x) => x.id)).toEqual(["pasado", "mucho", "medio", "poco", "sin"]);
    expect(all[0].id).toBe("sin"); // no muta
  });
  test("monthClock: el mes actual da ritmo y días restantes; otro mes, nada", () => {
    const now = new Date(2026, 10, 20); // 20 de noviembre, 30 días
    expect(monthClock({ month: 11, year: 2026 }, now)).toEqual({ pace: 20 / 30, daysLeft: 11 });
    expect(monthClock({ month: 10, year: 2026 }, now)).toEqual({ pace: null, daysLeft: 0 });
    expect(monthClock({ month: 11, year: 2026 }, new Date(2026, 10, 30)).daysLeft).toBe(1);
  });
});
