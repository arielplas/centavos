import type { Metadata } from "next";
import { CrearCuentaScreen } from "@/components/app/screens/CrearCuentaScreen";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CrearCuentaScreen />;
}
