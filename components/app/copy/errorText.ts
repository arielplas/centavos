// Texto de un error de la API, por su código (docs/app-web.md §10). Nunca se
// muestra `error.message`: está en inglés y es para quien programa. Sigue a
// `translateError` de la app (src/i18n/errors.ts).

import type { SiteLang } from "@/lib/lang";
import { hasCopy, translate, type CopyKey } from "./index";

/** Pantallas que cambian el texto de un código: el reenvío de código dice 60 s. */
export type ErrorScreen = "resend-code";

type ErrorLike = { code?: string; fields?: Record<string, unknown> };

// Las reglas de `fields` llegan de la API en inglés, con patrones fijos. Se
// pasan a texto local (`translateFieldError` de la app).
const FIELD_RULES: { re: RegExp; es: (n?: string) => string; en: (n?: string) => string }[] = [
  { re: /must be at least (\d+) characters?$/i, es: (n) => `Mínimo ${n} caracteres.`, en: (n) => `Must be at least ${n} characters.` },
  { re: /must be at most (\d+) characters?$/i, es: (n) => `Máximo ${n} caracteres.`, en: (n) => `Must be at most ${n} characters.` },
  { re: /must be at least (\d+)$/i, es: (n) => `Debe ser al menos ${n}.`, en: (n) => `Must be at least ${n}.` },
  { re: /must be at most (\d+)$/i, es: (n) => `Debe ser máximo ${n}.`, en: (n) => `Must be at most ${n}.` },
  { re: /must be a valid email address$/i, es: () => "Escribe un correo válido.", en: () => "Enter a valid email address." },
  { re: /must be one of:/i, es: () => "Elige una opción válida.", en: () => "Choose a valid option." },
  { re: /is required$/i, es: () => "Este campo es obligatorio.", en: () => "This field is required." },
];

/** Una regla de `fields` (en inglés, de la API) en el idioma activo. */
export function fieldErrorText(lang: SiteLang, rule: string): string {
  for (const r of FIELD_RULES) {
    const match = rule.match(r.re);
    if (match) return r[lang](match[1]);
  }
  return lang === "en" ? "Check this field." : "Revisa este campo.";
}

/** Cada campo de un `VALIDATION`, con su regla en el idioma activo. */
export function fieldErrorTexts(
  lang: SiteLang,
  fields: Record<string, unknown> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, rule] of Object.entries(fields ?? {})) {
    out[name] = fieldErrorText(lang, typeof rule === "string" ? rule : "");
  }
  return out;
}

/** Mensaje para una persona. Acepta un `ApiError` o cualquier `{ code, fields }`. */
export function errorText(lang: SiteLang, error: ErrorLike | null | undefined, screen?: ErrorScreen): string {
  const code = error?.code;
  if (code === "NETWORK") return translate(lang, "app:network");
  if (code === "RATE_LIMIT" && screen === "resend-code") return translate(lang, "errors:RATE_LIMIT_RESEND");
  if (code === "VALIDATION") {
    const texts = Object.values(fieldErrorTexts(lang, error?.fields));
    return texts.length > 0 ? texts.join(" ") : translate(lang, "errors:VALIDATION");
  }
  const key = `errors:${code}`;
  const known = !!code && code !== "UNKNOWN" && hasCopy(lang, key);
  if (known) return translate(lang, key as CopyKey);
  if (code && code !== "UNKNOWN" && process.env.NODE_ENV !== "production") {
    console.warn(`[app] código de error sin texto: ${code}`);
  }
  return translate(lang, "common:genericError");
}
