// <Chip>: la píldora chica en mayúsculas («3/12 MENSUAL», «CENTAVOS+»). Por
// defecto tinta con texto crema; los pagos a meses van en `sky` con texto tinta.
//
//   <Chip label="3/12 mensual" bg="var(--color-sky)" fg="var(--color-ink)" />

import type { CSSProperties } from "react";

export type ChipProps = {
  label: string;
  /** Fondo (CSS). Por defecto tinta. */
  bg?: string;
  /** Color del texto (CSS). Por defecto crema. */
  fg?: string;
  className?: string;
  style?: CSSProperties;
};

export function Chip({ label, bg = "var(--color-ink)", fg = "var(--color-bg)", className, style }: ChipProps) {
  return (
    <span
      className={`inline-flex self-start whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.3px] ${className ?? ""}`}
      style={{ backgroundColor: bg, color: fg, ...style }}
    >
      {label}
    </span>
  );
}
