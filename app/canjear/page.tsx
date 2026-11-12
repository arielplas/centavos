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
      <main id="contenido" className="relative overflow-hidden">
        {/* Same soft colour washes as the landing hero. */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yolk/25 blur-2xl" aria-hidden />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-peach/40 blur-2xl" aria-hidden />
        <div className="relative mx-auto max-w-[980px] px-5 pb-20 pt-8 md:pt-12">
          <div className="flex justify-end mb-6 md:mb-8">
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
