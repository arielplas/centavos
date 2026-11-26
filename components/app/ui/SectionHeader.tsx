// <SectionHeader>: el «kicker» (caption en mandarina-deep) y el título h2 de una
// sección, como el `SectionHeader` de la app. `level` es el nivel de encabezado
// que le toca en la página (2 por defecto; el h1 es el de la pantalla).

import type { ReactNode } from "react";

export type SectionHeaderProps = {
  kicker?: ReactNode;
  title: ReactNode;
  level?: 2 | 3;
  /** Algo a la derecha de la línea del título (un «Ver todos»). */
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ kicker, title, level = 2, action, className }: SectionHeaderProps) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={`flex items-end justify-between gap-3 ${className ?? ""}`}>
      <div className="min-w-0">
        {kicker ? <p className="mb-1 text-caption font-bold text-mandarina-deep">{kicker}</p> : null}
        <Heading className="font-display text-h2 font-extrabold text-ink">{title}</Heading>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
