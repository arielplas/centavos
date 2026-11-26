import type { Metadata } from "next";
import { SuscripcionesScreen } from "@/components/app/screens/SuscripcionesScreen";

export const metadata: Metadata = {
  title: "Suscripciones",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SuscripcionesScreen />;
}
