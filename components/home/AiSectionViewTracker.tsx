"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";

/**
 * Fires `ai_section_viewed` once, when the section that contains it is at least
 * 35% on screen. Renders nothing. The only property is the page language: no
 * personal data.
 */
export function AiSectionViewTracker({ lang }: { lang: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        track("ai_section_viewed", { lang });
      },
      { threshold: 0.35 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [lang]);

  return <span ref={ref} hidden />;
}
