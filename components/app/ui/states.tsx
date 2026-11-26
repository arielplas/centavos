"use client";

// Los tres estados que toda pantalla de datos comparte (§4.6, D-7):
//
//   cargando  → <Bone> y <SkeletonBlock>: esqueletos con la forma de lo que viene
//   error     → <LoadError message onRetry>: el texto del error y «Reintentar» (mandarina-deep), centrado
//   vacío     → <EmptyState> (otro archivo)
//
// y el aviso discreto de <Notice> / <UseAppNotice> («Para anotar o editar, usa la app.»).

import type { CSSProperties, ReactNode } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { Icon } from "./Icon";

/** Un hueso de esqueleto: una caja `sand` que pulsa. Sin movimiento con `prefers-reduced-motion` (Tailwind: `motion-safe`). */
export function Bone({ width, height = 16, radius = 8, className, style }: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`motion-safe:animate-pulse bg-sand ${className ?? ""}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/**
 * El contenedor de un esqueleto: `aria-busy` y un texto oculto «Cargando» para
 * lectores de pantalla. Los `Bone` van adentro.
 */
export function SkeletonBlock({ children, className }: { children: ReactNode; className?: string }) {
  const t = useT();
  return (
    <div aria-busy="true" className={className}>
      <span className="sr-only" role="status">
        {t("common:loading")}
      </span>
      {children}
    </div>
  );
}

/**
 * El error de una pantalla de datos: el texto, centrado, y «Reintentar» como
 * enlace en `mandarina-deep` (un botón de 44 px de alto). Se anuncia solo (`role="alert"`).
 */
export function LoadError({ message, onRetry, className }: { message: string; onRetry: () => void; className?: string }) {
  const t = useT();
  return (
    <div role="alert" className={`flex flex-col items-center px-5 py-16 text-center ${className ?? ""}`}>
      <p className="mb-2 text-body-bold font-bold text-ink">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[44px] items-center px-4 text-body-bold font-bold text-mandarina-deep underline underline-offset-4"
      >
        {t("common:actions.retry")}
      </button>
    </div>
  );
}

/** Una línea discreta con un ícono: avisos que no son errores. */
export function Notice({ children, icon = "information-outline", tone = "plain", className, role }: {
  children: ReactNode;
  icon?: Parameters<typeof Icon>[0]["name"];
  /** `band`: una banda `sky` (para algo que la persona debe ver); `plain`: solo texto chico. */
  tone?: "plain" | "band";
  className?: string;
  role?: "status" | "note";
}) {
  const base = tone === "band" ? "rounded-2xl bg-sky px-4 py-3 text-small text-ink" : "text-small text-ink-soft";
  return (
    <p role={role} className={`flex items-start gap-2 ${base} ${className ?? ""}`}>
      <Icon name={icon} size={16} className="mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

/** «Para anotar o editar, usa la app.»: el aviso del Pulso y del Perfil (§4.4). */
export function UseAppNotice({ className }: { className?: string }) {
  const t = useT();
  return <Notice className={className}>{t("app:useAppToEdit")}</Notice>;
}
