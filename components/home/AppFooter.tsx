import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { UI } from "@/lib/ui-strings";
import { DEFAULT_LANG, navHref, type SiteLang } from "@/lib/lang";
import { INSTAGRAM_URL, TIKTOK_URL } from "@/lib/social-links";

type FooterItem = {
  name: string;
  href: string;
  /** Glyph shown before the name (the social links). */
  icon?: ReactNode;
  /** Leaves the site: opens in a new tab. */
  external?: boolean;
};

// Brand glyphs of the social links. Decorative: the link text names the network.
const glyph = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

function InstagramIcon() {
  return (
    <svg {...glyph}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5.25-4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg {...glyph}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/**
 * Site footer: logo + tagline + calculator, support, legal and social links.
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

  const cols: { h: string; items: FooterItem[] }[] = [
    // The calculators are Spanish-only pages about Mexican payroll and tax
    // concepts, so their labels stay in Spanish in both footers: an English
    // label pointing at a Spanish page would promise a translation that is
    // not there. The gastos hormiga calculator is the exception: it exists in
    // both languages, so its label and its link follow the page.
    { h: "Calculadoras", items: [
      { name: "Aguinaldo",           href: "/aguinaldo" },
      { name: "Finiquito",           href: "/finiquito" },
      { name: "Vacaciones",          href: "/vacaciones" },
      { name: "Meses sin intereses", href: "/meses-sin-intereses" },
      { name: "PTU",                 href: "/ptu" },
      { name: "CETES",               href: "/cetes" },
      { name: strings.footerGastosHormiga, href: navHref("/gastos-hormiga", lang) },
    ]},
    { h: strings.footerSupportHeading, items: [
      { name: strings.footerSupportLink,   href: navHref("/app/soporte", lang) },
      { name: strings.footerDeleteAccount, href: navHref("/app/eliminar-cuenta", lang) },
    ]},
    { h: strings.footerLegalHeading, items: [
      { name: strings.footerTerms,   href: navHref("/app/terminos", lang) },
      { name: strings.footerPrivacy, href: navHref("/app/privacidad", lang) },
    ]},
    // The only footer links that leave the site, so they open in a new tab and
    // say so to screen readers.
    { h: strings.footerSocialHeading, items: [
      { name: "Instagram", href: INSTAGRAM_URL, icon: <InstagramIcon />, external: true },
      { name: "TikTok",    href: TIKTOK_URL,    icon: <TikTokIcon />,    external: true },
    ]},
  ];

  return (
    <footer className={`bg-ink text-bg ${className}`}>
      <div className="mx-auto max-w-screen-lg px-5 py-10 md:py-14">
        <Logo size={30} color="var(--color-bg)" dotColor="var(--color-mandarina)" href={navHref("/", lang)} label={strings.homeLabel} />
        <p className="font-hand text-mandarina text-2xl mt-4 mb-2">{strings.footerTagline}</p>

        <nav aria-label={strings.footerNav} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
          {cols.map((col) => (
            <div key={col.h}>
              <div className="text-[11px] font-extrabold tracking-[0.06em] text-mandarina uppercase mb-2">
                {col.h}
              </div>
              <ul>
                {col.items.map((it) => (
                  <li key={it.name}>
                    {it.external ? (
                      <a
                        href={it.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 py-2 text-[13px] text-bg/75 hover:text-bg"
                      >
                        {it.icon}
                        <span>
                          {it.name}
                          <span className="sr-only"> {strings.footerNewTab}</span>
                        </span>
                      </a>
                    ) : (
                      <Link href={it.href} className="block py-2 text-[13px] text-bg/75 hover:text-bg">
                        {it.name}
                      </Link>
                    )}
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
