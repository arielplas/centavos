// El wizard de /app/bienvenida: onboarding:*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/onboarding.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("onboarding:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  onboarding: {
    skip: "Omitir",
    continue: "Continuar",
    back: "Atrás",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    currency: {
      eyebrow: "Empecemos",
      title: "¿En qué moneda manejas tu dinero?",
      subtitle: "Podrás cambiarla después en Ajustes.",
    },
    purpose: {
      eyebrow: "¿Para qué usarás Centavos?",
      title: "Elige cómo quieres empezar",
      personalTitle: "Presupuesto personal",
      personalDesc: "Organiza tus gastos con presupuestos y suscripciones.",
      tripTitle: "Un viaje",
      tripDesc: "Crea una bolsa compartida y divide gastos con tus amigos.",
    },
    budgets: {
      eyebrow: "Presupuestos sugeridos",
      title: "¿En qué gastas cada mes?",
      subtitle: "Elige los que quieras. Puedes ajustar el monto.",
      empty: "No hay sugerencias por ahora.",
      amountLabel: "Monto mensual",
      loadError: "No pudimos cargar las sugerencias.",
    },
    subscriptions: {
      eyebrow: "Suscripciones",
      title: "¿A qué estás suscrito?",
      subtitle: "Elige las que pagas. Puedes ajustar el monto.",
      empty: "No hay sugerencias por ahora.",
      finish: "Terminar",
    },
    tripName: {
      eyebrow: "Tu viaje",
      title: "¿Cómo se llama el viaje?",
      subtitle: "Crearemos una bolsa compartida con este nombre.",
      placeholder: "Cancún 2026",
      required: "Escribe un nombre para el viaje.",
    },
    tripInvites: {
      eyebrow: "Invita a tus amigos",
      title: "¿Con quién viajas?",
      subtitle: "Agrega sus correos. Les llegará una invitación.",
      placeholder: "amigo@correo.com",
      add: "Agregar",
      finish: "Crear viaje",
      invalidEmail: "Escribe un correo válido.",
      duplicate: "Ese correo ya está en la lista.",
      ownEmail: "Ese es tu propio correo.",
      max: "Puedes invitar hasta 20 personas.",
    },
    done: {
      title: "¡Tu viaje está listo!",
      subtitle: "Invitaciones enviadas:",
      goToApp: "Ir a la app",
      statusInvited: "Invitación enviada",
      statusInvitedPending: "Le mandamos un correo",
      statusAlreadyMember: "Ya es miembro",
      statusFailed: "No se pudo invitar",
    },
    // Solo de la web (la app móvil usa pantallas nativas para esto).
    web: {
      stepLabel: "Configura tu cuenta",
      language: "Idioma",
      languageEs: "Español",
      languageEn: "English",
      currencySearch: "Buscar moneda",
      currencySearchPlaceholder: "Peso, dólar, MXN…",
      currencyNone: "Ninguna moneda coincide.",
      currencyList: "Monedas",
      amountInvalid: "Escribe un monto mayor a cero.",
      nameLabel: "Nombre del viaje",
      emailLabel: "Correo de tu amigo",
      invitedList: "Correos a invitar",
      removeInvite: "Quitar {{email}}",
      working: "Un momento…",
    },
  },
};

const en: Mirror<typeof es> = {
  onboarding: {
    skip: "Skip",
    continue: "Continue",
    back: "Back",
    genericError: "Something went wrong. Please try again.",
    currency: {
      eyebrow: "Let's start",
      title: "Which currency do you use?",
      subtitle: "You can change it later in Settings.",
    },
    purpose: {
      eyebrow: "What will you use Centavos for?",
      title: "Choose how you want to start",
      personalTitle: "Personal budgeting",
      personalDesc: "Organize your spending with budgets and subscriptions.",
      tripTitle: "A trip",
      tripDesc: "Create a shared pot and split expenses with friends.",
    },
    budgets: {
      eyebrow: "Suggested budgets",
      title: "What do you spend on each month?",
      subtitle: "Pick the ones you want. You can adjust the amount.",
      empty: "No suggestions right now.",
      amountLabel: "Monthly amount",
      loadError: "We couldn't load the suggestions.",
    },
    subscriptions: {
      eyebrow: "Subscriptions",
      title: "What are you subscribed to?",
      subtitle: "Pick the ones you pay for. You can adjust the amount.",
      empty: "No suggestions right now.",
      finish: "Finish",
    },
    tripName: {
      eyebrow: "Your trip",
      title: "What's the trip called?",
      subtitle: "We'll create a shared pot with this name.",
      placeholder: "Cancún 2026",
      required: "Enter a name for the trip.",
    },
    tripInvites: {
      eyebrow: "Invite your friends",
      title: "Who are you traveling with?",
      subtitle: "Add their emails. They'll get an invitation.",
      placeholder: "friend@email.com",
      add: "Add",
      finish: "Create trip",
      invalidEmail: "Enter a valid email.",
      duplicate: "That email is already on the list.",
      ownEmail: "That's your own email.",
      max: "You can invite up to 20 people.",
    },
    done: {
      title: "Your trip is ready!",
      subtitle: "Invitations sent:",
      goToApp: "Go to the app",
      statusInvited: "Invitation sent",
      statusInvitedPending: "We sent them an email",
      statusAlreadyMember: "Already a member",
      statusFailed: "Couldn't invite",
    },
    // Web only (the mobile app uses native screens for this).
    web: {
      stepLabel: "Set up your account",
      language: "Language",
      languageEs: "Español",
      languageEn: "English",
      currencySearch: "Search currency",
      currencySearchPlaceholder: "Peso, dollar, MXN…",
      currencyNone: "No currency matches.",
      currencyList: "Currencies",
      amountInvalid: "Enter an amount greater than zero.",
      nameLabel: "Trip name",
      emailLabel: "Your friend's email",
      invitedList: "Emails to invite",
      removeInvite: "Remove {{email}}",
      working: "One moment…",
    },
  },
};

export const onboardingCopy = { es, en };
