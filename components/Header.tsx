import Link from "next/link";
import { Logo } from "./Logo";

/**
 * Header único del sitio (home, soporte, legales): logo, link a Soporte y CTA
 * de descarga que lleva a la sección #descargar de la home.
 *
 * - En desktop es sticky y siempre muestra el CTA.
 * - En móvil no es sticky (en una página de varias pantallas, una barra fija
 *   solo con logo roba viewport). El CTA móvil se muestra salvo que la página
 *   ya tenga su propia barra inferior de descarga (`mobileCta={false}`).
 */
export function Header({ mobileCta = true }: { mobileCta?: boolean }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:text-bg focus:rounded-full focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold"
      >
        Saltar al contenido
      </a>
      <header className="md:sticky top-0 z-30 bg-bg/95 backdrop-blur-sm border-b border-rule/70">
        <div className="mx-auto max-w-screen-lg flex items-center justify-between px-5 py-3">
          <Logo size={26} />
          <nav aria-label="Principal" className="flex items-center gap-2 sm:gap-4 text-[13px] font-semibold">
            <Link href="/app/soporte" className="text-ink-soft hover:text-ink px-2 py-2.5">
              Soporte
            </Link>
            <Link
              href="/#descargar"
              className={`${mobileCta ? "inline-flex" : "hidden md:inline-flex"} items-center whitespace-nowrap bg-ink text-bg rounded-full px-4 py-2 hover:opacity-85`}
            >
              <span className="md:hidden">Descargar</span>
              <span className="hidden md:inline">Descargar gratis</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
