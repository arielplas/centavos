"use client";

// <BudgetRow>: un presupuesto, igual en todos lados donde se lista (Presupuestos
// y Pulso). Un `SpendRing` chico alrededor del ícono de la categoría lleva el
// estado (arco = uso, color = estado, marca = ritmo del mes); el nombre con un
// dato abajo; a la derecha, lo que queda o cuánto se pasó. Toda la fila es un
// enlace al detalle. Copia de `components/BudgetRow.tsx` de la app.
//
//   <BudgetRowsCard>
//     {budgets.map((b, i) => (
//       <BudgetRow key={b.id} b={b} userCurrency={user.currency} clock={clock} last={i === budgets.length - 1} />
//     ))}
//   </BudgetRowsCard>

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useT } from "@/components/app/LanguageProvider";
import { CategoryIcon } from "./CategoryIcon";
import { Icon } from "./Icon";
import { Money } from "./Money";
import { SharedBadge } from "./SharedBadge";
import { SpendRing } from "./SpendRing";
import { toneOf, shortMoney, type BudgetRowData, type MonthClock } from "./budget";
import { useCategories } from "./useCategories";
import { useFormat } from "./useFormat";

export type BudgetRowProps = {
  b: BudgetRowData;
  /** Pestaña Compartidos: muestra «Compartido» y la etiqueta de solo lectura de uno congelado. */
  shared?: boolean;
  /** La moneda de la persona (`user.currency`): una distinta lleva la etiqueta «independiente». */
  userCurrency: string;
  /** `monthClock(período)`: la marca de ritmo de los anillos. */
  clock: MonthClock;
  /** La última de su tarjeta: sin línea abajo. */
  last?: boolean;
  /** A dónde lleva; por defecto `/app/presupuestos/<id>`. */
  href?: string;
};

export function BudgetRow({ b, shared, userCurrency, clock, last, href }: BudgetRowProps) {
  const t = useT();
  const f = useFormat();
  const { getCategory } = useCategories();
  const cat = getCategory(b.category);
  const { tone, share } = toneOf(b);
  const limitless = tone === "limitless";
  const isOver = tone === "over";
  const isNear = tone === "near";
  const frozen = shared && !!b.frozen;
  const cur = b.currency ?? userCurrency;
  const offCurrency = cur !== userCurrency;
  const name = b.name || cat.label;
  const left = limitless ? 0 : (b.monthly as number) - b.spent;

  const a11yLabel = limitless
    ? t("budgets:rowA11yNoLimit", { name, spent: f.money(b.spent, cur) })
    : t(isOver ? "budgets:rowA11yOver" : "budgets:rowA11y", {
        name,
        spent: f.money(b.spent, cur),
        total: f.money(b.monthly as number, cur),
        percent: Math.round(share * 100),
      });

  return (
    <Link
      href={href ?? `/app/presupuestos/${b.id}`}
      aria-label={a11yLabel}
      className={`flex min-h-[64px] items-center gap-3 px-3.5 py-3 hover:bg-sand/40 ${last ? "" : "border-b border-rule"}`}
    >
      {/* El estado vive en el anillo alrededor del ícono. */}
      <SpendRing share={limitless ? 0 : share} pace={limitless ? null : clock.pace} size={48} stroke={4} fill={cat.color} decorative>
        <CategoryIcon category={b.category} size={36} imageUrl={b.imageUrl} tint="transparent" />
      </SpendRing>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="max-w-full truncate text-body-bold font-bold text-ink">{name}</span>
          {shared ? <SharedBadge /> : null}
          {frozen ? (
            <Tag className="bg-sand text-ink-soft">
              <Icon name="lock-outline" size={11} />
              {t("budgets:readOnly")}
            </Tag>
          ) : null}
          {offCurrency ? <Tag className="bg-peach text-mandarina-deep">{t("budgets:otherCurrencyTag", { currency: cur })}</Tag> : null}
        </span>
        <span className="mt-px block truncate text-small text-ink-soft">
          {limitless
            ? t("budgets:list.spentThisMonth", { spent: shortMoney(b.spent, cur, f.lang) })
            : t("budgets:list.ofCap", { total: shortMoney(b.monthly as number, cur, f.lang) })}
        </span>
      </span>
      <span className="flex flex-col items-end">
        {limitless ? (
          <Icon name="infinity" size={20} className="text-ink-mute" />
        ) : (
          <>
            <Money
              value={Math.abs(left)}
              currency={cur}
              prefix={isOver ? "+" : undefined}
              compact={Math.abs(left) >= 10_000}
              whole
              className={`text-[17px] font-extrabold ${isOver ? "text-red" : isNear ? "text-mandarina-deep" : "text-ink"}`}
            />
            <span className="mt-px text-small text-ink-mute">{t(isOver ? "budgets:list.overBy" : "budgets:list.leftLabel")}</span>
          </>
        )}
      </span>
    </Link>
  );
}

function Tag({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-[3px] rounded-full px-2 py-0.5 text-[10px] font-extrabold leading-4 tracking-[0.3px] ${className}`}>
      {children}
    </span>
  );
}

/** La tarjeta de vidrio donde va un grupo de filas. `border` tiñe el borde (rojo, amarillo, verde de los grupos). */
export function BudgetRowsCard({ border, children, className }: { border?: string | null; children: ReactNode; className?: string }) {
  const style: CSSProperties | undefined = border ? { borderColor: border, borderWidth: 1.5 } : undefined;
  return (
    <div className={`glass overflow-hidden rounded-[20px] ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
