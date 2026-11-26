"use client";

// /app/presupuestos (docs/app-web.md §4.6, D-3): copia a `Presupuestos.tsx` de la
// app. El título, el selector de mes (con el candado de Centavos+: gratis ve este
// mes y los dos anteriores), las pestañas Solos / Compartidos, el resumen del
// mes con su barra segmentada y los presupuestos en grupos (piden atención, van
// bien, sin límite), cada fila un enlace al detalle. Solo lectura.
//
// Como la app, pide los dos subconjuntos a la vez (`shared=false` y `shared=true`)
// para que cada uno lleve sus totales y su paginación, y pagina por scroll el de
// la pestaña a la vista.

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { getBudgets, type BudgetsResponse } from "@/lib/app/api";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { LoadMore } from "@/components/app/presupuestos/LoadMore";
import {
  BUDGETS_LIMIT,
  appendUniqueById,
  budgetsView,
  hasMore,
  isBudgetsTab,
  type BudgetsTab,
  type GroupKey,
  type Ranked,
  type Section,
} from "@/components/app/presupuestos/logic";
import {
  Bone,
  BudgetRow,
  BudgetRowsCard,
  Card,
  EmptyState,
  Icon,
  LISTED_MONTHS,
  LoadError,
  MonthPicker,
  Money,
  Notice,
  PageColumn,
  SkeletonBlock,
  UseAppNotice,
  appDownloadHref,
  monthClock,
  recentMonths,
  ringColor,
  shortMoney,
  useFormat,
  useLoad,
  usePremium,
  type MonthOption,
} from "@/components/app/ui";

const DEFAULT_CURRENCY = "MXN";
const TAB_STORAGE_KEY = "centavos.web.budgetsTab";

type Sections = { personal: Section; shared: Section };

function toSection(r: BudgetsResponse): Section {
  return {
    budgets: r.budgets,
    totalOfBudgets: r.totalOfBudgets,
    totalSpent: r.totalSpent,
    totalRemaining: r.totalRemaining,
    total: r.pagination.total,
  };
}

export function PresupuestosScreen() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useSession();
  const { isPremium } = usePremium();
  const userCurrency = user?.currency ?? DEFAULT_CURRENCY;

  const months = useMemo(() => recentMonths(LISTED_MONTHS, lang), [lang]);
  const [selectedKey, setSelectedKey] = useState(() => months[0].key);
  const selected = months.find((m) => m.key === selectedKey) ?? months[0];

  const [tab, setTab] = useState<BudgetsTab>("personal");
  // La última pestaña, como la app; se lee después de montar para no desfasar el HTML.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TAB_STORAGE_KEY);
      if (isBudgetsTab(stored)) setTab(stored);
    } catch {
      /* sin almacenamiento: se queda en Solos */
    }
  }, []);
  const selectTab = useCallback((next: BudgetsTab) => {
    setTab(next);
    try {
      window.localStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      /* no pasa nada */
    }
  }, []);

  const { phase, data, error, reload } = useLoad<Sections>(
    async (signal) => {
      const period = { month: selected.month, year: selected.year };
      const [personal, shared] = await Promise.all([
        getBudgets({ ...period, shared: false, limit: BUDGETS_LIMIT, offset: 0 }, { signal }),
        getBudgets({ ...period, shared: true, limit: BUDGETS_LIMIT, offset: 0 }, { signal }),
      ]);
      return { personal: toSection(personal), shared: toSection(shared) };
    },
    selected.key,
    { fallbackError: t("budgets:loadListFailed") },
  );

  return (
    <PageColumn as="main" id="contenido" className="py-6">
      <h1 className="mb-4 px-1 font-display text-h1 font-extrabold text-ink">{t("budgets:listTitle")}</h1>
      <MonthPicker
        months={months}
        selectedKey={selected.key}
        onSelect={(m: MonthOption) => setSelectedKey(m.key)}
        isPremium={isPremium}
        className="mb-4"
      />

      {phase === "loading" ? <ListSkeleton /> : null}
      {phase === "error" ? <LoadError message={error} onRetry={reload} /> : null}
      {phase === "ready" ? (
        <BudgetsBody
          key={selected.key}
          base={data}
          period={{ month: selected.month, year: selected.year }}
          tab={tab}
          onTab={selectTab}
          userCurrency={userCurrency}
        />
      ) : null}

      <UseAppNotice className="mt-8 px-1" />
    </PageColumn>
  );
}

// ─── Cuerpo ─────────────────────────────────────────────────────────────────

/** Las páginas que se fueron sumando a lo que trajo `base`; si `base` cambia (reintento), se descartan. */
type Extra = { base: Sections; personal: Section | null; shared: Section | null };

function BudgetsBody({
  base,
  period,
  tab,
  onTab,
  userCurrency,
}: {
  base: Sections;
  period: { month: number; year: number };
  tab: BudgetsTab;
  onTab: (tab: BudgetsTab) => void;
  userCurrency: string;
}) {
  const t = useT();
  const { lang } = useLang();
  const [extra, setExtra] = useState<Extra>({ base, personal: null, shared: null });
  const [paging, setPaging] = useState(false);
  const [pageFailed, setPageFailed] = useState(false);
  const pagingRef = useRef(false);

  const current = extra.base === base ? extra : { base, personal: null, shared: null };
  const sections: Sections = { personal: current.personal ?? base.personal, shared: current.shared ?? base.shared };
  const active = sections[tab];

  const loadMore = useCallback(async () => {
    if (pagingRef.current) return;
    pagingRef.current = true;
    setPaging(true);
    setPageFailed(false);
    try {
      const res = await getBudgets({
        ...period,
        shared: tab === "shared",
        limit: BUDGETS_LIMIT,
        offset: active.budgets.length,
      });
      setExtra((prev) => {
        const cur: Extra = prev.base === base ? prev : { base, personal: null, shared: null };
        const sec = cur[tab] ?? base[tab];
        const fresh = appendUniqueById(sec.budgets, res.budgets);
        // Una página que no trae nada nuevo no debe pedir otra sin fin.
        const total = fresh.length === sec.budgets.length ? fresh.length : res.pagination.total;
        return { ...cur, [tab]: { ...toSection(res), budgets: fresh, total } };
      });
    } catch {
      setPageFailed(true);
    } finally {
      pagingRef.current = false;
      setPaging(false);
    }
  }, [period, tab, active.budgets.length, base]);

  // Al cambiar de pestaña un error de página de la otra no se arrastra.
  useEffect(() => setPageFailed(false), [tab]);

  const isEmpty = sections.personal.budgets.length === 0 && sections.shared.budgets.length === 0;
  if (isEmpty) {
    return (
      <EmptyState
        icon="tab-presupuestos"
        title={t("budgets:emptyTitle")}
        body={t("budgets:emptyBody")}
        action={{ label: t("app:emptyCtaBudget"), href: appDownloadHref(lang) }}
      />
    );
  }

  return (
    <>
      <BudgetsTabs tab={tab} onSelect={onTab} />
      <div role="tabpanel" id={`presupuestos-panel-${tab}`} aria-labelledby={`presupuestos-tab-${tab}`}>
        {active.budgets.length === 0 ? (
          tab === "shared" ? (
            <EmptyState icon="tab-amigos" title={t("budgets:emptyShared")} body={t("budgets:emptySharedBody")} />
          ) : (
            // La app dice «Toca el + para crear…»; en la web no hay «+», así que el cuerpo
            // es el general y el botón lleva a la app.
            <EmptyState
              icon="tab-presupuestos"
              title={t("budgets:emptyPersonal")}
              body={t("budgets:emptyBody")}
              action={{ label: t("app:emptyCtaBudget"), href: appDownloadHref(lang) }}
            />
          )
        ) : (
          <BudgetSection section={active} shared={tab === "shared"} period={period} userCurrency={userCurrency} />
        )}
        <LoadMore
          more={hasMore(active.budgets.length, active.total)}
          busy={paging}
          failed={pageFailed}
          version={active.budgets.length}
          onMore={() => void loadMore()}
          failedMessage={t("budgets:loadListFailed")}
        />
      </div>
    </>
  );
}

// ─── Pestañas Solos / Compartidos ───────────────────────────────────────────

const TABS: { key: BudgetsTab; label: "budgets:tabPersonal" | "budgets:tabShared"; icon: "account" | "account-multiple" }[] = [
  { key: "personal", label: "budgets:tabPersonal", icon: "account" },
  { key: "shared", label: "budgets:tabShared", icon: "account-multiple" },
];

function BudgetsTabs({ tab, onSelect }: { tab: BudgetsTab; onSelect: (next: BudgetsTab) => void }) {
  const t = useT();
  const refs = useRef<Record<BudgetsTab, HTMLButtonElement | null>>({ personal: null, shared: null });

  // Flechas y Inicio / Fin, como pide el patrón de pestañas.
  function onKeyDown(e: KeyboardEvent) {
    const i = TABS.findIndex((x) => x.key === tab);
    const next =
      e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length]
      : e.key === "ArrowLeft" ? TABS[(i + TABS.length - 1) % TABS.length]
      : e.key === "Home" ? TABS[0]
      : e.key === "End" ? TABS[TABS.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    onSelect(next.key);
    refs.current[next.key]?.focus();
  }

  return (
    <div role="tablist" aria-label={t("budgets:listTitle")} onKeyDown={onKeyDown} className="mb-4 flex gap-1.5">
      {TABS.map((o) => {
        const on = o.key === tab;
        return (
          <button
            key={o.key}
            ref={(el) => {
              refs.current[o.key] = el;
            }}
            type="button"
            role="tab"
            id={`presupuestos-tab-${o.key}`}
            aria-selected={on}
            aria-controls={`presupuestos-panel-${o.key}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(o.key)}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[14px] border text-small font-bold ${
              on ? "border-ink bg-ink text-bg" : "glass border-rule text-ink"
            }`}
          >
            <Icon name={o.icon} size={15} />
            {t(o.label)}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sección: resumen y grupos ──────────────────────────────────────────────

function BudgetSection({
  section,
  shared,
  period,
  userCurrency,
}: {
  section: Section;
  shared: boolean;
  period: { month: number; year: number };
  userCurrency: string;
}) {
  const t = useT();
  const f = useFormat();
  const view = useMemo(() => budgetsView(section, userCurrency), [section, userCurrency]);
  const clock = useMemo(() => monthClock(period), [period]);
  const left = view.left;
  const over = left < 0;

  return (
    <>
      {/* Resumen: siempre en la moneda de la persona. */}
      <Card radius={22} className="mb-4">
        <p className={`text-caption font-bold ${over ? "text-red" : "text-ink-soft"}`}>
          {t(over ? "budgets:overspent" : "budgets:available")}
        </p>
        <p
          className={`mt-0.5 font-display font-extrabold leading-tight tracking-[-0.04em] ${over ? "text-red" : "text-ink"}`}
          style={{ fontSize: "clamp(1.75rem, 9vw, 2.375rem)" }}
        >
          <Money value={Math.abs(left)} currency={userCurrency} prefix={over ? "−" : undefined} />
        </p>
        {clock.pace !== null ? (
          <p className="mt-0.5 text-small text-ink-soft">
            {left > 0
              ? t("budgets:list.perDayLine", { amount: shortMoney(left / clock.daysLeft, userCurrency, f.lang), count: clock.daysLeft })
              : t("budgets:list.daysLeft", { count: clock.daysLeft })}
          </p>
        ) : null}
        {view.segments.length > 0 ? (
          <div aria-hidden="true" className="mt-4 flex h-2.5 gap-[3px]">
            {view.segments.map((r) => (
              <span
                key={r.b.id}
                className="h-2.5 rounded-[3px]"
                style={{ flex: `${r.b.monthly} 1 0%`, backgroundColor: ringColor(r.share), opacity: r.share === 0 ? 0.35 : 1 }}
              />
            ))}
          </div>
        ) : null}
      </Card>
      {view.hasOffCurrency ? (
        <p className="-mt-2 mb-4 px-2 text-small text-ink-soft">{t("budgets:onlyCurrencyTotal", { currency: userCurrency })}</p>
      ) : null}

      {view.allFine ? (
        <p className="mb-4 flex items-center gap-2.5 rounded-2xl border-[1.5px] border-green bg-green-soft p-3 text-[14px] font-bold text-ink">
          <Icon name="party-popper" size={20} style={{ color: "var(--color-green)" }} />
          <span className="flex-1">{t("budgets:list.allFine")}</span>
        </p>
      ) : null}

      {view.groups.map((g) => (
        <Group key={g.key} groupKey={g.key} rows={g.rows} shared={shared} clock={clock} userCurrency={userCurrency} />
      ))}
    </>
  );
}

function groupTone(key: GroupKey, rows: Ranked[]): { icon: "alert-circle-outline" | "alert-outline" | "check-circle-outline" | "infinity"; color: string; border: string | null } {
  if (key === "attention") {
    return rows.some((r) => r.tone === "over")
      ? { icon: "alert-circle-outline", color: "var(--color-red)", border: "var(--color-red)" }
      : { icon: "alert-outline", color: "var(--color-mandarina-deep)", border: "var(--color-yellow)" };
  }
  if (key === "fine") return { icon: "check-circle-outline", color: "var(--color-green)", border: "var(--color-green)" };
  return { icon: "infinity", color: "var(--color-ink-soft)", border: null };
}

function Group({
  groupKey,
  rows,
  shared,
  clock,
  userCurrency,
}: {
  groupKey: GroupKey;
  rows: Ranked[];
  shared: boolean;
  clock: ReturnType<typeof monthClock>;
  userCurrency: string;
}) {
  const t = useT();
  const [info, setInfo] = useState(false);
  const tone = groupTone(groupKey, rows);
  const over = rows.filter((r) => r.tone === "over");
  const message =
    groupKey === "attention" && over.length > 0
      ? over.length === 1
        ? t("budgets:list.msgOverOne", { name: over[0].b.name })
        : t("budgets:list.msgOverMany", { count: over.length })
      : null;

  return (
    <section className="mb-4" aria-labelledby={`grupo-${groupKey}`}>
      <div className="mb-1 ml-1 flex items-center gap-1.5">
        <Icon name={tone.icon} size={16} style={{ color: tone.color }} />
        {/* El color va en el ícono y el borde: verde y rojo como texto chico no dan AA. */}
        <h2 id={`grupo-${groupKey}`} className="text-caption font-bold text-ink">
          {t(`budgets:list.group_${groupKey}`)}
        </h2>
        {groupKey === "limitless" ? (
          <button
            type="button"
            aria-label={t("budgets:limitlessExcluded")}
            aria-expanded={info}
            onClick={() => setInfo((v) => !v)}
            className="-my-3 inline-flex h-11 w-11 items-center justify-center text-ink-mute"
          >
            <Icon name="information-outline" size={16} />
          </button>
        ) : null}
      </div>
      {info ? (
        <Notice role="status" className="mb-2 ml-1">
          {t("budgets:limitlessExcluded")}
        </Notice>
      ) : null}
      {message ? <p className="mb-2 ml-1 text-small text-ink-soft">{message}</p> : null}
      <BudgetRowsCard border={tone.border}>
        {rows.map((r, i) => (
          <BudgetRow key={r.b.id} b={r.b} shared={shared} userCurrency={userCurrency} clock={clock} last={i === rows.length - 1} />
        ))}
      </BudgetRowsCard>
    </section>
  );
}

/** Lo que se ve mientras llegan los presupuestos: la forma de lo que viene. */
function ListSkeleton() {
  return (
    <SkeletonBlock>
      <div className="mb-4 flex gap-1.5">
        <Bone height={44} radius={14} className="flex-1" />
        <Bone height={44} radius={14} className="flex-1" />
      </div>
      <Bone height={150} radius={22} className="mb-4" />
      <Bone height={72} radius={20} className="mb-3" />
      <Bone height={72} radius={20} />
    </SkeletonBlock>
  );
}
