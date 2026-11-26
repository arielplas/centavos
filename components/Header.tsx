import Link from "next/link";
import { WEB_APP_ENABLED } from "@/lib/config";
import { UI } from "@/lib/ui-strings";
import { DEFAULT_LANG, explicitLangHref, navHref, type SiteLang } from "@/lib/lang";
import { LanguageSwitcher } from "./legal/LanguageSwitcher";
import { Logo } from "./Logo";
import { LogoEasterEgg } from "./runner/LogoEasterEgg";

/**
 * Single site header (home, support, legal): logo, then on the right a quiet
 * setting (the language) and the actions (the download CTA pointing at the home
 * page's #descargar section), with a hairline between them on desktop. Soporte
 * lives in the footer (AppFooter, on every page with this header), not here:
 * four items of three different looks crowded the bar.
 *
 * - Sticky on desktop, always showing the CTA.
 * - Not sticky on mobile (on a multi-screen page, a fixed bar with just a logo
 *   steals viewport). The mobile CTA shows unless the page already has its own
 *   bottom download bar or doesn't fit it (`mobileCta={false}`).
 * - `switcherPath` adds the language switcher for that path, in its compact form.
 * - `easterEgg` hides the runner game behind three taps on the logo (the landing).
 * - With the web app live (WEB_APP_ENABLED), "Entrar" joins the actions as an outlined pill
 *   before the download CTA; it goes to /app/entrar, or to `signinHref`. It carries the page's
 *   language only when the page set one: on a Spanish-only page a forced `?lang=es` would be
 *   saved to the shared `lang` cookie and undo an English visitor's choice.
 */
export function Header({
  mobileCta = true,
  lang: langProp,
  switcherPath,
  easterEgg = false,
  signinHref,
}: {
  mobileCta?: boolean;
  lang?: SiteLang;
  switcherPath?: string;
  /** Three taps on the logo open the hidden runner game (the landing only). */
  easterEgg?: boolean;
  /** Where "Entrar" goes instead of /app/entrar, e.g. with a `next` (the Claude page). */
  signinHref?: string;
}) {
  const lang = langProp ?? DEFAULT_LANG;
  const strings = UI[lang];

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:text-bg focus:rounded-full focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold"
      >
        {strings.skipToContent}
      </a>
      {/* A floating glass bar, like the app's tab bar. glass-strong keeps the
          ink-soft links at AA even while the bar passes over the ink band. */}
      <header className="md:sticky top-0 z-30 px-3 pt-3 md:pt-4">
        <div className="glass glass-strong mx-auto max-w-screen-lg flex items-center justify-between rounded-[24px] pl-4 pr-2 py-1.5">
          {easterEgg ? (
            <LogoEasterEgg size={26} href={navHref("/", lang)} label={strings.homeLabel} lang={lang} />
          ) : (
            <Logo size={26} href={navHref("/", lang)} label={strings.homeLabel} />
          )}
          <nav aria-label={strings.mainNav} className="flex items-center gap-2 sm:gap-4 text-[13px] font-semibold">
            {switcherPath && (
              <>
                <LanguageSwitcher path={switcherPath} lang={lang} explicit compact />
                {/* Setting | actions. Desktop only: on phones the CTA may be hidden. */}
                <span aria-hidden className="hidden md:block h-5 w-px bg-rule-strong" />
              </>
            )}
            {WEB_APP_ENABLED && (
              <Link
                href={signinHref ?? (langProp ? explicitLangHref("/app/entrar", langProp) : "/app/entrar")}
                className="inline-flex items-center min-h-11 whitespace-nowrap rounded-full border border-rule-strong px-3 sm:px-4 font-bold text-ink hover:border-ink"
              >
                {strings.signIn}
              </Link>
            )}
            <Link
              href={`${navHref("/", lang)}#descargar`}
              className={`${mobileCta ? "inline-flex" : "hidden md:inline-flex"} items-center min-h-11 whitespace-nowrap bg-ink text-bg rounded-full px-3 sm:px-4 hover:opacity-85`}
            >
              <span className="md:hidden">{strings.download}</span>
              <span className="hidden md:inline">{strings.downloadFull}</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
