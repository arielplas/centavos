// Lógica pura de Suscripciones (copia de `centavos-app/src/lib/subscriptions.ts` y de
// `nextChargeDate` / `daysUntilCharge` de `src/lib/format.ts`): cuándo se cobra cada
// una, en qué grupo cae y cómo se dice. Sin React, para probar los bordes de los grupos.

import type { Subscription, SubscriptionsResponse } from "@/lib/app/api";
import { LOCALE } from "@/components/app/ui/format";
import type { SiteLang } from "@/lib/lang";
import type { T } from "@/components/app/copy";

export type DueGroupKey = "week" | "month" | "later";

export type DueItem = {
  sub: Subscription;
  /** Días de calendario que faltan para el próximo cobro; 0 es hoy. */
  days: number;
  /** El próximo cobro, resuelto según la frecuencia. */
  date: Date;
};

export type DueGroup = {
  key: DueGroupKey;
  items: DueItem[];
  /** Lo que de verdad se cobra en esa ventana (montos reales, sin prorratear). */
  total: number;
};

/** Borde superior, en días, de cada grupo. «Más adelante» no tiene. */
export const WEEK_DAYS = 7;
export const MONTH_DAYS = 30;
/** Un cobro a esta distancia se resalta en `mandarina-deep` y negritas. */
export const SOON_DAYS = 3;
/** Tamaño de página al pedir (el máximo del servidor). */
export const PAGE_SIZE = 200;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * El próximo cobro real (no la fecha guardada, que puede estar vencida). Mensual:
 * el mismo día del mes (el último si el mes es más corto); anual: ese día y mes.
 * Hoy cuenta como próximo.
 */
export function nextChargeDate(
  iso: string,
  from: Date = new Date(),
  frequency: "monthly" | "yearly" = "monthly",
): Date {
  const stored = new Date(iso);
  const billingDay = stored.getDate();
  const today = startOfLocalDay(from);

  const occurrenceIn = (year: number, month: number): Date => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(billingDay, lastDay));
  };

  if (frequency === "yearly") {
    const thisYear = occurrenceIn(today.getFullYear(), stored.getMonth());
    if (+thisYear >= +today) return thisYear;
    return occurrenceIn(today.getFullYear() + 1, stored.getMonth());
  }

  const thisMonth = occurrenceIn(today.getFullYear(), today.getMonth());
  if (+thisMonth >= +today) return thisMonth;

  const nextMonthIndex = today.getMonth() + 1;
  return occurrenceIn(today.getFullYear() + Math.floor(nextMonthIndex / 12), nextMonthIndex % 12);
}

/** Días de calendario hasta el próximo cobro, medidos desde `from` (no desde el reloj). */
export function daysUntilCharge(
  iso: string,
  from: Date = new Date(),
  frequency: "monthly" | "yearly" = "monthly",
): number {
  const next = nextChargeDate(iso, from, frequency);
  return Math.round((+next - +startOfLocalDay(from)) / 86_400_000);
}

function groupKeyFor(days: number): DueGroupKey {
  if (days <= WEEK_DAYS) return "week";
  if (days <= MONTH_DAYS) return "month";
  return "later";
}

/**
 * Las suscripciones activas por cercanía del cobro, la más próxima primero.
 * Los grupos vacíos se quitan: nunca hay un encabezado solo.
 */
export function groupByDue(subs: Subscription[], now: Date = new Date()): DueGroup[] {
  const items: DueItem[] = subs
    .filter((s) => s.active)
    .map((sub) => ({
      sub,
      days: daysUntilCharge(sub.nextCharge, now, sub.frequency),
      date: nextChargeDate(sub.nextCharge, now, sub.frequency),
    }))
    .sort((a, b) => +a.date - +b.date || a.sub.name.localeCompare(b.sub.name));

  const order: DueGroupKey[] = ["week", "month", "later"];
  return order
    .map((key) => {
      const inGroup = items.filter((i) => groupKeyFor(i.days) === key);
      return { key, items: inGroup, total: inGroup.reduce((sum, i) => sum + i.sub.amount, 0) };
    })
    .filter((g) => g.items.length > 0);
}

/**
 * Cuándo se cobra, en palabras: relativo dentro de una semana («En 6 días»), fecha
 * corta después, y con el año si cae en otro.
 */
export function chargeWhen(
  item: Pick<DueItem, "days" | "date">,
  t: T,
  lang: SiteLang,
  now: Date = new Date(),
): string {
  if (item.days <= 0) return t("subscriptions:chargedToday");
  if (item.days === 1) return t("subscriptions:chargedTomorrow");
  if (item.days <= WEEK_DAYS) return t("subscriptions:chargedInDays", { count: item.days });
  return item.date.toLocaleDateString(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: item.date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** Las canceladas, en el orden en que llegan de la API. */
export function cancelledOnly(subs: Subscription[]): Subscription[] {
  return subs.filter((s) => !s.active);
}

type Page = (query: { limit: number; offset: number }, signal?: AbortSignal) => Promise<SubscriptionsResponse>;

/**
 * Pide todas las páginas (de 200) y las junta sin repetir. La app pide una sola de 200;
 * aquí se sigue hasta `pagination.total` para que los grupos y sus totales no salgan
 * truncados con una lista larga. Los totales de la cabecera vienen de la primera página.
 */
export async function fetchAllSubscriptions(getPage: Page, signal?: AbortSignal): Promise<SubscriptionsResponse> {
  const first = await getPage({ limit: PAGE_SIZE, offset: 0 }, signal);
  const seen = new Set(first.subscriptions.map((s) => s.id));
  const all = [...first.subscriptions];
  let offset = first.pagination.offset + first.subscriptions.length;
  while (first.pagination.total > all.length && offset < first.pagination.total) {
    const page = await getPage({ limit: PAGE_SIZE, offset }, signal);
    if (page.subscriptions.length === 0) break;
    for (const s of page.subscriptions) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        all.push(s);
      }
    }
    offset += page.subscriptions.length;
  }
  return { ...first, subscriptions: all };
}
