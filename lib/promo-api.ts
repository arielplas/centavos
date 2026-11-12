// Client for the promo-code endpoints of the Centavos API. The whole contract
// lives here: paths, bodies, response shapes and error codes. The API answers
// CORS preflights and uses Bearer tokens (no cookies), so the browser calls it
// directly.
//
// The access token is only ever held by the caller, in memory: this module does
// not store it anywhere.

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** Whether the API base URL is configured (`NEXT_PUBLIC_API_URL`). */
export const API_CONFIGURED = API_URL !== "";

/** Web client ID for Google sign-in; the Google button is hidden when unset. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/** Who a code is open to: accounts that already existed, and/or new ones. */
export type Audience = { existing: boolean; new: boolean };
export type Preview = { code: string; grantDays: number; audience: Audience };
export type Redemption = { code: string; grantDays: number; premiumUntil: string };

/** Error codes the page knows how to explain. */
export type PromoErrorCode =
  | "PROMO_CODE_NOT_FOUND"
  | "PROMO_CODE_INACTIVE"
  | "PROMO_CODE_EXPIRED"
  | "PROMO_CODE_EXHAUSTED"
  | "PROMO_CODE_ALREADY_REDEEMED"
  | "PROMO_CODE_NOT_ELIGIBLE"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_EMAIL_UNVERIFIED"
  | "AUTH_GOOGLE_TOKEN_INVALID"
  | "AUTH_GOOGLE_EMAIL_UNVERIFIED"
  | "GOOGLE_AUTH_DISABLED"
  | "VALIDATION"
  | "RATE_LIMIT"
  /** The request never got an answer (offline, CORS, API not configured). */
  | "NETWORK"
  /** Any other answer: unknown code, 5xx, a body that is not the contract. */
  | "UNKNOWN";

/** Codes about the promo code itself: they replace the forms. */
export const CODE_ERRORS: readonly PromoErrorCode[] = [
  "PROMO_CODE_NOT_FOUND",
  "PROMO_CODE_INACTIVE",
  "PROMO_CODE_EXPIRED",
  "PROMO_CODE_EXHAUSTED",
  "PROMO_CODE_ALREADY_REDEEMED",
  "PROMO_CODE_NOT_ELIGIBLE",
];

const KNOWN_CODES: readonly string[] = [
  ...CODE_ERRORS,
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_EMAIL_UNVERIFIED",
  "AUTH_GOOGLE_TOKEN_INVALID",
  "AUTH_GOOGLE_EMAIL_UNVERIFIED",
  "GOOGLE_AUTH_DISABLED",
  "VALIDATION",
  "RATE_LIMIT",
];

export class PromoApiError extends Error {
  constructor(
    readonly code: PromoErrorCode,
    /** Per-field messages of a `VALIDATION` error (keys as the API names them). */
    readonly fields?: Record<string, unknown>,
  ) {
    super(code);
    this.name = "PromoApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_CONFIGURED) throw new PromoApiError("NETWORK");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
      // Never send or store cookies: auth is a Bearer token.
      credentials: "omit",
    });
  } catch {
    throw new PromoApiError("NETWORK");
  }

  const body: unknown = await response.json().catch(() => null);

  if (response.ok) {
    if (body === null || typeof body !== "object") throw new PromoApiError("UNKNOWN");
    return body as T;
  }

  if (response.status === 429) throw new PromoApiError("RATE_LIMIT");

  const error = (body as { error?: { code?: unknown; fields?: unknown } } | null)?.error;
  const code = typeof error?.code === "string" ? error.code : "";
  if (KNOWN_CODES.includes(code)) {
    const fields = error?.fields && typeof error.fields === "object" ? (error.fields as Record<string, unknown>) : undefined;
    throw new PromoApiError(code as PromoErrorCode, fields);
  }
  throw new PromoApiError("UNKNOWN");
}

/** Exported for the API's other public endpoint (lib/gastos-hormiga-api.ts). */
export function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

/** One Centavos+ benefit as the paywall advertises it, in both languages. */
export type Benefit = {
  key: string;
  /** Sent by the API as a cross-client fallback; this site never draws it. */
  emoji: string;
  /** Illustration uploaded from the admin panel, when the benefit has one. */
  imageUrl?: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
};

/**
 * Public: the benefits Centavos+ really includes right now (the same list the
 * app's paywall shows), so the page never promises something the plan lacks.
 */
export async function premiumBenefits(): Promise<Benefit[]> {
  const body = await request<{ benefits?: unknown }>("/api/premium/benefits");
  const list = Array.isArray(body.benefits) ? (body.benefits as Benefit[]) : [];
  // A storage URL can come back relative to the API: make it absolute.
  return list.map((b) =>
    b.imageUrl && !/^https?:\/\//.test(b.imageUrl) ? { ...b, imageUrl: `${API_URL}${b.imageUrl}` } : b,
  );
}

/** Public: what the code gives, or a code error. */
export async function previewCode(code: string): Promise<Preview> {
  const body = await request<Omit<Preview, "audience"> & { audience?: Partial<Audience> }>(
    `/api/promo-codes/preview?code=${encodeURIComponent(code)}`,
  );
  // An API that predates the audience switches sends none: such a code is open
  // to everyone. The server enforces the rule either way; this only decides
  // which paths the page offers.
  return {
    code: body.code,
    grantDays: body.grantDays,
    audience: { existing: body.audience?.existing !== false, new: body.audience?.new !== false },
  };
}

/** Grants the code to the account the token belongs to. */
export function redeemCode(code: string, accessToken: string): Promise<Redemption> {
  return post<Redemption>("/api/promo-codes/redeem", { code }, accessToken);
}

/**
 * Public: registers the email so the code is applied when that email signs up
 * in the app. Answers the same whether or not the email already has an account.
 */
export async function claimCode(code: string, email: string): Promise<void> {
  await post<{ received: boolean }>("/api/promo-codes/claims", { code, email });
}

/** What a successful sign-in gives us. The refresh token is deliberately dropped. */
export type Session = {
  accessToken: string;
  /** Google sign-in created the account just now (HTTP 201). */
  isNewUser: boolean;
};

/** Signs in with email and password. */
export async function loginWithPassword(email: string, password: string): Promise<Session> {
  return sessionOf(await post<unknown>("/api/auth/login", { email, password }));
}

/** Signs in with a Google ID token. Creates the account if none exists. */
export async function loginWithGoogle(idToken: string): Promise<Session> {
  return sessionOf(await post<unknown>("/api/auth/google", { idToken }));
}

/** Reads only `accessToken` (and Google's `isNewUser`) from a 2xx login response. */
function sessionOf(body: unknown): Session {
  const { accessToken, isNewUser } = body as { accessToken?: unknown; isNewUser?: unknown };
  if (typeof accessToken !== "string" || !accessToken) throw new PromoApiError("UNKNOWN");
  return { accessToken, isNewUser: isNewUser === true };
}
