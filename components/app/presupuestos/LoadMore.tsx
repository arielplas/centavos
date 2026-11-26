"use client";

// El pie de una lista con scroll infinito (como la app: sin botón «Cargar más»).
// Un centinela de 1 px pide la siguiente página cuando se acerca a la pantalla.
// Si la página falla, el error y «Reintentar» (el mismo botón de `LoadError`,
// en chico) quedan donde iba la lista.

import { useEffect, useRef } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { Bone, SkeletonBlock } from "@/components/app/ui";

export function LoadMore({
  more,
  busy,
  failed,
  version,
  onMore,
  failedMessage,
}: {
  /** Faltan filas por traer. */
  more: boolean;
  /** Hay una página en camino. */
  busy: boolean;
  /** La última página falló. */
  failed: boolean;
  /** Cambia cuando llegan filas: el centinela se vuelve a observar (puede seguir a la vista). */
  version: number;
  onMore: () => void;
  failedMessage: string;
}) {
  const t = useT();
  const sentinel = useRef<HTMLDivElement>(null);
  const onMoreRef = useRef(onMore);
  useEffect(() => {
    onMoreRef.current = onMore;
  });

  const watching = more && !busy && !failed;
  useEffect(() => {
    const el = sentinel.current;
    if (!watching || !el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onMoreRef.current();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watching, version]);

  if (!more) return null;
  if (failed) {
    return (
      <div role="alert" className="flex flex-col items-center py-6 text-center">
        <p className="text-small text-ink-soft">{failedMessage}</p>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex min-h-[44px] items-center px-4 text-body-bold font-bold text-mandarina-deep underline underline-offset-4"
        >
          {t("common:actions.retry")}
        </button>
      </div>
    );
  }
  return (
    <div>
      <div ref={sentinel} aria-hidden="true" className="h-px" />
      {busy ? (
        <SkeletonBlock className="py-4">
          <Bone height={14} width="40%" className="mx-auto" />
        </SkeletonBlock>
      ) : null}
    </div>
  );
}
