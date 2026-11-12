import type { Metadata } from "next";
import { HomePage, homeMetadata } from "@/components/home/HomePage";

// The landing in English. Its public URL is `/?lang=en`: `proxy.ts` rewrites
// that here, and redirects a direct visit to `/en` back to it. Keeping it as
// its own route (instead of reading `searchParams` in `app/page.tsx`) is what
// lets both languages stay fully static.
export const metadata: Metadata = homeMetadata("en");

export const revalidate = false; // Fully static page.

export default function AppPageEn() {
  return <HomePage lang="en" />;
}
