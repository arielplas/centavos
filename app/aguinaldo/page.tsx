import type { Metadata } from "next";
import { CalcShell, calcH2, calcP, type FaqItem } from "@/components/calc/CalcShell";
import { AguinaldoCalculator } from "@/components/calc/AguinaldoCalculator";
import { pageOpenGraph } from "@/lib/seo";

const TITLE = "Calculadora de aguinaldo 2026";
const DESCRIPTION =
  "Calcula cuánto aguinaldo te toca según tu sueldo y los días que trabajaste en el año. Cuándo se paga, cuántos días marca la ley y qué hacer si no te lo pagan.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/aguinaldo" },
  openGraph: pageOpenGraph({ title: `${TITLE} · Centavos`, description: DESCRIPTION, path: "/aguinaldo" }),
};

const FAQ: FaqItem[] = [
  {
    q: "¿Cuándo se paga el aguinaldo en México?",
    a: "El aguinaldo debe pagarse antes del 20 de diciembre de cada año, según el artículo 87 de la Ley Federal del Trabajo. No hay excepción a esa fecha.",
  },
  {
    q: "¿Cuántos días de aguinaldo marca la ley?",
    a: "El mínimo legal es 15 días de salario. Algunas empresas dan más (20, 30 días o un mes completo) como prestación superior, pero la ley solo exige 15.",
  },
  {
    q: "¿Me toca aguinaldo si llevo menos de un año?",
    a: "Sí. Si no cumpliste el año completo, te corresponde la parte proporcional al tiempo que hayas trabajado, sin importar cuánto haya sido (art. 87 LFT).",
  },
  {
    q: "¿Me toca aguinaldo si renuncié?",
    a: "Sí. Si dejaste el trabajo durante el año, tienes derecho al aguinaldo proporcional al tiempo trabajado, y se paga junto con tu finiquito.",
  },
  {
    q: "¿El aguinaldo paga impuestos?",
    a: "Los primeros 30 días de UMA de tu aguinaldo están exentos de ISR (art. 93 fracción XIV de la Ley del ISR). Lo que exceda ese monto sí paga impuesto, y tu empresa lo retiene.",
  },
  {
    q: "¿Los trabajadores por honorarios tienen aguinaldo?",
    a: "El aguinaldo es un derecho de quienes tienen una relación laboral subordinada. Quienes prestan servicios por honorarios de forma independiente no tienen derecho a aguinaldo, aunque una relación disfrazada de honorarios sí podría reclamarlo ante la autoridad laboral.",
  },
  {
    q: "¿Qué hago si mi empresa no me paga el aguinaldo?",
    a: "Puedes acudir a la PROFEDET, que asesora y representa gratis a los trabajadores. Tienes un año para reclamarlo antes de que prescriba el derecho (art. 516 LFT).",
  },
];

export default function AguinaldoPage() {
  return (
    <CalcShell
      breadcrumb="Aguinaldo"
      h1={<>Calculadora de <span className="text-mandarina-deep">aguinaldo</span> 2026</>}
      intro="Cuánto te toca según tu sueldo y los días que trabajaste en el año, con el desglose y lo que dice la ley sobre fechas, impuestos y qué hacer si no te lo pagan."
      jsonLd={{ name: TITLE, description: DESCRIPTION, path: "/aguinaldo", idBase: "aguinaldo" }}
      faq={FAQ}
      cta={{
        hand: "ya sabes cuánto",
        title: <>¿En qué se te<br />va a ir?</>,
        body: "El aguinaldo se evapora en dos semanas si no lo anotas. En Centavos apartas cuánto va a deudas, cuánto a regalos y cuánto se queda — y en enero sabes en qué se fue de verdad.",
        note: "Gratis. Sin conectar tu banco, sin registro.",
      }}
      aviso="Esta calculadora es informativa y no sustituye el cálculo de tu empresa ni una asesoría profesional. El monto neto depende de tu ingreso anual y de la retención de ISR que aplique tu patrón."
    >
      <AguinaldoCalculator />

      <div className="max-w-2xl mt-12">
        <h2 className={calcH2}>¿Qué es el aguinaldo?</h2>
        <p className={calcP}>
          El aguinaldo es una prestación anual obligatoria para toda persona trabajadora bajo la Ley Federal del
          Trabajo, sin importar el tipo de contrato ni la antigüedad. No es un bono ni depende del desempeño: es un
          derecho. El mínimo son 15 días de salario, y quien no trabajó el año completo recibe la parte proporcional.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cuándo se paga?</h2>
        <p className={calcP}>
          Antes del 20 de diciembre, sin excepción (art. 87 LFT). Si tu empresa no cumple esa fecha, incurre en una
          falta que la autoridad laboral puede sancionar.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cuánto me toca?</h2>
        <p className={calcP}>
          La fórmula es tu salario diario (sueldo mensual entre 30) multiplicado por los días de aguinaldo y por la
          proporción del año que trabajaste. Con sueldo de $15,000 y 15 días, si trabajaste todo el año, son $7,500. Si
          entraste a mitad de año, la mitad.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Y si renuncié o me corrieron?</h2>
        <p className={calcP}>
          Te toca el aguinaldo proporcional al tiempo trabajado, y se paga dentro de tu finiquito. Si estás en esa
          situación, la{" "}
          <a href="/finiquito" className="text-mandarina-deep underline underline-offset-2 font-semibold">
            calculadora de finiquito
          </a>{" "}
          te arma el total.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Paga impuestos?</h2>
        <p className={calcP}>
          Los primeros 30 días de UMA están exentos de ISR (art. 93-XIV LISR). Lo que exceda paga impuesto y tu empresa
          lo retiene, por eso el monto que ves aquí es el <strong>bruto</strong>. Si tu empresa no te lo paga, la{" "}
          <a href="https://www.gob.mx/profedet" target="_blank" rel="noopener noreferrer" className="text-mandarina-deep underline underline-offset-2 font-semibold">
            PROFEDET
          </a>
          <span className="sr-only"> (se abre en una pestaña nueva)</span> asesora gratis.
        </p>
      </div>
    </CalcShell>
  );
}
