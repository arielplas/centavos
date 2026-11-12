import type { Metadata } from "next";
import { GastosHormigaPage, gastosHormigaMetadata } from "@/components/gastos-hormiga/GastosHormigaPage";

// The gastos hormiga calculator in English. Its public URL is
// `/gastos-hormiga?lang=en`: `proxy.ts` rewrites that here, and redirects a
// direct visit to `/en/gastos-hormiga` back to it. Keeping it as its own route
// (instead of reading `searchParams`) is what lets both languages stay static.
export const metadata: Metadata = gastosHormigaMetadata("en");

export const revalidate = false; // Fully static page.

export default function GastosHormigaRouteEn() {
  return <GastosHormigaPage lang="en" />;
}
