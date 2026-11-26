import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/components/app/LanguageProvider";
import { WEB_APP_ENABLED } from "@/lib/config";

// Toda la app web es privada: ni indexa ni va en el sitemap (§4.2, I-5).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WebAppLayout({ children }: { children: React.ReactNode }) {
  // Con la bandera apagada, ninguna ruta de la app web existe (A-1).
  if (!WEB_APP_ENABLED) notFound();
  return <LanguageProvider>{children}</LanguageProvider>;
}
