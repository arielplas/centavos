"use client";

// /app/recuperar (Apéndice A, §5.3). Copia de OlvidasteContrasena → VerificarReset
// → NuevaContrasena de la app: correo, código de 6 dígitos y contraseña nueva, y
// al terminar la persona queda dentro. Los tres pasos viven en el estado: ni el
// correo, ni el código, ni el `resetToken` llegan a la URL. Recargar a la mitad
// vuelve al primer paso.
//
// La pantalla final existe por dos razones. `reset-password` revoca todas las
// conexiones de Claude y la pantalla no sabe si había alguna: el aviso
// (`app.claudeReconnect`) se dice antes de salir. Y en cuanto la sesión queda
// abierta, `AccessGuard` cambia esta pantalla por un esqueleto y redirige, así
// que el aviso no se podría leer después. Por eso `signIn` se llama al pulsar
// «Continuar», y la respuesta (con los tokens) espera en una referencia, no en
// el estado de React.

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useT } from "@/components/app/LanguageProvider";
import { AccessShell } from "@/components/app/access/AccessShell";
import { CodeEntry } from "@/components/app/access/CodeEntry";
import { FormError, PasswordField, TextField } from "@/components/app/access/Field";
import { resetPasswordRestarts } from "@/components/app/access/failures";
import { accessHref, currentSearch } from "@/components/app/access/links";
import { linkClass, primaryButton, titleClass } from "@/components/app/access/styles";
import { useAccessError, useOpenSession, useStepFocus } from "@/components/app/access/useAccess";
import { emailError, LIMITS, newPasswordError } from "@/components/app/access/validation";
import type { CopyKey } from "@/components/app/copy";
import { forgotPassword, resetPassword, verifyResetCode, type LoginResponse } from "@/lib/app/api";

type Step = "email" | "code" | "password" | "done";

export function RecuperarScreen() {
  const t = useT();
  const accessError = useAccessError();
  const openSession = useOpenSession();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [emailKey, setEmailKey] = useState<CopyKey | undefined>();
  const [passwordKey, setPasswordKey] = useState<CopyKey | undefined>();
  const [formError, setFormError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const session = useRef<LoginResponse | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const titleRef = useStepFocus<HTMLHeadingElement>(step);

  const trimmedEmail = email.trim();

  function goTo(next: Step) {
    setFormError(null);
    setStep(next);
  }

  // 1. Correo. La API responde 200 igual exista la cuenta o no: siempre se pasa al paso 2.
  async function sendCode(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const key = emailError(email);
    setEmailKey(key);
    setFormError(null);
    if (key) return;
    setBusy(true);
    try {
      await forgotPassword(trimmedEmail);
      setCode("");
      goTo("code");
    } catch (error) {
      setFormError(error);
    } finally {
      setBusy(false);
    }
  }

  // 2. Código. Un error de la API muestra el texto de su código; `auth:resetCode.invalid` es el respaldo.
  async function checkCode(value: string) {
    if (busy) return;
    setBusy(true);
    setFormError(null);
    try {
      const res = await verifyResetCode({ email: trimmedEmail, code: value });
      setResetToken(res.resetToken);
      setPassword("");
      goTo("password");
    } catch (error) {
      setFormError(error);
      setCode("");
      setTimeout(() => codeInput.current?.focus(), 50);
    } finally {
      setBusy(false);
    }
  }

  // 3. Contraseña nueva. Revoca las demás sesiones y las conexiones de Claude.
  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const key = newPasswordError(password);
    setPasswordKey(key);
    setFormError(null);
    if (key) return;
    setBusy(true);
    try {
      session.current = await resetPassword({ resetToken, newPassword: password });
      setPassword("");
      setResetToken("");
      goTo("done");
    } catch (error) {
      if (resetPasswordRestarts(error)) {
        // El token venció o ya se usó: se empieza de nuevo, con el mensaje.
        setResetToken("");
        setCode("");
        goTo("email");
      }
      setFormError(error);
    } finally {
      setBusy(false);
    }
  }

  // 4. Listo: abre la sesión. La guardia redirige (§5.8); este `user` no trae
  // `onboarded`, se toma como configurado hasta que llegue `GET /me`.
  async function continueIn() {
    const response = session.current;
    if (!response || busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await openSession(response);
      session.current = null;
    } catch (error) {
      setFormError(error);
    } finally {
      setBusy(false);
    }
  }

  const formErrorText = formError ? accessError(formError) : undefined;

  if (step === "code") {
    return (
      <AccessShell>
        <CodeEntry
          idPrefix="reset"
          email={trimmedEmail}
          code={code}
          onCodeChange={(next) => {
            setCode(next);
            if (formError) setFormError(null);
          }}
          onSubmit={checkCode}
          error={formError ? accessError(formError, "auth:resetCode.invalid") : undefined}
          busy={busy}
          submitLabel={t("auth:resetCode.submit")}
          busyLabel={t("auth:verify.submitting")}
          // «Atrás» vuelve al paso 1 con el correo puesto: ahí se pide otro código (no hay «reenviar»).
          onBack={() => goTo("email")}
          inputRef={codeInput}
        />
      </AccessShell>
    );
  }

  return (
    <AccessShell>
      {step === "email" && (
        <>
          <Link href={accessHref("/app/entrar", currentSearch())} className={`${linkClass} -ml-1 mb-2 no-underline`}>
            <span aria-hidden>← </span>
            {t("common:actions.back")}
          </Link>
          <h1 ref={titleRef} tabIndex={-1} className={titleClass}>
            {t("auth:forgot.title")}
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">{t("auth:forgot.subtitle")}</p>
          <form onSubmit={sendCode} noValidate className="mt-6 flex flex-col gap-4">
            <TextField
              id="recuperar-email"
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
              disabled={busy}
              autoFocus
            />
            <FormError id="recuperar-form-error">{formErrorText}</FormError>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? t("auth:forgot.submitting") : t("auth:forgot.submit")}
            </button>
          </form>
        </>
      )}

      {step === "password" && (
        <>
          <h1 ref={titleRef} tabIndex={-1} className={titleClass}>
            {t("auth:newPassword.title")}
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">{t("auth:newPassword.subtitle")}</p>
          <form onSubmit={savePassword} noValidate className="mt-6 flex flex-col gap-4">
            <PasswordField
              id="recuperar-password"
              label={t("auth:newPassword.field")}
              value={password}
              onChange={(v) => {
                setPassword(v);
                setPasswordKey(undefined);
              }}
              error={passwordKey ? t(passwordKey) : undefined}
              autoComplete="new-password"
              placeholder={t("auth:fields.passwordMinPlaceholder")}
              maxLength={LIMITS.LOGIN_PASSWORD_MAX}
              disabled={busy}
              autoFocus
            />
            <FormError id="recuperar-form-error">{formErrorText}</FormError>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? t("auth:newPassword.submitting") : t("auth:newPassword.submit")}
            </button>
          </form>
        </>
      )}

      {step === "done" && (
        <>
          <h1 ref={titleRef} tabIndex={-1} className={titleClass}>
            {t("auth:newPassword.savedTitle")}
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">{t("auth:newPassword.savedBody")}</p>
          <p role="status" className="glass-lite mt-4 rounded-2xl p-4 text-[14px] leading-snug text-ink">
            {t("app:claudeReconnect")}
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <FormError id="recuperar-form-error">{formErrorText}</FormError>
            <button type="button" onClick={continueIn} disabled={busy} className={primaryButton}>
              {t("common:actions.continue")}
            </button>
          </div>
        </>
      )}
    </AccessShell>
  );
}

