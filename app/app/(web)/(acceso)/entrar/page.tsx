import type { Metadata } from "next";
import { EntrarScreen } from "@/components/app/screens/EntrarScreen";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <EntrarScreen />;
}
