"use client";

// /app/entrar (docs/app-web.md §4.5, §5.1). Copia de IniciarSesion.tsx de la app:
// correo y contraseña, errores por código, enlaces a recuperar y a crear cuenta.
// Con sesión, `AccessGuard` ya redirige (§4.3): aquí solo se llama `signIn`.

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { AccessShell } from "@/components/app/access/AccessShell";
import { FormError, PasswordField, TextField } from "@/components/app/access/Field";
import { linkClass, primaryButton, titleClass } from "@/components/app/access/styles";
import { useAccessError, useOpenSession, useStepFocus } from "@/components/app/access/useAccess";
import { hasErrors, LIMITS, loginErrors, type LoginErrors } from "@/components/app/access/validation";
import { loginFailure } from "@/components/app/access/failures";
import { login } from "@/lib/app/api";
import { accessHref, currentSearch } from "@/components/app/access/links";

export function EntrarScreen() {
  const t = useT();
  const { takePrefillEmail } = useSession();
  const openSession = useOpenSession();
  const accessError = useAccessError();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const titleRef = useStepFocus<HTMLHeadingElement>("login");

  // El correo que trae otra pantalla de acceso. Se lee una vez; con StrictMode
  // el efecto corre dos veces y la segunda lectura devuelve null: no se pisa.
  useEffect(() => {
    const prefill = takePrefillEmail();
    if (prefill) setEmail(prefill);
  }, [takePrefillEmail]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = email.trim();
    const next = loginErrors({ email: trimmed, password });
    setErrors(next);
    setFormError(null);
    if (hasErrors(next)) {
      (next.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setBusy(true);
    try {
      await openSession(await login({ email: trimmed, password }));
    } catch (error) {
      const failure = loginFailure(error);
      // Conserva el correo y borra la contraseña (§10).
      setPassword("");
      setFormError(failure.kind === "error" ? failure.error : error);
      passwordRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  const clear = (field: keyof LoginErrors) => setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  return (
    <AccessShell>
      <h1 ref={titleRef} tabIndex={-1} className={titleClass}>
        {t("auth:signIn.title")}
      </h1>
      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <TextField
          id="entrar-email"
          label={t("auth:fields.email")}
          value={email}
          onChange={(v) => {
            setEmail(v);
            clear("email");
          }}
          error={errors.email ? t(errors.email) : undefined}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t("auth:fields.emailPlaceholder")}
          maxLength={LIMITS.EMAIL_MAX}
          disabled={busy}
          inputRef={emailRef}
          autoFocus
        />
        <PasswordField
          id="entrar-password"
          label={t("auth:fields.password")}
          value={password}
          onChange={(v) => {
            setPassword(v);
            clear("password");
          }}
          error={errors.password ? t(errors.password) : undefined}
          autoComplete="current-password"
          placeholder={t("auth:fields.passwordPlaceholder")}
          maxLength={LIMITS.LOGIN_PASSWORD_MAX}
          disabled={busy}
          inputRef={passwordRef}
        />
        <div className="-mt-2 flex justify-end">
          <Link href={accessHref("/app/recuperar", currentSearch())} className={linkClass}>
            {t("auth:signIn.forgot")}
          </Link>
        </div>
        <FormError id="entrar-form-error">{formError ? accessError(formError) : undefined}</FormError>
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? t("auth:signIn.submitting") : t("auth:signIn.submit")}
        </button>
      </form>
      <p className="mt-6 text-center text-[15px] text-ink-soft">
        {t("auth:signIn.noAccount")}
        <Link href={accessHref("/app/crear-cuenta", currentSearch())} className="font-extrabold text-mandarina-deep underline underline-offset-2">
          {t("auth:signIn.createFree")}
        </Link>
      </p>
    </AccessShell>
  );
}
