// Formateadores y clases compartidas por las calculadoras.
// Módulo puro (sin server-only): se puede importar desde componentes cliente.

export const pesos = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export const pesos0 = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/** Porcentaje a partir de un decimal (0.214 → "21.4%"). */
export function pct(decimal: number, dec = 1): string {
  return `${(decimal * 100).toLocaleString("es-MX", { maximumFractionDigits: dec })}%`;
}

/** Deja solo dígitos y un punto decimal; "" si el campo está vacío. */
export function limpiarNumero(v: string): string {
  return v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

// Clases de formulario, para que todas las calculadoras se vean iguales.
export const campoCls =
  "w-full bg-surface border border-rule-strong rounded-xl px-4 py-3 text-[16px] font-semibold text-ink " +
  "placeholder:text-ink-soft/60 placeholder:font-normal";
export const etiquetaCls = "block text-[13px] font-bold text-ink mb-1.5";
export const ayudaCls = "text-[12px] text-ink-soft mt-1.5 leading-snug";
