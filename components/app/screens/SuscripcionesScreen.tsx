"use client";

// /app/suscripciones (docs/app-web.md §4.6, D-5): copia a `Suscripciones.tsx` de la app.
// Encabezado, tarjeta tinta con lo que se paga al mes y lo que se cobra esta semana,
// los cobros agrupados por cercanía (7 días / 30 días / más adelante) y, plegadas, las
// canceladas. Solo lectura: sin «+», sin detalle, sin editar.

import { useMemo, useState } from "react";
import { getSubscriptions, type SubscriptionsResponse } from "@/lib/app/api";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import {
  Bone,
  Card,
  EmptyState,
  Icon,
  LoadError,
  Money,
  PageColumn,
  ServiceMark,
  SkeletonBlock,
  UseAppNotice,
  appDownloadHref,
  useFormat,
  useLoad,
} from "@/components/app/ui";
import {
  SOON_DAYS,
  cancelledOnly,
  chargeWhen,
  fetchAllSubscriptions,
  groupByDue,
  type DueItem,
} from "@/components/app/suscripciones/subscriptions";

const DEFAULT_CURRENCY = "MXN";

const fetchAll = (signal: AbortSignal) =>
  fetchAllSubscriptions((query, s) => getSubscriptions(query, { signal: s }), signal);

export function SuscripcionesScreen() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useSession();
  const { phase, data, error, reload } = useLoad(fetchAll, "subscriptions", {
    fallbackError: t("subscriptions:loadFailed"),
  });
  const currency = user?.currency ?? DEFAULT_CURRENCY;
  const showCount = phase === "ready" && data.activeSubscriptions > 0;

  return (
    <PageColumn as="main" id="contenido" className="py-6">
      <header className="mb-5">
        <p className="text-caption font-bold text-mandarina-deep">
          {t("subscriptions:kicker")}
          {showCount ? ` · ${t("subscriptions:activeCount", { count: data.activeSubscriptions })}` : ""}
        </p>
        <h1 className="mt-1 font-display text-h1 font-extrabold text-ink">{t("subscriptions:title")}</h1>
      </header>

      {phase === "loading" ? <SuscripcionesSkeleton /> : null}
      {phase === "error" ? <LoadError message={error} onRetry={reload} /> : null}
      {phase === "ready" && data.subscriptions.length === 0 ? (
        <EmptyState
          icon="tab-suscripciones"
          title={t("subscriptions:emptyTitle")}
          body={t("subscriptions:emptyBody")}
          action={{ label: t("app:emptyCtaSubscription"), href: appDownloadHref(lang) }}
        />
      ) : null}
      {phase === "ready" && data.subscriptions.length > 0 ? <SuscripcionesBody data={data} currency={currency} /> : null}

      <UseAppNotice className="mt-8 px-1" />
    </PageColumn>
  );
}

export function SuscripcionesBody({
  data,
  currency,
  now,
}: {
  data: SubscriptionsResponse;
  currency: string;
  /** Solo para fijar «hoy» en una vista previa; la pantalla no lo pasa. */
  now?: Date;
}) {
  const t = useT();
  const f = useFormat();
  const [showCancelled, setShowCancelled] = useState(false);
  const groups = useMemo(() => groupByDue(data.subscriptions, now), [data.subscriptions, now]);
  const cancelled = useMemo(() => cancelledOnly(data.subscriptions), [data.subscriptions]);
  const week = groups.find((g) => g.key === "week");

  return (
    <>
      <Card variant="ink" radius={24} padding={24} className="mb-8">
        <p className="text-caption font-bold text-on-hero-soft">{t("subscriptions:monthlyTotal")}</p>
        <p
          className="mt-1 font-display font-extrabold leading-tight tracking-[-0.04em] text-on-hero"
          style={{ fontSize: "clamp(1.75rem, 9vw, 2.375rem)" }}
        >
          <Money value={data.projectedMonthlyCost} currency={currency} />
        </p>
        {week && week.items.length > 0 ? (
          <p className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-on-hero/[0.08] px-3 py-2">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-mandarina" />
            <span className="text-small text-on-hero-soft">{t("subscriptions:thisWeek")}</span>
            <span className="text-body-bold font-bold text-on-hero">
              <Money value={week.total} currency={currency} />
            </span>
          </p>
        ) : null}
      </Card>

      {groups.map((g) => {
        const headingId = `subs-group-${g.key}`;
        return (
          <section key={g.key} aria-labelledby={headingId} className="mb-6">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h2 id={headingId} className="text-caption font-bold text-ink-soft">
                {t(`subscriptions:group.${g.key}`)}
              </h2>
              {/* «Más adelante» abarca un tramo abierto: una suma se leería como cuenta por pagar. */}
              {g.key !== "later" ? (
                <p className="text-caption font-bold text-ink-soft">{f.money(g.total, currency)}</p>
              ) : null}
            </div>
            <ul>
              {g.items.map((item) => (
                <ActiveRow key={item.sub.id} item={item} currency={currency} now={now} />
              ))}
            </ul>
          </section>
        );
      })}

      {cancelled.length > 0 ? (
        <section className="mb-6">
          <h2 className="m-0">
            <button
              type="button"
              onClick={() => setShowCancelled((v) => !v)}
              aria-expanded={showCancelled}
              aria-controls="subs-cancelled"
              className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left text-caption font-bold text-ink-soft"
            >
              {t("subscriptions:cancelledToggle", { count: cancelled.length })}
              <Icon name={showCancelled ? "chevron-up" : "chevron-down"} size={18} />
            </button>
          </h2>
          {showCancelled ? (
            <ul id="subs-cancelled">
              {cancelled.map((s) => (
                <li key={s.id} className="flex items-center gap-3 border-b border-rule py-3">
                  <ServiceMark name={s.name} category={s.category} />
                  <div className="min-w-0 flex-1">
                    {/* En palabras y en tinta suave: sin tachado ni opacidad. */}
                    <p className="truncate text-body-bold font-bold text-ink-soft">{s.name}</p>
                    <p className="text-small text-ink-soft">{t("subscriptions:cancelledOne")}</p>
                  </div>
                  <Money value={s.amount} currency={currency} className="text-small text-ink-soft" />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

function ActiveRow({ item, currency, now }: { item: DueItem; currency: string; now?: Date }) {
  const t = useT();
  const { lang } = useLang();
  const { sub, days } = item;
  const yearly = sub.frequency === "yearly";
  const soon = days <= SOON_DAYS;
  const when = chargeWhen(item, t, lang, now);

  return (
    <li className="flex items-center gap-3 border-b border-rule py-3">
      <ServiceMark name={sub.name} category={sub.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-bold font-bold text-ink">{sub.name}</p>
        {/* «Pronto» va en las palabras y el peso, no solo en el color. */}
        <p className={`text-small ${soon ? "font-bold text-mandarina-deep" : "text-ink-soft"}`}>
          {when}
          {yearly ? ` · ${t("subscriptions:detail.annual")}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-body-bold font-bold text-ink">
          <Money value={sub.amount} currency={currency} />
        </p>
        <p className="text-small text-ink-soft">/{t(yearly ? "subscriptions:perYearShort" : "subscriptions:perMonthShort")}</p>
      </div>
    </li>
  );
}

function SuscripcionesSkeleton() {
  return (
    <SkeletonBlock>
      <Bone height={150} radius={24} className="mb-8" />
      <div className="mb-2 flex justify-between">
        <Bone width="35%" height={12} />
        <Bone width="22%" height={12} />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-rule py-3">
          <Bone width={44} height={44} radius={13} />
          <div className="flex-1 space-y-2">
            <Bone width="50%" height={14} />
            <Bone width="30%" height={12} />
          </div>
          <Bone width={70} height={14} />
        </div>
      ))}
    </SkeletonBlock>
  );
}
