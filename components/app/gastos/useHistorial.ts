"use client";

// El historial de gastos: la primera página con `useLoad` (aborta la anterior al
// cambiar el filtro) y, aparte, las páginas siguientes del scroll infinito.
// Cada página extra lleva la clave del filtro que la pidió: si el filtro cambió,
// se descarta. El offset es lo ya cargado; los totales salen de la página más nueva.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getExpenses, isApiError, type Expense } from "@/lib/app/api";
import { useErrorText, useT } from "@/components/app/LanguageProvider";
import { useLoad } from "@/components/app/ui";
import { appendUniqueById, buildQuery, hasMore, queryKeyOf, type Filters } from "./historial";

type Extra = { key: string; rows: Expense[]; totalSpent: number; total: number; done: boolean };

export function useHistorial(filters: Filters) {
  const t = useT();
  const errorText = useErrorText();
  const { period, category, search, isPremium } = filters;
  // `buildQuery` lee la hora para el año: se calcula una vez por filtro.
  const query = useMemo(
    () => buildQuery({ period, category, search, isPremium }),
    [period, category, search, isPremium],
  );
  const key = useMemo(() => queryKeyOf(query), [query]);

  const first = useLoad((signal) => getExpenses(query, { signal }), key, { fallbackError: t("expenses:history.loadFailed") });

  const [extra, setExtra] = useState<Extra | null>(null);
  const [paging, setPaging] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  // Un filtro nuevo (o recargar tras un error) suelta lo que venía en camino.
  useEffect(() => {
    controller.current?.abort();
    controller.current = null;
    setExtra(null);
    setPaging(false);
    setPageError(null);
  }, [key, first.phase]);
  useEffect(() => () => controller.current?.abort(), []);

  const live = extra && extra.key === key ? extra : null;
  const firstData = first.phase === "ready" ? first.data : null;
  const rows = useMemo(
    () => (firstData ? appendUniqueById(firstData.expenses, live?.rows ?? []) : []),
    [firstData, live],
  );
  const total = live?.total ?? firstData?.pagination.total ?? 0;
  const totalSpent = live?.totalSpent ?? firstData?.totalSpent ?? 0;
  const more = !!firstData && !live?.done && hasMore(rows.length, total);

  const loadMore = useCallback(() => {
    if (!firstData || paging || !more) return;
    const ctl = new AbortController();
    controller.current = ctl;
    setPaging(true);
    setPageError(null);
    getExpenses({ ...query, offset: rows.length }, { signal: ctl.signal }).then(
      (page) => {
        if (ctl.signal.aborted) return;
        const fresh = appendUniqueById(rows, page.expenses).length - rows.length;
        setExtra((prev) => {
          const base = prev && prev.key === key ? prev : null;
          return {
            key,
            rows: [...(base?.rows ?? []), ...page.expenses],
            totalSpent: page.totalSpent,
            total: page.pagination.total,
            // Una página sin nada nuevo corta el ciclo: el observador no vuelve a pedir.
            done: fresh === 0,
          };
        });
        setPaging(false);
      },
      (error: unknown) => {
        if (ctl.signal.aborted) return;
        const code = isApiError(error) ? error.code : "UNKNOWN";
        setPageError(errorText({ code }));
        setPaging(false);
      },
    );
  }, [firstData, paging, more, query, rows, key, errorText]);

  return {
    phase: first.phase,
    error: first.error,
    reload: first.reload,
    rows,
    total,
    totalSpent,
    more,
    paging,
    pageError,
    loadMore,
  };
}
