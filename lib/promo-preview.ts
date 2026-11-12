// Server-side lookup of a promo code's offer, for the link preview (page
// metadata and the social image). The page itself still asks the API from the
// browser; this exists because a crawler never runs that script.

import type { Preview } from "@/lib/promo-api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

// Same shape the API accepts; anything else cannot be a code, so no request.
const CODE_RE = /^[A-Z0-9][A-Z0-9_-]{2,31}$/;

/** The code as the API stores it, or `null` when it cannot be one. */
export function normalizeCode(raw: string | string[] | undefined | null): string | null {
  const code = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase() ?? "";
  return CODE_RE.test(code) ? code : null;
}

/**
 * What a code gives, or `null` when it does not exist, cannot be redeemed, or
 * the API did not answer. Never throws: a preview must not break the page.
 *
 * Cached for five minutes per code. Every request from here reaches the API
 * from this server's address, which has one shared rate-limit bucket there, so
 * a busy campaign link must not turn into one API call per visitor.
 */
export async function fetchPromoPreview(code: string | null): Promise<Pick<Preview, "code" | "grantDays"> | null> {
  if (!code || !API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/promo-codes/preview?code=${encodeURIComponent(code)}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { code?: unknown; grantDays?: unknown };
    if (typeof body.code !== "string" || typeof body.grantDays !== "number") return null;
    return { code: body.code, grantDays: body.grantDays };
  } catch {
    return null;
  }
}
