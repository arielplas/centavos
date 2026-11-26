import type { Metadata } from "next";
import { CLAUDE_PATH as PATH, ClaudePage } from "@/components/claude/ClaudePage";
import { CLAUDE_COPY } from "@/components/claude/copy";
import { LANG_PARAM, OG_LOCALE, langAlternates, langHref, resolveLang } from "@/lib/lang";
import { pageOpenGraph } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);
  const { meta } = CLAUDE_COPY[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: langHref(PATH, lang),
      languages: langAlternates(PATH),
    },
    openGraph: pageOpenGraph({
      title: `${meta.title} · Centavos`,
      description: meta.description,
      path: langHref(PATH, lang),
      locale: OG_LOCALE[lang],
    }),
  };
}

export default async function ClaudeConnectorPage({ searchParams }: PageProps) {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);

  return <ClaudePage lang={lang} />;
}
