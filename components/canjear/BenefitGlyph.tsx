// The leading mark on a Centavos+ benefit row, with the same rule the app's
// paywall uses (centavos-app: src/components/ui/BenefitGlyph.tsx).
//
// Three sources, in order: the illustration the backend sends for the benefit
// (`imageUrl`), the drawn icon for its key, and a generic Plus badge for a
// benefit nobody has drawn yet. The emoji the API also sends is deliberately
// NOT one of them: an emoji carries its own colour and optical size, so it
// never sits at the weight of a drawn icon next to it.

import {
  GLYPHS,
  ICON_STROKE_ATTRS,
  ICON_STROKE_WIDTH,
  ICON_VIEWBOX,
  benefitIconName,
} from "@cntvos/icons";

// The key → icon mapping, the path data and the drawing contract (viewBox,
// stroke width, caps and joins) all come from @cntvos/icons, the same package
// the app draws from. Don't copy entries in here: update the vendored tarball
// (see vendor/README.md) and the new art arrives with it.
//
// The icon name comes from benefitIconName(), which already falls back to the
// generic Plus badge for a key nobody has drawn yet.

type Props = {
  /** The benefit's server key, which picks the icon. */
  benefitKey: string;
  /** Illustration from the backend; preferred over the icon when present. */
  imageUrl?: string | null;
  /** Box size in px: the icon and the image both fill it. */
  size?: number;
};

export function BenefitGlyph({ benefitKey, imageUrl, size = 20 }: Props) {
  // Decorative either way: the benefit's title sits right next to it.
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote, operator-uploaded, 20px
      <img src={imageUrl} alt="" aria-hidden width={size} height={size} className="object-contain" />
    );
  }
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={ICON_VIEWBOX}
      {...ICON_STROKE_ATTRS}
      stroke="currentColor"
      strokeWidth={ICON_STROKE_WIDTH}
    >
      <path d={GLYPHS[benefitIconName(benefitKey)]} />
    </svg>
  );
}
