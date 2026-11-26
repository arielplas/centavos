import type { Metadata } from "next";
import { BienvenidaScreen } from "@/components/app/screens/BienvenidaScreen";

export const metadata: Metadata = {
  title: "Bienvenida",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BienvenidaScreen />;
}
