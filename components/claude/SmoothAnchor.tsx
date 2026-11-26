"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * A link to a section of this same page (`#como`, `#ejemplos`) that scrolls there smoothly.
 * Scoped to these links rather than `scroll-behavior: smooth` on <html>, which would also animate
 * every other anchor jump and route change on the site.
 *
 * Without JavaScript it is a plain anchor, so it still works. With JavaScript:
 * - it scrolls with `scrollIntoView`, smoothly unless the person asked for reduced motion;
 * - the target's `scroll-mt-*` keeps its heading clear of the sticky header;
 * - the hash goes in the URL (pushState: Back returns to where they were, as a native jump does);
 * - focus moves to the section, so keyboard and screen-reader users continue from there.
 */
export function SmoothAnchor({ href, className, children }: { href: `#${string}`; className?: string; children: ReactNode }) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (window.location.hash !== href) window.history.pushState(null, "", href);

    // Focus without a second jump; the section isn't focusable on its own.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
