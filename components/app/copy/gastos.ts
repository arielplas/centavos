// Historial de gastos (/app/gastos): expenses:history.*, range.*, search.*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/expenses.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("expenses:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  expenses: {
    history: {
      title: "Tus gastos",
      emptyTitle: "Aún no hay gastos aquí",
      emptyBody: "Anota lo que gastas y ve a dónde se va.",
      loadFailed: "No pudimos cargar tus gastos.",
      clearSearch: "Borrar búsqueda",
      filterByCategory: "Filtrar por categoría",
      category: "Categoría",
      thisWeek: "Esta semana",
      thisMonth: "Este mes",
      count_one: "{{count}} gasto",
      count_other: "{{count}} gastos",
      allCategories: "Todas",
      searchPlaceholder: "Buscar en notas...",
      searchA11y: "Buscar en notas",
      today: "Hoy",
      periodDay: "Hoy",
      periodWeek: "Semana",
      periodMonth: "Mes",
      noResults: "No hay gastos con esos filtros",
      kicker: "Historial",
    },
    photoCount_one: "{{count}} foto",
    photoCount_other: "{{count}} fotos",
    range: {
      day: "Hoy",
      week: "Semana",
      month: "Mes",
      year: "Año",
      totalDay: "Hoy",
      totalWeek: "Esta semana",
      totalMonth: "Este mes",
      totalYear: "Este año",
    },
    search: {
      allHistory: "Buscando en todo tu historial",
      limitedDay: "Esta búsqueda solo ve los gastos de hoy",
      limitedWeek: "Esta búsqueda solo ve esta semana",
      limitedMonth: "Esta búsqueda solo ve este mes",
      limitedYear: "Esta búsqueda solo ve este año",
      unlockAll: "Buscar en todo tu historial con Centavos+",
      unlockInApp: "Buscar en todo tu historial es de Centavos+. Actívalo desde la app.",
    },
  },
};

const en: Mirror<typeof es> = {
  expenses: {
    history: {
      title: "Your expenses",
      emptyTitle: "No expenses here yet",
      emptyBody: "Log what you spend and see where it goes.",
      loadFailed: "We couldn't load your expenses.",
      clearSearch: "Clear search",
      filterByCategory: "Filter by category",
      category: "Category",
      thisWeek: "This week",
      thisMonth: "This month",
      count_one: "{{count}} expense",
      count_other: "{{count}} expenses",
      allCategories: "All",
      searchPlaceholder: "Search notes...",
      searchA11y: "Search notes",
      today: "Today",
      periodDay: "Today",
      periodWeek: "Week",
      periodMonth: "Month",
      noResults: "No expenses match those filters",
      kicker: "History",
    },
    photoCount_one: "{{count}} photo",
    photoCount_other: "{{count}} photos",
    range: {
      day: "Today",
      week: "Week",
      month: "Month",
      year: "Year",
      totalDay: "Today",
      totalWeek: "This week",
      totalMonth: "This month",
      totalYear: "This year",
    },
    search: {
      allHistory: "Searching your whole history",
      limitedDay: "This search only covers today",
      limitedWeek: "This search only covers this week",
      limitedMonth: "This search only covers this month",
      limitedYear: "This search only covers this year",
      unlockAll: "Search your whole history with Centavos+",
      unlockInApp: "Searching your whole history is part of Centavos+. Turn it on in the app.",
    },
  },
};

export const gastosCopy = { es, en };
