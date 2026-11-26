// <Card> y <PageColumn>: las dos superficies de las pantallas de datos.
//
//   <Card>                         vidrio (lo de siempre: tarjetas sobre el fondo pastel)
//   <Card variant="ink" radius={24}>   la tarjeta tinta (`heroBg`) del Pulso y de Suscripciones
//   <Card variant="peach|sand|sky">    mosaicos de color
//
// <PageColumn> es la columna centrada de 720 px donde van Gastos, Presupuestos,
// Suscripciones y el detalle (§4.4). Cada pantalla pone su propio `<main id="contenido">`
// (el AppShell no envuelve en otro), y ese `<main>` puede ser el <PageColumn as="main">.

import type { CSSProperties, ElementType, ReactNode } from "react";

export type CardVariant = "glass" | "ink" | "peach" | "sand" | "sky";

const VARIANT: Record<CardVariant, string> = {
  glass: "glass",
  ink: "bg-hero-bg text-on-hero",
  peach: "bg-peach text-ink",
  sand: "bg-sand text-ink",
  sky: "bg-sky text-ink",
};

export type CardProps = {
  variant?: CardVariant;
  /** Radio en px (24 en las tarjetas tinta, 20 en las de vidrio). */
  radius?: number;
  /** Relleno en px; por defecto 20. */
  padding?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function Card({ variant = "glass", radius = 20, padding = 20, as: Tag = "div", className, style, children }: CardProps) {
  return (
    <Tag className={`${VARIANT[variant]} ${className ?? ""}`} style={{ borderRadius: radius, padding, ...style }}>
      {children}
    </Tag>
  );
}

export function PageColumn({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
  "aria-busy"?: boolean;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[720px] px-4 ${className ?? ""}`} {...rest}>
      {children}
    </Tag>
  );
}
