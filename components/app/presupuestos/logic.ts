// Las cuentas de Presupuestos y de su detalle (copia de lo que hacen
// `Presupuestos.tsx` y `DetallePresupuesto.tsx` de la app). Sin React: se prueba solo.

import type { Budget } from "@/lib/app/api";
import { toneOf, type Tone } from "@/components/app/ui/budget";
import { monthPace, paceState, type PaceState } from "@/components/app/ui/ring";

/** Presupuestos por página, como la app (el servidor acepta hasta 200). */
export const BUDGETS_LIMIT = 50;
/** Gastos por página en el detalle. */
export const EXPENSES_LIMIT = 100;

export type BudgetsTab = "personal" | "shared";

export function isBudgetsTab(v: unknown): v is BudgetsTab {
  return v === "personal" || v === "shared";
}

/** Un subconjunto (solos o compartidos): sus filas y los totales que la API le acotó. */
export type Section = {
  budgets: Budget[];
  totalOfBudgets: number;
  totalSpent: number;
  totalRemaining: number;
  /** `pagination.total` del subconjunto: decide si hay más páginas. */
  total: number;
};

export const EMPTY_SECTION: Section = { budgets: [], totalOfBudgets: 0, totalSpent: 0, totalRemaining: 0, total: 0 };

/** Suma `next` al final de `current` sin repetir ids (una página puede traslaparse con la anterior). */
export function appendUniqueById<T extends { id: string }>(current: readonly T[], next: readonly T[]): T[] {
  const seen = new Set(current.map((x) => x.id));
  return [...current, ...next.filter((x) => !seen.has(x.id))];
}

/** ¿Faltan filas por traer? */
export function hasMore(loaded: number, total: number): boolean {
  return loaded < total;
}

export type Ranked = { b: Budget; tone: Tone; share: number };
export type GroupKey = "attention" | "fine" | "limitless";

export type BudgetsView = {
  /** Lo que queda (puede ser negativo). */
  left: number;
  /** Los grupos, en orden y solo con filas. */
  groups: { key: GroupKey; rows: Ranked[] }[];
  /** Un tramo por presupuesto con límite en la moneda de la persona, del que más usa al que menos. */
  segments: Ranked[];
  /** Hay presupuestos en otra moneda: los totales no los cubren. */
  hasOffCurrency: boolean;
  /** Nada pide atención y hay filas que van bien. */
  allFine: boolean;
  /** Los que ya se pasaron. */
  over: Ranked[];
};

/** Agrupa y ordena una sección como la app: atención (pasados y cerca), van bien, sin límite. */
export function budgetsView(section: Section, userCurrency: string): BudgetsView {
  const ranked: Ranked[] = section.budgets.map((b) => ({ b, ...toneOf(b) }));
  const byShare = (a: Ranked, c: Ranked) => c.share - a.share;
  const attention = ranked.filter((r) => r.tone === "over" || r.tone === "near").sort(byShare);
  const fine = ranked.filter((r) => r.tone === "fine").sort(byShare);
  const limitless = ranked.filter((r) => r.tone === "limitless");
  const segments = ranked
    .filter((r) => r.tone !== "limitless" && (r.b.currency ?? userCurrency) === userCurrency && (r.b.monthly ?? 0) > 0)
    .sort(byShare);
  const groups = (
    [
      { key: "attention", rows: attention },
      { key: "fine", rows: fine },
      { key: "limitless", rows: limitless },
    ] as { key: GroupKey; rows: Ranked[] }[]
  ).filter((g) => g.rows.length > 0);
  return {
    left: section.totalRemaining,
    groups,
    segments,
    hasOffCurrency: section.budgets.some((b) => (b.currency ?? userCurrency) !== userCurrency),
    allFine: attention.length === 0 && fine.length > 0,
    over: attention.filter((r) => r.tone === "over"),
  };
}

export type DetailView = {
  limitless: boolean;
  /** Gastado ÷ tope (0 sin límite). */
  share: number;
  pct: number;
  left: number;
  isOver: boolean;
  isWarning: boolean;
  /** Dónde iría un gasto parejo a la fecha; `null` fuera del mes actual. */
  pace: number | null;
  paceTone: PaceState;
};

export function detailView(
  budget: Pick<Budget, "monthly" | "spent">,
  month: number,
  year: number,
  now: Date = new Date(),
): DetailView {
  const limitless = budget.monthly === null;
  const share = budget.monthly !== null && budget.monthly > 0 ? budget.spent / budget.monthly : 0;
  const pace = monthPace(month, year, now);
  return {
    limitless,
    share,
    pct: Math.round(share * 100),
    left: (budget.monthly ?? 0) - budget.spent,
    isOver: !limitless && share >= 1,
    isWarning: !limitless && share >= 0.8 && share < 1,
    pace,
    paceTone: paceState(share, pace ?? 0),
  };
}
