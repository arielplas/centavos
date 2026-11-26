import Link from "next/link";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { HtmlLang } from "@/components/legal/HtmlLang";
import { WEB_APP_ENABLED } from "@/lib/config";
import { navHref, type SiteLang } from "@/lib/lang";
import { faqJsonLd } from "@/lib/seo";
import { ConnectTabs } from "./ConnectTabs";
import { CopyUrlButton } from "./CopyUrlButton";
import { FaqAccordion } from "./FaqAccordion";
import { Rich } from "./Rich";
import { CLAUDE_COPY, pick } from "./copy";

/** Después de entrar o de crear la cuenta (y del onboarding), directo a sacar el código. */
const CONNECT_NEXT = encodeURIComponent("/app/conectar-claude");

/** Canonical path of the page, without the language param. */
export const CLAUDE_PATH = "/app/claude";

/** Address people paste into Claude's "Add custom connector" dialog. */
const CONNECTOR_URL = "https://api.centavos.mx/mcp";

const h2 = "font-display font-extrabold leading-none tracking-[-0.035em] text-balance";
const container = "mx-auto max-w-screen-lg px-5";
const pillPrimary =
  "inline-flex items-center justify-center gap-2.5 min-h-[52px] rounded-full bg-mandarina px-6 text-[16px] font-extrabold text-ink shadow-[0_10px_24px_-12px_rgb(168_74_34/.7)] hover:opacity-90";

const ICONS = {
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  desktop: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  rows: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z" />
      <path d="M9.5 12.5 11.5 14.5 15 10.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  power: (
    <>
      <path d="M12 3v9" />
      <path d="M6.3 7a8 8 0 1 0 11.4 0" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
      <path d="M2.5 10.5h19" />
      <path d="M4 4l16 17" />
    </>
  ),
  send: (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
} as const;

/** Decorative stroke icon: the text next to it always carries the meaning. */
function Icon({
  name,
  size = 20,
  stroke = 2.2,
  className,
}: {
  name: keyof typeof ICONS;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

/** The little Centavos coin used on the "used Centavos" chips. */
function Coin() {
  return (
    <span aria-hidden className="relative inline-block size-3.5 flex-none rounded-full bg-mandarina">
      <span className="absolute left-1/2 top-1/2 h-[1.6px] w-1.5 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-ink" />
    </span>
  );
}

const TINT = { peach: "bg-peach", sky: "bg-sky", sand: "bg-sand" } as const;
// Bars of the example chat: three distinct brand colours.
const BAR = ["bg-mandarina", "bg-ink-soft", "bg-yolk"] as const;
const BAR_WIDTH = ["100%", "57%", "54%"] as const;

/**
 * Marketing and how-to page of the Claude connector (/app/claude). A Server
 * Component: only the copy button, the app/web tabs and the FAQ accordion are
 * client components.
 *
 * `WEB_APP_ENABLED` (NEXT_PUBLIC_WEB_APP_ENABLED) says whether the web app
 * exists yet; while it does not, the page only offers the app path.
 */
export function ClaudePage({ lang }: { lang: SiteLang }) {
  const c = CLAUDE_COPY[lang];
  const web = WEB_APP_ENABLED;

  const faqItems = c.faq.items.map((it) => ({ q: it.q, a: pick(it.a, web) }));
  // Without the web app, "create account" is the landing's sign-up card.
  const signupHref = web ? `/app/crear-cuenta?next=${CONNECT_NEXT}` : `${navHref("/", lang)}#crear-cuenta`;
  const checks = [c.hero.checkFree, ...(web ? [c.hero.checkNoApp] : []), c.hero.checkDisconnect];

  return (
    <>
      <HtmlLang lang={lang} />
      {/* JSON-LD in the server HTML (plain script, not next/script). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }} />

      {/* The language switch lives in the navbar, as on the home page. */}
      <Header lang={lang} switcherPath={CLAUDE_PATH} />

      <main id="contenido">
        {/* HERO */}
        <section aria-labelledby="hero-title" className={`${container} pt-10 pb-10 md:pt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-12`}>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-bold text-bg mb-5">
              <span aria-hidden className="size-1.5 rounded-full bg-yolk" />
              {c.hero.badge}
            </p>
            <h1
              id="hero-title"
              className="font-display text-[44px] sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-[-0.045em] text-balance mb-5"
            >
              {c.hero.titleLead}
              <mark className="mark">{c.hero.titleAccent}</mark>
            </h1>
            <p className="max-w-[520px] text-[17px] md:text-lg leading-relaxed text-ink-soft mb-7">{c.hero.body}</p>
            <div className="flex flex-wrap gap-3 mb-6">
              <a href="#como" className={pillPrimary}>
                {c.hero.ctaPrimary}
                <Icon name="arrow" size={18} stroke={2.4} />
              </a>
              <a
                href="#ejemplos"
                className="glass-lite inline-flex items-center min-h-[52px] rounded-full px-5 text-[16px] font-bold text-ink hover:border-ink-soft"
              >
                {c.hero.ctaSecondary}
              </a>
            </div>
            <ul aria-label={c.hero.checksLabel} className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-ink-soft">
              {checks.map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Icon name="check" size={18} stroke={2.6} className="text-green" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Example chat: a generic Centavos-styled mock, not Claude's own interface. */}
          <figure aria-label={c.chat.label} className="min-w-0">
            <div className="glass rounded-[28px] p-4 md:p-[18px]">
              <div className="flex items-center justify-between gap-3 border-b border-rule px-1.5 pb-3.5 pt-1">
                <p className="font-extrabold text-[15px]">{c.chat.assistant}</p>
                <p className="inline-flex items-center gap-[7px] rounded-full bg-green-soft px-[11px] py-[5px] text-[12px] font-bold text-ink">
                  <span aria-hidden className="size-[7px] rounded-full bg-green" />
                  {c.chat.connected}
                </p>
              </div>
              <div className="flex flex-col gap-3 px-1 pt-[18px] pb-1.5">
                <p className="ml-auto max-w-[80%] rounded-[20px_20px_6px_20px] bg-mandarina px-4 py-[11px] text-[15px] font-bold text-ink">
                  {c.chat.user1}
                </p>
                <p className="glass-lite inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12px] font-bold text-ink-soft">
                  <Coin />
                  {c.chat.tool1}
                </p>
                <p className="max-w-[88%] rounded-[20px_20px_20px_6px] border border-rule bg-surface px-4 py-3 text-[15px] leading-normal">
                  <Rich text={c.chat.reply1} />
                </p>
                <p className="ml-auto mt-1.5 max-w-[80%] rounded-[20px_20px_6px_20px] bg-mandarina px-4 py-[11px] text-[15px] font-bold text-ink">
                  {c.chat.user2}
                </p>
                <p className="glass-lite inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12px] font-bold text-ink-soft">
                  <Coin />
                  {c.chat.tool2}
                </p>
                <div className="max-w-[92%] rounded-[20px_20px_20px_6px] border border-rule bg-surface px-4 py-3.5 text-[15px] leading-normal">
                  <p className="mb-3">{c.chat.reply2}</p>
                  <ul className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_3.5rem] items-center gap-x-2.5 gap-y-2 text-[13px] font-bold sm:grid-cols-[110px_minmax(0,1fr)_64px]">
                    {c.chat.bars.map((b, i) => (
                      <li key={b.label} className="contents">
                        <span className="truncate">{b.label}</span>
                        <span aria-hidden className="h-2.5 rounded-full bg-sand">
                          <span className={`block h-full rounded-full ${BAR[i]}`} style={{ width: BAR_WIDTH[i] }} />
                        </span>
                        <span className="text-right">{b.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div
                aria-hidden
                className="mt-3.5 flex items-center justify-between gap-2.5 rounded-[18px] border border-rule bg-surface py-3 pl-[18px] pr-3 text-[14px] text-ink-mute"
              >
                <span>{c.chat.placeholder}</span>
                <span className="inline-flex size-[34px] items-center justify-center rounded-xl bg-ink text-bg">
                  <Icon name="send" size={16} stroke={2.4} />
                </span>
              </div>
            </div>
            <figcaption className="mt-3 text-[12px] text-ink-soft">{c.chat.caption}</figcaption>
          </figure>
        </section>

        {/* WHERE IT WORKS */}
        <section aria-label={c.where.label} className={`${container} pb-12 md:pb-14`}>
          <div className="glass-lite flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2.5 rounded-[20px] px-5 py-4 [--glass-alpha:.6]">
            <p className="mr-2 text-[14px] font-extrabold">{c.where.label}</p>
            {c.where.items.map((t, i) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3.5 py-2 text-[14px] font-bold"
              >
                <Icon name={(["globe", "desktop", "phone"] as const)[i]} size={17} stroke={2} />
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* EXAMPLES */}
        <section id="ejemplos" aria-labelledby="ejemplos-title" className={`${container} scroll-mt-20 pt-6 pb-16 md:pb-[72px]`}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h2 id="ejemplos-title" className={`${h2} max-w-[640px] text-[32px] md:text-5xl`}>
              {c.examples.title}
            </h2>
            <p className="max-w-[380px] text-[16px] leading-relaxed text-ink-soft">
              {c.examples.body}{" "}
              <span className="whitespace-nowrap font-hand text-2xl text-mandarina-deep">{c.examples.hand}</span>
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {c.examples.groups.map((g) => (
              <article key={g.title} className="glass rounded-[26px] p-6">
                <div className="mb-[18px] flex items-center gap-3">
                  <span aria-hidden className={`inline-flex size-11 items-center justify-center rounded-[14px] ${TINT[g.tint]}`}>
                    <Icon name={g.icon} size={22} />
                  </span>
                  <h3 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">{g.title}</h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {g.prompts.map((p) => (
                    <li key={p} className="rounded-2xl border border-rule bg-surface px-3.5 py-3 text-[15px] font-semibold leading-snug">
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* HOW TO CONNECT */}
        <section id="como" aria-labelledby="como-title" className="scroll-mt-20 border-y border-rule bg-sand/40">
          <div className={`${container} py-16 md:py-20`}>
            <h2 id="como-title" className={`${h2} mb-3 text-[32px] md:text-5xl`}>
              {c.how.title}
            </h2>
            <p className="mb-9 max-w-[560px] text-[16px] leading-relaxed text-ink-soft">{pick(c.how.intro, web)}</p>
            <ol className="grid gap-4 md:grid-cols-3">
              <li className="glass-lite flex flex-col gap-3.5 rounded-[26px] p-6 [--glass-alpha:.78] md:p-[26px]">
                <StepNumber n={1} />
                <h3 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">{c.how.step1.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  <Rich text={c.how.step1.body} />
                </p>
                {/* The address never breaks mid-word: when the card is too narrow for it and the
                    button side by side, the button wraps to its own line instead. */}
                <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-rule-strong bg-surface py-1.5 pl-3.5 pr-1.5">
                  <code
                    aria-label={c.how.step1.urlLabel}
                    className="flex-1 select-all whitespace-nowrap font-mono text-[13px] font-semibold"
                  >
                    {CONNECTOR_URL}
                  </code>
                  <CopyUrlButton
                    value={CONNECTOR_URL}
                    label={c.how.step1.copy}
                    doneLabel={c.how.step1.copied}
                    announce={c.how.step1.copiedAnnounce}
                    ariaLabel={c.how.step1.copyAria}
                  />
                </div>
                <p className="text-[13px] leading-normal text-ink-soft">{c.how.step1.soon}</p>
              </li>

              <li className="glass-lite flex flex-col gap-3.5 rounded-[26px] p-6 [--glass-alpha:.78] md:p-[26px]">
                <StepNumber n={2} />
                <h3 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">{c.how.step2.title}</h3>
                {web ? (
                  <ConnectTabs
                    groupLabel={c.how.step2.groupLabel}
                    tabApp={c.how.step2.tabApp}
                    tabWeb={c.how.step2.tabWeb}
                    app={<Rich text={c.how.step2.app} />}
                    web={
                      <>
                        {c.how.step2.web.before}
                        <Link href={`/app/entrar?next=${CONNECT_NEXT}`} className="font-semibold text-mandarina-deep underline underline-offset-2">
                          {c.how.step2.web.link}
                        </Link>
                        <Rich text={c.how.step2.web.middle} />
                        <Link href={`/app/crear-cuenta?next=${CONNECT_NEXT}`} className="font-semibold text-mandarina-deep underline underline-offset-2">
                          {c.how.step2.web.signup}
                        </Link>
                        {c.how.step2.web.after}
                      </>
                    }
                  />
                ) : (
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    <Rich text={c.how.step2.app} />
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-2.5 pt-1">
                  <span
                    aria-label={c.how.step2.codeExampleLabel}
                    className="inline-flex rounded-xl bg-ink px-3.5 py-2.5 font-mono text-[18px] font-bold tracking-[0.08em] text-bg"
                  >
                    7KQ2M-9XD4P
                  </span>
                  <span className="text-[13px] leading-snug text-ink-soft">
                    {c.how.step2.codeNote[0]}
                    <br />
                    {c.how.step2.codeNote[1]}
                  </span>
                </div>
              </li>

              <li className="glass-lite flex flex-col gap-3.5 rounded-[26px] p-6 [--glass-alpha:.78] md:p-[26px]">
                <StepNumber n={3} />
                <h3 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">{c.how.step3.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  <Rich text={c.how.step3.body} />
                </p>
                <div aria-hidden className="mt-auto rounded-[18px] border border-rule bg-surface p-4">
                  <p className="mb-1 text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">{c.how.step3.mockTitle}</p>
                  <p className="mb-3 text-[14px] leading-normal">
                    <Rich text={c.how.step3.mockBody} />
                  </p>
                  <div className="flex gap-2">
                    <span className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-mandarina text-[14px] font-extrabold text-ink">
                      {c.how.step3.connect}
                    </span>
                    <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-rule px-4 text-[14px] font-bold text-ink-soft">
                      {c.how.step3.cancel}
                    </span>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* YOUR ACCOUNT, IN YOUR CONTROL */}
        <section aria-labelledby="control-title" className="bg-ink text-bg">
          <div className={`${container} py-16 md:py-24`}>
            <h2 id="control-title" className="font-display text-[40px] md:text-6xl lg:text-7xl text-balance font-extrabold leading-[0.95] tracking-[-0.04em] mb-3.5">
              {c.control.titleLead}
              <span className="text-yolk">{c.control.titleAccent}</span>
            </h2>
            <p className="mb-11 max-w-[560px] text-[17px] leading-relaxed text-on-ink-soft">{c.control.body}</p>
            <ul className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {c.control.items.map((it) => (
                <li key={it.t} className="rounded-[22px] border border-bg/15 bg-bg/[0.06] p-[22px]">
                  <Icon name={it.icon} size={26} className="text-yolk" />
                  <h3 className="mb-1.5 mt-3 font-display text-xl font-extrabold">{it.t}</h3>
                  <p className="text-[15px] leading-relaxed text-on-ink-soft">{pick(it.d, web)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[15px] text-on-ink-soft">
              {c.control.privacyBefore}{" "}
              <Link href={navHref("/app/privacidad", lang)} className="font-bold text-yolk underline underline-offset-2">
                {c.control.privacyLink}
              </Link>
              .
            </p>
          </div>
        </section>

        {/* PLANS */}
        <section aria-labelledby="planes-title" className={`${container} pt-16 pb-6 md:pt-[88px]`}>
          <h2 id="planes-title" className={`${h2} mb-3 text-[32px] md:text-5xl`}>
            {c.plans.title}
          </h2>
          <p className="mb-8 max-w-[600px] text-[16px] leading-relaxed text-ink-soft">{c.plans.body}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="glass rounded-[26px] p-7">
              <h3 className="mb-1 font-display text-[26px] font-extrabold tracking-[-0.02em]">{c.plans.free.name}</h3>
              <p className="mb-5 text-[14px] text-ink-soft">{c.plans.free.sub}</p>
              <PlanList items={c.plans.free.items} iconClass="text-green" />
            </article>
            <article className="rounded-[26px] bg-ink p-7 text-bg shadow-[0_24px_50px_-28px_rgb(42_26_16/.6)]">
              <div className="mb-1 flex items-center justify-between gap-2.5">
                <h3 className="font-display text-[26px] font-extrabold tracking-[-0.02em]">
                  {c.plans.plus.name}
                  <span className="text-mandarina">+</span>
                </h3>
                <span className="rounded-full bg-yolk px-[11px] py-[5px] text-[12px] font-extrabold text-ink">{c.plans.plus.badge}</span>
              </div>
              <p className="mb-5 text-[14px] text-on-ink-soft">{c.plans.plus.sub}</p>
              <PlanList items={c.plans.plus.items} iconClass="text-yolk" />
            </article>
          </div>
          <p className="mt-[18px] text-[13px] leading-normal text-ink-soft">{c.plans.note}</p>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="mx-auto max-w-[860px] px-5 pt-14 pb-16 md:pb-[72px]">
          <h2 id="faq-title" className={`${h2} mb-6 text-[30px] md:text-[44px]`}>
            {c.faq.title}
          </h2>
          <FaqAccordion items={faqItems} />
        </section>

        {/* FINAL CTA */}
        <section aria-labelledby="cta-title" className={`${container} pb-12 md:pb-16`}>
          <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-[32px] p-7 md:p-10">
            <div className="min-w-0 flex-1 basis-[300px]">
              <h2 id="cta-title" className={`${h2} mb-2 text-[30px] md:text-[46px]`}>
                {c.cta.title}
              </h2>
              <p className="text-[16px] leading-relaxed text-ink-soft">{c.cta.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#como" className={pillPrimary}>
                {c.cta.primary}
              </a>
              <a
                href={signupHref}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-ink px-5 text-[16px] font-extrabold text-bg hover:opacity-85"
              >
                {c.cta.signup}
              </a>
            </div>
          </div>
        </section>
      </main>

      <AppFooter lang={lang} />
    </>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <p aria-hidden className="font-display text-[56px] font-extrabold leading-[0.9] tracking-[-0.04em] text-mandarina">
      {n}
    </p>
  );
}

function PlanList({ items, iconClass }: { items: string[]; iconClass: string }) {
  return (
    <ul className="flex flex-col gap-3 text-[15px] leading-normal">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <Icon name="check" size={18} stroke={2.6} className={`mt-0.5 flex-none ${iconClass}`} />
          {t}
        </li>
      ))}
    </ul>
  );
}

