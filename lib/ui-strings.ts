// Chrome copy (header, footer, legal shell) in both languages.
//
// Only the pages that can be served in English read the `en` side; every other
// page keeps the Spanish default.

import type { SiteLang } from "./lang";

export type UIStrings = {
  skipToContent: string;
  /** Accessible name of the logo link. */
  homeLabel: string;
  support: string;
  download: string;
  downloadFull: string;
  mainNav: string;
  onThisPage: string;
  tableOfContents: string;
  lastUpdated: string;
  backToTop: string;
  footerNav: string;
  footerTagline: string;
  footerSupportHeading: string;
  footerLegalHeading: string;
  footerSupportLink: string;
  footerDeleteAccount: string;
  footerTerms: string;
  footerPrivacy: string;
  footerMadeIn: string;
  /** Label of the link that switches to the other language. */
  switchToLabel: string;
  /** Accessible name for that link. */
  switchToAria: string;
};

export const UI: Record<SiteLang, UIStrings> = {
  es: {
    skipToContent: "Saltar al contenido",
    homeLabel: "Centavos · Inicio",
    support: "Soporte",
    download: "Descargar",
    downloadFull: "Descargar gratis",
    mainNav: "Principal",
    onThisPage: "En esta página",
    tableOfContents: "Tabla de contenidos",
    lastUpdated: "Última actualización",
    backToTop: "Volver arriba",
    footerNav: "Pie de página",
    footerTagline: "Le ayudamos a la gente a perderle el miedo a las finanzas.",
    footerSupportHeading: "Soporte",
    footerLegalHeading: "Legal",
    footerSupportLink: "Soporte y contacto",
    footerDeleteAccount: "Eliminar cuenta",
    footerTerms: "Términos y Condiciones",
    footerPrivacy: "Aviso de Privacidad",
    footerMadeIn: "Hecho en México 🇲🇽",
    switchToLabel: "English",
    switchToAria: "Read this page in English",
  },
  en: {
    skipToContent: "Skip to content",
    homeLabel: "Centavos · Home",
    support: "Support",
    download: "Download",
    downloadFull: "Download free",
    mainNav: "Main",
    onThisPage: "On this page",
    tableOfContents: "Table of contents",
    lastUpdated: "Last updated",
    backToTop: "Back to top",
    footerNav: "Footer",
    footerTagline: "We help people stop being afraid of their finances.",
    footerSupportHeading: "Support",
    footerLegalHeading: "Legal",
    footerSupportLink: "Support and contact",
    footerDeleteAccount: "Delete your account",
    footerTerms: "Terms and Conditions",
    footerPrivacy: "Privacy Notice",
    footerMadeIn: "Made in Mexico 🇲🇽",
    switchToLabel: "Español",
    switchToAria: "Leer esta página en español",
  },
};
