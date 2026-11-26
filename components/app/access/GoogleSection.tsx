"use client";

// «Continuar con Google» (§4.5, §5.4) en /app/entrar y en el paso 1 de
// /app/crear-cuenta. Reutiliza el botón de /canjear con `text="continue_with"`.
// Es un solo endpoint para entrar y para registrarse. Sin
// `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no se pinta nada, tampoco el separador «o»;
// si el script de Google no carga, el botón no aparece y el correo sigue sirviendo.
// Apple va primero en la app y aquí falta: espera un Services ID (paso 21).

import { useState } from "react";
import { GoogleButton } from "@/components/canjear/GoogleButton";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { GOOGLE_CLIENT_ID } from "@/lib/promo-api";
import { loginWithGoogle } from "@/lib/app/api";
import { FormError } from "./Field";
import { acceptGoogleToken } from "./google";
import { useAccessError, useOpenSession } from "./useAccess";

type Props = {
  /** El botón queda inerte: otra cosa está enviándose, o faltan los términos. */
  disabled: boolean;
  /** Avisa si Google está hablando con la API, para deshabilitar el resto de la pantalla. */
  onBusyChange?: (busy: boolean) => void;
};

export function GoogleSection({ disabled, onBusyChange }: Props) {
  const t = useT();
  const { lang } = useLang();
  const openSession = useOpenSession();
  const accessError = useAccessError();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  if (!GOOGLE_CLIENT_ID) return null;

  async function onToken(idToken: string) {
    if (!acceptGoogleToken({ disabled, busy })) return;
    setBusy(true);
    onBusyChange?.(true);
    setError(null);
    try {
      await openSession(await loginWithGoogle(idToken));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-[12px] font-bold uppercase tracking-wide text-ink-soft" aria-hidden>
        {t("common:or")}
      </p>
      <GoogleButton lang={lang} disabled={disabled || busy} onToken={onToken} text="continue_with" />
      <p role="status" className="min-h-5 text-center text-[13px] font-semibold text-ink-soft">
        {busy ? t("auth:google.signIn.connecting") : ""}
      </p>
      <FormError id="google-error">{error ? accessError(error, "auth:google.signIn.genericError") : undefined}</FormError>
    </div>
  );
}
