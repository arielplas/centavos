// <Icon name>: los íconos de la app web (docs/app-web.md §4.7). Dos familias,
// las mismas que usa la app, sin sustitutos:
//
//   · `@cntvos/icons`: los 14 `category-*`, las pestañas (`tab-*`) y las acciones.
//     Grilla 24, trazo 1.75, puntas redondas, sin relleno; el color es `currentColor`.
//   · MaterialCommunityIcons vía `@mdi/js`: solo los nombres de `MDI_PATHS`, con
//     los mismos nombres que la app. Rutas SVG de 24 con relleno `currentColor`.
//     Se importan por nombre (nunca `import *`) para que el bundle lleve solo estos.
//
// Decorativo por defecto (`aria-hidden`). Si el ícono es lo único que hay en un
// botón, el `aria-label` va en el botón; si de verdad es una imagen suelta, pasa
// `label` y se dibuja con `role="img"`.

import type { CSSProperties } from "react";
import { GLYPHS, ICON_STROKE_ATTRS, ICON_STROKE_WIDTH, ICON_VIEWBOX, type IconName } from "@cntvos/icons";
import {
  mdiAccount,
  mdiAccountMultiple,
  mdiAlertCircleOutline,
  mdiAlertOutline,
  mdiCheck,
  mdiCheckCircleOutline,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronUp,
  mdiImageOutline,
  mdiInfinity,
  mdiInformationOutline,
  mdiLock,
  mdiLockOutline,
  mdiPartyPopper,
} from "@mdi/js";

/** Los nombres de MaterialCommunityIcons que usa la web (§4.7), tal como en la app. */
export const MDI_PATHS = {
  account: mdiAccount,
  "account-multiple": mdiAccountMultiple,
  "alert-circle-outline": mdiAlertCircleOutline,
  "alert-outline": mdiAlertOutline,
  check: mdiCheck,
  "check-circle-outline": mdiCheckCircleOutline,
  "chevron-down": mdiChevronDown,
  "chevron-left": mdiChevronLeft,
  "chevron-up": mdiChevronUp,
  "image-outline": mdiImageOutline,
  infinity: mdiInfinity,
  "information-outline": mdiInformationOutline,
  lock: mdiLock,
  "lock-outline": mdiLockOutline,
  "party-popper": mdiPartyPopper,
} as const;

export type MdiName = keyof typeof MDI_PATHS;
export type { IconName };
/** Cualquier ícono que `<Icon>` sabe pintar. */
export type AnyIconName = IconName | MdiName;

export type IconProps = {
  name: AnyIconName;
  /** Lado en px. */
  size?: number;
  /** Solo para los de `@cntvos/icons`; por defecto 1.75, el del contrato. */
  strokeWidth?: number;
  /** Nombre accesible. Sin él, el ícono es decorativo (`aria-hidden`). */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function isMdiName(name: string): name is MdiName {
  return Object.prototype.hasOwnProperty.call(MDI_PATHS, name);
}

export function Icon({ name, size = 24, strokeWidth = ICON_STROKE_WIDTH, label, className, style }: IconProps) {
  const a11y = label ? ({ role: "img", "aria-label": label } as const) : ({ "aria-hidden": true } as const);
  const common = {
    width: size,
    height: size,
    viewBox: ICON_VIEWBOX,
    className,
    style: { flexShrink: 0, ...style },
    focusable: false,
    ...a11y,
  } as const;

  if (isMdiName(name)) {
    return (
      <svg {...common} fill="currentColor">
        <path d={MDI_PATHS[name]} />
      </svg>
    );
  }
  return (
    <svg {...common} {...ICON_STROKE_ATTRS} stroke="currentColor" strokeWidth={strokeWidth}>
      <path d={GLYPHS[name]} />
    </svg>
  );
}
