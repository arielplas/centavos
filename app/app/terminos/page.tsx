import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import { TERMS } from "@/components/legal/docs";
import { LANG_PARAM, OG_LOCALE, langAlternates, langHref, resolveLang } from "@/lib/lang";
import { pageOpenGraph } from "@/lib/seo";

/** Canonical path, without the language param. */
const PATH = "/app/terminos";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);
  const doc = TERMS[lang];

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      // Each language is its own canonical URL, and both point at each other
      // with hreflang so neither is treated as a duplicate.
      canonical: langHref(PATH, lang),
      languages: langAlternates(PATH),
    },
    openGraph: pageOpenGraph({
      title: `${doc.title} · Centavos`,
      description: doc.description,
      path: langHref(PATH, lang),
      locale: OG_LOCALE[lang],
    }),
  };
}

export default async function TerminosAppPage({ searchParams }: PageProps) {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);

  return <LegalShell doc={TERMS[lang]} lang={lang} path={PATH} bilingual />;
}
