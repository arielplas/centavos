// De un error de la API a lo que hace la pantalla (docs/app-web.md §10). Todo
// puro y por código, nunca por `error.message`. El texto lo pone quien dibuja,
// con `useAccessError()`, para que siga al idioma.

import type { CopyKey } from "@/components/app/copy";
import { isApiError } from "@/lib/app/api";

/** `login`: una cuenta sin verificar pasa a Verificar; lo demás es error del formulario. */
export type LoginFailure =
  | { kind: "unverified"; userId?: string; signupToken?: string }
  | { kind: "error"; error: unknown };

export function loginFailure(error: unknown): LoginFailure {
  if (isApiError(error) && error.code === "AUTH_EMAIL_UNVERIFIED") {
    return { kind: "unverified", userId: error.userId, signupToken: error.signupToken };
  }
  return { kind: "error", error };
}

/** `signup`: a qué paso vuelve y dónde se muestra (Apéndice A, §5.2). */
export type SignupFailure = {
  step?: 1 | 2;
  emailKey?: CopyKey;
  passwordKey?: CopyKey;
  /** Lo que sobra, como error del formulario. */
  formError?: unknown;
};

export function signupFailure(error: unknown): SignupFailure {
  if (!isApiError(error)) return { formError: error };
  if (error.code === "AUTH_EMAIL_TAKEN") return { step: 1, emailKey: "errors:AUTH_EMAIL_TAKEN" };
  if (error.code === "VALIDATION" && error.fields) {
    const { email, password, ...rest } = error.fields;
    const formError =
      Object.keys(rest).length > 0
        ? { code: "VALIDATION", fields: rest }
        : email === undefined && password === undefined
          ? error
          : undefined;
    if (email !== undefined) return { step: 1, emailKey: "auth:validation.emailInvalid", formError };
    if (password !== undefined) {
      const tooLong = typeof password === "string" && /at most|too long/i.test(password);
      return {
        step: 2,
        passwordKey: tooLong ? "auth:validation.passwordTooLong" : "auth:validation.passwordTooShort",
        formError,
      };
    }
    return { formError };
  }
  return { formError: error };
}

/** `verify`: qué hace la pantalla con el error (§10). */
export type VerifyFailure = {
  /** Se borra el código escrito. */
  clearCode: true;
  /** «Reenviar código» se destaca: el código ya no sirve. */
  highlightResend: boolean;
  /** Verificar y reenviar quedan deshabilitados. */
  locked: boolean;
};

export function verifyFailure(error: unknown): VerifyFailure {
  const code = isApiError(error) ? error.code : undefined;
  return {
    clearCode: true,
    highlightResend: code === "AUTH_CODE_EXPIRED" || code === "AUTH_CODE_TOO_MANY_ATTEMPTS",
    locked: code === "AUTH_CODE_LOCKED",
  };
}

/** `resend`: salir de Verificar, bloquear, o solo mostrar el mensaje. */
export type ResendFailure = { kind: "alreadyVerified" } | { kind: "noAccount" } | { kind: "locked" } | { kind: "message" };

export function resendFailure(error: unknown): ResendFailure {
  const code = isApiError(error) ? error.code : undefined;
  if (code === "AUTH_EMAIL_ALREADY_VERIFIED") return { kind: "alreadyVerified" };
  if (code === "AUTH_USER_NOT_FOUND") return { kind: "noAccount" };
  if (code === "AUTH_CODE_LOCKED") return { kind: "locked" };
  return { kind: "message" };
}

/** `reset-password`: un token vencido o repetido vuelve al paso 1 (§5.3). */
export function resetPasswordRestarts(error: unknown): boolean {
  return isApiError(error) && error.code === "AUTH_RESET_TOKEN_INVALID";
}
