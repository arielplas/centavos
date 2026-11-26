"use client";

// Diálogo de confirmación sobre `<dialog>` modal: el navegador atrapa el foco,
// cierra con Escape y lo devuelve a quien lo abrió. Sin DOM propio que mantener.

import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-cv-pill px-5 text-[15px] font-bold disabled:opacity-60";

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      // Escape: se avisa al padre, que es quien cierra (`open` manda).
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      // Un clic en el fondo (el propio <dialog>, no su contenido) cancela.
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel();
      }}
      className="glass glass-strong m-auto w-[calc(100%-32px)] max-w-[420px] rounded-cv-2xl p-6 text-ink backdrop:bg-overlay"
    >
      <h2 id={titleId} className="font-display text-xl font-extrabold tracking-[-0.02em]">
        {title}
      </h2>
      <p id={bodyId} className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        {body}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={busy} className={`${BUTTON} border border-rule-strong text-ink`}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={`${BUTTON} bg-ink text-bg`}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
