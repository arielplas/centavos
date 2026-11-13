// Landing copy in both languages.
//
// Spanish is the source of truth; English translates it section by section.
// Everything is typed by `HomeCopy`, so a key missing on either side fails the
// typecheck instead of shipping a half-translated page.

import type { ReactNode } from "react";
import type { SiteLang } from "@/lib/lang";

type Feature = {
  t: string;
  d: ReactNode;
  /** Link to a free tool. The tools are Spanish-only, so English leaves it out. */
  tool?: { href: string; label: string };
};

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
    titleLead: string;
    titleAccent: string;
    body: string;
    commitmentsLabel: string;
    commitments: string[];
    /** Handwritten margin note beside the phone. */
    note: string;
    mockAlt: string;
  };
  features: {
    title: string;
    /** Same order as the mocks: budgets, subscriptions, installments. */
    items: [Feature, Feature, Feature];
  };
  privacy: {
    title: { lead: string; accent: string };
    body: string;
    noteBefore: string;
    noteLink: string;
    /** Screen-reader description of the sign-up form mock. */
    mockAlt: string;
  };
  split: {
    titleLead: string;
    titleRest: string;
    body: ReactNode;
    storeLabel: string;
    mockAlt: string;
  };
  reminders: {
    titleLead: string;
    titleRest: string;
    body: string;
    /** Screen-reader description of the two notification cards. */
    cardsAlt: string;
  };
  /**
   * Free calculators. `null` in English: all but one are Spanish-only pages
   * about Mexican payroll and tax rules, and an English card would promise a
   * translation that is not there. The bilingual one (gastos hormiga) reaches
   * the English landing through the footer.
   */
  tools: null | {
    title: string;
    body: string;
    /** `featured` makes the card the dark one with orange accents: the one we most want opened. */
    items: { href: string; tag: string; t: string; d: string; featured?: boolean }[];
  };
  /** Answers must be plain text: they also feed the FAQPage JSON-LD. */
  faq: {
    title: string;
    items: { q: string; a: string }[];
    more: string;
    moreLink: string;
  };
  closing: {
    titleLead: string;
    titleRest: string;
    body: string;
    /** Lines handwritten on the notebook page. */
    entries: [string, string, string];
  };
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
    titleLead: "La app para anotar tus gastos,",
    titleAccent: "sin conectar tu banco",
    body: "Abres la app, escribes el monto, eliges la categoría y ya quedó. Lo anotas tú, a mano: tu banco y tus tarjetas se quedan fuera.",
    commitmentsLabel: "Compromisos de Centavos",
    commitments: ["Gratis en iOS y Android", "Hecho en México"],
    note: "y listo, anotado",
    mockAlt:
      "Pantalla de la app mostrando el Pulso: se anota un gasto de $85 en Comida y tu dinero disponible del mes baja de $3,541 a $3,456.",
  },
  features: {
    title: "Presupuestos, suscripciones y meses sin intereses en el mismo cuaderno",
    items: [
      {
        t: "Presupuestos",
        d: <>Ponle un límite a cada categoría y ve de un vistazo <mark className="mark">cuánto te queda</mark> para llegar a fin de mes.</>,
      },
      {
        t: "Suscripciones",
        d: <>Netflix, Spotify, el gym, el iCloud que ya ni usas. Centavos suma tus cargos recurrentes y te dice <mark className="mark">cuánto se te va al mes y al año</mark>.</>,
      },
      {
        t: "Meses sin intereses",
        d: <>Registra tus compras a meses y ve tu calendario de pagos: cuánto pagas este mes y <mark className="mark">cuántas mensualidades te faltan</mark>. Lo anotas tú, como todo lo demás.</>,
        tool: { href: "/meses-sin-intereses", label: "Calcula tu mensualidad a MSI" },
      },
    ],
  },
  privacy: {
    title: { lead: "Tu cuenta pide tres datos.", accent: "Ninguno es de tu banco." },
    body: "Centavos es un cuaderno privado: cada gasto lo anotas tú y se queda en tu cuenta. Por eso nunca te pide la clave de tu banco.",
    noteBefore: "Los detalles están en el",
    noteLink: "Aviso de Privacidad",
    mockAlt: "Formulario para crear tu cuenta en Centavos con tres campos: nombre, correo y contraseña.",
  },
  split: {
    titleLead: "Divide gastos",
    titleRest: "con quien quieras.",
    body: (
      <>
        Roomies, pareja o la banda del viaje. Armen un presupuesto compartido, anoten quién pagó qué, y Centavos calcula <b>quién le debe a quién</b> y el mínimo de pagos para quedar a mano.
      </>
    ),
    storeLabel: "Pruébalo con tu banda:",
    mockAlt:
      "Pantalla de la app de gastos compartidos: los balances del grupo y quién le debe a quién, con un botón para ajustar cuentas.",
  },
  reminders: {
    titleLead: "Te avisa antes",
    titleRest: "de cada cobro.",
    body: "Un aviso al día para anotar, a la hora que tú elijas, y un recordatorio antes de cada cobro de suscripción. Los apagas cuando quieras.",
    cardsAlt: "Dos avisos de la app: uno para anotar los gastos del día y otro antes del cobro de Netflix.",
  },
  // Free calculators: tool pages that bring organic traffic and link back to
  // the app. The featured card goes first, the rest follow by search volume.
  tools: {
    title: "Calculadoras gratis, hechas para México",
    body: "Sácale la cuenta a tu aguinaldo, tu finiquito o tus compras a meses. Con la ley en la mano y sin registrarte.",
    items: [
      { href: "/gastos-hormiga", tag: "cafecitos y antojos", t: "Gastos hormiga", d: "Anota tus gastos chiquitos de todos los días y mira cuánto suman al mes y al año.", featured: true },
      { href: "/aguinaldo", tag: "cada diciembre", t: "Aguinaldo", d: "Cuánto te toca según tu sueldo y los días que trabajaste en el año." },
      { href: "/finiquito", tag: "finiquito y liquidación", t: "Finiquito", d: "El desglose de lo que te corresponde al salir, concepto por concepto." },
      { href: "/vacaciones", tag: "días y prima", t: "Vacaciones", d: "Cuántos días te tocan por antigüedad y cuánto es tu prima vacacional." },
      { href: "/meses-sin-intereses", tag: "compras a plazos", t: "Meses sin intereses", d: "Tu mensualidad, el calendario de pagos y cuánto cuesta de verdad la promoción." },
      { href: "/ptu", tag: "reparto de utilidades", t: "PTU", d: "Estima cuánto te toca de utilidades, con el tope de la reforma 2021." },
      { href: "/cetes", tag: "ahorro e inversión", t: "CETES", d: "Cuánto ganas según el monto, el plazo y la tasa de la subasta." },
    ],
  },
  // FAQ: answers objections (conversion) and feeds the FAQPage rich result
  // (SEO). Only claims already made on the site or in the terms.
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Centavos se conecta a mi banco o a mis tarjetas?",
        a: "No. Centavos nunca te pide credenciales bancarias, no sincroniza cuentas ni lee tus movimientos. Tú anotas lo que gastas y esa información se queda en tu cuenta.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Descargar y usar Centavos es gratis, en App Store y Google Play.",
      },
      {
        q: "¿Qué necesito para crear mi cuenta?",
        a: "Tu nombre, un correo y una contraseña. No pedimos tarjetas, número de cuenta ni datos del banco.",
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
    titleLead: "Empieza por",
    titleRest: "el gasto de hoy.",
    body: "Descarga Centavos, es gratis, y anota el primero en segundos.",
    entries: ["tacos · $85", "Uber · $62", "cafecito · $48"],
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
    titleLead: "The app to track your spending,",
    titleAccent: "without linking your bank",
    body: "Open the app, type the amount, pick a category, done. You log it by hand, so your bank and your cards stay out of it.",
    commitmentsLabel: "What Centavos promises",
    commitments: ["Free on iOS and Android", "Made in Mexico"],
    note: "and done, it's logged",
    mockAlt:
      "App screen showing Pulse: an $85 food expense is logged and the money available this month goes from $3,541 to $3,456.",
  },
  features: {
    title: "Budgets, subscriptions and installments in the same notebook",
    items: [
      {
        t: "Budgets",
        d: <>Set a limit for each category and see at a glance <mark className="mark">how much you have left</mark> to reach the end of the month.</>,
      },
      {
        t: "Subscriptions",
        d: <>Netflix, Spotify, the gym, the iCloud plan you don&apos;t even use anymore. Centavos adds up your recurring charges and tells you <mark className="mark">how much goes out every month and every year</mark>.</>,
      },
      {
        t: "Installments",
        d: <>Log what you buy in interest-free monthly installments (meses sin intereses) and see your payment calendar: how much is due this month and <mark className="mark">how many payments are left</mark>. You log it yourself, like everything else.</>,
      },
    ],
  },
  privacy: {
    title: { lead: "Your account asks for three things.", accent: "None of them is your bank." },
    body: "Centavos is a private notebook: you log every expense yourself and it stays in your account. That's why it never asks for your bank password.",
    noteBefore: "The details are in the",
    noteLink: "Privacy Notice",
    mockAlt: "Centavos sign-up form with three fields: name, email and password.",
  },
  split: {
    titleLead: "Split expenses",
    titleRest: "with anyone.",
    body: (
      <>
        Roommates, your partner or the crew from the trip. Set up a shared budget, log who paid for what, and Centavos works out <b>who owes whom</b> and the fewest payments it takes to get even.
      </>
    ),
    storeLabel: "Try it with your crew:",
    mockAlt:
      "App screen for shared expenses: the group's balances and who owes whom, with a button to settle up.",
  },
  reminders: {
    titleLead: "A heads-up before",
    titleRest: "every charge.",
    body: "One reminder a day to log, at the time you choose, and a heads-up before each subscription charge. Turn them off whenever you want.",
    cardsAlt: "Two app notifications: one to log the day's expenses and one before the Netflix charge.",
  },
  tools: null,
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Does Centavos connect to my bank or my cards?",
        a: "No. Centavos never asks for bank credentials, doesn't sync accounts and doesn't read your transactions. You log what you spend and that information stays in your account.",
      },
      {
        q: "How much does it cost?",
        a: "Downloading and using Centavos is free, on the App Store and Google Play.",
      },
      {
        q: "What do I need to create an account?",
        a: "Your name, an email address and a password. We don't ask for cards, account numbers or bank details.",
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
    titleLead: "Start with",
    titleRest: "today's expense.",
    body: "Download Centavos, it's free, and log your first one in seconds.",
    entries: ["tacos · $85", "Uber · $62", "coffee · $48"],
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
