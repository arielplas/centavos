import type { Metadata } from "next";
import { PulsoScreen } from "@/components/app/screens/PulsoScreen";

export const metadata: Metadata = {
  title: "Pulso",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PulsoScreen />;
}
