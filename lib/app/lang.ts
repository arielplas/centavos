// Idioma de la app web (docs/app-web.md §9.1). Lógica pura, sin React ni DOM:
// el proveedor (components/app/LanguageProvider.tsx) la llama con lo que lee
// del navegador.
//
// Orden, de mayor a menor:
//   1. `?lang=es|en` en la URL
//   2. la cookie `lang` (la misma de la landing)
//   3. `user.language` de `GET /me`, con sesión
//   4. `navigator.languages`
//   5. español

import { DEFAULT_LANG, LANG_COOKIE, parseLang, type SiteLang } from "@/lib/lang";

export type LangSources = {
  /** Valor crudo de `?lang=`. */
  param?: string | null;
  /** Valor crudo de la cookie `lang`. */
  cookie?: string | null;
  /** `language` de `GET /me`. */
  userLanguage?: string | null;
  /** `navigator.languages`, en orden de preferencia. */
  navigatorLanguages?: readonly string[] | null;
};

/** El primero de `navigator.languages` que sea es o en. */
export function langFromNavigator(languages: readonly string[] | null | undefined): SiteLang | null {
  for (const tag of languages ?? []) {
    const lang = parseLang(tag);
    if (lang) return lang;
  }
  return null;
}

/** El idioma de la web según las cinco fuentes de §9.1. */
export function pickLang(sources: LangSources): SiteLang {
  return (
    parseLang(sources.param) ??
    parseLang(sources.cookie) ??
    parseLang(sources.userLanguage) ??
    langFromNavigator(sources.navigatorLanguages) ??
    DEFAULT_LANG
  );
}

/** Un año, como la landing. */
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Valor de la cookie `lang` dentro de un `document.cookie`, o null. */
export function readLangCookie(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== LANG_COOKIE) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

/** Lo que se asigna a `document.cookie` para recordar el idioma. */
export function serializeLangCookie(lang: SiteLang): string {
  return `${LANG_COOKIE}=${lang}; Path=/; Max-Age=${LANG_COOKIE_MAX_AGE}; SameSite=Lax`;
}
