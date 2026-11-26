// El código de 6 dígitos (verificar y recuperar): un solo <input> dibujado como
// seis casillas. Lo puro vive aquí.

import { LIMITS } from "./validation";

/** Solo dígitos, a lo más 6: sirve para teclear, pegar («123 456») y autocompletar. */
export function sanitizeCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, LIMITS.CODE_LEN);
}

export function isCodeComplete(code: string): boolean {
  return code.length === LIMITS.CODE_LEN && /^\d+$/.test(code);
}

/** Las seis casillas: el dígito de cada una o "" si aún no lo hay. */
export function codeSlots(code: string): string[] {
  return Array.from({ length: LIMITS.CODE_LEN }, (_, i) => code[i] ?? "");
}

export const RESEND_COOLDOWN_SECONDS = 60;

/** `0:42`, como el temporizador de la app. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
