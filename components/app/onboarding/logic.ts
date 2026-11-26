// La lógica del wizard de /app/bienvenida, sin React: montos, correos, el cuerpo
// de `POST /onboarding/apply` y cómo se interpreta la respuesta. Sigue a
// `src/screens/onboarding/shared.tsx` de la app móvil.

import {
  ApiError,
  applyOnboarding,
  newIdempotencyKey,
  skipOnboarding,
  type OnboardingApplyBody,
  type OnboardingApplyResponse,
  type OnboardingCatalogBudget,
  type OnboardingCatalogSubscription,
} from "@/lib/app/api";

export const MAX_INVITES = 20;
export const TRIP_NAME_MAX = 100;
/** Mismo patrón que la API (`EMAIL_REGEX`): lo demás lo decide ella. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Purpose = "personal" | "trip";

// ─── Montos ────────────────────────────────────────────────────────────────

/** Solo dígitos y un punto decimal; las comas (de miles) se descartan. */
export function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

/** El monto escrito, o `NaN` si no es un número. */
export function parseAmount(raw: string): number {
  const cleaned = sanitizeAmount(raw);
  if (cleaned === "" || cleaned === ".") return NaN;
  return Number(cleaned);
}

export function isValidAmount(raw: string): boolean {
  const n = parseAmount(raw);
  return Number.isFinite(n) && n > 0;
}

/** El monto a mandar: solo si la persona lo cambió; si no, la API usa el del catálogo. */
export function editedAmount(raw: string, defaultValue: number): number | undefined {
  const parsed = parseAmount(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed === defaultValue ? undefined : parsed;
}

// ─── Selección de presupuestos y suscripciones ─────────────────────────────

/** Lo que la persona tocó: `sel` y `amt` guardan solo cambios, lo demás sale del catálogo. */
export type Picks = { sel: Record<string, boolean>; amt: Record<string, string> };

export const NO_PICKS: Picks = { sel: {}, amt: {} };

export function budgetAmount(picks: Picks, b: OnboardingCatalogBudget): string {
  return picks.amt[b.key] ?? String(b.defaultMonthly);
}

export function subscriptionAmount(picks: Picks, s: OnboardingCatalogSubscription): string {
  return picks.amt[s.key] ?? String(s.defaultAmount);
}

/** Hay algún elegido con monto que no sirve (vacío o cero): no se puede seguir. */
export function hasInvalidPick<T extends { key: string }>(
  items: readonly T[],
  picks: Picks,
  amountOf: (picks: Picks, item: T) => string,
): boolean {
  return items.some((i) => picks.sel[i.key] && !isValidAmount(amountOf(picks, i)));
}

export function budgetPicks(
  budgets: readonly OnboardingCatalogBudget[],
  picks: Picks,
): { key: string; monthly?: number }[] {
  return budgets
    .filter((b) => picks.sel[b.key])
    .map((b) => {
      const monthly = editedAmount(budgetAmount(picks, b), b.defaultMonthly);
      return monthly === undefined ? { key: b.key } : { key: b.key, monthly };
    });
}

export function subscriptionPicks(
  subscriptions: readonly OnboardingCatalogSubscription[],
  picks: Picks,
): { key: string; amount?: number }[] {
  return subscriptions
    .filter((s) => picks.sel[s.key])
    .map((s) => {
      const amount = editedAmount(subscriptionAmount(picks, s), s.defaultAmount);
      return amount === undefined ? { key: s.key } : { key: s.key, amount };
    });
}

// ─── Invitados del viaje ───────────────────────────────────────────────────

export type InviteError = "invalidEmail" | "ownEmail" | "duplicate" | "max";

/** Agrega un correo a la lista, o dice por qué no. Los correos se comparan sin mayúsculas. */
export function addInvite(
  emails: readonly string[],
  rawInput: string,
  ownEmail?: string | null,
): { emails: string[] } | { error: InviteError } {
  const raw = rawInput.trim();
  if (!EMAIL_RE.test(raw)) return { error: "invalidEmail" };
  const lower = raw.toLowerCase();
  if (ownEmail && lower === ownEmail.trim().toLowerCase()) return { error: "ownEmail" };
  if (emails.some((e) => e.toLowerCase() === lower)) return { error: "duplicate" };
  if (emails.length >= MAX_INVITES) return { error: "max" };
  return { emails: [...emails, raw] };
}

export function isValidTripName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= TRIP_NAME_MAX;
}

// ─── Cuerpo de apply ───────────────────────────────────────────────────────

export function personalBody(args: {
  currency: string;
  language: string;
  budgets: { key: string; monthly?: number }[];
  subscriptions: { key: string; amount?: number }[];
}): OnboardingApplyBody {
  return { ...args, purpose: "personal" };
}

export function tripBody(args: { currency: string; language: string; tripName: string; invites: string[] }): OnboardingApplyBody {
  return { currency: args.currency, language: args.language, purpose: "trip", tripName: args.tripName.trim(), invites: args.invites };
}

/**
 * Una `Idempotency-Key` por cuerpo: un reintento con el mismo cuerpo la reusa
 * (un corte de red no lo aplica dos veces); si la persona cambió algo y vuelve
 * a intentar, es otra petición y lleva otra llave.
 */
export function createKeyHolder(make: () => string = newIdempotencyKey) {
  let lastBody = "";
  let key = "";
  return (body: OnboardingApplyBody): string => {
    const serialized = JSON.stringify(body);
    if (key === "" || serialized !== lastBody) {
      lastBody = serialized;
      key = make();
    }
    return key;
  };
}

// ─── Terminar ──────────────────────────────────────────────────────────────

/** Otra pestaña (u otro dispositivo) ya terminó la configuración: se toma como hecho. */
export function isAlreadyOnboarded(error: unknown): boolean {
  return error instanceof ApiError && (error.code === "ONBOARDING_ALREADY_DONE" || error.status === 409);
}

export type Outcome =
  | { kind: "done"; response: OnboardingApplyResponse }
  | { kind: "already" };

export async function submitApply(body: OnboardingApplyBody, idempotencyKey: string): Promise<Outcome> {
  try {
    return { kind: "done", response: await applyOnboarding(body, idempotencyKey) };
  } catch (error) {
    if (isAlreadyOnboarded(error)) return { kind: "already" };
    throw error;
  }
}

/** `POST /onboarding/skip`. Un 409 también cuenta como hecho. */
export async function submitSkip(): Promise<void> {
  try {
    await skipOnboarding();
  } catch (error) {
    if (!isAlreadyOnboarded(error)) throw error;
  }
}

// ─── Monedas ───────────────────────────────────────────────────────────────

// Las que acepta la API (`CURRENCIES` en src/lib/validate.ts), con las más
// usadas por la gente de la app primero y el resto por código.
const FIRST = ["MXN", "USD", "EUR", "CAD", "GBP", "ARS", "BRL", "CLP", "COP", "PEN", "UYU", "BOB", "PYG", "VES", "GTQ", "HNL", "NIO", "CRC", "PAB", "DOP", "CUP"];
const REST = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BSD", "BTN", "BWP",
  "BYN", "BZD", "CDF", "CHF", "CNY", "CVE", "CZK", "DJF", "DKK", "DZD", "EGP", "ERN", "ETB", "FJD", "FKP", "GEL", "GHS", "GIP", "GMD", "GNF",
  "GYD", "HKD", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD",
  "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MYR",
  "MZN", "NAD", "NGN", "NOK", "NPR", "NZD", "OMR", "PGK", "PHP", "PKR", "PLN", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG",
  "SEK", "SGD", "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS",
  "UAH", "UGX", "UZS", "VED", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWG",
];
export const CURRENCY_CODES: readonly string[] = [...FIRST, ...REST];

export type CurrencyOption = { code: string; name: string };

/** Nombre de la moneda en el idioma dado (`Intl.DisplayNames`); sin él, el código. */
export function currencyName(code: string, lang: string): string {
  try {
    return new Intl.DisplayNames([lang], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function currencyOptions(lang: string): CurrencyOption[] {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([lang], { type: "currency" });
  } catch {
    names = null;
  }
  return CURRENCY_CODES.map((code) => ({ code, name: names?.of(code) ?? code }));
}

function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Filtra por código o por nombre, sin acentos ni mayúsculas. Vacío = todas. */
export function filterCurrencies(options: readonly CurrencyOption[], query: string): CurrencyOption[] {
  const q = fold(query.trim());
  if (!q) return [...options];
  return options.filter((o) => fold(o.code).includes(q) || fold(o.name).includes(q));
}

/** La moneda de la cuenta si la API la acepta; si no, el peso mexicano (el de reserva de la API). */
export function initialCurrency(current: string | null | undefined): string {
  return current && CURRENCY_CODES.includes(current) ? current : "MXN";
}
