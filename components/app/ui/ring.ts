// Las cuentas detrás de SpendRing y ProgressBar (copia de centavos-app,
// components/ui/SpendRing.tsx y ProgressBar.tsx). Sin React: se prueban solas.

/**
 * El semáforo de presupuestos: verde debajo de 80 %, amarillo desde 80 %, rojo
 * desde 100 %. Lo usan todos los anillos, las barras, el resumen de Presupuestos
 * y la leyenda del detalle, para que todos lean el mismo estado.
 * Devuelve una variable CSS de `@cntvos/tokens` (`#5fa57a`, `#f5b833`, `#d94a3a`).
 */
export function ringColor(share: number): string {
  if (share >= 1) return "var(--color-red)";
  if (share >= 0.8) return "var(--color-yellow)";
  return "var(--color-green)";
}

/**
 * Qué parte del mes ya pasó, de 0 a 1. `null` si el mes no es el actual: un mes
 * pasado ya terminó y una marca de ritmo ahí no diría nada.
 */
export function monthPace(month: number, year: number, now: Date = new Date()): number | null {
  if (now.getFullYear() !== year || now.getMonth() + 1 !== month) return null;
  const days = new Date(year, month, 0).getDate();
  return now.getDate() / days;
}

export type PaceState = "ahead" | "onTrack" | "under";

/** Gasto contra la parte del mes que pasó, con una banda muerta de 5 puntos. */
export function paceState(spentShare: number, pace: number): PaceState {
  const diff = spentShare - pace;
  if (diff > 0.05) return "ahead";
  if (diff < -0.05) return "under";
  return "onTrack";
}

export type RingGeometry = {
  /** Radio de la pista (el trazo cae centrado en él). */
  r: number;
  /** Centro. */
  c: number;
  circumference: number;
  /** Parte dibujada, de 0 a 1 (arriba de 1 es un anillo lleno). */
  shown: number;
  /** `stroke-dasharray` del arco, o `null` si no hay nada que dibujar. */
  dash: string | null;
  /** Grados de la marca de ritmo, o `null` si no hay marca. */
  paceDegrees: number | null;
};

export function ringGeometry(size: number, stroke: number, share: number, pace: number | null): RingGeometry {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const shown = Math.max(0, Math.min(Number.isFinite(share) ? share : 0, 1));
  return {
    r,
    c: size / 2,
    circumference,
    shown,
    dash: shown > 0 ? `${(circumference * shown).toFixed(2)} ${circumference.toFixed(2)}` : null,
    paceDegrees: pace === null ? null : Number((pace * 360).toFixed(1)),
  };
}

/** Lo que una barra de progreso dibuja: el relleno (tope 100 %) y lo que se pasó. */
export function progressParts(value: number, max: number): { pct: number; fill: number; overflow: number } {
  const pct = max > 0 ? value / max : 0;
  return { pct, fill: Math.min(pct, 1), overflow: pct > 1 ? Math.min(pct - 1, 1) : 0 };
}
