// Lo que el Pulso saca de `GET /api/pulse` (copia de lo que hace `Pulso.tsx` de la
// app, D-1). Sin React: se prueba solo.

import type { Expense, PulseBudget, PulseExpense, PulseResponse } from "@/lib/app/api";
import { topBudgets } from "@/components/app/ui/budget";

/** El Pulso muestra 3 presupuestos y 4 gastos recientes, como la app. */
export const PULSE_BUDGETS = 3;
export const PULSE_RECENT = 4;

/**
 * Un gasto reciente. `/pulse` no manda datos de pagos a meses; los declaramos
 * opcionales (la app también) por si algún día los manda, y entonces sale el chip.
 */
export type RecentExpense = PulseExpense &
  Partial<Pick<Expense, "hasInstallments" | "currentInstallment" | "totalInstallments" | "installmentFrequency">>;

export type PulseView = {
  /** Sin presupuestos: la tarjeta tinta cambia al estado vacío. */
  empty: boolean;
  /** `totalBudget − totalSpent`. Negativo si se pasó. */
  available: number;
  /** Lo gastado ÷ lo presupuestado, de 0 a 1 o más; 0 sin presupuestado. */
  share: number;
  /** `share` en porciento entero, para los textos. */
  percent: number;
  /** Hay presupuestos en otra moneda: los totales no los cubren (`home:onlyCurrency`). */
  hasOffCurrency: boolean;
  /** Los 3 que más piden una mirada: por uso del tope, los sin límite después. */
  budgets: PulseBudget[];
  recent: RecentExpense[];
};

export function pulseView(pulse: PulseResponse, userCurrency: string): PulseView {
  const share = pulse.totalBudget > 0 ? pulse.totalSpent / pulse.totalBudget : 0;
  return {
    empty: pulse.budgets.length === 0,
    available: pulse.totalBudget - pulse.totalSpent,
    share,
    percent: Math.round(share * 100),
    hasOffCurrency: pulse.budgets.some((b) => (b.currency ?? userCurrency) !== userCurrency),
    budgets: topBudgets(pulse.budgets, PULSE_BUDGETS),
    recent: pulse.recentExpenses.slice(0, PULSE_RECENT),
  };
}

/** El chip de pagos a meses solo sale si el gasto trae los cuatro datos. */
export function hasInstallmentChip(
  e: RecentExpense,
): e is RecentExpense & { currentInstallment: number; totalInstallments: number; installmentFrequency: "weekly" | "monthly" } {
  return !!e.hasInstallments && !!e.currentInstallment && !!e.totalInstallments && !!e.installmentFrequency;
}

export const STATUS_KEYS = {
  green: { line: "home:statusGreenLine", sub: "home:statusGreenSub" },
  yellow: { line: "home:statusYellowLine", sub: "home:statusYellowSub" },
  red: { line: "home:statusRedLine", sub: "home:statusRedSub" },
} as const;
