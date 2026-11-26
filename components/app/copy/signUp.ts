// Crear cuenta (CrearCuenta): auth:signUp.*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/auth.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("auth:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  auth: {
    signUp: {
      step1Eyebrow: "Empieza tu cuaderno",
      step1Title: "¿Cuál es tu correo?",
      step1Subtitle: "Lo usamos para entrar y para recuperar tu cuenta.",
      step2Eyebrow: "Paso 2",
      step2Title: "Elige una contraseña",
      step2Subtitle: "Mínimo 8 caracteres. Nada de letras chiquitas.",
      step3Eyebrow: "Casi listo",
      step3Title: "¿Cómo te llamas?",
      step3Subtitle: "Para saludarte bien cuando abras la app.",
      next: "Siguiente",
      submit: "Crear mi cuenta",
      submitting: "Creando tu cuenta…",
      hasAccount: "¿Ya tienes cuenta? ",
      goSignIn: "Inicia sesión",
      termsA11y: "Acepto los Términos y el Aviso de privacidad de Centavos",
      termsPrefix: "Acepto los ",
      termsLink: "Términos",
      termsMiddle: " y el ",
      privacyLink: "Aviso de privacidad",
      termsSuffix: " de Centavos.",
    },
  },
};

const en: Mirror<typeof es> = {
  auth: {
    signUp: {
      step1Eyebrow: "Start your notebook",
      step1Title: "What's your email?",
      step1Subtitle: "We use it to log in and to recover your account.",
      step2Eyebrow: "Step 2",
      step2Title: "Choose a password",
      step2Subtitle: "At least 8 characters. No fine print.",
      step3Eyebrow: "Almost there",
      step3Title: "What's your name?",
      step3Subtitle: "So we can greet you properly when you open the app.",
      next: "Next",
      submit: "Create my account",
      submitting: "Creating your account…",
      hasAccount: "Already have an account? ",
      goSignIn: "Log in",
      termsA11y: "I accept Centavos's Terms and Privacy Notice",
      termsPrefix: "I accept Centavos's ",
      termsLink: "Terms",
      termsMiddle: " and ",
      privacyLink: "Privacy Notice",
      termsSuffix: ".",
    },
  },
};

export const signUpCopy = { es, en };
