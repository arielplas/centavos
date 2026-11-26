"use client";

// Un gasto del mes de un presupuesto (la fila de `DetallePresupuesto.tsx`): ícono
// de la categoría, nota (o categoría), «Categoría · fecha», chip de pagos a
// meses, fotos, y el monto con «−». En un presupuesto compartido, debajo del
// monto, lo que le toca a la persona (`yourShare`). Todo en la moneda del
// presupuesto. La fila no abre detalle en la v1.

import type { Expense } from "@/lib/app/api";
import { useT } from "@/components/app/LanguageProvider";
import { Chip, CategoryIcon, Icon, Money, useCategories, useFormat } from "@/components/app/ui";

export function ExpenseRow({ expense: e, currency, last }: { expense: Expense; currency: string; last?: boolean }) {
  const t = useT();
  const f = useFormat();
  const { getCategory } = useCategories();
  const cat = getCategory(e.category);
  const chip = e.hasInstallments && e.currentInstallment && e.totalInstallments && e.installmentFrequency;
  return (
    <li className={`flex min-h-[60px] items-center gap-3 px-1 py-3 ${last ? "" : "border-b border-rule"}`}>
      <CategoryIcon category={e.category} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-bold font-bold text-ink">{e.note ?? cat.label}</p>
        <div className="mt-px flex flex-wrap items-center gap-x-1.5 gap-y-1 text-small text-ink-soft">
          <span className="truncate">
            {cat.label} · {f.date(e.date, "short")}
          </span>
          {chip ? (
            <Chip
              label={f.installment(e.currentInstallment as number, e.totalInstallments as number, e.installmentFrequency as "weekly" | "monthly")}
              bg="var(--color-sky)"
              fg="var(--color-ink)"
            />
          ) : null}
          {e.imageCount && e.imageCount > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-[3px]" role="img" aria-label={t("expenses:photoCount", { count: e.imageCount })}>
              <Icon name="image-outline" size={14} />
              {e.imageCount > 1 ? <span aria-hidden="true">{e.imageCount}</span> : null}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <Money value={e.amount} currency={currency} prefix="−" className="text-body-bold font-bold text-ink" />
        {e.yourShare != null ? (
          <span className="mt-px text-small text-ink-soft">
            {t("budgets:detail.yourShare", { amount: f.money(e.yourShare, currency) })}
          </span>
        ) : null}
      </div>
    </li>
  );
}
