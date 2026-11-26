// <CategoryIcon>: el círculo de una categoría. El tinte `cat-*` de
// `@cntvos/tokens`, y adentro el glifo `category-*` de `@cntvos/icons` en tinta, a
// la mitad del diámetro, trazo 1.75. Sin emojis. Si el presupuesto tiene su
// propia foto (`imageUrl`), va la foto. Decorativo: la fila donde vive ya dice
// la categoría.
//
//   <CategoryIcon category={expense.category} size={40} />
//   <CategoryIcon category={b.category} size={36} imageUrl={b.imageUrl} tint="transparent" />   // dentro de un anillo

import { Icon } from "./Icon";
import { categoryGlyph, categoryTint } from "./categories";

export type CategoryIconProps = {
  /** Clave del catálogo (`food`, `personal_care`). Nula o desconocida → «otros». */
  category: string | null | undefined;
  /** Diámetro en px. */
  size?: number;
  /** URL pública de la foto del presupuesto; gana sobre el glifo. */
  imageUrl?: string;
  /** Fondo; por defecto el tinte de la categoría. `"transparent"` dentro de un anillo que ya lo lleva. */
  tint?: string;
  className?: string;
};

export function CategoryIcon({ category, size = 44, imageUrl, tint, className }: CategoryIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-ink ${className ?? ""}`}
      style={{ width: size, height: size, backgroundColor: tint ?? categoryTint(category) }}
    >
      {imageUrl ? (
        // URL pública del presupuesto: `<img>` sin next/image (§4.6).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" loading="lazy" width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <Icon name={categoryGlyph(category)} size={Math.round(size * 0.5)} />
      )}
    </span>
  );
}
