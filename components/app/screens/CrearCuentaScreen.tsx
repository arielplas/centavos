"use client";

// /app/crear-cuenta (Apéndice A, §5.2). Copia de CrearCuenta.tsx de la app: una
// pantalla con tres pasos (correo y términos, contraseña, nombre) y, al final,
// Verificar. Los pasos solo juntan datos: la cuenta se crea de un solo POST en
// el paso 3. El botón se habilita cuando el paso sirve; no hay mensajes antes.
// Nada de esto va en la URL: ni la contraseña, ni el `userId`, ni el `signupToken`.

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { AccessShell } from "@/components/app/access/AccessShell";
import { FormError, PasswordField, TextField } from "@/components/app/access/Field";
import { SocialSection } from "@/components/app/access/SocialSection";
import { signupFailure } from "@/components/app/access/failures";
import { accessHref, currentSearch } from "@/components/app/access/links";
import { setAccessNotice } from "@/components/app/access/notice";
import { linkClass, primaryButton, titleClass } from "@/components/app/access/styles";
import { TextError, useAccessError, useOpenSession, useStepFocus } from "@/components/app/access/useAccess";
import { isSignupStepValid, LIMITS } from "@/components/app/access/validation";
import { VerifyStep, type VerifyLeave } from "@/components/app/access/VerifyStep";
import type { CopyKey } from "@/components/app/copy";
import { login, signup } from "@/lib/app/api";
import { langHref } from "@/lib/lang";

const TOTAL_STEPS = 3;

type Step = 1 | 2 | 3;
type Verify = { userId?: string; signupToken?: string };

const STEP_COPY: Record<Step, { eyebrow: CopyKey; title: CopyKey; subtitle: CopyKey }> = {
  1: { eyebrow: "auth:signUp.step1Eyebrow", title: "auth:signUp.step1Title", subtitle: "auth:signUp.step1Subtitle" },
  2: { eyebrow: "auth:signUp.step2Eyebrow", title: "auth:signUp.step2Title", subtitle: "auth:signUp.step2Subtitle" },
  3: { eyebrow: "auth:signUp.step3Eyebrow", title: "auth:signUp.step3Title", subtitle: "auth:signUp.step3Subtitle" },
};

export function CrearCuentaScreen() {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const { setPrefillEmail } = useSession();
  const openSession = useOpenSession();
  const accessError = useAccessError();

  const [step, setStep] = useState<Step>(1);
  // Verificar: lo que devolvió `signup`, solo en el estado del componente.
  const [verify, setVerify] = useState<Verify | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // Pregunta 7 (§16), respuesta recomendada: la casilla de términos empieza SIN marcar.
  const [accepted, setAccepted] = useState(false);
  const [emailKey, setEmailKey] = useState<CopyKey | undefined>();
  const [passwordKey, setPasswordKey] = useState<CopyKey | undefined>();
  const [formError, setFormError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const titleRef = useStepFocus<HTMLHeadingElement>(verify ? "verify" : step);
  const emailRef = useRef<HTMLInputElement>(null);

  const trimmedEmail = email.trim();
  const valid = isSignupStepValid(step, { email, accepted, password, name });

  async function submit() {
    setBusy(true);
    setFormError(null);
    try {
      const res = await signup({ name: name.trim(), email: trimmedEmail, password });
      if (res.signupToken || !res.emailVerified) {
        setVerify({ userId: res.userId, signupToken: res.signupToken });
      } else {
        // Solo en local (AUTH_AUTO_VERIFY_EMAIL): no hay código, se entra con la contraseña (§5.2).
        await openSession(await login({ email: trimmedEmail, password }));
      }
    } catch (error) {
      const failure = signupFailure(error);
      if (failure.step) setStep(failure.step);
      setEmailKey(failure.emailKey);
      setPasswordKey(failure.passwordKey);
      setFormError(failure.formError ?? null);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid || busy || googleBusy) return;
    if (step < TOTAL_STEPS) {
      setFormError(null);
      setStep((step + 1) as Step);
      return;
    }
    void submit();
  }

  function back() {
    setFormError(null);
    setStep((step - 1) as Step);
  }

  function leaveVerify(reason: VerifyLeave) {
    if (reason === "alreadyVerified") {
      // La cuenta ya estaba verificada: a entrar, con el correo puesto y el aviso.
      setPrefillEmail(trimmedEmail);
      setAccessNotice("alreadyVerified");
      router.replace(accessHref("/app/entrar", currentSearch()));
      return;
    }
    setVerify(null);
    setStep(1);
    setFormError(new TextError("auth:verify.noAccount"));
  }

  if (verify) {
    return (
      <AccessShell>
        <VerifyStep
          email={trimmedEmail}
          userId={verify.userId}
          signupToken={verify.signupToken}
          onBack={() => setVerify(null)}
          onLeave={leaveVerify}
        />
      </AccessShell>
    );
  }

  const copy = STEP_COPY[step];
  const progress = t("common:stepProgress", { step, total: TOTAL_STEPS });

  return (
    <AccessShell>
      <div className="mb-5 flex items-center gap-3">
        {step === 1 ? (
          <Link href={accessHref("/app/entrar", currentSearch())} className={`${linkClass} -ml-1 no-underline`}>
            <span aria-hidden>← </span>
            {t("common:actions.back")}
          </Link>
        ) : (
          <button type="button" onClick={back} disabled={busy} className={`${linkClass} -ml-1 no-underline`}>
            <span aria-hidden>← </span>
            {t("common:actions.back")}
          </button>
        )}
        <div className="ml-auto flex flex-col items-end gap-1.5">
          <span className="text-[12px] font-bold text-ink-soft">{progress}</span>
          <div
            role="progressbar"
            aria-label={progress}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
            className="h-1.5 w-24 overflow-hidden rounded-full bg-rule"
          >
            <div className="h-full rounded-full bg-mandarina" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </div>

      <p className="text-[12px] font-extrabold uppercase tracking-wide text-mandarina-deep">{t(copy.eyebrow)}</p>
      <h1 ref={titleRef} tabIndex={-1} className={`${titleClass} mt-1`}>
        {t(copy.title)}
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">{t(copy.subtitle)}</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {step === 1 && (
          <>
            <TextField
              id="crear-email"
              label={t("auth:fields.email")}
              value={email}
              onChange={(v) => {
                setEmail(v);
                setEmailKey(undefined);
              }}
              error={emailKey ? t(emailKey) : undefined}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t("auth:fields.emailPlaceholder")}
              maxLength={LIMITS.EMAIL_MAX}
              disabled={busy || googleBusy}
              inputRef={emailRef}
              autoFocus
            />
            <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[14px] leading-snug text-ink">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                aria-label={t("auth:signUp.termsA11y")}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-mandarina-deep"
              />
              <span>
                {t("auth:signUp.termsPrefix")}
                <Link href={langHref("/app/terminos", lang)} target="_blank" rel="noopener noreferrer" className="font-bold text-mandarina-deep underline underline-offset-2">
                  {t("auth:signUp.termsLink")}
                </Link>
                {t("auth:signUp.termsMiddle")}
                <Link href={langHref("/app/privacidad", lang)} target="_blank" rel="noopener noreferrer" className="font-bold text-mandarina-deep underline underline-offset-2">
                  {t("auth:signUp.privacyLink")}
                </Link>
                {t("auth:signUp.termsSuffix")}
              </span>
            </label>
          </>
        )}
        {step === 2 && (
          <PasswordField
            id="crear-password"
            label={t("auth:fields.password")}
            value={password}
            onChange={(v) => {
              setPassword(v);
              setPasswordKey(undefined);
            }}
            error={passwordKey ? t(passwordKey) : undefined}
            autoComplete="new-password"
            placeholder={t("auth:fields.passwordMinPlaceholder")}
            maxLength={LIMITS.PASSWORD_MAX}
            disabled={busy}
          />
        )}
        {step === 3 && (
          <TextField
            id="crear-name"
            label={t("auth:fields.name")}
            value={name}
            onChange={setName}
            autoComplete="name"
            placeholder={t("auth:fields.yourName")}
            maxLength={LIMITS.NAME_MAX}
            disabled={busy}
          />
        )}
        <FormError id="crear-form-error">{formError ? accessError(formError) : undefined}</FormError>
        <button type="submit" disabled={!valid || busy || googleBusy} className={primaryButton}>
          {step < TOTAL_STEPS ? t("auth:signUp.next") : busy ? t("auth:signUp.submitting") : t("auth:signUp.submit")}
        </button>
      </form>

      {step === 1 && (
        <div className="mt-4">
          {/* Sin términos aceptados, Apple y Google quedan deshabilitados (y el token de Google se ignora). */}
          <SocialSection disabled={!accepted || busy} onBusyChange={setGoogleBusy} />
        </div>
      )}

      {step === 1 && (
        <p className="mt-6 text-center text-[15px] text-ink-soft">
          {t("auth:signUp.hasAccount")}
          <Link href={accessHref("/app/entrar", currentSearch())} className="font-extrabold text-mandarina-deep underline underline-offset-2">
            {t("auth:signUp.goSignIn")}
          </Link>
        </p>
      )}
    </AccessShell>
  );
}
