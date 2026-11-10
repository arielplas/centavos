import { UI } from "@/lib/ui-strings";
import { langHref, otherLang, HREFLANG, type SiteLang } from "@/lib/lang";

/**
 * Switches the document between Spanish and English by rewriting the `?lang=`
 * param of the current path.
 *
 * A plain `<a>` on purpose, not `next/link`: a full document load guarantees
 * the right `<html lang>` and fresh metadata, and it keeps the link copyable
 * and shareable as-is.
 */
export function LanguageSwitcher({ path, lang }: { path: string; lang: SiteLang }) {
  const target = otherLang(lang);
  const strings = UI[lang];

  return (
    <a
      href={langHref(path, target)}
      hrefLang={HREFLANG[target]}
      lang={HTML_LANG_SHORT[target]}
      aria-label={strings.switchToAria}
      className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-[12px] font-bold tracking-wide text-ink-soft hover:border-mandarina-deep hover:text-mandarina-deep"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="8" cy="8" r="6.4" />
        <path d="M1.6 8h12.8M8 1.6c1.7 2 2.6 4 2.6 6.4S9.7 12.4 8 14.4C6.3 12.4 5.4 10.4 5.4 8S6.3 3.6 8 1.6Z" />
      </svg>
      {strings.switchToLabel}
    </a>
  );
}

/** `lang` attribute for the switcher's own label, so it is read out correctly. */
const HTML_LANG_SHORT: Record<SiteLang, string> = { es: "es", en: "en" };
