import type { Metadata } from "next";
import { CanjearFlow } from "@/components/canjear/CanjearFlow";
import { CANJEAR_COPY } from "@/components/canjear/copy";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { HtmlLang } from "@/components/legal/HtmlLang";
import { LANG_PARAM, OG_LOCALE, HREFLANG, otherLang, resolveLang } from "@/lib/lang";

// Promo-code redemption. Marketing shares `/canjear?code=XXX`. It is a utility
// page, not content: noindex, no canonical/hreflang, and not in the sitemap.
// Redemption lives on the website on purpose; the app never has a code field.

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const t = CANJEAR_COPY[resolveLang((await searchParams)[LANG_PARAM])];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    robots: { index: false, follow: false },
    openGraph: { locale: OG_LOCALE[resolveLang((await searchParams)[LANG_PARAM])] },
  };
}

export default async function CanjearPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = resolveLang(params[LANG_PARAM]);
  const rawCode = params.code;
  const initialCode = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.trim().slice(0, 64) ?? "";
  const t = CANJEAR_COPY[lang];

  // Language switch that keeps the code in the link.
  const target = otherLang(lang);
  const switchParams = new URLSearchParams();
  if (initialCode) switchParams.set("code", initialCode);
  switchParams.set(LANG_PARAM, target);

  return (
    <>
      <HtmlLang lang={lang} />
      <Header lang={lang} mobileCta={false} />
      <main id="contenido" className="mx-auto max-w-screen-lg px-5 pb-20 pt-10 md:pt-14">
        <div className="max-w-[520px] mx-auto">
          <div className="flex justify-end mb-4">
            <a
              href={`/canjear?${switchParams}`}
              hrefLang={HREFLANG[target]}
              lang={target}
              aria-label={t.switchAria}
              className="inline-flex items-center rounded-full border border-rule bg-surface px-3 py-1.5 text-[12px] font-bold tracking-wide text-ink-soft hover:border-mandarina-deep hover:text-mandarina-deep"
            >
              {t.switchLabel}
            </a>
          </div>
          <CanjearFlow lang={lang} initialCode={initialCode} />
        </div>
      </main>
      <AppFooter lang={lang} />
    </>
  );
}
