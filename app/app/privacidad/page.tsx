import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import { PRIVACY } from "@/components/legal/docs";
import { LANG_PARAM, OG_LOCALE, langAlternates, langHref, resolveLang } from "@/lib/lang";
import { pageOpenGraph } from "@/lib/seo";

/** Canonical path, without the language param. */
const PATH = "/app/privacidad";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);
  const doc = PRIVACY[lang];

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
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

export default async function PrivacidadAppPage({ searchParams }: PageProps) {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);

  return <LegalShell doc={PRIVACY[lang]} lang={lang} path={PATH} bilingual />;
}
