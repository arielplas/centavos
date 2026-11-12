// The leading mark on a Centavos+ benefit row, with the same rule the app's
// paywall uses (centavos-app: src/components/ui/BenefitGlyph.tsx).
//
// Three sources, in order: the illustration the backend sends for the benefit
// (`imageUrl`), the drawn icon for its key, and a generic Plus badge for a
// benefit nobody has drawn yet. The emoji the API also sends is deliberately
// NOT one of them: an emoji carries its own colour and optical size, so it
// never sits at the weight of a drawn icon next to it.

// Benefit key → icon, as in the app. The key is the server's stable id.
const ICON_BY_KEY: Record<string, keyof typeof PATHS> = {
  no_ads: "plus-no-ads",
  expense_images: "plus-photos",
  more_budgets: "tab-presupuestos",
  shared_budgets: "tab-amigos",
  themes: "plus-themes",
  history_year: "plus-history",
  more_months: "plus-months",
  export_data: "plus-export",
};

// Path data copied verbatim from the app's icon set
// (centavos-app: src/components/ui/icons/glyphs.generated.tsx). Drawn on a 24
// grid, stroke only. Updating the art means copying the entries across again.
const PATHS = {
  "badge-plus":
    "M3 13a8 8 0 1 0 16 0a8 8 0 1 0-16 0M13.7 10.75a3.5 3.5 0 1 0 0 4.5M12.3 7.5 9.7 18.5M19.5 2.5v4M17.5 4.5h4",
  "plus-themes":
    "M12 3a9 9 0 0 0 0 18c1.1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5C21 6.6 17 3 12 3zM7.5 12h.01M9 7.75h.01M14 7h.01M17 10.5h.01",
  "plus-photos":
    "M20 11.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7M4 16.5l4.5-4.5 4 4M15 8.5h.01M18 14.5v6M15 17.5h6",
  "plus-no-ads":
    "M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1zM17.5 9.5a3.5 3.5 0 0 1 0 5M20.5 3.5 3.5 20.5",
  "plus-history":
    "M8.5 14.5a6 6 0 1 0 12 0a6 6 0 1 0-12 0M14.5 11.5v3l2 1.2M5.5 3.5 3 6l2.5 2.5M9 3.5 6.5 6 9 8.5",
  "plus-months":
    "M5 7.5h10a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2zM3 11.5h14M7 6v3M13 6v3M9 4.5h9.5a2 2 0 0 1 2 2V17",
  "plus-export":
    "M16 10V8l-5-5H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1M11 3v5h5M10 14h11M18 11l3 3-3 3",
  "tab-presupuestos": "M6 8h12l-1 11.5H7zM9.5 8V6.5a2.5 2.5 0 0 1 5 0V8M9.5 14h3M15 14h.01",
  "tab-amigos":
    "M6 8a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 5.2a3 3 0 0 1 0 5.6M17 14.8c2 .6 3.5 2.4 3.5 4.7",
} as const;

/** What a benefit with no image and no icon of its own gets. */
const FALLBACK_ICON = "badge-plus";

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
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[ICON_BY_KEY[benefitKey] ?? FALLBACK_ICON]} />
    </svg>
  );
}
