"use client";

// Los formateadores de format.ts atados al idioma activo.
//
//   const f = useFormat();
//   f.money(1234, "MXN")            // "$1,234.00 MXN"
//   f.date(iso, "relative")         // "Hoy"
//   f.installment(3, 12, "monthly") // "3/12 mensual"

import { useMemo } from "react";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { formatDate, formatMoney, formatMoneyParts, installmentLabel, type DateStyle, type MoneyOpts } from "./format";

export function useFormat() {
  const { lang } = useLang();
  const t = useT();
  return useMemo(
    () => ({
      lang,
      money: (n: number, currency: string, opts?: MoneyOpts) => formatMoney(n, currency, lang, opts),
      moneyParts: (n: number, currency: string, opts?: MoneyOpts) => formatMoneyParts(n, currency, lang, opts),
      date: (iso: string, style: DateStyle = "short") => formatDate(iso, style, lang, t),
      installment: (current: number, total: number, frequency: "weekly" | "monthly") =>
        installmentLabel(current, total, frequency, t),
    }),
    [lang, t],
  );
}
