// Lógica de «Conectar con Claude» sin React: el vencimiento del código, el
// error por código y las fechas. Aparte de la pantalla para poder probarla sin
// un DOM (docs/app-web.md §4.8).

import type { SiteLang } from "@/lib/lang";

/** Cada cuánto se vuelve a leer el reloj mientras hay un código, igual que la app. */
export const TICK_MS = 15_000;
/** Cuánto dura el «Copiado» en el botón. */
export const COPIED_MS = 2_000;
/** El permiso que distingue «puede registrar» de «solo ve». */
export const WRITE_SCOPE = "centavos.write";

/**
 * Lo que se ve del código en `now`. El código solo sale mientras no haya
 * vencido; al vencer vuelve `null` y la pantalla ofrece generar otro.
 */
export function codeView(
  link: { code: string; expiresAt: string } | null,
  now: number,
): { code: string; minutesLeft: number } | null {
  if (!link) return null;
  const msLeft = Date.parse(link.expiresAt) - now;
  // Una fecha que no se entiende (NaN) cuenta como vencida: mejor pedir otro.
  if (!(msLeft > 0)) return null;
  return { code: link.code, minutesLeft: Math.max(1, Math.ceil(msLeft / 60_000)) };
}

type CopyOutcome = "notAvailable" | "failed";

/**
 * Qué texto mostrar para un error, por código y nunca por `error.message`
 * (§7.1). Solo `CONNECTOR_NOT_AVAILABLE` tiene texto propio; el resto cae en el
 * «no pudimos…» de la acción.
 */
export function failureOf(error: unknown): CopyOutcome {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  return code === "CONNECTOR_NOT_AVAILABLE" ? "notAvailable" : "failed";
}

const DATE_LOCALE: Record<SiteLang, string> = { es: "es-MX", en: "en-US" };

/** «26 de noviembre de 2026» / «November 26, 2026», como `formatDate(iso, "long")` de la app. */
export function formatLongDate(iso: string, lang: SiteLang): string {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return d.toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });
}
