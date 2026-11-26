"use client";

// El marco de las pantallas de acceso: una tarjeta de vidrio centrada sobre el
// fondo del sitio. Sin la API configurada (`NEXT_PUBLIC_API_URL`) no hay nada
// que mostrar: `app.unavailable` en lugar de los formularios (§10).

import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/app/LanguageProvider";
import { API_CONFIGURED } from "@/lib/app/api";
import { titleClass } from "./styles";

export function AccessShell({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <main id="contenido" className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[460px] flex-col justify-center px-4 py-10">
      <div className="mb-6 flex justify-center">
        <Logo href={null} />
      </div>
      <div className="glass rounded-3xl p-6 sm:p-8">
        {API_CONFIGURED ? children : <h1 className={titleClass}>{t("app:unavailable")}</h1>}
      </div>
    </main>
  );
}
