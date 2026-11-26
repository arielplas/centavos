import type { Metadata } from "next";
import { RecuperarScreen } from "@/components/app/screens/RecuperarScreen";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RecuperarScreen />;
}
