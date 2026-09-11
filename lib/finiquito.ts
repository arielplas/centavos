// Cálculo de finiquito y liquidación (LFT arts. 47–53, 87, 162, 486).
//
// El finiquito (partes proporcionales devengadas) no depende de ninguna
// constante. La prima de antigüedad usa el salario mínimo SOLO para el tope de
// 2× del art. 486, que rara vez muerde; si no se ha cargado el salario mínimo
// del año (lib/fiscal/salario-minimo.ts), se calcula sin tope y se advierte.
// Ver docs/calculadoras/finiquito.md.

import { diasPorAntiguedad } from "./vacaciones";
import { salarioMinimoDiario } from "./fiscal/salario-minimo";

export type TipoTerminacion = "renuncia" | "despido_justificado" | "despido_injustificado";

export const DIAS_AGUINALDO = 15;
export const PRIMA_VACACIONAL = 0.25;
export const DIAS_ANIO = 365;

export type EntradaFiniquito = {
  tipo: TipoTerminacion;
  salarioMensual: number;
  fechaIngreso: Date;
  fechaSalida: Date;
  /** Días de vacaciones ya generados que no se tomaron. */
  diasVacacionesPendientes?: number;
  /** Días de sueldo trabajados y no pagados a la fecha de salida. */
  diasSalarioPendiente?: number;
};

export type LineaFiniquito = {
  concepto: string;
  monto: number;
  articulo: string;
};

export type ResultadoFiniquito = {
  salarioDiario: number;
  aniosServicio: number;
  finiquito: LineaFiniquito[];
  totalFiniquito: number;
  /** Conceptos de indemnización (solo despido injustificado). */
  indemnizacion: LineaFiniquito[];
  totalIndemnizacion: number;
  total: number;
  /** true si aplicó prima de antigüedad. */
  hayPrimaAntiguedad: boolean;
  /** true si el tope de 2× salario mínimo no se pudo aplicar por falta de dato. */
  topeAntiguedadNoDisponible: boolean;
};

const c = (n: number) => Math.round(n * 100) / 100;

/** Años cumplidos entre dos fechas (con su parte fraccionaria). */
export function aniosEntre(desde: Date, hasta: Date): number {
  const ms = hasta.getTime() - desde.getTime();
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}

/** Días trabajados del año de la salida (del 1 de enero a la fecha de salida). */
function diasTrabajadosDelAnio(fechaSalida: Date): number {
  const inicio = new Date(fechaSalida.getFullYear(), 0, 1);
  const msPorDia = 24 * 60 * 60 * 1000;
  return Math.round((fechaSalida.getTime() - inicio.getTime()) / msPorDia) + 1;
}

/** Devuelve `null` con entradas inválidas para que la interfaz no muestre NaN. */
export function calcularFiniquito(entrada: EntradaFiniquito): ResultadoFiniquito | null {
  const { tipo, salarioMensual, fechaIngreso, fechaSalida } = entrada;
  const diasVacPend = entrada.diasVacacionesPendientes ?? 0;
  const diasSalPend = entrada.diasSalarioPendiente ?? 0;

  if (!Number.isFinite(salarioMensual) || salarioMensual <= 0) return null;
  if (!(fechaIngreso instanceof Date) || !(fechaSalida instanceof Date)) return null;
  if (fechaSalida <= fechaIngreso) return null;

  const salarioDiario = salarioMensual / 30;
  const aniosServicio = aniosEntre(fechaIngreso, fechaSalida);
  const diasTrabAnio = Math.min(diasTrabajadosDelAnio(fechaSalida), DIAS_ANIO);

  // ── Finiquito: siempre se paga ──
  const aguinaldoProp = salarioDiario * DIAS_AGUINALDO * (diasTrabAnio / DIAS_ANIO);
  const vacacionesNoGozadas = salarioDiario * diasVacPend;
  const primaVacacional = vacacionesNoGozadas * PRIMA_VACACIONAL;
  const salariosPendientes = salarioDiario * diasSalPend;

  const finiquito: LineaFiniquito[] = [
    { concepto: "Aguinaldo proporcional", monto: c(aguinaldoProp), articulo: "art. 87 LFT" },
    { concepto: "Vacaciones no gozadas", monto: c(vacacionesNoGozadas), articulo: "art. 76 LFT" },
    { concepto: "Prima vacacional", monto: c(primaVacacional), articulo: "art. 80 LFT" },
  ];
  if (diasSalPend > 0) {
    finiquito.push({ concepto: "Salarios pendientes", monto: c(salariosPendientes), articulo: "art. 82 LFT" });
  }

  // ── Prima de antigüedad (art. 162) ──
  // Aplica en cualquier despido, y en renuncia con ≥15 años de servicio.
  const aplicaPrimaAntiguedad =
    tipo === "despido_justificado" || tipo === "despido_injustificado" || aniosServicio >= 15;

  let topeAntiguedadNoDisponible = false;
  if (aplicaPrimaAntiguedad) {
    const smDiario = salarioMinimoDiario(fechaSalida.getFullYear());
    let salarioTopado = salarioDiario;
    if (smDiario !== null) {
      salarioTopado = Math.min(salarioDiario, 2 * smDiario);
    } else if (salarioDiario > 0) {
      // No hay salario mínimo cargado: se calcula sin tope y se marca.
      topeAntiguedadNoDisponible = true;
    }
    const primaAntiguedad = salarioTopado * 12 * aniosServicio;
    finiquito.push({
      concepto: "Prima de antigüedad",
      monto: c(primaAntiguedad),
      articulo: "art. 162 LFT",
    });
  }

  const totalFiniquito = finiquito.reduce((s, l) => s + l.monto, 0);

  // ── Indemnización: solo despido injustificado (art. 50) ──
  const indemnizacion: LineaFiniquito[] = [];
  if (tipo === "despido_injustificado") {
    indemnizacion.push(
      { concepto: "Tres meses de indemnización", monto: c(salarioDiario * 90), articulo: "art. 50-III LFT" },
      { concepto: "20 días por año de servicio", monto: c(salarioDiario * 20 * aniosServicio), articulo: "art. 50-II LFT" },
    );
  }
  const totalIndemnizacion = indemnizacion.reduce((s, l) => s + l.monto, 0);

  return {
    salarioDiario: c(salarioDiario),
    aniosServicio,
    finiquito,
    totalFiniquito: c(totalFiniquito),
    indemnizacion,
    totalIndemnizacion: c(totalIndemnizacion),
    total: c(totalFiniquito + totalIndemnizacion),
    hayPrimaAntiguedad: aplicaPrimaAntiguedad,
    topeAntiguedadNoDisponible,
  };
}

// Silencia el import no usado si en el futuro se quita la tabla; hoy se usa para
// documentar la reutilización esperada del módulo de vacaciones en la UI.
export { diasPorAntiguedad };
