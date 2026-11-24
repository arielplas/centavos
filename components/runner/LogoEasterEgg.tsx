"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/Logo";
import type { SiteLang } from "@/lib/lang";

// The game only downloads once someone starts tapping the logo.
const loadGame = () => import("./RunnerGame");
const RunnerGame = dynamic(loadGame, { ssr: false });

/** Taps must land within this window of each other to count toward three. */
const TAP_WINDOW_MS = 600;

/**
 * The landing's navbar logo with a secret: three quick taps open "Corre,
 * centavo". Taps one and two wiggle the coin; the third spins it and the game
 * grows out of it. On the landing the logo links to the page itself, so a
 * single tap still does what it did before: scroll back to the top.
 */
export function LogoEasterEgg({
  size,
  href,
  label,
  lang,
}: {
  size: number;
  href: string;
  label: string;
  lang: SiteLang;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const taps = useRef({ count: 0, last: 0 });
  /** True from the third tap until the game closes: extra clicks are ignored. */
  const openRef = useRef(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  const onClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Modified clicks (new tab, etc.) keep working as a normal link.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (openRef.current) return;

      const now = performance.now();
      const tap = taps.current;
      tap.count = now - tap.last < TAP_WINDOW_MS ? tap.count + 1 : 1;
      tap.last = now;

      const coin = wrapRef.current?.querySelector<HTMLElement>("[data-coin]");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (tap.count < 3) {
        if (tap.count === 1) {
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          void loadGame(); // warm the chunk
        }
        if (!reduce) {
          const dir = tap.count === 1 ? -1 : 1;
          coin?.animate(
            [
              { transform: "none" },
              { transform: `translateY(-3px) rotate(${dir * 14}deg) scale(1.08)` },
              { transform: "none" },
            ],
            { duration: 160 + tap.count * 40, easing: "cubic-bezier(.22, 1, .36, 1)" },
          );
        }
        return;
      }

      tap.count = 0;
      openRef.current = true;
      const rect = coin?.getBoundingClientRect();
      const point = rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: e.clientX, y: e.clientY };
      if (reduce || !coin) {
        setOrigin(point);
        return;
      }
      coin
        .animate(
          [
            { transform: "none", filter: "none" },
            { transform: "rotate(200deg) scale(1.5)", filter: "drop-shadow(0 0 6px rgb(245 184 51 / .9))", offset: 0.6 },
            { transform: "rotate(360deg) scale(1)", filter: "none" },
          ],
          { duration: 420, easing: "cubic-bezier(.22, 1, .36, 1)" },
        )
        .finished.catch(() => {});
      // Open as the spin peaks, so the burst comes out of the coin.
      window.setTimeout(() => setOrigin(point), 240);
    },
    [],
  );

  const close = useCallback(() => {
    openRef.current = false;
    setOrigin(null);
    wrapRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, []);

  return (
    <span ref={wrapRef} className="inline-flex">
      <Logo size={size} href={href} label={label} onClick={onClick} />
      {/* Portaled: the header's backdrop-filter would trap a fixed overlay. */}
      {origin && createPortal(<RunnerGame lang={lang} origin={origin} onClose={close} />, document.body)}
    </span>
  );
}
