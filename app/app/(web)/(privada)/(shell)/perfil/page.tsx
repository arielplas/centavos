import type { Metadata } from "next";
import { PerfilScreen } from "@/components/app/screens/PerfilScreen";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PerfilScreen />;
}
