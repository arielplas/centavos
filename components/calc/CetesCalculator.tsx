"use client";

import { useMemo, useState } from "react";
import { calcularCetes, PLAZOS_CETES } from "@/lib/cetes";
import { pesos, pct, campoCls, etiquetaCls, ayudaCls, limpiarNumero } from "@/lib/format";

export function CetesCalculator() {
  const [inversion, setInversion] = useState("10000");
  const [tasa, setTasa] = useState("10");
  const [plazo, setPlazo] = useState<number>(28);
  const [reinvertir, setReinvertir] = useState(false);

  const resultado = useMemo(() => {
    const t = parseFloat(tasa);
    return calcularCetes({
      inversion: parseFloat(inversion),
      tasaAnual: Number.isFinite(t) ? t / 100 : NaN,
      plazo,
      reinvertir,
    });
  }, [inversion, tasa, plazo, reinvertir]);

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="ce-inv" className={etiquetaCls}>
            ¿Cuánto quieres invertir?
          </label>
          <div className="relative">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
              $
            </span>
            <input
              id="ce-inv"
              inputMode="decimal"
              autoComplete="off"
              value={inversion}
              onChange={(e) => setInversion(limpiarNumero(e.target.value))}
              className={`${campoCls} pl-8`}
              placeholder="10000"
            />
          </div>
          <p className={ayudaCls}>Desde $100 en Cetesdirecto.</p>
        </div>
        <div>
          <label htmlFor="ce-tasa" className={etiquetaCls}>
            Tasa anual (%)
          </label>
          <input
            id="ce-tasa"
            inputMode="decimal"
            autoComplete="off"
            value={tasa}
            onChange={(e) => setTasa(limpiarNumero(e.target.value))}
            className={campoCls}
            placeholder="10"
          />
          <p className={ayudaCls}>La tasa de la última subasta, en banxico.org.mx.</p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={etiquetaCls}>Plazo</legend>
        <div className="flex flex-wrap gap-2">
          {PLAZOS_CETES.map((n) => {
            const activo = n === plazo;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPlazo(n)}
                aria-pressed={activo}
                className={`min-w-[76px] rounded-full px-4 py-2.5 text-[14px] font-bold border transition-colors ${
                  activo ? "bg-ink text-bg border-ink" : "bg-surface text-ink border-rule-strong hover:border-ink"
                }`}
              >
                {n} días
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-4 flex items-center gap-2.5 text-[14px] font-semibold text-ink cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={reinvertir}
          onChange={(e) => setReinvertir(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-ink)]"
        />
        Reinvertir hasta completar un año
      </label>

      <div className="mt-7">
        {!resultado ? (
          <p className="text-[14px] text-ink-soft text-center py-6">Escribe el monto y la tasa para ver tu rendimiento.</p>
        ) : (
          <>
            <div aria-live="polite" aria-atomic="true" className="bg-surface border border-rule rounded-3xl p-6 text-center">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                {reinvertir ? "Al final del año recibes" : "Al vencimiento recibes"}
              </div>
              <p className="font-display text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-none text-ink">
                {pesos.format(reinvertir && resultado.capitalFinalAnio !== null ? resultado.capitalFinalAnio : resultado.montoVencimiento)}
              </p>
              <p className="text-[14px] text-ink-soft mt-3">
                Ganancia {pesos.format(reinvertir && resultado.capitalFinalAnio !== null ? resultado.capitalFinalAnio - resultado.montoInvertido : resultado.gananciaBruta)}
                {" · "}
                {pct(resultado.rendimientoPeriodo)} en el periodo · {pct(resultado.rendimientoAnualEfectivo)} anual efectivo
              </p>
            </div>

            {resultado.ciclos.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[13px] font-bold text-ink mb-2">Reinversión, ciclo por ciclo</h3>
                <ol className="bg-surface border border-rule rounded-2xl divide-y divide-rule overflow-hidden">
                  {resultado.ciclos.map((ci) => (
                    <li key={ci.numero} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <span className="text-[13px] text-ink-soft">
                        <span className="inline-block w-6 font-bold text-ink">{ci.numero}.</span>
                        {pesos.format(ci.capitalInicial)} → {pesos.format(ci.capitalFinal)}
                      </span>
                      <span className="text-[14px] font-bold text-ink tabular-nums">+{pesos.format(ci.rendimiento)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className={`${ayudaCls} text-center`}>
              Rendimiento <strong>bruto</strong>. Los CETES pagan ISR: la retención (art. 54 LISR) se calcula sobre el
              capital, no sobre la ganancia, y es acreditable en tu declaración anual.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
