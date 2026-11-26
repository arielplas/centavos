// Copia nueva, solo de la web (docs/app-web.md §9.3). Las claves `app.*` NO
// existen en la app móvil.
//
// Si al construir una pantalla sale otra frase nueva, va en el módulo de esa
// pantalla (por ejemplo `pulso.ts`) o aquí si la comparten varias, siempre en
// los dos idiomas en el mismo cambio.
//
// Desviación del doc: §9.3 pide `app.nav` («Navegación principal») y
// `app.nav.connectClaude` a la vez, y una clave no puede ser texto y grupo, así
// que la primera es `app.nav.label`.

import type { Mirror } from "./types";

const es = {
  app: {
    useAppToEdit: "Para anotar o editar, usa la app.",
    copyLink: "Copiar enlace",
    copiedLink: "Enlace copiado",
    claudeReconnect:
      "Por seguridad, cambiar tu contraseña desconectó Claude. Vuelve a conectarlo en Conectar con Claude.",
    nav: {
      label: "Navegación principal",
      connectClaude: "Claude",
    },
    emptyCta: "Anótalo desde la app",
    emptyCtaBudget: "Créalo desde la app",
    emptyCtaSubscription: "Agrégalas desde la app",
    seeAll: "Ver todos",
    yearLocked: "El año completo es de Centavos+. Actívalo desde la app.",
    monthsLocked: "Los meses anteriores son de Centavos+. Actívalo desde la app.",
    settlements: "Pagos registrados",
    settlementLine: "{{from}} le pagó a {{to}}",
    settlementsInApp: "Para registrar un pago o ver saldos, usa la app.",
    planPremium: "Centavos+",
    planFree: "Gratis",
    language: "Idioma",
    notFound: "No encontramos esta página.",
    network: "No pudimos conectar. Revisa tu internet e inténtalo de nuevo.",
    sessionEnded: "Tu sesión terminó. Vuelve a entrar.",
    applePopupBlocked:
      "Tu navegador bloqueó la ventana de Apple. Permite las ventanas emergentes de centavos.mx e inténtalo de nuevo.",
    unavailable: "La app web no está disponible por ahora.",
    skipToContent: "Saltar al contenido",
  },
};

const en: Mirror<typeof es> = {
  app: {
    useAppToEdit: "To log or edit, use the app.",
    copyLink: "Copy link",
    copiedLink: "Link copied",
    claudeReconnect:
      "For your security, changing your password disconnected Claude. Connect it again from Connect to Claude.",
    nav: {
      label: "Main navigation",
      connectClaude: "Claude",
    },
    emptyCta: "Log it from the app",
    emptyCtaBudget: "Create it in the app",
    emptyCtaSubscription: "Add them in the app",
    seeAll: "See all",
    yearLocked: "The full year is part of Centavos+. Turn it on in the app.",
    monthsLocked: "Earlier months are part of Centavos+. Turn it on in the app.",
    settlements: "Recorded payments",
    settlementLine: "{{from}} paid {{to}}",
    settlementsInApp: "To record a payment or see balances, use the app.",
    planPremium: "Centavos+",
    planFree: "Free",
    language: "Language",
    notFound: "We couldn't find this page.",
    network: "We couldn't connect. Check your connection and try again.",
    sessionEnded: "Your session ended. Please log in again.",
    applePopupBlocked:
      "Your browser blocked the Apple window. Allow pop-ups for centavos.mx and try again.",
    unavailable: "The web app isn't available right now.",
    skipToContent: "Skip to content",
  },
};

export const appCopy = { es, en };
