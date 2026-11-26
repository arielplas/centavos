// <PulseDot>: el punto del estado del mes (verde, amarillo, rojo) con los colores
// del semáforo. Decorativo: la línea de estado al lado dice lo mismo con texto.

import type { PulseStatus } from "@/lib/app/api";

const COLOR: Record<PulseStatus, string> = {
  green: "var(--color-green)",
  yellow: "var(--color-yellow)",
  red: "var(--color-red)",
};

export function PulseDot({ status, size = 10 }: { status: PulseStatus; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: COLOR[status] }}
    />
  );
}
