import type { Metadata } from "next";
import { CalcShell, calcH2, calcP, type FaqItem } from "@/components/calc/CalcShell";
import { VacacionesCalculator } from "@/components/calc/VacacionesCalculator";
import { pageOpenGraph } from "@/lib/seo";

const TITLE = "Calculadora de vacaciones y prima vacacional 2026";
const DESCRIPTION =
  "Cuántos días de vacaciones te tocan según tu antigüedad (Vacaciones Dignas) y cuánto es tu prima vacacional. Tabla completa del artículo 76 de la LFT.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vacaciones" },
  openGraph: pageOpenGraph({ title: `${TITLE} · Centavos`, description: DESCRIPTION, path: "/vacaciones" }),
};

const TABLA: { anios: string; dias: number }[] = [
  { anios: "1 año", dias: 12 },
  { anios: "2 años", dias: 14 },
  { anios: "3 años", dias: 16 },
  { anios: "4 años", dias: 18 },
  { anios: "5 años", dias: 20 },
  { anios: "6 a 10 años", dias: 22 },
  { anios: "11 a 15 años", dias: 24 },
  { anios: "16 a 20 años", dias: 26 },
  { anios: "21 a 25 años", dias: 28 },
  { anios: "26 a 30 años", dias: 30 },
];

const FAQ: FaqItem[] = [
  {
    q: "¿Cuántos días de vacaciones me tocan al primer año?",
    a: "Desde la reforma de Vacaciones Dignas (vigente en 2023), al cumplir el primer año te corresponden 12 días de vacaciones, no 6 como marcaba la ley anterior.",
  },
  {
    q: "¿Qué es la prima vacacional y cuánto es?",
    a: "Es un pago adicional de al menos 25% sobre los salarios de tus días de vacaciones (art. 80 LFT). Es dinero extra a tu sueldo, no el pago de las vacaciones en sí.",
  },
  {
    q: "¿Puedo cobrar mis vacaciones en lugar de tomarlas?",
    a: "No. Las vacaciones deben disfrutarse; la ley prohíbe cambiarlas por dinero mientras dura la relación laboral (art. 79 LFT). Solo se pagan en efectivo los días no gozados cuando termina el empleo.",
  },
  {
    q: "¿Cuánto tiempo tengo para tomar mis vacaciones?",
    a: "Deben otorgarse dentro de los seis meses siguientes al cumplimiento del año de servicio (art. 81 LFT).",
  },
  {
    q: "¿Las vacaciones se acumulan de un año a otro?",
    a: "El derecho a reclamar vacaciones prescribe al año (art. 516 LFT). En la práctica conviene tomarlas o exigirlas dentro de ese plazo para no perderlas.",
  },
  {
    q: "¿La prima vacacional paga impuestos?",
    a: "La prima vacacional está exenta de ISR hasta 15 días de UMA (art. 93-XIV LISR); lo que exceda paga impuesto.",
  },
];

export default function VacacionesPage() {
  return (
    <CalcShell
      breadcrumb="Vacaciones"
      h1={<>Calculadora de <span className="text-mandarina-deep">vacaciones</span> y prima</>}
      intro="Cuántos días te tocan según tu antigüedad con la tabla vigente de Vacaciones Dignas, y cuánto es tu prima vacacional."
      jsonLd={{ name: TITLE, description: DESCRIPTION, path: "/vacaciones", idBase: "vacaciones" }}
      faq={FAQ}
      cta={{
        hand: "para tus días libres",
        title: <>Que el viaje no<br />te salga caro.</>,
        body: "La prima vacacional suele irse en el viaje mismo. En Centavos armas un presupuesto de viaje, anotas lo que gastas y regresas sabiendo cuánto costó de verdad.",
        note: "Funciona sin internet — útil justo cuando andas de viaje.",
      }}
      aviso="Esta calculadora es informativa. Los días y la prima pueden ser mayores si tu contrato o contrato colectivo otorgan prestaciones superiores a las de la ley."
    >
      <VacacionesCalculator />

      <div className="max-w-2xl mt-12">
        <h2 className={calcH2}>¿Cuántos días me tocan?</h2>
        <p className={calcP}>
          Los días crecen con tu antigüedad, según el artículo 76 de la LFT. Esta es la tabla vigente:
        </p>
        <div className="overflow-x-auto -mx-1 mb-4">
          <table className="w-full text-[14px] border border-rule rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-surface text-left">
                <th className="px-4 py-2.5 font-bold text-ink">Antigüedad</th>
                <th className="px-4 py-2.5 font-bold text-ink text-right">Días de vacaciones</th>
              </tr>
            </thead>
            <tbody>
              {TABLA.map((r, i) => (
                <tr key={r.anios} className={i % 2 ? "bg-surface/50" : ""}>
                  <td className="px-4 py-2.5 text-ink border-t border-rule">{r.anios}</td>
                  <td className="px-4 py-2.5 text-ink font-bold text-right border-t border-rule tabular-nums">{r.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={calcP}>
          A partir del año 31, se suman 2 días por cada quinquenio adicional.
        </p>

        <h2 className={`${calcH2} mt-12`}>Qué cambió con Vacaciones Dignas</h2>
        <p className={calcP}>
          La reforma vigente desde el 1 de enero de 2023 subió el primer año de 6 a 12 días y rediseñó toda la tabla.
          Mucho contenido en internet sigue publicando la tabla vieja: si viste 6 días por ahí, está desactualizado.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Qué es la prima vacacional?</h2>
        <p className={calcP}>
          Es un pago adicional de mínimo 25% sobre el salario de tus días de vacaciones (art. 80 LFT). No es el pago de
          las vacaciones: es un extra encima de tu sueldo normal, pensado para que puedas disfrutarlas.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Me las pueden pagar en vez de dármelas?</h2>
        <p className={calcP}>
          No mientras sigas trabajando (art. 79 LFT): las vacaciones se disfrutan. Solo al terminar la relación laboral
          se pagan en dinero los días que no alcanzaste a tomar, y eso entra en tu{" "}
          <a href="/finiquito" className="text-mandarina-deep underline underline-offset-2 font-semibold">
            finiquito
          </a>
          .
        </p>
      </div>
    </CalcShell>
  );
}
