// Flags de configuración del sitio.

/**
 * El backend del formulario de soporte está fuera de servicio (app/api/soporte
 * responde 503). Mientras no se reconecte, la página de soporte muestra solo el
 * contacto por correo en vez de un formulario que siempre falla.
 */
export const SUPPORT_FORM_ENABLED = false;

export const SUPPORT_EMAIL = "hola@centavos.mx";

/**
 * La app web (`/app/entrar`, `/app/pulso`…) solo existe con
 * `NEXT_PUBLIC_WEB_APP_ENABLED=true`; sin ella, `app/app/(web)/layout.tsx`
 * responde 404 en todas sus rutas. Se lee al compilar: cambiarla pide un
 * nuevo build/deploy. Así se puede desplegar a medias sin que nadie la vea.
 */
export const WEB_APP_ENABLED = process.env.NEXT_PUBLIC_WEB_APP_ENABLED === "true";
