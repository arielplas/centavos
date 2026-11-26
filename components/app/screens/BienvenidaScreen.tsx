"use client";

// /app/bienvenida: el wizard de una cuenta nueva (docs/app-web.md §5.8, D6).
// Sin AppShell: vive directamente bajo (privada)/. La guardia ya mandó aquí a
// quien tiene `onboarded === false`; el wizard está en components/app/onboarding/.

import { Wizard } from "@/components/app/onboarding/Wizard";

export function BienvenidaScreen() {
  return <Wizard />;
}
