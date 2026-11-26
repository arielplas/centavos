"use client";

// Lo que comparten el paso Verificar (cuenta nueva) y el paso del código de
// /app/recuperar: título, a dónde se mandó el código, las seis casillas, el
// error y el botón. Controlado: quien lo usa tiene el código, el error y la
// llamada a la API. El foco va al título al entrar (§10).

import { useEffect, useRef, type FormEvent, type ReactNode, type Ref } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { CodeInput } from "./CodeInput";
import { isCodeComplete } from "./code";
import { FormError } from "./Field";
import { linkClass, primaryButton, titleClass } from "./styles";

type Props = {
  idPrefix: string;
  email?: string;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: (code: string) => void;
  /** Mensaje ya traducido. */
  error?: string;
  busy: boolean;
  /** Verificar queda deshabilitado (`AUTH_CODE_LOCKED`). */
  locked?: boolean;
  submitLabel: string;
  busyLabel: string;
  onBack: () => void;
  inputRef?: Ref<HTMLInputElement>;
  /** La fila de reenviar, si el paso la tiene. */
  children?: ReactNode;
};

export function CodeEntry({
  idPrefix,
  email,
  code,
  onCodeChange,
  onSubmit,
  error,
  busy,
  locked,
  submitLabel,
  busyLabel,
  onBack,
  inputRef,
  children,
}: Props) {
  const t = useT();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const sentToId = `${idPrefix}-sent-to`;
  const errorId = `${idPrefix}-error`;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!busy && !locked && isCodeComplete(code)) onSubmit(code);
  }

  return (
    <div>
      <button type="button" onClick={onBack} disabled={busy} className={`${linkClass} -ml-1 mb-2 no-underline`}>
        <span aria-hidden>← </span>
        {t("common:actions.back")}
      </button>
      <h1 ref={titleRef} tabIndex={-1} className={titleClass}>
        {t("auth:verify.title")}
      </h1>
      <p id={sentToId} className="mt-2 text-[15px] text-ink-soft">
        {t("auth:verify.sentTo")}{" "}
        <strong className="break-all font-bold text-ink">{email || t("auth:verify.fallbackEmail")}</strong>
      </p>
      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        <CodeInput
          id={`${idPrefix}-code`}
          value={code}
          onChange={onCodeChange}
          onComplete={onSubmit}
          labelledBy={sentToId}
          errorId={error ? errorId : undefined}
          invalid={!!error}
          disabled={busy || locked}
          inputRef={inputRef}
        />
        <FormError id={errorId}>{error}</FormError>
        <button type="submit" disabled={!isCodeComplete(code) || busy || locked} className={primaryButton}>
          {busy ? busyLabel : submitLabel}
        </button>
      </form>
      {children}
    </div>
  );
}
