import type { Metadata } from "next";
import { CalcShell, calcH2, calcP, type FaqItem } from "@/components/calc/CalcShell";
import { PtuCalculator } from "@/components/calc/PtuCalculator";
import { pageOpenGraph } from "@/lib/seo";

const TITLE = "Calculadora de PTU 2026 — reparto de utilidades";
const DESCRIPTION =
  "Estima cuánto te toca de reparto de utilidades. Cómo se calcula la PTU, cuándo se paga, el tope de la reforma 2021 y quién tiene derecho.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ptu" },
  openGraph: pageOpenGraph({ title: `${TITLE} · Centavos`, description: DESCRIPTION, path: "/ptu" }),
};

const FAQ: FaqItem[] = [
  {
    q: "¿Cuándo pagan las utilidades en México?",
    a: "Las personas morales deben pagar la PTU a más tardar el 30 de mayo, y las personas físicas el 29 de junio. Es dentro de los 60 días siguientes a la fecha en que debe pagarse el ISR anual (art. 122 LFT).",
  },
  {
    q: "¿Cómo se calcula el reparto de utilidades?",
    a: "El monto a repartir se divide en dos mitades iguales: una se reparte según los días trabajados por cada persona y la otra según los salarios devengados (art. 123 LFT). Tu parte suma ambas bolsas.",
  },
  {
    q: "¿Cuál es el máximo que pueden darme de utilidades?",
    a: "Desde la reforma de 2021, la PTU tiene un tope: tres meses de tu salario, o el promedio de la PTU que recibiste en los últimos tres años, lo que resulte más favorable para ti (art. 127 fracción VIII LFT).",
  },
  {
    q: "¿Me tocan utilidades si renuncié a mitad de año?",
    a: "Sí. Aunque ya no trabajes en la empresa, tienes derecho a la parte proporcional de las utilidades del periodo que sí trabajaste.",
  },
  {
    q: "¿Quién no tiene derecho a utilidades?",
    a: "No participan los directores, administradores y gerentes generales; los socios y accionistas; los profesionistas que prestan servicios por honorarios; los trabajadores eventuales con menos de 60 días trabajados; ni el personal de empresas de nueva creación durante su primer año (art. 127 LFT).",
  },
  {
    q: "¿Las utilidades pagan ISR?",
    a: "Los primeros 15 días de UMA de la PTU están exentos de ISR (art. 93-XIV LISR). Lo que exceda paga impuesto, aunque el patrón puede aplicar un procedimiento que reduce la retención.",
  },
  {
    q: "¿Por qué este año me tocaron menos utilidades?",
    a: "Suele ser por el tope de la reforma de 2021: antes no había límite y ahora tu PTU no puede exceder tres meses de salario (o el promedio de los últimos tres años). Si tu reparto calculado supera ese tope, se queda en el tope.",
  },
];

export default function PtuPage() {
  return (
    <CalcShell
      breadcrumb="PTU"
      h1={<>Calculadora de <span className="text-mandarina-deep">PTU</span> 2026</>}
      intro="Estima tu reparto de utilidades. Si no tienes los datos del aviso de la empresa, te calculamos el máximo que la ley permite."
      jsonLd={{ name: TITLE, description: DESCRIPTION, path: "/ptu", idBase: "ptu" }}
      faq={FAQ}
      cta={{
        hand: "dinero que no esperabas",
        title: <>Que no se te<br />escurra.</>,
        body: "El dinero que no esperabas es el que más rápido desaparece. Anota a qué lo destinas antes de que llegue, y sabrás en qué se fue de verdad.",
        note: "Gratis. Sin conectar tu banco, sin registro.",
      }}
      aviso="Esta calculadora es informativa. Tu reparto real lo determina la utilidad fiscal de la empresa y los datos del aviso de reparto; consúltalo con tu patrón o con PROFEDET."
    >
      <PtuCalculator />

      <div className="max-w-2xl mt-12">
        <h2 className={calcH2}>¿Qué es el reparto de utilidades?</h2>
        <p className={calcP}>
          La PTU es tu derecho constitucional a recibir una parte de las ganancias de la empresa donde trabajas (art.
          123-A-IX). No es un bono a criterio del patrón: si la empresa tuvo utilidad fiscal, el reparto del 10% de esa
          utilidad es obligatorio.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cómo se calcula mi parte?</h2>
        <p className={calcP}>
          El monto total se parte en dos mitades. Una se reparte entre todos según los <strong>días trabajados</strong>{" "}
          y la otra según los <strong>salarios devengados</strong>. Por eso dos personas con el mismo sueldo pero
          distinta asistencia reciben diferente, y por eso necesitas los totales de la plantilla —que vienen en el aviso
          de reparto— para el cálculo exacto.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cuál es el tope?</h2>
        <p className={calcP}>
          Desde la reforma de 2021, tu PTU no puede exceder lo que sea mayor entre tres meses de tu salario y el
          promedio de lo que recibiste los últimos tres años (art. 127-VIII LFT). Es la razón por la que a mucha gente le
          bajó el monto respecto a años anteriores.
        </p>

        <h2 className={`${calcH2} mt-12`}>¿Cuándo se paga?</h2>
        <p className={calcP}>
          Las personas morales pagan a más tardar el 30 de mayo; las personas físicas, el 29 de junio (art. 122 LFT). Si
          no te la pagan, la{" "}
          <a href="https://www.gob.mx/profedet" target="_blank" rel="noopener noreferrer" className="text-mandarina-deep underline underline-offset-2 font-semibold">
            PROFEDET
          </a>
          <span className="sr-only"> (se abre en una pestaña nueva)</span> asesora gratis.
        </p>
      </div>
    </CalcShell>
  );
}
