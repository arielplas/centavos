// Copy of /canjear in both languages. Spanish is the source of truth; the type
// makes a key missing in one language a typecheck error.

import type { PromoErrorCode } from "@/lib/promo-api";
import type { SiteLang } from "@/lib/lang";

export type CanjearCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  // Offer visuals
  giftNote: string;
  offerLead: string;
  ticketCodeLabel: string;
  ticketUnit: (days: number) => string;
  ticketRest: string;
  stampRedeemed: string;
  stampClaimed: string;
  benefitsHeading: string;
  hasAccountHint: string;
  isNewHint: string;
  isNewCta: string;
  redeemedKicker: string;
  claimedKicker: string;
  title: string;
  loading: string;
  // Step 0: no code in the URL
  codeIntro: string;
  codeLabel: string;
  codePlaceholder: string;
  codeSubmit: string;
  codeChecking: string;
  codeRequired: string;
  // Offer
  offerTitle: (code: string) => string;
  offerBody: (days: number) => string;
  changeCode: string;
  pathsLegend: string;
  // A code open to only one kind of account: the chooser is replaced by these.
  onlyNewLegend: string;
  onlyNewHint: string;
  onlyExistingLegend: string;
  onlyExistingHint: string;
  hasAccount: string;
  isNew: string;
  // Existing account
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  showPassword: string;
  hidePassword: string;
  show: string;
  hide: string;
  retry: string;
  signIn: string;
  signingIn: string;
  or: string;
  googleLoading: string;
  // New user
  newIntro: string;
  claimSubmit: string;
  claiming: string;
  // Results
  redeemedTitle: string;
  redeemedBody: (date: string) => string;
  openApp: string;
  claimedTitle: string;
  claimedBody: (email: string, days: number) => string;
  sameEmailNote: string;
  newGoogleAccountNote: string;
  downloadHeading: string;
  // Chrome
  switchLabel: string;
  switchAria: string;
  errorPrefix: string;
  tryAnother: string;
  /** Per-error text. Code errors carry a short headline and a longer message. */
  errors: Record<PromoErrorCode, { title?: string; message: string }>;
  fieldErrors: { email: string; password: string; code: string };
};

export const CANJEAR_COPY: Record<SiteLang, CanjearCopy> = {
  es: {
    metaTitle: "Canjear código",
    metaDescription: "Canjea tu código promocional y activa Centavos+.",
    eyebrow: "Código promocional",
    giftNote: "¡es para ti!",
    offerLead: "Actívalo en un minuto. Sin tarjeta y sin cobros cuando termine.",
    ticketCodeLabel: "Tu código",
    ticketUnit: (n) => (n === 1 ? "día" : "días"),
    ticketRest: "gratis",
    stampRedeemed: "Activado",
    stampClaimed: "Guardado",
    benefitsHeading: "Con Centavos+ tienes",
    hasAccountHint: "Inicia sesión y se activa al momento.",
    isNewHint: "Guárdalo con tu correo y regístrate después.",
    isNewCta: "Empieza ahora",
    redeemedKicker: "¡a disfrutar!",
    claimedKicker: "un paso más",
    title: "Canjea tu código",
    loading: "Revisando tu código…",
    codeIntro: "Escribe tu código para ver qué incluye.",
    codeLabel: "Tu código",
    codePlaceholder: "Ej. PDM",
    codeSubmit: "Continuar",
    codeChecking: "Revisando…",
    codeRequired: "Escribe tu código.",
    offerTitle: (code) => `Código ${code}`,
    offerBody: (n) => `${n} ${n === 1 ? "día" : "días"} de Centavos+ gratis`,
    changeCode: "Usar otro código",
    pathsLegend: "¿Ya tienes cuenta en Centavos?",
    onlyNewLegend: "Empieza ahora",
    onlyNewHint: "Este código es para cuentas nuevas. Déjanos tu correo y regístrate con él en la app.",
    onlyExistingLegend: "Inicia sesión para activarlo",
    onlyExistingHint: "Este código es para quienes ya tenían cuenta en Centavos.",
    hasAccount: "Ya tengo cuenta",
    isNew: "Soy nuevo",
    emailLabel: "Correo",
    emailPlaceholder: "tu@correo.com",
    passwordLabel: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    show: "Mostrar",
    hide: "Ocultar",
    retry: "Reintentar",
    signIn: "Entrar y canjear",
    signingIn: "Canjeando…",
    or: "o",
    googleLoading: "Canjeando…",
    newIntro: "Déjanos tu correo y, cuando te registres en la app con él, activamos tu código.",
    claimSubmit: "Guardar mi código",
    claiming: "Guardando…",
    redeemedTitle: "¡Listo!",
    redeemedBody: (date) => `Tienes Centavos+ hasta el ${date}. Abre la app.`,
    openApp: "Descarga o abre la app",
    claimedTitle: "Código guardado",
    claimedBody: (email, n) =>
      `Descarga Centavos y regístrate con ${email} para activar tus ${n === 1 ? "1 día" : `${n} días`} de Centavos+.`,
    sameEmailNote: "Importante: tiene que ser exactamente el mismo correo. Si te registras con otro, no se activa.",
    downloadHeading: "Descarga Centavos",
    newGoogleAccountNote: "Creamos tu cuenta con Google. Descarga la app e inicia sesión con Google para usar tu Centavos+.",
    switchLabel: "English",
    switchAria: "Read this page in English",
    errorPrefix: "Error:",
    tryAnother: "Probar con otro código",
    fieldErrors: {
      email: "Revisa tu correo: no parece válido.",
      password: "Escribe tu contraseña.",
      code: "Revisa el código.",
    },
    errors: {
      PROMO_CODE_NOT_FOUND: {
        title: "No encontramos ese código",
        message: "Revisa que esté escrito igual que te lo compartieron.",
      },
      PROMO_CODE_INACTIVE: {
        title: "Este código no está activo",
        message: "Por ahora no se puede canjear. Si crees que es un error, escríbenos a hola@centavos.mx.",
      },
      PROMO_CODE_EXPIRED: {
        title: "Este código ya venció",
        message: "La promoción terminó y ya no se puede canjear.",
      },
      PROMO_CODE_EXHAUSTED: {
        title: "Este código ya se agotó",
        message: "Ya se canjearon todos los lugares disponibles.",
      },
      PROMO_CODE_ALREADY_REDEEMED: {
        title: "Ya canjeaste este código",
        message: "Tu cuenta ya lo usó. Cada código se puede canjear una sola vez por cuenta.",
      },
      PROMO_CODE_NOT_ELIGIBLE: {
        title: "Este código no aplica para tu cuenta",
        message: "Algunos códigos son solo para cuentas nuevas y otros solo para quienes ya tenían cuenta. Este no corresponde a la tuya.",
      },
      AUTH_INVALID_CREDENTIALS: { message: "Correo o contraseña incorrectos. Inténtalo de nuevo." },
      AUTH_EMAIL_UNVERIFIED: {
        message: "Tu correo aún no está verificado. Abre el mensaje de verificación que te enviamos y vuelve a intentarlo.",
      },
      AUTH_GOOGLE_TOKEN_INVALID: { message: "No pudimos verificar tu sesión de Google. Inténtalo de nuevo." },
      AUTH_GOOGLE_EMAIL_UNVERIFIED: { message: "Tu correo de Google no está verificado. Verifícalo con Google o entra con correo y contraseña." },
      GOOGLE_AUTH_DISABLED: { message: "Entrar con Google no está disponible por ahora. Usa tu correo y contraseña." },
      VALIDATION: { message: "Revisa los datos que escribiste." },
      RATE_LIMIT: { message: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
      NETWORK: { message: "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo." },
      UNKNOWN: { message: "Algo salió mal de nuestro lado. Inténtalo de nuevo en un momento." },
    },
  },
  en: {
    metaTitle: "Redeem a code",
    metaDescription: "Redeem your promo code and unlock Centavos+.",
    eyebrow: "Promo code",
    giftNote: "it's yours!",
    offerLead: "Activate it in a minute. No card needed, and no charge when it ends.",
    ticketCodeLabel: "Your code",
    ticketUnit: (n) => (n === 1 ? "day" : "days"),
    ticketRest: "free",
    stampRedeemed: "Active",
    stampClaimed: "Saved",
    benefitsHeading: "With Centavos+ you get",
    hasAccountHint: "Sign in and it's active right away.",
    isNewHint: "Save it with your email and sign up later.",
    isNewCta: "Get started",
    redeemedKicker: "enjoy!",
    claimedKicker: "one more step",
    title: "Redeem your code",
    loading: "Checking your code…",
    codeIntro: "Enter your code to see what it includes.",
    codeLabel: "Your code",
    codePlaceholder: "e.g. PDM",
    codeSubmit: "Continue",
    codeChecking: "Checking…",
    codeRequired: "Enter your code.",
    offerTitle: (code) => `Code ${code}`,
    offerBody: (n) => `${n} ${n === 1 ? "day" : "days"} of Centavos+ free`,
    changeCode: "Use a different code",
    pathsLegend: "Do you already have a Centavos account?",
    onlyNewLegend: "Get started",
    onlyNewHint: "This code is for new accounts. Leave your email and sign up with it in the app.",
    onlyExistingLegend: "Sign in to activate it",
    onlyExistingHint: "This code is for people who already had a Centavos account.",
    hasAccount: "I have an account",
    isNew: "I'm new",
    emailLabel: "Email",
    emailPlaceholder: "you@email.com",
    passwordLabel: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    show: "Show",
    hide: "Hide",
    retry: "Try again",
    signIn: "Sign in and redeem",
    signingIn: "Redeeming…",
    or: "or",
    googleLoading: "Redeeming…",
    newIntro: "Leave your email and, once you sign up in the app with it, we'll activate your code.",
    claimSubmit: "Save my code",
    claiming: "Saving…",
    redeemedTitle: "All set!",
    redeemedBody: (date) => `You have Centavos+ until ${date}. Open the app.`,
    openApp: "Download or open the app",
    claimedTitle: "Code saved",
    claimedBody: (email, n) =>
      `Download Centavos and sign up with ${email} to activate your ${n === 1 ? "1 day" : `${n} days`} of Centavos+.`,
    sameEmailNote: "Important: it has to be exactly the same email. If you sign up with a different one, it won't activate.",
    downloadHeading: "Download Centavos",
    newGoogleAccountNote: "We created your account with Google. Download the app and sign in with Google to use your Centavos+.",
    switchLabel: "Español",
    switchAria: "Leer esta página en español",
    errorPrefix: "Error:",
    tryAnother: "Try a different code",
    fieldErrors: {
      email: "Check your email: it doesn't look valid.",
      password: "Enter your password.",
      code: "Check the code.",
    },
    errors: {
      PROMO_CODE_NOT_FOUND: {
        title: "We couldn't find that code",
        message: "Check that it's spelled the way it was shared with you.",
      },
      PROMO_CODE_INACTIVE: {
        title: "This code isn't active",
        message: "It can't be redeemed right now. If you think this is a mistake, write to hola@centavos.mx.",
      },
      PROMO_CODE_EXPIRED: {
        title: "This code has expired",
        message: "The promotion is over and the code can no longer be redeemed.",
      },
      PROMO_CODE_EXHAUSTED: {
        title: "This code has run out",
        message: "All the available spots have already been redeemed.",
      },
      PROMO_CODE_ALREADY_REDEEMED: {
        title: "You already redeemed this code",
        message: "Your account has already used it. Each code can be redeemed once per account.",
      },
      PROMO_CODE_NOT_ELIGIBLE: {
        title: "This code doesn't apply to your account",
        message: "Some codes are only for new accounts and others only for people who already had one. This one doesn't match yours.",
      },
      AUTH_INVALID_CREDENTIALS: { message: "Wrong email or password. Please try again." },
      AUTH_EMAIL_UNVERIFIED: {
        message: "Your email isn't verified yet. Open the verification message we sent you and try again.",
      },
      AUTH_GOOGLE_TOKEN_INVALID: { message: "We couldn't verify your Google sign-in. Please try again." },
      AUTH_GOOGLE_EMAIL_UNVERIFIED: { message: "Your Google email isn't verified. Verify it with Google or sign in with email and password." },
      GOOGLE_AUTH_DISABLED: { message: "Google sign-in isn't available right now. Use your email and password." },
      VALIDATION: { message: "Check the details you entered." },
      RATE_LIMIT: { message: "Too many attempts. Wait a moment and try again." },
      NETWORK: { message: "We couldn't connect. Check your connection and try again." },
      UNKNOWN: { message: "Something went wrong on our side. Please try again in a moment." },
    },
  },
};
