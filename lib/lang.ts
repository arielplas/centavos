// Language resolution for the bilingual pages (the landing and the legal
// documents the app links to). The language travels in a query param —
// `?lang=en` — so a single URL is shareable: whoever opens the link gets the
// same language.
//
// Spanish is the house language and the default: no param, an empty param or
// anything we do not recognise all fall back to it instead of 404-ing.

export type SiteLang = "es" | "en";

export const SITE_LANGS: readonly SiteLang[] = ["es", "en"] as const;

export const DEFAULT_LANG: SiteLang = "es";

/** Query param that carries the language (`/app/terminos?lang=en`). */
export const LANG_PARAM = "lang";

/** `<html lang>` value served for each language. */
export const HTML_LANG: Record<SiteLang, string> = { es: "es-MX", en: "en" };

/** `og:locale` value for each language. */
export const OG_LOCALE: Record<SiteLang, string> = { es: "es_MX", en: "en_US" };

/** hreflang value for each language. Spanish is regional, English is generic. */
export const HREFLANG: Record<SiteLang, string> = { es: "es-MX", en: "en" };

/**
 * Normalises whatever arrives in `?lang=` into a supported language.
 * Accepts `en`, `EN`, `en-US`, `en_GB`, `es`, `es-MX`… and tolerates the
 * repeated-param case (`?lang=en&lang=es`), where Next hands us an array and
 * we take the first value. Anything unknown falls back to the default.
 */
export function resolveLang(raw: string | string[] | undefined): SiteLang {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (!value) return DEFAULT_LANG;
  // Match on the primary subtag so `en-US` / `es_MX` behave like `en` / `es`.
  const primary = value.split(/[-_]/)[0];
  return (SITE_LANGS as readonly string[]).includes(primary) ? (primary as SiteLang) : DEFAULT_LANG;
}

/**
 * Strict variant of `resolveLang` for places where "no opinion" matters: a
 * supported language, or `null` when the value is missing or unknown.
 */
export function parseLang(raw: string | null | undefined): SiteLang | null {
  const primary = raw?.trim().toLowerCase().split(/[-_]/)[0];
  return primary && (SITE_LANGS as readonly string[]).includes(primary) ? (primary as SiteLang) : null;
}

/** Cookie that remembers a language the visitor picked by hand. */
export const LANG_COOKIE = "lang";

/**
 * Language for an `Accept-Language` header: the supported language the visitor
 * ranks highest. `es-MX,es;q=0.9,en;q=0.8` is Spanish and `en-US,en;q=0.9,es;q=0.8`
 * is English. No header (crawlers) or no supported language (`fr`, `de`)
 * falls back to the default, which is also what `x-default` points at.
 */
export function langFromAcceptLanguage(header: string | null | undefined): SiteLang {
  if (!header) return DEFAULT_LANG;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { lang: parseLang(tag), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((entry) => entry.lang !== null && entry.weight > 0)
    // Highest weight first; the header order breaks ties.
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return ranked[0]?.lang ?? DEFAULT_LANG;
}

/** The other supported language — used by the in-page language switcher. */
export function otherLang(lang: SiteLang): SiteLang {
  return lang === "es" ? "en" : "es";
}

/**
 * Path for `path` in `lang`. The default language keeps the clean URL (no
 * param), so existing links and the canonical URL do not change.
 */
export function langHref(path: string, lang: SiteLang): string {
  return lang === DEFAULT_LANG ? path : `${path}?${LANG_PARAM}=${lang}`;
}

/**
 * Same as `langHref`, but always carries the param, Spanish included. Used by
 * the switcher on pages that auto-detect the language: a bare `/` would be
 * detected again and bounce an English-device visitor straight back.
 */
export function explicitLangHref(path: string, lang: SiteLang): string {
  return `${path}?${LANG_PARAM}=${lang}`;
}

/**
 * Paths that are served in both languages. Everything else is Spanish-only, so
 * carrying `?lang=` over to it would promise a translation that is not there.
 */
export const BILINGUAL_PATHS: readonly string[] = ["/", "/app/terminos", "/app/privacidad"] as const;

/**
 * Path for a navigation link: localised when the destination is bilingual, left
 * alone when it is not.
 */
export function navHref(path: string, lang: SiteLang): string {
  return BILINGUAL_PATHS.includes(path) ? langHref(path, lang) : path;
}

/**
 * `alternates.languages` map for Next's Metadata API, which turns it into
 * `<link rel="alternate" hreflang="…">`. `x-default` points at the Spanish
 * URL, the one without a param.
 */
export function langAlternates(path: string): Record<string, string> {
  return {
    [HREFLANG.es]: langHref(path, "es"),
    [HREFLANG.en]: langHref(path, "en"),
    "x-default": langHref(path, "es"),
  };
}
