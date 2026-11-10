// Cálculo de PTU — reparto de utilidades (LFT arts. 117–131).
//
// Módulo puro. El reparto (50 % por días, 50 % por salarios) y el tope de la
// reforma 2021 (3 meses o el promedio de los últimos 3 años, lo que más
// favorezca) no dependen de ninguna constante indexada. La exención de ISR
// (15 UMA) se explica en prosa en la página. Ver docs/calculadoras/ptu.md.

export type EntradaPtuCompleta = {
  modo: "completo";
  utilidadRepartible: number;
  totalDias: number;
  misDias: number;
  totalSalarios: number;
  misSalarios: number;
  /** Sueldo mensual, para aplicar el tope de 3 meses. */
  salarioMensual: number;
  /** Promedio de PTU recibida en los últimos 3 años, si se conoce. */
  promedio3Anios?: number | null;
};

export type EntradaPtuTope = {
  modo: "tope";
  /** Sin datos de la plantilla, solo se estima la cota máxima (3 meses). */
  salarioMensual: number;
  promedio3Anios?: number | null;
};

export type EntradaPtu = EntradaPtuCompleta | EntradaPtuTope;

export type ResultadoPtu = {
  modo: "completo" | "tope";
  /** Reparto antes del tope (solo en modo completo). */
  bruta: number | null;
  porDias: number | null;
  porSalarios: number | null;
  /** Tope aplicable = max(3 meses, promedio 3 años). */
  tope: number;
  topeAplico: boolean;
  /** PTU final: en modo tope es la cota máxima estimada. */
  final: number;
};

const c = (n: number) => Math.round(n * 100) / 100;

function topeReforma2021(salarioMensual: number, promedio3Anios?: number | null): number {
  const tresMeses = salarioMensual * 3;
  const prom = Number.isFinite(promedio3Anios ?? NaN) ? (promedio3Anios as number) : 0;
  // "Lo que resulte más favorable al trabajador" → el mayor de los dos.
  return Math.max(tresMeses, prom);
}

/** Devuelve `null` con entradas inválidas para que la interfaz no muestre NaN. */
export function calcularPtu(entrada: EntradaPtu): ResultadoPtu | null {
  if (!Number.isFinite(entrada.salarioMensual) || entrada.salarioMensual <= 0) return null;

  const tope = topeReforma2021(entrada.salarioMensual, entrada.promedio3Anios);

  if (entrada.modo === "tope") {
    return {
      modo: "tope",
      bruta: null,
      porDias: null,
      porSalarios: null,
      tope: c(tope),
      topeAplico: false,
      final: c(tope),
    };
  }

  const { utilidadRepartible, totalDias, misDias, totalSalarios, misSalarios } = entrada;
  if (
    !Number.isFinite(utilidadRepartible) || utilidadRepartible <= 0 ||
    !Number.isFinite(totalDias) || totalDias <= 0 ||
    !Number.isFinite(totalSalarios) || totalSalarios <= 0 ||
    !Number.isFinite(misDias) || misDias < 0 ||
    !Number.isFinite(misSalarios) || misSalarios < 0
  ) {
    return null;
  }

  const mitad = utilidadRepartible / 2;
  const porDias = (mitad / totalDias) * misDias;
  const porSalarios = (mitad / totalSalarios) * misSalarios;
  const bruta = porDias + porSalarios;
  const final = Math.min(bruta, tope);

  return {
    modo: "completo",
    bruta: c(bruta),
    porDias: c(porDias),
    porSalarios: c(porSalarios),
    tope: c(tope),
    topeAplico: bruta > tope,
    final: c(final),
  };
}
