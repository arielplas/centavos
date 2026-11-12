import type { Metadata } from "next";
import { CanjearFlow } from "@/components/canjear/CanjearFlow";
import { CANJEAR_COPY } from "@/components/canjear/copy";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { HtmlLang } from "@/components/legal/HtmlLang";
import { LANG_PARAM, OG_LOCALE, HREFLANG, otherLang, resolveLang } from "@/lib/lang";
import { fetchPromoPreview, normalizeCode } from "@/lib/promo-preview";
import { SITE } from "@/lib/seo";

// Promo-code redemption. Marketing shares `/canjear?code=XXX`. It is a utility
// page, not content: noindex, no canonical/hreflang, and not in the sitemap.
// Redemption lives on the website on purpose; the app never has a code field.

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// A shared link is read by chat apps and social networks before anyone opens
// it, so the preview states the offer itself: the title, a line on how to use
// the code, and an image of the coupon. Without a valid code it falls back to
// the generic text and the site's own image.
//
// `openGraph` and `twitter` are spelled out in full because Next.js does not
// deep-merge them with the layout's: defining either here drops the inherited
// fields, the file-based image included.
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = resolveLang(params[LANG_PARAM]);
  const t = CANJEAR_COPY[lang];
  const preview = await fetchPromoPreview(normalizeCode(params.code));

  const title = preview ? t.offerBody(preview.grantDays) : t.metaTitle;
  const description = preview ? t.metaOfferDescription(preview.code) : t.metaDescription;
  const image = preview
    ? {
        url: `/canjear/og?code=${encodeURIComponent(preview.code)}&${LANG_PARAM}=${lang}`,
        width: 1200,
        height: 630,
        alt: t.ogAlt(preview.code, preview.grantDays),
      }
    : { url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE.name };

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: OG_LOCALE[lang],
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
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
