"use client";

// <Money>: un monto con su código de moneda a la mitad del tamaño, como el
// `Money` de la app: «$1,234.00 <small>MXN</small>». Hereda peso y color del
// elemento que lo rodea; el tamaño lo pone `className` / `style` (el código es
// `0.5em` de ese tamaño).
//
//   <Money value={1234} currency="MXN" className="text-money" />
//   <Money value={52} currency="MXN" prefix="−" />            // gastos
//   <Money value={5000} currency="MXN" compact />              // «$5k MXN», mosaicos
//   <Money value={520} currency="MXN" whole />                 // «$520 MXN», filas
//
// Las monedas nunca se suman ni se convierten: un monto, su moneda.

import type { CSSProperties } from "react";
import { useFormat } from "./useFormat";
import { wholeAmount } from "./format";

export type MoneyProps = {
  value: number;
  /** Código ISO 4217 (`MXN`). */
  currency: string;
  /** «$1.5k» desde 1,000. */
  compact?: boolean;
  /** Sin la cola «.00», para que «$500» conviva con los compactos. */
  whole?: boolean;
  /** «+» a los positivos. */
  sign?: boolean;
  /** Texto antes del monto, a tamaño completo: «−» en gastos, «+» en lo que se pasó. */
  prefix?: string;
  className?: string;
  style?: CSSProperties;
};

export function Money({ value, currency, compact, whole, sign, prefix, className, style }: MoneyProps) {
  const f = useFormat();
  const parts = f.moneyParts(value, currency, { compact, sign });
  const amount = whole ? wholeAmount(parts.amount) : parts.amount;
  return (
    <span className={className} style={style}>
      {prefix}
      {amount} <span style={{ fontSize: "0.5em", letterSpacing: 0 }}>{parts.currency}</span>
    </span>
  );
}
