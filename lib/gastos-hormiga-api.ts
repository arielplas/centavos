// Client for the gastos hormiga endpoint of the Centavos API. The contract of
// the endpoint lives here; the transport (fetch, CORS, the error shape) is the
// one in lib/promo-api.ts, and the limits and the maths are in
// lib/gastos-hormiga.ts.
//
//   POST /api/gastos-hormiga/claims        public, no auth, 10 per 15 min per IP
//   { email, language: "es" | "en", items: [{ name, amount, times, period, category }] }
//
//   200 { received: true }     the same whether or not the email has an account
//   400 VALIDATION (`fields`) · 400 BAD_JSON · 429 RATE_LIMIT
//
// No account is created here. When an account with that email is first
// verified in the app, the API creates one budget named «Gastos Hormiga»
// ("Small Expenses" for `language: "en"`) with the list's monthly total as its
// limit and one expense per item. A newer save for the same email replaces the
// previous one, and a list nobody claims is deleted after 180 days.

import type { Item } from "@/lib/gastos-hormiga";
import type { SiteLang } from "@/lib/lang";
import { API_CONFIGURED, PromoApiError, post } from "@/lib/promo-api";

/** Without `NEXT_PUBLIC_API_URL` the page does not offer to save the list. */
export { API_CONFIGURED };

/** What can go wrong when saving, as the page explains it. */
export type SaveErrorCode = "EMAIL" | "LIST" | "RATE_LIMIT" | "NETWORK" | "UNKNOWN";

/** Public: stores the list so it is waiting when `email` signs up in the app. */
export async function saveGastosHormiga(email: string, language: SiteLang, items: Item[]): Promise<void> {
  await post<{ received: boolean }>("/api/gastos-hormiga/claims", { email, language, items });
}

/**
 * The reason a save failed. The keys inside `fields` are not settled, so a
 * `VALIDATION` is only told apart as the email (a `fields.email`) or the list
 * (anything else).
 */
export function saveErrorOf(e: unknown): SaveErrorCode {
  if (!(e instanceof PromoApiError)) return "UNKNOWN";
  if (e.code === "VALIDATION") return e.fields && "email" in e.fields ? "EMAIL" : "LIST";
  return e.code === "RATE_LIMIT" || e.code === "NETWORK" ? e.code : "UNKNOWN";
}
