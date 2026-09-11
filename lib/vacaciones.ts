// Cálculo de vacaciones y prima vacacional (LFT arts. 76 y 80).
//
// Módulo puro y sin constantes indexadas: la tabla del art. 76 y el 25 % de
// prima están en la ley y no cambian con la inflación. Ver la especificación en
// docs/calculadoras/vacaciones.md.

export const PRIMA_VACACIONAL_MINIMA = 0.25;

/**
 * Días de vacaciones que corresponden por años de antigüedad cumplidos,
 * conforme al art. 76 LFT reformado (Vacaciones Dignas, vigente 2023):
 *
 *   1→12, 2→14, 3→16, 4→18, 5→20, y a partir del sexto año +2 por cada
 *   quinquenio (6–10→22, 11–15→24, 16–20→26, …).
 *
 * Implementado como función abierta para no topar la tabla en 30 años.
 * Devuelve 0 si aún no se cumple el primer año.
 */
export function diasPorAntiguedad(anios: number): number {
  if (!Number.isFinite(anios) || anios < 1) return 0;
  const n = Math.floor(anios);
  if (n <= 5) return 10 + 2 * n;
  return 20 + 2 * Math.ceil((n - 5) / 5);
}

export type EntradaVacaciones = {
  salarioMensual: number;
  anios: number;
  /** Porcentaje de prima (0.25 = 25 %). Editable: hay contratos con más. */
  primaPct?: number;
};

export type ResultadoVacaciones = {
  dias: number;
  salarioDiario: number;
  pagoVacaciones: number;
  primaVacacional: number;
};

/** Devuelve `null` con entradas inválidas para que la interfaz no muestre NaN. */
export function calcularVacaciones(entrada: EntradaVacaciones): ResultadoVacaciones | null {
  const { salarioMensual, anios } = entrada;
  const primaPct = entrada.primaPct ?? PRIMA_VACACIONAL_MINIMA;

  if (!Number.isFinite(salarioMensual) || salarioMensual <= 0) return null;
  if (!Number.isFinite(anios) || anios < 1) return null;

  const dias = diasPorAntiguedad(anios);
  const salarioDiario = salarioMensual / 30;
  const pagoVacaciones = salarioDiario * dias;
  const primaVacacional = pagoVacaciones * primaPct;

  return {
    dias,
    salarioDiario: Math.round(salarioDiario * 100) / 100,
    pagoVacaciones: Math.round(pagoVacaciones * 100) / 100,
    primaVacacional: Math.round(primaVacacional * 100) / 100,
  };
}
