// Sign in with Apple en la web (docs/app-web.md §5.5). Lo puro: el nonce, el nombre que Apple
// manda una sola vez, cómo se lee un error de Apple JS y la Return URL. El botón y el script
// viven en AppleButton.tsx.

import type { SiteLang } from "@/lib/lang";

/** Apple JS en el idioma de la página. Las dos URLs responden 200 (revisado en noviembre de 2026). */
export function appleScriptUrl(lang: SiteLang): string {
  const locale = lang === "en" ? "en_US" : "es_MX";
  return `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${locale}/appleid.auth.js`;
}

/** `bytes` bytes aleatorios en hex. Hex como la app: viaja en JSON y se compara byte a byte. */
export function randomHex(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * SHA-256 en hex en minúsculas. A Apple se le da el hash del nonce crudo y a la API el crudo:
 * la API lo vuelve a hashear y lo compara con el claim `nonce` del token (`verifyAppleIdToken`).
 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Lo que Apple JS manda en `user`: solo la primera vez que esa Apple ID autoriza a Centavos. */
export type AppleUser = { email?: string; name?: { firstName?: string; lastName?: string } };

/** Nombre y apellido recortados y unidos con un espacio; `undefined` si no hay nada. */
export function appleFullName(user?: AppleUser | null): string | undefined {
  const name = [user?.name?.firstName, user?.name?.lastName]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(" ");
  return name || undefined;
}

/**
 * Cómo terminó un intento fallido de Apple JS:
 * - `cancel`: la persona canceló o cerró la ventana. Sin mensaje, como en la app.
 *   `user_cancelled_authorize` lo manda Apple desde su ventana; `popup_closed_by_user` y
 *   `user_trigger_new_signin_flow` son de appleid.auth.js (el segundo, al abrir otro intento
 *   con uno abierto).
 * - `blocked`: el navegador bloqueó la ventana (`popup_blocked_by_browser`, de appleid.auth.js).
 * - `other`: cualquier otra cosa, con el mensaje genérico.
 */
export type AppleFailure = "cancel" | "blocked" | "other";

const CANCEL_ERRORS = new Set(["user_cancelled_authorize", "popup_closed_by_user", "user_trigger_new_signin_flow"]);

export function classifyAppleError(error: unknown): AppleFailure {
  const code = error && typeof error === "object" && "error" in error ? (error as { error: unknown }).error : undefined;
  if (typeof code !== "string") return "other";
  if (CANCEL_ERRORS.has(code)) return "cancel";
  if (code === "popup_blocked_by_browser") return "blocked";
  return "other";
}

/**
 * Return URL del intento: la configurada, o `origin + pathname` de la página. Sin la query:
 * estas páginas llevan `?next=…&lang=…` y Apple compara la URL con las registradas, tal cual.
 */
export function appleRedirectUri(location: { origin: string; pathname: string }, configured?: string): string {
  if (configured) return configured;
  const path = location.pathname.replace(/\/+$/, "") || "/";
  return `${location.origin}${path}`;
}

// ── El nombre que llega una sola vez ─────────────────────────────────────────────────────────

/** La misma clave que la app (`apple-auth.ts`). */
export const APPLE_PENDING_NAME_KEY = "centavos.apple.pendingName.v1";

/** `sessionStorage`, o lo que lo reemplace en las pruebas. `null`: no hay donde guardarlo. */
export type NameStore = Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;

/**
 * El nombre de este intento. Si Apple lo mandó, se guarda ANTES de llamar a la API, para que un
 * error de red no pierda la única copia; si no, se usa el que quedó de un intento anterior.
 */
export function nameForAttempt(fresh: string | undefined, store: NameStore): string | undefined {
  if (fresh) {
    try {
      store?.setItem(APPLE_PENDING_NAME_KEY, fresh);
    } catch {
      // Sin almacenamiento el nombre igual viaja en este intento.
    }
    return fresh;
  }
  try {
    return store?.getItem(APPLE_PENDING_NAME_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/** Se borra SOLO cuando la API respondió 2xx: ya tiene el nombre (o ya tenía uno). */
export function clearPendingAppleName(store: NameStore): void {
  try {
    store?.removeItem(APPLE_PENDING_NAME_KEY);
  } catch {
    // Inofensivo: un nombre viejo solo se vuelve a mandar, y la API lo ignora si ya hay cuenta.
  }
}
