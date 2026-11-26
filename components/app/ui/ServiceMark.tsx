// <ServiceMark>: lo que representa a una suscripción: las iniciales del servicio
// sobre el tinte de su categoría (cuadro de 44 con radio 13 en la app). Reemplaza
// al emoji guardado, que no decía nada del servicio. Decorativo: la fila ya dice
// el nombre.
//
//   <ServiceMark name="Netflix" category="entertainment" />

import { Icon } from "./Icon";
import { categoryTint } from "./categories";
import { initialsFrom } from "./format";

export type ServiceMarkProps = {
  /** Nombre del servicio; vacío dibuja el glifo de la pestaña en vez de «?». */
  name: string;
  /** Clave de categoría (`entertainment`): decide el tinte. */
  category: string | null | undefined;
  size?: number;
  className?: string;
};

export function ServiceMark({ name, category, size = 44, className }: ServiceMarkProps) {
  const hasName = name.trim().length > 0;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center text-ink ${className ?? ""}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundColor: categoryTint(category) }}
    >
      {hasName ? (
        <span style={{ fontSize: Math.round(size * 0.36), fontWeight: 800, letterSpacing: "0.2px", lineHeight: 1 }}>
          {initialsFrom(name)}
        </span>
      ) : (
        <Icon name="tab-suscripciones" size={Math.round(size * 0.5)} />
      )}
    </span>
  );
}
