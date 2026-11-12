// Text of the gastos hormiga page in both languages: metadata, hero, the
// content sections, FAQ, CTA and notice. Server-only on purpose (the calculator
// island has its own copy.ts), so none of this is shipped as JavaScript.
//
// Spanish is the source of truth. English is written for "small expenses
// calculator" searches rather than translated word for word: "gastos hormiga"
// has no English idiom, so it is explained once and not used as the keyword.
//
// Every figure in the examples comes out of lib/gastos-hormiga.ts with the
// calculator's own suggestions (60 a day, 120 three times a week, 199 a month).

import type { ReactNode } from "react";
import { calcP, type FaqItem } from "@/components/calc/CalcShell";
import type { SiteLang } from "@/lib/lang";

export type GastosHormigaPageCopy = {
  meta: {
    /** The search keyword; the layout appends "· Centavos". */
    title: string;
    /** ≤ 155 characters: Google cuts the description around there. */
    description: string;
  };
  breadcrumb: string;
  h1: ReactNode;
  intro: string;
  /** Each one answers a question people actually search for. */
  sections: { title: string; body: ReactNode }[];
  /** Answers must be plain text: they also feed the FAQPage JSON-LD. */
  faq: FaqItem[];
  /** Last question. Its answer depends on whether this deploy can save the list. */
  storageFaq: { q: string; a: string; aWithSave: string };
  cta: { hand: string; title: ReactNode; body: string; note: string };
  aviso: string;
};

const list = "list-disc pl-5 space-y-1.5 text-[16px] leading-relaxed text-ink mb-4";
const formula = "bg-surface border border-rule rounded-2xl px-4 py-3 text-[15px] font-semibold text-ink mb-4";
const link = "text-mandarina-deep underline underline-offset-2 font-semibold";

const es: GastosHormigaPageCopy = {
  meta: {
    title: "Calculadora de gastos hormiga",
    description:
      "Anota tus gastos hormiga (el café, los antojos, el taxi) y mira cuánto suman al mes, al año y en 5 años. Gratis y sin registrarte.",
  },
  breadcrumb: "Gastos hormiga",
  h1: (
    <>
      Calculadora de <span className="text-mandarina-deep">gastos hormiga</span>
    </>
  ),
  intro:
    "Anota esos gastos chiquitos de todos los días (el café, la botana, el taxi) y mira cuánto suman al mes y al año. Sin regaños: solo la cuenta.",
  sections: [
    {
      title: "¿Qué son los gastos hormiga?",
      body: (
        <>
          <p className={calcP}>
            Son gastos pequeños y frecuentes que casi no se sienten uno por uno: el café de camino al trabajo, el
            refresco de la tiendita, la propina, el envío de la comida. Se llaman así porque, como las hormigas, cada
            uno es diminuto, pero entre todos se llevan bastante.
          </p>
          <p className={calcP}>
            No son gastos malos ni innecesarios por definición. Lo que los distingue es que nadie los planea ni los
            anota, así que a fin de mes cuesta decir en qué se fue el dinero. En México, la{" "}
            <a href="https://www.condusef.gob.mx" target="_blank" rel="noopener noreferrer" className={link}>
              Condusef
            </a>
            <span className="sr-only"> (se abre en una pestaña nueva)</span> usa el término en sus materiales de
            educación financiera.
          </p>
        </>
      ),
    },
    {
      title: "Ejemplos de gastos hormiga",
      body: (
        <>
          <ul className={list}>
            <li>Café, refrescos, botanas y antojos de la tiendita.</li>
            <li>Comida a domicilio, con sus cargos de envío y de servicio.</li>
            <li>Viajes cortos en taxi o por aplicación.</li>
            <li>Cigarros.</li>
            <li>Suscripciones que casi no usas.</li>
            <li>Comisiones por sacar dinero en el cajero de otro banco.</li>
            <li>Propinas, estacionamiento y compras dentro de apps o juegos.</li>
          </ul>
          <p className={calcP}>
            Tu lista es tuya: lo que para alguien es un gasto hormiga, para otra persona es un gusto planeado. La
            prueba es sencilla: si no sabrías decir cuánto gastas en eso al mes, anótalo aquí.
          </p>
        </>
      ),
    },
    {
      title: "¿Cuánto suman los gastos hormiga al año?",
      body: (
        <>
          <p className={calcP}>
            La cuenta es una multiplicación: lo que cuesta cada vez, por las veces que lo compras, por los días, las
            semanas o los meses del año.
          </p>
          <p className={formula}>gasto al año = costo × veces × 365 (diario), 52 (semanal) o 12 (mensual)</p>
          <p className={calcP}>
            Un café de $60 diario son $21,900 al año. Tres viajes de $120 a la semana son $18,720. Una suscripción de
            $199 al mes, $2,388. Juntos dan $43,008 al año, o $3,584 al mes: el total mensual es el anual entre 12.
          </p>
          <p className={calcP}>
            Ninguno parece gran cosa por separado. Por eso sirve verlos juntos y en la misma unidad.
          </p>
        </>
      ),
    },
    {
      title: "¿Cómo reducir los gastos hormiga?",
      body: (
        <>
          <p className={calcP}>No hace falta eliminarlos. Funciona mejor decidir cuáles se quedan:</p>
          <ul className={list}>
            <li>
              <strong>Anótalos una semana.</strong> Con solo verlos escritos, varios se acomodan solos.
            </li>
            <li>
              <strong>Elige uno o dos para recortar, no todos.</strong> Quitarte todos los gustos de golpe dura poco.
            </li>
            <li>
              <strong>Ponles un tope mensual.</strong> Un presupuesto de gastos hormiga te deja gastar sin culpa hasta
              ese límite.
            </li>
            <li>
              <strong>Baja la frecuencia antes que el gusto.</strong> Café comprado tres días a la semana en vez de
              cinco.
            </li>
            <li>
              <strong>Revisa tus suscripciones cada tres meses</strong> y cancela la que no abriste.
            </li>
          </ul>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "¿Qué es un gasto hormiga?",
      a: "Es un gasto pequeño y frecuente que casi no se nota en el momento, como un café, un refresco o una propina. Uno solo no pesa, pero sumados durante el mes o el año pueden ser una cantidad importante.",
    },
    {
      q: "¿Cuáles son ejemplos de gastos hormiga?",
      a: "Café y antojos de la tienda, comida a domicilio con sus cargos de envío, viajes cortos en taxi o por aplicación, cigarros, suscripciones que casi no usas, comisiones de cajeros de otros bancos y compras dentro de apps.",
    },
    {
      q: "¿Cómo se calculan los gastos hormiga?",
      a: "Multiplica lo que cuesta cada vez por las veces que lo compras y por los periodos del año: 365 si es diario, 52 si es semanal o 12 si es mensual. Eso da el gasto anual; dividido entre 12 es el mensual. Un café de 60 pesos diario son 21,900 pesos al año.",
    },
    {
      q: "¿Los gastos hormiga son malos?",
      a: "No. Son un problema solo cuando no sabes cuánto suman y te impiden llegar a fin de mes o ahorrar. Si los conoces y caben en tu presupuesto, son gustos que tú elegiste.",
    },
    {
      q: "¿Cómo puedo reducir mis gastos hormiga?",
      a: "Anótalos durante una semana, elige uno o dos para recortar en vez de todos, ponles un tope mensual y revisa tus suscripciones cada cierto tiempo. Bajar la frecuencia suele ser más fácil que eliminar el gasto.",
    },
  ],
  storageFaq: {
    q: "¿Esta calculadora guarda mis datos?",
    a: "Tu lista se queda en tu navegador para que no la pierdas al recargar la página. No se envía a ningún servidor.",
    aWithSave:
      "Tu lista se queda en tu navegador para que no la pierdas al recargar la página. Solo se envía a Centavos si decides guardarla con tu correo: en ese caso la conservamos para que te esté esperando cuando te registres en la app, y se borra a los 180 días si nunca lo haces.",
  },
  cta: {
    hand: "ya viste cuánto suman",
    title: (
      <>
        Ahora no les
        <br />
        pierdas la pista.
      </>
    ),
    body: "En Centavos anotas cada gasto en segundos y le pones un tope mensual a tus gastos hormiga. No tienen que desaparecer: los eliges tú.",
    note: "Gratis. Sin conectar tu banco: solo necesitas tu correo.",
  },
  aviso:
    "Esta calculadora es informativa y no constituye asesoría financiera. Los montos sugeridos son ejemplos; el resultado depende de lo que tú anotes y supone que cada gasto se repite igual todo el año.",
};

const en: GastosHormigaPageCopy = {
  meta: {
    title: "Small expenses calculator",
    description:
      "Add your small everyday purchases (coffee, snacks, rides) and see what they cost you per month, per year and over 5 years. Free, no sign-up.",
  },
  breadcrumb: "Small expenses",
  h1: (
    <>
      <span className="text-mandarina-deep">Small expenses</span> calculator
    </>
  ),
  intro:
    "Jot down the little everyday purchases (the coffee, the snack, the ride home) and see what they add up to in a month and in a year. No lecture, just the math.",
  sections: [
    {
      title: "What counts as a small expense?",
      body: (
        <>
          <p className={calcP}>
            Small, frequent purchases you barely notice one at a time: the coffee on the way to work, a soda from the
            corner store, a tip, a delivery fee. Each one is tiny. Together they take a real bite out of the month.
          </p>
          <p className={calcP}>
            In Mexico they have a name, <i lang="es">gastos hormiga</i> (literally &ldquo;ant expenses&rdquo;), because
            each one is small and there are a lot of them. They aren&apos;t bad or unnecessary by definition. What sets
            them apart is that nobody plans or tracks them, so at the end of the month it&apos;s hard to say where the
            money went.
          </p>
        </>
      ),
    },
    {
      title: "Examples of small expenses that add up",
      body: (
        <>
          <ul className={list}>
            <li>Coffee, sodas, snacks and impulse buys at the corner store.</li>
            <li>Food delivery, with its delivery and service fees.</li>
            <li>Short taxi or ride-hailing trips.</li>
            <li>Cigarettes.</li>
            <li>Subscriptions you rarely use.</li>
            <li>Fees for withdrawing cash at another bank&apos;s ATM.</li>
            <li>Tips, parking and in-app or in-game purchases.</li>
          </ul>
          <p className={calcP}>
            Your list is your own: one person&apos;s money leak is another person&apos;s planned treat. A simple test:
            if you couldn&apos;t say how much you spend on it in a month, write it down here.
          </p>
        </>
      ),
    },
    {
      title: "How much do small expenses add up to in a year?",
      body: (
        <>
          <p className={calcP}>
            It&apos;s one multiplication: what it costs each time, times how often you buy it, times the days, weeks or
            months in a year.
          </p>
          <p className={formula}>yearly cost = cost × times × 365 (daily), 52 (weekly) or 12 (monthly)</p>
          <p className={calcP}>
            In Mexican pesos, a $60 coffee every day is $21,900 a year. Three $120 rides a week are $18,720. A $199
            monthly subscription is $2,388. Together they come to $43,008 a year, or $3,584 a month: the monthly total
            is the yearly one divided by 12. The math is the same in any currency.
          </p>
          <p className={calcP}>
            None of them looks like much on its own. That&apos;s why it helps to see them side by side, in the same
            unit.
          </p>
        </>
      ),
    },
    {
      title: "How to cut back on small expenses",
      body: (
        <>
          <p className={calcP}>You don&apos;t have to give them all up. It works better to decide which ones stay:</p>
          <ul className={list}>
            <li>
              <strong>Write them down for a week.</strong> Just seeing them on the page sorts out a few on its own.
            </li>
            <li>
              <strong>Pick one or two to trim, not all of them.</strong> Cutting every treat at once rarely lasts.
            </li>
            <li>
              <strong>Give them a monthly cap.</strong> A budget for small expenses lets you spend guilt-free up to
              that limit.
            </li>
            <li>
              <strong>Lower the frequency before you drop the habit.</strong> Bought coffee three days a week instead
              of five.
            </li>
            <li>
              <strong>Review your subscriptions every three months</strong> and cancel the one you didn&apos;t open.
            </li>
          </ul>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "What are small recurring expenses?",
      a: "They are small, frequent purchases that hardly register when you make them, like a coffee, a soda or a tip. One doesn't matter much, but added up over a month or a year they can be a significant amount. In Mexico they are known as gastos hormiga.",
    },
    {
      q: "What are examples of small expenses that add up?",
      a: "Coffee and corner-store snacks, food delivery with its fees, short taxi or ride-hailing trips, cigarettes, subscriptions you rarely use, fees from other banks' ATMs and in-app purchases.",
    },
    {
      q: "How do I calculate what my small expenses cost per year?",
      a: "Multiply what it costs each time by how many times you buy it and by the periods in a year: 365 if it's daily, 52 if it's weekly or 12 if it's monthly. That gives the yearly cost; divide it by 12 for the monthly one. A 60-peso coffee every day is 21,900 pesos a year.",
    },
    {
      q: "Are small expenses bad?",
      a: "No. They are only a problem when you don't know what they add up to and they keep you from making it to the end of the month or from saving. If you know them and they fit your budget, they are treats you chose.",
    },
    {
      q: "How can I cut back on small expenses?",
      a: "Write them down for a week, pick one or two to trim instead of all of them, give them a monthly cap and review your subscriptions every so often. Lowering the frequency is usually easier than dropping the expense altogether.",
    },
  ],
  storageFaq: {
    q: "Does this calculator store my data?",
    a: "Your list stays in your browser so you don't lose it when you reload the page. It is not sent to any server.",
    aWithSave:
      "Your list stays in your browser so you don't lose it when you reload the page. It is only sent to Centavos if you choose to save it with your email: in that case we keep it so it's waiting when you sign up in the app, and it is deleted after 180 days if you never do.",
  },
  cta: {
    hand: "now you know what they add up to",
    title: (
      <>
        Now keep an
        <br />
        eye on them.
      </>
    ),
    body: "In Centavos you log each expense in seconds and set a monthly cap for the small ones. They don't have to disappear: you get to choose them.",
    note: "Free. No bank connection: all you need is your email.",
  },
  aviso:
    "This calculator is for information only and is not financial advice. The suggested amounts are examples; the result depends on what you enter and assumes each expense repeats the same way all year.",
};

export const GASTOS_HORMIGA_PAGE: Record<SiteLang, GastosHormigaPageCopy> = { es, en };
