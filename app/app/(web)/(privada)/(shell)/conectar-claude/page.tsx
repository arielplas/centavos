import type { Metadata } from "next";
import { ConectarClaudeScreen } from "@/components/app/screens/ConectarClaudeScreen";

export const metadata: Metadata = {
  title: "Conectar con Claude",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ConectarClaudeScreen />;
}
