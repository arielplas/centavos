// Suscripciones (/app/suscripciones): subscriptions:*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/subscriptions.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("subscriptions:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  subscriptions: {
    title: "Suscripciones",
    kicker: "Pagos recurrentes",
    loadFailed: "No pudimos cargar tus suscripciones.",
    monthlyTotal: "Pagas al mes",
    chargedToday: "Se cobra hoy",
    chargedTomorrow: "Se cobra mañana",
    chargedInDays_one: "En {{count}} día",
    chargedInDays_other: "En {{count}} días",
    detail: {
      annual: "Anual",
    },
    perYear: "Al año",
    perYearShort: "año",
    perMonthShort: "mes",
    activeCount_one: "{{count}} activa",
    activeCount_other: "{{count}} activas",
    includesYearly: "Incluye {{amount}} al mes de anuales",
    group: {
      week: "Próximos 7 días",
      month: "Próximos 30 días",
      later: "Más adelante",
    },
    chargeCount_one: "{{count}} cobro",
    chargeCount_other: "{{count}} cobros",
    cancelledOne: "Cancelada",
    cancelledToggle: "Canceladas ({{count}})",
    rowA11y: "{{name}}, {{amount}} {{period}}, {{when}}",
    rowA11yCancelled: "{{name}}, {{amount}}, cancelada",
    periodMonth: "al mes",
    periodYear: "al año",
    emptyTitle: "Aún no tienes suscripciones",
    emptyBody: "Agrega lo que pagas cada mes o cada año y ve cuánto se te va.",
    thisWeek: "Se cobra esta semana",
  },
};

const en: Mirror<typeof es> = {
  subscriptions: {
    title: "Subscriptions",
    kicker: "Recurring payments",
    loadFailed: "We couldn't load your subscriptions.",
    monthlyTotal: "You pay per month",
    chargedToday: "Charged today",
    chargedTomorrow: "Charged tomorrow",
    chargedInDays_one: "In {{count}} day",
    chargedInDays_other: "In {{count}} days",
    detail: {
      annual: "Yearly",
    },
    perYear: "Per year",
    perYearShort: "yr",
    perMonthShort: "mo",
    activeCount_one: "{{count}} active",
    activeCount_other: "{{count}} active",
    includesYearly: "Includes {{amount}}/mo from yearly plans",
    group: {
      week: "Next 7 days",
      month: "Next 30 days",
      later: "Later",
    },
    chargeCount_one: "{{count}} charge",
    chargeCount_other: "{{count}} charges",
    cancelledOne: "Cancelled",
    cancelledToggle: "Cancelled ({{count}})",
    rowA11y: "{{name}}, {{amount}} {{period}}, {{when}}",
    rowA11yCancelled: "{{name}}, {{amount}}, cancelled",
    periodMonth: "per month",
    periodYear: "per year",
    emptyTitle: "No subscriptions yet",
    emptyBody: "Add what you pay every month or year and see where it goes.",
    thisWeek: "Due this week",
  },
};

export const suscripcionesCopy = { es, en };
