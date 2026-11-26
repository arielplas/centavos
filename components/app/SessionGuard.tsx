"use client";

// La guardia de sesión de §4.3. Dos componentes, uno por grupo de rutas:
//
//   <PrivateGuard>  (privada)/layout.tsx. Sin sesión → /app/entrar?next=<ruta actual>.
//   <AccessGuard>   (acceso)/layout.tsx.  Con sesión → el `next` válido o /app/pulso.
//
// Mientras se restaura la sesión muestran un esqueleto, NUNCA la pantalla de
// entrar (parpadearía). Tampoco se pinta la ruta protegida mientras se
// redirige: o esqueleto, o la página.
//
// Una cuenta nueva (`onboarded === false`) se manda a /app/bienvenida desde
// cualquier ruta privada (§5.8); bienvenida vive en (privada) pero fuera del
// AppShell, y no se redirige a sí misma.

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BootSkeleton } from "@/components/app/BootSkeleton";
import { useSession } from "@/components/app/SessionProvider";
import { entrarHref } from "@/lib/app/next-param";
import { afterLoginTarget, welcomeHref } from "@/lib/app/session";

const WELCOME_PATH = "/app/bienvenida";

export function PrivateGuard({ children }: { children: ReactNode }) {
  const { status, user, loggedOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const needsWelcome = status === "authenticated" && user?.onboarded === false && pathname !== WELCOME_PATH;

  useEffect(() => {
    // La ruta actual con su query: `usePathname` no la trae y la página es estática.
    const current = window.location.pathname + window.location.search;
    if (status === "anonymous") {
      // Si la persona cerró la sesión, no hay a dónde volver: a /app/entrar a secas.
      router.replace(loggedOut ? "/app/entrar" : entrarHref(current));
    } else if (needsWelcome) {
      router.replace(welcomeHref(current));
    }
  }, [status, loggedOut, needsWelcome, router]);

  if (status !== "authenticated" || needsWelcome) return <BootSkeleton />;
  return children;
}

export function AccessGuard({ children }: { children: ReactNode }) {
  const { status, user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace(afterLoginTarget(user, window.location.search));
  }, [status, user, router]);

  // Restaurando o ya con sesión (redirigiendo): esqueleto. Solo `anonymous` ve la pantalla.
  if (status !== "anonymous") return <BootSkeleton />;
  return children;
}
