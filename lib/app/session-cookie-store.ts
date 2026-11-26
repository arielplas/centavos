// SessionStore de la opción B (docs/app-web.md §5.6, §5.7, §6.3): el refresh
// token vive en una cookie HttpOnly del propio sitio que escriben las rutas
// `/api/sesion/*`. JavaScript solo lo ve un instante, al entrar (`adopt`), y el
// traspaso lo rota en seguida. Después solo existe el access token, en memoria.
//
// Entre pestañas:
//   - Web Locks (`centavos-refresh`): una pestaña refresca a la vez.
//   - Si aun así un refresh recibe `AUTH_REFRESH_TOKEN_REVOKED`, se reintenta una
//     vez: otra pestaña pudo rotar la cookie, y el reintento manda la nueva.
//   - `BroadcastChannel("centavos-session")`: un cierre de sesión o un inicio nuevo
//     en una pestaña se avisa a las demás (`subscribe`).

import { API_ERROR_CODES, ApiError, logout as logoutRequest, refreshTokens, type ApiErrorCode } from "@/lib/app/api";
import type { SessionEvent, SessionStore } from "@/lib/app/session";

const REFRESH_LOCK = "centavos-refresh";
const CHANNEL = "centavos-session";
const LOGOUT_PENDING_KEY = "centavos.logoutPending";
const LOGOUT_TIMEOUT_MS = 3000;

const KNOWN_CODES: ReadonlySet<string> = new Set(API_ERROR_CODES);

/** Entorno del navegador que usa el store. Se puede cambiar en las pruebas. */
export type CookieStoreEnv = {
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
  locks: Pick<LockManager, "request"> | null;
  channel: (() => Pick<BroadcastChannel, "postMessage" | "addEventListener" | "removeEventListener">) | null;
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
  /** Para avisar en desarrollo cuando el traspaso se queda en memoria. */
  warn: (message: string) => void;
};

function browserEnv(): CookieStoreEnv {
  const w = typeof window === "undefined" ? undefined : window;
  let storage: CookieStoreEnv["storage"] = null;
  try {
    storage = w?.localStorage ?? null;
  } catch {
    storage = null;
  }
  return {
    fetch: (input, init) => fetch(input, init),
    locks: typeof navigator !== "undefined" && "locks" in navigator ? navigator.locks : null,
    channel: typeof BroadcastChannel === "undefined" ? null : () => new BroadcastChannel(CHANNEL),
    storage,
    warn: (message) => {
      if (process.env.NODE_ENV === "development") console.warn(message);
    },
  };
}

/** Lee `{ error: { code } }` de las rutas (mismo contrato que la API). */
async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as { error?: { code?: unknown } } | null;
  const raw = typeof body?.error?.code === "string" ? body.error.code : "";
  return KNOWN_CODES.has(raw)
    ? new ApiError(response.status, raw as ApiErrorCode)
    : new ApiError(response.status, "UNKNOWN", { rawCode: raw || undefined });
}

function isRefreshFailure(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    (error.code === "AUTH_REFRESH_TOKEN_NOT_FOUND" ||
      error.code === "AUTH_REFRESH_TOKEN_REVOKED" ||
      error.code === "AUTH_REFRESH_TOKEN_EXPIRED")
  );
}

export function createCookieSessionStore(env: CookieStoreEnv = browserEnv()): SessionStore {
  /**
   * Solo si el traspaso falló por red o 5xx (§6.3): la pestaña sigue con el
   * refresh token en memoria, como la fase 0. Recargar pedirá entrar de nuevo.
   */
  let memoryToken: string | null = null;
  let inFlight: Promise<{ accessToken: string }> | null = null;

  const post = async (path: string, body?: unknown, init: { keepalive?: boolean; signal?: AbortSignal } = {}) => {
    let response: Response;
    try {
      response = await env.fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body ?? {}),
        credentials: "same-origin",
        cache: "no-store",
        ...init,
      });
    } catch {
      throw new ApiError(0, "NETWORK");
    }
    return response;
  };

  const callAccess = async (path: string, body?: unknown): Promise<{ accessToken: string }> => {
    const response = await post(path, body);
    if (!response.ok) throw await toApiError(response);
    const data = (await response.json().catch(() => null)) as { accessToken?: unknown } | null;
    if (typeof data?.accessToken !== "string") throw new ApiError(response.status, "UNKNOWN");
    return { accessToken: data.accessToken };
  };

  // Un solo canal para avisar y para escuchar: un canal no recibe sus propios mensajes,
  // pero otro canal del mismo nombre en esta misma pestaña sí los recibiría.
  let channel: ReturnType<NonNullable<CookieStoreEnv["channel"]>> | null = null;
  const getChannel = () => {
    if (channel === null && env.channel) {
      try {
        channel = env.channel();
      } catch {
        channel = null;
      }
    }
    return channel;
  };

  const broadcast = (event: SessionEvent) => {
    try {
      getChannel()?.postMessage({ type: event });
    } catch {
      // Sin BroadcastChannel las demás pestañas se enteran en su próximo refresh.
    }
  };

  const setPending = (on: boolean) => {
    try {
      if (on) env.storage?.setItem(LOGOUT_PENDING_KEY, "1");
      else env.storage?.removeItem(LOGOUT_PENDING_KEY);
    } catch {
      // Sin localStorage no hay dónde guardar la marca.
    }
  };
  const isPending = () => {
    try {
      return env.storage?.getItem(LOGOUT_PENDING_KEY) === "1";
    } catch {
      return false;
    }
  };

  /** `POST /api/sesion/logout`. `true` si la petición llegó (aunque la API haya fallado: la ruta borra la cookie igual). */
  const sendLogout = async (init: { keepalive?: boolean; signal?: AbortSignal } = {}): Promise<boolean> => {
    try {
      await post("/api/sesion/logout", {}, init);
      return true;
    } catch {
      return false;
    }
  };

  /** Una sola pestaña a la vez (Web Locks); sin ellos, sigue sin serializar. */
  const withLock = <T>(task: () => Promise<T>): Promise<T> =>
    env.locks ? Promise.resolve(env.locks.request(REFRESH_LOCK, task)) : task();

  /** Un refresh con la cookie, con un único reintento si otra pestaña ya rotó el token. */
  const refreshWithCookie = async (): Promise<{ accessToken: string }> => {
    try {
      return await callAccess("/api/sesion/refresh");
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== "AUTH_REFRESH_TOKEN_REVOKED") throw error;
      return callAccess("/api/sesion/refresh");
    }
  };

  /** Modo «solo memoria» (traspaso fallido): refresh directo a la API, como la fase 0. */
  const refreshFromMemory = async (): Promise<{ accessToken: string }> => {
    const token = memoryToken;
    if (token === null) throw new ApiError(401, "AUTH_REFRESH_TOKEN_NOT_FOUND");
    try {
      const tokens = await refreshTokens(token);
      memoryToken = tokens.refreshToken;
      return { accessToken: tokens.accessToken };
    } catch (error) {
      if (isRefreshFailure(error)) memoryToken = null;
      throw error;
    }
  };

  const doRefresh = (): Promise<{ accessToken: string }> =>
    withLock(() => (memoryToken !== null ? refreshFromMemory() : refreshWithCookie()));

  const refresh = (): Promise<{ accessToken: string }> => {
    // Una sola vez a la vez por pestaña (§5.6): el manager ya comparte su promesa; esto cubre `restore`.
    inFlight ??= doRefresh().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  return {
    async restore() {
      // §5.7: un cierre de sesión que no llegó se completa antes de nada.
      if (isPending()) {
        if (await sendLogout()) setPending(false);
        return null;
      }
      try {
        return await refresh();
      } catch (error) {
        // Sin cookie, vencida o revocada: no hay sesión. Sin red o 5xx, tampoco se sabe: el manager lo trata igual.
        if (isRefreshFailure(error)) return null;
        throw error;
      }
    },

    async adopt(tokens) {
      setPending(false);
      memoryToken = null;
      const handOver = () => callAccess("/api/sesion", { refreshToken: tokens.refreshToken });

      let result: { accessToken: string };
      try {
        try {
          result = await handOver();
        } catch (error) {
          // Red o 5xx: una vez más. Un 401 (o cualquier 4xx) no se reintenta.
          if (!(error instanceof ApiError) || (error.status !== 0 && error.status < 500)) throw error;
          result = await handOver();
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) {
          // La pestaña sigue solo en memoria, sin error visible.
          env.warn("[sesion] El traspaso a la cookie falló; la sesión vive solo en memoria en esta pestaña.");
          memoryToken = tokens.refreshToken;
          return { accessToken: tokens.accessToken };
        }
        throw error;
      }
      broadcast("signed-in");
      return result;
    },

    refresh,

    async logout() {
      const token = memoryToken;
      memoryToken = null;
      if (token !== null) void logoutRequest(token, { keepalive: true }).catch(() => {});

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), LOGOUT_TIMEOUT_MS);
      try {
        // `keepalive`: la petición sobrevive a una navegación.
        if (!(await sendLogout({ keepalive: true, signal: controller.signal }))) setPending(true);
      } finally {
        clearTimeout(timer);
        broadcast("signed-out");
      }
    },

    subscribe(listener) {
      const shared = getChannel();
      if (shared === null) return () => {};
      const onMessage = (event: Event) => {
        const type = (event as MessageEvent).data?.type;
        if (type === "signed-in" || type === "signed-out") listener(type);
      };
      shared.addEventListener("message", onMessage);
      return () => shared.removeEventListener("message", onMessage);
    },
  };
}
