"use client";

// /app/gastos (docs/app-web.md §4.6, D-2): el historial de gastos. Copia a
// `HistorialGastos.tsx` de la app: buscador, pestañas de periodo, categoría,
// tarjeta con el total del filtro y la lista por día con scroll infinito.
// Solo lectura: no anota, no edita, no abre detalle. Los bloqueos de Centavos+ son
// los de la app (Año y buscar en todo el historial), pero sin paywall: muestran un aviso.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import {
  Bone,
  Card,
  CategoryIcon,
  Chip,
  Dropdown,
  EmptyState,
  Icon,
  LoadError,
  Money,
  Notice,
  PageColumn,
  SkeletonBlock,
  UseAppNotice,
  appDownloadHref,
  useCategories,
  useFormat,
  usePremium,
  type DropdownOption,
} from "@/components/app/ui";
import {
  PERIODS,
  SEARCH_DEBOUNCE_MS,
  createDebouncer,
  groupByDay,
  hasInstallmentChip,
  isLocked,
  searchesAll as searchesAllOf,
  type Period,
} from "@/components/app/gastos/historial";
import { useHistorial } from "@/components/app/gastos/useHistorial";
import type { Expense } from "@/lib/app/api";

const DEFAULT_CURRENCY = "MXN";

// «Mes» dice «Mes» en la pestaña y «Este mes» en la tarjeta: mismo rango, otra voz.
const TOTAL_LABEL = {
  day: "expenses:range.totalDay",
  week: "expenses:range.totalWeek",
  month: "expenses:range.totalMonth",
  year: "expenses:range.totalYear",
} as const;

// Frases enteras por periodo: «de hoy» y «esta semana» no llevan la misma preposición.
const SEARCH_LIMIT = {
  day: "expenses:search.limitedDay",
  week: "expenses:search.limitedWeek",
  month: "expenses:search.limitedMonth",
  year: "expenses:search.limitedYear",
} as const;

type Lock = "year" | "search" | null;

export function GastosScreen() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useSession();
  const { isPremium } = usePremium();
  const { getCategory, categories } = useCategories();
  const currency = user?.currency ?? DEFAULT_CURRENCY;

  const [period, setPeriod] = useState<Period>("month");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lock, setLock] = useState<Lock>(null);
  const searchId = useId();

  const debouncer = useMemo(() => createDebouncer(setDebouncedSearch, SEARCH_DEBOUNCE_MS), []);
  useEffect(() => () => debouncer.cancel(), [debouncer]);

  const onSearch = (value: string) => {
    setSearch(value);
    debouncer.push(value);
  };
  const clearSearch = () => {
    debouncer.cancel();
    setSearch("");
    setDebouncedSearch("");
  };

  const searching = debouncedSearch.trim().length > 0;
  const searchesAll = searchesAllOf(debouncedSearch, isPremium);
  const filtered = searching || category !== "all";

  const h = useHistorial({ period, category, search: debouncedSearch, isPremium });
  const selectedCategory = category !== "all" ? getCategory(category).label : null;

  const categoryOptions: DropdownOption[] = useMemo(
    () => [
      { key: "all", label: t("expenses:history.allCategories") },
      ...categories.map((c) => ({ key: c.key, label: c.label, icon: <CategoryIcon category={c.key} size={28} /> })),
    ],
    [categories, t],
  );

  const pickPeriod = (p: Period) => {
    // Una pestaña bloqueada no toca el filtro: nunca debe verse a medias.
    if (isLocked(p, isPremium)) {
      setLock("year");
      return;
    }
    setLock((l) => (l === "year" ? null : l));
    setPeriod(p);
  };

  const scope = searchesAll ? t("expenses:search.allHistory") : t(TOTAL_LABEL[period]);

  return (
    <PageColumn as="main" id="contenido" className="py-6">
      <header className="mb-4">
        <p className="text-caption font-bold text-mandarina-deep">{t("expenses:history.kicker")}</p>
        <h1 className="mt-1 font-display text-h1 font-extrabold text-ink">{t("expenses:history.title")}</h1>
      </header>

      {/* Buscador */}
      <div className="glass flex min-h-[48px] items-center gap-2.5 rounded-2xl px-4 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
        <label htmlFor={searchId} className="sr-only">
          {t("expenses:history.searchA11y")}
        </label>
        <Icon name="action-search" size={20} className="text-ink-soft" />
        <input
          id={searchId}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("expenses:history.searchPlaceholder")}
          className="min-h-[44px] min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-mute"
        />
        {search.length > 0 ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label={t("expenses:history.clearSearch")}
            className="-mr-3 flex h-11 w-11 shrink-0 items-center justify-center text-body text-ink-soft"
          >
            <span aria-hidden="true">✕</span>
          </button>
        ) : null}
      </div>

      {/* Alcance de la búsqueda: Centavos+ busca en todo; gratis, solo en el periodo. */}
      {searching ? (
        searchesAll ? (
          <p className="mt-2 px-1 text-small text-ink-soft">{t("expenses:search.allHistory")}</p>
        ) : (
          <button
            type="button"
            onClick={() => setLock("search")}
            className="mt-2 flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-rule px-4 py-2 text-left"
          >
            <Icon name="lock" size={16} className="text-ink-soft" />
            <span className="min-w-0 flex-1">
              <span className="block text-small text-ink-soft">{t(SEARCH_LIMIT[period])}</span>
              <span className="block text-body-bold font-bold text-mandarina-deep">{t("expenses:search.unlockAll")}</span>
            </span>
          </button>
        )
      ) : null}

      {/* Periodo */}
      <div role="group" aria-label={t("expenses:history.kicker")} className="mt-4 grid grid-cols-4 gap-1.5">
        {PERIODS.map((p) => {
          const locked = isLocked(p, isPremium);
          const active = period === p;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active}
              onClick={() => pickPeriod(p)}
              className={`flex min-h-[44px] items-center justify-center gap-1 rounded-xl border px-2 text-small font-bold ${
                active ? "border-ink bg-ink text-bg" : `glass-lite border-rule ${locked ? "text-ink-soft" : "text-ink"}`
              }`}
            >
              {locked ? <Icon name="lock" size={12} className="text-ink-soft" /> : null}
              {t(`expenses:range.${p}`)}
            </button>
          );
        })}
      </div>

      <div role="status">
        {lock ? (
          <Notice tone="band" icon="lock-outline" className="mt-3">
            {lock === "year" ? t("app:yearLocked") : t("expenses:search.unlockInApp")}
          </Notice>
        ) : null}
      </div>

      {/* Categoría */}
      <div className="mt-4">
        <p className="mb-1.5 px-1 text-caption font-bold text-ink-soft">{t("expenses:history.category")}</p>
        <Dropdown
          label={t("expenses:history.filterByCategory")}
          options={categoryOptions}
          selectedKey={category}
          onSelect={setCategory}
        />
      </div>

      {/* Total de todo el filtro (no de la página) */}
      <Card variant="ink" radius={20} padding={20} className="mt-4">
        <p className="truncate text-caption font-bold text-on-hero-soft">
          {scope}
          {selectedCategory ? ` · ${selectedCategory}` : ""}
        </p>
        {h.phase === "ready" ? (
          <>
            <p
              className="mt-0.5 font-display font-extrabold leading-tight tracking-[-0.04em] text-on-hero"
              style={{ fontSize: "clamp(1.75rem, 9vw, 2.375rem)" }}
            >
              <Money value={h.totalSpent} currency={currency} />
            </p>
            <p className="mt-0.5 text-small text-on-hero-soft">{t("expenses:history.count", { count: h.total })}</p>
          </>
        ) : (
          // Nada de «$0.00 · 0 gastos»: se leería como un periodo vacío de verdad.
          <div aria-hidden="true" className="mt-2 space-y-2.5">
            <Bone width="55%" height={34} className="!bg-on-hero-soft opacity-35" />
            <Bone width="28%" height={12} className="!bg-on-hero-soft opacity-35" />
          </div>
        )}
      </Card>

      {/* Lista */}
      <div className="mt-2">
        {h.phase === "loading" ? <ListSkeleton /> : null}
        {h.phase === "error" ? <LoadError message={h.error ?? ""} onRetry={h.reload} /> : null}
        {h.phase === "ready" && h.rows.length === 0 ? (
          filtered ? (
            <EmptyState icon="tab-historial" title={t("common:nothingHere")} body={t("expenses:history.noResults")} />
          ) : (
            <EmptyState
              icon="tab-historial"
              title={t("expenses:history.emptyTitle")}
              body={t("expenses:history.emptyBody")}
              action={{ label: t("app:emptyCta"), href: appDownloadHref(lang) }}
            />
          )
        ) : null}
        {h.phase === "ready" && h.rows.length > 0 ? (
          <>
            <DayList rows={h.rows} currency={currency} />
            <ListFooter more={h.more} paging={h.paging} error={h.pageError} onMore={h.loadMore} />
          </>
        ) : null}
      </div>

      <UseAppNotice className="mt-8 px-1" />
    </PageColumn>
  );
}

function DayList({ rows, currency }: { rows: Expense[]; currency: string }) {
  const f = useFormat();
  const groups = useMemo(() => groupByDay(rows), [rows]);
  return (
    <div>
      {groups.map((g) => {
        const headingId = `dia-${g.day}`;
        return (
          <section key={g.day} aria-labelledby={headingId} className="mt-4">
            <div className="flex items-baseline justify-between gap-3 px-1 pb-1.5">
              <h2 id={headingId} className="text-caption font-bold text-ink-soft">
                {f.date(g.date, "relative")}
              </h2>
              <Money value={g.subtotal} currency={currency} className="text-small font-bold text-ink-soft" />
            </div>
            <ul>
              {g.rows.map((e, i) => (
                <ExpenseRow key={e.id} e={e} currency={currency} last={i === g.rows.length - 1} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ExpenseRow({ e, currency, last }: { e: Expense; currency: string; last: boolean }) {
  const t = useT();
  const f = useFormat();
  const { getCategory } = useCategories();
  const cat = getCategory(e.category);
  const photos = e.imageCount ?? 0;
  return (
    <li className={`flex min-h-[64px] items-center gap-3 px-1 py-3 ${last ? "" : "border-b border-rule"}`}>
      <CategoryIcon category={e.category} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-bold font-bold text-ink">{e.note ?? cat.label}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-small text-ink-soft">
          <span className="truncate">{cat.label}</span>
          {hasInstallmentChip(e) ? (
            <Chip
              label={f.installment(e.currentInstallment, e.totalInstallments, e.installmentFrequency)}
              bg="var(--color-sky)"
              fg="var(--color-ink)"
            />
          ) : null}
          {photos > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-[3px]" role="img" aria-label={t("expenses:photoCount", { count: photos })}>
              <Icon name="image-outline" size={14} />
              {photos > 1 ? <span aria-hidden="true">{photos}</span> : null}
            </span>
          ) : null}
        </div>
      </div>
      <Money value={e.amount} currency={currency} prefix="−" className="shrink-0 text-body-bold font-bold text-ink" />
    </li>
  );
}

/** El final de la lista: el centinela del scroll infinito, el cargando o el reintento de una página. */
function ListFooter({ more, paging, error, onMore }: { more: boolean; paging: boolean; error: string | null; onMore: () => void }) {
  const t = useT();
  const sentinel = useRef<HTMLDivElement>(null);
  const onMoreRef = useRef(onMore);
  useEffect(() => {
    onMoreRef.current = onMore;
  });

  // Se vuelve a observar tras cada página: si la lista sigue corta, el centinela se ve de nuevo y pide otra.
  // Con un error no se observa (reintenta la persona): así un fallo no se vuelve una ráfaga de peticiones.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || paging || error || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((x) => x.isIntersecting)) onMoreRef.current();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [more, paging, error]);

  return (
    <div ref={sentinel} className="py-6 text-center">
      {paging ? (
        <SkeletonBlock>
          <Bone height={64} radius={12} />
        </SkeletonBlock>
      ) : null}
      {error ? (
        <div role="alert">
          <p className="mb-1 text-body-bold font-bold text-ink">{error}</p>
          <button
            type="button"
            onClick={onMore}
            className="inline-flex min-h-[44px] items-center px-4 text-body-bold font-bold text-mandarina-deep underline underline-offset-4"
          >
            {t("common:actions.retry")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Un encabezado de día y las filas que vendrán. */
function ListSkeleton() {
  return (
    <SkeletonBlock className="mt-4">
      <div className="mb-2 flex justify-between px-1">
        <Bone width="22%" height={12} />
        <Bone width="18%" height={12} />
      </div>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-1 py-3">
          <Bone width={42} height={42} radius={13} />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone width="55%" height={14} />
            <Bone width="30%" height={11} />
          </div>
          <Bone width={64} height={14} />
        </div>
      ))}
    </SkeletonBlock>
  );
}
