"use client";

// <EmptyState>: lo que se ve cuando no hay nada. El ícono de la pestaña sobre un
// disco `sand` de 72 px, título, cuerpo y, si hay `action`, un botón tinta. En la
// web el botón lleva a la app (la web no anota ni edita): `href` a
// `appDownloadHref(lang)` con el texto de `app:emptyCta*`.
//
//   <EmptyState icon="tab-presupuestos" title={t("budgets:emptyTitle")} body={t("budgets:emptyBody")}
//               action={{ label: t("app:emptyCtaBudget"), href: appDownloadHref(lang) }} />
//
// El título es un encabezado del nivel que pidas (`headingLevel`, 2 por defecto).

import Link from "next/link";
import { Icon, type AnyIconName } from "./Icon";

export type EmptyStateProps = {
  /** El ícono estándar: el de la pestaña (`tab-historial`…), o `tab-amigos` en compartidos. */
  icon: AnyIconName;
  title: string;
  body: string;
  action?: { label: string; href: string };
  headingLevel?: 2 | 3;
  className?: string;
};

export function EmptyState({ icon, title, body, action, headingLevel = 2, className }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={`flex flex-col items-center px-5 py-12 text-center ${className ?? ""}`}>
      <span aria-hidden="true" className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-sand text-ink">
        <Icon name={icon} size={34} />
      </span>
      <Heading className="mb-2 font-display text-h2 font-extrabold text-ink">{title}</Heading>
      <p className="mb-6 max-w-sm text-body text-ink-soft">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-6 text-body-bold font-bold text-bg"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
