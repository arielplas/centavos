import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Footer del sitio: logo + lema + enlaces de soporte y legales.
 */
export function AppFooter({ className = "" }: { className?: string }) {
  const cols = [
    { h: "Calculadoras", items: [
      { name: "Aguinaldo",           href: "/aguinaldo" },
      { name: "Finiquito",           href: "/finiquito" },
      { name: "Vacaciones",          href: "/vacaciones" },
      { name: "Meses sin intereses", href: "/meses-sin-intereses" },
      { name: "PTU",                 href: "/ptu" },
      { name: "CETES",               href: "/cetes" },
    ]},
    { h: "Soporte", items: [
      { name: "Soporte y contacto", href: "/app/soporte" },
      { name: "Eliminar cuenta",    href: "/app/eliminar-cuenta" },
    ]},
    { h: "Legal", items: [
      { name: "Términos y Condiciones", href: "/app/terminos" },
      { name: "Aviso de Privacidad",    href: "/app/privacidad" },
    ]},
  ];

  return (
    <footer className={`bg-ink text-bg ${className}`}>
      <div className="mx-auto max-w-screen-lg px-5 py-10 md:py-14">
        <Logo size={30} color="var(--color-bg)" dotColor="var(--color-mandarina)" />
        <p className="font-hand text-mandarina text-2xl mt-4 mb-2">
          Le ayudamos a la gente a perderle el miedo a las finanzas.
        </p>

        <nav aria-label="Pie de página" className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
          {cols.map((col) => (
            <div key={col.h}>
              <div className="text-[11px] font-extrabold tracking-[0.06em] text-mandarina uppercase mb-2">
                {col.h}
              </div>
              <ul>
                {col.items.map((it) => (
                  <li key={it.name}>
                    <Link href={it.href} className="block py-2 text-[13px] text-bg/75 hover:text-bg">
                      {it.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-5 border-t border-bg/10 text-[11px] text-bg/60 tracking-wide flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} Centavos · Hecho en México 🇲🇽</span>
        </div>
      </div>
    </footer>
  );
}
