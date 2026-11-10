"use client";

import { useMemo, useState } from "react";
import { calcularAguinaldo, diasTrabajadosEnAnio } from "@/lib/aguinaldo";
import { pesos, campoCls, etiquetaCls, ayudaCls, limpiarNumero } from "@/lib/format";

const ANIO = 2026;

export function AguinaldoCalculator() {
  const [salario, setSalario] = useState("15000");
  const [dias, setDias] = useState("15");
  const [completo, setCompleto] = useState(true);
  const [ingreso, setIngreso] = useState("");

  const diasTrabajados = useMemo(() => {
    if (completo) return 365;
    if (!ingreso) return 365;
    const d = new Date(`${ingreso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return 365;
    return diasTrabajadosEnAnio({ anio: ANIO, fechaIngreso: d });
  }, [completo, ingreso]);

  const resultado = useMemo(
    () =>
      calcularAguinaldo({
        salarioMensual: parseFloat(salario),
        dias: parseFloat(dias),
        diasTrabajados,
      }),
    [salario, dias, diasTrabajados],
  );

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="ag-salario" className={etiquetaCls}>
            Tu sueldo mensual
          </label>
          <div className="relative">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
              $
            </span>
            <input
              id="ag-salario"
              inputMode="decimal"
              autoComplete="off"
              value={salario}
              onChange={(e) => setSalario(limpiarNumero(e.target.value))}
              className={`${campoCls} pl-8`}
              placeholder="15000"
            />
          </div>
          <p className={ayudaCls}>Tu salario base, sin bonos ni horas extra.</p>
        </div>

        <div>
          <label htmlFor="ag-dias" className={etiquetaCls}>
            Días de aguinaldo
          </label>
          <input
            id="ag-dias"
            inputMode="numeric"
            autoComplete="off"
            value={dias}
            onChange={(e) => setDias(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
            className={campoCls}
            placeholder="15"
          />
          <p className={ayudaCls}>La ley marca 15 como mínimo. Algunas empresas dan 30.</p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={etiquetaCls}>¿Trabajaste el año completo?</legend>
        <div className="flex flex-wrap gap-2">
          {[
            { v: true, t: "Sí, todo el año" },
            { v: false, t: "No, entré después" },
          ].map((o) => {
            const activo = o.v === completo;
            return (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => setCompleto(o.v)}
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
        {!completo && (
          <div className="mt-4 max-w-[280px]">
            <label htmlFor="ag-ingreso" className={etiquetaCls}>
              Fecha de ingreso en {ANIO}
            </label>
            <input
              id="ag-ingreso"
              type="date"
              min={`${ANIO}-01-01`}
              max={`${ANIO}-12-31`}
              value={ingreso}
              onChange={(e) => setIngreso(e.target.value)}
              className={campoCls}
            />
          </div>
        )}
      </fieldset>

      <div className="mt-7">
        {!resultado ? (
          <p className="text-[14px] text-ink-soft text-center py-6">Escribe tu sueldo para ver tu aguinaldo.</p>
        ) : (
          <>
            <div aria-live="polite" aria-atomic="true" className="bg-surface border border-rule rounded-3xl p-6 text-center">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                Tu aguinaldo
              </div>
              <p className="font-display text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-none text-ink">
                {pesos.format(resultado.aguinaldo)}
              </p>
              <p className="text-[14px] text-ink-soft mt-3">
                {pesos.format(resultado.salarioDiario)}/día × {resultado.dias} días
                {!resultado.anioCompleto && (
                  <>
                    {" "}
                    × {resultado.diasTrabajados} de 365 días trabajados
                  </>
                )}
              </p>
            </div>
            <p className={`${ayudaCls} text-center`}>
              Es tu aguinaldo <strong>bruto</strong>. Los primeros 30 días de UMA están exentos de ISR (art. 93-XIV
              LISR); lo que exceda tu empresa lo retiene.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
