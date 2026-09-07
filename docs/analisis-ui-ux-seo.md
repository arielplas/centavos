# Análisis UI/UX y SEO · centavos.mx

**Fecha:** 7 de septiembre de 2026
**Alcance:** home (`/`), soporte (`/app/soporte`), legales (`/app/privacidad`, `/app/terminos`, `/app/eliminar-cuenta`) y 404.
**Estado del código analizado:** rama `main` con los cambios sin commit de `app/layout.tsx`, `app/page.tsx` y `components/home/PhoneMock.tsx` (la versión "sin conectar tu banco").

**Método.** Se revisó el código fuente completo y se corrió el sitio en el dev server para medir HTML renderizado, `<head>`, contraste real de los tokens, tamaños de texto y de targets, altura de página y códigos de respuesta de los assets. Los marcos de análisis aplicados fueron:

- 10 heurísticas de usabilidad (Nielsen)
- Carga cognitiva → conversión (3 palancas: quitar ruido, modelos mentales, descargar tareas del usuario)
- Persuasión (BJ Fogg, 7 herramientas de captología)
- Accesibilidad WCAG 2.1 A/AA
- Auditoría SEO técnica y on-page

---

## 1. Resumen ejecutivo

| Área | Veredicto |
|---|---|
| SEO técnico | 🚨 **Problemas significativos**: la home no tiene imagen de Open Graph y la que declaran las demás páginas es un 404. Metadatos de Twitter, manifest y 404 todavía hablan del blog. |
| UX (heurísticas) | ⚠️ **Varias cosas por corregir**: el formulario de soporte siempre falla, hay jerga en inglés, el header sticky no aporta nada y la promesa de privacidad se repite 7 veces antes de explicar qué hace la app. |
| Carga cognitiva / conversión | ⚠️ Página de ~9,150 px en móvil con solo 2 puntos de descarga (arriba y hasta el final). Sin prueba social. |
| Accesibilidad | ⚠️ **Riesgos por corregir**: buena base (skip link, focus visible, `sr-only` en maquetas, reduced motion) pero hay contrastes por debajo de AA, inputs sin borde perceptible y textos de 9–10 px. |

### Las 10 acciones de mayor impacto

| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | Crear `app/opengraph-image.tsx` (o `public/og-default.png`) y hacer que la home la herede. Hoy **ningún link compartido muestra imagen**. | Alto | Bajo |
| 2 | Corregir el formulario de soporte: hoy el endpoint responde 503 siempre, así que el usuario llena 3 campos y recibe un error. Ocultar el form y dejar el `mailto` como acción principal hasta reconectar el backend, o conectar un proveedor (Resend, Formspree). | Alto | Bajo |
| 3 | Limpiar metadatos heredados del blog: `twitter.*`, `description` raíz, `keywords` (AFORE, PPR, Buró), `manifest` (nombre "Centavo", descripción del blog), copy del 404. | Alto | Bajo |
| 4 | Recuperar la palabra clave de búsqueda en `<title>` y H1. "Tus gastos, sin conectar tu banco" es buen branding pero nadie busca eso; la gente busca "app para anotar gastos". | Alto | Bajo |
| 5 | Agregar un CTA persistente en móvil (barra inferior sticky con "Descargar gratis") o convertir el header sticky en algo útil (logo + botón). | Alto | Medio |
| 6 | Usar los badges oficiales de App Store y Google Play. Los actuales son custom; los oficiales son reconocidos al instante y son requisito de las guías de marca de Apple y Google. | Medio | Bajo |
| 7 | Consolidar la promesa de privacidad: fusionar la trust bar y la sección "No pedimos tu banco. Nunca." en una sola, y subir las funciones. | Medio | Medio |
| 8 | Añadir sección de preguntas frecuentes con schema `FAQPage` (¿es gratis?, ¿se conecta a mi banco?, ¿funciona sin internet?, ¿cómo borro mi cuenta?). Contenido indexable que hoy no existe. | Medio | Medio |
| 9 | Subir contrastes a AA: eyebrows en `mandarina-deep` sobre `bg` (4.38:1), texto `#9b8675` en legales (3.13:1), bordes de inputs (1.38:1). | Medio | Bajo |
| 10 | Reducir el costo de scroll en móvil: 6 teléfonos de 620 px de alto fijo. Escalar el mock a ~240×500 en móvil o recortar con degradado. | Medio | Medio |

---

## 2. SEO

### 2.1 Crítico

**No hay imagen de Open Graph en ninguna página.**
- No existe carpeta `public/`. `layout.tsx` declara `/og-default.png` y `lib/seo.ts` declara `/logo.png` en el JSON-LD de `Organization`; ambos responden **404**.
- Peor: en la home ni siquiera se emite `og:image`. `page.tsx` sobreescribe `openGraph` sin `images`, y Next.js **no hace merge profundo** del objeto `openGraph`, así que se pierde lo declarado en el layout. El `<head>` renderizado de `/` tiene `og:title`, `og:description`, `og:url` y `og:type`, nada más.
- Consecuencia: WhatsApp, X, LinkedIn, iMessage y Slack muestran el link sin tarjeta visual. Para una app cuya adquisición depende de que alguien la comparta, es la pérdida más cara del sitio.
- **Fix:** crear `app/opengraph-image.tsx` con `ImageResponse` (1200×630, fondo `bg`, wordmark + "Anota tus gastos sin conectar tu banco" + mock del teléfono). Next lo inyecta automáticamente en todas las rutas hijas y ya no hace falta declararlo en `metadata`. Repetir con `app/twitter-image.tsx` o dejar que herede. Agregar `app/icon.png` (512) y `app/apple-icon.png` (180): hoy `/apple-icon.png` y `/favicon.ico` son 404, y el manifest solo tiene un SVG "any", que Android no acepta para el prompt de instalación.

**Metadatos que todavía describen el blog (retirado en `fdd6633`).**
- `layout.tsx` › `description`: "…más un blog de finanzas personales para México".
- `layout.tsx` › `openGraph.description`: "…y el blog para entender tu lana".
- `layout.tsx` › `twitter.title` / `twitter.description`: "Finanzas sin sustos" / "Blog financiero mexicano sin choros". Esto se renderiza **en todas las páginas, incluida la home**, porque `page.tsx` no sobreescribe `twitter`.
- `layout.tsx` › `keywords`: AFORE, PPR, Buró de Crédito, educación financiera. Google ignora la etiqueta, pero es señal de intención desalineada y confunde a quien mantenga el código.
- `manifest.ts`: `name: "Centavo"` (sin la s) y `description: "Blog financiero mexicano sin choros."`.
- `not-found.tsx`: "hay un montón de lana que aprender por aquí" invita a leer artículos que ya no existen. Además el 404 no define `metadata.title`, así que hereda el título default "Centavos · Finanzas sin sustos para la gente".
- **Fix:** una sola pasada por `layout.tsx`, `manifest.ts` y `not-found.tsx` con el mensaje de la app. Sugerencia de `description` raíz (≤155 caracteres): *"App gratis para anotar tus gastos y armar presupuestos, sin conectar tu banco. Suscripciones, meses sin intereses y gastos compartidos. iOS y Android."*

**`og:url` incorrecto en subpáginas.** `/app/soporte`, `/app/privacidad`, etc. emiten `og:url = https://centavos.mx` (heredado del layout) aunque su `canonical` sí es correcto. Cada página debe declarar `openGraph.url` propio o el layout no debe fijar `url`.

### 2.2 On-page (home)

**Palabra clave vs. mensaje de marca.** El cambio pendiente reemplazó:

| | Antes (commit `5ba9364`) | Ahora (sin commit) |
|---|---|---|
| `<title>` | Centavos · App para anotar gastos y controlar tu presupuesto | Centavos · Tus gastos, sin conectar tu banco |
| H1 | Tu lana, en tu bolsillo | Tus gastos, sin conectar tu banco |

El commit `5ba9364` se hizo precisamente para apuntar a keywords de descarga de app; el cambio nuevo las quita. La privacidad es un diferenciador excelente **para convencer**, pero la búsqueda entra por "app para anotar gastos", "app de control de gastos", "app de presupuesto". Recomendación que conserva ambos:

- `<title>`: **Centavos · App para anotar gastos sin conectar tu banco** (53 caracteres)
- H1: **La app para anotar tus gastos, sin conectar tu banco.** (el `<span>` en mandarina puede seguir siendo "sin conectar tu banco")
- `description`: 269 caracteres hoy → Google corta en ~155–160. Mover "iOS y Android, hecha en México" al principio o recortar.

**Estructura de encabezados.** Correcta: 1 H1, 6 H2 con H3 anidados. Las H2 son emocionales ("Lo que Centavos lleva por ti", "Tu dinero, solo para tus ojos"); al menos una debería contener "presupuestos", "suscripciones" o "control de gastos" de forma literal. "Lo que Centavos lleva por ti" → "Presupuestos, suscripciones y meses sin intereses en un solo lugar".

**Contenido indexable delgado.** El sitio tiene una sola página de contenido más cuatro utilitarias. Sin volver a montar un blog, hay tres piezas de bajo costo y alto retorno:

1. **FAQ en la home** con `FAQPage` JSON-LD. 6–8 preguntas que la gente ya busca: ¿es gratis?, ¿se conecta a mi banco?, ¿qué pasa con mis datos?, ¿funciona sin internet?, ¿puedo compartir gastos con mi pareja?, ¿cómo elimino mi cuenta? Responde objeciones (conversión) y gana fragmentos enriquecidos (SEO).
2. **Una landing por función** (`/presupuestos`, `/suscripciones`, `/meses-sin-intereses`, `/dividir-gastos`): 300–500 palabras, mock de la pantalla, CTA. Cada una apunta a una long-tail ("app para controlar suscripciones", "app para dividir gastos entre roomies", "calculadora de meses sin intereses").
3. **Comparativa honesta** "¿Por qué Centavos no se conecta a tu banco?" que explique el modelo manual vs. agregadores. Es el único argumento de marca y hoy no tiene URL propia.

### 2.3 Datos estructurados

- `Organization`, `WebSite` y `MobileApplication` sí están en el HTML del servidor (verificado: 3 bloques `ld+json` en el SSR). Bien.
- `MobileApplication`: agregar `screenshot` (cuando exista imagen), `author` = Organization, `downloadUrl` para Android además de `installUrl` (iOS), y `featureList`. `aggregateRating` solo cuando haya reseñas reales (el comentario en `seo.ts` ya lo advierte; correcto).
- `Organization.logo` apunta a un 404. Generar `public/logo.png` (≥112×112) o apuntar al `icon.png` nuevo.
- `sameAs` vacío: llenar con App Store y Google Play (ya se hace en `MobileApplication`) y redes cuando existan.

### 2.4 Infraestructura

| Elemento | Estado | Nota |
|---|---|---|
| `robots.txt` | ✅ | Disallow `/admin/` no hace daño pero es una ruta inexistente. |
| `sitemap.xml` | ⚠️ | `lastModified: new Date()` en cada build. Google aprende a ignorar fechas que cambian sin cambio real. Usar fechas fijas por página. |
| Canonical | ✅ | Correcto por página. En dev apunta a `localhost:3000` porque `.env.local` lo fija; en Vercel debe estar `NEXT_PUBLIC_SITE_URL=https://centavos.mx`. |
| Redirects | ✅ | `/app`, `/blog/*`, rutas viejas → `/` con 308. www → apex. |
| Smart App Banner iOS | ✅ | `apple-itunes-app` presente con el ID correcto. |
| Headers | ✅ | nosniff, X-Frame-Options, Referrer-Policy. HSTS lo pone Vercel. |
| `lang` | ✅ | `es-MX`. |
| Imágenes | — | No hay `<img>`; las maquetas son HTML/CSS. Sin LCP de imagen, sin `alt` faltantes. Bien para rendimiento, cero presencia en Google Imágenes (aceptable). |

---

## 3. Heurísticas de usabilidad (Nielsen)

> ⚠️ Varias cosas por corregir

**H1: Visibilidad del estado del sistema**
- El formulario de soporte muestra "Enviando…" y luego siempre "El envío por formulario no está disponible por ahora". El estado real (el canal no funciona) se descubre **después** de invertir el esfuerzo de escribir. Debe comunicarse antes o el form no debe mostrarse.
- Los contadores `aria-live="polite"` de Asunto y Mensaje anuncian "5/120", "6/120"… en cada tecla a lectores de pantalla. Anunciar solo al 90 % y al 100 % del límite.

**H2: Correspondencia con el mundo real**
- Jerga en inglés en la sección Divide gastos: **"IOUs"** y **"settle-up"**. El resto del sitio es mexicano coloquial ("lana", "cuates", "aguas"). Usar "lo que te deben y lo que debes" y "ajuste de cuentas" (que ya aparece como botón en la maqueta: "Ajustar cuentas").
- "MSI" sin expandir en la tarjeta de Meses sin intereses. El H3 sí lo expande, pero en el párrafo aparece la sigla.
- El asterisco del disclaimer final ("* Las pantallas mostradas son ilustrativas") no tiene ningún referente marcado con asterisco.

**H3: Control y libertad**
- Header de la home: sticky, ocupa ~50 px permanentes en móvil en una página de 9,150 px y solo contiene el logo. No da salida a Soporte ni acción de descarga. O deja de ser sticky o carga un CTA.
- Los badges abren en pestaña nueva (`target=_blank`), lo cual es correcto para tiendas, y lo anuncian con `sr-only`. Bien.

**H4: Consistencia y estándares**
- Dos headers distintos: `Header` (claro, solo logo) en la home y `AppHeader` (oscuro, con botón "La app") en subpáginas. Al ir de la home a Soporte cambia el color del navbar completo. Elegir uno.
- Badges de tienda custom en lugar de los oficiales. El usuario reconoce el badge negro de Apple y el de Google Play en milisegundos; uno custom obliga a leer. Además, las guías de marca de Apple exigen el badge oficial en material promocional y Google pide su artwork para "Get it on Google Play".
- Footer: "Soporte" y "Contacto" son dos links al mismo destino (`/app/soporte`).

**H5: Prevención de errores**
- `SoporteForm` tiene `noValidate` y no implementa validación propia, así que `required`, `minLength` y `type="email"` no hacen nada: un envío vacío viaja al servidor. Quitar `noValidate` o validar en cliente antes del `fetch`.

**H6: Reconocimiento antes que recuerdo**
- Páginas legales en móvil: la tabla de contenidos está `hidden md:block`. Privacidad tiene 13 secciones y Términos 16, sin manera de saltar. Poner la TOC dentro de un `<details>` colapsable arriba del contenido en móvil.

**H8: Diseño estético y minimalista**
- La promesa de privacidad aparece **siete veces** antes de la primera función: badge "privado · Sin conectar tu banco, nunca", H1, párrafo del hero ("Sin bancos"), trust bar ("No se conecta a tu banco", "Nunca toca tu dinero", "Tus datos son tuyos"), eyebrow "Privado por diseño", H2 "No pedimos tu banco. Nunca." y sus 3 tarjetas. Un usuario que ya compró el argumento sigue scrolleando sin saber qué hace la app. Ver §4.
- Seis maquetas de teléfono de 300×620 px. En móvil suman ~3,700 px de scroll solo en pantallas de app.

**H9: Recuperación de errores**
- El error del form incluye "Escríbenos a hola@centavos.mx" como texto plano dentro de un `<div role="alert">`; el correo no es link. Convertirlo en `<a href="mailto:…">` con el asunto precargado.
- Mensaje de error de red: "Sin conexión. Intenta de nuevo." está bien.

**H10: Ayuda y documentación**
- No hay FAQ. Las dudas típicas de una app de finanzas (¿ven mis datos?, ¿cobran?, ¿hay versión web?) no tienen respuesta en el sitio.

## Priority Actions
1. Arreglar o retirar el formulario de soporte (H1, H5, H9).
2. Un solo header con CTA de descarga, badges oficiales (H3, H4).
3. Eliminar anglicismos y consolidar la promesa de privacidad (H2, H8).

---

## 4. Carga cognitiva → conversión

### 4.1 Carga extrínseca encontrada

| Elemento | Costo que genera |
|---|---|
| Repetición ×7 de "sin banco" antes de las funciones | El cerebro procesa cada aparición, concluye "ya lo sé" y empieza a saltarse texto, incluido el que sí importa. Retrasa ~1,400 px en móvil la respuesta a "¿y qué hace?". |
| Header sticky solo con logo | 50 px de viewport móvil dedicados a algo que no se puede accionar. |
| Trust bar de 4 ítems + sección de 3 tarjetas con el mismo mensaje | Dos componentes visuales distintos para una idea. |
| Anglicismos "IOUs", "settle-up", "MSI" | Cambio de registro lingüístico a media lectura. |
| Badges custom | Requieren lectura donde el patrón oficial se reconoce por forma. |
| "Soporte" y "Contacto" en el footer | Decisión inútil: ¿cuál elijo? |
| 3 tipografías (Bricolage, Manrope, Caveat) con Caveat en 30 px como eyebrow | La manuscrita en tamaño grande compite con la H2 por atención. Funciona como acento, pero en 6 secciones consecutivas deja de ser acento. Reducir a 22–24 px o usarla en 2–3 lugares. |
| Disclaimer con asterisco huérfano | Micro-pausa: "¿a qué se refiere?" |

### 4.2 Brechas de modelo mental

- **Badges de tienda**: patrón universal, aquí reinventado.
- **Header sin navegación ni CTA**: el usuario espera al menos "Descargar" arriba a la derecha, sobre todo si el header es sticky.
- **Formulario que parece funcional pero no lo es**: viola la expectativa más básica de un form.
- **Sección "Divide gastos" en fondo `peach`** rompe la alternancia bg/surface del resto; visualmente sugiere "esto es otra cosa" (una promoción, un plan de pago). Si es intencional como gancho, está bien; si no, unificar.

### 4.3 Oportunidades de descargar tareas del usuario

| El usuario hoy tiene que… | La página podría… |
|---|---|
| Scrollear 9,000 px de vuelta para descargar | Barra inferior sticky en móvil con badge de la tienda que corresponde al SO (`navigator.userAgent` o `sec-ch-ua-platform`), o CTA en el header. |
| Decidir entre App Store y Google Play | Detectar plataforma y mostrar primero el badge relevante; el otro en secundario. En iOS ya está el Smart App Banner; Android no tiene equivalente. |
| Confiar sin evidencia | Mostrar calificación real de la tienda cuando exista (el bloque comentado en `page.tsx` con "★ 4.9 · +12 mil personas" debe seguir apagado hasta que sea cierto). Mientras tanto: "Hecho en México", fecha de lanzamiento, o 1–2 testimonios reales. |
| Imaginar cuánto se le va en suscripciones | Mini calculadora interactiva "¿cuánto gastas en suscripciones?" (3 toggles: Netflix, Spotify, gym → suma anual). Es el gancho de la maqueta ("En un año son $10,584") hecho personal. |

### 4.4 Recomendaciones priorizadas

1. **Formulario de soporte** → ocultar mientras no haya backend; mostrar tarjeta con `mailto` y asunto precargado. Elimina un callejón sin salida. *Impacto: alto.*
2. **CTA persistente en móvil** (barra inferior) + badge según plataforma. Elimina el costo de "volver arriba". *Impacto: alto.*
3. **Fusionar trust bar + sección Promesa** en un solo bloque compacto (H2 + 3 tarjetas), colocado **después** de las 3 funciones principales. El hero ya vende privacidad; las funciones deben venir de inmediato. *Impacto: medio-alto.*
4. **Badges oficiales** de App Store y Google Play. *Impacto: medio, esfuerzo bajo.*
5. **Reducir maquetas en móvil** a ~240 px de ancho (escala CSS `transform: scale(.8)` o variables) y recortar las que van en secciones secundarias (Recordatorios, Divide) mostrando solo la mitad superior con degradado. *Impacto: medio.*

---

## 5. Persuasión (Fogg)

**Reduction** — La descarga está a un toque en el hero, pero desaparece durante 8,000 px.
→ Barra inferior sticky en móvil (aparece tras scrollear el hero) con un solo badge, el de la plataforma del usuario. En desktop, botón "Descargar gratis" en el header.
Why it works: B = MAP. La motivación sube conforme se leen las funciones; si el prompt (botón) no está presente en ese momento, el comportamiento no ocurre.

**Suggestion (kairos)** — Los mejores momentos para pedir la descarga son justo después de "En un año son $10,584" (Suscripciones) y después de "Centavos calcula quién le debe a quién" (Divide gastos). Hoy no hay CTA en ninguno de los dos.
→ Un CTA de texto ligero al final de cada bloque de función: "Empieza a anotar → App Store · Google Play" en 13 px. No compite con el hero pero captura al que ya se convenció.

**Surveillance / prueba social** — Cero señales de que alguien más use la app.
→ Cuando haya ≥ 20 reseñas: calificación real + número de reseñas junto a los badges (con `aggregateRating` en JSON-LD). Mientras: "Hecho en México 🇲🇽" ya está; agregar "En App Store y Google Play desde 2026" y, si existen, 2 testimonios con nombre y ciudad.
⚠️ No inventar cifras: el bloque comentado "★ 4.9 · +12 mil personas" es un dark pattern si no es real, y Google penaliza `aggregateRating` falso.

**Tailoring** — El sitio es idéntico para iPhone y Android.
→ Detectar plataforma en servidor (header `sec-ch-ua-platform` o UA) y ordenar los badges; en iOS el Smart App Banner ya lo hace parcialmente.

---

## 6. Accesibilidad (WCAG 2.1)

**Verdict:** Accessibility risks to fix

Base sólida que vale reconocer: skip link funcional, `:focus-visible` con anillo de 2 px, `prefers-reduced-motion`, descripciones `sr-only` para cada maqueta de teléfono con `aria-hidden` en el mock, `lang="es-MX"`, aviso "(se abre en una pestaña nueva)" en los badges, labels visibles en el form, `role="alert"` en el error y `role="status"` en el éxito.

**Likely WCAG issues** (medidos sobre los tokens de `globals.css`)

1. **Eyebrows en `mandarina-deep` (#b8542a) sobre `bg` (#faf3e3) = 4.38:1** — 1.4.3 AA (requiere 4.5:1 para texto < 18 px / 14 px bold) — afecta "Privado por diseño", "Todo en un cuaderno", "Así de fácil" (11 px uppercase) y "Te quedan $600" (13 px) dentro de los mocks. Los textos manuscritos de 30 px y el `<span>` italic del H1 sí pasan (texto grande, 3:1).
2. **Texto `#9b8675` sobre `bg` = 3.13:1** — 1.4.3 AA — "Última actualización" (12 px) y "En esta página" (10 px) en `LegalShell`.
3. **Inputs del form sin borde**: `bg` sobre `surface` = 1.38:1 — 1.4.11 AA (contraste no textual 3:1 para límites de controles) — el campo se distingue solo por un cambio de blanco a crema.
4. **Bordes `rule` (#ead9c2) sobre `surface`/`bg` = 1.25–1.38:1** — 1.4.11 AA — las tarjetas dependen del borde para delimitarse. Como son decorativas no es fallo estricto, pero los inputs del form (punto 3) sí lo son.
5. **Texto de 9 px** ("Descárgala en" / "Disponible en" dentro de los badges) y **10 px** (headers del footer, copyright, "Pago 5 de 12" en mocks) — sin criterio WCAG de tamaño mínimo, pero 71 nodos de texto < 12 px en la home es riesgo real de legibilidad. Con badges oficiales el punto 5 desaparece en parte.
6. **Links del footer con 18 px de alto** y eyebrows de 10 px — 2.5.5 (AAA, recomendación) — target mínimo recomendado 44×44 en móvil. Agregar `py-2` a los links del footer.
7. **Contadores `aria-live` en cada tecla** — 4.1.3 AA — no es fallo, pero es ruido para lectores de pantalla.
8. **`noValidate` sin validación alternativa** — 3.3.1 A / 3.3.3 AA — no hay identificación de errores por campo ni sugerencias.
9. **Asterisco huérfano** en el disclaimer — 1.3.1 A (relación implícita que no existe).

**Design fixes**

1. Oscurecer `mandarina-deep` a **#a84a22** (5.1:1 sobre `bg`) para uso en texto pequeño, o reservar el naranja para ≥ 18 px y usar `ink-soft` (6.0:1) en eyebrows.
2. Reemplazar `#9b8675` por `ink-soft` (#6e5849).
3. Dar borde `1px solid #cdb79a` (≥ 3:1 sobre `surface`) a los inputs, o fondo `surface` con borde `ink/30`.
4. Subir el texto secundario de los badges a 11 px (o usar badges oficiales).
5. Footer: links con `block py-2`.

**Needs implementation verification**
- Orden de foco al insertar la barra sticky móvil (debe quedar al final del DOM o con `tabindex` natural).
- Que el `<details>` de TOC móvil en legales anuncie estado abierto/cerrado.
- Que el color de foco (`mandarina-deep`) mantenga 3:1 sobre `ink` en el footer oscuro (6.1:1, pasa) y sobre `peach` (2.2:1, **no pasa** en la sección Divide gastos; usar `ink` como color de anillo ahí o `outline-offset` con halo claro).

**Priority**
1. Contrastes de texto pequeño (1 y 2) y bordes de inputs (3).
2. Validación del form y error con link accionable.
3. Targets del footer y contadores `aria-live`.

---

## 7. Rendimiento percibido

- **Fuentes:** 12 archivos `.woff2`, 332 KB, todos preloaded por `next/font` en producción. Caveat son 3 pesos × 50 KB y en el CSS solo se usa `font-hand` sin peso explícito (el navegador toma 500). Bricolage se usa en 700 y 800; Manrope en 400/600/700/800. Recorte sugerido: Bricolage 700+800, Manrope 400+600+700, Caveat 600 → 6 archivos, ~150 KB. Ahorro ~180 KB en el primer render.
- **Altura de página:** 9,149 px en 375 px de ancho. Sin imágenes, el peso no es problema; el tiempo de scroll sí. Ver §4.4 punto 5.
- **Sin `<img>`:** LCP será el H1 o el mock del hero (HTML). Excelente. Al agregar la imagen OG no cambia nada en la página.
- **JSON-LD con `next/script strategy="afterInteractive"`:** los tres bloques sí salen en el HTML del servidor (verificado), así que Google los ve sin ejecutar JS. Funciona; la recomendación oficial de Next es un `<script type="application/ld+json">` inline en el componente, que evita cualquier duda en crawlers sin JS. Cambio cosmético, baja prioridad.

---

## 8. Páginas secundarias

### `/app/soporte`
- **Bloqueante:** el endpoint es un stub 503 (`app/api/soporte/route.ts`). El form es un callejón sin salida disfrazado. Mientras se reconecta: renderizar solo la tarjeta de `mailto` con asunto precargado y el texto "te respondemos en 1–2 días hábiles". Cuando vuelva el backend: quitar `noValidate` o validar en cliente, y convertir el email del error en link.
- El placeholder "¿En qué te ayudamos?" en Asunto y el label "Asunto" dicen cosas distintas; el placeholder debería ser un ejemplo ("No puedo entrar a mi cuenta").
- Título `<title>`: "Soporte · App Centavos · Centavos" — el template del layout duplica la marca. Usar `title: { absolute: "Soporte · Centavos" }` o quitar "App Centavos" del título de página.

### Legales (`/app/privacidad`, `/app/terminos`, `/app/eliminar-cuenta`)
- TOC oculta en móvil (§3 H6). Añadir `<details><summary>En esta página</summary>…</details>` antes del artículo en < md.
- `BackToTop` aparece a los 400 px: bien.
- Mismo problema de título duplicado ("Aviso de Privacidad · App Centavos · Centavos").
- Links dentro del cuerpo en `mandarina-deep` sobre `bg` = 4.38:1 (§6). Como están subrayados, la identificación no depende solo del color; solo falta subir el contraste.
- `/app/eliminar-cuenta` es requisito de Google Play (política de eliminación de cuenta); está bien que exista y esté en el sitemap. Verificar que la URL declarada en Play Console sea exactamente esta.

### 404
- Copy del blog. Propuesta: "Esta página no existe. Pero la app sí: descárgala gratis." + badges + link a Soporte.
- Sin header ni footer: quien llega por un link roto no tiene navegación. Reutilizar `AppHeader` + `AppFooter`.
- Sin `metadata.title` propio → "Página no encontrada · Centavos".

---

## 9. Estado de implementación (7 de septiembre de 2026)

Se implementaron las fases 1 y 2 completas y la FAQ de la fase 3. Verificado con `tsc`, `eslint`, `next build` y en el dev server (head renderizado, assets, contraste, barra móvil, layout en 375 px y 1024 px).

| Hallazgo | Estado | Dónde |
|---|---|---|
| Imagen OG ausente / 404 | ✅ | `app/opengraph-image.png` + `.alt.txt` (file convention, aplica a todas las rutas; verificado `og:image` y `twitter:image` en la home). |
| Íconos PNG faltantes | ✅ | `app/apple-icon.png` (180), `public/icon-512.png`, `public/logo.png`. Manifest y `Organization.logo` apuntan a ellos. |
| Metadatos del blog | ✅ | `layout.tsx`, `manifest.ts` ("Centavos"), `not-found.tsx`. Twitter y descripción raíz con copy de la app. |
| `og:url` heredado en subpáginas | ✅ | Helper `pageOpenGraph()` en `lib/seo.ts`, usado en home, soporte y las 3 legales. |
| Keyword en `<title>` y H1 | ✅ | "Centavos · App para anotar gastos sin conectar tu banco" (55 car.) · H1 "La app para anotar tus gastos, sin conectar tu banco." · description 152 car. |
| H2 de funciones con keywords | ✅ | "Presupuestos, suscripciones y meses sin intereses en un solo lugar". |
| Formulario de soporte roto | ✅ | Flag `SUPPORT_FORM_ENABLED=false` en `lib/config.ts`; la página muestra contacto por correo con atajos de asunto. El form (para cuando vuelva el backend) ya valida en cliente, anuncia contadores solo cerca del límite y enlaza el correo en el error. |
| Anglicismos y asterisco huérfano | ✅ | "IOUs"/"settle-up"/"MSI" → español; disclaimer sin asterisco. |
| Promesa de privacidad ×7 | ✅ | Trust bar eliminada; pill del hero ahora "gratis · Para iOS y Android"; línea de 3 compromisos bajo los badges; sección "No pedimos tu banco" única y después de las funciones. |
| Header sticky solo con logo / dos headers | ✅ | `Header` único (home, soporte, legales, 404) con Soporte + "Descargar gratis" → `/#descargar`; sticky solo en desktop; `AppHeader.tsx` eliminado. |
| Sin CTA a media página | ✅ | `InlineStoreLinks` al final de cada función y de Divide gastos; `MobileDownloadBar` (barra inferior fija en móvil, badge según plataforma, se oculta en el hero y en el cierre). |
| Badges custom | ✅ | Artwork oficial de Apple (SVG es-mx) y Google Play (PNG es_mx) servidos por sus propios hosts. |
| Maquetas: altura en móvil | ✅ | `PhoneFrame` con `.phone-wrap`; escala 0.75 en < 768 px; `crop` con degradado en Divide y Recordatorios. Home móvil: 9,149 → 8,784 px **con FAQ incluida** (sin FAQ sería ~8,000). |
| FAQ + `FAQPage` | ✅ | 7 preguntas con `<details>` nativo y JSON-LD (`faqJsonLd`). Solo afirmaciones ya presentes en el sitio. |
| Contrastes AA | ✅ | `--color-mandarina-deep` → #a84a22 (5.1:1 sobre `bg`); `#9b8675` → `ink-soft`; nuevo token `--color-rule-strong` (#a08a6a, 3.3:1) para bordes de inputs y chips; anillo de foco en tinta sobre `peach`/`mandarina`. |
| TOC legal en móvil | ✅ | `<details>` "En esta página (N)" antes del contenido. |
| Targets del footer, "Contacto" duplicado | ✅ | Links `py-2`; "Soporte y contacto" único. |
| Títulos duplicados ("· App Centavos · Centavos") | ✅ | Ahora "Soporte · Centavos", "Aviso de Privacidad · Centavos", etc. |
| Pesos de fuente | ✅ | 12 → 7 archivos (Bricolage 700/800, Manrope 400/600/700/800, Caveat 500). |
| Sitemap con fechas fijas, robots sin `/admin/` | ✅ | `sitemap.ts`, `robots.ts`. |
| `MobileApplication` enriquecido | ✅ | `image`, `featureList`, `downloadUrl`, `author`. |
| Landings por función y página "¿Por qué no tu banco?" | ⏳ Pendiente | Requieren copy y capturas reales del producto; no se inventaron. |
| Calificación real + `aggregateRating` | ⏳ Pendiente | Cuando haya reseñas en las tiendas. |
| Servir los badges desde `/public` | Opcional | Hoy se cargan desde Apple y Google; descargar el artwork oficial si se prefiere evitar dependencias externas. |

## 10. Plan de implementación original

### Fase 1 · Quick wins (un día)
| Archivo | Cambio |
|---|---|
| `app/opengraph-image.tsx` (nuevo) | Imagen OG generada con `ImageResponse`. |
| `app/icon.png`, `app/apple-icon.png` (nuevos) | Íconos PNG 512 y 180. |
| `app/layout.tsx` | `description`, `openGraph.description`, `twitter.*`, `keywords` sin blog. Quitar `images` hardcodeado (lo hereda del archivo OG). Quitar `openGraph.url` o dejar que cada página lo defina. |
| `app/manifest.ts` | `name: "Centavos"`, descripción de la app, icono PNG 512. |
| `app/page.tsx` | `<title>` y H1 con "app para anotar gastos"; description ≤ 155 caracteres; "IOUs"/"settle-up"/"MSI" en español; quitar asterisco huérfano. |
| `app/not-found.tsx` | Copy, `metadata.title`, header/footer, badges. |
| `app/sitemap.ts` | Fechas fijas por página. |
| `lib/seo.ts` | `logo` → `/icon.png`; `sameAs` con tiendas. |
| `components/home/AppFooter.tsx` | Quitar "Contacto" duplicado; `py-2` en links. |
| `components/soporte/SoporteForm.tsx` + `app/app/soporte/page.tsx` | Ocultar form mientras el endpoint sea 503; tarjeta con `mailto`. |
| `app/globals.css` | `--color-mandarina-deep` para texto → #a84a22 (o nuevo token `--color-mandarina-text`); reemplazar `#9b8675`. |

### Fase 2 · Conversión (2–3 días)
- Badges oficiales de App Store / Google Play (SVG oficiales, `AppStoreBadges.tsx`).
- Barra inferior sticky en móvil + botón en header desktop; un solo header para todo el sitio.
- Fusionar trust bar y sección Promesa; reordenar: Hero → Funciones (3) → Privacidad → Divide → Recordatorios → Pasos → FAQ → Cierre.
- Mini CTA de texto al final de cada bloque de función.
- Mocks a escala 0.8 en móvil; recorte con degradado en secciones secundarias.
- Recorte de pesos de fuente.

### Fase 3 · Contenido SEO (1 semana)
- Sección FAQ + `FAQPage` JSON-LD.
- Landings por función (`/presupuestos`, `/suscripciones`, `/meses-sin-intereses`, `/dividir-gastos`) reutilizando `PhoneFrame` + mocks.
- Página "¿Por qué no nos conectamos a tu banco?".
- Cuando haya reseñas reales: calificación en hero + `aggregateRating`.

---

## Anexo A · Mediciones

**Contraste (tokens reales de `globals.css`)**

| Combinación | Ratio | AA texto normal (4.5) | AA texto grande / no textual (3) |
|---|---|---|---|
| `ink-soft` sobre `bg` | 6.02 | ✅ | ✅ |
| `ink-soft` sobre `surface` | 6.66 | ✅ | ✅ |
| `mandarina-deep` sobre `bg` | **4.38** | ❌ | ✅ |
| `mandarina-deep` sobre `surface` | 4.84 | ✅ | ✅ |
| `mandarina` sobre `bg` | 2.48 | ❌ | ❌ (solo decorativo) |
| `#9b8675` sobre `bg` (legales) | **3.13** | ❌ | ✅ |
| `bg` sobre `ink` (botones, footer) | 15.15 | ✅ | ✅ |
| `bg/75` sobre `ink` (links footer) | 9.01 | ✅ | ✅ |
| `bg/50` sobre `ink` (copyright) | 4.76 | ✅ | ✅ |
| `yolk` sobre `ink` (cifras en mocks) | 9.40 | ✅ | ✅ |
| `ink` sobre `mandarina` (tarjeta de cierre) | 6.10 | ✅ | ✅ |
| `ink/75` sobre `peach` | 6.02 | ✅ | ✅ |
| `rule` sobre `surface` (bordes) | **1.38** | — | ❌ |
| `bg` sobre `surface` (inputs del form) | **1.38** | — | ❌ |
| `ink/15` (números 01/02/03) | 1.35 | — | decorativo, `aria-hidden` |

**Home renderizada (dev, 375×812)**

| Métrica | Valor |
|---|---|
| Altura total | 9,149 px (≈ 11 pantallas) |
| Overflow horizontal | No |
| `<img>` | 0 |
| Nodos de texto < 12 px | 71 |
| Links / botones | 12 (2 pares de badges, logo ×2, 5 links de footer, skip link) |
| Bloques JSON-LD en SSR | 3 (MobileApplication, Organization, WebSite) |
| `og:image` en `/` | **ausente** |
| `og:image` en `/app/*` | `/og-default.png` → **404** |
| `/logo.png`, `/apple-icon.png`, `/favicon.ico` | **404** |
| Longitud de `description` | 269 caracteres (Google muestra ~155) |
| Payload de fuentes | 12 archivos, 332 KB |

**Nota operativa.** Para correr el preview se agregó `"autoPort": true` en `.claude/launch.json` porque el puerto 3000 lo ocupa Docker. Es un cambio de tooling local, no del sitio.
