import type { Metadata } from "next";
import { PresupuestoDetalleScreen } from "@/components/app/screens/PresupuestoDetalleScreen";

export const metadata: Metadata = {
  title: "Presupuesto",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PresupuestoDetalleScreen />;
}
