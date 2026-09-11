"use client";

import { useMemo, useState } from "react";
import { calcularVacaciones } from "@/lib/vacaciones";
import { pesos, campoCls, etiquetaCls, ayudaCls, limpiarNumero } from "@/lib/format";

export function VacacionesCalculator() {
  const [salario, setSalario] = useState("15000");
  const [anios, setAnios] = useState("3");
  const [prima, setPrima] = useState("25");

  const resultado = useMemo(() => {
    const p = parseFloat(prima);
    return calcularVacaciones({
      salarioMensual: parseFloat(salario),
      anios: parseInt(anios, 10),
      primaPct: Number.isFinite(p) ? p / 100 : 0.25,
    });
  }, [salario, anios, prima]);

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label htmlFor="va-salario" className={etiquetaCls}>
            Tu sueldo mensual
          </label>
          <div className="relative">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
              $
            </span>
            <input
              id="va-salario"
              inputMode="decimal"
              autoComplete="off"
              value={salario}
              onChange={(e) => setSalario(limpiarNumero(e.target.value))}
              className={`${campoCls} pl-8`}
              placeholder="15000"
            />
          </div>
        </div>
        <div>
          <label htmlFor="va-anios" className={etiquetaCls}>
            Años de antigüedad
          </label>
          <input
            id="va-anios"
            inputMode="numeric"
            autoComplete="off"
            value={anios}
            onChange={(e) => setAnios(e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
            className={campoCls}
            placeholder="3"
          />
          <p className={ayudaCls}>Años cumplidos en la empresa.</p>
        </div>
        <div>
          <label htmlFor="va-prima" className={etiquetaCls}>
            Prima vacacional (%)
          </label>
          <input
            id="va-prima"
            inputMode="numeric"
            autoComplete="off"
            value={prima}
            onChange={(e) => setPrima(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
            className={campoCls}
            placeholder="25"
          />
          <p className={ayudaCls}>25% es el mínimo de ley.</p>
        </div>
      </div>

      <div className="mt-7">
        {!resultado ? (
          <p className="text-[14px] text-ink-soft text-center py-6">Escribe tu sueldo y antigüedad para ver el cálculo.</p>
        ) : (
          <div aria-live="polite" aria-atomic="true" className="grid sm:grid-cols-2 gap-3">
            <div className="bg-surface border border-rule rounded-3xl p-6 text-center">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                Te tocan
              </div>
              <p className="font-display text-5xl font-extrabold tracking-[-0.03em] leading-none text-ink">
                {resultado.dias}
              </p>
              <p className="text-[14px] text-ink-soft mt-2">días de vacaciones al año</p>
            </div>
            <div className="bg-surface border border-rule rounded-3xl p-6 text-center">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                Prima vacacional
              </div>
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em] leading-none text-ink">
                {pesos.format(resultado.primaVacacional)}
              </p>
              <p className="text-[14px] text-ink-soft mt-2">
                {pesos.format(resultado.salarioDiario)}/día × {resultado.dias} días × prima
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
