import type { Metadata } from "next";
import { PresupuestosScreen } from "@/components/app/screens/PresupuestosScreen";

export const metadata: Metadata = {
  title: "Presupuestos",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PresupuestosScreen />;
}
