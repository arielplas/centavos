import type { Metadata } from "next";
import { CalcShell, calcH2, calcP, type FaqItem } from "@/components/calc/CalcShell";
import { CetesCalculator } from "@/components/calc/CetesCalculator";
import { pageOpenGraph } from "@/lib/seo";

const TITLE = "Calculadora de CETES 2026";
const DESCRIPTION =
  "Calcula cuánto ganas con CETES según el monto, el plazo y la tasa. Rendimiento del periodo, anual efectivo y reinversión. Cómo funcionan y si pagan impuestos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cetes" },
  openGraph: pageOpenGraph({ title: `${TITLE} · Centavos`, description: DESCRIPTION, path: "/cetes" }),
};

const FAQ: FaqItem[] = [
  {
    q: "¿Qué son los CETES?",
    a: "Los Certificados de la Tesorería son deuda del gobierno mexicano a corto plazo: le prestas dinero a la Federación y te lo devuelve con rendimiento en una fecha fija. Se emiten a 28, 91, 182 y 364 días.",
  },
  {
    q: "¿Cuánto puedo ganar con CETES?",
    a: "Depende de la tasa de la subasta y del plazo. Ojo: la tasa se anuncia anualizada, así que un CETE al 10% anual a 28 días no te da 10% en ese mes, sino aproximadamente 0.78%. La calculadora de arriba te muestra el rendimiento del periodo y el anual efectivo.",
  },
  {
    q: "¿Cuál es el monto mínimo para invertir en CETES?",
    a: "En Cetesdirecto, la plataforma oficial de la SHCP para personas físicas, puedes empezar desde 100 pesos.",
  },
  {
    q: "¿Los CETES pagan impuestos?",
    a: "Sí. La retención de ISR (art. 54 LISR) se calcula sobre el capital invertido, no sobre la ganancia, a la tasa anual que fija la Ley de Ingresos de cada año. Es una retención provisional acreditable en tu declaración anual.",
  },
  {
    q: "¿Puedo sacar mi dinero antes del vencimiento?",
    a: "En Cetesdirecto puedes vender antes del vencimiento, pero el precio dependerá de las condiciones del mercado ese día, así que el rendimiento podría ser distinto al esperado.",
  },
  {
    q: "¿Los CETES son seguros?",
    a: "Son de los instrumentos de menor riesgo del mercado porque están respaldados por el gobierno federal. No tienen la cobertura del IPAB de los bancos, sino el respaldo directo del Estado.",
  },
  {
    q: "¿Cada cuándo cambian las tasas de CETES?",
    a: "Se subastan cada semana, normalmente los martes, así que la tasa puede variar de una semana a otra según las condiciones del mercado y la política monetaria de Banxico.",
  },
];

export default function CetesPage() {
  return (
    <CalcShell
      breadcrumb="CETES"
      h1={<>Calculadora de <span className="text-mandarina-deep">CETES</span> 2026</>}
      intro="Cuánto ganas según el monto, el plazo y la tasa. Con el rendimiento del periodo, el anual efectivo y la opción de reinvertir."
      jsonLd={{ name: TITLE, description: DESCRIPTION, path: "/cetes", idBase: "cetes" }}
      faq={FAQ}
      cta={{
        hand: "primero lo primero",
        title: <>Invierte lo que<br />de verdad te sobra.</>,
        body: "Antes de decidir el plazo, vale saber cuánto te queda cada mes. En Centavos anotas tus gastos en segundos y ves cuánto puedes apartar sin quedarte corto.",
        note: "Gratis. Sin conectar tu banco, sin registro.",
      }}
      aviso="Esta calculadora es informativa y no constituye asesoría financiera. Los rendimientos dependen de la tasa de la subasta vigente y pueden cambiar cada semana."
    >
      <CetesCalculator />

      <div className="max-w-2xl mt-12">
        <h2 className={calcH2}>¿Por qué se compran a descuento?</h2>
        <p className={calcP}>
          Un CETE no paga intereses: se compra por menos de su valor nominal de $10 y al vencimiento recibes los $10
          completos. Esa diferencia es tu ganancia. Por eso el rendimiento que anuncian no es directamente lo que te
          llega a la cuenta.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cuánto ganas realmente?</h2>
        <p className={calcP}>
          La tasa se publica anualizada aunque el plazo sea de 28 días. Un 10% anual a 28 días equivale a cerca de 0.78%
          en ese mes. La calculadora te muestra las dos cifras para que no confundas la tasa anunciada con lo que ganas
          en el periodo.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Pagan impuestos?</h2>
        <p className={calcP}>
          Sí, y con una vuelta que sorprende: la retención de ISR se calcula sobre el capital invertido, no sobre la
          ganancia (art. 54 LISR). Cuando la tasa está baja, la retención puede acercarse al rendimiento real. Es
          provisional y acreditable en tu declaración anual.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cómo comprarlos?</h2>
        <p className={calcP}>
          A través de{" "}
          <a href="https://www.cetesdirecto.com" target="_blank" rel="noopener noreferrer" className="text-mandarina-deep underline underline-offset-2 font-semibold">
            Cetesdirecto
          </a>
          <span className="sr-only"> (se abre en una pestaña nueva)</span>, la plataforma oficial de la SHCP, desde $100
          y sin comisiones de compra. Las tasas vigentes están en{" "}
          <a href="https://www.banxico.org.mx/mercados/valores-gubernamentales.html" target="_blank" rel="noopener noreferrer" className="text-mandarina-deep underline underline-offset-2 font-semibold">
            Banxico
          </a>
          <span className="sr-only"> (se abre en una pestaña nueva)</span>.
        </p>
      </div>
    </CalcShell>
  );
}
