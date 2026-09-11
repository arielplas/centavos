import type { Metadata } from "next";
import { CalcShell, calcH2, calcP, type FaqItem } from "@/components/calc/CalcShell";
import { FiniquitoCalculator } from "@/components/calc/FiniquitoCalculator";
import { pageOpenGraph } from "@/lib/seo";

const TITLE = "Calculadora de finiquito y liquidación 2026";
const DESCRIPTION =
  "Calcula tu finiquito o liquidación con el desglose por concepto y su artículo de ley. La diferencia entre finiquito y liquidación, prima de antigüedad y qué hacer si te despidieron.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/finiquito" },
  openGraph: pageOpenGraph({ title: `${TITLE} · Centavos`, description: DESCRIPTION, path: "/finiquito" }),
};

const FAQ: FaqItem[] = [
  {
    q: "¿Cuál es la diferencia entre finiquito y liquidación?",
    a: "El finiquito son las partes proporcionales que ya te ganaste (aguinaldo, vacaciones, prima vacacional) y se paga siempre que termina la relación laboral, incluso si renuncias. La liquidación es la indemnización que se suma solo cuando el despido es injustificado.",
  },
  {
    q: "¿Me toca liquidación si renuncio?",
    a: "No. Si renuncias solo te corresponde el finiquito. La liquidación (indemnización de 3 meses más 20 días por año) aplica cuando el despido es injustificado.",
  },
  {
    q: "¿Cuánto es la prima de antigüedad?",
    a: "Son 12 días de salario por cada año trabajado (art. 162 LFT), con el salario topado a dos veces el salario mínimo. Aplica en cualquier despido y también en la renuncia cuando llevas 15 años o más.",
  },
  {
    q: "¿Cuánto tiempo tiene la empresa para pagarme?",
    a: "La ley no fija un plazo exacto, pero debe pagarse al terminar la relación laboral. Si se retrasa injustificadamente, puedes reclamarlo ante el Centro de Conciliación Laboral.",
  },
  {
    q: "¿El finiquito paga impuestos?",
    a: "Algunas partes sí y otras están exentas hasta cierto límite de UMA. El aguinaldo y la prima vacacional proporcionales tienen las mismas exenciones que de costumbre; la indemnización tiene un tratamiento especial. Tu patrón calcula la retención.",
  },
  {
    q: "¿Qué pasa si firmo el finiquito y no estoy de acuerdo?",
    a: "Firmar no siempre te impide reclamar diferencias, pero complica el proceso. Antes de firmar algo que no te cuadra, acude a la PROFEDET, que es gratuita.",
  },
  {
    q: "¿Me toca finiquito si trabajé menos de un año?",
    a: "Sí. El finiquito se calcula de forma proporcional al tiempo trabajado, sin importar que no hayas cumplido el año.",
  },
];

export default function FiniquitoPage() {
  return (
    <CalcShell
      breadcrumb="Finiquito"
      h1={<>Calculadora de <span className="text-mandarina-deep">finiquito</span> y liquidación</>}
      intro="El desglose de lo que te corresponde, concepto por concepto y con su artículo de ley, según cómo terminó tu relación laboral."
      jsonLd={{ name: TITLE, description: DESCRIPTION, path: "/finiquito", idBase: "finiquito" }}
      faq={FAQ}
      cta={{
        hand: "mientras tanto",
        title: <>Ese dinero tiene<br />que durarte.</>,
        body: "Mientras encuentras la siguiente chamba, saber exactamente cuánto sale cada semana hace la diferencia. Centavos te deja anotar gastos en segundos y ver cuánto te queda.",
        note: "Gratis. Sin conectar tu banco, sin registro.",
      }}
      aviso="Esta calculadora es informativa y no constituye asesoría legal. El monto real depende de la causa de terminación, de las prestaciones de tu contrato y del criterio del centro de conciliación."
    >
      <FiniquitoCalculator />

      <div className="max-w-2xl mt-8">
        <div className="bg-sky/40 border border-rule rounded-2xl p-5 mb-10">
          <p className="text-[14px] leading-relaxed text-ink">
            <strong>¿Te despidieron?</strong> La{" "}
            <a href="https://www.gob.mx/profedet" target="_blank" rel="noopener noreferrer" className="text-mandarina-deep underline underline-offset-2 font-semibold">
              PROFEDET
            </a>
            <span className="sr-only"> (se abre en una pestaña nueva)</span> te asesora y representa gratis. Tienes 2
            meses para demandar el despido (art. 518 LFT), así que no lo dejes pasar.
          </p>
        </div>

        <h2 className={calcH2}>Finiquito no es lo mismo que liquidación</h2>
        <p className={calcP}>
          Es la confusión más común y la que más cara sale. El <strong>finiquito</strong> son las partes que ya te
          ganaste —aguinaldo, vacaciones y prima proporcionales— y te lo deben <em>siempre</em> que terminas, hasta si
          renuncias. La <strong>liquidación</strong> es la indemnización que se suma <em>solo</em> cuando el despido es
          injustificado. En pocas palabras: el finiquito siempre te lo deben; la liquidación solo si te corrieron sin
          razón.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Qué incluye el finiquito?</h2>
        <p className={calcP}>
          Aguinaldo proporcional (art. 87), vacaciones no gozadas (art. 76), prima vacacional sobre esos días (art. 80)
          y cualquier salario pendiente. Si llevas 15 años o más, también la prima de antigüedad.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cuándo me toca liquidación?</h2>
        <p className={calcP}>
          Cuando el despido es injustificado: 3 meses de salario más 20 días por año de servicio (art. 50), además de la
          prima de antigüedad y todo el finiquito. Si el despido fue justificado o renunciaste, no hay indemnización.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Qué es la prima de antigüedad?</h2>
        <p className={calcP}>
          12 días de salario por año trabajado (art. 162), con el salario base topado a dos veces el salario mínimo
          (art. 486). Por ese tope, en salarios altos la prima de antigüedad sale más baja de lo que uno esperaría.
        </p>
      </div>
    </CalcShell>
  );
}
