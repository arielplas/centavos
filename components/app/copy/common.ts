// Se usa en toda la app web: acciones, fechas relativas, pestañas.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/common.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("common:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  common: {
    loading: "Cargando",
    actions: {
      done: "Listo",
      cancel: "Cancelar",
      retry: "Reintentar",
      continue: "Continuar",
      close: "Cerrar",
      back: "Atrás",
      saveChanges: "Guardar cambios",
      saving: "Guardando…",
    },
    dates: {
      today: "Hoy",
      yesterday: "Ayer",
      inDays_one: "En {{count}} día",
      inDays_other: "En {{count}} días",
      agoDays_one: "Hace {{count}} día",
      agoDays_other: "Hace {{count}} días",
    },
    installment: {
      weekly: "semanal",
      monthly: "mensual",
    },
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    or: "o",
    nothingHere: "Nada por aquí",
    stepProgress: "Paso {{step}} de {{total}}",
    fields: {
      // La palabra corta se ve dentro del campo; la frase completa es su nombre accesible (como la app).
      show: "Ver",
      hide: "Ocultar",
      showPassword: "Ver contraseña",
      hidePassword: "Ocultar contraseña",
    },
    tabs: {
      pulse: "Pulso",
      expenses: "Gastos",
      budgets: "Presupuestos",
      subscriptions: "Suscripciones",
    },
    months: {
      sheetTitle: "Elegir mes",
    },
  },
};

const en: Mirror<typeof es> = {
  common: {
    loading: "Loading",
    actions: {
      done: "Done",
      cancel: "Cancel",
      retry: "Try again",
      continue: "Continue",
      close: "Close",
      back: "Back",
      saveChanges: "Save changes",
      saving: "Saving…",
    },
    dates: {
      today: "Today",
      yesterday: "Yesterday",
      inDays_one: "In {{count}} day",
      inDays_other: "In {{count}} days",
      agoDays_one: "{{count}} day ago",
      agoDays_other: "{{count}} days ago",
    },
    installment: {
      weekly: "weekly",
      monthly: "monthly",
    },
    genericError: "Something went wrong. Please try again.",
    or: "or",
    nothingHere: "Nothing here",
    stepProgress: "Step {{step}} of {{total}}",
    fields: {
      show: "Show",
      hide: "Hide",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    tabs: {
      pulse: "Pulse",
      expenses: "Expenses",
      budgets: "Budgets",
      subscriptions: "Subscriptions",
    },
    months: {
      sheetTitle: "Choose month",
    },
  },
};

export const commonCopy = { es, en };
