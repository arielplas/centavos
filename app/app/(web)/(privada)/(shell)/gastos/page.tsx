import type { Metadata } from "next";
import { GastosScreen } from "@/components/app/screens/GastosScreen";

export const metadata: Metadata = {
  title: "Gastos",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <GastosScreen />;
}
