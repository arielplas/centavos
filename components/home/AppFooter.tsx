import Link from "next/link";
import { Logo } from "@/components/Logo";
import { UI } from "@/lib/ui-strings";
import { DEFAULT_LANG, navHref, type SiteLang } from "@/lib/lang";

/**
 * Site footer: logo + tagline + support and legal links.
 *
 * On a page served in English, the links to the bilingual documents keep the
 * `?lang=en` param so the reader stays in the same language when moving between
 * them. The Spanish-only pages are linked without it.
 */
export function AppFooter({
  className = "",
  lang = DEFAULT_LANG,
}: {
  className?: string;
  lang?: SiteLang;
}) {
  const strings = UI[lang];

  const cols = [
    // The calculators are Spanish-only pages about Mexican payroll and tax
    // concepts, so their labels stay in Spanish in both footers: an English
    // label pointing at a Spanish page would promise a translation that is
    // not there.
    { h: "Calculadoras", items: [
      { name: "Aguinaldo",           href: "/aguinaldo" },
      { name: "Finiquito",           href: "/finiquito" },
      { name: "Vacaciones",          href: "/vacaciones" },
      { name: "Meses sin intereses", href: "/meses-sin-intereses" },
      { name: "PTU",                 href: "/ptu" },
      { name: "CETES",               href: "/cetes" },
    ]},
    { h: strings.footerSupportHeading, items: [
      { name: strings.footerSupportLink,   href: navHref("/app/soporte", lang) },
      { name: strings.footerDeleteAccount, href: navHref("/app/eliminar-cuenta", lang) },
    ]},
    { h: strings.footerLegalHeading, items: [
      { name: strings.footerTerms,   href: navHref("/app/terminos", lang) },
      { name: strings.footerPrivacy, href: navHref("/app/privacidad", lang) },
    ]},
  ];

  return (
    <footer className={`bg-ink text-bg ${className}`}>
      <div className="mx-auto max-w-screen-lg px-5 py-10 md:py-14">
        <Logo size={30} color="var(--color-bg)" dotColor="var(--color-mandarina)" />
        <p className="font-hand text-mandarina text-2xl mt-4 mb-2">{strings.footerTagline}</p>

        <nav aria-label={strings.footerNav} className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
          {cols.map((col) => (
            <div key={col.h}>
              <div className="text-[11px] font-extrabold tracking-[0.06em] text-mandarina uppercase mb-2">
                {col.h}
              </div>
              <ul>
                {col.items.map((it) => (
                  <li key={it.name}>
                    <Link href={it.href} className="block py-2 text-[13px] text-bg/75 hover:text-bg">
                      {it.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-5 border-t border-bg/10 text-[11px] text-bg/60 tracking-wide flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} Centavos · {strings.footerMadeIn}</span>
        </div>
      </div>
    </footer>
  );
}
