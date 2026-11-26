// Flags de configuración del sitio.

/**
 * El backend del formulario de soporte está fuera de servicio (app/api/soporte
 * responde 503). Mientras no se reconecte, la página de soporte muestra solo el
 * contacto por correo en vez de un formulario que siempre falla.
 */
export const SUPPORT_FORM_ENABLED = false;

export const SUPPORT_EMAIL = "hola@centavos.mx";

/**
 * The web app (/app/entrar, /app/crear-cuenta) is built on its own branch and is
 * not live yet. While it is off, the Claude connector page only offers the app
 * path to get the connection code and does not link to the web app. Turn it on
 * with NEXT_PUBLIC_WEB_APP_ENABLED=true once the web app ships.
 */
export const WEB_APP_ENABLED = process.env.NEXT_PUBLIC_WEB_APP_ENABLED === "true";
