"use client";

// /app/presupuestos/[id] (docs/app-web.md §4.6, D-4): copia a `DetallePresupuesto.tsx`
// de la app, de solo lectura. Volver a Presupuestos y el selector de mes (con el
// candado de Centavos+), la tarjeta de vidrio con el anillo, la leyenda y el
// ritmo del mes, los avisos de congelado / cerca del tope, los gastos del mes
// con scroll infinito y, en un compartido, los pagos registrados. Sin editar,
// borrar, saldos ni miembros: eso es de la app.

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBudget, type BudgetDetailResponse, type Expense } from "@/lib/app/api";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { ExpenseRow } from "@/components/app/presupuestos/ExpenseRow";
import { LoadMore } from "@/components/app/presupuestos/LoadMore";
import { EXPENSES_LIMIT, appendUniqueById, detailView, hasMore } from "@/components/app/presupuestos/logic";
import {
  Bone,
  CategoryIcon,
  Card,
  Icon,
  LISTED_MONTHS,
  LoadError,
  MonthPicker,
  Money,
  Notice,
  PageColumn,
  RingLegend,
  SkeletonBlock,
  SoftHalo,
  SpendRing,
  UseAppNotice,
  monthClock,
  recentMonths,
  ringColor,
  useCategories,
  useFormat,
  useLoad,
  usePremium,
  type MonthOption,
} from "@/components/app/ui";

const DEFAULT_CURRENCY = "MXN";

export function PresupuestoDetalleScreen() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useSession();
  const { isPremium } = usePremium();
  // El id llega de la URL; ningún id se prerenderiza (§4.2).
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const userCurrency = user?.currency ?? DEFAULT_CURRENCY;

  const months = useMemo(() => recentMonths(LISTED_MONTHS, lang), [lang]);
  const [selectedKey, setSelectedKey] = useState(() => months[0].key);
  const selected = months.find((m) => m.key === selectedKey) ?? months[0];

  const { phase, data, error, apiCode, reload } = useLoad<BudgetDetailResponse>(
    (signal) => getBudget(id, { month: selected.month, year: selected.year, limit: EXPENSES_LIMIT, offset: 0 }, { signal }),
    `${id}|${selected.key}`,
    { fallbackError: t("budgets:detail.loadFailed") },
  );

  if (phase === "error" && apiCode === "BUDGET_NOT_FOUND") {
    return (
      <PageColumn as="main" id="contenido" className="py-6">
        <BackLink />
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <span aria-hidden="true" className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-sand text-ink">
            <Icon name="tab-presupuestos" size={34} />
          </span>
          <h1 className="mb-2 font-display text-h2 font-extrabold text-ink">{t("budgets:detail.notFound")}</h1>
          <p className="mb-6 text-body text-ink-soft">{t("budgets:detail.maybeDeleted")}</p>
          <Link
            href="/app/presupuestos"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-6 text-body-bold font-bold text-bg"
          >
            {t("budgets:detail.backToList")}
          </Link>
        </div>
      </PageColumn>
    );
  }

  return (
    <PageColumn as="main" id="contenido" className="py-6">
      <BackLink />
      <MonthPicker
        months={months}
        selectedKey={selected.key}
        onSelect={(m: MonthOption) => setSelectedKey(m.key)}
        isPremium={isPremium}
        className="mb-4"
      />

      {phase === "loading" ? <DetailSkeleton /> : null}
      {phase === "error" ? (
        <>
          <h1 className="sr-only">{t("budgets:detail.statBudget")}</h1>
          <LoadError message={error} onRetry={reload} />
        </>
      ) : null}
      {phase === "ready" ? (
        <DetailBody key={`${id}|${selected.key}`} id={id} base={data} month={selected} userCurrency={userCurrency} />
      ) : null}

      <UseAppNotice className="mt-8 px-1" />
    </PageColumn>
  );
}

function BackLink() {
  const t = useT();
  return (
    <Link
      href="/app/presupuestos"
      className="-ml-2 mb-1 inline-flex min-h-[44px] items-center gap-0.5 px-2 text-small font-bold text-mandarina-deep"
    >
      <Icon name="chevron-left" size={18} />
      {t("budgets:listTitle")}
    </Link>
  );
}

// ─── Cuerpo ─────────────────────────────────────────────────────────────────

/** Las páginas de gastos que se sumaron a la primera; si `base` cambia (reintento), se descartan. */
type Extra = { base: BudgetDetailResponse; expenses: Expense[]; total: number } | null;

function DetailBody({
  id,
  base,
  month,
  userCurrency,
}: {
  id: string;
  base: BudgetDetailResponse;
  month: MonthOption;
  userCurrency: string;
}) {
  const t = useT();
  const f = useFormat();
  const { getCategory } = useCategories();
  const [extra, setExtra] = useState<Extra>(null);
  const [paging, setPaging] = useState(false);
  const [pageFailed, setPageFailed] = useState(false);
  const pagingRef = useRef(false);

  const { budget, settlements } = base;
  const current = extra && extra.base === base ? extra : null;
  const expenses = current?.expenses ?? base.expenses;
  const total = current?.total ?? base.pagination.total;

  const loadMore = useCallback(async () => {
    if (pagingRef.current) return;
    pagingRef.current = true;
    setPaging(true);
    setPageFailed(false);
    try {
      const res = await getBudget(id, { month: month.month, year: month.year, limit: EXPENSES_LIMIT, offset: expenses.length });
      setExtra((prev) => {
        const cur = prev && prev.base === base ? prev : { base, expenses: base.expenses, total: base.pagination.total };
        const fresh = appendUniqueById(cur.expenses, res.expenses);
        // Una página sin nada nuevo no debe pedir otra sin fin.
        return { base, expenses: fresh, total: fresh.length === cur.expenses.length ? fresh.length : res.pagination.total };
      });
    } catch {
      setPageFailed(true);
    } finally {
      pagingRef.current = false;
      setPaging(false);
    }
  }, [id, month.month, month.year, expenses.length, base]);

  const cat = getCategory(budget.category);
  const v = detailView(budget, month.month, month.year);
  const clock = monthClock({ month: month.month, year: month.year });
  const shared = !!budget.shared;
  const frozen = !!budget.frozen;
  // Todo en esta pantalla es del presupuesto, así que va en su propia moneda.
  const cur = budget.currency ?? userCurrency;
  const name = budget.name || cat.label;

  return (
    <>
      <Card radius={24} padding={20} className="relative overflow-hidden">
        <SoftHalo color={cat.color} className="-left-[90px] -top-[110px]" />
        <div className="relative flex items-center gap-3.5">
          <CategoryIcon category={budget.category} size={56} imageUrl={budget.imageUrl} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-h2 font-extrabold text-ink [overflow-wrap:anywhere]">{name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-small text-ink-soft">
              <span>
                {clock.pace !== null ? t("budgets:detail.daysLeft", { month: month.label, count: clock.daysLeft }) : month.label}
              </span>
              {shared ? (
                <span className="inline-flex items-center gap-[3px] rounded-full bg-sand px-2 py-0.5 text-[11px] font-bold text-ink">
                  <Icon name="account-multiple" size={12} />
                  {t("budgets:shared")}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {v.limitless ? (
          <div className="relative mt-5">
            <p className="text-caption font-bold text-ink-soft">{t("budgets:detail.spentThisMonth")}</p>
            <p className="mt-0.5 font-display font-extrabold leading-tight tracking-[-0.04em] text-ink" style={{ fontSize: "clamp(1.75rem, 9vw, 2.5rem)" }}>
              <Money value={budget.spent} currency={cur} />
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-small font-bold text-ink">
                <Icon name="infinity" size={14} />
                {t("budgets:edit.noLimit")}
              </span>
              <span className="text-small text-ink-soft">{t("budgets:detail.movementsCount", { count: total })}</span>
            </div>
          </div>
        ) : (
          <div className="relative mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:justify-start">
            <SpendRing
              share={v.share}
              pace={v.pace}
              label={t("budgets:detail.ringA11y", { pct: v.pct, left: f.money(v.left, cur) })}
            >
              <span className="flex flex-col items-center text-center">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${v.isOver ? "text-red" : "text-ink-soft"}`}>
                  {t(v.isOver ? "budgets:overspent" : "budgets:available")}
                </span>
                <Money
                  value={Math.abs(v.left)}
                  currency={cur}
                  prefix={v.isOver ? "−" : undefined}
                  compact={Math.abs(v.left) >= 10_000}
                  className={`whitespace-nowrap text-[18px] font-extrabold leading-tight ${v.isOver ? "text-red" : "text-ink"}`}
                />
                <span className="text-small text-ink-soft">{t("budgets:detail.usedPct", { pct: v.pct })}</span>
              </span>
            </SpendRing>
            <div className="flex min-w-[112px] flex-1 flex-col gap-3">
              <RingLegend swatch={ringColor(v.share)} label={t("budgets:detail.statSpent")}>
                <Money value={budget.spent} currency={cur} compact={budget.spent >= 10_000} className="mt-0.5 block text-[17px] font-extrabold text-ink" />
              </RingLegend>
              <RingLegend label={t("budgets:detail.statBudget")}>
                <Money value={budget.monthly as number} currency={cur} compact={(budget.monthly as number) >= 10_000} className="mt-0.5 block text-[17px] font-extrabold text-ink" />
              </RingLegend>
              {v.pace !== null ? (
                <RingLegend dash label={t("budgets:detail.pace")}>
                  <span className={`mt-0.5 block text-small font-bold ${v.paceTone === "ahead" ? "text-red" : "text-ink"}`}>
                    {t(`budgets:detail.pace_${v.paceTone}`)}
                  </span>
                </RingLegend>
              ) : null}
            </div>
          </div>
        )}
      </Card>

      {frozen ? (
        <Notice icon="lock-outline" role="note" className="mt-4 px-1">
          {t("budgets:detail.readOnlyNote")}
        </Notice>
      ) : null}

      {!v.limitless && (v.isOver || v.isWarning) ? (
        <Banner icon={v.isOver ? "alert-circle-outline" : "alert-outline"} tone={v.isOver ? "over" : "near"}>
          {v.isOver ? t("budgets:detail.overBy", { amount: f.money(budget.spent - (budget.monthly as number), cur) }) : t("budgets:detail.nearLimit")}
        </Banner>
      ) : null}

      {shared && settlements.length > 0 ? (
        <section aria-labelledby="detalle-pagos" className="mt-8">
          <h2 id="detalle-pagos" className="mb-1 px-1 text-caption font-bold text-ink">
            {t("app:settlements")} · {settlements.length}
          </h2>
          <ul>
            {settlements.map((s, i) => (
              <li key={s.id} className={`flex min-h-[60px] items-center gap-3 px-1 py-3 ${i === settlements.length - 1 ? "" : "border-b border-rule"}`}>
                <span aria-hidden="true" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-sand text-ink">
                  <Icon name="account-multiple" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-bold font-bold text-ink [overflow-wrap:anywhere]">
                    {t("app:settlementLine", { from: s.fromUserName, to: s.toUserName })}
                  </p>
                  <p className="mt-px text-small text-ink-soft">{f.date(s.settledAt, "short")}</p>
                  {s.note ? <p className="mt-px truncate text-small text-ink-soft">{s.note}</p> : null}
                </div>
                <Money value={s.amount} currency={cur} className="shrink-0 text-body-bold font-bold text-ink" />
              </li>
            ))}
          </ul>
          <Notice className="mt-2 px-1">{t("app:settlementsInApp")}</Notice>
        </section>
      ) : null}

      <section aria-labelledby="detalle-gastos" className="mt-8">
        <h2 id="detalle-gastos" className="mb-1 px-1 text-caption font-bold text-ink">
          {total > 0 ? t("budgets:detail.monthExpensesCount", { count: total }) : t("budgets:detail.monthExpenses")}
        </h2>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <span aria-hidden="true" className="mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-sand text-ink">
              <Icon name="tab-historial" size={34} />
            </span>
            <p className="text-body-bold font-bold text-ink">{t("budgets:detail.noExpensesThisMonth")}</p>
          </div>
        ) : (
          <ul>
            {expenses.map((e, i) => (
              <ExpenseRow key={e.id} expense={e} currency={cur} last={i === expenses.length - 1} />
            ))}
          </ul>
        )}
        <LoadMore
          more={hasMore(expenses.length, total)}
          busy={paging}
          failed={pageFailed}
          version={expenses.length}
          onMore={() => void loadMore()}
          failedMessage={t("budgets:detail.loadFailed")}
        />
      </section>
    </>
  );
}

function Banner({ icon, tone, children }: { icon: "alert-circle-outline" | "alert-outline"; tone: "over" | "near"; children: ReactNode }) {
  return (
    <p className={`glass mt-4 flex items-center gap-2 rounded-[14px] px-4 py-3 text-small ${tone === "over" ? "text-red" : "text-mandarina-deep"}`}>
      <Icon name={icon} size={16} />
      <span className="flex-1">{children}</span>
    </p>
  );
}

/** Lo que se ve mientras llega el detalle: la forma de lo que viene. */
function DetailSkeleton() {
  return (
    <SkeletonBlock>
      <Bone height={260} radius={24} className="mb-6" />
      <Bone width="40%" height={14} className="mb-3 ml-1" />
      <Bone height={56} radius={12} className="mb-2" />
      <Bone height={56} radius={12} className="mb-2" />
      <Bone height={56} radius={12} />
    </SkeletonBlock>
  );
}
