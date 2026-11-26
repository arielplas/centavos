import type { Metadata } from "next";
import { PresupuestoDetalleScreen } from "@/components/app/screens/PresupuestoDetalleScreen";

export const metadata: Metadata = {
  title: "Presupuesto",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// `?mes=AAAA-M`: el mes que se veía en la lista. Solo es una preferencia de vista; la pantalla
// lo valida contra sus meses y el bloqueo de Centavos+, así que aquí solo se toma si tiene forma.
export default async function Page({ searchParams }: PageProps) {
  const raw = (await searchParams).mes;
  const mes = typeof raw === "string" && /^\d{4}-(?:[1-9]|1[0-2])$/.test(raw) ? raw : undefined;
  return <PresupuestoDetalleScreen initialMonthKey={mes} />;
}
