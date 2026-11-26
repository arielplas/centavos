import type { Metadata } from "next";
import { CLAUDE_PATH as PATH, ClaudePage } from "@/components/claude/ClaudePage";
import { CLAUDE_COPY } from "@/components/claude/copy";
import { LANG_PARAM, OG_LOCALE, type SiteLang, langAlternates, langHref, resolveLang } from "@/lib/lang";
import { pageOpenGraph } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// What the link preview shows (app/app/claude/og/route.tsx), described for people who can't see it.
const OG_ALT: Record<SiteLang, string> = {
  es: "Centavos en Claude: «Tus gastos, en una conversación», junto a un chat en el que Claude anota un gasto de $185 en Comida.",
  en: "Centavos in Claude: “Your spending, in a conversation”, next to a chat where Claude logs a $185 expense under Food.",
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);
  const { meta } = CLAUDE_COPY[lang];
  const title = `${meta.title} · Centavos`;
  // Its own image: without one the page had no og:image (setting openGraph here replaces the
  // root's), so chat apps fell back to the logo. The twitter:* tags are set too, or the home
  // page's title and text would show on X.
  const image = { url: langHref("/app/claude/og", lang), width: 1200, height: 630, alt: OG_ALT[lang] };

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: langHref(PATH, lang),
      languages: langAlternates(PATH),
    },
    openGraph: {
      ...pageOpenGraph({
        title,
        description: meta.description,
        path: langHref(PATH, lang),
        locale: OG_LOCALE[lang],
      }),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
      images: [image],
    },
  };
}

export default async function ClaudeConnectorPage({ searchParams }: PageProps) {
  const lang = resolveLang((await searchParams)[LANG_PARAM]);

  return <ClaudePage lang={lang} />;
}
