import { UI } from "@/lib/ui-strings";
import { explicitLangHref, langHref, otherLang, HREFLANG, type SiteLang } from "@/lib/lang";

/**
 * Switches the document between Spanish and English by rewriting the `?lang=`
 * param of the current path.
 *
 * A plain `<a>` on purpose, not `next/link`: a full document load guarantees
 * the right `<html lang>` and fresh metadata, and it keeps the link copyable
 * and shareable as-is.
 *
 * Pass `explicit` on a page that auto-detects the language (the landing), so
 * the link to Spanish carries `?lang=es` and the choice overrides detection.
 *
 * `compact` is the navbar's version: no pill, just the globe and the language's
 * code ("EN", "ES"), so it reads as a setting next to the navbar's actions. The
 * code also goes in its accessible name, so voice control can say it.
 */
export function LanguageSwitcher({
  path,
  lang,
  explicit = false,
  compact = false,
}: {
  path: string;
  lang: SiteLang;
  explicit?: boolean;
  compact?: boolean;
}) {
  const target = otherLang(lang);
  const strings = UI[lang];
  const code = target.toUpperCase();

  return (
    <a
      href={explicit ? explicitLangHref(path, target) : langHref(path, target)}
      hrefLang={HREFLANG[target]}
      lang={HTML_LANG_SHORT[target]}
      aria-label={compact ? `${strings.switchToAria} (${code})` : strings.switchToAria}
      className={
        compact
          ? "inline-flex items-center gap-1.5 min-h-11 px-2 text-[12px] font-bold tracking-wide text-ink-soft hover:text-ink"
          : "inline-flex items-center gap-1.5 min-h-11 rounded-full glass-lite px-3 text-[12px] font-bold tracking-wide text-ink-soft hover:border-ink-soft hover:text-ink"
      }
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="8" cy="8" r="6.4" />
        <path d="M1.6 8h12.8M8 1.6c1.7 2 2.6 4 2.6 6.4S9.7 12.4 8 14.4C6.3 12.4 5.4 10.4 5.4 8S6.3 3.6 8 1.6Z" />
      </svg>
      {compact ? code : strings.switchToLabel}
    </a>
  );
}

/** `lang` attribute for the switcher's own label, so it is read out correctly. */
const HTML_LANG_SHORT: Record<SiteLang, string> = { es: "es", en: "en" };
