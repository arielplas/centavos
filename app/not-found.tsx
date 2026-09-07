import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { AppStoreBadges } from "@/components/home/AppStoreBadges";
import { getAppLinks } from "@/lib/store-links";

// Next.js ya agrega <meta name="robots" content="noindex"> en not-found.
export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  const { storeUrl, playUrl } = getAppLinks();

  return (
    <>
      <Header />
      <main id="contenido" className="min-h-[70dvh] grid place-items-center px-6 py-16">
        <div className="text-center max-w-md">
          <div className="font-hand text-mandarina-deep text-3xl mb-2">¡Aguas!</div>
          <h1 className="font-display text-5xl font-extrabold tracking-[-0.04em] leading-[0.95] mb-4">
            Esta página<br />
            <span className="italic text-mandarina-deep">no existe</span>.
          </h1>
          <p className="text-ink-soft mb-8 leading-relaxed">
            Pero la app sí. Descárgala gratis y empieza a anotar tus gastos hoy.
          </p>
          <div className="flex justify-center">
            <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} className="justify-center" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-semibold">
            <Link href="/" className="text-ink underline underline-offset-4 py-2">Volver al inicio</Link>
            <Link href="/app/soporte" className="text-ink-soft hover:text-ink underline underline-offset-4 py-2">¿Buscabas soporte?</Link>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
