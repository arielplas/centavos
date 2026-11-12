import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { AppStoreBadges } from "@/components/home/AppStoreBadges";
import { HtmlLang } from "@/components/legal/HtmlLang";
import { LanguageSwitcher } from "@/components/legal/LanguageSwitcher";
import { DEFAULT_LANG, navHref, type SiteLang } from "@/lib/lang";
import { getAppLinks } from "@/lib/store-links";
import { faqJsonLd, webApplicationJsonLd } from "@/lib/seo";
import { UI } from "@/lib/ui-strings";

export type FaqItem = { q: string; a: string };

type Props = {
  /** Etiqueta del breadcrumb y de la migaja final. */
  breadcrumb: string;
  /** H1 (puede llevar <span> de color). */
  h1: ReactNode;
  /** Subtítulo del hero. */
  intro: ReactNode;
  /** Datos para el JSON-LD de WebApplication + canonical del FAQ. */
  jsonLd: { name: string; description: string; path: string; idBase: string };
  faq: FaqItem[];
  /** CTA final. */
  cta: { hand: string; title: ReactNode; body: ReactNode; note?: ReactNode };
  /** Aviso legal al pie del contenido. */
  aviso: ReactNode;
  /** El calculador + las secciones de contenido. */
  children: ReactNode;
  /** Idioma del andamiaje (header, breadcrumb, FAQ, badges, footer). Español por defecto. */
  lang?: SiteLang;
  /** La página existe en los dos idiomas: agrega el selector y ajusta `<html lang>`. */
  bilingual?: boolean;
};

/**
 * Andamiaje común de las páginas-herramienta: header, breadcrumb, hero, JSON-LD
 * (WebApplication + FAQPage), sección de FAQ, CTA y footer. El calculador y el
 * contenido específico se pasan como `children`.
 */
export function CalcShell({
  breadcrumb,
  h1,
  intro,
  jsonLd,
  faq,
  cta,
  aviso,
  children,
  lang = DEFAULT_LANG,
  bilingual = false,
}: Props) {
  const { storeUrl, playUrl } = getAppLinks();
  const strings = UI[lang];

  const ruta = (
    <nav aria-label={strings.breadcrumbNav} className={`text-[12px] text-ink-soft${bilingual ? "" : " mb-4"}`}>
      <Link href={navHref("/", lang)} className="hover:text-ink underline underline-offset-2">
        {strings.breadcrumbHome}
      </Link>
      <span aria-hidden className="mx-1.5">
        ›
      </span>
      <span className="text-ink font-semibold">{breadcrumb}</span>
    </nav>
  );

  return (
    <>
      {bilingual && <HtmlLang lang={lang} />}
      <Header lang={lang} />

      {/* JSON-LD en el HTML del servidor (script plano, no next/script). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({ name: jsonLd.name, description: jsonLd.description, path: jsonLd.path, lang }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />

      <main id="contenido">
        <section className="mx-auto max-w-screen-lg px-5 pt-8 pb-10 md:pt-12">
          {/* En una página bilingüe el selector de idioma comparte fila con la ruta. */}
          {bilingual ? (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
              {ruta}
              <LanguageSwitcher path={jsonLd.path} lang={lang} />
            </div>
          ) : (
            ruta
          )}

          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.035em] leading-[0.95] mb-4">
              {h1}
            </h1>
            <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft mb-8">{intro}</p>
          </div>

          {children}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-screen-lg px-5 py-6">
          <div className="bg-mandarina text-ink rounded-[32px] px-6 md:px-12 py-12 md:py-14 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yolk/50" aria-hidden />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-mandarina-deep/30" aria-hidden />
            <div className="relative max-w-lg">
              <div className="font-hand text-2xl leading-none mb-2">{cta.hand}</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.035em] leading-[0.95] mb-4">
                {cta.title}
              </h2>
              <p className="text-[15px] md:text-lg leading-relaxed mb-7 opacity-90">{cta.body}</p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} />
              {cta.note && <p className="text-[13px] mt-5 opacity-80">{cta.note}</p>}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20" aria-labelledby="faq-title">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                {strings.faqKicker}
              </div>
              <h2 id="faq-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">
                {strings.faqTitle}
              </h2>
            </div>
            <div className="space-y-2">
              {faq.map((it) => (
                <details key={it.q} className="group bg-surface border border-rule rounded-2xl px-5 open:border-rule-strong">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {it.q}
                    <span
                      aria-hidden
                      className="w-7 h-7 rounded-full bg-bg border border-rule grid place-items-center text-lg leading-none flex-shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-[14px] leading-relaxed text-ink-soft pb-4 pr-8">{it.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-screen-lg px-5 pb-12">
          <p className="text-center text-[12px] text-ink-soft leading-relaxed max-w-xl mx-auto">{aviso}</p>
        </section>
      </main>

      <AppFooter lang={lang} />
    </>
  );
}

/** Encabezado de sección de contenido reutilizable. */
export const calcH2 = "font-display text-2xl md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] mb-4";
export const calcP = "text-[16px] leading-relaxed text-ink mb-4";
