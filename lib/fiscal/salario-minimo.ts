// Salario mínimo diario vigente (CONASAMI, publicado en el DOF cada diciembre
// con vigencia del 1 de enero).
//
// ⚠️ NO se rellena con valores de memoria ni de blogs: un dígito mal aquí da una
// cifra incorrecta que alguien puede usar para reclamarle a su patrón. Copia el
// valor oficial del DOF/CONASAMI y verifícalo:
//   https://www.gob.mx/conasami
//
// Mientras el valor del año en curso sea `null`, la calculadora de finiquito
// funciona pero NO aplica el tope de 2× salario mínimo a la prima de antigüedad
// (art. 486 LFT), y lo advierte en pantalla. En cuanto pongas el número, el tope
// se activa solo.

export type SalarioMinimoAnual = {
  /** Zona general (pesos por día). */
  general: number;
  /** Zona Libre de la Frontera Norte (pesos por día). */
  zlfn: number;
  vigenteDesde: string; // "YYYY-01-01"
};

export const SALARIO_MINIMO: Record<number, SalarioMinimoAnual> = {
  // 2026: { general: 0, zlfn: 0, vigenteDesde: "2026-01-01" },  ← copiar del DOF
};

/** Salario mínimo diario general del año dado, o `null` si aún no se ha cargado. */
export function salarioMinimoDiario(anio: number): number | null {
  return SALARIO_MINIMO[anio]?.general ?? null;
}
