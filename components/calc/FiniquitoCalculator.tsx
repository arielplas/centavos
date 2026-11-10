"use client";

import { useMemo, useState } from "react";
import { calcularFiniquito, type TipoTerminacion } from "@/lib/finiquito";
import { pesos, campoCls, etiquetaCls, ayudaCls, limpiarNumero } from "@/lib/format";

const TIPOS: { v: TipoTerminacion; t: string }[] = [
  { v: "renuncia", t: "Renuncia" },
  { v: "despido_justificado", t: "Despido justificado" },
  { v: "despido_injustificado", t: "Despido injustificado" },
];

export function FiniquitoCalculator() {
  const [tipo, setTipo] = useState<TipoTerminacion>("despido_injustificado");
  const [salario, setSalario] = useState("15000");
  const [ingreso, setIngreso] = useState("");
  const [salida, setSalida] = useState("");
  const [diasVac, setDiasVac] = useState("");

  const resultado = useMemo(() => {
    if (!ingreso || !salida) return null;
    const fi = new Date(`${ingreso}T00:00:00`);
    const fs = new Date(`${salida}T00:00:00`);
    if (Number.isNaN(fi.getTime()) || Number.isNaN(fs.getTime())) return null;
    return calcularFiniquito({
      tipo,
      salarioMensual: parseFloat(salario),
      fechaIngreso: fi,
      fechaSalida: fs,
      diasVacacionesPendientes: diasVac === "" ? 0 : parseInt(diasVac, 10),
    });
  }, [tipo, salario, ingreso, salida, diasVac]);

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      <fieldset className="mb-5">
        <legend className={etiquetaCls}>¿Cómo terminó la relación laboral?</legend>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((o) => {
            const activo = o.v === tipo;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => setTipo(o.v)}
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
        <div>
          <label htmlFor="fi-salario" className={etiquetaCls}>
            Tu sueldo mensual
          </label>
          <div className="relative">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
              $
            </span>
            <input
              id="fi-salario"
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
          <label htmlFor="fi-vac" className={etiquetaCls}>
            Días de vacaciones pendientes
          </label>
          <input
            id="fi-vac"
            inputMode="numeric"
            autoComplete="off"
            value={diasVac}
            onChange={(e) => setDiasVac(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
            className={campoCls}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="fi-ingreso" className={etiquetaCls}>
            Fecha de ingreso
          </label>
          <input id="fi-ingreso" type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} className={campoCls} />
        </div>
        <div>
          <label htmlFor="fi-salida" className={etiquetaCls}>
            Fecha de salida
          </label>
          <input id="fi-salida" type="date" value={salida} onChange={(e) => setSalida(e.target.value)} className={campoCls} />
        </div>
      </div>

      <div className="mt-7">
        {!resultado ? (
          <p className="text-[14px] text-ink-soft text-center py-6">Captura las fechas de ingreso y salida para ver el desglose.</p>
        ) : (
          <div aria-live="polite" aria-atomic="true">
            <div className="bg-surface border border-rule rounded-3xl overflow-hidden">
              <ul className="divide-y divide-rule">
                {resultado.finiquito.map((l) => (
                  <li key={l.concepto} className="flex items-baseline justify-between gap-4 px-5 py-3">
                    <span className="text-[14px] text-ink">
                      {l.concepto} <span className="text-[12px] text-ink-soft">· {l.articulo}</span>
                    </span>
                    <span className="text-[14px] font-bold text-ink tabular-nums">{pesos.format(l.monto)}</span>
                  </li>
                ))}
                {resultado.indemnizacion.map((l) => (
                  <li key={l.concepto} className="flex items-baseline justify-between gap-4 px-5 py-3 bg-peach/40">
                    <span className="text-[14px] text-ink">
                      {l.concepto} <span className="text-[12px] text-ink-soft">· {l.articulo}</span>
                    </span>
                    <span className="text-[14px] font-bold text-ink tabular-nums">{pesos.format(l.monto)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between gap-4 px-5 py-4 bg-ink text-bg">
                <span className="text-[13px] font-bold uppercase tracking-wider">Total</span>
                <span className="font-display text-2xl font-extrabold tabular-nums">{pesos.format(resultado.total)}</span>
              </div>
            </div>

            {resultado.topeAntiguedadNoDisponible && (
              <p className={ayudaCls}>
                La prima de antigüedad se muestra <strong>sin</strong> el tope de 2× salario mínimo (art. 486 LFT). Si
                tu salario diario es alto, tu prima real podría ser menor.
              </p>
            )}
            <p className={ayudaCls}>
              Cálculo informativo con el salario diario simple. El monto real puede variar por prestaciones superiores y
              por el salario diario integrado. Consulta a PROFEDET, que es gratuito.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
