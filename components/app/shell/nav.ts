// Las pestañas de la app web y cuál está activa (§4.4). Sin React: se prueba sola.

import type { IconName } from "@cntvos/icons";
import type { CopyKey } from "@/components/app/copy";

export type TabId = "pulso" | "gastos" | "presupuestos" | "suscripciones";

export type Tab = {
  id: TabId;
  href: string;
  /** Glifo de `@cntvos/icons`. */
  icon: IconName;
  /** Nombre de la pestaña (los de `common:tabs`, como en la app). */
  label: CopyKey;
};

/** Pulso · Gastos · Presupuestos · Suscripciones, en ese orden. */
export const TABS: readonly Tab[] = [
  { id: "pulso", href: "/app/pulso", icon: "tab-pulso", label: "common:tabs.pulse" },
  { id: "gastos", href: "/app/gastos", icon: "tab-historial", label: "common:tabs.expenses" },
  { id: "presupuestos", href: "/app/presupuestos", icon: "tab-presupuestos", label: "common:tabs.budgets" },
  { id: "suscripciones", href: "/app/suscripciones", icon: "tab-suscripciones", label: "common:tabs.subscriptions" },
] as const;

export const PERFIL_HREF = "/app/perfil";
export const CLAUDE_HREF = "/app/conectar-claude";

/** ¿`pathname` es `href` o algo debajo (`/app/presupuestos/<id>` cuenta como Presupuestos)? */
export function isUnder(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path === href || path.startsWith(`${href}/`);
}

/** La pestaña que le toca a una ruta, o `null` (Perfil, Conectar con Claude…). */
export function activeTab(pathname: string | null): TabId | null {
  return TABS.find((tab) => isUnder(pathname, tab.href))?.id ?? null;
}
