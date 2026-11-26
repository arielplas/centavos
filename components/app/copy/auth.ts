// Entrar: botones de Apple y Google, campos, validaciones, signIn.*. Perfil: profile.*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/auth.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("auth:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  auth: {
    apple: {
      signIn: {
        label: "Continuar con Apple",
        a11yHint: "Entra o crea tu cuenta con tu Apple ID.",
        connecting: "Conectando con Apple…",
        unavailable: "Entrar con Apple no está disponible en este dispositivo.",
        genericError: "No pudimos conectar con Apple. Inténtalo de nuevo.",
      },
      emailHidden: {
        badge: "Correo oculto por Apple",
        note: "Elegiste ocultar tu correo al entrar con Apple, así que tu cuenta usa esta dirección de reenvío. Los correos de Centavos te llegan igual, pero tus amigos no pueden encontrarte con tu correo real: compárteles este o tu código de amigo.",
      },
    },
    google: {
      signIn: {
        label: "Continuar con Google",
        connecting: "Conectando con Google…",
        unavailable: "Entrar con Google no está disponible en este dispositivo por ahora.",
        genericError: "No pudimos conectar con Google. Inténtalo de nuevo.",
      },
    },
    fields: {
      email: "Correo",
      emailPlaceholder: "tu@correo.com",
      password: "Contraseña",
      passwordPlaceholder: "Tu contraseña",
      passwordMinPlaceholder: "Mínimo 8 caracteres",
      name: "Nombre",
      yourName: "Tu nombre",
    },
    validation: {
      emailRequired: "Escribe tu correo.",
      emailInvalid: "Ese correo no se ve bien. Revísalo.",
      passwordRequired: "Escribe tu contraseña.",
      nameRequired: "Escribe tu nombre.",
      passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
      passwordTooLong: "La contraseña es demasiado larga.",
      emailTaken: "Ese correo ya está registrado.",
    },
    signIn: {
      title: "Hola de nuevo",
      forgot: "¿Olvidaste tu contraseña?",
      submit: "Entrar",
      submitting: "Entrando…",
      noAccount: "¿Aún no tienes cuenta? ",
      createFree: "Créala gratis",
    },
    profile: {
      title: "Perfil",
      currency: "Moneda",
      deleteAccount: "Eliminar cuenta",
    },
  },
};

const en: Mirror<typeof es> = {
  auth: {
    apple: {
      signIn: {
        label: "Continue with Apple",
        a11yHint: "Sign in or create your account with your Apple ID.",
        connecting: "Connecting to Apple…",
        unavailable: "Sign in with Apple isn't available on this device.",
        genericError: "We couldn't connect to Apple. Please try again.",
      },
      emailHidden: {
        badge: "Email hidden by Apple",
        note: "You chose to hide your email when signing in with Apple, so your account uses this forwarding address. Centavos emails still reach you, but friends can't find you by your real email — share this one or your friend code.",
      },
    },
    google: {
      signIn: {
        label: "Continue with Google",
        connecting: "Connecting to Google…",
        unavailable: "Signing in with Google isn't available on this device right now.",
        genericError: "We couldn't connect to Google. Please try again.",
      },
    },
    fields: {
      email: "Email",
      emailPlaceholder: "you@email.com",
      password: "Password",
      passwordPlaceholder: "Your password",
      passwordMinPlaceholder: "At least 8 characters",
      name: "Name",
      yourName: "Your name",
    },
    validation: {
      emailRequired: "Enter your email.",
      emailInvalid: "That email doesn't look right. Check it.",
      passwordRequired: "Enter your password.",
      nameRequired: "Enter your name.",
      passwordTooShort: "Your password must be at least 8 characters.",
      passwordTooLong: "That password is too long.",
      emailTaken: "That email is already registered.",
    },
    signIn: {
      title: "Welcome back",
      forgot: "Forgot your password?",
      submit: "Log in",
      submitting: "Logging in…",
      noAccount: "Don't have an account yet? ",
      createFree: "Create one free",
    },
    profile: {
      title: "Profile",
      currency: "Currency",
      deleteAccount: "Delete account",
    },
  },
};

export const authCopy = { es, en };
