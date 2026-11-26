"use client";

// El paso Verificar (Apéndice A, copia de VerificarCorreo.tsx). Lo comparten
// /app/entrar (el 403 de una cuenta sin verificar) y /app/crear-cuenta (paso 4).
// No tiene URL: el `userId` y el `signupToken` viven solo en el estado de quien
// lo monta. Con el código correcto, `verify` devuelve la sesión y se abre; la
// guardia redirige (§5.8).

import { useRef, useState } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { resendCode, verifyEmail } from "@/lib/app/api";
import type { ErrorScreen } from "@/components/app/copy/errorText";
import type { CopyKey } from "@/components/app/copy";
import { CodeEntry } from "./CodeEntry";
import { formatCountdown, RESEND_COOLDOWN_SECONDS } from "./code";
import { resendFailure, verifyFailure } from "./failures";
import { linkClass } from "./styles";
import { TextError, useAccessError, useCountdown, useOpenSession } from "./useAccess";

export type VerifyLeave = "alreadyVerified" | "noAccount";

type Props = {
  email?: string;
  userId?: string;
  signupToken?: string;
  onBack: () => void;
  /** El reenvío dijo que ya estaba verificado, o que la cuenta no existe: hay que salir de aquí. */
  onLeave: (reason: VerifyLeave) => void;
};

type Problem = { error: unknown; fallback?: CopyKey; screen?: ErrorScreen };

export function VerifyStep({ email, userId, signupToken, onBack, onLeave }: Props) {
  const t = useT();
  const accessError = useAccessError();
  const openSession = useOpenSession();
  const { remaining, start } = useCountdown();
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [locked, setLocked] = useState(false);
  const [highlightResend, setHighlightResend] = useState(false);

  const focusCode = () => setTimeout(() => inputRef.current?.focus(), 50);

  async function submit(value: string) {
    if (busy) return;
    if (!userId) {
      setProblem({ error: new TextError("auth:verify.noAccount") });
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await openSession(await verifyEmail({ userId, code: value, signupToken }));
    } catch (error) {
      const failure = verifyFailure(error);
      setProblem({ error, fallback: "auth:verify.verifyFailed" });
      setCode("");
      setLocked(failure.locked);
      setHighlightResend(failure.highlightResend);
      focusCode();
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!userId || resending || remaining > 0 || locked) return;
    setResending(true);
    setResent(false);
    setProblem(null);
    try {
      await resendCode({ userId, signupToken });
      setResent(true);
      setHighlightResend(false);
      start(RESEND_COOLDOWN_SECONDS);
      setCode("");
      focusCode();
    } catch (error) {
      const failure = resendFailure(error);
      if (failure.kind === "alreadyVerified" || failure.kind === "noAccount") {
        onLeave(failure.kind);
        return;
      }
      if (failure.kind === "locked") setLocked(true);
      setProblem({ error, fallback: "auth:verify.resendFailed", screen: "resend-code" });
    } finally {
      setResending(false);
    }
  }

  const resendDisabled = !userId || resending || remaining > 0 || locked;

  return (
    <CodeEntry
      idPrefix="verify"
      email={email}
      code={code}
      onCodeChange={(next) => {
        setCode(next);
        if (problem) setProblem(null);
      }}
      onSubmit={submit}
      error={problem ? accessError(problem.error, problem.fallback, problem.screen) : undefined}
      busy={busy}
      locked={locked}
      submitLabel={t("auth:verify.submit")}
      busyLabel={t("auth:verify.submitting")}
      onBack={onBack}
      inputRef={inputRef}
    >
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-1 text-[14px] text-ink-soft">
        <span>{t("auth:verify.notReceived")}</span>
        <button
          type="button"
          onClick={resend}
          disabled={resendDisabled}
          className={`${linkClass} ${highlightResend && !resendDisabled ? "rounded-xl bg-mandarina/15 px-3" : ""}`}
        >
          {resending ? t("auth:verify.resending") : t("auth:verify.resend")}
        </button>
      </div>
      {remaining > 0 && (
        <p className="text-center text-[14px] text-ink-soft">
          {t("auth:verify.canResendIn")}
          <span className="font-extrabold tabular-nums text-ink">{formatCountdown(remaining)}</span>
        </p>
      )}
      <p role="status" className="mt-1 min-h-5 text-center text-[14px] font-semibold text-ink">
        {resent && remaining > 0 ? `✓ ${t("auth:verify.resent")}` : ""}
      </p>
    </CodeEntry>
  );
}
