"use client";

// useLoad: el ciclo cargando → listo | error de una pantalla de datos, con la
// carrera resuelta (una respuesta vieja nunca pisa a una nueva) y el texto del
// error ya en el idioma activo (por código, nunca `error.message`, §10).
//
//   const { phase, data, error, reload } = useLoad(() => getPulse(), "pulse");
//   if (phase === "loading") return <Skeleton … />;
//   if (phase === "error")   return <LoadError message={error} onRetry={reload} />;
//   data.recentExpenses …
//
// `key` re-pide cuando cambia (el mes elegido, la pestaña, la búsqueda):
//   useLoad((signal) => getBudgets({ month, year }, { signal }), `${year}-${month}`);
// Cada nueva petición vuelve a `phase: "loading"` y aborta la anterior (`signal`).
// La función se lee en el momento de pedir, así que no hace falta memoizarla.

import { useCallback, useEffect, useRef, useState } from "react";
import { isApiError } from "@/lib/app/api";
import { useErrorText } from "@/components/app/LanguageProvider";

export type LoadState<T> =
  | { phase: "loading"; data: null; error: null }
  | { phase: "ready"; data: T; error: null }
  | { phase: "error"; data: null; error: string };

export type UseLoad<T> = LoadState<T> & {
  /** Vuelve a pedir (el «Reintentar»). */
  reload: () => void;
  /** El error de la API tal cual, para decidir por código (`BUDGET_NOT_FOUND`). */
  apiCode: string | null;
};

export function useLoad<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  key: string | number = "",
  opts: { fallbackError?: string } = {},
): UseLoad<T> {
  const errorText = useErrorText();
  const [state, setState] = useState<LoadState<T>>({ phase: "loading", data: null, error: null });
  const [apiCode, setApiCode] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const fetcherRef = useRef(fetcher);
  const errorTextRef = useRef(errorText);
  const fallbackRef = useRef(opts.fallbackError);
  useEffect(() => {
    fetcherRef.current = fetcher;
    errorTextRef.current = errorText;
    fallbackRef.current = opts.fallbackError;
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ phase: "loading", data: null, error: null });
    setApiCode(null);
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ phase: "ready", data, error: null });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const code = isApiError(error) ? error.code : "UNKNOWN";
        // Un código sin texto propio cae a `common:genericError`; la pantalla puede pedir el suyo.
        const generic = code === "UNKNOWN" && fallbackRef.current ? fallbackRef.current : null;
        setApiCode(code);
        setState({ phase: "error", data: null, error: generic ?? errorTextRef.current({ code }) });
      },
    );
    return () => controller.abort();
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload, apiCode };
}
