"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Copies the connector address. The label flips to "Copied" for a moment, and a
 * polite live region says so to screen readers. The label only flips when the
 * browser actually accepted the write: the address is also selectable text.
 */
export function CopyUrlButton({
  value,
  label,
  doneLabel,
  announce,
  ariaLabel,
}: {
  value: string;
  label: string;
  doneLabel: string;
  announce: string;
  ariaLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={ariaLabel}
        className="flex-none min-h-11 min-w-[5.5rem] rounded-[10px] bg-ink px-3.5 text-[13px] font-extrabold text-bg hover:opacity-85"
      >
        {copied ? doneLabel : label}
      </button>
      <span role="status" className="sr-only">
        {copied ? announce : ""}
      </span>
    </>
  );
}
