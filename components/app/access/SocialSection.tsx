"use client";

// «Continuar con Apple» y «Continuar con Google» (§4.5, §5.4, §5.5) en /app/entrar y en el paso 1
// de /app/crear-cuenta. Apple primero, como en la app, y un solo separador «o» para los dos.
// Cada uno es un solo endpoint para entrar y para registrarse.
//
// Cada botón aparece solo si está configurado (`NEXT_PUBLIC_APPLE_SERVICE_ID`,
// `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) y su script cargó. Sin ninguno no se pinta nada, tampoco el «o»,
// y el correo sigue sirviendo.

import { useState } from "react";
import { GoogleButton } from "@/components/canjear/GoogleButton";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { APPLE_SERVICE_ID } from "@/lib/config";
import { GOOGLE_CLIENT_ID } from "@/lib/promo-api";
import { loginWithApple, loginWithGoogle } from "@/lib/app/api";
import { AppleButton, type AppleCredential } from "./AppleButton";
import { clearPendingAppleName, nameForAttempt, type AppleFailure, type NameStore } from "./apple";
import { FormError } from "./Field";
import { acceptGoogleToken } from "./google";
import { TextError, useAccessError, useOpenSession } from "./useAccess";

type Props = {
  /** Los botones quedan inertes: otra cosa está enviándose, o faltan los términos. */
  disabled: boolean;
  /** Avisa si Apple o Google están hablando con la API, para deshabilitar el resto de la pantalla. */
  onBusyChange?: (busy: boolean) => void;
};

type Provider = "apple" | "google";

function sessionStore(): NameStore {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function SocialSection({ disabled, onBusyChange }: Props) {
  const t = useT();
  const { lang } = useLang();
  const openSession = useOpenSession();
  const accessError = useAccessError();
  const [busy, setBusy] = useState<Provider | null>(null);
  // Con su proveedor: el mensaje genérico de respaldo es el de quien falló.
  const [failed, setFailed] = useState<{ provider: Provider; error: unknown } | null>(null);
  const [appleReady, setAppleReady] = useState(false);

  if (!APPLE_SERVICE_ID && !GOOGLE_CLIENT_ID) return null;

  function start(provider: Provider) {
    setBusy(provider);
    onBusyChange?.(true);
    setFailed(null);
  }

  function finish() {
    setBusy(null);
    onBusyChange?.(false);
  }

  async function onGoogleToken(idToken: string) {
    if (!acceptGoogleToken({ disabled, busy: busy !== null })) return;
    start("google");
    try {
      await openSession(await loginWithGoogle(idToken));
    } catch (e) {
      setFailed({ provider: "google", error: e });
    } finally {
      finish();
    }
  }

  async function onAppleCredential(credential: AppleCredential) {
    const store = sessionStore();
    const name = nameForAttempt(credential.name, store);
    try {
      const response = await loginWithApple({ idToken: credential.idToken, nonce: credential.nonce, name });
      // La API ya tiene el nombre (o ya tenía uno): ahora sí se puede olvidar.
      clearPendingAppleName(store);
      await openSession(response);
    } catch (e) {
      setFailed({ provider: "apple", error: e });
    } finally {
      finish();
    }
  }

  function onAppleFailure(failure: AppleFailure) {
    finish();
    if (failure === "blocked") setFailed({ provider: "apple", error: new TextError("app:applePopupBlocked") });
    else if (failure === "other") setFailed({ provider: "apple", error: new TextError("auth:apple.signIn.genericError") });
  }

  const showSeparator = appleReady || Boolean(GOOGLE_CLIENT_ID);
  const connecting = busy === "apple" ? t("auth:apple.signIn.connecting") : busy === "google" ? t("auth:google.signIn.connecting") : "";
  const errorText = failed
    ? accessError(failed.error, failed.provider === "apple" ? "auth:apple.signIn.genericError" : "auth:google.signIn.genericError")
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      {showSeparator && (
        <p className="text-center text-[12px] font-bold uppercase tracking-wide text-ink-soft" aria-hidden>
          {t("common:or")}
        </p>
      )}
      <AppleButton
        lang={lang}
        label={t("auth:apple.signIn.label")}
        disabled={disabled || busy !== null}
        onReady={() => setAppleReady(true)}
        onStart={() => start("apple")}
        onCredential={(c) => void onAppleCredential(c)}
        onFailure={onAppleFailure}
      />
      <GoogleButton lang={lang} disabled={disabled || busy !== null} onToken={(token) => void onGoogleToken(token)} text="continue_with" />
      <p role="status" className="min-h-5 text-center text-[13px] font-semibold text-ink-soft">
        {connecting}
      </p>
      <FormError id="social-error">{errorText}</FormError>
    </div>
  );
}
