# Legales · pendientes y huecos conocidos

> **No soy abogado y esto no es asesoría legal.** Todo el texto marcado abajo
> como *borrador* es una propuesta de redacción, no un documento revisado. Antes
> de publicarlo hace falta que lo vea una persona con criterio legal, sobre todo
> por lo que implica en App Store / Google Play y en materia de LFPDPPP.

Última revisión de este documento: **10 de noviembre de 2026**.

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

## Hueco abierto (bloqueante antes de publicar)

### 1. El aviso de privacidad dice que no hay SDKs de terceros, y sí hay

La sección 2 del aviso termina con:

> «Tampoco usamos analytics de terceros ni SDKs de publicidad en la app.»

Eso **ya no es cierto**. En el repo de la app (`centavos-app`, `package.json`)
están hoy:

- `react-native-google-mobile-ads` → **AdMob** (publicidad; es justo lo que
  quita Centavos+, y los propios términos lo dicen en la sección 5).
- `react-native-purchases` → **RevenueCat** (gestión de la suscripción).
- `posthog-react-native` → **PostHog** (analytics de producto; venía en la rama
  `feat/posthog-analytics`, conviene confirmar si ya está en la versión
  publicada antes de redactar la versión final).

Además la misma sección 5 del aviso solo enlista «proveedor de correo
transaccional» como encargado, y la sección 7 dice que en la app no hay
cookies ni identificadores más allá de los tokens de sesión.

Esto importa por tres lados: es una declaración falsa frente a la LFPDPPP; es
una incoherencia interna entre los dos documentos; y las fichas de privacidad
de App Store y Google Play (Data Safety / App Privacy) tienen que coincidir con
lo que diga este aviso, así que si divergen el riesgo de rechazo es real —
recordando que la 1.6.1 ya se rechazó una vez por temas de legales (falta de
enlace a Terms of Use, arreglado en la app desde 1.6.2).

**No toqué el texto publicado**: cambiarlo sin revisión sería inventar
declaraciones de privacidad. La versión en inglés traduce el español tal como
está hoy, falsedad incluida, porque tener dos versiones que dicen cosas
distintas sería peor. **Hay que cerrar este punto antes de dar por buenos los
documentos.**

#### Borrador para la sección 2 (requiere revisión humana)

> **Terceros que recaban datos dentro de la app.** Para operar la app usamos
> servicios de terceros que, al integrarse, pueden recabar información de tu
> dispositivo:
>
> - **Publicidad (Google AdMob).** En el plan gratuito la app muestra anuncios.
>   Google puede recabar identificadores de publicidad del dispositivo y datos
>   de uso para medir y servir los anuncios, conforme a sus propias políticas.
>   Con Centavos+ no se muestran anuncios.
> - **Suscripciones (RevenueCat).** Para validar y administrar tu suscripción
>   Centavos+ se procesan un identificador de usuario y los datos de la
>   transacción que nos devuelve la tienda. Nunca recibimos los datos de tu
>   tarjeta.
> - **Analítica de producto (PostHog).** Usamos eventos de uso de la app
>   —pantallas visitadas y acciones, asociadas a un identificador— para
>   entender qué funciona y qué no. No incluye los montos ni las notas de tus
>   gastos.
>
> Estos terceros tratan los datos conforme a sus propias políticas de
> privacidad, que puedes consultar en sus sitios. Seguimos sin vender tus datos
> personales.

Y **quitar** de la sección 2 la frase «Tampoco usamos analytics de terceros ni
SDKs de publicidad en la app», que queda contradicha.

#### Borrador, versión en inglés (requiere revisión humana)

> **Third parties that collect data inside the app.** To run the app we use
> third-party services that, by being integrated into it, may collect
> information from your device:
>
> - **Advertising (Google AdMob).** On the free plan the app shows ads. Google
>   may collect your device's advertising identifiers and usage data in order to
>   measure and serve those ads, under its own policies. With Centavos+ no ads
>   are shown.
> - **Subscriptions (RevenueCat).** To validate and manage your Centavos+
>   subscription we process a user identifier and the transaction data the store
>   returns to us. We never receive your card details.
> - **Product analytics (PostHog).** We use app usage events — screens viewed
>   and actions taken, tied to an identifier — to understand what works and what
>   does not. It does not include the amounts or the notes on your expenses.
>
> These third parties process the data under their own privacy policies, which
> you can read on their websites. We still do not sell your personal data.

Al cerrar este punto hay que tocar también:

- La **sección 5** del aviso (transferencias): hoy solo enlista el proveedor de
  correo; falta añadir estos encargados.
- La **sección 7** (cookies y tecnologías similares): mencionar el
  identificador de publicidad del dispositivo.
- La **fecha de última actualización** de los dos documentos (hoy «11 de junio
  de 2026», en tres lugares: `updated` de cada doc, la sección final del aviso
  y `app/sitemap.ts`).

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
