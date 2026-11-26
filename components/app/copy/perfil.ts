// Perfil (/app/perfil): settings:rows.signOut, settings:language.*…
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/settings.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("settings:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  settings: {
    title: "Ajustes",
    groups: {
      account: "Cuenta",
      help: "Ayuda y legal",
    },
    // Copia nueva de la web (§4.6, Perfil): no existe en la app.
    planLabel: "Plan",
    rows: {
      language: "Idioma",
      terms: "Términos de servicio",
      privacy: "Aviso de privacidad",
      support: "Soporte",
      signOut: "Cerrar sesión",
      connectClaude: "Conectar con Claude",
    },
    language: {
      title: "Idioma",
      caption: "Idioma de la app",
      footnote: "El idioma cambia los textos, las fechas y los separadores de miles. Tu moneda no cambia: esa se elige en tu perfil.",
    },
  },
};

const en: Mirror<typeof es> = {
  settings: {
    title: "Settings",
    groups: {
      account: "Account",
      help: "Help & legal",
    },
    planLabel: "Plan",
    rows: {
      language: "Language",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      support: "Support",
      signOut: "Log out",
      connectClaude: "Connect to Claude",
    },
    language: {
      title: "Language",
      caption: "App language",
      footnote: "The language changes copy, dates and thousands separators. Your currency doesn't change — that's set in your profile.",
    },
  },
};

export const perfilCopy = { es, en };
