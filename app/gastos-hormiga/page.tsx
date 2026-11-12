import type { Metadata } from "next";
import { GastosHormigaPage, gastosHormigaMetadata } from "@/components/gastos-hormiga/GastosHormigaPage";

// The gastos hormiga calculator in Spanish, the default language. English lives
// in `app/en/gastos-hormiga/page.tsx` and is served at `/gastos-hormiga?lang=en`
// by `proxy.ts`, the same arrangement as the landing.
export const metadata: Metadata = gastosHormigaMetadata("es");

export const revalidate = false; // Fully static page.

export default function GastosHormigaRoute() {
  return <GastosHormigaPage lang="es" />;
}
