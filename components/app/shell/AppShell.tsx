"use client";

// El AppShell (docs/app-web.md §4.4): la navegación de las pantallas privadas.
//
//   escritorio (≥ 768 px): barra superior de vidrio con el logo, las cuatro pestañas
//     (ícono + nombre; la activa en píldora tinta con texto crema), una entrada discreta
//     a Conectar con Claude y el avatar que lleva a /app/perfil.
//   teléfono: barra inferior de vidrio flotante, solo íconos (cada uno con aria-label).
//     Sin el botón «Anotar»: la web es de solo lectura. El avatar vive en el encabezado
//     del Pulso (<AccountAvatar>), como el AccountMenu de la app.
//
// El shell NO envuelve a la pantalla en un <main>: cada pantalla dibuja el suyo con
// `id="contenido"`, y el enlace «Saltar al contenido» apunta ahí. Deja el espacio de
// la barra inferior (I-4) para que no tape contenido.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/app/LanguageProvider";
import { Icon } from "@/components/app/ui/Icon";
import { AccountAvatar } from "./AccountAvatar";
import { CLAUDE_HREF, PERFIL_HREF, TABS, activeTab, isUnder } from "./nav";

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const active = activeTab(pathname);

  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        {t("app:skipToContent")}
      </a>

      {/* Escritorio */}
      <header className="glass glass-strong sticky top-0 z-40 hidden rounded-none border-x-0 border-t-0 md:block">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center gap-6 px-6">
          <Logo size={24} href="/app/pulso" label="Centavos" />
          <nav aria-label={t("app:nav.label")} className="flex flex-1 items-center gap-1">
            {TABS.map((tab) => {
              const current = tab.id === active;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={current ? "page" : undefined}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-body-bold font-bold ${
                    current ? "bg-ink text-bg" : "text-ink-soft hover:bg-sand/60 hover:text-ink"
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  {t(tab.label)}
                </Link>
              );
            })}
          </nav>
          <Link
            href={CLAUDE_HREF}
            aria-label={t("settings:rows.connectClaude")}
            aria-current={isUnder(pathname, CLAUDE_HREF) ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3 text-small font-bold hover:bg-sand/60 ${
              isUnder(pathname, CLAUDE_HREF) ? "text-ink underline underline-offset-4" : "text-ink-soft"
            }`}
          >
            {t("app:nav.connectClaude")}
          </Link>
          <AccountAvatar current={isUnder(pathname, PERFIL_HREF)} />
        </div>
      </header>

      {/* El espacio de abajo es el de la barra flotante del teléfono (≈ 64 px + el margen). */}
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10">{children}</div>

      {/* Teléfono */}
      <nav
        aria-label={t("app:nav.label")}
        className="glass glass-strong fixed inset-x-4 z-40 mx-auto flex max-w-[420px] items-center justify-around rounded-full p-1.5 md:hidden"
        style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        {TABS.map((tab) => {
          const current = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-label={t(tab.label)}
              aria-current={current ? "page" : undefined}
              className={`inline-flex h-12 w-14 items-center justify-center rounded-full ${current ? "bg-sand text-ink" : "text-ink-mute"}`}
            >
              <Icon name={tab.icon} size={26} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
