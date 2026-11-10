import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { UI } from "@/lib/ui-strings";
import { DEFAULT_LANG, type SiteLang } from "@/lib/lang";
import { BackToTop } from "./BackToTop";
import { HtmlLang } from "./HtmlLang";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { LegalDoc } from "./types";

/**
 * Shared layout for the app's legal pages (/app/terminos, /app/privacidad,
 * /app/eliminar-cuenta): site header, side TOC on desktop and collapsible on
 * mobile, ~720px of content, shared footer.
 *
 * Pass `bilingual` for the documents that exist in both languages; it adds the
 * language switcher and keeps `<html lang>` in step with what is served.
 */
export function LegalShell({
  doc,
  lang = DEFAULT_LANG,
  path,
  bilingual = false,
}: {
  doc: LegalDoc;
  lang?: SiteLang;
  /** Path of this page, without the language param (e.g. "/app/terminos"). */
  path: string;
  bilingual?: boolean;
}) {
  const strings = UI[lang];

  // Section anchors stay language-independent (#seccion-N) so a link shared
  // with an anchor lands on the same clause in either language.
  const tocItems = (
    <ol className="space-y-1 border-l border-rule">
      {doc.sections.map((s, i) => (
        <li key={i}>
          <a
            href={`#seccion-${i + 1}`}
            className="block pl-3 -ml-px py-1 border-l border-transparent text-[13px] leading-snug text-ink-soft hover:text-mandarina-deep hover:border-mandarina-deep"
          >
            {i + 1}. {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      {bilingual && <HtmlLang lang={lang} />}
      <Header lang={lang} />

      <main id="contenido" className="mx-auto max-w-screen-lg px-5 pb-16 md:grid md:grid-cols-[230px_1fr] md:gap-10">
        {/* Side TOC (desktop only) */}
        <aside className="hidden md:block pt-12" aria-label={strings.tableOfContents}>
          <nav className="sticky top-20">
            <div className="text-[11px] font-extrabold tracking-[0.06em] text-ink-soft uppercase mb-3">
              {strings.onThisPage}
            </div>
            {tocItems}
          </nav>
        </aside>

        {/* Content */}
        <article className="max-w-[720px] pt-10 md:pt-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-[12px] font-bold tracking-wide text-ink-soft uppercase">
              {strings.lastUpdated}: {doc.updated}
            </p>
            {bilingual && <LanguageSwitcher path={path} lang={lang} />}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.035em] leading-[1.0] mb-5">
            {doc.title}
          </h1>
          <div className="text-[15px] leading-relaxed text-ink-soft mb-8">{doc.intro}</div>

          {/* Collapsible TOC (mobile only): without it, 13–17 sections and no way to jump. */}
          <details className="md:hidden mb-10 bg-surface border border-rule rounded-2xl px-4 py-3">
            <summary className="cursor-pointer text-[13px] font-extrabold tracking-wide uppercase text-ink py-1">
              {strings.onThisPage} ({doc.sections.length})
            </summary>
            <nav aria-label={strings.tableOfContents} className="mt-3">{tocItems}</nav>
          </details>

          <div className="legal-body space-y-10">
            {doc.sections.map((s, i) => (
              <LegalSectionBlock key={i} n={i + 1} title={s.title}>
                {s.body}
              </LegalSectionBlock>
            ))}
          </div>
        </article>
      </main>

      <AppFooter lang={lang} />

      <BackToTop lang={lang} />
    </>
  );
}

/** Numbered section with a stable anchor (#seccion-N). */
function LegalSectionBlock({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`seccion-${n}`} className="scroll-mt-20">
      <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-[-0.022em] mb-3">
        {n}. {title}
      </h2>
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink/85 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_b]:text-ink [&_a]:text-mandarina-deep [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  );
}
