"use client";

// Ganchos que comparten las pantallas de acceso.

import { useCallback, useEffect, useRef, useState } from "react";
import { useErrorText, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { isApiError, type LoginResponse } from "@/lib/app/api";
import type { CopyKey } from "@/components/app/copy";
import type { ErrorScreen } from "@/components/app/copy/errorText";

/** `signIn` falló al abrir la sesión (la opción B puede lanzar): se muestra `app.sessionEnded`. */
export class SessionOpenError extends Error {
  constructor() {
    super("SESSION_OPEN");
    this.name = "SessionOpenError";
  }
}

/**
 * Abre la sesión con la respuesta de login / verify / google / reset-password.
 * No navega: en cuanto la sesión queda `authenticated`, `AccessGuard`
 * (components/app/SessionGuard.tsx) manda con `afterLoginTarget` a
 * `/app/bienvenida` (cuenta nueva) o al `next` válido / `/app/pulso` (§5.8), y
 * `signIn` ya pide `GET /me`. Duplicarlo aquí haría dos redirecciones.
 */
export function useOpenSession(): (response: LoginResponse) => Promise<void> {
  const { signIn } = useSession();
  return useCallback(
    async (response) => {
      try {
        await signIn(response);
      } catch {
        throw new SessionOpenError();
      }
    },
    [signIn],
  );
}

/** Texto de cualquier error de una pantalla de acceso, por código (nunca `error.message`). */
export function useAccessError(): (error: unknown, fallback?: CopyKey, screen?: ErrorScreen) => string {
  const t = useT();
  const errorText = useErrorText();
  return useCallback(
    (error, fallback = "common:genericError", screen) => {
      if (error instanceof SessionOpenError) return t("app:sessionEnded");
      if (isApiError(error)) return errorText(error, screen);
      if (error && typeof error === "object" && "code" in error) return errorText(error as { code?: string }, screen);
      return t(fallback);
    },
    [t, errorText],
  );
}

/**
 * Foco en el título cuando cambia el paso (§10). No actúa en el primer render:
 * ahí manda `autoFocus` del primer campo, si lo hay.
 */
export function useStepFocus<T extends HTMLElement>(step: unknown) {
  const ref = useRef<T>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [step]);
  return ref;
}

/** Cuenta regresiva en segundos. `start(n)` la arranca; llega a 0 y se detiene. */
export function useCountdown() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [remaining, setRemaining]);
  return { remaining, start: setRemaining };
}
