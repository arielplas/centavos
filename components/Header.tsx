import Link from "next/link";
import { UI } from "@/lib/ui-strings";
import { DEFAULT_LANG, navHref, type SiteLang } from "@/lib/lang";
import { Logo } from "./Logo";

/**
 * Single site header (home, support, legal): logo, Support link and a download
 * CTA pointing at the home page's #descargar section.
 *
 * - Sticky on desktop, always showing the CTA.
 * - Not sticky on mobile (on a multi-screen page, a fixed bar with just a logo
 *   steals viewport). The mobile CTA shows unless the page already has its own
 *   bottom download bar (`mobileCta={false}`).
 */
export function Header({
  mobileCta = true,
  lang = DEFAULT_LANG,
}: {
  mobileCta?: boolean;
  lang?: SiteLang;
}) {
  const strings = UI[lang];

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:text-bg focus:rounded-full focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold"
      >
        {strings.skipToContent}
      </a>
      <header className="md:sticky top-0 z-30 bg-bg/95 backdrop-blur-sm border-b border-rule/70">
        <div className="mx-auto max-w-screen-lg flex items-center justify-between px-5 py-3">
          <Logo size={26} />
          <nav aria-label={strings.mainNav} className="flex items-center gap-2 sm:gap-4 text-[13px] font-semibold">
            <Link href={navHref("/app/soporte", lang)} className="text-ink-soft hover:text-ink px-2 py-2.5">
              {strings.support}
            </Link>
            <Link
              href="/#descargar"
              className={`${mobileCta ? "inline-flex" : "hidden md:inline-flex"} items-center whitespace-nowrap bg-ink text-bg rounded-full px-4 py-2 hover:opacity-85`}
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
