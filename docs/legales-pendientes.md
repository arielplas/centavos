# Legales · pendientes y huecos conocidos

> **No soy abogado y esto no es asesoría legal.** Todo el texto marcado abajo
> como *borrador* es una propuesta de redacción, no un documento revisado. Antes
> de publicarlo hace falta que lo vea una persona con criterio legal, sobre todo
> por lo que implica en App Store / Google Play y en materia de LFPDPPP.

Última revisión de este documento: **19 de noviembre de 2026**.

## Estado de los dos documentos

| Documento | Español | Inglés | Dónde vive |
|---|---|---|---|
| Términos y Condiciones | fuente de verdad | traducción | `components/legal/docs/terms.es.tsx` / `terms.en.tsx` |
| Aviso de Privacidad | fuente de verdad | traducción | `components/legal/docs/privacy.es.tsx` / `privacy.en.tsx` |

El español manda. Cuando cambie una cláusula, se cambia en el `.es` y se
replica en el `.en` en la misma posición de la lista: los números de sección y
los anchors `#seccion-N` son compartidos entre los dos idiomas, y hay
referencias cruzadas dentro del texto («ver sección 12») que dependen del orden.

## Lo que ya se cerró

- **Terceros en el aviso de privacidad** (cerrado el 19 de noviembre de 2026,
  a petición del dueño, sin revisión de abogado). El aviso decía «no usamos
  analytics de terceros ni SDKs de publicidad» y «bcrypt». Ahora, en `.es` y
  `.en`:
  - Sección 2 enlista AdMob (anuncios no personalizados, ver
    `requestNonPersonalizedAdsOnly` en la app), RevenueCat y PostHog (eventos
    asociados a id, nombre, correo, plan e idioma, sin montos ni notas).
  - Contraseñas: Argon2id (secciones 2 y 9), como hace la API.
  - Sección 5 (transferencias) suma Resend, infraestructura en la nube,
    Expo/Apple/Google para notificaciones, Sentry (la API le quita cuerpos de
    petición y PII, `src/lib/sentry.ts`) y la conexión con Claude (Anthropic),
    solo si el usuario la activa.
  - Sección 7 (cookies): identificadores de dispositivo e instalación en la
    app; en el sitio, Vercel Web Analytics sin cookies.
  - Fecha de actualización: 19 de noviembre de 2026.
  Sigue valiendo revisarlo con un abogado, y las fichas de App Privacy / Data
  Safety de las tiendas deben decir lo mismo.

- **Cláusulas de suscripción y renovación automática.** El hueco que estaba
  documentado (los términos vendían Centavos+ sin hablar de renovación
  automática) ya está cubierto: es la sección 5 de los términos, añadida en el
  commit `7cc2961`. Cubre planes y precio, que el cobro lo hace la tienda,
  renovación automática y la ventana de 24 horas, cómo cancelar, pruebas
  gratis, reembolsos y qué pasa al terminar la suscripción. La versión en
  inglés la traduce completa.
- **El TOC se desincronizaba del cuerpo.** Al insertar la sección de Centavos+
  el índice lateral quedó desfasado: mostraba 16 entradas para 17 secciones, de
  la 5 en adelante el título no correspondía al anchor, y «Contacto» no
  aparecía. Ya no puede volver a pasar: el índice se deriva de la misma lista
  de secciones que se renderiza.

## Otras cosas que convendría revisar con criterio legal

Ninguna es un hueco comprobado; son puntos que un abogado probablemente
querría ver:

- **Edad mínima de 13 años.** Aparece en los dos documentos. Apple pide que
  la clasificación por edad de la ficha concuerde, y AdMob tiene reglas
  distintas para público infantil; vale la pena confirmar que la configuración
  de la app concuerde con los 13 años.
- **Jurisdicción exclusiva en Ciudad de México** (términos, sección 15) para
  usuarios fuera de México. Ahora que hay versión en inglés, el público deja de
  ser solo mexicano, y una cláusula de fuero exclusivo puede ser inaplicable
  frente a consumidores de otros países.
- **Sin cláusula de derecho de retracto / reembolso propio.** Los términos
  remiten todo a la tienda, lo cual es correcto para iOS y Android, pero en la
  UE existen reglas de retracto que conviene valorar si se va a promocionar la
  app ahí.
- **El aviso no nombra al responsable con denominación legal ni domicilio.** La
  LFPDPPP pide identidad y domicilio del responsable; hoy solo hay «Centavos» y
  el sitio web.
