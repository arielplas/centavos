import type { Metadata } from "next";
import { Fragment } from "react";
import { CalcShell, calcH2 } from "@/components/calc/CalcShell";
import { API_CONFIGURED } from "@/lib/gastos-hormiga-api";
import { OG_LOCALE, langAlternates, langHref, type SiteLang } from "@/lib/lang";
import { SITE, pageOpenGraph } from "@/lib/seo";
import { GastosHormigaCalculator } from "./GastosHormigaCalculator";
import { GASTOS_HORMIGA_PAGE } from "./page-copy";

/** Canonical path of the calculator, without the language param. */
const PATH = "/gastos-hormiga";

/**
 * Metadata for the calculator in `lang`. Each language is its own canonical URL
 * (`/gastos-hormiga` and `/gastos-hormiga?lang=en`) and both point at each
 * other with hreflang.
 *
 * The image and the Twitter card are spelled out because the layout's do not
 * reach this page as they are: setting `openGraph` drops the file-based image,
 * and an inherited `twitter` would carry the landing's Spanish title.
 */
export function gastosHormigaMetadata(lang: SiteLang): Metadata {
  const { meta } = GASTOS_HORMIGA_PAGE[lang];
  const title = `${meta.title} · ${SITE.name}`;
  const image = { url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE.name };

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: langHref(PATH, lang), languages: langAlternates(PATH) },
    openGraph: {
      ...pageOpenGraph({
        title,
        description: meta.description,
        path: langHref(PATH, lang),
        locale: OG_LOCALE[lang],
      }),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: meta.description, images: [image] },
  };
}

/**
 * The gastos hormiga calculator, in either language. Rendered by
 * `app/gastos-hormiga/page.tsx` (Spanish) and `app/en/gastos-hormiga/page.tsx`
 * (English) so both stay fully static; `proxy.ts` serves the English one at
 * `/gastos-hormiga?lang=en`.
 */
export function GastosHormigaPage({ lang }: { lang: SiteLang }) {
  const c = GASTOS_HORMIGA_PAGE[lang];
  // The answer about saved data only mentions saving where the page offers it.
  const faq = [...c.faq, { q: c.storageFaq.q, a: API_CONFIGURED ? c.storageFaq.aWithSave : c.storageFaq.a }];

  return (
    <CalcShell
      lang={lang}
      bilingual
      breadcrumb={c.breadcrumb}
      h1={c.h1}
      intro={c.intro}
      jsonLd={{ name: c.meta.title, description: c.meta.description, path: PATH, idBase: "gastos-hormiga" }}
      faq={faq}
      cta={c.cta}
      aviso={c.aviso}
    >
      <GastosHormigaCalculator lang={lang} />

      <div className="max-w-2xl mt-12">
        {c.sections.map((section, i) => (
          <Fragment key={section.title}>
            <h2 className={i === 0 ? calcH2 : `${calcH2} mt-12`}>{section.title}</h2>
            {section.body}
          </Fragment>
        ))}
      </div>
    </CalcShell>
  );
}
