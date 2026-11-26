// La lógica pura del historial de gastos (/app/gastos): copia de lo que hace
// `HistorialGastos.tsx` de la app, sin React para poder probarla sola.

import type { Expense, ExpensesQuery } from "@/lib/app/api";
import { localDayKey } from "@/components/app/ui/format";

export type Period = "day" | "week" | "month" | "year";

export const PERIODS: readonly Period[] = ["day", "week", "month", "year"];

/** Rangos de Centavos+: una cuenta gratis no puede elegirlos. */
export const LOCKED_PERIODS: readonly Period[] = ["year"];

export const isLocked = (period: Period, isPremium: boolean): boolean => LOCKED_PERIODS.includes(period) && !isPremium;

/** `limit=100`, como la app (el máximo del servidor es 500). */
export const EXPENSES_LIMIT = 100;

/** Espera al escribir en la búsqueda (§4.6: 300 ms) para no gastar el límite de 120 por minuto (§7.2). */
export const SEARCH_DEBOUNCE_MS = 300;

const PERIOD_PARAM = { day: "today", week: "7d", month: "30d" } as const;

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** «YYYY-MM-DDTHH:mm:ss» en hora local, sin zona: el servidor lo lee en `timezone`. */
function wallClock(d: Date): string {
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Hoy / Semana / Mes son periodos móviles del servidor (`today`, `7d`, `30d`);
 * Año manda `from` (1 de enero) y `to` (ahora).
 *
 * A diferencia de la app, que manda `toISOString()`, las cotas van como hora de
 * pared local sin zona: la API las lee con `::timestamp AT TIME ZONE timezone`, que
 * descarta la «Z», y con UTC el 1 de enero perdía las horas de su desfase.
 */
export function rangeParams(period: Period, now: Date = new Date()): Pick<ExpensesQuery, "period" | "from" | "to"> {
  if (period !== "year") return { period: PERIOD_PARAM[period] };
  return { from: `${pad(now.getFullYear(), 4)}-01-01T00:00:00`, to: wallClock(now) };
}

export type Filters = { period: Period; category: string; search: string; isPremium: boolean };

/** Con Centavos+, buscar mira todo el historial: sin periodo ni cotas. Gratis, solo el periodo en pantalla. */
export function searchesAll(search: string, isPremium: boolean): boolean {
  return search.trim().length > 0 && isPremium;
}

/** La consulta de una página. `offset` es lo único que cambia al paginar. */
export function buildQuery(f: Filters, offset = 0, now: Date = new Date()): ExpensesQuery {
  const notes = f.search.trim();
  return {
    ...(searchesAll(f.search, f.isPremium) ? {} : rangeParams(f.period, now)),
    ...(f.category !== "all" ? { category: f.category } : {}),
    ...(notes ? { notes } : {}),
    limit: EXPENSES_LIMIT,
    offset,
  };
}

/** Qué filtros produjeron una lista: la consulta sin lo que cambia al paginar. */
export function queryKeyOf(query: ExpensesQuery): string {
  return JSON.stringify({ ...query, limit: undefined, offset: undefined });
}

export type DayGroup = { day: string; date: string; subtotal: number; rows: Expense[] };

/** Gastos por día local, el más reciente primero; el subtotal es de lo cargado. */
export function groupByDay(expenses: readonly Expense[]): DayGroup[] {
  const byDay = new Map<string, Expense[]>();
  for (const e of expenses) {
    const day = localDayKey(e.date);
    const rows = byDay.get(day);
    if (rows) rows.push(e);
    else byDay.set(day, [e]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, rows]) => ({ day, date: rows[0].date, subtotal: rows.reduce((s, e) => s + e.amount, 0), rows }));
}

/** Suma una página sin repetir lo ya cargado (un gasto nuevo desplaza el offset). */
export function appendUniqueById<T extends { id: string }>(prev: readonly T[], next: readonly T[]): T[] {
  const seen = new Set(prev.map((r) => r.id));
  return [...prev, ...next.filter((r) => !seen.has(r.id))];
}

/** ¿Falta traer más? Se detiene al llegar al total del servidor. */
export function hasMore(loaded: number, total: number): boolean {
  return loaded < total;
}

/** El chip de pagos a meses solo sale si el gasto trae sus cuatro datos. */
export function hasInstallmentChip(
  e: Expense,
): e is Expense & { currentInstallment: number; totalInstallments: number; installmentFrequency: "weekly" | "monthly" } {
  return !!e.hasInstallments && !!e.currentInstallment && !!e.totalInstallments && !!e.installmentFrequency;
}

/**
 * Un debouncer con temporizadores inyectables (para probarlo sin esperar).
 * `push(v)` reinicia la espera; `cancel()` la suelta.
 */
export function createDebouncer<T>(
  onSettle: (value: T) => void,
  ms: number,
  timers: { set: (fn: () => void, ms: number) => unknown; clear: (id: unknown) => void } = {
    set: (fn, d) => setTimeout(fn, d),
    clear: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
  },
) {
  let id: unknown = null;
  return {
    push(value: T) {
      if (id !== null) timers.clear(id);
      id = timers.set(() => {
        id = null;
        onSettle(value);
      }, ms);
    },
    cancel() {
      if (id !== null) timers.clear(id);
      id = null;
    },
  };
}
