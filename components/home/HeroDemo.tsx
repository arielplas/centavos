"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps the hero phone and its note. Sets `data-play` once the phone is mostly
 * in view, which releases the CSS animations of the one-shot demo ("Demo del
 * hero" in globals.css). Plays once: the observer disconnects after firing.
 */
export function HeroDemo({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-play", "");
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`demo ${className}`}>
      {/* Without JS nothing sets data-play: skip the animations so the final state shows. */}
      <noscript>
        <style>{".demo [data-a]{animation:none!important}"}</style>
      </noscript>
      {children}
    </div>
  );
}
