import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { AppStoreBadges, InlineStoreLinks } from "@/components/home/AppStoreBadges";
import { HOME_COPY } from "@/components/home/copy";
import { HeroDemo } from "@/components/home/HeroDemo";
import { MobileDownloadBar } from "@/components/home/MobileDownloadBar";
import {
  PhoneFrame,
  PulsoMock,
  PresupuestosSnippet,
  SuscripcionesSnippet,
  MsiSnippet,
  DivideMock,
  ReminderCards,
  SignupMock,
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

// One screen fragment per feature, in the same order as `features.items`.
const FEATURE_SNIPPETS = [PresupuestosSnippet, SuscripcionesSnippet, MsiSnippet] as const;

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
      {/* JSON-LD in the server HTML (plain script, not next/script). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileApplicationJsonLd({ storeUrl, playUrl, lang, ...c.jsonLd })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(c.faq.items)) }}
      />

      <Header mobileCta={false} lang={lang} switcherPath={PATH} />

      <main id="contenido">
        {/* HERO */}
        <section id="hero" className="relative overflow-hidden">
          <div className="relative mx-auto max-w-screen-lg px-5 pt-10 md:pt-16 pb-12 grid md:grid-cols-[1.2fr_.8fr] gap-10 items-center">
            <div>
              <h1 className="font-display text-[40px] md:text-[44px] lg:text-[50px] text-balance font-extrabold tracking-[-0.04em] leading-[0.94] mb-5">
                {c.hero.titleLead}<br />
                <span className="text-mandarina-deep">{c.hero.titleAccent}</span>.
              </h1>
              <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft max-w-md mb-7">
                {c.hero.body}
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} priority />
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-6 text-[15px] font-semibold text-ink-soft" aria-label={c.hero.commitmentsLabel}>
                {c.hero.commitments.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-mandarina-deep" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center md:justify-end">
              <p className="sr-only">{c.hero.mockAlt}</p>
              {/* The phone and its note share one `.demo`: the expense logs itself once. */}
              <HeroDemo className="relative">
                <div aria-hidden>
                  <PhoneFrame>
                    <PulsoMock lang={lang} />
                  </PhoneFrame>
                </div>
                {/* Margin note: centred under the phone at every width. */}
                <div
                  aria-hidden
                  data-hero-note
                  data-a="note"
                  style={{ "--d": "3.45s", "--t": "300ms" } as CSSProperties}
                  className="flex items-center justify-center gap-2 -mt-2 -rotate-3 font-hand text-2xl text-mandarina-deep"
                >
                  <span>{c.hero.note}</span>
                  <svg width="44" height="28" viewBox="0 0 44 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 order-first -rotate-90">
                    <path d="M3 22C12 6 26 4 40 12" />
                    <path d="M31 6l9 6-8 7" />
                  </svg>
                </div>
              </HeroDemo>
            </div>
          </div>
        </section>

        {/* MAIN FEATURES — screen fragments on a notebook sheet */}
        <section className="bg-surface border-y border-rule">
          <div className="mx-auto max-w-screen-lg px-5 py-16">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] max-w-2xl mb-10 md:mb-14">
              {c.features.title}
            </h2>

            {/* Everything inside the sheet sits on the 28px pitch of the rules. */}
            <div className="paper rounded-[20px] border border-rule px-5 py-7 md:pl-[76px] md:pr-10">
              <div className="grid md:grid-cols-3 gap-x-6 gap-y-7">
                {c.features.items.map((f, i) => {
                  const Snippet = FEATURE_SNIPPETS[i];
                  return (
                    <div key={f.t}>
                      <div aria-hidden className="h-[168px] md:h-[308px] overflow-hidden mb-7">
                        <div className="rounded-[28px] border border-rule bg-bg p-3">
                          <Snippet lang={lang} />
                        </div>
                      </div>
                      <h3 className="font-display text-2xl leading-7 font-extrabold tracking-[-0.02em]">{f.t}</h3>
                      <p className="text-[16px] leading-7 text-ink-soft">{f.d}</p>
                      {f.tool && (
                        <p>
                          <Link
                            href={f.tool.href}
                            className="inline-flex items-center h-14 text-[15px] font-bold text-mandarina-deep underline underline-offset-4 decoration-mandarina hover:decoration-mandarina-deep"
                          >
                            {f.tool.label}
                          </Link>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* PRIVATE BY DESIGN — the promise, once and in full */}
        <section className="bg-ink text-bg py-16 md:py-32">
          <div className="mx-auto max-w-screen-lg px-5 grid md:grid-cols-[1.15fr_.85fr] gap-x-14 gap-y-8 md:content-center items-center">
            <h2 className="font-display text-[40px] md:text-6xl lg:text-7xl text-balance font-extrabold leading-[0.95] tracking-[-0.04em] md:col-start-1">
              {c.privacy.title.lead}<br /><span className="text-yolk">{c.privacy.title.accent}</span>
            </h2>
            <div className="md:col-start-2 md:row-start-1 md:row-span-2">
              <p className="sr-only">{c.privacy.mockAlt}</p>
              <SignupMock lang={lang} />
            </div>
            <div className="md:col-start-1">
              <p className="text-lg leading-relaxed text-bg/75 max-w-md">{c.privacy.body}</p>
              <p className="text-base text-bg/75 mt-6">
                {c.privacy.noteBefore}{" "}
                <Link href={navHref("/app/privacidad", lang)} className="text-yolk underline underline-offset-2 font-semibold">{c.privacy.noteLink}</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* SPLIT EXPENSES — the social hook */}
        <section className="bg-peach">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
                <mark className="mark">{c.split.titleLead}</mark><br />{c.split.titleRest}
              </h2>
              <p className="text-base leading-relaxed text-ink/75 max-w-md">
                {c.split.body}
              </p>
              <InlineStoreLinks storeUrl={storeUrl} playUrl={playUrl} lang={lang} label={c.split.storeLabel} className="mt-6 text-ink/75" />
            </div>
            <div className="flex justify-center md:justify-end">
              <p className="sr-only">{c.split.mockAlt}</p>
              <div aria-hidden>
                <PhoneFrame crop>
                  <DivideMock lang={lang} />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* REMINDERS — a strip, no phone */}
        <section className="mx-auto max-w-screen-lg px-5 py-12 md:py-16 grid md:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
              {c.reminders.titleLead}<br />{c.reminders.titleRest}
            </h2>
            <p className="text-base leading-relaxed text-ink-soft max-w-md">
              {c.reminders.body}
            </p>
          </div>
          <div>
            <p className="sr-only">{c.reminders.cardsAlt}</p>
            <div aria-hidden>
              <ReminderCards lang={lang} className="max-w-sm" />
            </div>
          </div>
        </section>

        {/* FREE TOOLS — calculators (organic traffic + internal links). Spanish only. */}
        {c.tools && (
          <section className="bg-surface border-y border-rule" aria-labelledby="tools-title">
            <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20">
              <div className="max-w-2xl mb-10">
                <h2 id="tools-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">
                  {c.tools.title}
                </h2>
                <p className="text-base text-ink-soft mt-4">
                  {c.tools.body}
                </p>
              </div>
              <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {c.tools.items.map((t) => (
                  <li key={t.href} className={t.featured ? "col-span-2 lg:col-span-3" : undefined}>
                    {/* The featured card is the dark one, like the footer and the
                        download button: cream text on ink, with the primary orange
                        as the accent. Ink text on an orange fill read too weakly. */}
                    <Link
                      href={t.href}
                      className={`card-hover block h-full border rounded-2xl p-4 sm:p-5 ${
                        t.featured
                          ? "bg-ink border-ink text-bg hover:border-mandarina"
                          : "bg-bg border-rule hover:border-rule-strong"
                      }`}
                    >
                      <div className="font-display text-xl font-extrabold tracking-[-0.02em]">{t.t}</div>
                      <div className={`text-[13px] mb-1.5 ${t.featured ? "text-bg/70" : "text-ink-soft"}`}>{t.tag}</div>
                      <p className={`text-[14px] leading-relaxed ${t.featured ? "text-bg/80" : "hidden sm:block text-ink-soft"}`}>{t.d}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20 grid md:grid-cols-[.8fr_1.2fr] gap-10" aria-labelledby="faq-title">
          <div>
            <h2 id="faq-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">{c.faq.title}</h2>
            <p className="text-base text-ink-soft mt-4">
              {c.faq.more}{" "}
              <Link href={navHref("/app/soporte", lang)} className="text-mandarina-deep underline underline-offset-2 font-semibold">{c.faq.moreLink}</Link>.
            </p>
          </div>
          <div className="space-y-2">
            {c.faq.items.map((it) => (
              <details key={it.q} className="group bg-surface border border-rule rounded-2xl px-5 open:border-rule-strong">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {it.q}
                  <span aria-hidden className="w-7 h-7 rounded-full bg-bg border border-rule relative flex-shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-3 before:h-0.5 before:bg-ink after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-3 after:h-0.5 after:bg-ink after:rotate-90" />
                </summary>
                <p className="text-[14px] leading-relaxed text-ink-soft pb-4 pr-8">{it.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CLOSING — CTA, plus the disclaimer */}
        <section id="descargar" className="mx-auto max-w-screen-lg py-6 px-5 pb-10 scroll-mt-20">
          <div className="bg-mandarina text-ink rounded-[32px] px-6 md:px-12 py-12 md:py-16 relative overflow-hidden">
            <div
              aria-hidden
              className="bg-surface absolute right-10 -bottom-10 w-72 h-80 rotate-3 will-change-transform rounded-lg shadow-lg hidden md:block overflow-hidden font-hand text-3xl text-ink"
            >
              <div className="absolute inset-y-0 left-12 w-px bg-mandarina/55" />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 flex items-end pb-1 pl-16 border-b border-[#b4cdd8]">
                  {c.closing.entries[i]}
                </div>
              ))}
            </div>
            <div className="relative max-w-lg">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.035em] leading-[0.95] mb-4">
                {c.closing.titleLead}<br />{c.closing.titleRest}
              </h2>
              <p className="text-base md:text-lg leading-relaxed mb-7">
                {c.closing.body}
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} />
            </div>
          </div>
          <p className="text-center text-[12px] text-ink-soft leading-relaxed max-w-xl mx-auto mt-6">
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
