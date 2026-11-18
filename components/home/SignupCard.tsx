"use client";

// The landing's real sign-up card (it replaces the decorative SignupMock when
// the API is configured). Three steps: the form, the 6-digit code emailed by
// the API, and "done, now open the app".
//
// Signing up here earns the LANDING_CODE promo (Centavos+ for a few days). The
// code is reserved for the email before the account exists, and the API grants
// it when the email is verified. The offer is only shown when the API says the
// code is live, so a missing or expired code never becomes a broken promise.

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AppStoreBadges } from "@/components/home/AppStoreBadges";
import { navHref, type SiteLang } from "@/lib/lang";
import { claimCode, previewCode } from "@/lib/promo-api";
import { SignupApiError, resendEmailCode, signup, verifyEmail, type SignupErrorCode } from "@/lib/signup-api";
import { getAppLinks } from "@/lib/store-links";

/** Promo code granted to accounts created from this card. */
export const LANDING_CODE = "CNTVSLAN";

type Step =
  | { kind: "form" }
  | { kind: "verify"; userId: string; name: string; email: string; claimed: boolean }
  | { kind: "done"; name: string; email: string; claimed: boolean };

const COPY = {
  es: {
    title: "Crea tu cuenta",
    gift: (days: number) => `Regístrate aquí y te regalamos ${days} días de Centavos+`,
    name: "Nombre",
    email: "Correo",
    password: "Contraseña",
    passwordHint: "Mínimo 8 caracteres.",
    show: "Ver",
    hide: "Ocultar",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    cta: "Crear cuenta",
    creating: "Creando tu cuenta…",
    legalBefore: "Al crear tu cuenta aceptas los",
    terms: "Términos",
    and: "y el",
    privacy: "Aviso de Privacidad",
    note: "y ya, es todo",
    verifyTitle: "Revisa tu correo",
    verifyBody: (email: string) => `Te mandamos un código de 6 dígitos a ${email}.`,
    codeLabel: "Código",
    verify: "Confirmar",
    verifying: "Confirmando…",
    resend: "Mandar otro código",
    resent: "Listo, te mandamos uno nuevo.",
    changeEmail: "Usar otro correo",
    doneTitle: (name: string) => `¡Listo, ${name}!`,
    doneBody: (email: string) => `Tu cuenta ya existe. Descarga Centavos y entra con ${email}.`,
    doneGift: (days: number) => `Ya tienes ${days} días de Centavos+ en tu cuenta.`,
    errorPrefix: "Error:",
    fieldErrors: {
      name: "Escribe tu nombre.",
      email: "Revisa el correo.",
      password: "La contraseña necesita de 8 a 72 caracteres.",
      code: "El código tiene 6 dígitos.",
    },
    errors: {
      AUTH_EMAIL_TAKEN: "Ya hay una cuenta con ese correo. Entra desde la app.",
      AUTH_CODE_NOT_FOUND: "Ese código ya no sirve. Pide otro.",
      AUTH_CODE_EXPIRED: "El código ya venció. Pide otro.",
      AUTH_CODE_INVALID: "Ese código no es el que te mandamos. Revísalo.",
      AUTH_CODE_TOO_MANY_ATTEMPTS: "Demasiados intentos. Pide un código nuevo.",
      AUTH_EMAIL_ALREADY_VERIFIED: "Tu correo ya está confirmado. Entra desde la app.",
      VALIDATION: "Revisa los datos.",
      RATE_LIMIT: "Demasiados intentos. Espera un momento y vuelve a probar.",
      NETWORK: "No pudimos conectarnos. Revisa tu internet y vuelve a probar.",
      UNKNOWN: "Algo falló de nuestro lado. Vuelve a probar en un momento.",
    } satisfies Record<SignupErrorCode, string>,
    downloadLabel: "Descarga la app",
  },
  en: {
    title: "Create your account",
    gift: (days: number) => `Sign up here and get ${days} days of Centavos+ on us`,
    name: "Name",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters.",
    show: "Show",
    hide: "Hide",
    showPassword: "Show password",
    hidePassword: "Hide password",
    cta: "Create account",
    creating: "Creating your account…",
    legalBefore: "By creating an account you accept the",
    terms: "Terms",
    and: "and the",
    privacy: "Privacy Notice",
    note: "that's the whole form",
    verifyTitle: "Check your email",
    verifyBody: (email: string) => `We sent a 6-digit code to ${email}.`,
    codeLabel: "Code",
    verify: "Confirm",
    verifying: "Confirming…",
    resend: "Send another code",
    resent: "Done, we sent a new one.",
    changeEmail: "Use another email",
    doneTitle: (name: string) => `You're in, ${name}!`,
    doneBody: (email: string) => `Your account is ready. Download Centavos and sign in with ${email}.`,
    doneGift: (days: number) => `You now have ${days} days of Centavos+ on your account.`,
    errorPrefix: "Error:",
    fieldErrors: {
      name: "Type your name.",
      email: "Check the email.",
      password: "The password needs 8 to 72 characters.",
      code: "The code has 6 digits.",
    },
    errors: {
      AUTH_EMAIL_TAKEN: "There is already an account with that email. Sign in from the app.",
      AUTH_CODE_NOT_FOUND: "That code no longer works. Ask for another one.",
      AUTH_CODE_EXPIRED: "The code expired. Ask for another one.",
      AUTH_CODE_INVALID: "That is not the code we sent. Check it.",
      AUTH_CODE_TOO_MANY_ATTEMPTS: "Too many tries. Ask for a new code.",
      AUTH_EMAIL_ALREADY_VERIFIED: "Your email is already confirmed. Sign in from the app.",
      VALIDATION: "Check your details.",
      RATE_LIMIT: "Too many tries. Wait a moment and try again.",
      NETWORK: "We couldn't connect. Check your internet and try again.",
      UNKNOWN: "Something failed on our side. Try again in a moment.",
    } satisfies Record<SignupErrorCode, string>,
    downloadLabel: "Download the app",
  },
} as const;

const label = "text-[12px] font-bold mb-1.5 block";
const field =
  "h-12 w-full rounded-2xl glass-lite px-4 text-[15px] text-ink placeholder:text-ink-soft outline-none focus:ring-2 focus:ring-ink focus:border-ink disabled:opacity-60 aria-[invalid=true]:border-mandarina-deep";
const primary =
  "h-12 w-full rounded-2xl bg-ink text-bg font-bold cursor-pointer hover:opacity-85 transition-opacity duration-150 disabled:opacity-60 disabled:cursor-default";
const link = "text-[13px] font-semibold text-mandarina-deep underline underline-offset-2 cursor-pointer";
const fieldErrorClass = "text-[12px] font-semibold text-mandarina-deep mt-1.5";

function asError(e: unknown): SignupApiError {
  return e instanceof SignupApiError ? e : new SignupApiError("UNKNOWN");
}

/** Whether the API rejected `name` in a VALIDATION error. */
function rejected(error: SignupApiError | null, name: string): boolean {
  return error?.code === "VALIDATION" && !!error.fields && name in error.fields;
}

export function SignupCard({ lang }: { lang: SiteLang }) {
  const t = COPY[lang];
  const [step, setStep] = useState<Step>({ kind: "form" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SignupApiError | null>(null);
  // Days the landing code gives, once the API confirms it is live.
  const [giftDays, setGiftDays] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    previewCode(LANDING_CODE).then(
      (p) => !cancelled && p.audience.new && p.grantDays > 0 && setGiftDays(p.grantDays),
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Each step moves focus to its heading, for keyboard and screen-reader users.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step.kind]);

  async function create(name: string, email: string, password: string) {
    setBusy(true);
    setError(null);
    try {
      // Reserve the code first: the API grants it when the email is verified,
      // and in development signup verifies on the spot. Best-effort: a failed
      // reservation never blocks the account.
      let claimed = false;
      if (giftDays) {
        claimed = await claimCode(LANDING_CODE, email).then(
          () => true,
          () => false,
        );
      }
      const { userId, verified } = await signup(name, email, password);
      setStep(verified ? { kind: "done", name, email, claimed } : { kind: "verify", userId, name, email, claimed });
    } catch (e) {
      setError(asError(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirm(code: string) {
    if (step.kind !== "verify") return;
    setBusy(true);
    setError(null);
    try {
      await verifyEmail(step.userId, code);
      setStep({ kind: "done", name: step.name, email: step.email, claimed: step.claimed });
    } catch (e) {
      const err = asError(e);
      if (err.code === "AUTH_EMAIL_ALREADY_VERIFIED") {
        setStep({ kind: "done", name: step.name, email: step.email, claimed: step.claimed });
      } else {
        setError(err);
      }
    } finally {
      setBusy(false);
    }
  }

  async function resend(): Promise<boolean> {
    if (step.kind !== "verify") return false;
    setBusy(true);
    setError(null);
    try {
      await resendEmailCode(step.userId);
      return true;
    } catch (e) {
      setError(asError(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const heading = (text: string) => (
    <h3
      ref={headingRef}
      tabIndex={-1}
      style={{ outline: "none" }}
      className="font-display text-2xl font-extrabold tracking-[-0.03em] mt-4 mb-5"
    >
      {text}
    </h3>
  );

  return (
    <div className="w-full max-w-sm mx-auto md:mx-0 md:ml-auto">
      <div className="app-backdrop text-ink rounded-[28px] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,.5)]">
        <span aria-hidden className="w-9 h-9 rounded-xl bg-mandarina text-bg grid place-items-center font-display font-extrabold">
          C
        </span>

        {step.kind === "form" && (
          <>
            {heading(t.title)}
            {giftDays && (
              <p className="-mt-2 mb-5 rounded-2xl bg-yolk text-ink px-4 py-3 text-[13px] font-bold leading-snug">
                <span aria-hidden>+</span> {t.gift(giftDays)}
              </p>
            )}
            <SignupForm t={t} lang={lang} busy={busy} error={error} onSubmit={create} />
          </>
        )}

        {step.kind === "verify" && (
          <>
            {heading(t.verifyTitle)}
            <p className="text-[14px] leading-relaxed text-ink-soft -mt-2 mb-5">{t.verifyBody(step.email)}</p>
            <CodeForm
              t={t}
              busy={busy}
              error={error}
              onSubmit={confirm}
              onResend={resend}
              onChangeEmail={() => {
                setError(null);
                setStep({ kind: "form" });
              }}
            />
          </>
        )}

        {step.kind === "done" && (
          <div role="status">
            {heading(t.doneTitle(step.name))}
            <p className="text-[15px] leading-relaxed text-ink-soft -mt-2">{t.doneBody(step.email)}</p>
            {step.claimed && giftDays && (
              <p className="mt-4 rounded-2xl bg-yolk text-ink px-4 py-3 text-[13px] font-bold leading-snug">
                <span aria-hidden>+</span> {t.doneGift(giftDays)}
              </p>
            )}
            <p className="text-[12px] font-bold mt-6 mb-3">{t.downloadLabel}</p>
            <AppStoreBadges {...getAppLinks()} lang={lang} />
          </div>
        )}
      </div>
      {step.kind === "form" && (
        <div aria-hidden className="mt-4 flex items-start justify-end gap-2 text-yolk font-hand text-3xl -rotate-2">
        <svg width="48" height="36" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-[-6px]">
          <path d="M40 32C30 30 14 24 10 6" />
          <path d="M3 13l7-8 6 9" />
        </svg>
        <span>{t.note}</span>
        </div>
      )}
    </div>
  );
}

type Copy = (typeof COPY)[SiteLang];

function ErrorLine({ t, error }: { t: Copy; error: SignupApiError | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-[13px] font-semibold text-mandarina-deep">
      <span aria-hidden>⚠ </span>
      <span className="sr-only">{t.errorPrefix} </span>
      {t.errors[error.code]}
    </p>
  );
}

function SignupForm({
  t,
  lang,
  busy,
  error,
  onSubmit,
}: {
  t: Copy;
  lang: SiteLang;
  busy: boolean;
  error: SignupApiError | null;
  onSubmit: (name: string, email: string, password: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!busy) onSubmit(name.trim(), email.trim(), password);
  }

  const bad = { name: rejected(error, "name"), email: rejected(error, "email"), password: rejected(error, "password") };
  const anyField = bad.name || bad.email || bad.password;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="signup-name" className={label}>{t.name}</label>
        <input
          id="signup-name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          aria-invalid={bad.name || undefined}
          aria-describedby={bad.name ? "signup-name-error" : undefined}
          className={field}
        />
        {bad.name && <p id="signup-name-error" className={fieldErrorClass}>{t.fieldErrors.name}</p>}
      </div>
      <div>
        <label htmlFor="signup-email" className={label}>{t.email}</label>
        <input
          id="signup-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          aria-invalid={bad.email || undefined}
          aria-describedby={bad.email ? "signup-email-error" : undefined}
          className={field}
        />
        {bad.email && <p id="signup-email-error" className={fieldErrorClass}>{t.fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="signup-password" className={label}>{t.password}</label>
        <div className="relative">
          <input
            id="signup-password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            aria-invalid={bad.password || undefined}
            aria-describedby={bad.password ? "signup-password-error" : "signup-password-hint"}
            className={`${field} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? t.hidePassword : t.showPassword}
            className="absolute inset-y-0 right-3 px-1 text-[12px] font-bold text-ink-soft hover:text-ink cursor-pointer"
          >
            {show ? t.hide : t.show}
          </button>
        </div>
        {bad.password ? (
          <p id="signup-password-error" className={fieldErrorClass}>{t.fieldErrors.password}</p>
        ) : (
          <p id="signup-password-hint" className="text-[12px] text-ink-soft mt-1.5">{t.passwordHint}</p>
        )}
      </div>
      <ErrorLine t={t} error={anyField ? null : error} />
      <button type="submit" disabled={busy} className={`${primary} mt-2`}>
        {busy ? t.creating : t.cta}
      </button>
      <p className="text-[12px] leading-snug text-ink-soft">
        {t.legalBefore}{" "}
        <Link href={navHref("/app/terminos", lang)} className="font-semibold text-ink underline underline-offset-2">{t.terms}</Link>{" "}
        {t.and}{" "}
        <Link href={navHref("/app/privacidad", lang)} className="font-semibold text-ink underline underline-offset-2">{t.privacy}</Link>.
      </p>
    </form>
  );
}

function CodeForm({
  t,
  busy,
  error,
  onSubmit,
  onResend,
  onChangeEmail,
}: {
  t: Copy;
  busy: boolean;
  error: SignupApiError | null;
  onSubmit: (code: string) => void;
  onResend: () => Promise<boolean>;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = useState("");
  const [short, setShort] = useState(false);
  const [resent, setResent] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (code.length !== 6) {
      setShort(true);
      input.current?.focus();
      return;
    }
    setShort(false);
    setResent(false);
    onSubmit(code);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="signup-code" className={label}>{t.codeLabel}</label>
        <input
          ref={input}
          id="signup-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={busy}
          aria-invalid={short || undefined}
          aria-describedby={short ? "signup-code-error" : undefined}
          className={`${field} font-display text-[22px] font-extrabold tracking-[0.4em]`}
        />
        {short && <p id="signup-code-error" role="alert" className={fieldErrorClass}>{t.fieldErrors.code}</p>}
      </div>
      <ErrorLine t={t} error={error} />
      {resent && !error && <p role="status" className="text-[13px] font-semibold text-ink">{t.resent}</p>}
      <button type="submit" disabled={busy} className={primary}>
        {busy ? t.verifying : t.verify}
      </button>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <button
          type="button"
          disabled={busy}
          onClick={async () => setResent(await onResend())}
          className={link}
        >
          {t.resend}
        </button>
        <button type="button" disabled={busy} onClick={onChangeEmail} className={link}>
          {t.changeEmail}
        </button>
      </div>
    </form>
  );
}
