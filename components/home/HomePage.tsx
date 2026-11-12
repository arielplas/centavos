import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { AppStoreBadges, InlineStoreLinks } from "@/components/home/AppStoreBadges";
import { HOME_COPY } from "@/components/home/copy";
import { MobileDownloadBar } from "@/components/home/MobileDownloadBar";
import {
  PhoneFrame,
  PulsoMock,
  PresupuestosMock,
  SuscripcionesMock,
  MesesSinInteresesMock,
  DivideMock,
  RecordatoriosMock,
} from "@/components/home/PhoneMock";
import { HtmlLang } from "@/components/legal/HtmlLang";
import { DEFAULT_LANG, OG_LOCALE, langAlternates, langHref, navHref, type SiteLang } from "@/lib/lang";
import { getAppLinks } from "@/lib/store-links";
import { appStoreId, faqJsonLd, mobileApplicationJsonLd, pageOpenGraph } from "@/lib/seo";

/** Canonical path of the landing, without the language param. */
const PATH = "/";

/**
 * Metadata for the landing in `lang`. Each language is its own canonical URL
 * (`/` and `/?lang=en`) and both point at each other with hreflang.
 */
export function homeMetadata(lang: SiteLang): Metadata {
  const { meta } = HOME_COPY[lang];
  const iosId = appStoreId(getAppLinks().storeUrl);
  // `app/opengraph-image.png` only reaches routes that do not set their own
  // `openGraph`, and `/` itself because the file sits in its segment. The
  // English route is one level down and does set it, so it names the image.
  const image =
    lang === DEFAULT_LANG ? null : { url: "/opengraph-image.png", width: 1200, height: 630, alt: meta.title };

  return {
    title: { absolute: meta.title },
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: langHref(PATH, lang), languages: langAlternates(PATH) },
    // Safari's Smart App Banner — sends whoever is already on an iPhone to the App Store.
    ...(iosId ? { itunes: { appId: iosId } } : {}),
    openGraph: {
      ...pageOpenGraph({
        title: meta.title,
        description: meta.description,
        path: lang === DEFAULT_LANG ? "" : langHref(PATH, lang),
        locale: OG_LOCALE[lang],
      }),
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.twitterDescription,
      ...(image ? { images: [image] } : {}),
    },
  };
}

// One phone mock per feature card, in the same order as `features.items`.
const FEATURE_MOCKS = [
  { Mock: PresupuestosMock, tilt: -2 },
  { Mock: SuscripcionesMock, tilt: 2 },
  { Mock: MesesSinInteresesMock, tilt: -2 },
] as const;

/**
 * The landing, in either language. Rendered by `app/page.tsx` (Spanish) and
 * `app/en/page.tsx` (English) so both stay fully static; `proxy.ts` decides
 * which one a visitor gets.
 */
export function HomePage({ lang }: { lang: SiteLang }) {
  const { storeUrl, playUrl } = getAppLinks();
  const c = HOME_COPY[lang];

  return (
    <>
      {lang !== DEFAULT_LANG && <HtmlLang lang={lang} />}
      <Script id="ld-mobile-app" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileApplicationJsonLd({ storeUrl, playUrl, lang, ...c.jsonLd })) }} />
      <Script id="ld-faq" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(c.faq.items)) }} />

      <Header mobileCta={false} lang={lang} switcherPath={PATH} />

      <main id="contenido">
        {/* HERO */}
        <section id="hero" className="relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-yolk/25 blur-2xl" aria-hidden />
          <div className="absolute top-40 -left-20 w-64 h-64 rounded-full bg-peach/40 blur-2xl" aria-hidden />

          <div className="relative mx-auto max-w-screen-lg px-5 pt-10 md:pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-surface border border-rule rounded-full pl-4 pr-4 py-1.5 mb-5 whitespace-nowrap">
                <span className="font-hand text-mandarina-deep text-xl leading-none pr-0.5">{c.hero.pillFree}</span>
                <span className="w-px h-3.5 bg-rule" aria-hidden />
                <span className="text-[12px] font-bold text-ink-soft">{c.hero.pillPlatforms}</span>
              </div>
              <h1 className="font-display text-[40px] md:text-[58px] font-extrabold tracking-[-0.045em] leading-[0.94] mb-5">
                {c.hero.titleLead}<br />
                <span className="text-mandarina-deep italic">{c.hero.titleAccent}</span>.
              </h1>
              <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft max-w-md mb-7">
                {c.hero.body}
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} priority />
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-6 text-[13px] font-semibold text-ink-soft" aria-label={c.hero.commitmentsLabel}>
                {c.hero.commitments.map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span className="text-mandarina-deep" aria-hidden>●</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center md:justify-end">
              <p className="sr-only">{c.hero.mockAlt}</p>
              <div aria-hidden>
                <PhoneFrame tilt={2}>
                  <PulsoMock lang={lang} />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN FEATURES */}
        <section className="bg-surface border-y border-rule">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">{c.features.kicker}</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">
                {c.features.title}
              </h2>
            </div>

            <div className="space-y-12 md:space-y-24">
              {c.features.items.map((f, i) => {
                const { Mock, tilt } = FEATURE_MOCKS[i];
                const flip = i % 2 === 1;
                return (
                  <div key={f.t} className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                    <div className={`flex justify-center ${flip ? "md:order-2" : ""}`}>
                      <p className="sr-only">{c.features.mockAlt(f.t)}</p>
                      <div aria-hidden>
                        <PhoneFrame tilt={tilt}>
                          <Mock lang={lang} />
                        </PhoneFrame>
                      </div>
                    </div>
                    <div className={flip ? "md:order-1" : ""}>
                      <div className="font-hand text-mandarina-deep text-2xl leading-none mb-2">{f.kbd}</div>
                      <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
                        {f.t}
                      </h3>
                      <p className="text-[15px] md:text-base leading-relaxed text-ink-soft max-w-md">
                        {f.d}
                      </p>
                      {f.tool && (
                        <p className="mt-4">
                          <Link
                            href={f.tool.href}
                            className="inline-flex items-center gap-1 text-[14px] font-bold text-mandarina-deep underline underline-offset-4 decoration-mandarina hover:decoration-mandarina-deep py-1"
                          >
                            {f.tool.label}
                            <span aria-hidden>→</span>
                          </Link>
                        </p>
                      )}
                      <InlineStoreLinks storeUrl={storeUrl} playUrl={playUrl} lang={lang} className="mt-5 text-ink-soft" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRIVATE BY DESIGN — the promise, once and in full */}
        <section className="mx-auto max-w-screen-lg px-5 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-4">{c.privacy.kicker}</div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.04em] leading-[0.95] mb-6">
              {c.privacy.titleLead}<br /><span className="text-mandarina-deep">{c.privacy.titleAccent}</span>
            </h2>
            <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft max-w-xl mx-auto mb-8">
              {c.privacy.body}
            </p>
            <ul className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {c.privacy.cards.map((card) => (
                <li key={card.t} className="bg-surface border border-rule rounded-3xl p-4 sm:p-5 flex sm:block items-center gap-3">
                  <div aria-hidden className="w-10 h-10 rounded-2xl bg-ink text-bg grid place-items-center text-[15px] font-bold sm:mb-3 flex-shrink-0">✓</div>
                  <div>
                    <div className="font-display text-[15px] font-extrabold tracking-[-0.02em] mb-0.5 sm:mb-1">{card.t}</div>
                    <div className="text-[13px] text-ink-soft leading-relaxed">{card.d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-soft mt-6">
              {c.privacy.noteBefore}{" "}
              <Link href={navHref("/app/privacidad", lang)} className="text-mandarina-deep underline underline-offset-2 font-semibold">{c.privacy.noteLink}</Link>.
            </p>
          </div>
        </section>

        {/* SPLIT EXPENSES — the social hook */}
        <section className="bg-peach">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <div className="font-hand text-mandarina-deep text-2xl leading-none mb-2">{c.split.kbd}</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
                {c.split.titleLead}<br />{c.split.titleRest}
              </h2>
              <p className="text-[15px] md:text-base leading-relaxed text-ink/75 max-w-md mb-7">
                {c.split.body}
              </p>
              <ul className="space-y-3">
                {c.split.bullets.map((li, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span aria-hidden className="w-6 h-6 rounded-full bg-ink text-bg grid place-items-center text-[13px] font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-[14px]">{li}</span>
                  </li>
                ))}
              </ul>
              <InlineStoreLinks storeUrl={storeUrl} playUrl={playUrl} lang={lang} label={c.split.storeLabel} className="mt-6 text-ink/75" />
            </div>
            <div className="flex justify-center md:justify-end">
              <p className="sr-only">{c.split.mockAlt}</p>
              <div aria-hidden>
                <PhoneFrame tilt={2} crop>
                  <DivideMock lang={lang} />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* REMINDERS */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="flex justify-center order-2 md:order-1">
            <p className="sr-only">{c.reminders.mockAlt}</p>
            <div aria-hidden>
              <PhoneFrame tilt={-2} crop>
                <RecordatoriosMock lang={lang} />
              </PhoneFrame>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="font-hand text-mandarina-deep text-2xl leading-none mb-2">{c.reminders.kbd}</div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
              {c.reminders.titleLead}<br />{c.reminders.titleRest}
            </h2>
            <p className="text-[15px] md:text-base leading-relaxed text-ink-soft max-w-md mb-6">
              {c.reminders.body}
            </p>
            <ul className="space-y-3">
              {c.reminders.bullets.map((li, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span aria-hidden className="w-6 h-6 rounded-full bg-ink text-bg grid place-items-center text-[13px] font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-[14px]">{li}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-surface border-y border-rule">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20">
            <div className="text-center mb-10">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">{c.steps.kicker}</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">{c.steps.title}</h2>
            </div>
            <ol className="grid md:grid-cols-3 gap-6">
              {c.steps.items.map((s) => (
                <li key={s.n} className="text-center">
                  <div aria-hidden className="font-display text-6xl font-extrabold tracking-[-0.04em] text-ink/15">{s.n}</div>
                  <h3 className="font-display text-xl font-extrabold tracking-[-0.02em] mt-2 mb-1">{s.t}</h3>
                  <p className="text-[14px] text-ink-soft leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FREE TOOLS — calculators (organic traffic + internal links). Spanish only. */}
        {c.tools && (
          <section className="bg-surface border-y border-rule" aria-labelledby="tools-title">
            <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">{c.tools.kicker}</div>
                <h2 id="tools-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">
                  {c.tools.title}
                </h2>
                <p className="text-[15px] md:text-base text-ink-soft mt-4">
                  {c.tools.body}
                </p>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {c.tools.items.map((t) => (
                  <li key={t.href}>
                    {/* The featured card is the dark one, like the footer and the
                        download button: cream text on ink, with the primary orange
                        as the accent. Ink text on an orange fill read too weakly. */}
                    <Link
                      href={t.href}
                      className={`card-hover block h-full border rounded-2xl p-5 ${
                        t.featured
                          ? "bg-ink border-ink text-bg hover:border-mandarina"
                          : "bg-bg border-rule hover:border-rule-strong"
                      }`}
                    >
                      <div className={`text-[11px] font-extrabold tracking-wider uppercase mb-1.5 ${t.featured ? "text-mandarina" : "text-mandarina-deep"}`}>{t.tag}</div>
                      <div className="font-display text-xl font-extrabold tracking-[-0.02em] mb-1 flex items-center gap-1.5">
                        {t.t}
                        <span aria-hidden className={t.featured ? "text-mandarina" : "text-mandarina-deep"}>→</span>
                      </div>
                      <p className={`text-[13px] leading-relaxed ${t.featured ? "text-bg/80" : "text-ink-soft"}`}>{t.d}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20" aria-labelledby="faq-title">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">{c.faq.kicker}</div>
              <h2 id="faq-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">{c.faq.title}</h2>
            </div>
            <div className="space-y-2">
              {c.faq.items.map((it) => (
                <details key={it.q} className="group bg-surface border border-rule rounded-2xl px-5 open:border-rule-strong">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {it.q}
                    <span aria-hidden className="w-7 h-7 rounded-full bg-bg border border-rule grid place-items-center text-lg leading-none flex-shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                  </summary>
                  <p className="text-[14px] leading-relaxed text-ink-soft pb-4 pr-8">{it.a}</p>
                </details>
              ))}
            </div>
            <p className="text-center text-[13px] text-ink-soft mt-6">
              {c.faq.more}{" "}
              <Link href="/app/soporte" className="text-mandarina-deep underline underline-offset-2 font-semibold">{c.faq.moreLink}</Link>.
            </p>
          </div>
        </section>

        {/* CLOSING — reinforces privacy + CTA */}
        <section id="descargar" className="mx-auto max-w-screen-lg py-6 px-5 pb-16 scroll-mt-20">
          <div className="bg-mandarina text-ink rounded-[32px] px-6 md:px-12 py-12 md:py-16 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yolk/50" aria-hidden />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-mandarina-deep/30" aria-hidden />
            <div className="relative max-w-lg">
              <div className="font-hand text-2xl leading-none mb-2">{c.closing.kbd}</div>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.035em] leading-[0.92] mb-4">
                {c.closing.titleLead}<br />{c.closing.titleRest}
              </h2>
              <p className="text-[15px] md:text-lg leading-relaxed mb-7 opacity-90">
                {c.closing.body}
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} />
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <section className="mx-auto max-w-screen-lg px-5 pb-10">
          <p className="text-center text-[12px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            {c.disclaimer}
          </p>
        </section>
      </main>

      {/* Leaves room for the mobile bottom bar above the footer. */}
      <AppFooter className="pb-24 md:pb-0" lang={lang} />
      <MobileDownloadBar storeUrl={storeUrl} playUrl={playUrl} strings={c.bar} />
    </>
  );
}
