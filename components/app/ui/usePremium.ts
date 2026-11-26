"use client";

import { useSession } from "@/components/app/SessionProvider";

/**
 * ¿La cuenta tiene Centavos+? Solo `plan === "premium"` (el servidor ya cuenta la
 * gracia y lo cancelado hasta que vence). `plan` llega con `GET /me`, no en las
 * respuestas de `/auth/*`: mientras no llega, `known` es `false` y `isPremium`
 * `false` (los candados se quedan puestos; nada se abre de más). Lo que se
 * enseña a una cuenta gratis nunca lleva a un paywall en la web (§4.6).
 */
export function usePremium(): { isPremium: boolean; known: boolean } {
  const { user } = useSession();
  return { isPremium: user?.plan === "premium", known: user?.plan !== undefined };
}
