// Verificar el correo (VerificarCorreo): auth:verify.*. También lo usa el paso de código de /app/recuperar.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/auth.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("auth:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  auth: {
    verify: {
      title: "Revisa tu correo",
      sentTo: "Te mandamos un código de 6 dígitos a",
      fallbackEmail: "tu correo",
      submit: "Verificar y entrar",
      submitting: "Verificando…",
      notReceived: "¿No te llegó? ",
      resend: "Reenviar código",
      resending: "Enviando…",
      resent: "Te enviamos un código nuevo.",
      canResendIn: "Puedes reenviar en ",
      resendFailed: "No pudimos reenviar el código.",
      verifyFailed: "No pudimos verificar el código.",
      noAccount: "No pudimos identificar tu cuenta. Vuelve a crearla.",
    },
  },
};

const en: Mirror<typeof es> = {
  auth: {
    verify: {
      title: "Check your email",
      sentTo: "We sent a 6-digit code to",
      fallbackEmail: "your email",
      submit: "Verify and log in",
      submitting: "Verifying…",
      notReceived: "Didn't get it? ",
      resend: "Resend code",
      resending: "Sending…",
      resent: "We sent you a new code.",
      canResendIn: "You can resend in ",
      resendFailed: "We couldn't resend the code.",
      verifyFailed: "We couldn't verify the code.",
      noAccount: "We couldn't identify your account. Please create it again.",
    },
  },
};

export const verifyCopy = { es, en };
