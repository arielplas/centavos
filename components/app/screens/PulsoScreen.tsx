"use client";

// /app/pulso (docs/app-web.md §4.6, D-1): el resumen del mes y la casa de la app
// web. Copia a `Pulso.tsx` de la app: encabezado, tarjeta tinta con lo disponible,
// mosaicos de hoy / semana / mes, los 3 presupuestos que más piden una mirada y
// los gastos recientes. Solo lectura: nada de anotar ni de editar.
//
// Escritorio: dos columnas (tarjeta y mosaicos | presupuestos y recientes).
// Teléfono: una columna, y el avatar de la cuenta a la derecha del encabezado.

import Link from "next/link";
import { getPulse, type PulseResponse } from "@/lib/app/api";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { AccountAvatar } from "@/components/app/shell/AccountAvatar";
import {
  Bone,
  BudgetRow,
  BudgetRowsCard,
  Card,
  CategoryIcon,
  Chip,
  Icon,
  LoadError,
  Money,
  ProgressBar,
  PulseDot,
  SectionHeader,
  SkeletonBlock,
  UseAppNotice,
  appDownloadHref,
  currentPeriod,
  monthClock,
  useCategories,
  useFormat,
  useLoad,
} from "@/components/app/ui";
import { STATUS_KEYS, hasInstallmentChip, pulseView, type PulseView, type RecentExpense } from "./pulso";

const DEFAULT_CURRENCY = "MXN";

export function PulsoScreen() {
  const t = useT();
  const f = useFormat();
  const { user } = useSession();
  const { phase, data, error, reload } = useLoad(() => getPulse(), "pulse", { fallbackError: t("home:loadFailed") });
  const userCurrency = user?.currency ?? DEFAULT_CURRENCY;

  return (
    <main id="contenido" className="mx-auto w-full max-w-[1080px] px-4 py-6 md:px-6">
      <header className="mb-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-caption font-bold text-mandarina-deep">{f.date(new Date().toISOString(), "long")}</p>
          <h1 className="mt-1 font-display text-h1 font-extrabold text-ink">{t("home:greeting")}</h1>
        </div>
        {/* En el teléfono el avatar vive aquí (en escritorio, en la barra superior). */}
        <AccountAvatar className="md:hidden" />
      </header>

      {phase === "loading" ? <PulsoSkeleton /> : null}
      {phase === "error" ? <LoadError message={error} onRetry={reload} /> : null}
      {phase === "ready" ? <PulsoBody pulse={data} userCurrency={userCurrency} /> : null}

      <UseAppNotice className="mt-8 px-1" />
    </main>
  );
}

export function PulsoBody({ pulse, userCurrency }: { pulse: PulseResponse; userCurrency: string }) {
  const view = pulseView(pulse, userCurrency);
  return (
    <div className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
      <div className="space-y-4">
        <HeroCard pulse={pulse} view={view} userCurrency={userCurrency} />
        <Tiles pulse={pulse} userCurrency={userCurrency} />
      </div>
      <div className="space-y-8">
        {view.budgets.length > 0 ? <BudgetsSection view={view} userCurrency={userCurrency} /> : null}
        {view.recent.length > 0 ? <RecentSection recent={view.recent} userCurrency={userCurrency} /> : null}
      </div>
    </div>
  );
}

/** La tarjeta tinta: lo disponible del mes y cómo va, o la invitación a empezar. */
function HeroCard({ pulse, view, userCurrency }: { pulse: PulseResponse; view: PulseView; userCurrency: string }) {
  const t = useT();
  const { lang } = useLang();
  const f = useFormat();

  if (view.empty) {
    return (
      <Card variant="ink" radius={24} padding={24}>
        <p className="text-caption font-bold text-on-hero-soft">{t("home:emptyEyebrow")}</p>
        <h2 className="mt-1.5 whitespace-pre-line font-display text-h2 font-extrabold leading-[1.9rem] text-on-hero">
          {t("home:emptyTitle")}
        </h2>
        <p className="mt-2 text-small text-on-hero-soft">{t("home:emptyBody")}</p>
        <Link
          href={appDownloadHref(lang)}
          className="mt-5 flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-on-hero px-6 text-body-bold font-bold text-hero-bg"
        >
          {t("app:emptyCta")}
          <span aria-hidden="true" className="text-lg">
            ›
          </span>
        </Link>
      </Card>
    );
  }

  const status = STATUS_KEYS[pulse.status];
  return (
    <Card variant="ink" radius={24} padding={24}>
      <div className="flex items-center gap-2">
        <PulseDot status={pulse.status} size={10} />
        <p className="text-caption font-bold text-on-hero-soft">{t("home:availableThisMonth")}</p>
      </div>
      <p
        className="mt-1.5 font-display font-extrabold leading-tight tracking-[-0.04em] text-on-hero"
        style={{ fontSize: "clamp(1.75rem, 9vw, 2.375rem)" }}
      >
        <Money value={view.available} currency={userCurrency} prefix={view.available < 0 ? "−" : undefined} />
      </p>
      <p className="mt-1 text-small text-on-hero-soft">{t("home:ofBudgeted", { amount: f.money(pulse.totalBudget, userCurrency) })}</p>

      <div className="mt-5">
        <ProgressBar
          value={pulse.totalSpent}
          max={pulse.totalBudget}
          height={10}
          label={t("home:progressA11y", { percent: view.percent })}
        />
        <p className="mt-2 text-small text-on-hero-soft">
          {t("home:spentSoFar", { amount: f.money(pulse.totalSpent, userCurrency), percent: view.percent })}
        </p>
        {view.hasOffCurrency ? (
          <p className="mt-1.5 text-small text-on-hero-soft">{t("home:onlyCurrency", { currency: userCurrency })}</p>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl bg-on-hero/[0.07] p-3">
        <p className="text-body-bold font-bold text-on-hero">{t(status.line)}</p>
        <p className="mt-0.5 text-small text-on-hero-soft">{t(status.sub)}</p>
      </div>
    </Card>
  );
}

/** Hoy / Semana / Mes: una franja, para que los presupuestos queden arriba del pliegue. */
function Tiles({ pulse, userCurrency }: { pulse: PulseResponse; userCurrency: string }) {
  const t = useT();
  const f = useFormat();
  const label = t("home:spentA11y", {
    today: f.money(pulse.spentToday, userCurrency),
    week: f.money(pulse.spentThisWeek, userCurrency),
    month: f.money(pulse.spentThisMonth, userCurrency),
  });
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
      <Tile variant="peach" label={t("home:tileToday")} value={pulse.spentToday} currency={userCurrency} />
      <Tile variant="sand" label={t("home:tileWeek")} value={pulse.spentThisWeek} currency={userCurrency} />
      <Tile variant="sky" label={t("home:tileMonth")} value={pulse.spentThisMonth} currency={userCurrency} />
    </div>
  );
}

function Tile({ variant, label, value, currency }: { variant: "peach" | "sand" | "sky"; label: string; value: number; currency: string }) {
  return (
    <Card variant={variant} radius={14} padding={12} className="min-w-0">
      <p aria-hidden="true" className="text-caption font-bold text-ink-soft">
        {label}
      </p>
      <p aria-hidden="true" className="mt-0.5 truncate text-[17px] font-bold text-ink">
        <Money value={value} currency={currency} compact />
      </p>
    </Card>
  );
}

function BudgetsSection({ view, userCurrency }: { view: PulseView; userCurrency: string }) {
  const t = useT();
  const clock = monthClock(currentPeriod());
  return (
    <section aria-labelledby="pulso-presupuestos">
      <SectionHeader
        kicker={t("home:budgetsKicker")}
        title={<span id="pulso-presupuestos">{t("home:budgetsHeading")}</span>}
        action={<SeeAll href="/app/presupuestos" className="hidden md:inline-flex" />}
        className="mb-3 px-1"
      />
      <BudgetRowsCard>
        {view.budgets.map((b, i) => (
          <BudgetRow key={b.id} b={b} userCurrency={userCurrency} clock={clock} last={i === view.budgets.length - 1} />
        ))}
      </BudgetRowsCard>
    </section>
  );
}

function RecentSection({ recent, userCurrency }: { recent: RecentExpense[]; userCurrency: string }) {
  const t = useT();
  const f = useFormat();
  const { getCategory } = useCategories();
  return (
    <section aria-labelledby="pulso-recientes">
      <SectionHeader
        kicker={t("home:recentKicker")}
        title={<span id="pulso-recientes">{t("home:recentHeading")}</span>}
        action={<SeeAll href="/app/gastos" />}
        className="mb-1 px-1"
      />
      <ul>
        {recent.map((e, i) => {
          const cat = getCategory(e.category);
          return (
            <li key={e.id} className={`flex min-h-[60px] items-center gap-3 px-1 py-3 ${i === recent.length - 1 ? "" : "border-b border-rule"}`}>
              <CategoryIcon category={e.category} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-bold font-bold text-ink">{e.note ?? cat.label}</p>
                <div className="mt-px flex items-center gap-1.5 text-small text-ink-soft">
                  <span className="truncate">
                    {cat.label} · {f.date(e.date, "relative")}
                  </span>
                  {hasInstallmentChip(e) ? (
                    <Chip
                      label={f.installment(e.currentInstallment, e.totalInstallments, e.installmentFrequency)}
                      bg="var(--color-sky)"
                      fg="var(--color-ink)"
                    />
                  ) : null}
                  {e.imageCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-[3px]" aria-label={t("expenses:photoCount", { count: e.imageCount })} role="img">
                      <Icon name="image-outline" size={14} />
                      {e.imageCount > 1 ? <span aria-hidden="true">{e.imageCount}</span> : null}
                    </span>
                  ) : null}
                </div>
              </div>
              <Money value={e.amount} currency={userCurrency} prefix="−" className="shrink-0 text-body-bold font-bold text-ink" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SeeAll({ href, className }: { href: string; className?: string }) {
  const t = useT();
  return (
    <Link href={href} className={`min-h-[44px] items-center px-2 text-small font-bold text-mandarina-deep underline underline-offset-4 ${className ?? "inline-flex"}`}>
      {t("app:seeAll")}
    </Link>
  );
}

/** Lo que se ve mientras llega el pulso: la forma de lo que viene. */
function PulsoSkeleton() {
  return (
    <SkeletonBlock className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
      <div className="space-y-4">
        <Bone height={250} radius={24} />
        <div className="grid grid-cols-3 gap-2">
          <Bone height={64} radius={14} />
          <Bone height={64} radius={14} />
          <Bone height={64} radius={14} />
        </div>
      </div>
      <div>
        <Bone width="30%" height={12} className="ml-1" />
        <Bone width="70%" height={24} className="mb-3 ml-1 mt-2" />
        <div className="space-y-3">
          <Bone height={72} radius={20} />
          <Bone height={72} radius={20} />
        </div>
      </div>
    </SkeletonBlock>
  );
}
