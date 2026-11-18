// Client for creating a Centavos account from the landing: sign-up, the
// emailed 6-digit verification code, and resending it. Same API and transport
// rules as lib/promo-api.ts (Bearer auth, no cookies, CORS from the browser).
//
// The verify step answers with tokens; this module drops them. The account is
// used in the app, where the person signs in again with the same email.

import { API_CONFIGURED } from "@/lib/promo-api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** Error codes the sign-up card knows how to explain. */
export type SignupErrorCode =
  | "AUTH_EMAIL_TAKEN"
  | "AUTH_CODE_NOT_FOUND"
  | "AUTH_CODE_EXPIRED"
  | "AUTH_CODE_INVALID"
  | "AUTH_CODE_TOO_MANY_ATTEMPTS"
  | "AUTH_EMAIL_ALREADY_VERIFIED"
  | "VALIDATION"
  | "RATE_LIMIT"
  | "NETWORK"
  | "UNKNOWN";

const KNOWN: readonly string[] = [
  "AUTH_EMAIL_TAKEN",
  "AUTH_CODE_NOT_FOUND",
  "AUTH_CODE_EXPIRED",
  "AUTH_CODE_INVALID",
  "AUTH_CODE_TOO_MANY_ATTEMPTS",
  "AUTH_EMAIL_ALREADY_VERIFIED",
  "VALIDATION",
];

export class SignupApiError extends Error {
  constructor(
    readonly code: SignupErrorCode,
    /** Per-field messages of a `VALIDATION` error (keys as the API names them). */
    readonly fields?: Record<string, unknown>,
  ) {
    super(code);
    this.name = "SignupApiError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API_CONFIGURED) throw new SignupApiError("NETWORK");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
    });
  } catch {
    throw new SignupApiError("NETWORK");
  }

  const json: unknown = await response.json().catch(() => null);
  if (response.ok) {
    if (json === null || typeof json !== "object") throw new SignupApiError("UNKNOWN");
    return json as T;
  }
  if (response.status === 429) throw new SignupApiError("RATE_LIMIT");

  const error = (json as { error?: { code?: unknown; fields?: unknown } } | null)?.error;
  const code = typeof error?.code === "string" ? error.code : "";
  if (KNOWN.includes(code)) {
    const fields = error?.fields && typeof error.fields === "object" ? (error.fields as Record<string, unknown>) : undefined;
    throw new SignupApiError(code as SignupErrorCode, fields);
  }
  throw new SignupApiError("UNKNOWN");
}

export type SignupResult = {
  userId: string;
  /** The API skipped the emailed code (development only): the account is ready. */
  verified: boolean;
};

/** Creates the account (or retries an unverified one) and emails a 6-digit code. */
export async function signup(name: string, email: string, password: string): Promise<SignupResult> {
  const body = await post<{ userId?: unknown; emailVerified?: unknown }>("/api/auth/signup", { name, email, password });
  if (typeof body.userId !== "string" || !body.userId) throw new SignupApiError("UNKNOWN");
  return { userId: body.userId, verified: body.emailVerified === true };
}

/** Confirms the emailed code. The tokens in the answer are discarded. */
export async function verifyEmail(userId: string, code: string): Promise<void> {
  await post<unknown>("/api/auth/verify", { userId, code });
}

/** Sends a new code to the account's email. */
export async function resendEmailCode(userId: string): Promise<void> {
  await post<unknown>("/api/auth/resend", { userId });
}
