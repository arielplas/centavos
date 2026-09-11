// Cálculo de aguinaldo (LFT art. 87).
//
// Módulo puro. El aguinaldo bruto no depende de ninguna constante indexada: son
// 15 días de salario (mínimo de ley) ajustados por la proporción del año
// trabajado. La exención de ISR (30 UMA) se explica en prosa en la página, así
// que este módulo no requiere mantenimiento anual. Ver
// docs/calculadoras/aguinaldo.md.

export const DIAS_AGUINALDO_MINIMO = 15;
export const DIAS_ANIO = 365;

/**
 * Días trabajados en el año, del ingreso (o del 1 de enero) al 31 de diciembre
 * del año de referencia (o a la fecha de baja). Ambos extremos inclusive.
 */
export function diasTrabajadosEnAnio(args: {
  anio: number;
  fechaIngreso?: Date | null;
  fechaBaja?: Date | null;
}): number {
  const { anio, fechaIngreso, fechaBaja } = args;
  const inicioAnio = new Date(anio, 0, 1);
  const finAnio = new Date(anio, 11, 31);

  const desde = fechaIngreso && fechaIngreso > inicioAnio ? fechaIngreso : inicioAnio;
  const hasta = fechaBaja && fechaBaja < finAnio ? fechaBaja : finAnio;

  if (hasta < desde) return 0;

  const msPorDia = 24 * 60 * 60 * 1000;
  const dias = Math.round((hasta.getTime() - desde.getTime()) / msPorDia) + 1; // inclusivo
  return Math.min(dias, DIAS_ANIO);
}

export type EntradaAguinaldo = {
  salarioMensual: number;
  /** Días de aguinaldo pactados; 15 por ley si no se especifica. */
  dias?: number;
  /** Días efectivamente trabajados en el año (0–365). Alternativa a las fechas. */
  diasTrabajados?: number;
};

export type ResultadoAguinaldo = {
  salarioDiario: number;
  dias: number;
  diasTrabajados: number;
  proporcion: number;
  aguinaldo: number;
  /** true si trabajó el año completo (sin proporcional). */
  anioCompleto: boolean;
};

/** Devuelve `null` con entradas inválidas para que la interfaz no muestre NaN. */
export function calcularAguinaldo(entrada: EntradaAguinaldo): ResultadoAguinaldo | null {
  const { salarioMensual } = entrada;
  const dias = entrada.dias ?? DIAS_AGUINALDO_MINIMO;
  const diasTrabajados = entrada.diasTrabajados ?? DIAS_ANIO;

  if (!Number.isFinite(salarioMensual) || salarioMensual <= 0) return null;
  if (!Number.isFinite(dias) || dias <= 0) return null;
  if (!Number.isFinite(diasTrabajados) || diasTrabajados <= 0) return null;

  const diasTrab = Math.min(diasTrabajados, DIAS_ANIO);
  const salarioDiario = salarioMensual / 30;
  const proporcion = diasTrab / DIAS_ANIO;
  const aguinaldo = salarioDiario * dias * proporcion;

  return {
    salarioDiario: Math.round(salarioDiario * 100) / 100,
    dias,
    diasTrabajados: diasTrab,
    proporcion,
    aguinaldo: Math.round(aguinaldo * 100) / 100,
    anioCompleto: diasTrab >= DIAS_ANIO,
  };
}
