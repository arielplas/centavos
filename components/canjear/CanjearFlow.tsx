"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AppStoreBadges } from "@/components/home/AppStoreBadges";
import { HTML_LANG, type SiteLang } from "@/lib/lang";
import { getAppLinks } from "@/lib/store-links";
import {
  CODE_ERRORS,
  GOOGLE_CLIENT_ID,
  PromoApiError,
  claimCode,
  loginWithGoogle,
  loginWithPassword,
  premiumBenefits,
  previewCode,
  redeemCode,
  type Benefit,
  type PromoErrorCode,
  type Preview,
  type Redemption,
  type Session,
} from "@/lib/promo-api";
import { BenefitGlyph } from "./BenefitGlyph";
import { CANJEAR_COPY, type CanjearCopy } from "./copy";
import { GoogleButton } from "./GoogleButton";

type Stage =
  | { kind: "checking" }
  | { kind: "ask-code" }
  | { kind: "offer"; preview: Preview }
  | { kind: "code-error"; code: PromoErrorCode }
  | { kind: "redeemed"; result: Redemption; isNewUser: boolean }
  | { kind: "claimed"; email: string; code: string; grantDays: number };

type Path = "account" | "new" | null;

const fieldClass =
  "w-full bg-bg border border-rule-strong px-4 py-3 rounded-xl text-[15px] text-ink placeholder:text-ink-soft outline-none focus:ring-2 focus:ring-ink focus:border-ink disabled:opacity-60 aria-[invalid=true]:border-mandarina-deep";
const labelClass = "text-[13px] font-bold text-ink mb-1.5 block";
const primaryButton =
  "bg-ink text-bg px-5 py-3 rounded-xl text-[14px] font-bold disabled:opacity-60 cursor-pointer hover:opacity-80 transition-opacity duration-150";
const linkButton = "text-[13px] font-semibold text-mandarina-deep underline underline-offset-2 cursor-pointer py-2";

function errorOf(e: unknown): PromoApiError {
  return e instanceof PromoApiError ? e : new PromoApiError("UNKNOWN");
}

export function CanjearFlow({ lang, initialCode }: { lang: SiteLang; initialCode: string }) {
  const t = CANJEAR_COPY[lang];
  const [stage, setStage] = useState<Stage>(initialCode ? { kind: "checking" } : { kind: "ask-code" });
  const [path, setPath] = useState<Path>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PromoApiError | null>(null);
  const [googleOff, setGoogleOff] = useState(false);
  // What Centavos+ includes, straight from the paywall endpoint. Decoration
  // only: if it fails the list is simply not shown.
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  useEffect(() => {
    let cancelled = false;
    premiumBenefits().then((list) => !cancelled && setBenefits(list), () => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Focus moves to the new step's heading when the step changes, so keyboard
  // and screen-reader users land on what just replaced the old content.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [stage.kind]);

  // Code from the URL: look it up once.
  useEffect(() => {
    if (!initialCode) return;
    let cancelled = false;
    previewCode(initialCode).then(
      (preview) => !cancelled && setStage({ kind: "offer", preview }),
      (e) => !cancelled && setStage({ kind: "code-error", code: errorOf(e).code }),
    );
    return () => {
      cancelled = true;
    };
  }, [initialCode]);

  const code = stage.kind === "offer" ? stage.preview.code : "";
  const grantDays = stage.kind === "offer" ? stage.preview.grantDays : 0;

  /** A failure of a request made with the code: code errors replace the forms, the rest stay inline. */
  function fail(e: unknown) {
    const err = errorOf(e);
    if (CODE_ERRORS.includes(err.code)) {
      setStage({ kind: "code-error", code: err.code });
      setError(null);
    } else {
      // Google sign-in is switched off on the API: the password form still works.
      if (err.code === "GOOGLE_AUTH_DISABLED") setGoogleOff(true);
      setError(err);
    }
  }

  async function checkCode(raw: string) {
    setBusy(true);
    setError(null);
    try {
      const preview = await previewCode(raw);
      // Keep the URL shareable and in step with what is on screen.
      const url = new URL(window.location.href);
      url.searchParams.set("code", preview.code);
      window.history.replaceState(null, "", url);
      setPath(null);
      setStage({ kind: "offer", preview });
    } catch (e) {
      const err = errorOf(e);
      if (CODE_ERRORS.includes(err.code)) setStage({ kind: "code-error", code: err.code });
      else setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function redeemWith(login: () => Promise<Session>) {
    setBusy(true);
    setError(null);
    try {
      // The token lives only in this closure: not in state, storage, cookies or the URL.
      const { accessToken, isNewUser } = await login();
      const result = await redeemCode(code, accessToken);
      setStage({ kind: "redeemed", result, isNewUser });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function claim(email: string) {
    setBusy(true);
    setError(null);
    try {
      await claimCode(code, email);
      setStage({ kind: "claimed", email, code, grantDays });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    window.history.replaceState(null, "", url);
    setError(null);
    setPath(null);
    setStage({ kind: "ask-code" });
  }

  const heading = (content: ReactNode, size = "text-3xl md:text-4xl") => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      // Focus lands here only from script (step changes); the global
      // :focus-visible ring is unlayered CSS, so a utility cannot switch it off.
      style={{ outline: "none" }}
      className={`font-display ${size} font-extrabold tracking-[-0.03em] leading-[1.02] mb-4`}
    >
      {content}
    </h1>
  );
  // The single-column steps (typing a code, an error) sit in a centred card.
  const narrow = (children: ReactNode) => (
    <div className="mx-auto max-w-[520px] rounded-3xl border border-rule bg-surface/80 p-6 shadow-[0_24px_48px_-32px_rgba(42,26,16,0.35)] md:p-8">
      {children}
    </div>
  );
  // The result steps: the stamped coupon next to what to do now.
  const result = (ticket: ReactNode, children: ReactNode) => (
    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)] md:gap-14">
      <div className="pt-6">{ticket}</div>
      <div>{children}</div>
    </div>
  );

  switch (stage.kind) {
    case "checking":
      return narrow(
        <div role="status" className="text-[15px] text-ink-soft">
          {heading(t.title)}
          {t.loading}
        </div>,
      );

    case "ask-code":
      return narrow(
        <div>
          <p className="font-hand text-2xl leading-none text-mandarina-deep mb-2">{t.eyebrow}</p>
          {heading(t.title)}
          <p className="text-[15px] leading-relaxed text-ink-soft mb-6">{t.codeIntro}</p>
          <CodeForm t={t} busy={busy} error={error} onSubmit={checkCode} />
        </div>,
      );

    case "code-error": {
      const message = t.errors[stage.code];
      const isCodeProblem = CODE_ERRORS.includes(stage.code);
      return narrow(
        <div>
          {heading(message.title ?? t.title)}
          <p role="alert" className="text-[15px] leading-relaxed text-ink-soft mb-6">
            {message.message}
          </p>
          <button type="button" onClick={startOver} className={primaryButton}>
            {isCodeProblem ? t.tryAnother : t.retry}
          </button>
        </div>,
      );
    }

    case "offer":
      return (
        // Phone order: offer, the action card, then the benefits. On desktop the
        // card moves to a second column that spans both rows.
        <div className="grid gap-y-8 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:items-start md:gap-x-14">
          <div>
            <p className="text-[12px] font-bold tracking-[0.14em] text-mandarina-deep uppercase mb-3">{t.eyebrow}</p>
            {heading(
              <>
                <span className="sr-only">{t.offerTitle(stage.preview.code)}: </span>
                {t.offerBody(stage.preview.grantDays)}
              </>,
              "text-4xl md:text-[56px]",
            )}
            <p className="text-[16px] leading-relaxed text-ink-soft mb-10 max-w-[440px]">{t.offerLead}</p>

            <Ticket t={t} code={stage.preview.code} days={stage.preview.grantDays} note={t.giftNote} />

            <button type="button" onClick={startOver} className={`${linkButton} mt-6`}>
              {t.changeCode}
            </button>
          </div>

          <div className="rounded-3xl border border-rule bg-surface p-5 shadow-[0_24px_48px_-32px_rgba(42,26,16,0.35)] md:sticky md:top-6 md:col-start-2 md:row-span-2 md:row-start-1 md:p-6">
            <fieldset>
              <legend className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink mb-4">{t.pathsLegend}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["account", "new"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={path === p}
                    aria-controls={`canjear-${p}`}
                    onClick={() => {
                      setPath(p);
                      setError(null);
                    }}
                    // "Soy nuevo" is the main action of a shared code (most people
                    // arriving have no account yet), so it carries the brand colour
                    // and a call to action. A ring marks whichever one is open.
                    className={`flex flex-col rounded-2xl border px-4 py-3.5 text-left cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${
                      p === "new"
                        ? "bg-mandarina text-ink border-mandarina hover:bg-[#f08b4d]"
                        : "bg-bg text-ink border-rule-strong hover:bg-sand"
                    } ${path === p ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""}`}
                  >
                    <span className="block text-[15px] font-bold leading-tight">{p === "account" ? t.hasAccount : t.isNew}</span>
                    <span className={`mt-1 block text-[12px] leading-snug ${p === "new" ? "text-ink/85" : "text-ink-soft"}`}>
                      {p === "account" ? t.hasAccountHint : t.isNewHint}
                    </span>
                    {p === "new" && (
                      <span className="mt-auto pt-3 text-[14px] font-extrabold leading-none">
                        {t.isNewCta} <span aria-hidden>→</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>

          {path === "account" && (
            <section id="canjear-account" aria-label={t.hasAccount} className="mt-5 border-t border-rule pt-5">
              <AccountForm
                key="account"
                t={t}
                lang={lang}
                showGoogle={!googleOff}
                busy={busy}
                error={error}
                onPassword={(email, password) => redeemWith(() => loginWithPassword(email, password))}
                onGoogle={(idToken) => redeemWith(() => loginWithGoogle(idToken))}
              />
            </section>
          )}
          {path === "new" && (
            <section id="canjear-new" aria-label={t.isNew} className="mt-5 border-t border-rule pt-5">
              <NewForm key="new" t={t} busy={busy} error={error} onSubmit={claim} />
            </section>
          )}
          </div>

          <div className="md:col-start-1 md:row-start-2">
            <BenefitList t={t} lang={lang} benefits={benefits} />
          </div>
        </div>
      );

    case "redeemed": {
      const date = new Intl.DateTimeFormat(HTML_LANG[lang], { dateStyle: "long" }).format(new Date(stage.result.premiumUntil));
      return result(
        <Ticket t={t} code={stage.result.code} days={stage.result.grantDays} stamp={t.stampRedeemed} />,
        <div role="status">
          <p className="font-hand text-3xl leading-none text-mandarina-deep mb-2">{t.redeemedKicker}</p>
          {heading(t.redeemedTitle, "text-4xl md:text-5xl")}
          <p className="text-[17px] leading-relaxed text-ink-soft mb-6">{t.redeemedBody(date)}</p>
          {stage.isNewUser && (
            <p className="text-[14px] leading-relaxed font-semibold text-ink bg-sand rounded-xl px-4 py-3 mb-6">
              {t.newGoogleAccountNote}
            </p>
          )}
          <StoreButtons lang={lang} label={t.openApp} />
        </div>,
      );
    }

    case "claimed":
      return result(
        <Ticket t={t} code={stage.code} days={stage.grantDays} stamp={t.stampClaimed} />,
        <div role="status">
          <p className="font-hand text-3xl leading-none text-mandarina-deep mb-2">{t.claimedKicker}</p>
          {heading(t.claimedTitle, "text-4xl md:text-5xl")}
          <p className="text-[17px] leading-relaxed text-ink-soft mb-4">
            {t.claimedBody(stage.email, stage.grantDays)}
          </p>
          <p className="text-[14px] leading-relaxed font-semibold text-ink bg-sand rounded-xl px-4 py-3 mb-6">
            {t.sameEmailNote}
          </p>
          <StoreButtons lang={lang} label={t.downloadHeading} />
        </div>,
      );
  }
}

/**
 * The offer drawn as a coupon: the days on top, a tear line, the code on the
 * stub. Decorative: the heading next to it already says all of it.
 */
function Ticket({ t, code, days, note, stamp }: { t: CanjearCopy; code: string; days: number; note?: string; stamp?: string }) {
  return (
    <div aria-hidden className="relative w-full max-w-[400px]">
      {note && (
        <span className="absolute -top-10 right-2 z-10 rotate-6 font-hand text-[28px] leading-none text-mandarina-deep">
          {note}
        </span>
      )}
      <div className="relative -rotate-2 overflow-hidden rounded-[28px] bg-ink text-bg shadow-[0_28px_48px_-24px_rgba(42,26,16,0.65)] transition-transform duration-300 hover:rotate-0 motion-reduce:rotate-0 motion-reduce:transition-none">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-mandarina/35" />
        <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-yolk/15" />

        <div className="relative px-7 pb-6 pt-7">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-bg/70">Centavos+</div>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-[92px] font-extrabold leading-[0.78] tracking-[-0.05em] text-yolk">{days}</span>
            <span className="pb-0.5 font-display text-[22px] font-extrabold leading-[1.05] tracking-[-0.02em]">
              {t.ticketUnit(days)}
              <br />
              {t.ticketRest}
            </span>
          </div>
        </div>

        {/* Tear line: the page colour bites a notch out of each edge. */}
        <div className="relative h-6">
          <span className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-bg" />
          <span className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-bg" />
          <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-bg/25" />
        </div>

        <div className="relative flex items-center justify-between gap-4 px-7 pb-7 pt-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-bg/70">{t.ticketCodeLabel}</div>
            <div className="mt-1 break-all font-display text-[30px] font-extrabold leading-tight tracking-[0.12em]">{code}</div>
          </div>
          {stamp ? (
            <span className="flex-shrink-0 rotate-[-8deg] rounded-lg border-2 border-yolk px-2.5 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-yolk">
              ✓ {stamp}
            </span>
          ) : (
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-mandarina font-display text-[28px] font-extrabold leading-none text-ink">
              +
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitList({ t, lang, benefits }: { t: CanjearCopy; lang: SiteLang; benefits: Benefit[] }) {
  if (benefits.length === 0) return null;
  return (
    <section aria-labelledby="canjear-benefits" className="max-w-[440px]">
      <h2 id="canjear-benefits" className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-soft mb-3">
        {t.benefitsHeading}
      </h2>
      {/* Same row as the app's paywall: a 34px sand chip with the drawn icon
          (never the emoji), inside one bordered card. */}
      <ul className="rounded-2xl border border-rule bg-surface px-4 py-1">
        {benefits.map((b) => (
          <li key={b.key} className="flex items-start gap-3 py-3">
            <span className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-[11px] bg-sand text-ink">
              <BenefitGlyph benefitKey={b.key} imageUrl={b.imageUrl} />
            </span>
            <span>
              <span className="block text-[15px] font-bold leading-tight text-ink">{b.title[lang]}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{b.description[lang]}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StoreButtons({ lang, label }: { lang: SiteLang; label: string }) {
  const { storeUrl, playUrl } = getAppLinks();
  return (
    <div>
      <p className="text-[13px] font-bold text-ink mb-3">{label}</p>
      <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} />
    </div>
  );
}

function ErrorLine({ id, error, t }: { id: string; error: PromoApiError | null; t: CanjearCopy }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="text-[13px] font-semibold text-mandarina-deep">
      <span aria-hidden>⚠ </span>
      <span className="sr-only">{t.errorPrefix} </span>
      {t.errors[error.code].message}
    </p>
  );
}

/** Message for a field the API rejected, or `null`. */
function fieldError(error: PromoApiError | null, field: string, text: string): string | null {
  return error?.code === "VALIDATION" && error.fields && field in error.fields ? text : null;
}

function CodeForm({
  t,
  busy,
  error,
  onSubmit,
}: {
  t: CanjearCopy;
  busy: boolean;
  error: PromoApiError | null;
  onSubmit: (code: string) => void;
}) {
  const [value, setValue] = useState("");
  const [missing, setMissing] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const code = value.trim();
    if (!code) {
      setMissing(true);
      input.current?.focus();
      return;
    }
    setMissing(false);
    onSubmit(code);
  }

  const message = missing ? t.codeRequired : fieldError(error, "code", t.fieldErrors.code);
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="canjear-code" className={labelClass}>{t.codeLabel}</label>
        <input
          ref={input}
          id="canjear-code"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.codePlaceholder}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={busy}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? "canjear-code-error" : error ? "canjear-form-error" : undefined}
          className={fieldClass}
        />
        {message && <p id="canjear-code-error" role="alert" className="text-[13px] font-semibold text-mandarina-deep mt-1.5">{message}</p>}
      </div>
      {!message && <ErrorLine id="canjear-form-error" error={error} t={t} />}
      <button type="submit" disabled={busy} className={primaryButton}>
        {busy ? t.codeChecking : t.codeSubmit}
      </button>
    </form>
  );
}

function AccountForm({
  t,
  lang,
  showGoogle,
  busy,
  error,
  onPassword,
  onGoogle,
}: {
  t: CanjearCopy;
  lang: SiteLang;
  showGoogle: boolean;
  busy: boolean;
  error: PromoApiError | null;
  onPassword: (email: string, password: string) => void;
  onGoogle: (idToken: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Opening this path puts the cursor on its first field.
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    onPassword(email.trim(), password);
  }

  // Failed credentials are not tied to one field, so they go in the form error line.
  const emailMessage = fieldError(error, "email", t.fieldErrors.email);
  const passwordMessage = fieldError(error, "password", t.fieldErrors.password);
  const formError = emailMessage || passwordMessage ? null : error;

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="canjear-email" className={labelClass}>{t.emailLabel}</label>
          <input
            ref={emailRef}
            id="canjear-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            disabled={busy}
            aria-invalid={emailMessage ? true : undefined}
            aria-describedby={emailMessage ? "canjear-email-error" : undefined}
            className={fieldClass}
          />
          {emailMessage && <p id="canjear-email-error" role="alert" className="text-[13px] font-semibold text-mandarina-deep mt-1.5">{emailMessage}</p>}
        </div>
        <div>
          <label htmlFor="canjear-password" className={labelClass}>{t.passwordLabel}</label>
          <div className="relative">
            <input
              id="canjear-password"
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              aria-invalid={passwordMessage ? true : undefined}
              aria-describedby={passwordMessage ? "canjear-password-error" : undefined}
              className={`${fieldClass} pr-24`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              aria-label={show ? t.hidePassword : t.showPassword}
              className="absolute inset-y-0 right-3 text-[12px] font-bold text-ink-soft hover:text-ink cursor-pointer px-1"
            >
              {show ? t.hide : t.show}
            </button>
          </div>
          {passwordMessage && <p id="canjear-password-error" role="alert" className="text-[13px] font-semibold text-mandarina-deep mt-1.5">{passwordMessage}</p>}
        </div>
        <ErrorLine id="canjear-form-error" error={formError} t={t} />
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? t.signingIn : t.signIn}
        </button>
      </form>

      {GOOGLE_CLIENT_ID && showGoogle && (
        <>
          <p className="text-center text-[12px] font-bold uppercase tracking-wide text-ink-soft" aria-hidden>{t.or}</p>
          <GoogleButton lang={lang} disabled={busy} onToken={onGoogle} />
        </>
      )}
    </div>
  );
}

function NewForm({
  t,
  busy,
  error,
  onSubmit,
}: {
  t: CanjearCopy;
  busy: boolean;
  error: PromoApiError | null;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const emailMessage = fieldError(error, "email", t.fieldErrors.email);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    onSubmit(email.trim());
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-[14px] leading-relaxed text-ink-soft">{t.newIntro}</p>
      <div>
        <label htmlFor="canjear-new-email" className={labelClass}>{t.emailLabel}</label>
        <input
          ref={emailRef}
          id="canjear-new-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          disabled={busy}
          aria-invalid={emailMessage ? true : undefined}
          aria-describedby={emailMessage ? "canjear-new-email-error" : undefined}
          className={fieldClass}
        />
        {emailMessage && <p id="canjear-new-email-error" role="alert" className="text-[13px] font-semibold text-mandarina-deep mt-1.5">{emailMessage}</p>}
      </div>
      <ErrorLine id="canjear-form-error" error={emailMessage ? null : error} t={t} />
      <button type="submit" disabled={busy} className={primaryButton}>
        {busy ? t.claiming : t.claimSubmit}
      </button>
    </form>
  );
}
