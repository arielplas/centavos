// Conectar con Claude: settings:connectClaude.*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/settings.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("settings:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  settings: {
    connectClaude: {
      title: "Conectar con Claude",
      intro: "Deja que Claude vea tus gastos y anote nuevos por ti, directo desde su app.",
      step1Title: "Paso 1 · Añade Centavos en Claude",
      step1Body: "Agrega este enlace como conector personalizado en Claude.",
      share: "Compartir enlace",
      openClaude: "Abrir claude.ai",
      step2Title: "Paso 2 · Genera tu código",
      step2Body: "Escribe el código en la página que Claude te abre al conectar.",
      generate: "Generar código",
      generateAnother: "Generar otro código",
      copyCode: "Copiar código",
      copied: "¡Copiado!",
      generating: "Generando…",
      explanation: "Con este código, Claude podrá ver tus gastos y registrar nuevos. No lo compartas con nadie.",
      expiry: "Vence en 10 minutos.",
      expiresIn: "Vence en {{n}} min",
      connectionsTitle: "Conexiones",
      empty: "Aún no has conectado Claude.",
      connectedOn: "Conectado el {{date}}",
      lastUsed: "Último uso {{date}}",
      canWrite: "Puede ver y registrar gastos",
      readOnly: "Solo puede ver tus gastos",
      revoke: "Desconectar",
      revokeA11y: "Desconectar {{client}}",
      confirmTitle: "¿Desconectar {{client}}?",
      confirmBody: "Claude dejará de ver y registrar tus gastos. Puedes volver a conectarlo cuando quieras.",
      notAvailable: "Aún no está disponible para tu cuenta.",
      loadFailed: "No pudimos cargar tus conexiones.",
      createFailed: "No pudimos generar el código. Inténtalo de nuevo.",
      revokeFailed: "No pudimos desconectar. Inténtalo de nuevo.",
    },
  },
};

const en: Mirror<typeof es> = {
  settings: {
    connectClaude: {
      title: "Connect to Claude",
      intro: "Let Claude see your expenses and log new ones for you, right from its app.",
      step1Title: "Step 1 · Add Centavos in Claude",
      step1Body: "Add this link as a custom connector in Claude.",
      share: "Share link",
      openClaude: "Open claude.ai",
      step2Title: "Step 2 · Generate your code",
      step2Body: "Type the code on the page Claude opens when you connect.",
      generate: "Generate code",
      generateAnother: "Generate another code",
      copyCode: "Copy code",
      copied: "Copied!",
      generating: "Generating…",
      explanation: "With this code, Claude can see your expenses and log new ones. Don't share it with anyone.",
      expiry: "Expires in 10 minutes.",
      expiresIn: "Expires in {{n}} min",
      connectionsTitle: "Connections",
      empty: "You haven't connected Claude yet.",
      connectedOn: "Connected on {{date}}",
      lastUsed: "Last used {{date}}",
      canWrite: "Can view and log expenses",
      readOnly: "Can only view your expenses",
      revoke: "Disconnect",
      revokeA11y: "Disconnect {{client}}",
      confirmTitle: "Disconnect {{client}}?",
      confirmBody: "Claude will stop seeing and logging your expenses. You can reconnect it any time.",
      notAvailable: "Not available for your account yet.",
      loadFailed: "We couldn't load your connections.",
      createFailed: "We couldn't generate the code. Try again.",
      revokeFailed: "We couldn't disconnect. Try again.",
    },
  },
};

export const connectClaudeCopy = { es, en };
