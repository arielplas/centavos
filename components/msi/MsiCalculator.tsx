"use client";

import { useEffect, useMemo, useState } from "react";
import { calcularMsi, fechaISOLocal, PLAZOS_COMUNES, DIAS_PARA_PAGAR } from "@/lib/msi";

const pesos = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const fechaCorta = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });
const fechaLarga = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" });

/** Deja solo dígitos y un punto decimal; "" si el campo está vacío. */
function limpiarNumero(v: string): string {
  return v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

const campo =
  "w-full bg-surface border border-rule-strong rounded-xl px-4 py-3 text-[16px] font-semibold text-ink " +
  "placeholder:text-ink-soft/60 placeholder:font-normal";

const etiqueta = "block text-[13px] font-bold text-ink mb-1.5";
const ayuda = "text-[12px] text-ink-soft mt-1.5 leading-snug";

export function MsiCalculator() {
  const [monto, setMonto] = useState("12000");
  const [meses, setMeses] = useState(12);
  const [contado, setContado] = useState("");
  const [diaCorte, setDiaCorte] = useState("");

  // La fecha de hoy se resuelve después del montaje: si se calculara durante el
  // render, el HTML del servidor y el del cliente podrían diferir (hidratación).
  const [hoy, setHoy] = useState<Date | null>(null);
  useEffect(() => setHoy(new Date()), []);

  const resultado = useMemo(
    () =>
      calcularMsi({
        monto: parseFloat(monto),
        meses,
        contado: contado === "" ? null : parseFloat(contado),
        diaCorte: diaCorte === "" ? null : parseInt(diaCorte, 10),
        fechaCompra: hoy,
      }),
    [monto, meses, contado, diaCorte, hoy],
  );

  const contadoNum = contado === "" ? null : parseFloat(contado);
  const montoNum = parseFloat(monto);
  const contadoMayor =
    contadoNum !== null && Number.isFinite(contadoNum) && Number.isFinite(montoNum) && contadoNum > montoNum;

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      {/* ─── Entradas ─── */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="msi-monto" className={etiqueta}>
            ¿Cuánto cuesta?
          </label>
          <div className="relative">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
              $
            </span>
            <input
              id="msi-monto"
              inputMode="decimal"
              autoComplete="off"
              value={monto}
              onChange={(e) => setMonto(limpiarNumero(e.target.value))}
              className={`${campo} pl-8`}
              placeholder="12000"
            />
          </div>
          <p className={ayuda}>El precio a meses, tal como aparece en la tienda.</p>
        </div>

        <div>
          <label htmlFor="msi-contado" className={etiqueta}>
            Precio de contado <span className="font-normal text-ink-soft">(opcional)</span>
          </label>
          <div className="relative">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
              $
            </span>
            <input
              id="msi-contado"
              inputMode="decimal"
              autoComplete="off"
              value={contado}
              onChange={(e) => setContado(limpiarNumero(e.target.value))}
              className={`${campo} pl-8`}
              placeholder="Si pagaras hoy, de un jalón"
              aria-describedby="msi-contado-ayuda"
            />
          </div>
          <p id="msi-contado-ayuda" className={ayuda}>
            Si hay descuento por pagar de contado, calculamos cuánto te cuesta de verdad la promoción.
          </p>
        </div>
      </div>

      {/* ─── Plazo ─── */}
      <fieldset className="mt-5">
        <legend className={etiqueta}>¿A cuántos meses?</legend>
        <div className="flex flex-wrap gap-2">
          {PLAZOS_COMUNES.map((n) => {
            const activo = n === meses;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setMeses(n)}
                aria-pressed={activo}
                className={`min-w-[64px] rounded-full px-4 py-2.5 text-[14px] font-bold border transition-colors ${
                  activo
                    ? "bg-ink text-bg border-ink"
                    : "bg-surface text-ink border-rule-strong hover:border-ink"
                }`}
              >
                {n} meses
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ─── Día de corte ─── */}
      <div className="mt-5 max-w-[260px]">
        <label htmlFor="msi-corte" className={etiqueta}>
          Día de corte de tu tarjeta <span className="font-normal text-ink-soft">(opcional)</span>
        </label>
        <input
          id="msi-corte"
          inputMode="numeric"
          autoComplete="off"
          value={diaCorte}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 2);
            const n = parseInt(v, 10);
            setDiaCorte(v === "" || (n >= 1 && n <= 31) ? v : diaCorte);
          }}
          className={campo}
          placeholder="Ej. 15"
          aria-describedby="msi-corte-ayuda"
        />
        <p id="msi-corte-ayuda" className={ayuda}>
          Viene en tu estado de cuenta. Con eso te armamos el calendario de pagos.
        </p>
      </div>

      {/* ─── Resultado ─── */}
      <div className="mt-7">
        {!resultado ? (
          <p className="text-[14px] text-ink-soft text-center py-6">
            Escribe el precio de la compra para ver tu mensualidad.
          </p>
        ) : (
          <>
            <div aria-live="polite" aria-atomic="true" className="bg-surface border border-rule rounded-3xl p-6 text-center">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                Tu mensualidad
              </div>
              <p className="font-display text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-none text-ink">
                {pesos.format(resultado.mensualidad)}
              </p>
              <p className="text-[14px] text-ink-soft mt-3">
                al mes durante <strong className="text-ink font-bold">{meses} meses</strong> · total{" "}
                {pesos.format(resultado.total)}
              </p>
            </div>

            {contadoMayor && (
              <p className="text-[13px] text-ink-soft mt-3 text-center">
                El precio de contado que pusiste es mayor que el precio a meses. Revísalo.
              </p>
            )}

            {/* Costo real de la promoción */}
            {resultado.tasaAnual !== null && resultado.sobrecosto !== null && (
              <div className="bg-peach border border-mandarina/40 rounded-3xl p-5 md:p-6 mt-4">
                <div className="text-[11px] font-extrabold tracking-wider text-ink/70 uppercase mb-2">
                  Ojo con esto
                </div>
                <p className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] leading-tight text-ink mb-3">
                  Pagar a meses te cuesta {pesos.format(resultado.sobrecosto)} más
                </p>
                <p className="text-[14px] leading-relaxed text-ink/85">
                  Es el equivalente a una tasa anual de{" "}
                  <strong className="font-extrabold">
                    {(resultado.tasaAnual * 100).toLocaleString("es-MX", { maximumFractionDigits: 1 })}%
                  </strong>
                  . La promoción no cobra intereses, pero al renunciar al descuento de contado estás pagando
                  por diferir el gasto.
                </p>
              </div>
            )}

            {resultado.tasaAnual === null && contadoNum !== null && !contadoMayor && Number.isFinite(contadoNum) && (
              <div className="bg-sky/50 border border-rule rounded-3xl p-5 mt-4">
                <p className="text-[14px] leading-relaxed text-ink">
                  <strong className="font-bold">Aquí sí es sin intereses de verdad.</strong> El precio de
                  contado y el precio a meses son iguales, así que diferir el pago no te cuesta nada.
                </p>
              </div>
            )}

            {/* Calendario */}
            <div className="mt-4">
              {resultado.pagos[0].fecha ? (
                <>
                  <h3 className="text-[13px] font-bold text-ink mb-2">Tu calendario de pagos</h3>
                  <ol className="bg-surface border border-rule rounded-2xl divide-y divide-rule overflow-hidden">
                    {resultado.pagos.map((p) => (
                      <li key={p.numero} className="flex items-center justify-between gap-4 px-4 py-2.5">
                        <span className="text-[13px] text-ink-soft">
                          <span className="inline-block w-6 font-bold text-ink">{p.numero}.</span>
                          <time dateTime={fechaISOLocal(p.fecha!)}>
                            {fechaCorta.format(p.fecha!)} {p.fecha!.getFullYear()}
                          </time>
                        </span>
                        <span className="text-[14px] font-bold text-ink tabular-nums">{pesos.format(p.monto)}</span>
                      </li>
                    ))}
                  </ol>
                  <p className={ayuda}>
                    Fechas límite de pago aproximadas ({DIAS_PARA_PAGAR} días después de cada corte). El último
                    pago absorbe los centavos que no se dividen exacto. Tu banco puede usar un plazo distinto.
                  </p>
                  {hoy && (
                    <p className={ayuda}>
                      Calculado para una compra hecha hoy, {fechaLarga.format(hoy)}.
                    </p>
                  )}
                </>
              ) : (
                <p className={`${ayuda} text-center`}>
                  Agrega tu día de corte arriba y te decimos en qué fecha cae cada pago.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
