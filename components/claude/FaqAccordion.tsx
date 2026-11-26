"use client";

import { useId, useState } from "react";

/**
 * Accordion of real buttons with `aria-expanded`, one answer open at a time
 * (the first one starts open, as in the design). Closed answers stay in the
 * HTML, only `hidden`, so crawlers and the FAQPage markup see the same text.
 */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  const base = useId();

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const isOpen = open === i;
        const panel = `${base}-panel-${i}`;
        return (
          <div key={it.q} className="glass rounded-[20px]">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full min-h-[60px] items-center justify-between gap-4 rounded-[20px] px-5 py-3.5 text-left text-[16px] md:text-[17px] font-extrabold text-ink"
              >
                {it.q}
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`flex-none text-ink-soft transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <p id={panel} hidden={!isOpen} className="px-5 pb-[18px] text-[15px] leading-[1.65] text-ink-soft">
              {it.a}
            </p>
          </div>
        );
      })}
    </div>
  );
}
