"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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
  previewCode,
  redeemCode,
  type PromoErrorCode,
  type Preview,
  type Redemption,
  type Session,
} from "@/lib/promo-api";
import { CANJEAR_COPY, type CanjearCopy } from "./copy";
import { GoogleButton } from "./GoogleButton";

type Stage =
  | { kind: "checking" }
  | { kind: "ask-code" }
  | { kind: "offer"; preview: Preview }
  | { kind: "code-error"; code: PromoErrorCode }
  | { kind: "redeemed"; result: Redemption; isNewUser: boolean }
  | { kind: "claimed"; email: string; grantDays: number };

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
      setStage({ kind: "claimed", email, grantDays });
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

  const heading = (text: string) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] mb-4 outline-none"
    >
      {text}
    </h1>
  );

  switch (stage.kind) {
    case "checking":
      return (
        <div role="status" className="text-[15px] text-ink-soft">
          {heading(t.title)}
          {t.loading}
        </div>
      );

    case "ask-code":
      return (
        <div>
          {heading(t.title)}
          <p className="text-[15px] leading-relaxed text-ink-soft mb-6">{t.codeIntro}</p>
          <CodeForm t={t} busy={busy} error={error} onSubmit={checkCode} />
        </div>
      );

    case "code-error": {
      const message = t.errors[stage.code];
      const isCodeProblem = CODE_ERRORS.includes(stage.code);
      return (
        <div>
          {heading(message.title ?? t.title)}
          <p role="alert" className="text-[15px] leading-relaxed text-ink-soft mb-6">
            {message.message}
          </p>
          <button type="button" onClick={startOver} className={primaryButton}>
            {isCodeProblem ? t.tryAnother : t.retry}
          </button>
        </div>
      );
    }

    case "offer":
      return (
        <div>
          <p className="text-[12px] font-bold tracking-wide text-mandarina-deep uppercase mb-2">{t.eyebrow}</p>
          {heading(`${t.offerTitle(stage.preview.code)}: ${t.offerBody(stage.preview.grantDays)}`)}
          <button type="button" onClick={startOver} className={`${linkButton} mb-4`}>
            {t.changeCode}
          </button>

          <fieldset className="mb-6">
            <legend className="text-[13px] font-bold text-ink mb-2">{t.pathsLegend}</legend>
            <div className="flex flex-wrap gap-2">
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
                  className={`rounded-full border px-4 py-2.5 text-[14px] font-bold cursor-pointer ${
                    path === p ? "bg-ink text-bg border-ink" : "bg-surface text-ink border-rule-strong hover:bg-sand"
                  }`}
                >
                  {p === "account" ? t.hasAccount : t.isNew}
                </button>
              ))}
            </div>
          </fieldset>

          {path === "account" && (
            <section id="canjear-account" aria-label={t.hasAccount} className="bg-surface border border-rule rounded-2xl p-6">
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
            <section id="canjear-new" aria-label={t.isNew} className="bg-surface border border-rule rounded-2xl p-6">
              <NewForm key="new" t={t} busy={busy} error={error} onSubmit={claim} />
            </section>
          )}
        </div>
      );

    case "redeemed": {
      const date = new Intl.DateTimeFormat(HTML_LANG[lang], { dateStyle: "long" }).format(new Date(stage.result.premiumUntil));
      return (
        <div role="status">
          {heading(t.redeemedTitle)}
          <p className="text-[16px] leading-relaxed text-ink-soft mb-6">{t.redeemedBody(date)}</p>
          {stage.isNewUser && (
            <p className="text-[14px] leading-relaxed font-semibold text-ink bg-sand rounded-xl px-4 py-3 mb-6">
              {t.newGoogleAccountNote}
            </p>
          )}
          <StoreButtons lang={lang} label={t.openApp} />
        </div>
      );
    }

    case "claimed":
      return (
        <div role="status">
          {heading(t.claimedTitle)}
          <p className="text-[16px] leading-relaxed text-ink-soft mb-4">
            {t.claimedBody(stage.email, stage.grantDays)}
          </p>
          <p className="text-[14px] leading-relaxed font-semibold text-ink bg-sand rounded-xl px-4 py-3 mb-6">
            {t.sameEmailNote}
          </p>
          <StoreButtons lang={lang} label={t.downloadHeading} />
        </div>
      );
  }
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
    <form onSubmit={submit} noValidate className="bg-surface border border-rule rounded-2xl p-6 flex flex-col gap-4">
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
