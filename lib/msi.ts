// Cálculo de compras a meses sin intereses.
//
// Módulo puro: no depende de ninguna constante fiscal ni de ninguna tasa
// publicada, así que no requiere mantenimiento anual. Ver la especificación en
// docs/calculadoras/meses-sin-intereses.md.

/** Días entre la fecha de corte y la fecha límite de pago. Es el estándar de la
 *  banca mexicana; varía por emisor, por eso el resultado se presenta como
 *  aproximado en la página. */
export const DIAS_PARA_PAGAR = 20;

export const PLAZOS_COMUNES = [3, 6, 9, 12, 18, 24] as const;

export type Pago = {
  /** 1-indexado. */
  numero: number;
  monto: number;
  /** Fecha límite de pago estimada. `null` si no se capturó el día de corte. */
  fecha: Date | null;
};

export type ResultadoMsi = {
  /** Mensualidad de referencia (monto ÷ meses), antes del ajuste de centavos. */
  mensualidad: number;
  /** Las N mensualidades; la última absorbe los centavos sobrantes. */
  pagos: Pago[];
  total: number;
  /** Tasa mensual implícita si hay precio de contado menor. `null` si no aplica. */
  tasaMensual: number | null;
  /** Tasa anual equivalente: (1 + mensual)^12 − 1. `null` si no aplica. */
  tasaAnual: number | null;
  /** Cuánto cuesta de más pagar a meses en vez de contado. `null` si no aplica. */
  sobrecosto: number | null;
};

/** Redondeo a centavos sin los errores de coma flotante de `toFixed`. */
function aCentavos(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Reparte el monto en N mensualidades iguales. Como casi nunca es divisible
 * exacto, los primeros N−1 pagos se truncan a centavos y el último absorbe el
 * sobrante, que es la práctica de los emisores.
 */
export function repartirMensualidades(monto: number, meses: number): number[] {
  const base = Math.floor((monto / meses) * 100) / 100;
  const pagos = Array.from({ length: meses - 1 }, () => base);
  pagos.push(aCentavos(monto - base * (meses - 1)));
  return pagos;
}

/**
 * Tasa mensual implícita de la promoción.
 *
 * Cuando existe un precio de contado menor, la diferencia es un costo
 * financiero real aunque la promoción se llame "sin intereses". Se despeja la
 * tasa `i` que iguala el precio de contado al valor presente de las
 * mensualidades:
 *
 *     contado = mensualidad × [1 − (1 + i)^(−n)] / i
 *
 * No tiene solución cerrada; se resuelve por bisección. La función es
 * monótona decreciente en `i`, así que 60 iteraciones bastan para converger
 * muy por debajo del último decimal que mostramos.
 */
export function tasaMensualImplicita(contado: number, mensualidad: number, meses: number): number | null {
  if (contado <= 0 || mensualidad <= 0 || meses < 1) return null;
  // Sin descuento por pago de contado no hay costo financiero: la promoción
  // es genuinamente sin intereses.
  if (contado >= mensualidad * meses) return null;

  const valorPresente = (i: number) => (mensualidad * (1 - Math.pow(1 + i, -meses))) / i;

  let lo = 1e-9;   // ~0 % mensual → VP = mensualidad × n, mayor que el contado
  let hi = 5;      // 500 % mensual → VP ≈ 0, menor que el contado
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (valorPresente(mid) > contado) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Calendario de pagos.
 *
 * Si la compra cae en o antes del día de corte, entra en el estado de cuenta
 * del ciclo en curso; si cae después, se va hasta el siguiente. A partir de ahí
 * un pago por mes. Las fechas son la **fecha límite de pago** estimada
 * (corte + DIAS_PARA_PAGAR).
 */
export function fechasDePago(compra: Date, diaCorte: number, meses: number): Date[] {
  const anio = compra.getFullYear();
  const mes = compra.getMonth();

  // Día real del corte en el mes de la compra (28 de febrero si se pidió 31).
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const corteEsteMes = new Date(anio, mes, Math.min(diaCorte, diasDelMes));

  // La compra después del corte cae en el siguiente estado de cuenta. Se vuelve
  // a acotar el día porque el mes siguiente puede ser más corto (corte 30 → 28 de feb).
  const diasMesSiguiente = new Date(anio, mes + 2, 0).getDate();
  const primerCorte =
    compra > corteEsteMes
      ? new Date(anio, mes + 1, Math.min(diaCorte, diasMesSiguiente))
      : corteEsteMes;

  return Array.from({ length: meses }, (_, i) => {
    const corte = new Date(primerCorte.getFullYear(), primerCorte.getMonth() + i, primerCorte.getDate());
    corte.setDate(corte.getDate() + DIAS_PARA_PAGAR);
    return corte;
  });
}

/**
 * `YYYY-MM-DD` en zona horaria local. No se usa `toISOString()` porque convierte
 * a UTC y, en husos con desfase positivo, la medianoche local cae el día anterior.
 */
export function fechaISOLocal(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export type EntradaMsi = {
  monto: number;
  meses: number;
  /** Precio si se pagara de contado. Opcional. */
  contado?: number | null;
  /** Día de corte de la tarjeta (1–31). Opcional. */
  diaCorte?: number | null;
  /** Fecha de la compra. Por defecto, hoy. */
  fechaCompra?: Date | null;
};

/**
 * Punto de entrada. Devuelve `null` con entradas inválidas para que la interfaz
 * simplemente no muestre resultado, en vez de renderizar NaN.
 */
export function calcularMsi(entrada: EntradaMsi): ResultadoMsi | null {
  const { monto, meses, contado, diaCorte, fechaCompra } = entrada;

  if (!Number.isFinite(monto) || monto <= 0) return null;
  if (!Number.isInteger(meses) || meses < 1 || meses > 48) return null;

  const montos = repartirMensualidades(monto, meses);
  const mensualidad = aCentavos(monto / meses);

  const fechas =
    diaCorte && diaCorte >= 1 && diaCorte <= 31 && fechaCompra
      ? fechasDePago(fechaCompra, diaCorte, meses)
      : null;

  const pagos: Pago[] = montos.map((m, i) => ({
    numero: i + 1,
    monto: m,
    fecha: fechas ? fechas[i] : null,
  }));

  const hayContado = Number.isFinite(contado ?? NaN) && (contado as number) > 0;
  const tasaMensual = hayContado ? tasaMensualImplicita(contado as number, mensualidad, meses) : null;

  return {
    mensualidad,
    pagos,
    total: monto,
    tasaMensual,
    tasaAnual: tasaMensual === null ? null : Math.pow(1 + tasaMensual, 12) - 1,
    sobrecosto: hayContado && (contado as number) < monto ? aCentavos(monto - (contado as number)) : null,
  };
}
