// Los meses del selector y su candado de Centavos+ (copia de centavos-app,
// components/MonthPicker.tsx). Sin React: la regla se prueba sola.
//
// REGLA FIJA (decisión del dueño): una cuenta gratis ve **este mes y los dos
// anteriores** (FREE_MONTHS = 3). Los demás se listan con la insignia Centavos+
// pero no se abren. Centavos+ abre los 12 que lista la pantalla.

import type { SiteLang } from "@/lib/lang";
import { LOCALE } from "./format";

export type MonthOption = { key: string; month: number; year: number; label: string };

/** Meses que una cuenta gratis puede abrir, del más nuevo al más viejo. */
export const FREE_MONTHS = 3;

/** Meses que lista una pantalla de presupuestos (los abre Centavos+). */
export const LISTED_MONTHS = 12;

/**
 * El mes actual y los `count − 1` anteriores, del más nuevo al más viejo. El
 * constructor de `Date` resuelve el cruce de año: para enero, el mes −1 es
 * diciembre del año anterior. `label` es el nombre solo; el año va aparte.
 */
export function recentMonths(count: number, lang: SiteLang, now: Date = new Date()): MonthOption[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const name = d.toLocaleDateString(LOCALE[lang], { month: "long" });
    return {
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: name.charAt(0).toUpperCase() + name.slice(1),
    };
  });
}

/** Cuántos de los `total` meses puede abrir la cuenta. */
export function openableMonths(isPremium: boolean, total: number, freeMonths: number = FREE_MONTHS): number {
  return isPremium ? total : Math.min(freeMonths, total);
}

/** ¿El mes en la posición `index` (0 = el actual) está bloqueado para esta cuenta? */
export function isMonthLocked(
  index: number,
  isPremium: boolean,
  total: number,
  freeMonths: number = FREE_MONTHS,
): boolean {
  return index >= openableMonths(isPremium, total, freeMonths);
}
