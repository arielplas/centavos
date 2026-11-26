"use client";

// Placeholder de /app/presupuestos/[id]. La pantalla real reemplaza este archivo
// (docs/app-web.md, §14).

import { useParams } from "next/navigation";

export function PresupuestoDetalleScreen() {
  // El id llega de la URL; ningún id se prerenderiza (§4.2).
  const { id } = useParams<{ id: string }>();
  return (
    <main id="contenido" className="mx-auto max-w-[720px] px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">Presupuesto</h1>
      <p className="mt-2 text-ink-soft">Pendiente: detalle del presupuesto {id}.</p>
    </main>
  );
}
