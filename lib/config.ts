// Flags de configuración del sitio.

/**
 * El backend del formulario de soporte está fuera de servicio (app/api/soporte
 * responde 503). Mientras no se reconecte, la página de soporte muestra solo el
 * contacto por correo en vez de un formulario que siempre falla.
 */
export const SUPPORT_FORM_ENABLED = false;

export const SUPPORT_EMAIL = "hola@centavos.mx";
