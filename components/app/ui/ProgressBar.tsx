// <ProgressBar>: la barra de uso de un presupuesto. Verde debajo de 80 %, amarillo
// desde 80 %, rojo desde 100 % (`ringColor`); la pista es `rule`. Si se pasó, una
// segunda barra más delgada y roja muestra cuánto.
//
//   <ProgressBar value={totalSpent} max={totalBudget} height={10} label={t("home:progressA11y", { percent })} />

import { progressParts, ringColor } from "./ring";

export type ProgressBarProps = {
  value: number;
  max: number;
  /** Alto en px (10 en el Pulso). */
  height?: number;
  /** Dibuja la barra del sobrante cuando `value > max`. */
  showOverflow?: boolean;
  /** Color fijo (CSS) en vez del semáforo. */
  color?: string;
  /** Nombre accesible. Obligatorio: la app lo pone en cada uso («Llevas 70 por ciento…»). */
  label: string;
  className?: string;
};

export function ProgressBar({ value, max, height = 10, showOverflow = true, color, label, className }: ProgressBarProps) {
  const { pct, fill, overflow } = progressParts(value, max);
  const percent = Math.round(pct * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(percent, 100)}
      aria-valuetext={`${percent}%`}
      className={className}
    >
      <div className="overflow-hidden bg-rule" style={{ height, borderRadius: height / 2 }}>
        <div
          style={{ width: `${fill * 100}%`, height: "100%", backgroundColor: color ?? ringColor(pct), borderRadius: height / 2 }}
        />
      </div>
      {showOverflow && overflow > 0 ? (
        <div className="mt-[3px] overflow-hidden bg-red-soft" style={{ height: height / 2, borderRadius: height / 4 }}>
          <div className="bg-red" style={{ width: `${overflow * 100}%`, height: "100%", borderRadius: height / 4 }} />
        </div>
      ) : null}
    </div>
  );
}
