"use client";

import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "@/lib/promo-api";
import type { SiteLang } from "@/lib/lang";

// Minimal typing of the part of Google Identity Services we use.
type GoogleId = {
  initialize(config: { client_id: string; callback: (r: { credential?: string }) => void }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error("gsi"));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/**
 * "Sign in with Google" button. Renders nothing when no web client ID is
 * configured (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`). Hands the Google ID token to
 * `onToken`; the caller exchanges it with the API.
 */
export function GoogleButton({
  lang,
  disabled,
  onToken,
}: {
  lang: SiteLang;
  disabled: boolean;
  onToken: (idToken: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(onToken);
  useEffect(() => {
    latest.current = onToken;
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        const id = window.google?.accounts.id;
        if (cancelled || !id || !host.current) return;
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (r) => {
            if (r.credential) latest.current(r.credential);
          },
        });
        id.renderButton(host.current, { type: "standard", theme: "outline", size: "large", text: "signin_with", shape: "pill", locale: lang, width: 280 });
      })
      // The script is blocked or offline: the email form still works.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div
      ref={host}
      className={`flex justify-center min-h-10 ${disabled ? "pointer-events-none opacity-60" : ""}`}
      aria-busy={disabled}
    />
  );
}
