import { describe, expect, test } from "bun:test";
import type { Budget } from "@/lib/app/api";
import { EMPTY_SECTION, appendUniqueById, budgetsView, detailView, hasMore, isBudgetsTab, type Section } from "./logic";

const b = (id: string, monthly: number | null, spent: number, currency = "MXN"): Budget => ({ id, name: id, monthly, spent, currency });
const section = (budgets: Budget[], over: Partial<Section> = {}): Section => ({
  budgets, totalOfBudgets: 0, totalSpent: 0, totalRemaining: 520, total: budgets.length, ...over,
});

describe("budgetsView", () => {
  test("agrupa: atención (más usado primero), van bien y sin límite", () => {
    const v = budgetsView(section([b("fine", 100, 10), b("near", 100, 85), b("over", 100, 130), b("free", null, 50), b("fine2", 100, 50)]), "MXN");
    expect(v.groups.map((g) => g.key)).toEqual(["attention", "fine", "limitless"]);
    expect(v.groups[0].rows.map((r) => r.b.id)).toEqual(["over", "near"]);
    expect(v.groups[1].rows.map((r) => r.b.id)).toEqual(["fine2", "fine"]);
    expect(v.over.map((r) => r.b.id)).toEqual(["over"]);
    expect(v.allFine).toBe(false);
  });
  test("un grupo sin filas no sale", () => {
    const v = budgetsView(section([b("a", 100, 10)]), "MXN");
    expect(v.groups.map((g) => g.key)).toEqual(["fine"]);
    expect(v.allFine).toBe(true);
  });
  test("solo sin límite: nada va bien ni pide atención", () => {
    const v = budgetsView(section([b("a", null, 10)]), "MXN");
    expect(v.allFine).toBe(false);
    expect(v.segments).toEqual([]);
  });
  test("la barra segmentada deja fuera los sin límite y los de otra moneda", () => {
    const v = budgetsView(section([b("a", 100, 10), b("usd", 100, 90, "USD"), b("free", null, 5), b("zero", 0, 0)]), "MXN");
    expect(v.segments.map((r) => r.b.id)).toEqual(["a"]);
    expect(v.hasOffCurrency).toBe(true);
  });
  test("lo que queda sale tal cual de la API, también negativo", () => {
    expect(budgetsView(section([], { totalRemaining: -30 }), "MXN").left).toBe(-30);
  });
  test("sección vacía", () => {
    const v = budgetsView(EMPTY_SECTION, "MXN");
    expect(v.groups).toEqual([]);
    expect(v.hasOffCurrency).toBe(false);
  });
});

describe("paginación", () => {
  test("appendUniqueById no repite ids", () => {
    expect(appendUniqueById([{ id: "a" }, { id: "b" }], [{ id: "b" }, { id: "c" }]).map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
  test("hasMore", () => {
    expect(hasMore(50, 120)).toBe(true);
    expect(hasMore(120, 120)).toBe(false);
    expect(hasMore(0, 0)).toBe(false);
  });
  test("isBudgetsTab", () => {
    expect(isBudgetsTab("shared")).toBe(true);
    expect(isBudgetsTab("x")).toBe(false);
    expect(isBudgetsTab(null)).toBe(false);
  });
});

describe("detailView", () => {
  const mid = new Date(2026, 10, 15); // 15 de noviembre de 2026: 15/30 del mes
  test("con límite: uso, resto y ritmo", () => {
    const v = detailView({ monthly: 1000, spent: 800 }, 11, 2026, mid);
    expect(v.share).toBe(0.8);
    expect(v.pct).toBe(80);
    expect(v.left).toBe(200);
    expect(v.isWarning).toBe(true);
    expect(v.isOver).toBe(false);
    expect(v.pace).toBe(0.5);
    expect(v.paceTone).toBe("ahead");
  });
  test("pasado: rojo, sin advertencia", () => {
    const v = detailView({ monthly: 1000, spent: 1200 }, 11, 2026, mid);
    expect(v.isOver).toBe(true);
    expect(v.isWarning).toBe(false);
    expect(v.left).toBe(-200);
  });
  test("sin límite: nada de uso ni estado", () => {
    const v = detailView({ monthly: null, spent: 400 }, 11, 2026, mid);
    expect(v.limitless).toBe(true);
    expect(v.share).toBe(0);
    expect(v.isOver || v.isWarning).toBe(false);
  });
  test("un mes pasado no tiene marca de ritmo", () => {
    expect(detailView({ monthly: 1000, spent: 100 }, 9, 2026, mid).pace).toBeNull();
  });
  test("a tiempo y por debajo", () => {
    expect(detailView({ monthly: 1000, spent: 500 }, 11, 2026, mid).paceTone).toBe("onTrack");
    expect(detailView({ monthly: 1000, spent: 100 }, 11, 2026, mid).paceTone).toBe("under");
  });
});
