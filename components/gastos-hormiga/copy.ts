// Copy of the gastos hormiga calculator (the client island and its save flow)
// in both languages. Spanish is the source of truth; the type makes a key
// missing in one language a typecheck error. The text of the page around it
// (headings, sections, FAQ) is in page-copy.tsx and stays on the server.

import type { Category, Period } from "@/lib/gastos-hormiga";
import type { SaveErrorCode } from "@/lib/gastos-hormiga-api";
import type { SiteLang } from "@/lib/lang";

/**
 * One-tap suggestions, so the list never starts as a blank form. Amounts are
 * ordinary prices in Mexican pesos and are meant to be edited; the category is
 * what the expense gets in the app if the list is saved.
 */
export const PRESETS = [
  { key: "coffee", amount: 60, times: 1, period: "day", category: "food" },
  { key: "snack", amount: 25, times: 5, period: "week", category: "food" },
  { key: "ride", amount: 120, times: 3, period: "week", category: "transport" },
  { key: "delivery", amount: 250, times: 1, period: "week", category: "food" },
  { key: "cigarettes", amount: 85, times: 2, period: "week", category: "other" },
  { key: "subscription", amount: 199, times: 1, period: "month", category: "entertainment" },
] as const satisfies readonly { key: string; amount: number; times: number; period: Period; category: Category }[];

export type PresetKey = (typeof PRESETS)[number]["key"];

export type GastosHormigaCopy = {
  // The list
  presetsLegend: string;
  presetsHint: string;
  presets: Record<PresetKey, string>;
  listLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  amountLabel: string;
  timesLabel: string;
  periodLabel: string;
  periods: Record<Period, string>;
  /** Accessible name of a row's remove button. */
  remove: (name: string) => string;
  incomplete: string;
  add: string;
  limit: (max: number) => string;
  empty: string;
  // The result
  monthlyKicker: string;
  monthlyNote: string;
  yearlyKicker: string;
  yearlyNote: string;
  breakdownHeading: string;
  frequency: (times: number, period: Period) => string;
  perMonth: string;
  perYear: string;
  aheadKicker: string;
  aheadTitle: (years: number, amount: string) => string;
  aheadBody: (months: number) => string;
  // Saving the list
  saveKicker: string;
  saveTitle: string;
  saveBody: string;
  saveYes: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailNote: string;
  privacyLink: string;
  saveSubmit: string;
  saving: string;
  savedKicker: string;
  savedTitle: string;
  savedBody: (email: string) => string;
  sameEmailNote: string;
  existingAccountNote: string;
  downloadHeading: string;
  saveAgainHint: string;
  saveAgain: string;
  errorPrefix: string;
  errors: Record<SaveErrorCode, string>;
};

export const GASTOS_HORMIGA_COPY: Record<SiteLang, GastosHormigaCopy> = {
  es: {
    presetsLegend: "Agrega uno con un toque",
    presetsHint: "Los montos son aproximados: cámbialos por lo que tú pagas.",
    presets: {
      coffee: "Café",
      snack: "Refresco o botana",
      ride: "Uber o taxi",
      delivery: "Comida a domicilio",
      cigarettes: "Cigarros",
      subscription: "Suscripción",
    },
    listLabel: "Tus gastos hormiga",
    nameLabel: "Gasto",
    namePlaceholder: "Ej. Chicles",
    amountLabel: "Costo",
    timesLabel: "Veces",
    periodLabel: "Por",
    periods: { day: "día", week: "semana", month: "mes" },
    remove: (name) => (name ? `Quitar ${name}` : "Quitar este gasto"),
    incomplete: "Ponle nombre, costo y veces para que cuente.",
    add: "Agregar un gasto",
    limit: (max) => `Llegaste al máximo de ${max} gastos.`,
    empty: "Agrega tu primer gasto para ver cuánto suma.",
    monthlyKicker: "Al mes",
    monthlyNote: "es lo que suman tus gastos hormiga",
    yearlyKicker: "Al año",
    yearlyNote: "si los mantienes igual todo el año",
    breakdownHeading: "Lo que más pesa, primero",
    frequency: (n, period) =>
      `${n} ${n === 1 ? "vez" : "veces"} ${{ day: "al día", week: "a la semana", month: "al mes" }[period]}`,
    perMonth: "al mes",
    perYear: "al año",
    aheadKicker: "Para que lo dimensiones",
    aheadTitle: (years, amount) => `En ${years} años son ${amount}`,
    aheadBody: (months) =>
      `Es lo mismo de siempre, repetido ${months} meses y sin contar que los precios suben. No se trata de quitarlos todos: se trata de que los elijas tú.`,
    saveKicker: "que no se quede aquí",
    saveTitle: "¿Quieres guardarlo?",
    saveBody:
      "Déjanos tu correo y, cuando crees tu cuenta en la app con él, estos gastos ya te estarán esperando en un presupuesto llamado «Gastos Hormiga».",
    saveYes: "Sí, guárdalo",
    emailLabel: "Tu correo",
    emailPlaceholder: "tu@correo.com",
    emailNote: "Guardamos tu correo y tu lista solo para que te estén esperando cuando te registres. Lee el",
    privacyLink: "Aviso de Privacidad",
    saveSubmit: "Guardar mi lista",
    saving: "Guardando…",
    savedKicker: "un paso más",
    savedTitle: "Lista guardada",
    savedBody: (email) =>
      `Descarga Centavos y regístrate en la app con ${email}: tu presupuesto «Gastos Hormiga» ya te estará esperando con estos gastos.`,
    sameEmailNote: "Importante: tiene que ser exactamente el mismo correo. Si te registras con otro, la lista no aparece.",
    existingAccountNote:
      "¿Ya tienes cuenta en Centavos? Esto solo funciona con cuentas nuevas: crea el presupuesto directo en la app.",
    downloadHeading: "Descarga Centavos",
    saveAgainHint: "¿Cambiaste algo? Guárdala otra vez: la lista nueva reemplaza a la anterior.",
    saveAgain: "Guardar de nuevo",
    errorPrefix: "Error:",
    errors: {
      EMAIL: "Revisa tu correo: no parece válido.",
      LIST: "No pudimos guardar la lista como está. Revisa que cada gasto tenga nombre, costo y veces, e inténtalo de nuevo.",
      RATE_LIMIT: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
      NETWORK: "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.",
      UNKNOWN: "Algo salió mal de nuestro lado. Tu lista sigue aquí: inténtalo de nuevo en un momento.",
    },
  },
  en: {
    presetsLegend: "Add one with a tap",
    presetsHint: "Amounts are typical prices in Mexican pesos: change them to what you pay.",
    presets: {
      coffee: "Coffee",
      snack: "Soda or snack",
      ride: "Uber or taxi",
      delivery: "Food delivery",
      cigarettes: "Cigarettes",
      subscription: "Subscription",
    },
    listLabel: "Your small expenses",
    nameLabel: "Expense",
    namePlaceholder: "e.g. Gum",
    amountLabel: "Cost",
    timesLabel: "Times",
    periodLabel: "Per",
    periods: { day: "day", week: "week", month: "month" },
    remove: (name) => (name ? `Remove ${name}` : "Remove this expense"),
    incomplete: "Give it a name, a cost and a number of times so it counts.",
    add: "Add an expense",
    limit: (max) => `You've reached the limit of ${max} expenses.`,
    empty: "Add your first expense to see what it adds up to.",
    monthlyKicker: "Per month",
    monthlyNote: "is what your small expenses add up to",
    yearlyKicker: "Per year",
    yearlyNote: "if you keep them up all year",
    breakdownHeading: "Biggest first",
    frequency: (n, period) => `${n === 1 ? "once" : n === 2 ? "twice" : `${n} times`} a ${period}`,
    perMonth: "a month",
    perYear: "a year",
    aheadKicker: "To put it in perspective",
    aheadTitle: (years, amount) => `In ${years} years that's ${amount}`,
    aheadBody: (months) =>
      `That's the same habits repeated for ${months} months, before any price increases. The point isn't to cut them all: it's to make sure you're the one choosing them.`,
    saveKicker: "don't leave it here",
    saveTitle: "Want to save it?",
    saveBody:
      "Leave your email and, when you create your account in the app with it, these expenses will be waiting in a budget called “Small Expenses”.",
    saveYes: "Yes, save it",
    emailLabel: "Your email",
    emailPlaceholder: "you@email.com",
    emailNote: "We keep your email and your list only so they are waiting when you sign up. Read the",
    privacyLink: "Privacy Notice",
    saveSubmit: "Save my list",
    saving: "Saving…",
    savedKicker: "one more step",
    savedTitle: "List saved",
    savedBody: (email) =>
      `Download Centavos and sign up in the app with ${email}: your “Small Expenses” budget will be waiting with these expenses.`,
    sameEmailNote: "Important: it has to be exactly the same email. If you sign up with a different one, the list won't show up.",
    existingAccountNote:
      "Already have a Centavos account? This only works for new accounts: create the budget right in the app.",
    downloadHeading: "Download Centavos",
    saveAgainHint: "Changed something? Save it again: the new list replaces the old one.",
    saveAgain: "Save again",
    errorPrefix: "Error:",
    errors: {
      EMAIL: "Check your email: it doesn't look valid.",
      LIST: "We couldn't save the list as it is. Check that every expense has a name, a cost and a number of times, then try again.",
      RATE_LIMIT: "Too many attempts. Wait a few minutes and try again.",
      NETWORK: "We couldn't connect. Check your connection and try again.",
      UNKNOWN: "Something went wrong on our side. Your list is still here: try again in a moment.",
    },
  },
};
