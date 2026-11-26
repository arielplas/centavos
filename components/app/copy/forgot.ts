// Recuperar la contraseña: auth:forgot.*, auth:resetCode.*, auth:newPassword.*.
//
// Fuente: centavos-app, src/i18n/locales/{es,en}/auth.json (origin/main a262d9d),
// copiado tal cual. Las claves se leen con `t("auth:…")`.
// Una clave que falte en inglés rompe el typecheck.

import type { Mirror } from "./types";

const es = {
  auth: {
    forgot: {
      title: "¿Olvidaste tu\ncontraseña?",
      subtitle: "Escribe tu correo y te mandamos un código para recuperarla.",
      submit: "Enviar código",
      submitting: "Enviando…",
    },
    resetCode: {
      submit: "Verificar código",
      invalid: "Código incorrecto. Inténtalo de nuevo.",
    },
    newPassword: {
      title: "Nueva\ncontraseña",
      subtitle: "Elige una contraseña de al menos 8 caracteres.",
      field: "Nueva contraseña",
      submit: "Guardar contraseña",
      submitting: "Guardando…",
    },
  },
};

const en: Mirror<typeof es> = {
  auth: {
    forgot: {
      title: "Forgot your\npassword?",
      subtitle: "Enter your email and we'll send you a code to reset it.",
      submit: "Send code",
      submitting: "Sending…",
    },
    resetCode: {
      submit: "Verify code",
      invalid: "Incorrect code. Please try again.",
    },
    newPassword: {
      title: "New\npassword",
      subtitle: "Choose a password of at least 8 characters.",
      field: "New password",
      submit: "Save password",
      submitting: "Saving…",
    },
  },
};

export const forgotCopy = { es, en };
