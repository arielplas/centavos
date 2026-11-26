// Copy of the Claude connector page (/app/claude) in both languages.
//
// Spanish is the source of truth; English translates it block by block.
// Everything is typed by `ClaudeCopy`, so a key missing on either side fails
// the typecheck instead of shipping a half-translated page.
//
// Text that depends on NEXT_PUBLIC_WEB_APP_ENABLED (the web app at /app/entrar
// is not live yet) is a `Variant`: `web` is the page with the web app, `noWeb`
// the page without it.
//
// `**bold**` marks inline emphasis (rendered by `Rich`). The FAQ answers are
// plain text: they also feed the FAQPage JSON-LD.

import type { SiteLang } from "@/lib/lang";

export type Variant<T> = { web: T; noWeb: T };

type Example = { icon: "plus" | "chart" | "rows"; tint: "peach" | "sky" | "sand"; title: string; prompts: string[] };
type Trust = { icon: "lock" | "chat" | "eye" | "bell" | "power" | "card"; t: string; d: string | Variant<string> };
type Plan = { name: string; sub: string; items: string[] };
export type FaqItem = { q: string; a: string | Variant<string> };

export type ClaudeCopy = {
  meta: { title: string; description: string };
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    /** Only shown when the web app is live: for whoever already has an account. */
    signin: { lead: string; link: string };
    checksLabel: string;
    checkFree: string;
    /** Only shown when the web app is live. */
    checkNoApp: string;
    checkDisconnect: string;
  };
  chat: {
    label: string;
    assistant: string;
    connected: string;
    user1: string;
    tool1: string;
    reply1: string;
    user2: string;
    tool2: string;
    reply2: string;
    bars: [{ label: string; amount: string }, { label: string; amount: string }, { label: string; amount: string }];
    placeholder: string;
    caption: string;
  };
  where: { label: string; items: [string, string, string] };
  examples: { title: string; body: string; hand: string; groups: [Example, Example, Example] };
  how: {
    title: string;
    intro: Variant<string>;
    step1: {
      title: string;
      body: string;
      copy: string;
      copied: string;
      copiedAnnounce: string;
      copyAria: string;
      urlLabel: string;
      soon: string;
    };
    step2: {
      title: string;
      groupLabel: string;
      tabApp: string;
      tabWeb: string;
      app: string;
      web: { body: string; button: string; signupLead: string; signup: string };
      codeExampleLabel: string;
      codeNote: [string, string];
    };
    step3: { title: string; body: string; mockTitle: string; mockBody: string; connect: string; cancel: string };
  };
  control: {
    titleLead: string;
    titleAccent: string;
    body: string;
    items: [Trust, Trust, Trust, Trust, Trust, Trust];
    privacyBefore: string;
    privacyLink: string;
  };
  plans: {
    title: string;
    body: string;
    free: Plan;
    plus: Plan & { badge: string };
    note: string;
  };
  faq: { title: string; items: FaqItem[] };
  cta: {
    title: string;
    body: string;
    primary: string;
    /** Replaces `primary` when the web app is live. */
    signin: string;
    signup: string;
  };
};

export const CLAUDE_COPY: Record<SiteLang, ClaudeCopy> = {
  es: {
    meta: {
      title: "Centavos en Claude",
      description:
        "Conecta tu cuenta de Centavos a Claude para anotar gastos y revisar tus presupuestos y suscripciones desde una conversación. Cómo conectarlo, qué puede hacer, límites y ayuda.",
    },
    hero: {
      badge: "Nuevo · Conector para Claude",
      titleLead: "Tus gastos, ",
      titleAccent: "en una conversación.",
      body: "Conecta Centavos con Claude, el asistente de Anthropic. Dile lo que gastaste o pregúntale cómo vas, y Claude lo anota o te responde con tus números reales. En claude.ai, en la app de escritorio o en tu celular.",
      ctaPrimary: "Conectar con Claude",
      ctaSecondary: "Ver qué le puedes pedir",
      signin: { lead: "¿Ya tienes cuenta?", link: "Entra y conecta Claude" },
      checksLabel: "Lo esencial",
      checkFree: "Gratis con tu cuenta de Centavos",
      checkNoApp: "No necesitas la app",
      checkDisconnect: "Te desconectas cuando quieras",
    },
    chat: {
      label: "Conversación de ejemplo con Claude usando Centavos",
      assistant: "Claude",
      connected: "Centavos conectado",
      user1: "gasté 185 en tacos al pastor",
      tool1: "Usó Centavos · Registrar gasto",
      reply1: "Listo, anoté **$185** en Comida. Este mes llevas **$2,140** de tu presupuesto de $3,500.",
      user2: "¿y en qué se me va más?",
      tool2: "Usó Centavos · Ver gastos",
      reply2: "Comida es lo que más pesa este mes:",
      bars: [
        { label: "Comida", amount: "$720" },
        { label: "Transporte", amount: "$410" },
        { label: "Suscripciones", amount: "$389" },
      ],
      placeholder: "Escríbele a Claude…",
      caption: "Conversación de ejemplo. Las cifras son ilustrativas.",
    },
    where: {
      label: "Funciona donde usas Claude:",
      items: ["claude.ai en el navegador", "App de escritorio", "iPhone y Android"],
    },
    examples: {
      title: "Pídeselo como se lo dirías a alguien.",
      body: "Sin comandos ni formatos: Claude entiende lo que escribes y usa Centavos para hacerlo.",
      hand: "así de fácil",
      groups: [
        {
          icon: "plus",
          tint: "peach",
          title: "Anotar",
          prompts: [
            "«Anota 185 de tacos al pastor en comida.»",
            "«Ayer pagué 650 de gasolina, ponlo en transporte.»",
            "«Me equivoqué, eran 160. Bórralo y anótalo bien.»",
          ],
        },
        {
          icon: "chart",
          tint: "sky",
          title: "Preguntar",
          prompts: [
            "«¿Cuánto llevo gastado esta semana?»",
            "«¿Cómo voy con mis presupuestos este mes?»",
            "«¿En qué gasté más en octubre? Agrúpalo por categoría.»",
          ],
        },
        {
          icon: "rows",
          tint: "sand",
          title: "Organizar",
          prompts: [
            "«Crea un presupuesto de 3,000 al mes para el súper.»",
            "«Mueve el Uber de ayer a mi presupuesto de transporte.»",
            "«Agrega Spotify, 129 al mes, se cobra el día 5.»",
          ],
        },
      ],
    },
    how: {
      title: "Conéctalo en tres pasos.",
      intro: {
        web: "Toma un par de minutos y solo se hace una vez. Necesitas una cuenta de Claude y una de Centavos, que puedes crear aquí mismo.",
        noWeb:
          "Toma un par de minutos y solo se hace una vez. Necesitas una cuenta de Claude y la app de Centavos con tu cuenta creada.",
      },
      step1: {
        title: "Agrega Centavos en Claude",
        body: "En Claude ve a **Personalizar → Conectores → Agregar conector personalizado** y pega esta dirección:",
        copy: "Copiar",
        copied: "Copiada",
        copiedAnnounce: "Dirección copiada",
        copyAria: "Copiar la dirección del conector",
        urlLabel: "Dirección del conector",
        soon: "Muy pronto también podrás encontrarlo como «Centavos» en el directorio de conectores de Claude.",
      },
      step2: {
        title: "Consigue tu código",
        groupLabel: "Dónde sacar el código",
        tabApp: "En la app",
        tabWeb: "En la web",
        app: "Abre Centavos en tu teléfono y entra a **Ajustes → Conectar con Claude → Generar código**.",
        web: {
          body: "Entra a centavos.mx con tu cuenta y genera el código ahí mismo, sin la app.",
          button: "Entrar y conectar",
          signupLead: "¿Todavía no tienes cuenta?",
          signup: "Créala gratis",
        },
        codeExampleLabel: "Ejemplo de código: 7KQ2M-9XD4P",
        codeNote: ["Sirve una sola vez", "y vence en 10 minutos."],
      },
      step3: {
        title: "Pega el código y confirma",
        body: "Claude abre una página de Centavos. Pega el código, revisa que la cuenta sea la tuya y toca **Conectar**. Vuelves a Claude listo para empezar.",
        mockTitle: "Conectar Claude con Centavos",
        mockBody: "Vas a conectar la cuenta de **Ana** (a***@gmail.com).",
        connect: "Conectar",
        cancel: "Cancelar",
      },
    },
    control: {
      titleLead: "Tu cuenta, ",
      titleAccent: "bajo tu control.",
      body: "Claude solo entra a tu cuenta porque tú lo autorizas, y puedes cortarle el acceso en cualquier momento.",
      items: [
        {
          icon: "lock",
          t: "Tú lo apruebas",
          d: "La conexión se autoriza con un código de un solo uso que solo tú puedes generar. No escribes tu contraseña en ningún lado.",
        },
        {
          icon: "chat",
          t: "Claude te pide permiso",
          d: "Antes de anotar, mover o borrar algo, Claude te pregunta. Tú decides si se lo permites siempre.",
        },
        {
          icon: "eye",
          t: "Solo ve tu cuenta",
          d: "El conector solo llega a tus datos de Centavos, y Centavos no recibe tus conversaciones con Claude.",
        },
        {
          icon: "bell",
          t: "Te avisamos",
          d: "Si tienes la app, cada conexión nueva te llega como aviso al celular. Y en Conectar con Claude ves todas las conexiones y puedes cortar cualquiera.",
        },
        {
          icon: "power",
          t: "Desconecta cuando quieras",
          d: {
            web: "Desde la app, desde la web o quitando el conector en Claude. El acceso se corta al instante y tus datos se quedan en Centavos.",
            noWeb:
              "Desde la app o quitando el conector en Claude. El acceso se corta al instante y tus datos se quedan en Centavos.",
          },
        },
        {
          icon: "card",
          t: "No toca tu dinero",
          d: "No se conecta a tu banco ni hace pagos: trabaja con lo que tú anotas en Centavos.",
        },
      ],
      privacyBefore: "Qué datos se comparten con Anthropic y para qué:",
      privacyLink: "Aviso de Privacidad",
    },
    plans: {
      title: "Gratis para empezar.",
      body: "El conector no cuesta nada. Lo que ves desde Claude es lo mismo que ves en la app con tu plan.",
      free: {
        name: "Gratis",
        sub: "Con tu cuenta de Centavos",
        items: [
          "Anotar, mover y borrar gastos",
          "Presupuestos y suscripciones, sin límite",
          "Tu historial de este mes y los dos anteriores",
        ],
      },
      plus: {
        name: "Centavos",
        badge: "Más historial",
        sub: "Se contrata en la app",
        items: [
          "Todo lo del plan gratis",
          "Pregúntale por cualquier mes: todo tu historial",
          "En la app: fotos en tus gastos, temas exclusivos y sin anuncios",
        ],
      },
      note: "De parte de Claude: los conectores personalizados están en todos sus planes, y el plan gratuito permite uno.",
    },
    faq: {
      title: "Preguntas frecuentes",
      items: [
        {
          q: "¿Necesito la app de Centavos?",
          a: {
            web: "No. Puedes crear tu cuenta y sacar tu código en centavos.mx/app. Si ya usas la app, también te sirve: el código sale de Ajustes → Conectar con Claude.",
            noWeb: "Sí. El código para conectar sale de la app de Centavos, en Ajustes → Conectar con Claude.",
          },
        },
        {
          q: "¿Cuánto cuesta?",
          a: "El conector es gratis. Necesitas una cuenta de Centavos y una de Claude; el plan gratuito de Claude permite un conector personalizado.",
        },
        {
          q: "¿Claude ve mis datos todo el tiempo?",
          a: "No. Claude consulta tu cuenta solo cuando le pides algo que la necesita, y Centavos no recibe tus conversaciones.",
        },
        {
          q: "¿Puedo anotar en un presupuesto compartido?",
          a: "Claude puede verlos, pero los gastos de un presupuesto compartido se anotan desde la app, porque se reparten entre sus miembros.",
        },
        {
          q: "¿En qué moneda anota?",
          a: "En la moneda de tu cuenta o la de tu presupuesto. Claude no convierte montos.",
        },
        {
          q: "¿Cómo lo desconecto?",
          a: {
            web: "En la app o en centavos.mx/app, en Conectar con Claude → Desconectar. También puedes quitar el conector en Claude, en Personalizar → Conectores.",
            noWeb:
              "En la app, en Conectar con Claude → Desconectar. También puedes quitar el conector en Claude, en Personalizar → Conectores.",
          },
        },
        { q: "¿Funciona con otras IAs?", a: "Por ahora con Claude. Más adelante llegará a otras." },
      ],
    },
    cta: {
      title: "Empieza en dos minutos.",
      body: "Crea tu cuenta, conecta Claude y anota tu primer gasto escribiendo.",
      primary: "Conectar con Claude",
      signin: "Entrar y conectar",
      signup: "Crear cuenta gratis",
    },
  },

  en: {
    meta: {
      title: "Centavos in Claude",
      description:
        "Connect your Centavos account to Claude to log expenses and review your budgets and subscriptions from a conversation. How to connect, what it can do, limits and help.",
    },
    hero: {
      badge: "New · Connector for Claude",
      titleLead: "Your spending, ",
      titleAccent: "in a conversation.",
      body: "Connect Centavos to Claude, Anthropic’s assistant. Tell it what you spent or ask how you’re doing, and Claude logs it or answers with your real numbers. On claude.ai, in the desktop app or on your phone.",
      ctaPrimary: "Connect to Claude",
      ctaSecondary: "See what you can ask",
      signin: { lead: "Already have an account?", link: "Sign in and connect Claude" },
      checksLabel: "The essentials",
      checkFree: "Free with your Centavos account",
      checkNoApp: "You don’t need the app",
      checkDisconnect: "Disconnect whenever you like",
    },
    chat: {
      label: "Example conversation with Claude using Centavos",
      assistant: "Claude",
      connected: "Centavos connected",
      user1: "spent 185 on tacos al pastor",
      tool1: "Used Centavos · Log expense",
      reply1: "Done, I logged **$185** under Food. This month you’re at **$2,140** of your $3,500 budget.",
      user2: "and what do I spend the most on?",
      tool2: "Used Centavos · View expenses",
      reply2: "Food weighs the most this month:",
      bars: [
        { label: "Food", amount: "$720" },
        { label: "Transport", amount: "$410" },
        { label: "Subscriptions", amount: "$389" },
      ],
      placeholder: "Message Claude…",
      caption: "Example conversation. The figures are illustrative.",
    },
    where: {
      label: "Works wherever you use Claude:",
      items: ["claude.ai in the browser", "Desktop app", "iPhone and Android"],
    },
    examples: {
      title: "Ask it the way you’d ask a person.",
      body: "No commands or formats: Claude understands what you write and uses Centavos to do it.",
      hand: "that easy",
      groups: [
        {
          icon: "plus",
          tint: "peach",
          title: "Log",
          prompts: [
            "“Log 185 for tacos al pastor under food.”",
            "“Yesterday I paid 650 for gas, put it under transport.”",
            "“I got it wrong, it was 160. Delete it and log it right.”",
          ],
        },
        {
          icon: "chart",
          tint: "sky",
          title: "Ask",
          prompts: [
            "“How much have I spent this week?”",
            "“How am I doing on my budgets this month?”",
            "“What did I spend the most on in October? Group it by category.”",
          ],
        },
        {
          icon: "rows",
          tint: "sand",
          title: "Organize",
          prompts: [
            "“Create a 3,000 a month budget for groceries.”",
            "“Move yesterday’s Uber to my transport budget.”",
            "“Add Spotify, 129 a month, charged on the 5th.”",
          ],
        },
      ],
    },
    how: {
      title: "Connect it in three steps.",
      intro: {
        web: "It takes a couple of minutes and you only do it once. You need a Claude account and a Centavos one, which you can create right here.",
        noWeb:
          "It takes a couple of minutes and you only do it once. You need a Claude account and the Centavos app with your account set up.",
      },
      step1: {
        title: "Add Centavos in Claude",
        body: "In Claude go to **Customize → Connectors → Add custom connector** and paste this address:",
        copy: "Copy",
        copied: "Copied",
        copiedAnnounce: "Address copied",
        copyAria: "Copy the connector address",
        urlLabel: "Connector address",
        soon: "Soon you’ll also find it as “Centavos” in Claude’s connectors directory.",
      },
      step2: {
        title: "Get your code",
        groupLabel: "Where to get the code",
        tabApp: "In the app",
        tabWeb: "On the web",
        app: "Open Centavos on your phone and go to **Settings → Connect with Claude → Generate code**.",
        web: {
          body: "Sign in to centavos.mx with your account and generate the code right there, no app needed.",
          button: "Sign in and connect",
          signupLead: "Don’t have an account yet?",
          signup: "Create one for free",
        },
        codeExampleLabel: "Example code: 7KQ2M-9XD4P",
        codeNote: ["Works only once", "and expires in 10 minutes."],
      },
      step3: {
        title: "Paste the code and confirm",
        body: "Claude opens a Centavos page. Paste the code, check that the account is yours and tap **Connect**. You go back to Claude, ready to start.",
        mockTitle: "Connect Claude to Centavos",
        mockBody: "You’re about to connect **Ana**’s account (a***@gmail.com).",
        connect: "Connect",
        cancel: "Cancel",
      },
    },
    control: {
      titleLead: "Your account, ",
      titleAccent: "in your control.",
      body: "Claude only gets into your account because you authorize it, and you can cut its access at any time.",
      items: [
        {
          icon: "lock",
          t: "You approve it",
          d: "The connection is authorized with a one-time code that only you can generate. You never type your password anywhere.",
        },
        {
          icon: "chat",
          t: "Claude asks permission",
          d: "Before logging, moving or deleting anything, Claude asks you. You decide whether to always allow it.",
        },
        {
          icon: "eye",
          t: "It only sees your account",
          d: "The connector only reaches your Centavos data, and Centavos does not receive your conversations with Claude.",
        },
        {
          icon: "bell",
          t: "We let you know",
          d: "If you have the app, every new connection reaches you as a notice on your phone. And in Connect with Claude you see every connection and can cut any of them.",
        },
        {
          icon: "power",
          t: "Disconnect whenever you like",
          d: {
            web: "From the app, from the web or by removing the connector in Claude. Access is cut instantly and your data stays in Centavos.",
            noWeb:
              "From the app or by removing the connector in Claude. Access is cut instantly and your data stays in Centavos.",
          },
        },
        {
          icon: "card",
          t: "It doesn’t touch your money",
          d: "It doesn’t connect to your bank or make payments: it works with what you log in Centavos.",
        },
      ],
      privacyBefore: "What data is shared with Anthropic and why:",
      privacyLink: "Privacy Notice",
    },
    plans: {
      title: "Free to start.",
      body: "The connector costs nothing. What you see from Claude is the same as what you see in the app with your plan.",
      free: {
        name: "Free",
        sub: "With your Centavos account",
        items: [
          "Log, move and delete expenses",
          "Budgets and subscriptions, unlimited",
          "Your history for this month and the two before",
        ],
      },
      plus: {
        name: "Centavos",
        badge: "More history",
        sub: "Subscribe in the app",
        items: [
          "Everything in the free plan",
          "Ask about any month: your full history",
          "In the app: photos on your expenses, exclusive themes and no ads",
        ],
      },
      note: "From Claude’s side: custom connectors are available on all its plans, and the free plan allows one.",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Do I need the Centavos app?",
          a: {
            web: "No. You can create your account and get your code at centavos.mx/app. If you already use the app, that works too: the code comes from Settings → Connect with Claude.",
            noWeb: "Yes. The code to connect comes from the Centavos app, in Settings → Connect with Claude.",
          },
        },
        {
          q: "How much does it cost?",
          a: "The connector is free. You need a Centavos account and a Claude one; Claude’s free plan allows one custom connector.",
        },
        {
          q: "Does Claude see my data all the time?",
          a: "No. Claude looks at your account only when you ask for something that needs it, and Centavos does not receive your conversations.",
        },
        {
          q: "Can I log to a shared budget?",
          a: "Claude can see them, but expenses in a shared budget are logged from the app, because they are split between its members.",
        },
        {
          q: "What currency does it log in?",
          a: "In your account’s currency or your budget’s. Claude does not convert amounts.",
        },
        {
          q: "How do I disconnect it?",
          a: {
            web: "In the app or at centavos.mx/app, in Connect with Claude → Disconnect. You can also remove the connector in Claude, under Customize → Connectors.",
            noWeb:
              "In the app, in Connect with Claude → Disconnect. You can also remove the connector in Claude, under Customize → Connectors.",
          },
        },
        { q: "Does it work with other AIs?", a: "For now with Claude. Others will come later." },
      ],
    },
    cta: {
      title: "Start in two minutes.",
      body: "Create your account, connect Claude and log your first expense by typing it.",
      primary: "Connect to Claude",
      signin: "Sign in and connect",
      signup: "Create a free account",
    },
  },
};

/** Picks the side of a flag-dependent value; plain values pass through. */
export function pick(value: string | Variant<string>, webApp: boolean): string {
  return typeof value === "string" ? value : webApp ? value.web : value.noWeb;
}
