// Las 14 categorías del catálogo: tinte, glifo y etiqueta.
//
// La API manda `{ key, label, emoji }`, pero la web no usa ni la etiqueta (solo
// está en español) ni el emoji (§4.7: nada de emojis donde la app usa un ícono).
// La etiqueta sale de `categories:<key>` y el tinte de `@cntvos/tokens`. Una clave
// que el servidor agregó y la web no conoce lleva el tinte por defecto, el glifo
// `category-other` y la clave misma como etiqueta, sin tronar.

import { CATEGORY_ICON_NAMES, categoryIconName, type CategoryIconName } from "@cntvos/icons";
import { CATEGORY_TINTS, DEFAULT_CATEGORY_TINT } from "@cntvos/tokens";
import type { T } from "@/components/app/copy";

/** Las 14 claves, en el orden del catálogo («other» al final). */
export const CATEGORY_KEYS = [
  "food",
  "transport",
  "entertainment",
  "health",
  "home",
  "clothing",
  "education",
  "pets",
  "travel",
  "gifts",
  "personal_care",
  "utilities",
  "debt",
  "other",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** Donde se archiva un presupuesto sin categoría (es nulo en la API). */
export const UNCATEGORIZED_KEY: CategoryKey = "other";

export type Category = {
  key: string;
  /** Etiqueta en el idioma activo. */
  label: string;
  /** Fondo del círculo: un `#rrggbb` fijo que no sigue el tema. */
  color: string;
  /** Glifo de `@cntvos/icons`. */
  icon: CategoryIconName;
};

const TINTS: Record<string, string> = CATEGORY_TINTS;

export function isCategoryKey(key: string): key is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(key);
}

/** Tinte de una categoría (el de «otros» si no se conoce). */
export function categoryTint(key: string | null | undefined): string {
  return (key && TINTS[key]) || DEFAULT_CATEGORY_TINT;
}

/** Glifo de una categoría; `category-other` si no tiene uno dibujado. */
export function categoryGlyph(key: string | null | undefined): CategoryIconName {
  if (!key) return "category-other";
  const name = categoryIconName(key);
  return (CATEGORY_ICON_NAMES as readonly string[]).includes(name) ? name : "category-other";
}

/** Una categoría lista para pintar. Nunca lanza: una clave nula cae a «otros». */
export function getCategory(key: string | null | undefined, t: T): Category {
  const k = key || UNCATEGORIZED_KEY;
  return {
    key: k,
    label: isCategoryKey(k) ? t(`categories:${k}`) : k,
    color: categoryTint(k),
    icon: categoryGlyph(k),
  };
}
