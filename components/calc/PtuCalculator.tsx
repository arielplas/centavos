"use client";

import { useMemo, useState } from "react";
import { calcularPtu } from "@/lib/ptu";
import { pesos, campoCls, etiquetaCls, ayudaCls, limpiarNumero } from "@/lib/format";

type Modo = "tope" | "completo";

export function PtuCalculator() {
  const [modo, setModo] = useState<Modo>("tope");
  const [salario, setSalario] = useState("12000");

  // Modo completo (datos de la plantilla, del aviso que publica la empresa).
  const [utilidad, setUtilidad] = useState("");
  const [totalDias, setTotalDias] = useState("");
  const [misDias, setMisDias] = useState("");
  const [totalSalarios, setTotalSalarios] = useState("");
  const [misSalarios, setMisSalarios] = useState("");

  const resultado = useMemo(() => {
    const salarioMensual = parseFloat(salario);
    if (modo === "tope") return calcularPtu({ modo: "tope", salarioMensual });
    return calcularPtu({
      modo: "completo",
      salarioMensual,
      utilidadRepartible: parseFloat(utilidad),
      totalDias: parseFloat(totalDias),
      misDias: parseFloat(misDias),
      totalSalarios: parseFloat(totalSalarios),
      misSalarios: parseFloat(misSalarios),
    });
  }, [modo, salario, utilidad, totalDias, misDias, totalSalarios, misSalarios]);

  const money = (id: string, label: string, val: string, set: (v: string) => void, ph = "") => (
    <div>
      <label htmlFor={id} className={etiquetaCls}>
        {label}
      </label>
      <div className="relative">
        <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
          $
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={val}
          onChange={(e) => set(limpiarNumero(e.target.value))}
          className={`${campoCls} pl-8`}
          placeholder={ph}
        />
      </div>
    </div>
  );

  const num = (id: string, label: string, val: string, set: (v: string) => void, ph = "") => (
    <div>
      <label htmlFor={id} className={etiquetaCls}>
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={val}
        onChange={(e) => set(e.target.value.replace(/[^\d]/g, ""))}
        className={campoCls}
        placeholder={ph}
      />
    </div>
  );

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      <fieldset className="mb-5">
        <legend className={etiquetaCls}>¿Tienes los datos del reparto?</legend>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "tope" as Modo, t: "No, estima el máximo" },
            { v: "completo" as Modo, t: "Sí, tengo el aviso" },
          ].map((o) => {
            const activo = o.v === modo;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => setModo(o.v)}
                aria-pressed={activo}
                className={`rounded-full px-4 py-2.5 text-[14px] font-bold border transition-colors ${
                  activo ? "bg-ink text-bg border-ink" : "bg-surface text-ink border-rule-strong hover:border-ink"
                }`}
              >
                {o.t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        {money("ptu-salario", "Tu sueldo mensual", salario, setSalario, "12000")}
        {modo === "completo" && money("ptu-utilidad", "Monto total a repartir", utilidad, setUtilidad, "")}
      </div>

      {modo === "completo" && (
        <>
          <p className={`${ayudaCls} mt-4`}>
            Estos cuatro datos vienen en el aviso de reparto que la empresa está obligada a publicar:
          </p>
          <div className="grid gap-5 md:grid-cols-2 mt-2">
            {num("ptu-totaldias", "Días trabajados por toda la plantilla", totalDias, setTotalDias)}
            {num("ptu-misdias", "Mis días trabajados en el año", misDias, setMisDias)}
            {money("ptu-totalsal", "Suma de salarios de la plantilla", totalSalarios, setTotalSalarios)}
            {money("ptu-missal", "Mis salarios devengados en el año", misSalarios, setMisSalarios)}
          </div>
        </>
      )}

      <div className="mt-7">
        {!resultado ? (
          <p className="text-[14px] text-ink-soft text-center py-6">Completa los datos para ver tu estimación.</p>
        ) : (
          <>
            <div aria-live="polite" aria-atomic="true" className="bg-surface border border-rule rounded-3xl p-6 text-center">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                {resultado.modo === "tope" ? "Máximo que podrías recibir" : "Tu PTU estimada"}
              </div>
              <p className="font-display text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-none text-ink">
                {pesos.format(resultado.final)}
              </p>
              {resultado.modo === "completo" && resultado.bruta !== null && (
                <p className="text-[14px] text-ink-soft mt-3">
                  Por días {pesos.format(resultado.porDias ?? 0)} + por salarios{" "}
                  {pesos.format(resultado.porSalarios ?? 0)}
                  {resultado.topeAplico && " · limitado por el tope de 3 meses"}
                </p>
              )}
            </div>
            {resultado.modo === "tope" && (
              <p className={`${ayudaCls} text-center`}>
                Es el tope de 3 meses de sueldo (art. 127-VIII LFT): el máximo que la ley permite, no una promesa. Tu
                reparto real depende de la utilidad de la empresa y de los datos del aviso.
              </p>
            )}
            <p className={`${ayudaCls} text-center`}>
              Es tu PTU <strong>bruta</strong>. Los primeros 15 días de UMA están exentos de ISR (art. 93-XIV LISR).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
