// Sesión de la app web (docs/app-web.md §4.3, §5.6–5.8, §6).
//
// Dos piezas separadas a propósito:
//
//   SessionStore    DÓNDE vive el refresh token y cómo se rota (§6.1). Hoy, la fase 0:
//                   solo memoria. La opción B (cookie del sitio, `/api/sesion/*`)
//                   es otra implementación de la MISMA interfaz; el resto no cambia.
//   SessionManager  QUÉ se hace con la sesión: access token en memoria, usuario,
//                   refresh con una sola promesa, cierre de sesión local, el motivo
//                   por el que terminó y el `prefillEmail`. No sabe de React; el
//                   proveedor (components/app/SessionProvider.tsx) solo lo muestra.
//
// El access token vive aquí, en memoria, y nunca sale: ni a `localStorage`, ni a
// una cookie legible, ni a la URL, ni al estado de React. El refresh token no
// sale del `SessionStore`: el manager solo ve `{ accessToken }`.

import {
  REFRESH_FAILURE_CODES,
  getMe,
  isApiError,
  logout as logoutRequest,
  refreshTokens,
  setAuthHandlers,
  ApiError,
  type ApiErrorCode,
  type LoginResponse,
  type SessionUser,
} from "@/lib/app/api";
import { afterLoginHref, safeNext } from "@/lib/app/next-param";
import { createCookieSessionStore } from "@/lib/app/session-cookie-store";

// ─── SessionStore ──────────────────────────────────────────────────────────

/** §6.1, tal cual. Cambiar de opción de almacenamiento es cambiar de implementación. */
export interface SessionStore {
  /** Al cargar la página: ¿hay una sesión que recuperar? */
  restore(): Promise<{ accessToken: string } | null>;
  /** Recibe los tokens de un inicio de sesión. Devuelve el access token que se usará (la opción B lo rota). */
  adopt(tokens: { accessToken: string; refreshToken: string }): Promise<{ accessToken: string }>;
  /** Un access token nuevo. Lanza `ApiError` si la sesión ya no sirve (401). */
  refresh(): Promise<{ accessToken: string }>;
  /** Revoca la sesión y olvida el refresh token. */
  logout(): Promise<void>;
  /**
   * Opcional (opción B, §6.3): avisos de OTRA pestaña: cerró sesión o abrió una.
   * Devuelve la función para dejar de escuchar. La memoria no lo necesita.
   */
  subscribe?(listener: (event: SessionEvent) => void): () => void;
}

export type SessionEvent = "signed-in" | "signed-out";

/**
 * Fase 0: los dos tokens viven en memoria y recargar la página cierra la sesión.
 * Cada pestaña tiene la suya. Es lo que sirve para construir y probar las
 * pantallas, y lo que se usa en un preview si algún día no hay cookie.
 */
export function createMemorySessionStore(): SessionStore {
  let refreshToken: string | null = null;

  return {
    async restore() {
      return null;
    },

    async adopt(tokens) {
      refreshToken = tokens.refreshToken;
      return { accessToken: tokens.accessToken };
    },

    async refresh() {
      if (refreshToken === null) throw new ApiError(401, "AUTH_REFRESH_TOKEN_NOT_FOUND");
      try {
        const tokens = await refreshTokens(refreshToken);
        // El refresh token rota: el anterior ya no sirve.
        refreshToken = tokens.refreshToken;
        return { accessToken: tokens.accessToken };
      } catch (error) {
        if (isApiError(error) && REFRESH_FAILURE_CODES.includes(error.code)) refreshToken = null;
        throw error;
      }
    },

    async logout() {
      const token = refreshToken;
      refreshToken = null;
      // La API responde 200 aunque el token ya no exista; no se espera de más.
      if (token !== null) await logoutRequest(token, { keepalive: true }).catch(() => {});
    },
  };
}

/** El almacenamiento que usa la app web. La opción B (cookie) se cambia SOLO aquí. */
export function createDefaultSessionStore(): SessionStore {
  return createCookieSessionStore();
}

// ─── Estado ────────────────────────────────────────────────────────────────

/** `restoring` = todavía no se sabe: las rutas muestran un esqueleto, nunca la pantalla de entrar. */
export type SessionStatus = "restoring" | "authenticated" | "anonymous";

export type SessionSnapshot = {
  status: SessionStatus;
  /** Lo de `/auth/*` completado con `GET /me`. Sin él (`null`) con `authenticated`: `/me` aún no llegó. */
  user: SessionUser | null;
  /**
   * Por qué terminó la sesión sin que la persona la cerrara (`AUTH_REFRESH_TOKEN_REVOKED`…).
   * La pantalla de entrar lo muestra y lo borra. Solo en memoria, nunca en la URL.
   */
  endedReason: ApiErrorCode | null;
  /** La persona cerró la sesión (`signOut`): al volver a entrar no hay `next` al que regresar. */
  loggedOut: boolean;
};

/** Lo que se pinta en el servidor y en el primer render del cliente. */
export const INITIAL_SNAPSHOT: SessionSnapshot = { status: "restoring", user: null, endedReason: null, loggedOut: false };

// ─── SessionManager ────────────────────────────────────────────────────────

export type SessionManagerOptions = {
  store: SessionStore;
  /** Tope de espera del cierre de sesión (§5.7). */
  logoutTimeoutMs?: number;
};

export class SessionManager {
  private readonly store: SessionStore;
  private readonly logoutTimeoutMs: number;

  private snapshot: SessionSnapshot = INITIAL_SNAPSHOT;
  private accessToken: string | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly cleanups = new Set<() => void>();

  // Una sola vez a la vez, a nivel de módulo (§5.6): StrictMode monta dos veces y
  // dos refresh con el mismo token chocarían (el segundo recibe REVOKED).
  private starting: Promise<void> | null = null;
  private refreshing: Promise<string> | null = null;

  private prefillEmail: string | null = null;

  constructor(options: SessionManagerOptions) {
    this.store = options.store;
    this.logoutTimeoutMs = options.logoutTimeoutMs ?? 3000;
    // El cliente de la API pide aquí el token y el refresh (sin importar este módulo).
    setAuthHandlers({
      getAccessToken: () => this.accessToken,
      refresh: () => this.refresh(),
      onAuthFailure: (error) => this.endSession(error.code),
    });
  }

  // useSyncExternalStore
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = (): SessionSnapshot => this.snapshot;

  /** El access token en memoria, para el cliente de la API. No va al estado de React. */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  private set(next: Partial<SessionSnapshot>) {
    this.snapshot = { ...this.snapshot, ...next };
    for (const listener of this.listeners) listener();
  }

  /** Recupera la sesión al cargar (§6.1 `restore`). Idempotente: una sola vez por manager. */
  start = (): Promise<void> => {
    if (this.starting === null) {
      this.starting = this.restore();
      // Un cierre de sesión o un inicio nuevo en otra pestaña (§5.6).
      this.store.subscribe?.(this.onRemoteEvent);
    }
    return this.starting;
  };

  private onRemoteEvent = (event: SessionEvent): void => {
    if (event === "signed-out") {
      if (this.snapshot.status === "anonymous") return;
      this.clearLocal();
      this.set({ status: "anonymous", user: null, endedReason: null, loggedOut: true });
      return;
    }
    // Otra pestaña entró (quizá con otra cuenta): se suelta lo de aquí y se recupera la sesión de la cookie.
    for (const cleanup of this.cleanups) cleanup();
    this.accessToken = null;
    this.starting = this.restore();
  };

  private async restore(): Promise<void> {
    let restored: { accessToken: string } | null = null;
    try {
      restored = await this.store.restore();
    } catch {
      restored = null;
    }
    if (restored === null) {
      this.set({ status: "anonymous", user: null });
      return;
    }
    this.accessToken = restored.accessToken;
    // El refresh no devuelve `user`: se pide `GET /me` (§5.6). Sin él no hay `onboarded`.
    try {
      this.set({ status: "authenticated", user: await getMe() });
    } catch (error) {
      if (isApiError(error) && error.code === "PROFILE_USER_NOT_FOUND") {
        await this.signOut();
      } else if (this.snapshot.status === "restoring") {
        // La sesión es buena aunque `/me` no haya llegado (sin red): no se cierra.
        this.set({ status: "authenticated", user: null });
      }
    }
  }

  /**
   * Abre la sesión con la respuesta de `login`, `verify`, `google`, `apple` o
   * `reset-password` (§5.8). Con la opción B, `adopt` hace el traspaso y puede
   * lanzar `ApiError`: la pantalla muestra `app.sessionEnded`.
   */
  signIn = async (response: LoginResponse): Promise<void> => {
    const { accessToken } = await this.store.adopt({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    this.accessToken = accessToken;
    this.set({ status: "authenticated", user: response.user, endedReason: null, loggedOut: false });
    // Las respuestas de /auth/* son mínimas a propósito: `/me` las completa.
    void this.refreshUser();
  };

  /** `GET /me` y mezcla el resultado. Si falla por red, se queda el usuario que había. */
  refreshUser = async (): Promise<void> => {
    try {
      const me = await getMe();
      if (this.snapshot.status !== "authenticated") return;
      this.set({ user: { ...this.snapshot.user, ...me } });
    } catch (error) {
      // La cuenta ya no existe: se cierra la sesión como en la app (§5.7).
      if (isApiError(error) && error.code === "PROFILE_USER_NOT_FOUND") await this.signOut();
    }
  };

  /** Cambia campos del usuario en memoria (por ejemplo `onboarded: true` al terminar el wizard). */
  updateUser = (patch: Partial<SessionUser>): void => {
    if (this.snapshot.user === null) return;
    this.set({ user: { ...this.snapshot.user, ...patch } });
  };

  /**
   * Un access token nuevo, compartido: llamadas simultáneas esperan la misma
   * promesa (una sola vez a la vez, §5.6). Lanza `ApiError`; si es un refresh
   * muerto, la sesión termina.
   */
  refresh = (): Promise<string> => {
    this.refreshing ??= this.doRefresh().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  };

  private async doRefresh(): Promise<string> {
    try {
      const { accessToken } = await this.store.refresh();
      this.accessToken = accessToken;
      return accessToken;
    } catch (error) {
      const failure = error instanceof ApiError ? error : new ApiError(0, "NETWORK");
      // Sin red no se pierde la sesión; con el refresh token muerto, sí.
      if (REFRESH_FAILURE_CODES.includes(failure.code)) this.endSession(failure.code);
      throw failure;
    }
  }

  /** La sesión murió por algo ajeno a la persona. Solo local: no llama a la API. */
  endSession = (reason: ApiErrorCode): void => {
    if (this.snapshot.status === "anonymous") return;
    this.clearLocal();
    this.set({ status: "anonymous", user: null, endedReason: reason });
  };

  /**
   * Cierre de sesión de la persona (§5.7): revoca (esperando, con tope), olvida
   * el token, borra el usuario y la caché, y la deja en `anonymous` sin motivo.
   */
  signOut = async (): Promise<void> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      this.store.logout().catch(() => {}),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, this.logoutTimeoutMs);
      }),
    ]);
    clearTimeout(timer);
    this.clearLocal();
    this.set({ status: "anonymous", user: null, endedReason: null, loggedOut: true });
  };

  private clearLocal() {
    this.accessToken = null;
    this.prefillEmail = null;
    forgetProviderLeftovers();
    for (const cleanup of this.cleanups) cleanup();
  }

  /** Para cachés de datos: se llama al terminar la sesión, de cualquier forma. */
  onSessionCleared = (cleanup: () => void): (() => void) => {
    this.cleanups.add(cleanup);
    return () => this.cleanups.delete(cleanup);
  };

  clearEndedReason = (): void => {
    if (this.snapshot.endedReason !== null) this.set({ endedReason: null });
  };

  /** §4.5: un correo que pasa de una pantalla de acceso a otra, solo en memoria (nunca en la URL). */
  setPrefillEmail = (email: string): void => {
    this.prefillEmail = email;
  };

  /** Lo lee una vez: después ya no está. */
  takePrefillEmail = (): string | null => {
    const email = this.prefillEmail;
    this.prefillEmail = null;
    return email;
  };
}

/** §5.7 paso 3: lo que Google y Apple dejan en el navegador. Mejor esfuerzo. */
function forgetProviderLeftovers() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem("centavos.apple.pendingName.v1");
  } catch {
    // Sin sessionStorage no hay nada que borrar.
  }
  try {
    const google = (window as unknown as { google?: { accounts?: { id?: { disableAutoSelect?: () => void } } } }).google;
    google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    // El script de Google puede no estar cargado.
  }
}

let singleton: SessionManager | null = null;

/** El manager de esta pestaña. Uno solo: StrictMode y HMR no deben crear dos. */
export function getSessionManager(): SessionManager {
  singleton ??= new SessionManager({ store: createDefaultSessionStore() });
  return singleton;
}

// ─── Adónde ir ─────────────────────────────────────────────────────────────

/** `/app/bienvenida`, llevando el `next` (ya validado) para volver a él al terminar el wizard. */
export function welcomeHref(nextRaw: string | null | undefined): string {
  const next = safeNext(nextRaw);
  // Volver a bienvenida al terminar bienvenida sería un ciclo.
  return next && !next.startsWith("/app/bienvenida") ? `/app/bienvenida?next=${encodeURIComponent(next)}` : "/app/bienvenida";
}

/**
 * Adónde manda una ruta de acceso a quien ya tiene sesión (§4.3, §5.8):
 * una cuenta nueva (`onboarded === false`) al wizard; si no, al `next` válido
 * o al Pulso. Solo `false` cuenta: si falta, se toma como configurada.
 */
export function afterLoginTarget(user: Pick<SessionUser, "onboarded"> | null, search: string): string {
  const next = new URLSearchParams(search).get("next");
  return user?.onboarded === false ? welcomeHref(next) : afterLoginHref(search);
}
