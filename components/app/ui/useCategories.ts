"use client";

import { useCallback, useMemo } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { CATEGORY_KEYS, getCategory, type Category } from "./categories";

/**
 * `getCategory(key)` con la etiqueta en el idioma activo y la lista de las 14
 * para un desplegable:
 *
 *   const { getCategory, categories } = useCategories();
 */
export function useCategories(): {
  getCategory: (key: string | null | undefined) => Category;
  categories: Category[];
} {
  const t = useT();
  const get = useCallback((key: string | null | undefined) => getCategory(key, t), [t]);
  const categories = useMemo(() => CATEGORY_KEYS.map((k) => getCategory(k, t)), [t]);
  return { getCategory: get, categories };
}
