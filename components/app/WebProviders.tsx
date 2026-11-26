"use client";

// Los proveedores de toda la app web (`app/app/(web)/layout.tsx`): la sesión y,
// dentro de ella, el idioma, que necesita `user.language` (§9.1, fuente 3).

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/app/LanguageProvider";
import { SessionProvider, useSession } from "@/components/app/SessionProvider";

function SessionLanguage({ children }: { children: ReactNode }) {
  const { user } = useSession();
  return <LanguageProvider userLanguage={user?.language}>{children}</LanguageProvider>;
}

export function WebProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionLanguage>{children}</SessionLanguage>
    </SessionProvider>
  );
}
