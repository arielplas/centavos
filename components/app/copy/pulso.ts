// El Pulso (/app/pulso): home:*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/home.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("home:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  home: {
    greeting: "¿Qué onda con tu lana hoy?",
    loadFailed: "No pudimos cargar tu pulso.",
    emptyEyebrow: "Empieza tu cuaderno",
    emptyTitle: "Anota tu primer\ngasto.",
    emptyBody: "Toma cinco segundos. Después, ponle un techo a una categoría y mira cuánto te queda.",
    availableThisMonth: "Disponible este mes",
    ofBudgeted: "de {{amount}} presupuestados",
    progressA11y: "Llevas {{percent}} por ciento de tus presupuestos",
    spentSoFar: "Llevas {{amount}} ({{percent}}%)",
    onlyCurrency: "Solo cubre presupuestos en {{currency}}.",
    statusGreenLine: "Vas perfecto.",
    statusGreenSub: "Llevas el mes en buen rumbo.",
    statusYellowLine: "Vas justo.",
    statusYellowSub: "Bájale un poco esta semana.",
    statusRedLine: "Te pasaste de tus presupuestos.",
    statusRedSub: "Tranquilo, mañana es otro día.",
    spentA11y: "Gastado: hoy {{today}}, esta semana {{week}}, este mes {{month}}",
    tileToday: "Hoy",
    tileWeek: "Semana",
    tileMonth: "Mes",
    budgetsKicker: "Presupuestos",
    budgetsHeading: "Cómo van tus presupuestos",
    recentKicker: "Lo último",
    recentHeading: "Gastos recientes",
    // Copia nueva de la web (no está en la app, donde esta etiqueta está escrita en español).
    otherCurrencyTag: "{{currency}} · independiente",
  },
};

const en: Mirror<typeof es> = {
  home: {
    greeting: "How's your money today?",
    loadFailed: "We couldn't load your pulse.",
    emptyEyebrow: "Start your notebook",
    emptyTitle: "Log your first\nexpense.",
    emptyBody: "It takes five seconds. Then put a cap on a category and watch what's left.",
    availableThisMonth: "Available this month",
    ofBudgeted: "of {{amount}} budgeted",
    progressA11y: "You're at {{percent}} percent of your budgets",
    spentSoFar: "{{amount}} spent ({{percent}}%)",
    onlyCurrency: "Only covers budgets in {{currency}}.",
    statusGreenLine: "Looking good.",
    statusGreenSub: "You're on track this month.",
    statusYellowLine: "Cutting it close.",
    statusYellowSub: "Ease off a little this week.",
    statusRedLine: "You've gone over your budgets.",
    statusRedSub: "Take it easy — tomorrow's another day.",
    spentA11y: "Spent: today {{today}}, this week {{week}}, this month {{month}}",
    tileToday: "Today",
    tileWeek: "Week",
    tileMonth: "Month",
    budgetsKicker: "Budgets",
    budgetsHeading: "How your budgets are doing",
    recentKicker: "Latest",
    recentHeading: "Recent expenses",
    otherCurrencyTag: "{{currency}} · standalone",
  },
};

export const pulsoCopy = { es, en };
