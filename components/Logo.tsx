import type { MouseEventHandler } from "react";
import Link from "next/link";

export function Logo({
  size = 26,
  color = "var(--color-ink)",
  dotColor = "var(--color-mandarina)",
  href = "/" as string | null,
  label = "Centavos · Inicio",
  onClick,
}: {
  size?: number;
  color?: string;
  dotColor?: string;
  href?: string | null;
  /** Accessible name of the link. */
  label?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2 select-none">
      <span
        aria-hidden
        data-coin
        className="relative inline-block rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)]"
        style={{ width: size, height: size, background: dotColor }}
      >
        <span
          className="absolute top-1/2 left-1/2 rounded-[1.5px]"
          style={{
            width: size * 0.42,
            height: 2.5,
            background: color,
            transform: "translate(-50%, -50%) rotate(-12deg)",
          }}
        />
      </span>
      <span
        className="font-display font-extrabold leading-none tracking-[-0.03em]"
        style={{ color, fontSize: size * 0.84 }}
      >
        centavos
      </span>
    </span>
  );
  if (!href) return inner;
  return <Link href={href} aria-label={label} onClick={onClick}>{inner}</Link>;
}
