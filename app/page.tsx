import type { Metadata } from "next";
import { HomePage, homeMetadata } from "@/components/home/HomePage";

// The landing in Spanish, the default language. English lives in
// `app/en/page.tsx` and is served at `/?lang=en` by `proxy.ts`.
export const metadata: Metadata = homeMetadata("es");

export const revalidate = false; // Fully static page.

export default function AppPage() {
  return <HomePage lang="es" />;
}
