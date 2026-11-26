// Validación del cliente de las pantallas de acceso. Mismos límites que la app
// (centavos-app, src/lib/limits.ts) y que la API. Todo puro: devuelve la clave
// de copia del mensaje, la pantalla la traduce con `useT()`.

import type { CopyKey } from "@/components/app/copy";

export const LIMITS = {
  EMAIL_MAX: 254,
  /** Entrar acepta hasta 256: no se rechaza una contraseña vieja por larga. */
  LOGIN_PASSWORD_MAX: 256,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72,
  NAME_MAX: 100,
  CODE_LEN: 6,
} as const;

/** Formato razonable de correo (la API tiene la última palabra). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function emailError(email: string): CopyKey | undefined {
  const value = email.trim();
  if (!value) return "auth:validation.emailRequired";
  if (!isValidEmail(value)) return "auth:validation.emailInvalid";
  return undefined;
}

export type LoginErrors = { email?: CopyKey; password?: CopyKey };

export function loginErrors(input: { email: string; password: string }): LoginErrors {
  return {
    email: emailError(input.email),
    password: input.password ? undefined : "auth:validation.passwordRequired",
  };
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some((value) => value !== undefined);
}

/** Contraseña nueva: 8 a 72 caracteres (crear cuenta y recuperar). */
export function newPasswordError(password: string): CopyKey | undefined {
  if (password.length < LIMITS.PASSWORD_MIN) return "auth:validation.passwordTooShort";
  if (password.length > LIMITS.PASSWORD_MAX) return "auth:validation.passwordTooLong";
  return undefined;
}

export function isValidName(name: string): boolean {
  const length = name.trim().length;
  return length >= 1 && length <= LIMITS.NAME_MAX;
}

export type SignupValues = { email: string; accepted: boolean; password: string; name: string };

/**
 * ¿Sirve lo escrito en este paso de crear cuenta? Con eso se habilita el
 * botón: no hay mensajes de validación antes (Apéndice A, como en la app).
 */
export function isSignupStepValid(step: 1 | 2 | 3, values: SignupValues): boolean {
  if (step === 1) return isValidEmail(values.email) && values.accepted;
  if (step === 2) return newPasswordError(values.password) === undefined;
  return isValidName(values.name);
}
