// Etiquetas de las 14 categorías (salen de aquí, no de la API).
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/categories.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("categories:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  categories: {
    food: "Comida",
    transport: "Transporte",
    entertainment: "Entretenimiento",
    health: "Salud",
    home: "Casa",
    clothing: "Ropa",
    education: "Educación",
    pets: "Mascotas",
    travel: "Viajes",
    gifts: "Regalos",
    personal_care: "Cuidado personal",
    utilities: "Servicios",
    debt: "Deudas y créditos",
    other: "Otros",
  },
};

const en: Mirror<typeof es> = {
  categories: {
    food: "Food",
    transport: "Transport",
    entertainment: "Entertainment",
    health: "Health",
    home: "Home",
    clothing: "Clothing",
    education: "Education",
    pets: "Pets",
    travel: "Travel",
    gifts: "Gifts",
    personal_care: "Personal care",
    utilities: "Utilities",
    debt: "Debt and credit",
    other: "Other",
  },
};

export const categoriesCopy = { es, en };
