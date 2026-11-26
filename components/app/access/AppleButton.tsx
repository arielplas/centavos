"use client";

// «Continuar con Apple» (docs/app-web.md §5.5), en modo ventana emergente con Apple JS.
//
// Lo que decide si funciona: el navegador solo deja abrir la ventana si `AppleID.auth.signIn()`
// se llama directo desde el clic, sin nada asíncrono antes. El hash del nonce es asíncrono
// (`crypto.subtle`), así que cada intento se prepara ANTES del clic: nonce crudo, su hash y
// `state`, pasados a `AppleID.auth.init`. Se prepara al cargar el script y otra vez después de
// cada intento, porque un nonce sirve una sola vez.
//
// Botón propio, como en la app, con las reglas de Apple para botones propios: su logo en blanco
// sobre negro, su texto («Continuar con Apple»), más de 30 pt de alto, radio menor que la mitad
// del alto y un texto que no se corta. Si el script no carga, no aparece.

import { useCallback, useEffect, useRef, useState } from "react";
import { APPLE_REDIRECT_URI, APPLE_SERVICE_ID } from "@/lib/config";
import type { SiteLang } from "@/lib/lang";
import {
  appleFullName,
  appleRedirectUri,
  appleScriptUrl,
  classifyAppleError,
  randomHex,
  sha256Hex,
  type AppleFailure,
  type AppleUser,
} from "./apple";

// Lo mínimo de Apple JS que se usa.
type AppleSignInResponse = {
  authorization: { id_token: string; code?: string; state?: string };
  user?: AppleUser;
};
type AppleIdAuth = {
  init(config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state: string;
    nonce: string;
    usePopup: boolean;
  }): void;
  signIn(): Promise<AppleSignInResponse>;
};
declare global {
  interface Window {
    AppleID?: { auth: AppleIdAuth };
  }
}

/** Lo que el botón entrega: el token, el nonce CRUDO (la API lo hashea) y el nombre si llegó. */
export type AppleCredential = { idToken: string; nonce: string; name?: string };

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  let p = scripts.get(src);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => {
        scripts.delete(src);
        el.remove();
        reject(new Error("appleid"));
      };
      document.head.appendChild(el);
    });
    scripts.set(src, p);
  }
  return p;
}

export function AppleButton({
  lang,
  label,
  disabled,
  onReady,
  onStart,
  onCredential,
  onFailure,
}: {
  lang: SiteLang;
  label: string;
  disabled: boolean;
  /** El script cargó y el botón se ve (para que la sección decida si pinta el «o»). */
  onReady: () => void;
  /** La ventana de Apple se abrió. */
  onStart: () => void;
  onCredential: (credential: AppleCredential) => void;
  onFailure: (failure: AppleFailure) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const attempt = useRef<{ nonce: string; state: string } | null>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  const prepare = useCallback(async () => {
    const auth = window.AppleID?.auth;
    if (!auth) return;
    setPrepared(false);
    attempt.current = null;
    const nonce = randomHex();
    const state = randomHex(16);
    const hashed = await sha256Hex(nonce);
    try {
      auth.init({
        clientId: APPLE_SERVICE_ID,
        scope: "name email",
        redirectURI: appleRedirectUri(window.location, APPLE_REDIRECT_URI),
        state,
        nonce: hashed,
        usePopup: true,
      });
    } catch {
      return; // Configuración inválida: el botón queda inerte en vez de romper la pantalla.
    }
    attempt.current = { nonce, state };
    setPrepared(true);
  }, []);

  useEffect(() => {
    if (!APPLE_SERVICE_ID) return;
    let cancelled = false;
    loadScript(appleScriptUrl(lang))
      .then(async () => {
        if (cancelled) return;
        await prepare();
        if (cancelled) return;
        setLoaded(true);
        onReadyRef.current();
      })
      // Bloqueado o sin red: no hay botón de Apple y lo demás sigue sirviendo.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang, prepare]);

  if (!APPLE_SERVICE_ID || !loaded) return null;

  function onClick() {
    const current = attempt.current;
    const auth = window.AppleID?.auth;
    // El atributo `disabled` ya lo evita; esto cubre el clic que llega mientras se prepara.
    if (disabled || !prepared || !current || !auth) return;

    let pending: Promise<AppleSignInResponse>;
    try {
      pending = auth.signIn(); // Lo primero del clic: nada asíncrono antes.
    } catch {
      onFailure("other");
      void prepare();
      return;
    }
    onStart();
    pending
      .then((r) => {
        if (!r?.authorization?.id_token || r.authorization.state !== current.state) {
          onFailure("other");
          return;
        }
        onCredential({ idToken: r.authorization.id_token, nonce: current.nonce, name: appleFullName(r.user) });
      })
      .catch((e: unknown) => onFailure(classifyAppleError(e)))
      .finally(() => void prepare());
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !prepared}
      className="mx-auto flex w-full max-w-[280px] min-h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-[15px] font-semibold text-white hover:opacity-85 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-150"
    >
      <svg aria-hidden width="16" height="19" viewBox="0 0 17 20" fill="currentColor" className="shrink-0 -mt-0.5">
        <path d="M14.1 10.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-4zM11.7 3.5c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.5 2.8-1.3z" />
      </svg>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
