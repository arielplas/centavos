"use client";

// <MonthPicker>: el selector de mes de Presupuestos y del detalle (copia del
// `MonthPicker` de la app): un desplegable con los meses por nombre.
//
// REGLA FIJA (decisión del dueño): una cuenta gratis abre **este mes y los dos
// anteriores** (`FREE_MONTHS = 3`). Los demás se listan con la insignia
// «Centavos+» (lo que Centavos+ compra son los meses mismos, no un misterio) y
// siguen tocables, pero NO cambian la selección ni abren paywall: en la web
// muestran el aviso `app:monthsLocked` («Los meses anteriores son de Centavos+.
// Actívalo desde la app.») debajo del selector y llaman a `onLocked`. Centavos+
// abre todos los que se le pasen (la pantalla lista 12).
//
//   const months = useMemo(() => recentMonths(LISTED_MONTHS, lang), [lang]);
//   const { isPremium } = usePremium();
//   <MonthPicker months={months} selectedKey={key} onSelect={(m) => setKey(m.key)} isPremium={isPremium} />

import { useState } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { Dropdown, type DropdownOption } from "./Dropdown";
import { Notice } from "./states";
import { FREE_MONTHS, isMonthLocked, type MonthOption } from "./months";

export type MonthPickerProps = {
  /** Del más nuevo al más viejo (`recentMonths`). El primero es el mes actual. */
  months: readonly MonthOption[];
  selectedKey: string;
  /** Solo se llama con un mes abierto, nunca con uno bloqueado. */
  onSelect: (month: MonthOption) => void;
  /** `usePremium().isPremium`. */
  isPremium: boolean;
  /** Cuántos de `months` abre una cuenta gratis. */
  freeMonths?: number;
  /** Se tocó un mes bloqueado. La web no abre paywall; esto es por si la pantalla quiere medirlo. */
  onLocked?: (month: MonthOption) => void;
  className?: string;
};

function PlusBadge() {
  return <span className="rounded-lg bg-peach px-1.5 py-0.5 text-[11px] font-bold text-mandarina-deep">Centavos+</span>;
}

export function MonthPicker({ months, selectedKey, onSelect, isPremium, freeMonths = FREE_MONTHS, onLocked, className }: MonthPickerProps) {
  const t = useT();
  const thisYear = new Date().getFullYear();
  const [lockedNotice, setLockedNotice] = useState(false);

  const options: DropdownOption[] = months.map((m, i) => ({
    key: m.key,
    label: m.label,
    // El año solo gana una línea cuando no es el obvio.
    sublabel: m.year !== thisYear ? String(m.year) : undefined,
    badge: isMonthLocked(i, isPremium, months.length, freeMonths) ? <PlusBadge /> : undefined,
  }));

  return (
    <div className={className}>
      <Dropdown
        label={t("common:months.sheetTitle")}
        options={options}
        selectedKey={selectedKey}
        onSelect={(key) => {
          const i = months.findIndex((m) => m.key === key);
          if (i === -1) return;
          if (isMonthLocked(i, isPremium, months.length, freeMonths)) {
            setLockedNotice(true);
            onLocked?.(months[i]);
            return;
          }
          setLockedNotice(false);
          onSelect(months[i]);
        }}
      />
      {lockedNotice ? (
        <Notice role="status" icon="lock" className="mt-2">
          {t("app:monthsLocked")}
        </Notice>
      ) : null}
    </div>
  );
}
