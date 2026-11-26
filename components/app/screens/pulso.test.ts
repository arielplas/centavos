import { describe, expect, test } from "bun:test";
import type { PulseBudget, PulseResponse } from "@/lib/app/api";
import { COPY } from "@/components/app/copy";
import { STATUS_KEYS, hasInstallmentChip, pulseView } from "./pulso";

const budget = (id: string, monthly: number | null, spent: number, currency = "MXN"): PulseBudget => ({
  id, name: id, monthly, spent, currency,
});

const base: PulseResponse = {
  status: "green",
  spentToday: 0, spentLast7: 0, spentThisWeek: 0, spentThisMonth: 0,
  totalBudget: 1000, totalSpent: 250, subscriptionsMonthly: 0,
  recentExpenses: [],
  budgets: [],
};

describe("pulseView", () => {
  test("sin presupuestos es el estado vacío", () => {
    expect(pulseView(base, "MXN").empty).toBe(true);
    expect(pulseView({ ...base, budgets: [budget("a", 100, 1)] }, "MXN").empty).toBe(false);
  });
  test("disponible, uso y porciento", () => {
    const v = pulseView(base, "MXN");
    expect(v.available).toBe(750);
    expect(v.share).toBe(0.25);
    expect(v.percent).toBe(25);
  });
  test("pasado de presupuesto: disponible negativo y más de 100 %", () => {
    const v = pulseView({ ...base, totalSpent: 1500 }, "MXN");
    expect(v.available).toBe(-500);
    expect(v.percent).toBe(150);
  });
  test("sin presupuestado no divide entre cero", () => {
    expect(pulseView({ ...base, totalBudget: 0, totalSpent: 0 }, "MXN")).toMatchObject({ share: 0, percent: 0, available: 0 });
  });
  test("otra moneda activa el aviso; la misma, no", () => {
    expect(pulseView({ ...base, budgets: [budget("a", 100, 1, "USD")] }, "MXN").hasOffCurrency).toBe(true);
    expect(pulseView({ ...base, budgets: [budget("a", 100, 1)] }, "MXN").hasOffCurrency).toBe(false);
  });
  test("3 presupuestos por uso, sin límite al final; 4 recientes", () => {
    const budgets = [budget("sin", null, 50), budget("a", 100, 10), budget("b", 100, 90), budget("c", 100, 50), budget("d", 100, 99)];
    const recentExpenses = Array.from({ length: 6 }, (_, i) => ({ id: String(i), amount: 1, category: "food", date: "2026-11-01T00:00:00Z", imageCount: 0 }));
    const v = pulseView({ ...base, budgets, recentExpenses }, "MXN");
    expect(v.budgets.map((b) => b.id)).toEqual(["d", "b", "c"]);
    expect(v.recent.map((e) => e.id)).toEqual(["0", "1", "2", "3"]);
  });
});

describe("chip de pagos", () => {
  const e = { id: "1", amount: 1, category: "food", date: "", imageCount: 0 };
  test("solo con los cuatro datos", () => {
    expect(hasInstallmentChip(e)).toBe(false);
    expect(hasInstallmentChip({ ...e, hasInstallments: true, currentInstallment: 3, totalInstallments: 12 })).toBe(false);
    expect(
      hasInstallmentChip({ ...e, hasInstallments: true, currentInstallment: 3, totalInstallments: 12, installmentFrequency: "monthly" }),
    ).toBe(true);
  });
});

describe("estado", () => {
  test("las seis claves existen en es y en", () => {
    for (const keys of Object.values(STATUS_KEYS)) {
      for (const key of [keys.line, keys.sub]) {
        const path = key.split(":")[1].split(".");
        for (const lang of ["es", "en"] as const) {
          expect(typeof path.reduce<unknown>((n, p) => (n as Record<string, unknown>)[p], COPY[lang].home)).toBe("string");
        }
      }
    }
  });
});
