// Las cuentas de una fila de presupuesto (copia de centavos-app,
// components/BudgetRow.tsx y lo que Pulso hace con los presupuestos).

import type { Budget } from "@/lib/app/api";
import type { SiteLang } from "@/lib/lang";
import { formatMoneyParts, wholeAmount } from "./format";
import { monthPace } from "./ring";

/** Lo que una fila necesita: un presupuesto de `/budgets` o de `/pulse`. */
export type BudgetRowData = Pick<Budget, "id" | "category" | "monthly" | "spent" | "name" | "currency" | "imageUrl"> &
  Partial<Pick<Budget, "shared" | "frozen">>;

/**
 * El mes de una sección: dónde estaría un gasto parejo a la fecha (solo el mes
 * actual) y cuántos días quedan, para la marca de los anillos y el «por día».
 */
export type MonthClock = { pace: number | null; daysLeft: number };

export function monthClock(period: { month: number; year: number }, now: Date = new Date()): MonthClock {
  const pace = monthPace(period.month, period.year, now);
  if (pace === null) return { pace, daysLeft: 0 };
  const days = new Date(period.year, period.month, 0).getDate();
  return { pace, daysLeft: Math.max(1, days - now.getDate() + 1) };
}

/** El mes actual, para `monthClock`. */
export function currentPeriod(now: Date = new Date()): { month: number; year: number } {
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * «$2,649»: el monto solo, sin centavos ni código de moneda. La fila tiene lugar
 * para dos de estos en una línea, algo que «$2,649.00 MXN» nunca cupo.
 */
export function shortMoney(n: number, currency: string, lang: SiteLang): string {
  const { amount } = formatMoneyParts(Math.round(n), currency, lang, { compact: Math.abs(n) >= 100_000 });
  return wholeAmount(amount);
}

export type Tone = "over" | "near" | "fine" | "limitless";

/** El estado de un presupuesto y su uso (`spent / monthly`; 0 sin límite). */
export function toneOf(b: Pick<BudgetRowData, "monthly" | "spent">): { tone: Tone; share: number } {
  if (b.monthly === null) return { tone: "limitless", share: 0 };
  const share = b.monthly > 0 ? b.spent / b.monthly : 0;
  return { tone: share >= 1 ? "over" : share >= 0.8 ? "near" : "fine", share };
}

/** Cuánto del tope va usado; −1 sin límite, para que ordene al final. */
export function usedShare(b: Pick<BudgetRowData, "monthly" | "spent">): number {
  return b.monthly ? b.spent / b.monthly : -1;
}

/** Del que más va usado al que menos; los que no tienen límite, al final. */
export function sortByUse<T extends Pick<BudgetRowData, "monthly" | "spent">>(budgets: readonly T[]): T[] {
  return [...budgets].sort((a, c) => usedShare(c) - usedShare(a));
}

/** Los `n` que más piden una mirada (Pulso muestra 3). */
export function topBudgets<T extends Pick<BudgetRowData, "monthly" | "spent">>(budgets: readonly T[], n = 3): T[] {
  return sortByUse(budgets).slice(0, n);
}
