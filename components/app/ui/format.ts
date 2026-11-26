// Formato de montos y fechas de las pantallas de datos. Copia de
// centavos-app/src/lib/format.ts, con un cambio: en la app el idioma sale de un
// global (`activeLocale()`); aquí llega como argumento para poder probarlo.
// Desde un componente se usa `useFormat()` (ya atado al idioma activo).
//
// Las monedas nunca se convierten ni se suman entre sí: solo cambian el
// agrupado de miles y los nombres de los meses con el idioma.

import type { SiteLang } from "@/lib/lang";
import type { T } from "@/components/app/copy";
import { currencySymbol } from "./currency";

/** es → es-MX, en → en-US, como la app. */
export const LOCALE: Record<SiteLang, string> = { es: "es-MX", en: "en-US" };

export type MoneyOpts = { compact?: boolean; sign?: boolean };

/**
 * «$1,234.00 MXN» partido en monto («$1,234.00») y moneda («MXN»), para que
 * `<Money>` dibuje el código a la mitad del tamaño. `compact` junta los miles
 * («$1.5k»); `sign` pone «+» a los positivos. El valor es siempre el absoluto:
 * quien quiera un «−» lo pone como prefijo.
 */
export function formatMoneyParts(
  n: number,
  currency: string,
  lang: SiteLang,
  opts?: MoneyOpts,
): { amount: string; currency: string } {
  const sign = opts?.sign && n > 0 ? "+" : "";
  const abs = Math.abs(n);
  const digits =
    opts?.compact && abs >= 1000
      ? compactAmount(abs)
      : abs.toLocaleString(LOCALE[lang], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return { amount: `${sign}${currencySymbol(currency)}${digits}`, currency };
}

// «$1.5k», «$1.2M», «$3B»: un decimal si no es entero, ninguno si lo es.
function compactAmount(abs: number): string {
  const [value, suffix] = abs >= 1e9 ? [abs / 1e9, "B"] : abs >= 1e6 ? [abs / 1e6, "M"] : [abs / 1e3, "k"];
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}${suffix}`;
}

/** «$1,234.00 MXN», el texto plano para interpolar en una frase. */
export function formatMoney(n: number, currency: string, lang: SiteLang, opts?: MoneyOpts): string {
  const { amount, currency: code } = formatMoneyParts(n, currency, lang, opts);
  return `${amount} ${code}`;
}

/** Quita la cola «.00» para que un monto corto conviva con los compactos («$500»). */
export function wholeAmount(amount: string): string {
  return amount.replace(/\.00$/, "");
}

/** «3/12 mensual»: la etiqueta de un gasto que es parte de un plan de pagos. */
export function installmentLabel(
  current: number,
  total: number,
  frequency: "weekly" | "monthly",
  t: T,
): string {
  const every = t(frequency === "weekly" ? "common:installment.weekly" : "common:installment.monthly");
  return `${current}/${total} ${every}`;
}

// Medianoche local: las etiquetas relativas y el agrupado por día razonan en
// días de calendario de la persona, no en ventanas de 24 h.
function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** «YYYY-MM-DD» en la zona de la persona: dos gastos del mismo día local no se parten por la medianoche UTC. */
export function localDayKey(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export type DateStyle = "short" | "long" | "relative";

/**
 * Una fecha en el idioma activo. `relative`: «Hoy», «Ayer», «Hace N días» (menos
 * de una semana) y, si no, la corta. `long`: «26 de noviembre de 2026».
 */
export function formatDate(iso: string, style: DateStyle, lang: SiteLang, t: T, now: Date = new Date()): string {
  const d = new Date(iso);
  if (style === "relative") {
    const diffDays = Math.round((+startOfLocalDay(now) - +startOfLocalDay(d)) / 86_400_000);
    if (diffDays === 0) return t("common:dates.today");
    if (diffDays === 1) return t("common:dates.yesterday");
    if (diffDays < 0) return t("common:dates.inDays", { count: Math.abs(diffDays) });
    if (diffDays < 7) return t("common:dates.agoDays", { count: diffDays });
  }
  return d.toLocaleDateString(LOCALE[lang], {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
  });
}

/** Días que faltan para una fecha (redondeado hacia arriba). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.ceil((+new Date(iso) - +now) / (1000 * 60 * 60 * 24));
}

/** «Ana López» → «AL»; una sola palabra → sus dos primeras letras; vacío → «?». */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
