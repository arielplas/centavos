// Cálculo de rendimiento de CETES.
//
// Módulo puro: la tasa es entrada del usuario, así que no depende de ninguna
// serie publicada ni requiere mantenimiento. El ISR (retención del art. 54 LISR
// sobre el capital) se explica en prosa en la página. Ver
// docs/calculadoras/cetes.md.

/** Valor nominal de un CETE al vencimiento, en pesos. */
export const VALOR_NOMINAL = 10;
/** Base de días que usa Banxico para valores gubernamentales. */
export const BASE_DIAS = 360;
/** Plazos de las subastas semanales. */
export const PLAZOS_CETES = [28, 91, 182, 364] as const;

const c = (n: number) => Math.round(n * 100) / 100;

/** Precio de compra de un título (se compra a descuento del valor nominal). */
export function precioTitulo(tasaAnual: number, plazo: number): number {
  return VALOR_NOMINAL / (1 + (tasaAnual * plazo) / BASE_DIAS);
}

export type EntradaCetes = {
  inversion: number;
  /** Tasa anual en decimal (0.10 = 10 %). */
  tasaAnual: number;
  plazo: number;
  /** Reinvertir capital + rendimiento hasta completar el año. */
  reinvertir?: boolean;
};

export type CicloCetes = {
  numero: number;
  capitalInicial: number;
  rendimiento: number;
  capitalFinal: number;
};

export type ResultadoCetes = {
  precio: number;
  titulos: number;
  montoInvertido: number;
  /** Capital no colocado por comprar títulos enteros. */
  sobrante: number;
  montoVencimiento: number;
  gananciaBruta: number;
  /** Rendimiento del periodo (no anualizado). */
  rendimientoPeriodo: number;
  /** Rendimiento anual efectivo, capitalizado. */
  rendimientoAnualEfectivo: number;
  /** Ciclos si se reinvierte; vacío si no. */
  ciclos: CicloCetes[];
  capitalFinalAnio: number | null;
};

/** Devuelve `null` con entradas inválidas para que la interfaz no muestre NaN. */
export function calcularCetes(entrada: EntradaCetes): ResultadoCetes | null {
  const { inversion, tasaAnual, plazo, reinvertir } = entrada;

  if (!Number.isFinite(inversion) || inversion <= 0) return null;
  if (!Number.isFinite(tasaAnual) || tasaAnual <= 0) return null;
  if (!Number.isFinite(plazo) || plazo <= 0) return null;

  const precio = precioTitulo(tasaAnual, plazo);
  const titulos = Math.floor(inversion / precio);
  if (titulos < 1) return null;

  const montoInvertido = titulos * precio;
  const montoVencimiento = titulos * VALOR_NOMINAL;
  const gananciaBruta = montoVencimiento - montoInvertido;
  const rendimientoPeriodo = gananciaBruta / montoInvertido;
  const rendimientoAnualEfectivo = Math.pow(1 + rendimientoPeriodo, BASE_DIAS / plazo) - 1;

  const ciclos: CicloCetes[] = [];
  let capitalFinalAnio: number | null = null;
  if (reinvertir) {
    const nCiclos = Math.floor(BASE_DIAS / plazo);
    let capital = inversion;
    for (let i = 0; i < nCiclos; i++) {
      const factor = 1 + (tasaAnual * plazo) / BASE_DIAS;
      const capitalFinal = capital * factor;
      ciclos.push({
        numero: i + 1,
        capitalInicial: c(capital),
        rendimiento: c(capitalFinal - capital),
        capitalFinal: c(capitalFinal),
      });
      capital = capitalFinal;
    }
    capitalFinalAnio = c(capital);
  }

  return {
    precio: Math.round(precio * 1e6) / 1e6,
    titulos,
    montoInvertido: c(montoInvertido),
    sobrante: c(inversion - montoInvertido),
    montoVencimiento: c(montoVencimiento),
    gananciaBruta: c(gananciaBruta),
    rendimientoPeriodo,
    rendimientoAnualEfectivo,
    ciclos,
    capitalFinalAnio,
  };
}
