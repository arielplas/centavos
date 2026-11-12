// Landing copy in both languages.
//
// Spanish is the source of truth; English translates it section by section.
// Everything is typed by `HomeCopy`, so a key missing on either side fails the
// typecheck instead of shipping a half-translated page.

import type { ReactNode } from "react";
import type { SiteLang } from "@/lib/lang";

type Feature = {
  kbd: string;
  t: string;
  d: string;
  /** Link to a free tool. The tools are Spanish-only, so English leaves it out. */
  tool?: { href: string; label: string };
};

type Card = { t: string; d: string };

export type HomeCopy = {
  meta: {
    /** ≤ 60 characters: search keyword + the brand differentiator. */
    title: string;
    /** ≤ 155 characters: Google cuts the description around there. */
    description: string;
    twitterDescription: string;
    keywords: string[];
  };
  jsonLd: { description: string; featureList: string[] };
  hero: {
    pillFree: string;
    pillPlatforms: string;
    titleLead: string;
    titleAccent: string;
    body: ReactNode;
    commitmentsLabel: string;
    commitments: string[];
    mockAlt: string;
  };
  features: {
    kicker: string;
    title: string;
    /** Screen-reader description of a feature's phone mock. */
    mockAlt: (name: string) => string;
    /** Same order as the mocks: budgets, subscriptions, installments. */
    items: [Feature, Feature, Feature];
  };
  privacy: {
    kicker: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    cards: Card[];
    noteBefore: string;
    noteLink: string;
  };
  split: {
    kbd: string;
    titleLead: string;
    titleRest: string;
    body: ReactNode;
    bullets: ReactNode[];
    storeLabel: string;
    mockAlt: string;
  };
  reminders: {
    kbd: string;
    titleLead: string;
    titleRest: string;
    body: ReactNode;
    bullets: ReactNode[];
    mockAlt: string;
  };
  steps: { kicker: string; title: string; items: { n: string; t: string; d: string }[] };
  /**
   * Free calculators. `null` in English: all but one are Spanish-only pages
   * about Mexican payroll and tax rules, and an English card would promise a
   * translation that is not there. The bilingual one (gastos hormiga) reaches
   * the English landing through the footer.
   */
  tools: null | {
    kicker: string;
    title: string;
    body: string;
    items: { href: string; tag: string; t: string; d: string }[];
  };
  /** Answers must be plain text: they also feed the FAQPage JSON-LD. */
  faq: {
    kicker: string;
    title: string;
    items: { q: string; a: string }[];
    more: string;
    moreLink: string;
  };
  closing: { kbd: string; titleLead: string; titleRest: string; body: string };
  disclaimer: string;
  store: { appleAlt: string; googleAlt: string; newTab: string; inlineLabel: string };
  bar: { title: string; subtitle: string; goTo: string; newTab: string };
};

const es: HomeCopy = {
  meta: {
    title: "Centavos · App para anotar gastos sin conectar tu banco",
    description:
      "Anota lo que gastas en segundos, sin conectar tu banco. Presupuestos, suscripciones, meses sin intereses y gastos compartidos. Gratis en iOS y Android.",
    twitterDescription: "Anota lo que gastas en segundos, sin conectar tu banco. Gratis en iOS y Android.",
    keywords: [
      "app para anotar gastos", "control de gastos", "app de presupuesto personal",
      "app de finanzas personales", "gastos hormiga", "control de suscripciones",
      "meses sin intereses", "dividir gastos", "México",
    ],
  },
  jsonLd: {
    description:
      "App para anotar tus gastos, armar presupuestos por categoría y llevar tus suscripciones. Sin conectar tu banco. Gratis para iOS y Android.",
    featureList: [
      "Anotar gastos en segundos",
      "Presupuestos por categoría",
      "Control de suscripciones",
      "Compras a meses sin intereses",
      "Gastos compartidos y ajuste de cuentas",
      "Recordatorios configurables",
    ],
  },
  hero: {
    pillFree: "gratis",
    pillPlatforms: "Para iOS y Android",
    titleLead: "La app para anotar tus gastos,",
    titleAccent: "sin conectar tu banco",
    body: (
      <>
        Anota lo que gastas en segundos. <b className="text-ink">Sin bancos, sin sorpresas</b> y sin que nadie más vea tu dinero. Tú registras, tú tienes el control.
      </>
    ),
    commitmentsLabel: "Compromisos de Centavos",
    commitments: ["Solo tu correo, nunca tu banco", "Tus datos son tuyos", "Hecho en México 🇲🇽"],
    mockAlt:
      "Pantalla de la app mostrando el Pulso: tu dinero disponible del mes, un acceso para anotar gastos y el avance de tus presupuestos.",
  },
  features: {
    kicker: "Todo en un cuaderno",
    title: "Presupuestos, suscripciones y meses sin intereses en un solo lugar",
    mockAlt: (name) => `Pantalla de la app: ${name}.`,
    items: [
      {
        kbd: "límite mensual",
        t: "Presupuestos",
        d: "Ponle un límite a cada categoría y mira, de un vistazo, cuánto te queda por gastar. Sin que te tome por sorpresa el fin de mes.",
      },
      {
        kbd: "sin cargos fantasma",
        t: "Suscripciones",
        d: "Netflix, Spotify, el gym, el iCloud que ya ni usas. Centavos suma tus cargos recurrentes y te dice cuánto se te va al mes y al año.",
      },
      {
        kbd: "compras a plazos",
        t: "Meses sin intereses",
        d: "Registra tus compras a meses sin intereses y ve tu calendario de pagos: cuánto pagas este mes y cuántas mensualidades te faltan. Lo anotas tú, no lo saca de ninguna tarjeta.",
        tool: { href: "/meses-sin-intereses", label: "Calcula tu mensualidad a MSI" },
      },
    ],
  },
  privacy: {
    kicker: "Privado por diseño",
    titleLead: "No pedimos tu banco.",
    titleAccent: "Nunca.",
    body: "Centavos no se conecta a tu banco ni a tus tarjetas. No te pide credenciales, no sincroniza cuentas y no ve tu historial. Es un cuaderno privado: lo que anotas se queda contigo.",
    cards: [
      { t: "Cero credenciales", d: "Nunca escribes la clave de tu banco." },
      { t: "Nada que sincronizar", d: "No conectamos cuentas ni tarjetas." },
      { t: "Tu historial es tuyo", d: "Nadie más ve en qué gastas." },
    ],
    noteBefore: "Los detalles, sin letras chiquitas, en el",
    noteLink: "Aviso de Privacidad",
  },
  split: {
    kbd: "entre cuates",
    titleLead: "Divide gastos",
    titleRest: "con quien quieras.",
    body: (
      <>
        Roomies, pareja o la banda del viaje. Armen un presupuesto compartido, anoten quién pagó qué, y deja que Centavos calcule <b>quién le debe a quién</b>. Nada de cuentas raras a fin de mes.
      </>
    ),
    bullets: [
      <><b>Presupuestos compartidos</b> para el depa, el viaje o la fiesta</>,
      <><b>Lo que te deben y lo que debes</b>, apuntado por persona</>,
      <>El <b>ajuste de cuentas</b> te dice el mínimo de pagos para quedar a mano</>,
    ],
    storeLabel: "Pruébalo con tu banda:",
    mockAlt:
      "Pantalla de la app de gastos compartidos: los balances del grupo y quién le debe a quién, con un botón para ajustar cuentas.",
  },
  reminders: {
    kbd: "sin dar lata",
    titleLead: "Recordatorios que",
    titleRest: "no molestan.",
    body: (
      <>
        Un aviso al día para anotar tus gastos: 30 segundos y quedas al corriente. Y te avisamos <b className="text-ink">antes de que Netflix te cobre</b>, para que decidas a tiempo si sigue o se va.
      </>
    ),
    bullets: [
      <><b>Aviso diario</b> a la hora que tú elijas</>,
      <><b>Antes de cada cobro</b> de suscripción, no después</>,
      <>Tú mandas: <b>apágalos</b> cuando quieras</>,
    ],
    mockAlt:
      "Pantalla de la app con recordatorios: un aviso diario para anotar gastos y avisos antes de cada cobro de suscripción.",
  },
  steps: {
    kicker: "Así de fácil",
    title: "Empieza en 3 pasos",
    items: [
      { n: "01", t: "Descarga y crea tu cuenta", d: "30 segundos. Solo tu correo, nunca tarjetas ni datos del banco." },
      { n: "02", t: "Anota lo que gastas", d: "Cada cafecito, cada Uber. El botón + lo hace en segundos." },
      { n: "03", t: "Mira a dónde se va tu lana", d: "Presupuestos, suscripciones y pagos, todo en un cuaderno tuyo." },
    ],
  },
  // Free calculators: tool pages that bring organic traffic and link back to
  // the app. Highest search volume first.
  tools: {
    kicker: "Sin descargar nada",
    title: "Calculadoras gratis, hechas para México",
    body: "Sácale la cuenta a tu aguinaldo, tu finiquito o tus compras a meses. Con la ley en la mano y sin registrarte.",
    items: [
      { href: "/aguinaldo", tag: "cada diciembre", t: "Aguinaldo", d: "Cuánto te toca según tu sueldo y los días que trabajaste en el año." },
      { href: "/finiquito", tag: "finiquito y liquidación", t: "Finiquito", d: "El desglose de lo que te corresponde al salir, concepto por concepto." },
      { href: "/vacaciones", tag: "días y prima", t: "Vacaciones", d: "Cuántos días te tocan por antigüedad y cuánto es tu prima vacacional." },
      { href: "/meses-sin-intereses", tag: "compras a plazos", t: "Meses sin intereses", d: "Tu mensualidad, el calendario de pagos y cuánto cuesta de verdad la promoción." },
      { href: "/ptu", tag: "reparto de utilidades", t: "PTU", d: "Estima cuánto te toca de utilidades, con el tope de la reforma 2021." },
      { href: "/cetes", tag: "ahorro e inversión", t: "CETES", d: "Cuánto ganas según el monto, el plazo y la tasa de la subasta." },
      { href: "/gastos-hormiga", tag: "cafecitos y antojos", t: "Gastos hormiga", d: "Anota tus gastos chiquitos de todos los días y mira cuánto suman al mes y al año." },
    ],
  },
  // FAQ: answers objections (conversion) and feeds the FAQPage rich result
  // (SEO). Only claims already made on the site or in the terms.
  faq: {
    kicker: "Dudas comunes",
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Centavos se conecta a mi banco o a mis tarjetas?",
        a: "No. Nunca. Centavos no te pide credenciales bancarias, no sincroniza cuentas ni lee tus movimientos. Tú anotas lo que gastas y esa información se queda en tu cuenta.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Descargar y usar Centavos es gratis, en App Store y Google Play.",
      },
      {
        q: "¿Qué necesito para crear mi cuenta?",
        a: "Solo un correo electrónico. No pedimos tarjetas, número de cuenta ni datos del banco.",
      },
      {
        q: "¿Cómo anoto un gasto?",
        a: "Tocas el botón +, escribes el monto, eliges la categoría y listo. Toma unos segundos. Si quieres, agregas una nota.",
      },
      {
        q: "¿Puedo dividir gastos con mi pareja, roomies o amigos?",
        a: "Sí. Arman un presupuesto compartido, cada quien anota lo que pagó y Centavos calcula quién le debe a quién y el mínimo de pagos para quedar a mano.",
      },
      {
        q: "¿Me van a llenar de notificaciones?",
        a: "No. Hay un aviso diario para anotar tus gastos, a la hora que tú elijas, y un recordatorio antes de cada cobro de suscripción. Los puedes apagar cuando quieras.",
      },
      {
        q: "¿Cómo elimino mi cuenta?",
        a: "Desde la app, en Configuraciones > Perfil > Eliminar cuenta. También puedes pedirlo por correo a hola@centavos.mx con el asunto «Eliminar cuenta».",
      },
    ],
    more: "¿Otra duda?",
    moreLink: "Escríbenos",
  },
  closing: {
    kbd: "tú tienes el control",
    titleLead: "Tu dinero, solo",
    titleRest: "para tus ojos.",
    body: "Descarga Centavos gratis y empieza a anotar hoy. Sin conectar tu banco, sin sorpresas, sin que nadie más vea tu lana.",
  },
  disclaimer:
    "Las pantallas mostradas son ilustrativas y pueden variar de la app real. Cifras y datos en las imágenes son de ejemplo.",
  store: {
    appleAlt: "Descárgala en el App Store",
    googleAlt: "Disponible en Google Play",
    newTab: "(se abre en una pestaña nueva)",
    inlineLabel: "Empieza a anotar:",
  },
  bar: {
    title: "Descarga Centavos gratis",
    subtitle: "Sin conectar tu banco",
    goTo: "Ir a",
    newTab: "(se abre en una pestaña nueva)",
  },
};

const en: HomeCopy = {
  meta: {
    title: "Centavos · Expense tracker that never links your bank",
    description:
      "Log what you spend in seconds, without linking your bank. Budgets, subscriptions, installments and shared expenses. Free on iOS and Android.",
    twitterDescription: "Log what you spend in seconds, without linking your bank. Free on iOS and Android.",
    keywords: [
      "expense tracker app", "manual expense tracker", "budget app without bank connection",
      "personal finance app", "subscription tracker", "split expenses", "Mexico",
    ],
  },
  jsonLd: {
    description:
      "App to log your expenses, set budgets by category and keep track of your subscriptions. Without linking your bank. Free for iOS and Android.",
    featureList: [
      "Log expenses in seconds",
      "Budgets by category",
      "Subscription tracking",
      "Interest-free installment purchases",
      "Shared expenses and settling up",
      "Configurable reminders",
    ],
  },
  hero: {
    pillFree: "free",
    pillPlatforms: "For iOS and Android",
    titleLead: "The app to track your spending,",
    titleAccent: "without linking your bank",
    body: (
      <>
        Log what you spend in seconds. <b className="text-ink">No banks, no surprises</b>, and nobody else looking at your money. You log it, you stay in control.
      </>
    ),
    commitmentsLabel: "What Centavos promises",
    commitments: ["Just your email, never your bank", "Your data is yours", "Made in Mexico 🇲🇽"],
    mockAlt:
      "App screen showing Pulse: the money you have available this month, a shortcut to log an expense and how your budgets are doing.",
  },
  features: {
    kicker: "All in one notebook",
    title: "Budgets, subscriptions and installments in one place",
    mockAlt: (name) => `App screen: ${name}.`,
    items: [
      {
        kbd: "monthly limit",
        t: "Budgets",
        d: "Set a limit for each category and see at a glance how much you have left to spend. No more end-of-month surprises.",
      },
      {
        kbd: "no phantom charges",
        t: "Subscriptions",
        d: "Netflix, Spotify, the gym, the iCloud plan you don't even use anymore. Centavos adds up your recurring charges and tells you how much goes out every month and every year.",
      },
      {
        kbd: "buy now, pay monthly",
        t: "Installments",
        d: "Log what you buy in interest-free monthly installments (meses sin intereses) and see your payment calendar: how much is due this month and how many payments are left. You log it yourself; nothing is pulled from any card.",
      },
    ],
  },
  privacy: {
    kicker: "Private by design",
    titleLead: "We don't ask for your bank.",
    titleAccent: "Ever.",
    body: "Centavos doesn't connect to your bank or your cards. It doesn't ask for credentials, doesn't sync accounts and doesn't see your history. It's a private notebook: what you write down stays with you.",
    cards: [
      { t: "Zero credentials", d: "You never type your bank password." },
      { t: "Nothing to sync", d: "We don't connect accounts or cards." },
      { t: "Your history is yours", d: "Nobody else sees what you spend on." },
    ],
    noteBefore: "The details, with no fine print, are in the",
    noteLink: "Privacy Notice",
  },
  split: {
    kbd: "among friends",
    titleLead: "Split expenses",
    titleRest: "with anyone.",
    body: (
      <>
        Roommates, your partner or the crew from the trip. Set up a shared budget, log who paid for what, and let Centavos work out <b>who owes whom</b>. No awkward math at the end of the month.
      </>
    ),
    bullets: [
      <><b>Shared budgets</b> for the apartment, the trip or the party</>,
      <><b>What you&apos;re owed and what you owe</b>, tracked per person</>,
      <><b>Settling up</b> tells you the fewest payments it takes to get even</>,
    ],
    storeLabel: "Try it with your crew:",
    mockAlt:
      "App screen for shared expenses: the group's balances and who owes whom, with a button to settle up.",
  },
  reminders: {
    kbd: "no nagging",
    titleLead: "Reminders that",
    titleRest: "stay out of your way.",
    body: (
      <>
        One nudge a day to log your expenses: 30 seconds and you&apos;re caught up. And we tell you <b className="text-ink">before Netflix charges you</b>, so you can decide in time whether it stays or goes.
      </>
    ),
    bullets: [
      <><b>A daily reminder</b> at the time you choose</>,
      <><b>Before every subscription charge</b>, not after</>,
      <>You&apos;re in charge: <b>turn them off</b> whenever you want</>,
    ],
    mockAlt:
      "App screen with reminders: a daily nudge to log expenses and a heads-up before every subscription charge.",
  },
  steps: {
    kicker: "That easy",
    title: "Get started in 3 steps",
    items: [
      { n: "01", t: "Download and create your account", d: "30 seconds. Just your email, never cards or bank details." },
      { n: "02", t: "Log what you spend", d: "Every coffee, every Uber. The + button does it in seconds." },
      { n: "03", t: "See where your money goes", d: "Budgets, subscriptions and payments, all in a notebook that's yours." },
    ],
  },
  tools: null,
  faq: {
    kicker: "Common questions",
    title: "Frequently asked questions",
    items: [
      {
        q: "Does Centavos connect to my bank or my cards?",
        a: "No. Never. Centavos doesn't ask for bank credentials, doesn't sync accounts and doesn't read your transactions. You log what you spend and that information stays in your account.",
      },
      {
        q: "How much does it cost?",
        a: "Downloading and using Centavos is free, on the App Store and Google Play.",
      },
      {
        q: "What do I need to create an account?",
        a: "Just an email address. We don't ask for cards, account numbers or bank details.",
      },
      {
        q: "How do I log an expense?",
        a: "Tap the + button, type the amount, pick a category and you're done. It takes a few seconds. You can add a note if you want.",
      },
      {
        q: "Can I split expenses with my partner, roommates or friends?",
        a: "Yes. You set up a shared budget, everyone logs what they paid, and Centavos works out who owes whom and the fewest payments it takes to get even.",
      },
      {
        q: "Will you flood me with notifications?",
        a: "No. There's one daily reminder to log your expenses, at the time you choose, and a reminder before each subscription charge. You can turn them off whenever you want.",
      },
      {
        q: "How do I delete my account?",
        a: "In the app, under Settings > Profile > Delete account. You can also ask by email at hola@centavos.mx with the subject “Delete account”.",
      },
    ],
    more: "Another question?",
    moreLink: "Write to us",
  },
  closing: {
    kbd: "you're in control",
    titleLead: "Your money,",
    titleRest: "for your eyes only.",
    body: "Download Centavos free and start logging today. No bank connection, no surprises, nobody else looking at your money.",
  },
  disclaimer:
    "The screens shown are illustrative and may differ from the actual app. Figures and data in the images are examples.",
  store: {
    appleAlt: "Download on the App Store",
    googleAlt: "Get it on Google Play",
    newTab: "(opens in a new tab)",
    inlineLabel: "Start logging:",
  },
  bar: {
    title: "Download Centavos free",
    subtitle: "No bank connection",
    goTo: "Go to",
    newTab: "(opens in a new tab)",
  },
};

export const HOME_COPY: Record<SiteLang, HomeCopy> = { es, en };
