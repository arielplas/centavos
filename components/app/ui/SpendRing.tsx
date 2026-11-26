// <SpendRing>: el mes de un presupuesto como un anillo. El arco es lo gastado, el
// centro lo que queda, y una marca corta en la pista señala dónde iría el gasto
// hoy si se repartiera parejo en el mes (`pace`, de `monthPace`/`monthClock`). Un
// arco que pasa la marca: el dinero va más rápido que el mes.
//
// Color: el semáforo de `ringColor` (verde < 80 %, amarillo ≥ 80 %, rojo ≥ 100 %).
//
//   <SpendRing share={b.spent / b.monthly} pace={clock.pace} size={48} stroke={4} fill={cat.color} decorative>
//     <CategoryIcon … />
//   </SpendRing>
//   <SpendRing share={0.62} pace={0.4} label="…">  {/* 168 / 14 de la hoja de detalle */}

import type { CSSProperties, ReactNode } from "react";
import { ringColor, ringGeometry } from "./ring";

export type SpendRingProps = {
  /** Gastado ÷ presupuesto. Arriba de 1 dibuja el anillo lleno, en rojo. */
  share: number;
  /** `monthPace()`; `null` esconde la marca. */
  pace: number | null;
  size?: number;
  stroke?: number;
  /** Relleno dentro de la pista (el tinte de la categoría detrás de un ícono chico). */
  fill?: string;
  /** Lo que va en el centro (disponible, % usado, el ícono). */
  children?: ReactNode;
  /** Nombre accesible del anillo suelto. */
  label?: string;
  /** Dentro de una fila que ya se anuncia: sin nodo de accesibilidad propio. */
  decorative?: boolean;
  className?: string;
};

export function SpendRing({
  share,
  pace,
  size = 168,
  stroke = 14,
  fill = "none",
  children,
  label,
  decorative,
  className,
}: SpendRingProps) {
  const g = ringGeometry(size, stroke, share, pace);
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": label };
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
      {...a11y}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} focusable="false" className="absolute inset-0" aria-hidden="true">
        <circle cx={g.c} cy={g.c} r={g.r} fill={fill} stroke="var(--color-rule)" strokeWidth={stroke} />
        {g.dash ? (
          <circle
            data-testid="spend-ring-arc"
            cx={g.c}
            cy={g.c}
            r={g.r}
            fill="none"
            stroke={ringColor(share)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={g.dash}
            transform={`rotate(-90 ${g.c} ${g.c})`}
          />
        ) : null}
        {g.paceDegrees !== null ? (
          <line
            data-testid="spend-ring-pace"
            x1={g.c}
            y1={Math.max(0.5, stroke / 2 - 6)}
            x2={g.c}
            y2={stroke / 2 + 8}
            stroke="var(--color-ink)"
            strokeWidth={size < 80 ? 2 : 2.5}
            strokeLinecap="round"
            transform={`rotate(${g.paceDegrees} ${g.c} ${g.c})`}
          />
        ) : null}
      </svg>
      <span className="pointer-events-none relative flex items-center justify-center px-[18px]">{children}</span>
    </span>
  );
}

/** Un resplandor redondo del color de la categoría que se desvanece, detrás del ícono de una tarjeta de vidrio. */
export function SoftHalo({ color, size = 260, className, style }: { color: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(closest-side, color-mix(in srgb, ${color} 75%, transparent), color-mix(in srgb, ${color} 30%, transparent) 55%, transparent)`,
        ...style,
      }}
    />
  );
}

/** Una línea de la leyenda junto al anillo: punto o raya, etiqueta y valor. */
export function RingLegend({ swatch, dash, label, children }: { swatch?: string; dash?: boolean; label: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-small text-ink-soft">
        {dash ? (
          <span aria-hidden="true" className="inline-block w-2.5 border-t-[2.5px] border-ink" />
        ) : (
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: swatch ?? "var(--color-rule)" }} />
        )}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
